-- DSR Maison — RPC para slot collision check.
-- El customer necesita ver qué slots están ocupados con un artista para
-- elegir su cita, pero pending_bookings y appointments tienen RLS owner-only.
-- Esta RPC SECURITY DEFINER expone sólo (date, time, duration) — sin user_id,
-- service_ids, total ni nada que filtre PII.
--
-- Combina ambas tablas: pending_bookings (lo que está en bolsa, ocupa el slot
-- de facto) + appointments con status='confirmed' (reservado en firme).
-- 'completed' y 'cancelled' no se cuentan — el primero ya pasó, el segundo
-- liberó el slot.

create or replace function taken_slots(
  p_artisan_id text,
  p_from date,
  p_to date
)
returns table (
  date date,
  time text,
  duration int
)
language sql
security definer
set search_path = public
as $$
  select pb.date, pb.time, pb.duration
    from pending_bookings pb
   where pb.artisan_id = p_artisan_id
     and pb.date between p_from and p_to
  union all
  select a.date, a.time, a.duration
    from appointments a
   where a.artisan_id = p_artisan_id
     and a.status = 'confirmed'
     and a.date between p_from and p_to;
$$;

grant execute on function taken_slots(text, date, date) to anon, authenticated;
