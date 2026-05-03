// DSR Maison — cliente Supabase singleton.
// Lee las variables de entorno expuestas a Vite (prefijo VITE_) y crea
// un único cliente reutilizado en toda la app. Si alguna de las dos
// falta, el cliente sigue creándose pero arroja en runtime al primer
// query — preferimos eso a un import-time crash que rompa el build.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Solo advertencia visible en dev; producción lo verá en console
  // hasta que la fase 4 empiece a leer datos.
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no definidas. ' +
      'Copia .env.local.example a .env.local y rellena los valores.',
  );
}

export const supabase: SupabaseClient = createClient(url ?? '', anonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // PKCE flow: el magic link incluye un ?code= que se intercambia por
    // sesión usando un code_verifier guardado en localStorage al pedir el
    // OTP. Email scanners (Gmail, Outlook) no pueden completar el flow
    // porque no tienen el verifier — eso resuelve el otp_expired clásico.
    flowType: 'pkce',
    // detectSessionInUrl es true por default; lo dejamos explícito.
    // Cuando el browser carga ?code=xxx, supabase-js intercambia
    // automáticamente y limpia el URL.
    detectSessionInUrl: true,
  },
});
