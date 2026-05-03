-- DSR Maison — reviews del customer
-- Hoy `reviews` solo se inserta desde admin (RLS de 0006). Esta migration:
--   1. Añade `user_id` opcional para vincular la reseña al cliente que la
--      dejó. Las rows legacy/seed se quedan con user_id null.
--   2. Permite a authenticated users INSERT su propia reseña (matching
--      auth.uid() con user_id).
--   3. Permite UPDATE/DELETE solo del propio author (mientras admin sigue
--      pudiendo todo via las policies de 0006).
--   4. Unique parcial (user_id, artisan_id, service_id) — un cliente solo
--      puede dejar una reseña por par artist+service. Volver a reseñar lo
--      mismo es UPDATE, no INSERT.

alter table reviews
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists reviews_user_idx on reviews(user_id);

-- Una reseña por (cliente, artist, service). Las rows legacy con user_id
-- null no entran al constraint.
create unique index if not exists reviews_one_per_user_pair
  on reviews(user_id, artisan_id, service_id)
  where user_id is not null;

-- ---------- Customer write policies ----------

drop policy if exists reviews_insert_own on reviews;
create policy reviews_insert_own on reviews
  for insert
  with check (auth.uid() = user_id);

drop policy if exists reviews_update_own on reviews;
create policy reviews_update_own on reviews
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists reviews_delete_own on reviews;
create policy reviews_delete_own on reviews
  for delete
  using (auth.uid() = user_id);
