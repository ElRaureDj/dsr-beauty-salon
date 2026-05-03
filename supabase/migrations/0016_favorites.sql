-- DSR Maison — favoritos del cliente.
-- Una tabla, tres tipos de target (product / service / artisan). PK
-- compuesta evita duplicados (no se puede favoritear lo mismo dos veces).
-- RLS owner-only: cada user solo ve y modifica sus favoritos.

create table if not exists favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('product', 'service', 'artisan')),
  target_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, kind, target_id)
);

create index if not exists favorites_user_kind_idx on favorites(user_id, kind);

alter table favorites enable row level security;

drop policy if exists favorites_select_own on favorites;
create policy favorites_select_own on favorites
  for select using (auth.uid() = user_id);

drop policy if exists favorites_insert_own on favorites;
create policy favorites_insert_own on favorites
  for insert with check (auth.uid() = user_id);

drop policy if exists favorites_delete_own on favorites;
create policy favorites_delete_own on favorites
  for delete using (auth.uid() = user_id);
