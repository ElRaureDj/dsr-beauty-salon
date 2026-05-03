-- DSR Maison — sede a Miami
-- El seed inicial 0002 cargó salon_settings con datos europeos (Madrid, EUR,
-- Europe/Madrid). La sede real es Miami. Este update solo dispara si los
-- valores actuales coinciden con el seed (idempotente — si el admin ya
-- editó manualmente desde la UI, no toca nada).

update salon_settings
   set address = 'Lincoln Road 1234',
       city = 'Miami',
       phone = '+1 305 555 0184',
       whatsapp = '+1 305 555 0123',
       currency = 'USD',
       timezone = 'America/New_York'
 where city = 'Madrid'
   and timezone = 'Europe/Madrid';
