-- DSR Maison — programa de referidos.
-- Cada user tiene un código único derivado de su user_id (primeros 8 chars
-- del uuid en mayúscula). Estable, no requiere DB extra para el código en sí.
-- La tabla `referrals` registra qué user fue invitado por quién + el estado
-- (pending → applied al cumplir su primera cita).
--
-- El customer ve su código en Rewards con CTA "Invitá una amiga".
-- En signup, el user puede ingresar el código que recibió; lo guardamos en
-- referrals con status='pending'. Cuando completa su primer checkout, un
-- trigger (o procesamiento manual) marca status='applied' y el referrer
-- gana crédito.
--
-- NOTA: la lógica de "dar crédito al referrer" no se aplica aún — depende
-- de pagos reales (Stripe). Por ahora, el flujo de capturar referidos +
-- mostrarles el código está listo, pero no hay cobro automático.

create table if not exists referrals (
  referrer_id uuid not null references auth.users(id) on delete cascade,
  referee_id uuid primary key references auth.users(id) on delete cascade,
  code text not null,
  status text not null default 'pending'
    check (status in ('pending', 'applied', 'cancelled')),
  applied_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists referrals_referrer_idx on referrals(referrer_id);
create index if not exists referrals_status_idx on referrals(status);

alter table referrals enable row level security;

-- El referrer ve sus invitados. El referee ve su propia row.
drop policy if exists referrals_select_own on referrals;
create policy referrals_select_own on referrals
  for select using (auth.uid() = referrer_id or auth.uid() = referee_id);

-- Solo el referee puede insertarse a sí mismo (al signup, declarando un código).
drop policy if exists referrals_insert_self on referrals;
create policy referrals_insert_self on referrals
  for insert with check (auth.uid() = referee_id);

-- Admin puede SELECT/UPDATE para cerrar / cancelar.
drop policy if exists referrals_admin_select on referrals;
create policy referrals_admin_select on referrals
  for select using (is_admin());
drop policy if exists referrals_admin_update on referrals;
create policy referrals_admin_update on referrals
  for update using (is_admin()) with check (is_admin());

-- Helper: derivar code estable de un user_id (8 chars uppercase del uuid).
create or replace function my_referral_code()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select upper(substr(replace(auth.uid()::text, '-', ''), 1, 8));
$$;

grant execute on function my_referral_code() to authenticated;

-- Helper: dado un código, devuelve el referrer_id si existe.
create or replace function find_referrer_by_code(p_code text)
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select id from auth.users
   where upper(substr(replace(id::text, '-', ''), 1, 8)) = upper(p_code)
   limit 1;
$$;

grant execute on function find_referrer_by_code(text) to anon, authenticated;
