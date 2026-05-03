-- DSR Maison — RPCs atómicas para checkout y cancelación.
-- Necesarias porque el customer no puede UPDATE product_stocks ni profiles
-- (RLS admin-only para esas tablas). Estas funciones SECURITY DEFINER
-- corren con privilegios elevados y validan el caller via auth.uid().

-- ---------- confirm_checkout() ----------
-- Convierte el cart actual del caller en appointments + decrementa stock +
-- suma puntos/visitas/spent al profile + limpia pending_bookings y
-- cart_items. Todo dentro de una transacción implícita.
--
-- Cálculo de puntos: por cada appointment, points = round(total * 10 *
-- multiplier), donde multiplier sale de la categoría dominante de los
-- servicios (la de mayor multiplier entre los services del booking) y
-- el tier actual del user (basado en points pre-checkout). Mantenerlo
-- simple — un multiplier por booking, no por service individual.
--
-- Devuelve la lista de IDs de appointments creados para que el cliente
-- pueda navegar a la confirmación.

create or replace function confirm_checkout()
returns table (appointment_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_user_points int;
  v_user_tier text;
  v_multiplier numeric;
  v_booking record;
  v_dominant_cat text;
  v_max_mult numeric;
  v_points int;
  v_appt_id uuid;
  v_total_points int := 0;
  v_total_spent numeric := 0;
  v_total_visits int := 0;
  v_cart_item record;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  -- Tier actual del user para multipliers.
  select coalesce(points, 0) into v_user_points
    from profiles where id = v_user;

  -- Determinar tier por threshold descendente (gold antes que pearl, etc).
  select tier_id into v_user_tier
    from tier_rules
   where threshold_points <= coalesce(v_user_points, 0)
   order by threshold_points desc
   limit 1;
  if v_user_tier is null then
    v_user_tier := 'pearl';
  end if;

  -- Recorrer pending_bookings del user → appointments.
  for v_booking in
    select * from pending_bookings where user_id = v_user
  loop
    -- Categoría dominante: la de mayor multiplier para este tier entre
    -- los servicios del booking. Si el booking no tiene services válidos,
    -- caemos a multiplier 1.
    select coalesce(max(
      case s.cat
        when 'hair' then tr.multiplier_hair
        when 'nails' then tr.multiplier_nails
        when 'facial' then tr.multiplier_facial
        else 1
      end
    ), 1)
    into v_max_mult
    from services s
    join tier_rules tr on tr.tier_id = v_user_tier
    where s.id = any(v_booking.service_ids);

    v_multiplier := coalesce(v_max_mult, 1);
    v_points := round(v_booking.total * 10 * v_multiplier);

    insert into appointments (
      user_id, service_ids, artisan_id, date, time, total, duration,
      notes, variant, addon_product_ids, combo_id, discount_pct,
      status, points_earned
    ) values (
      v_user, v_booking.service_ids, v_booking.artisan_id, v_booking.date,
      v_booking.time, v_booking.total, v_booking.duration,
      v_booking.notes, v_booking.variant, v_booking.addon_product_ids,
      v_booking.combo_id, v_booking.discount_pct,
      'confirmed', v_points
    )
    returning id into v_appt_id;

    v_total_points := v_total_points + v_points;
    v_total_spent := v_total_spent + v_booking.total;
    v_total_visits := v_total_visits + 1;

    appointment_id := v_appt_id;
    return next;
  end loop;

  -- Decrementar stock por cada cart item. clamp a 0 para no ir negativo.
  for v_cart_item in
    select product_id, qty from cart_items where user_id = v_user
  loop
    update product_stocks
       set stock = greatest(0, stock - v_cart_item.qty)
     where product_id = v_cart_item.product_id;

    -- Suma del valor de productos al spent del user (puntos = 10 por €).
    declare
      v_price numeric;
    begin
      select price into v_price from products where id = v_cart_item.product_id;
      if v_price is not null then
        v_total_spent := v_total_spent + (v_price * v_cart_item.qty);
        v_total_points := v_total_points
          + round(v_price * v_cart_item.qty * 10 * v_multiplier);
      end if;
    end;
  end loop;

  -- Update profile aggregates.
  update profiles
     set points = points + v_total_points,
         spent = spent + v_total_spent,
         visits = visits + v_total_visits
   where id = v_user;

  -- Limpiar bolsa.
  delete from pending_bookings where user_id = v_user;
  delete from cart_items where user_id = v_user;
end;
$$;

grant execute on function confirm_checkout() to authenticated;

-- ---------- cancel_appointment() ----------
-- Cancela una cita propia. Si está en el futuro, hace rollback de los
-- puntos otorgados al checkout. No tocamos stock — los productos ya se
-- vendieron y la cancelación no invierte una compra de boutique.
--
-- Lanza error si la appointment no existe, no es del caller, ya está
-- cancelada o ya pasó.

create or replace function cancel_appointment(appt_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_appt appointments;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_appt from appointments where id = appt_id;
  if not found then
    raise exception 'Appointment not found';
  end if;
  if v_appt.user_id <> v_user then
    raise exception 'Not your appointment';
  end if;
  if v_appt.status = 'cancelled' then
    raise exception 'Already cancelled';
  end if;
  if v_appt.status = 'completed' then
    raise exception 'Cannot cancel a completed appointment';
  end if;

  update appointments
     set status = 'cancelled'
   where id = appt_id;

  -- Rollback de puntos / visitas / spent sólo si la cita era futura
  -- (citas pasadas que no se completaron quedan como cancelled sin afectar
  --  agregados — igual ya estaban "consumidos" del lado del cliente).
  if v_appt.date >= current_date then
    update profiles
       set points = greatest(0, points - v_appt.points_earned),
           visits = greatest(0, visits - 1),
           spent = greatest(0, spent - v_appt.total)
     where id = v_user;
  end if;
end;
$$;

grant execute on function cancel_appointment(uuid) to authenticated;
