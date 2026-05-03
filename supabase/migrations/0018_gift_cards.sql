-- DSR Maison — gift cards reales.
-- Hasta hoy las gift cards eran mock (data en src/data/giftcards.ts).
-- Esta tabla persiste las cards compradas, cada una con código único,
-- destinatario y balance. La compra real (cobro) sigue siendo mock —
-- queda listo para conectar a Stripe cuando haya pagos.

create table if not exists gift_cards (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  design_id text not null references gift_card_designs(id) on delete restrict,
  amount_initial numeric(10,2) not null check (amount_initial > 0),
  balance numeric(10,2) not null check (balance >= 0),
  sender_user_id uuid references auth.users(id) on delete set null,
  /** Snapshot del nombre del comprador al momento de compra. */
  sender_name text,
  /** Email o phone del destinatario; uno de los dos debe estar. */
  recipient_email text,
  recipient_phone text,
  recipient_name text not null,
  /** Mensaje personal del comprador para el destinatario. */
  message_es text,
  message_en text,
  /** Método elegido: email | whatsapp | schedule (entrega programada). */
  delivery_method text not null check (delivery_method in ('email', 'whatsapp', 'schedule')),
  /** Fecha de entrega — null = inmediata. */
  delivery_date date,
  /** Cuando el destinatario tenga cuenta y se vincule la card. */
  redeemed_by_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'active'
    check (status in ('active', 'depleted', 'expired', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  /** Al menos un canal de entrega. */
  check (
    (recipient_email is not null and recipient_email <> '')
    or (recipient_phone is not null and recipient_phone <> '')
  )
);

create index if not exists gift_cards_sender_idx on gift_cards(sender_user_id);
create index if not exists gift_cards_recipient_email_idx on gift_cards(recipient_email);
create index if not exists gift_cards_redeemed_idx on gift_cards(redeemed_by_user_id);
create index if not exists gift_cards_status_idx on gift_cards(status);

drop trigger if exists gift_cards_set_updated_at on gift_cards;
create trigger gift_cards_set_updated_at
  before update on gift_cards
  for each row execute function set_updated_at();

alter table gift_cards enable row level security;

-- Sender ve las cards que envió. Redeemer ve las que ya canjeó.
-- Recipient (sin cuenta) no tiene acceso directo — el código es el access token.
drop policy if exists gift_cards_select_sender on gift_cards;
create policy gift_cards_select_sender on gift_cards
  for select using (auth.uid() = sender_user_id);

drop policy if exists gift_cards_select_redeemer on gift_cards;
create policy gift_cards_select_redeemer on gift_cards
  for select using (auth.uid() = redeemed_by_user_id);

-- Cualquier authenticated user puede crear una card (siendo sender).
drop policy if exists gift_cards_insert_authed on gift_cards;
create policy gift_cards_insert_authed on gift_cards
  for insert with check (
    auth.uid() = sender_user_id or auth.uid() is not null
  );

-- Admin: lectura total para soporte / auditoría.
drop policy if exists gift_cards_admin_select on gift_cards;
create policy gift_cards_admin_select on gift_cards
  for select using (is_admin());
drop policy if exists gift_cards_admin_update on gift_cards;
create policy gift_cards_admin_update on gift_cards
  for update using (is_admin()) with check (is_admin());

-- ---------- redeem_gift_card RPC ----------
-- Vincula una card al user actual usando el code. Idempotente: si la card
-- ya está vinculada al mismo user, no hace nada. Lanza error si:
--   - código no existe
--   - card ya canjeada por otro user
--   - status != 'active'
--
-- No descuenta balance — eso pasa cuando el user use la card en checkout
-- (futuro Stripe flow).

create or replace function redeem_gift_card(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_card gift_cards;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_card from gift_cards where upper(code) = upper(p_code);
  if not found then
    raise exception 'Gift card no encontrada' using errcode = 'P0001';
  end if;
  if v_card.status <> 'active' then
    raise exception 'Gift card no está activa' using errcode = 'P0002';
  end if;
  if v_card.redeemed_by_user_id is not null and v_card.redeemed_by_user_id <> v_user then
    raise exception 'Gift card ya canjeada por otra clienta' using errcode = 'P0003';
  end if;

  update gift_cards
     set redeemed_by_user_id = v_user
   where id = v_card.id
     and (redeemed_by_user_id is null or redeemed_by_user_id = v_user);

  return v_card.id;
end;
$$;

grant execute on function redeem_gift_card(text) to authenticated;
