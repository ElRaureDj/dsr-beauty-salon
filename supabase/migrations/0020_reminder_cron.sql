-- DSR Maison — recordatorio 24h antes de la cita.
-- Cron job que corre cada día a las 10am UTC (~6am ET en horario de
-- verano, ~5am en invierno). Para cada appointment confirmed con date =
-- mañana, dispara la Edge Function send-appointment-email con kind='reminder'.
--
-- Requiere extensiones pg_cron + pg_net (Supabase las tiene disponibles
-- pero hay que activarlas explícitamente). Y secrets ya configurados:
--   - app.edge_url (ej: https://<proj>.supabase.co/functions/v1)
--   - app.edge_key (anon key del proyecto)
--
-- Para activar las extensiones: Dashboard → Database → Extensions → buscar
-- "pg_cron" y "pg_net" → enable.
--
-- IMPORTANTE: si pg_cron / pg_net no están disponibles, las CREATE EXTENSION
-- fallarán y el cron job no se programa. La app sigue funcionando — solo
-- se pierden los recordatorios.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net  with schema extensions;

-- Helper: lee el config app.<key> con fallback a NULL.
create or replace function read_setting(p_key text)
returns text
language sql
security definer
stable
as $$
  select coalesce(current_setting(p_key, true), null);
$$;

-- ---------- Job: send_appointment_reminders ----------
-- Selecciona appointments confirmed con date = current_date + 1 y para
-- cada uno dispara la Edge Function pasando todos los datos necesarios
-- vía pg_net.http_post.
--
-- El JOIN con profiles y artisans + agregación de service_names viene
-- inline. La Edge Function se encarga del rendering del HTML.

create or replace function send_appointment_reminders()
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_edge_url text := current_setting('app.edge_url', true);
  v_edge_key text := current_setting('app.edge_key', true);
  v_settings record;
  v_appt record;
  v_artisan text;
  v_services text[];
  v_recipient_email text;
  v_recipient_name text;
  v_user_lang text;
  v_payload jsonb;
begin
  if v_edge_url is null or v_edge_key is null then
    raise notice 'app.edge_url or app.edge_key not configured; skipping reminders';
    return;
  end if;

  -- Settings del salón (single row).
  select name, address, city, currency into v_settings
    from salon_settings limit 1;

  for v_appt in
    select a.* from appointments a
    where a.status = 'confirmed'
      and a.date = current_date + interval '1 day'
  loop
    select coalesce(name, 'la maison') into v_artisan
      from artisans where id = v_appt.artisan_id;

    select array_agg(coalesce(es, en, id))
      into v_services
      from services
     where id = any(v_appt.service_ids);

    select email,
           coalesce(display_name, full_name, 'cliente'),
           coalesce(preferred_lang, 'es')
      into v_recipient_email, v_recipient_name, v_user_lang
      from profiles where id = v_appt.user_id;

    if v_recipient_email is null then
      continue;
    end if;

    v_payload := jsonb_build_object(
      'kind', 'reminder',
      'to', v_recipient_email,
      'recipientName', v_recipient_name,
      'artisanName', v_artisan,
      'serviceNames', to_jsonb(v_services),
      'date', to_char(v_appt.date, 'YYYY-MM-DD'),
      'time', v_appt.time,
      'total', v_appt.total,
      'currency', v_settings.currency,
      'lang', v_user_lang,
      'salonName', v_settings.name,
      'salonAddress', v_settings.address,
      'salonCity', v_settings.city
    );

    perform net.http_post(
      url := v_edge_url || '/send-appointment-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_edge_key
      ),
      body := v_payload
    );
  end loop;
end;
$$;

-- Programar el job: cada día a las 10:00 UTC.
-- En horario de verano de Miami (EDT = UTC-4), eso son las 6am.
-- En invierno (EST = UTC-5), las 5am. El customer recibe el reminder
-- en horas tempranas — antes del checkout del día.
--
-- IMPORTANTE: si el job ya existe, cron.schedule lo crea de nuevo sin
-- error (idempotente con unschedule previo).
do $$
begin
  if exists (select 1 from cron.job where jobname = 'dsr_appointment_reminders') then
    perform cron.unschedule('dsr_appointment_reminders');
  end if;
  perform cron.schedule(
    'dsr_appointment_reminders',
    '0 10 * * *',  -- diario 10:00 UTC
    $JOB$ select send_appointment_reminders(); $JOB$
  );
exception when others then
  raise notice 'cron.schedule failed (probably pg_cron not enabled): %', sqlerrm;
end$$;
