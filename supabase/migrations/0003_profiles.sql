-- DSR Maison — perfiles de usuario
-- Una row por user de auth.users con datos de display + loyalty.
-- Trigger: cada signup crea automáticamente su row de profile.
-- RLS: cada user solo puede leer/editar su propia row.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  display_name text,
  avatar_url text,
  points int not null default 0 check (points >= 0),
  visits int not null default 0 check (visits >= 0),
  spent numeric(10,2) not null default 0 check (spent >= 0),
  joined date not null default current_date,
  preferred_artisans text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger updated_at — reusa la función global creada en 0001_init.sql.
drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Trigger: al crear un user en auth.users, generar su profile. SECURITY
-- DEFINER porque auth.users no es accesible para usuarios normales.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(
      split_part(new.email, '@', 1),
      'cliente'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Backfill: si ya hay users en auth.users sin profile (tests previos al
-- trigger), crearlos ahora. Idempotente vía ON CONFLICT.
insert into public.profiles (id, email, display_name)
select
  u.id,
  u.email,
  coalesce(split_part(u.email, '@', 1), 'cliente')
from auth.users u
on conflict (id) do nothing;

-- RLS: profile es privado. Solo el owner ve/edita su row.
alter table profiles enable row level security;

drop policy if exists profiles_select_own on profiles;
create policy profiles_select_own on profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_update_own on profiles;
create policy profiles_update_own on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- INSERT solo lo hace el trigger (security definer bypassea RLS), pero
-- por defensa permitimos insert si el id coincide con auth.uid().
drop policy if exists profiles_insert_own on profiles;
create policy profiles_insert_own on profiles
  for insert with check (auth.uid() = id);
