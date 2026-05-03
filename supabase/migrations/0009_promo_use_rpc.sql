-- DSR Maison — incremento atómico de promo.used_count
-- El customer no es admin, así que no puede UPDATE promos directo (RLS lo
-- bloquea, ver 0006). Esta RPC corre con SECURITY DEFINER, valida que la
-- promo está activa + dentro de límites + no expirada, y la incrementa
-- atómicamente. Devuelve el row actualizado o null si la promo es
-- inválida (no existe / inactiva / agotada / expirada).
--
-- Se llama desde CheckoutSuccess cuando hay un appliedPromoCode — solo
-- contamos el uso al "checkout", no al apply, para que abrir/cerrar la
-- bolsa con un cupón no consuma el contador.

create or replace function increment_promo_use(promo_code text)
returns table (
  id text,
  code text,
  used_count int,
  max_uses int,
  active boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update promos p
     set used_count = p.used_count + 1
   where upper(p.code) = upper(promo_code)
     and p.active = true
     and (p.max_uses is null or p.used_count < p.max_uses)
     and (p.valid_until is null or p.valid_until >= current_date)
  returning p.id, p.code, p.used_count, p.max_uses, p.active;
end;
$$;

-- Cualquier usuario autenticado o anónimo puede llamarla — la lógica de
-- validación vive en la función misma. No expone otros campos sensibles.
grant execute on function increment_promo_use(text) to anon, authenticated;
