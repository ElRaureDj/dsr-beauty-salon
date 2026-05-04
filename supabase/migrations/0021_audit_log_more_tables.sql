-- DSR Maison — extender audit_log a más tablas críticas.
-- 0019 cubrió salon_settings y tier_rules. Esta migration suma:
--   - products, services, artisans (catálogo principal)
--   - promos (cupones — auditar quién creó/desactivó qué)
--   - combos (paquetes con descuento)
--   - product_stocks (cambios de inventario manuales)
--   - artisan_schedule_days (cambios de horario por artista)
--
-- Extiende audit_trigger() de 0019 para soportar más PKs (product_id,
-- artisan_id|weekday composite). Idempotente.

create or replace function audit_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_email text;
  v_entity_id text;
  v_before jsonb;
  v_after jsonb;
  v_action text;
begin
  if v_actor is not null then
    select email into v_email from profiles where id = v_actor;
  end if;

  if tg_op = 'INSERT' then
    v_action := 'insert';
    v_after := to_jsonb(new);
    v_before := null;
  elsif tg_op = 'UPDATE' then
    v_action := 'update';
    v_after := to_jsonb(new);
    v_before := to_jsonb(old);
  else
    v_action := 'delete';
    v_after := null;
    v_before := to_jsonb(old);
  end if;

  -- Entity ID: tabla por tabla. Para PKs compuestas usamos un join.
  v_entity_id := coalesce(
    (v_after->>'id'),
    (v_before->>'id'),
    (v_after->>'tier_id'),
    (v_before->>'tier_id'),
    (v_after->>'product_id'),
    (v_before->>'product_id'),
    -- artisan_schedule_days: artisan_id + weekday compuesto.
    case
      when (v_after->>'artisan_id') is not null and (v_after->>'weekday') is not null
      then (v_after->>'artisan_id') || ':' || (v_after->>'weekday')
      when (v_before->>'artisan_id') is not null and (v_before->>'weekday') is not null
      then (v_before->>'artisan_id') || ':' || (v_before->>'weekday')
    end
  );

  insert into audit_log (
    actor_user_id, actor_email, action, entity_type, entity_id, before, after
  ) values (
    v_actor, v_email, v_action, tg_table_name, v_entity_id, v_before, v_after
  );

  return coalesce(new, old);
end;
$$;

-- ---------- Triggers ----------

drop trigger if exists products_audit on products;
create trigger products_audit
  after insert or update or delete on products
  for each row execute function audit_trigger();

drop trigger if exists services_audit on services;
create trigger services_audit
  after insert or update or delete on services
  for each row execute function audit_trigger();

drop trigger if exists artisans_audit on artisans;
create trigger artisans_audit
  after insert or update or delete on artisans
  for each row execute function audit_trigger();

drop trigger if exists promos_audit on promos;
create trigger promos_audit
  after insert or update or delete on promos
  for each row execute function audit_trigger();

drop trigger if exists combos_audit on combos;
create trigger combos_audit
  after insert or update or delete on combos
  for each row execute function audit_trigger();

drop trigger if exists product_stocks_audit on product_stocks;
create trigger product_stocks_audit
  after insert or update or delete on product_stocks
  for each row execute function audit_trigger();

drop trigger if exists artisan_schedule_days_audit on artisan_schedule_days;
create trigger artisan_schedule_days_audit
  after insert or update or delete on artisan_schedule_days
  for each row execute function audit_trigger();

-- Nota: NO ponemos trigger en pending_bookings ni appointments porque
-- el customer las edita constantemente — el log se inflaría con miles
-- de rows triviales. Si se necesita auditoría de citas, hacer una vista
-- agregada o un trigger más selectivo (ej: solo cuando admin edita).
--
-- Tampoco en cart_items (idem), reviews (poco frecuente, low value),
-- favorites (per-user, sin valor admin), referrals (raro), gift_cards
-- (cobertura admin via UPDATE policies).