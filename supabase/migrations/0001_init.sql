-- DSR Maison — schema inicial
-- Replica los tipos de src/types/index.ts y los seeds de src/data/* en Postgres.
-- IDs son text (no UUID) para mantener compatibilidad con los seeds del repo.

set check_function_bodies = off;

-- =========================================================================
-- CATÁLOGO
-- =========================================================================

create table if not exists categories (
  id text primary key check (id in ('hair', 'nails', 'facial')),
  name_es text not null,
  name_en text not null,
  tag text not null
);

create table if not exists services (
  id text primary key,
  cat_id text not null references categories(id) on delete restrict,
  name_es text not null,
  name_en text not null,
  desc_es text not null default '',
  desc_en text not null default '',
  duration int not null check (duration > 0),
  price numeric(10,2) not null check (price >= 0),
  popular boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists services_cat_idx on services(cat_id);

create table if not exists artisans (
  id text primary key,
  name text not null,
  role_es text not null,
  role_en text not null,
  cats text[] not null default '{}',
  specialty_es text not null default '',
  specialty_en text not null default '',
  years int not null default 0,
  bio_es text not null default '',
  bio_en text not null default '',
  rating numeric(3,2) not null default 5.0 check (rating between 0 and 5),
  reviews int not null default 0 check (reviews >= 0),
  photo text not null default '',
  avatar text not null default '',
  signature_es text,
  signature_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists products (
  id text primary key,
  name_es text not null,
  name_en text not null,
  line text not null default 'DSR Maison',
  cat_es text not null default '',
  cat_en text not null default '',
  size text not null default '',
  price numeric(10,2) not null check (price >= 0),
  desc_es text not null default '',
  desc_en text not null default '',
  notes_es text[] not null default '{}',
  notes_en text[] not null default '{}',
  photo text not null default '',
  photos text[] not null default '{}',
  video text,
  badge_es text,
  badge_en text,
  rating numeric(3,2) not null default 5.0 check (rating between 0 and 5),
  reviews int not null default 0 check (reviews >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists combos (
  id text primary key,
  name_es text not null,
  name_en text not null,
  service_ids text[] not null default '{}',
  discount_pct numeric(5,2) not null default 0 check (discount_pct between 0 and 100),
  description_es text,
  description_en text,
  popular boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists nail_looks (
  id text primary key,
  img text not null default '',
  name_es text not null,
  name_en text not null,
  technique_es text not null default '',
  technique_en text not null default '',
  shade text not null default '',
  artisan_id text references artisans(id) on delete set null,
  season_es text not null default '',
  season_en text not null default '',
  service_id text references services(id) on delete set null,
  popular boolean not null default false
);

-- =========================================================================
-- LOYALTY
-- =========================================================================

create table if not exists tiers (
  id text primary key check (id in ('pearl', 'gold', 'noir')),
  name_es text not null,
  name_en text not null,
  min_points int not null,
  max_points int not null,
  color text not null
);

create table if not exists tier_perks (
  tier_id text not null references tiers(id) on delete cascade,
  position int not null,
  perk_es text not null,
  perk_en text not null,
  primary key (tier_id, position)
);

create table if not exists tier_rules (
  tier_id text primary key references tiers(id) on delete cascade,
  threshold_points int not null,
  multiplier_hair numeric(5,2) not null default 1.0,
  multiplier_nails numeric(5,2) not null default 1.0,
  multiplier_facial numeric(5,2) not null default 1.0
);

create table if not exists gift_card_designs (
  id text primary key,
  name_es text not null,
  name_en text not null,
  bg text not null,
  fg text not null,
  accent text not null,
  vibe_es text not null,
  vibe_en text not null
);

-- =========================================================================
-- ADMIN / OPS
-- =========================================================================

-- Variantes Premium/Custom de un servicio. La key del repo es serviceId.
create table if not exists service_variants (
  service_id text primary key references services(id) on delete cascade,
  premium_label_es text,
  premium_label_en text,
  premium_addon_product_ids text[] not null default '{}',
  custom_compatible_product_ids text[] not null default '{}'
);

create table if not exists product_stocks (
  product_id text primary key references products(id) on delete cascade,
  stock int not null default 0 check (stock >= 0),
  low_stock_at int not null default 0 check (low_stock_at >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists promos (
  id text primary key,
  code text not null unique,
  type text not null check (type in ('pct', 'fixed')),
  value numeric(10,2) not null check (value >= 0),
  description_es text,
  description_en text,
  valid_until date,
  max_uses int,
  used_count int not null default 0 check (used_count >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Agenda semanal por artista. workingDays vive como jsonb para mantener
-- el shape Record<WeekDay, boolean> sin explotar a 7 columnas.
create table if not exists artisan_schedules (
  artisan_id text primary key references artisans(id) on delete cascade,
  working_days jsonb not null default '{
    "mon": true, "tue": true, "wed": true, "thu": true,
    "fri": true, "sat": true, "sun": false
  }'::jsonb,
  start_time time not null default '10:00',
  end_time time not null default '20:00'
);

create table if not exists reviews (
  id text primary key,
  customer_name text not null,
  artisan_id text references artisans(id) on delete set null,
  service_id text references services(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text not null default '',
  date date not null default current_date,
  response text,
  response_date date,
  created_at timestamptz not null default now()
);
create index if not exists reviews_artisan_idx on reviews(artisan_id);
create index if not exists reviews_service_idx on reviews(service_id);

-- Configuración del salón. Mantenemos UNA sola fila vía CHECK + PK fija.
create table if not exists salon_settings (
  id int primary key default 1 check (id = 1),
  name text not null,
  tagline_es text not null default '',
  tagline_en text not null default '',
  address text not null default '',
  city text not null default '',
  phone text not null default '',
  email text not null default '',
  instagram text,
  whatsapp text,
  hours_open time not null default '10:00',
  hours_close time not null default '20:00',
  currency text not null default 'EUR' check (currency in ('EUR', 'USD', 'MXN', 'COP')),
  timezone text not null default 'Europe/Madrid',
  updated_at timestamptz not null default now()
);

-- =========================================================================
-- TIMESTAMPS HELPER
-- =========================================================================

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'services', 'artisans', 'products', 'combos',
      'product_stocks', 'promos', 'salon_settings'
    ])
  loop
    execute format(
      'drop trigger if exists %I_set_updated_at on %I; ' ||
      'create trigger %I_set_updated_at before update on %I ' ||
      'for each row execute function set_updated_at();',
      t, t, t, t
    );
  end loop;
end$$;

-- =========================================================================
-- ROW LEVEL SECURITY
-- =========================================================================
-- Catálogo es público (SELECT). Writes por ahora solo via service_role
-- (que bypassea RLS automáticamente). Cuando agreguemos auth real, las
-- policies de admin se añaden encima.

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'categories', 'services', 'artisans', 'products', 'combos',
      'nail_looks', 'tiers', 'tier_perks', 'tier_rules',
      'gift_card_designs', 'service_variants', 'product_stocks',
      'promos', 'artisan_schedules', 'reviews', 'salon_settings'
    ])
  loop
    execute format('alter table %I enable row level security;', t);
    execute format(
      'drop policy if exists %I_public_read on %I; ' ||
      'create policy %I_public_read on %I for select using (true);',
      t, t, t, t
    );
  end loop;
end$$;
