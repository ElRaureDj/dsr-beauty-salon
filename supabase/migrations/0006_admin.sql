-- DSR Maison — admin role
-- Reemplaza el PIN mock del cliente por un flag real en profiles + policies
-- RLS que permiten writes solo a admins en las tablas operativas.
--
-- IMPORTANTE: después de aplicar esta migration, marca tu propio profile
-- como admin desde el SQL Editor:
--   update profiles set is_admin = true where email = 'tu@email.com';
-- Sin esto, ningún usuario puede entrar al panel admin.

-- ---------- Flag is_admin en profiles ----------

alter table profiles
  add column if not exists is_admin boolean not null default false;

-- ---------- Helper: ¿el caller actual es admin? ----------
-- security definer + stable + select-only para que se pueda usar en
-- expresiones de RLS sin que el optimizer la re-ejecute por row.

create or replace function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select is_admin from profiles where id = auth.uid()),
    false
  );
$$;

-- ---------- Write policies para tablas operativas ----------
-- Las SELECT siguen abiertas (las creó 0001_init para anon/authenticated).
-- Acá agregamos INSERT/UPDATE/DELETE solo para admins.
--
-- Tablas cubiertas: services, artisans, products, combos, promos,
-- product_stocks, artisan_schedules, tier_rules, reviews, salon_settings,
-- service_variants.

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'services', 'artisans', 'products', 'combos', 'promos',
      'product_stocks', 'artisan_schedules', 'tier_rules', 'reviews',
      'salon_settings', 'service_variants', 'nail_looks',
      'gift_card_designs', 'tiers', 'tier_perks', 'categories'
    ])
  loop
    execute format(
      'drop policy if exists %I_admin_insert on %I; ' ||
      'create policy %I_admin_insert on %I for insert with check (is_admin());',
      t, t, t, t
    );
    execute format(
      'drop policy if exists %I_admin_update on %I; ' ||
      'create policy %I_admin_update on %I for update using (is_admin()) with check (is_admin());',
      t, t, t, t
    );
    execute format(
      'drop policy if exists %I_admin_delete on %I; ' ||
      'create policy %I_admin_delete on %I for delete using (is_admin());',
      t, t, t, t
    );
  end loop;
end$$;

-- ---------- Profile: el is_admin solo se setea por superuser ----------
-- Actualmente cualquier user puede UPDATE su propio profile vía
-- profiles_update_own (creada en 0003). Para evitar self-promotion al
-- rol admin, restringimos: el is_admin solo cambia si is_admin() es true.

drop policy if exists profiles_update_own on profiles;
create policy profiles_update_own on profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    and (
      -- mantener el flag actual o ya ser admin
      is_admin = (select is_admin from profiles where id = auth.uid())
      or is_admin()
    )
  );
