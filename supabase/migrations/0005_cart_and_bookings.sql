-- DSR Maison — cart items y pending bookings por user
-- Reemplaza el state local de CartProvider para usuarios autenticados.
-- Guests siguen con localStorage (preserva el demo experience).

-- ---------- cart_items ----------
-- Una row por producto en el cart de un user. Unique (user_id, product_id)
-- garantiza que addToCart sea siempre upsert con suma de qty.

create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references products(id) on delete cascade,
  qty int not null default 1 check (qty > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);
create index if not exists cart_items_user_idx on cart_items(user_id);

drop trigger if exists cart_items_set_updated_at on cart_items;
create trigger cart_items_set_updated_at
  before update on cart_items
  for each row execute function set_updated_at();

alter table cart_items enable row level security;

drop policy if exists cart_items_select_own on cart_items;
create policy cart_items_select_own on cart_items
  for select using (auth.uid() = user_id);
drop policy if exists cart_items_insert_own on cart_items;
create policy cart_items_insert_own on cart_items
  for insert with check (auth.uid() = user_id);
drop policy if exists cart_items_update_own on cart_items;
create policy cart_items_update_own on cart_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists cart_items_delete_own on cart_items;
create policy cart_items_delete_own on cart_items
  for delete using (auth.uid() = user_id);

-- ---------- pending_bookings ----------
-- Citas guardadas en la bolsa pero no confirmadas todavía. Cuando se
-- agregue checkout real, se moverán (o crearán) en una tabla appointments
-- con status='confirmed'.

create table if not exists pending_bookings (
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists pending_bookings_user_idx on pending_bookings(user_id);

drop trigger if exists pending_bookings_set_updated_at on pending_bookings;
create trigger pending_bookings_set_updated_at
  before update on pending_bookings
  for each row execute function set_updated_at();

alter table pending_bookings enable row level security;

drop policy if exists pending_bookings_select_own on pending_bookings;
create policy pending_bookings_select_own on pending_bookings
  for select using (auth.uid() = user_id);
drop policy if exists pending_bookings_insert_own on pending_bookings;
create policy pending_bookings_insert_own on pending_bookings
  for insert with check (auth.uid() = user_id);
drop policy if exists pending_bookings_update_own on pending_bookings;
create policy pending_bookings_update_own on pending_bookings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists pending_bookings_delete_own on pending_bookings;
create policy pending_bookings_delete_own on pending_bookings
  for delete using (auth.uid() = user_id);
