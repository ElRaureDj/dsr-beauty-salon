-- DSR Maison — addresses por user
-- Direcciones de envío para boutique (productos físicos). RLS por owner.
-- Una sola dirección puede ser default por user (parcial unique index).

create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default '',
  recipient text not null default '',
  line1 text not null,
  line2 text not null default '',
  city text not null,
  region text not null default '',
  postal_code text not null,
  country text not null default 'ES',
  phone text not null default '',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists addresses_user_idx on addresses(user_id);

-- Solo una dirección default por user.
create unique index if not exists addresses_one_default_per_user
  on addresses(user_id) where is_default;

-- updated_at trigger (reusa función global de 0001_init.sql).
drop trigger if exists addresses_set_updated_at on addresses;
create trigger addresses_set_updated_at
  before update on addresses
  for each row execute function set_updated_at();

-- RLS: solo el owner puede ver/editar sus direcciones.
alter table addresses enable row level security;

drop policy if exists addresses_select_own on addresses;
create policy addresses_select_own on addresses
  for select using (auth.uid() = user_id);

drop policy if exists addresses_insert_own on addresses;
create policy addresses_insert_own on addresses
  for insert with check (auth.uid() = user_id);

drop policy if exists addresses_update_own on addresses;
create policy addresses_update_own on addresses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists addresses_delete_own on addresses;
create policy addresses_delete_own on addresses
  for delete using (auth.uid() = user_id);
