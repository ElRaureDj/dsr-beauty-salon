-- DSR Maison — tabla appointments (citas confirmadas).
-- Hasta hoy las "citas" del customer eran pending_bookings (lo que guarda
-- en su bolsa). Al "checkout" sólo se vaciaba el cart — sin tabla appointments
-- real, las citas se perdían en el limbo. Esta tabla es la fuente de verdad
-- para las citas reservadas, completadas y canceladas.
--
-- Status:
--   confirmed → reservada y futura
--   completed → ya se realizó (admin marca tras la visita)
--   cancelled → user o admin canceló antes de la fecha
--
-- points_earned: snapshot de puntos otorgados al checkout (calculados con
-- el tier multiplier en ese momento). Mantenerlos como columna evita
-- recomputar y permite hacer rollback exacto al cancelar.

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  service_ids text[] not null,
  artisan_id text not null references artisans(id) on delete cascade,
  date date not null,
  time text not null,
  total numeric(10,2) not null check (total >= 0),
  duration int not null check (duration > 0),
  notes text,
  variant text check (variant in ('standard', 'premium', 'custom')),
  addon_product_ids text[] not null default '{}',
  combo_id text references combos(id) on delete set null,
  discount_pct numeric(5,2) check (discount_pct between 0 and 100),
  status text not null default 'confirmed'
    check (status in ('confirmed', 'completed', 'cancelled')),
  points_earned int not null default 0 check (points_earned >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists appointments_user_idx on appointments(user_id);
create index if not exists appointments_date_idx on appointments(date);
create index if not exists appointments_artisan_idx on appointments(artisan_id);

-- updated_at trigger reusa la function set_updated_at() definida en 0001.
drop trigger if exists appointments_set_updated_at on appointments;
create trigger appointments_set_updated_at
  before update on appointments
  for each row execute function set_updated_at();

-- ---------- RLS ----------

alter table appointments enable row level security;

-- Owner: read/write de las suyas. Las cancelaciones del customer se hacen
-- vía RPC para preservar la lógica de rollback de puntos atómica.
drop policy if exists appointments_select_own on appointments;
create policy appointments_select_own on appointments
  for select using (auth.uid() = user_id);

drop policy if exists appointments_insert_own on appointments;
create policy appointments_insert_own on appointments
  for insert with check (auth.uid() = user_id);

drop policy if exists appointments_update_own on appointments;
create policy appointments_update_own on appointments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists appointments_delete_own on appointments;
create policy appointments_delete_own on appointments
  for delete using (auth.uid() = user_id);

-- Admin: lectura cross-user para AppointmentsSection y ReportsSection.
drop policy if exists appointments_admin_select on appointments;
create policy appointments_admin_select on appointments
  for select using (is_admin());

-- Admin: update (marcar como completed, cancelar desde admin).
drop policy if exists appointments_admin_update on appointments;
create policy appointments_admin_update on appointments
  for update using (is_admin()) with check (is_admin());
