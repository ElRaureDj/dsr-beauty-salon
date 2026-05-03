// DSR — Copy legal de la maison.
// Tres documentos: política de cancelación (con depósito tier-based),
// términos y condiciones, política de privacidad. Cada uno bilingüe ES/EN.
//
// La estructura de depósitos se documenta acá pero la lógica de cobro
// real vive en el flow de checkout (TODO: aplicar al confirmar booking).
// Por ahora es informativa para el customer.

import type { Lang } from '../i18n/strings';

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDoc {
  title: string;
  updated: string; // YYYY-MM-DD
  intro: string;
  sections: LegalSection[];
}

// ─── Política de cancelación ─────────────────────────────────────────

const CANCELLATION_ES: LegalDoc = {
  title: 'Política de cancelación',
  updated: '2026-05-03',
  intro:
    'En DSR cada cita reserva tiempo exclusivo de tu artista. Esta política está pensada para protegerte a ti y a la maison: te queremos generosa cuando puedas serlo.',
  sections: [
    {
      heading: 'Plazo de cancelación gratuita',
      body: [
        'Puedes cancelar o reagendar sin costo hasta 24 horas antes de tu cita.',
        'Después de las 24 horas, aplica el depósito según tu nivel de membresía (ver abajo).',
      ],
    },
    {
      heading: 'Depósito por nivel',
      body: [
        '• Perla (nuevas clientas): depósito de $50 al reservar. Se descuenta del total al asistir. No reembolsable si cancelas con menos de 24h.',
        '• Oro (1.500+ puntos): depósito de $25, reembolsable hasta 48h antes. Se descuenta del total.',
        '• Noir (5.000+ puntos): sin depósito. Tu palabra y tu historial son tu garantía.',
      ],
    },
    {
      heading: 'No-show',
      body: [
        'Si no llegas a tu cita sin avisar, cobramos el 100% del servicio reservado en tu próxima visita o al método de pago en archivo.',
        'Tres no-shows en doce meses suspenden tu acceso a la reserva online y requieren contacto directo con concierge.',
      ],
    },
    {
      heading: 'Llegadas tardes',
      body: [
        'Una tolerancia de 10 minutos. Más allá, el servicio puede acortarse para no afectar a la siguiente clienta. El precio completo se mantiene.',
      ],
    },
    {
      heading: 'Cancelación por la maison',
      body: [
        'Si por una razón excepcional necesitamos cancelar tu cita, te avisamos lo antes posible. Te ofrecemos reagendar con prioridad y un crédito de cortesía proporcional a la molestia.',
      ],
    },
  ],
};

const CANCELLATION_EN: LegalDoc = {
  title: 'Cancellation policy',
  updated: '2026-05-03',
  intro:
    'At DSR each booking reserves exclusive time with your artisan. This policy protects both you and the maison — we want you generous when you can be.',
  sections: [
    {
      heading: 'Free cancellation window',
      body: [
        'You can cancel or reschedule at no cost up to 24 hours before your appointment.',
        'Past 24 hours, the deposit per membership tier applies (see below).',
      ],
    },
    {
      heading: 'Deposit by tier',
      body: [
        '• Pearl (new clients): $50 deposit at booking. Credited to your total at the visit. Non-refundable if you cancel within 24h.',
        '• Gold (1,500+ points): $25 deposit, refundable up to 48h before. Credited to your total.',
        '• Noir (5,000+ points): no deposit. Your word and your history are your guarantee.',
      ],
    },
    {
      heading: 'No-show',
      body: [
        'If you miss your appointment without notice, we charge 100% of the reserved service at your next visit or to the card on file.',
        'Three no-shows in twelve months suspend online booking access and require direct concierge contact.',
      ],
    },
    {
      heading: 'Late arrivals',
      body: [
        'A 10-minute grace period applies. Beyond that the service may be shortened to respect the next client. The full price still applies.',
      ],
    },
    {
      heading: 'Cancellations from the maison',
      body: [
        'If we exceptionally need to cancel your appointment, we notify you as soon as possible. We offer priority rescheduling plus a courtesy credit proportional to the inconvenience.',
      ],
    },
  ],
};

// ─── Términos y condiciones ──────────────────────────────────────────

const TERMS_ES: LegalDoc = {
  title: 'Términos y condiciones',
  updated: '2026-05-03',
  intro:
    'Estos términos rigen tu uso de la app y los servicios de DSR Maison de Beauté en Miami. Al crear tu cuenta o reservar, aceptas estas condiciones.',
  sections: [
    {
      heading: 'Edad mínima',
      body: [
        'Debes tener al menos 16 años para reservar servicios. Menores de edad requieren consentimiento de su madre o tutora presente en la cita.',
      ],
    },
    {
      heading: 'Cuenta y datos',
      body: [
        'Eres responsable de mantener seguros tus datos de acceso. Notifícanos en cuanto sospeches uso indebido.',
        'Puedes pedir borrar tu cuenta y datos personales en cualquier momento desde tu perfil o escribiendo a hola@dsr-maison.com.',
      ],
    },
    {
      heading: 'Servicios',
      body: [
        'Los precios mostrados incluyen impuestos. Pueden actualizarse sin previo aviso, pero las reservas confirmadas mantienen el precio del momento de reserva.',
        'Los productos son artículos de cuidado personal sin posibilidad de devolución una vez abiertos, salvo defecto.',
      ],
    },
    {
      heading: 'Programa de fidelidad',
      body: [
        'Acumulas puntos por cada visita y compra. Los puntos no tienen valor monetario en efectivo y no son transferibles.',
        'Tu nivel (Perla / Oro / Noir) se basa en tus puntos acumulados. Los multiplicadores y umbrales pueden ajustarse — el cambio se anuncia con 30 días de aviso.',
      ],
    },
    {
      heading: 'Gift cards',
      body: [
        'Las gift cards no caducan. No son canjeables por efectivo. Si se pierde el código, el comprador original puede solicitar reemisión con prueba de compra.',
      ],
    },
    {
      heading: 'Disputas',
      body: [
        'Cualquier disputa se resuelve primero por contacto directo con la maison. Jurisdicción: tribunales de Miami-Dade County, Florida.',
      ],
    },
  ],
};

const TERMS_EN: LegalDoc = {
  title: 'Terms and conditions',
  updated: '2026-05-03',
  intro:
    'These terms govern your use of the app and DSR Maison de Beauté services in Miami. By creating your account or booking, you accept these terms.',
  sections: [
    {
      heading: 'Minimum age',
      body: [
        'You must be at least 16 years old to book services. Minors require consent from a present mother or guardian at the appointment.',
      ],
    },
    {
      heading: 'Account and data',
      body: [
        'You are responsible for keeping your login credentials safe. Notify us as soon as you suspect misuse.',
        'You can request deletion of your account and personal data at any time from your profile or by writing to hola@dsr-maison.com.',
      ],
    },
    {
      heading: 'Services',
      body: [
        'Prices shown include taxes. They may update without notice, but confirmed bookings keep the price at booking time.',
        'Products are personal-care items, non-returnable once opened, except for defect.',
      ],
    },
    {
      heading: 'Loyalty program',
      body: [
        'You earn points per visit and purchase. Points have no cash value and are non-transferable.',
        'Your tier (Pearl / Gold / Noir) is based on accumulated points. Multipliers and thresholds may be adjusted — changes are announced with 30 days notice.',
      ],
    },
    {
      heading: 'Gift cards',
      body: [
        'Gift cards do not expire. Not redeemable for cash. If a code is lost, the original buyer may request reissue with proof of purchase.',
      ],
    },
    {
      heading: 'Disputes',
      body: [
        'Any dispute is first resolved through direct contact with the maison. Jurisdiction: courts of Miami-Dade County, Florida.',
      ],
    },
  ],
};

// ─── Privacidad ──────────────────────────────────────────────────────

const PRIVACY_ES: LegalDoc = {
  title: 'Política de privacidad',
  updated: '2026-05-03',
  intro:
    'En DSR tratamos tus datos con el mismo cuidado con que tratamos tu pelo y tu piel. Acá está exactamente qué guardamos, por qué, y cómo controlas todo.',
  sections: [
    {
      heading: 'Qué guardamos',
      body: [
        '• Tu nombre, email y teléfono — para identificarte y contactarte.',
        '• Tu historial de citas y compras — para personalizar recomendaciones y acumular puntos.',
        '• Tu dirección de envío (solo si compras boutique) — para entregarte productos.',
        '• Notas internas de tus artistas (color usado, alergias, preferencias) — para que cada visita sea mejor.',
        'No guardamos tu tarjeta de crédito; el procesador de pagos (Stripe / Apple Pay) la maneja directo.',
      ],
    },
    {
      heading: 'Por qué',
      body: [
        'Para prestarte el servicio que reservaste, contactarte sobre tus citas, mejorar la experiencia y cumplir obligaciones contables y fiscales.',
      ],
    },
    {
      heading: 'Con quién compartimos',
      body: [
        'Solo con proveedores estrictamente necesarios: Supabase (base de datos), Resend / proveedor SMTP (emails), Stripe (pagos cuando aplique). Todos vinculados por contrato de procesamiento de datos.',
        'Nunca vendemos ni alquilamos tus datos a terceros con fines de marketing.',
      ],
    },
    {
      heading: 'Cuánto tiempo',
      body: [
        'Mientras tengas cuenta activa + 6 años después por requerimientos contables. Puedes pedir borrado anticipado de los datos no obligatorios.',
      ],
    },
    {
      heading: 'Tus derechos',
      body: [
        'Acceso, rectificación, borrado, portabilidad, oposición. Escríbenos a hola@dsr-maison.com — respondemos en máximo 30 días.',
        'Puedes presentar reclamación a la autoridad de protección de datos competente si crees que infringimos.',
      ],
    },
    {
      heading: 'Cookies',
      body: [
        'Solo cookies estrictamente necesarias para mantener tu sesión iniciada y tus preferencias de tema/idioma. No usamos cookies de terceros para tracking.',
      ],
    },
  ],
};

const PRIVACY_EN: LegalDoc = {
  title: 'Privacy policy',
  updated: '2026-05-03',
  intro:
    'At DSR we handle your data with the same care we handle your hair and skin. Here is exactly what we store, why, and how you control it all.',
  sections: [
    {
      heading: 'What we store',
      body: [
        '• Your name, email and phone — to identify and contact you.',
        '• Your appointment and purchase history — to personalize recommendations and accumulate points.',
        '• Your shipping address (only if you shop boutique) — to deliver products.',
        '• Internal notes from your artisans (color used, allergies, preferences) — so every visit gets better.',
        'We do not store your credit card; the payment processor (Stripe / Apple Pay) handles it directly.',
      ],
    },
    {
      heading: 'Why',
      body: [
        'To deliver the service you booked, contact you about your appointments, improve the experience, and meet accounting and tax obligations.',
      ],
    },
    {
      heading: 'Who we share with',
      body: [
        'Only strictly necessary providers: Supabase (database), Resend / SMTP provider (emails), Stripe (payments when applicable). All bound by data processing agreement.',
        'We never sell or rent your data to third parties for marketing purposes.',
      ],
    },
    {
      heading: 'How long',
      body: [
        'While you have an active account + 6 years after, for accounting requirements. You can request early deletion of non-mandatory data.',
      ],
    },
    {
      heading: 'Your rights',
      body: [
        'Access, rectification, deletion, portability, opposition. Write to hola@dsr-maison.com — we respond within 30 days at most.',
        'You may file a complaint with the competent data protection authority if you believe we are in breach.',
      ],
    },
    {
      heading: 'Cookies',
      body: [
        'Only strictly necessary cookies to keep your session and your theme/language preferences. We do not use third-party tracking cookies.',
      ],
    },
  ],
};

// ─── Export ─────────────────────────────────────────────────────────

export type LegalDocId = 'cancellation' | 'terms' | 'privacy';

export const LEGAL: Record<LegalDocId, Record<Lang, LegalDoc>> = {
  cancellation: { es: CANCELLATION_ES, en: CANCELLATION_EN },
  terms: { es: TERMS_ES, en: TERMS_EN },
  privacy: { es: PRIVACY_ES, en: PRIVACY_EN },
};
