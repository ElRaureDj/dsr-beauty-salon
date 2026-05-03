-- DSR Maison — admin cross-user reads
-- Permite a admins leer pending_bookings y profiles de todos los users.
-- Necesario para AppointmentsSection (vista global) y ReportsSection (KPIs).
-- Las policies "_own" siguen vivas para customers; estas son adicionales.
--
-- Nota: NO se agregan policies admin para INSERT/UPDATE/DELETE en
-- pending_bookings — los admins no editan citas de otros users desde esta
-- fase. Si en el futuro se quiere "cancelar cita", se agrega aparte.

-- ---------- pending_bookings: admin lee todo ----------

drop policy if exists pending_bookings_admin_select on pending_bookings;
create policy pending_bookings_admin_select on pending_bookings
  for select using (is_admin());

-- ---------- profiles: admin lee todo ----------
-- Necesario para mostrar el nombre + email del cliente en cada row de la
-- vista de citas del admin. La policy _own (creada en 0003) sigue activa
-- para que cada user lea su propio profile.

drop policy if exists profiles_admin_select on profiles;
create policy profiles_admin_select on profiles
  for select using (is_admin());
