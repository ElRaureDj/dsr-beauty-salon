// DSR — Gift card designs and user holdings

import type { GiftCardDesign, ReceivedGiftCard, SentGiftCard } from '../types';

export const GIFTCARD_DESIGNS: GiftCardDesign[] = [
  {
    id: 'noir',
    name_es: 'Noir Couture',
    name_en: 'Noir Couture',
    bg: 'linear-gradient(135deg, #0A0908 0%, #1c1814 100%)',
    fg: '#D4B886',
    accent: '#D4B886',
    vibe_es: 'Atemporal · cualquier ocasión',
    vibe_en: 'Timeless · any occasion',
  },
  {
    id: 'or',
    name_es: 'Or Cachemire',
    name_en: 'Or Cachemire',
    bg: 'linear-gradient(135deg, #C9A96E 0%, #8E7141 100%)',
    fg: '#1a1410',
    accent: '#1a1410',
    vibe_es: 'Cumpleaños · gracias',
    vibe_en: 'Birthday · thank you',
  },
  {
    id: 'creme',
    name_es: 'Crème Marbré',
    name_en: 'Marble Cream',
    bg: 'linear-gradient(135deg, #F5F1EA 0%, #E5DCC8 100%)',
    fg: '#3a2f24',
    accent: '#8E7141',
    vibe_es: 'Madre · amistad',
    vibe_en: 'Mother · friendship',
  },
  {
    id: 'rose',
    name_es: 'Rose Maison',
    name_en: 'Rose Maison',
    bg: 'linear-gradient(135deg, #C7836B 0%, #8B4A35 100%)',
    fg: '#fff',
    accent: '#fff',
    vibe_es: 'Aniversario · romance',
    vibe_en: 'Anniversary · romance',
  },
  {
    id: 'verde',
    name_es: 'Vert Olive',
    name_en: 'Olive Vert',
    bg: 'linear-gradient(135deg, #5C6B4A 0%, #364027 100%)',
    fg: '#F5F1EA',
    accent: '#D4B886',
    vibe_es: 'Para él · neutro',
    vibe_en: 'For him · neutral',
  },
  {
    id: 'fete',
    name_es: 'Fête Dorée',
    name_en: 'Golden Fête',
    bg: 'linear-gradient(135deg, #1a1410 0%, #5C3A1F 50%, #D4B886 100%)',
    fg: '#F5F1EA',
    accent: '#D4B886',
    vibe_es: 'Navidad · fin de año',
    vibe_en: 'Holidays · year-end',
  },
];

export const GIFTCARD_AMOUNTS = [50, 100, 150, 250, 500, 1000];

export const USER_GIFTCARDS: {
  received: ReceivedGiftCard[];
  purchased: SentGiftCard[];
} = {
  received: [
    {
      id: 'gc-r1',
      code: 'DSR-7E2K-9MQX',
      design: 'fete',
      amount: 250,
      balance: 175,
      from: 'María Vargas',
      message_es: 'Para tu cumpleaños — disfruta cada minuto. Te quiero.',
      message_en: 'For your birthday — enjoy every minute. Love you.',
      received: '2026-04-12',
      expires: '2027-04-12',
    },
    {
      id: 'gc-r2',
      code: 'DSR-3PLB-5XNH',
      design: 'or',
      amount: 150,
      balance: 150,
      from: 'Equipo Hawthorne',
      message_es: 'Gracias por todo el trabajo este trimestre. — El equipo',
      message_en: 'Thanks for all your work this quarter. — The team',
      received: '2026-03-30',
      expires: '2027-03-30',
    },
  ],
  purchased: [
    {
      id: 'gc-p1',
      code: 'DSR-Q9KR-2WNM',
      design: 'rose',
      amount: 100,
      balance: 100,
      to: 'Lucía García',
      sent: '2026-04-22',
      deliveryDate: '2026-05-15',
      method: 'whatsapp',
      status_es: 'Programada · 15 may',
      status_en: 'Scheduled · May 15',
    },
    {
      id: 'gc-p2',
      code: 'DSR-T4XJ-8FDR',
      design: 'creme',
      amount: 200,
      balance: 0,
      to: 'Antonia Ruiz',
      sent: '2026-02-10',
      method: 'email',
      status_es: 'Entregada · canjeada',
      status_en: 'Delivered · redeemed',
    },
  ],
};
