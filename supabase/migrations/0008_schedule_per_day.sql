-- DSR Maison — schedule por día (en vez de un único start/end por artista)
-- Hoy `artisan_schedules` tiene una row por artista con `working_days jsonb`
-- + un único `start_time`/`end_time`. Cambia a una row por (artisan_id, weekday)
-- con su propio `start_time`/`end_time`, permitiendo horarios distintos por día
-- (ej: lun 09:00-18:00, sáb 10:00-14:00, dom off).
--
-- Migra los datos existentes: explota cada row a 7 rows usando el start/end
-- actual como base y respetando working_days.

-- ---------- Nueva tabla artisan_schedule_days ----------

create table if not exists artisan_schedule_days (
  artisan_id text not null references artisans(id) on delete cascade,
  weekday text not null check (weekday in ('mon','tue','wed','thu','fri','sat','sun')),
  is_working boolean not null default true,
  start_time time not null default '10:00',
  end_time time not null default '20:00',
  primary key (artisan_id, weekday),
  check (end_time > start_time)
);

create index if not exists artisan_schedule_days_artisan_idx
  on artisan_schedule_days(artisan_id);

-- ---------- Migrar datos existentes ----------
-- Sólo si artisan_schedules todavía existe (idempotencia: si ya se corrió,
-- la tabla vieja ya no está y este bloque no hace nada).

do $$
declare
  r record;
  wd text;
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'artisan_schedules'
  ) then
    for r in select artisan_id, working_days, start_time, end_time from artisan_schedules loop
      foreach wd in array array['mon','tue','wed','thu','fri','sat','sun'] loop
        insert into artisan_schedule_days (artisan_id, weekday, is_working, start_time, end_time)
        values (
          r.artisan_id,
          wd,
          coalesce((r.working_days->>wd)::boolean, true),
          r.start_time,
          r.end_time
        )
        on conflict (artisan_id, weekday) do nothing;
      end loop;
    end loop;
  end if;
end$$;

-- ---------- Backfill para artistas sin row previa ----------
-- Si un artista no tenía row en artisan_schedules (admin nunca tocó), le
-- creamos los 7 days con defaults (10:00-20:00, dom off).

insert into artisan_schedule_days (artisan_id, weekday, is_working, start_time, end_time)
select a.id, wd.day, wd.is_working, '10:00'::time, '20:00'::time
from artisans a
cross join (
  values
    ('mon', true), ('tue', true), ('wed', true), ('thu', true),
    ('fri', true), ('sat', true), ('sun', false)
) as wd(day, is_working)
on conflict (artisan_id, weekday) do nothing;

-- ---------- RLS ----------

alter table artisan_schedule_days enable row level security;

drop policy if exists artisan_schedule_days_select on artisan_schedule_days;
create policy artisan_schedule_days_select on artisan_schedule_days
  for select using (true);

drop policy if exists artisan_schedule_days_admin_insert on artisan_schedule_days;
create policy artisan_schedule_days_admin_insert on artisan_schedule_days
  for insert with check (is_admin());

drop policy if exists artisan_schedule_days_admin_update on artisan_schedule_days;
create policy artisan_schedule_days_admin_update on artisan_schedule_days
  for update using (is_admin()) with check (is_admin());

drop policy if exists artisan_schedule_days_admin_delete on artisan_schedule_days;
create policy artisan_schedule_days_admin_delete on artisan_schedule_days
  for delete using (is_admin());

-- ---------- Drop tabla vieja ----------
-- Después de la migración de datos, ya no hace falta.

drop table if exists artisan_schedules cascade;
