// DSR — Seeds para módulos del admin (inventario, promociones, horarios, puntos).
// El CatalogProvider los usa como default si nada en localStorage.

import { ARTISANS, PRODUCTS } from './catalog';
import type {
  ArtisanSchedule,
  ArtisanScheduleDay,
  Promo,
  ProductStock,
  Review,
  SalonSettings,
  TierRule,
  WeekDay,
} from '../types';

export const SEED_PRODUCT_STOCKS: Record<string, ProductStock> = Object.fromEntries(
  PRODUCTS.map((p) => [p.id, { productId: p.id, stock: 12, lowStockAt: 3 }]),
);

export const SEED_PROMOS: Promo[] = [
  {
    id: 'promo-newcomer',
    code: 'BIENVENIDA',
    type: 'pct',
    value: 15,
    description_es: 'Primer servicio para nuevas clientas.',
    description_en: 'First service for new clients.',
    maxUses: 100,
    usedCount: 23,
    active: true,
  },
  {
    id: 'promo-spring',
    code: 'PRINTEMPS26',
    type: 'pct',
    value: 10,
    description_es: 'Édition Printemps · cualquier servicio.',
    description_en: 'Spring Edition · any service.',
    validUntil: '2026-06-30',
    maxUses: 500,
    usedCount: 87,
    active: true,
  },
  {
    id: 'promo-friend',
    code: 'AMIGA50',
    type: 'fixed',
    value: 50,
    description_es: '−€50 al traer una amiga nueva.',
    description_en: '−€50 when you bring a new friend.',
    maxUses: 50,
    usedCount: 8,
    active: true,
  },
];

const WEEKDAYS: WeekDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function defaultSeedDay(weekday: WeekDay): ArtisanScheduleDay {
  return {
    weekday,
    isWorking: weekday !== 'sun',
    startTime: '10:00',
    endTime: '20:00',
  };
}

export const SEED_SCHEDULES: Record<string, ArtisanSchedule> = Object.fromEntries(
  ARTISANS.map((a) => [
    a.id,
    {
      artisanId: a.id,
      days: Object.fromEntries(
        WEEKDAYS.map((wd) => [wd, defaultSeedDay(wd)]),
      ) as Record<WeekDay, ArtisanScheduleDay>,
    },
  ]),
);

export const SEED_REVIEWS: Review[] = [
  {
    id: 'rv-1',
    customerName: 'Camila Vargas',
    artisanId: 'isabela',
    serviceId: 'color-balayage',
    rating: 5,
    comment:
      'Isabela transformó mi pelo. El balayage quedó increíble, exactamente como lo soñaba. Volveré sin duda.',
    date: '2026-04-18',
    response:
      'Camila, mil gracias. Disfrutamos cada minuto. Te esperamos en tu próxima visita.',
    responseDate: '2026-04-19',
  },
  {
    id: 'rv-2',
    customerName: 'Lucía García',
    artisanId: 'olivia',
    serviceId: 'mani-gel',
    rating: 5,
    comment:
      'Las uñas más bonitas que me he hecho. El cromado quedó perfecto. Olivia es una artista.',
    date: '2026-04-22',
  },
  {
    id: 'rv-3',
    customerName: 'María Vargas',
    artisanId: 'leonor',
    serviceId: 'facial-gold',
    rating: 4,
    comment:
      'Excelente facial, muy relajante. Solo extrañé un poco más de tiempo en el masaje kobido. Pero la piel quedó radiante.',
    date: '2026-04-10',
    response:
      'Gracias María. Tomamos nota — la próxima ampliamos el masaje. Un abrazo.',
    responseDate: '2026-04-11',
  },
  {
    id: 'rv-4',
    customerName: 'Antonia Ruiz',
    artisanId: 'celeste',
    serviceId: 'pedi-luxe',
    rating: 5,
    comment:
      'La pedicura luxe es un ritual. Salí flotando. Celeste tiene unas manos prodigiosas.',
    date: '2026-03-28',
  },
  {
    id: 'rv-5',
    customerName: 'Sofía Méndez',
    artisanId: 'ana',
    serviceId: 'cut-signature',
    rating: 3,
    comment:
      'El corte está bien pero esperaba algo más. Quizá fue mi descripción. Volveré para corregirlo.',
    date: '2026-04-05',
  },
];

export const DEFAULT_SETTINGS: SalonSettings = {
  name: 'DSR Maison de Beauté',
  tagline_es: 'Su belleza, nuestro arte',
  tagline_en: 'Your beauty, our craft',
  address: 'Calle de Serrano 84',
  city: 'Madrid',
  phone: '+34 91 555 0184',
  email: 'hola@dsr-maison.com',
  instagram: '@dsr.maison',
  whatsapp: '+34 600 123 456',
  hoursOpen: '10:00',
  hoursClose: '20:00',
  currency: 'EUR',
  timezone: 'Europe/Madrid',
};

export const SEED_TIER_RULES: TierRule[] = [
  {
    tierId: 'pearl',
    thresholdPoints: 0,
    multipliers: { hair: 1, nails: 1, facial: 1 },
  },
  {
    tierId: 'gold',
    thresholdPoints: 1500,
    multipliers: { hair: 1.25, nails: 1.5, facial: 1.25 },
  },
  {
    tierId: 'noir',
    thresholdPoints: 5000,
    multipliers: { hair: 1.5, nails: 2, facial: 1.5 },
  },
];
