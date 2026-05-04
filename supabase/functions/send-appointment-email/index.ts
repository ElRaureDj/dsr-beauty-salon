// DSR Maison — Edge Function: envía emails transaccionales.
// Soporta dos tipos:
//   - 'confirmation' (default): tras checkout, "tu cita está confirmada".
//   - 'reminder': llamado por pg_cron 24h antes para recordar la cita.
//
// Stack: Deno runtime (Supabase Edge), API de Resend (https://resend.com).
// Deploy:  supabase functions deploy send-appointment-email
// Secrets: supabase secrets set RESEND_API_KEY=re_xxx
//          supabase secrets set EMAIL_FROM='DSR Maison <reservas@dsr-maison.com>'
//
// Verificar el dominio sender en Resend antes de prod (sin verificación
// los mails caen a spam).

// deno-lint-ignore-file no-explicit-any

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

type EmailKind = 'confirmation' | 'reminder';

interface Payload {
  /** Default 'confirmation' por backwards compat. */
  kind?: EmailKind;
  to: string;
  recipientName: string;
  artisanName: string;
  serviceNames: string[];
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  total: number;
  currency: string;
  lang: 'es' | 'en';
  salonName: string;
  salonAddress: string;
  salonCity: string;
  policyUrl?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function buildHtml(p: Payload): string {
  const isEs = p.lang === 'es';
  const isReminder = p.kind === 'reminder';
  const symbol = p.currency === 'USD' ? '$' : p.currency === 'EUR' ? '€' : p.currency;
  const dateLabel = new Date(p.date + 'T00:00:00').toLocaleDateString(
    isEs ? 'es-ES' : 'en-US',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  );
  const services = p.serviceNames.join(' + ');
  const t = isEs
    ? {
        eyebrow: isReminder ? 'Mañana en la maison' : 'Cita confirmada',
        greeting: `Querida ${p.recipientName}`,
        intro: isReminder
          ? 'Te esperamos mañana. Confirma tu llegada con tiempo y lleva tu mejor sonrisa.'
          : 'Tu reserva en la maison está confirmada.',
        whenLabel: 'Cuándo',
        withLabel: 'Con',
        servicesLabel: 'Servicios',
        totalLabel: 'Total',
        addToCal: 'Necesitarás abrir la app para agregar al calendario.',
        policy: 'Política de cancelación',
        signoff: 'Su belleza, nuestro arte.',
      }
    : {
        eyebrow: isReminder ? 'Tomorrow at the maison' : 'Appointment confirmed',
        greeting: `Dear ${p.recipientName}`,
        intro: isReminder
          ? 'See you tomorrow. Please arrive with time to spare — bring your best smile.'
          : 'Your booking at the maison is confirmed.',
        whenLabel: 'When',
        withLabel: 'With',
        servicesLabel: 'Services',
        totalLabel: 'Total',
        addToCal: 'Open the app to add it to your calendar.',
        policy: 'Cancellation policy',
        signoff: 'Your beauty, our craft.',
      };

  return `<!DOCTYPE html>
<html lang="${p.lang}">
  <body style="margin:0;padding:0;background:#0A0908;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#EFEAE0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0A0908;">
      <tr><td align="center" style="padding:48px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#13110F;box-shadow:inset 0 0 0 1px rgba(196,160,90,0.18);">
          <tr><td align="center" style="padding:42px 32px 12px;">
            <div style="font-family:Georgia,serif;font-style:italic;font-weight:300;font-size:32px;color:#C4A05A;letter-spacing:0.04em;line-height:1;">DSR</div>
            <div style="margin-top:8px;font-size:9px;letter-spacing:3px;color:#8B847A;text-transform:uppercase;">Maison de Beauté · ${p.salonCity}</div>
          </td></tr>
          <tr><td align="center" style="padding:24px 32px 0;">
            <div style="width:36px;height:1px;background:#C4A05A;"></div>
          </td></tr>
          <tr><td style="padding:32px 40px 8px;">
            <div style="font-size:9px;letter-spacing:1.4px;color:#C4A05A;text-transform:uppercase;">${t.eyebrow}</div>
            <h1 style="margin:8px 0 14px;font-family:Georgia,serif;font-style:italic;font-weight:300;font-size:28px;color:#EFEAE0;line-height:1.25;">${t.greeting}</h1>
            <p style="margin:0;font-size:14px;line-height:1.6;color:#B5AEA1;">${t.intro}</p>
          </td></tr>
          <tr><td style="padding:24px 40px 0;">
            <table role="presentation" width="100%" style="background:#0A0908;box-shadow:inset 0 0 0 1px rgba(196,160,90,0.18);">
              <tr><td style="padding:18px 20px;">
                <div style="font-size:9px;letter-spacing:1.4px;color:#8B847A;text-transform:uppercase;margin-bottom:6px;">${t.whenLabel}</div>
                <div style="font-family:Georgia,serif;font-style:italic;font-size:18px;color:#C4A05A;">${dateLabel} · ${p.time}</div>
              </td></tr>
              <tr><td style="padding:0 20px 18px;">
                <div style="font-size:9px;letter-spacing:1.4px;color:#8B847A;text-transform:uppercase;margin:6px 0;">${t.withLabel}</div>
                <div style="font-size:14px;color:#EFEAE0;">${p.artisanName}</div>
                <div style="font-size:9px;letter-spacing:1.4px;color:#8B847A;text-transform:uppercase;margin:14px 0 6px;">${t.servicesLabel}</div>
                <div style="font-size:13px;color:#EFEAE0;line-height:1.5;">${services}</div>
                <div style="margin-top:14px;padding-top:14px;border-top:1px solid rgba(196,160,90,0.12);display:flex;justify-content:space-between;">
                  <span style="font-size:11px;color:#B5AEA1;letter-spacing:0.4px;">${t.totalLabel}</span>
                  <span style="font-family:Georgia,serif;font-style:italic;font-size:18px;color:#C4A05A;">${symbol}${p.total}</span>
                </div>
              </td></tr>
            </table>
          </td></tr>
          <tr><td style="padding:24px 40px;font-size:11px;color:#8B847A;line-height:1.5;">
            ${t.addToCal}
            ${p.policyUrl ? `<br/><br/><a href="${p.policyUrl}" style="color:#C4A05A;">${t.policy}</a>` : ''}
          </td></tr>
          <tr><td style="padding:32px 40px 36px;">
            <div style="height:1px;background:rgba(196,160,90,0.12);margin-bottom:22px;"></div>
            <div style="font-family:Georgia,serif;font-style:italic;font-size:12px;color:#C4A05A;">${t.signoff}</div>
            <div style="margin-top:10px;font-size:10px;color:#5C564E;letter-spacing:1.5px;text-transform:uppercase;">${p.salonName} · ${p.salonAddress} · ${p.salonCity}</div>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('RESEND_API_KEY');
    const from = Deno.env.get('EMAIL_FROM') ?? 'DSR <onboarding@resend.dev>';
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const payload = (await req.json()) as Payload;
    if (!payload.to || !payload.recipientName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const isReminder = payload.kind === 'reminder';
    const subject = payload.lang === 'es'
      ? isReminder
        ? `Mañana te esperamos en ${payload.salonName}`
        : `Tu cita en ${payload.salonName} está confirmada`
      : isReminder
        ? `See you tomorrow at ${payload.salonName}`
        : `Your appointment at ${payload.salonName} is confirmed`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: payload.to,
        subject,
        html: buildHtml(payload),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: 'Resend rejected', detail: data }),
        { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ ok: true, id: (data as { id?: string }).id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Unexpected', message: String(err?.message ?? err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
