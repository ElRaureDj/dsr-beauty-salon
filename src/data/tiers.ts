// DSR — Loyalty tiers and perks

import type { Perk, Tier } from '../types';

export const TIERS: Tier[] = [
  { id: 'pearl', name: { es: 'Perla', en: 'Pearl' }, min: 0, max: 1500, color: '#ECE5D7' },
  { id: 'gold', name: { es: 'Oro', en: 'Gold' }, min: 1500, max: 5000, color: '#C9A96E' },
  { id: 'noir', name: { es: 'Noir', en: 'Noir' }, min: 5000, max: 999_999, color: '#0A0A0A' },
];

export const PERKS: Record<Tier['id'], Perk[]> = {
  pearl: [
    { es: '10% de descuento en tu cumpleaños', en: '10% off on your birthday' },
    { es: 'Consulta capilar trimestral gratis', en: 'Free quarterly hair consultation' },
    { es: 'Bienvenida con bebida de cortesía', en: 'Complimentary welcome drink' },
  ],
  gold: [
    { es: 'Todo lo de Perla, más:', en: 'All Pearl, plus:' },
    { es: 'Reserva con 14 días de antelación exclusiva', en: 'Exclusive 14-day advance booking' },
    { es: 'Servicio gratis al alcanzar el nivel', en: 'Free service when you reach this tier' },
    { es: 'Atelier privados invitación', en: 'Invitation to private ateliers' },
  ],
  noir: [
    { es: 'Todo lo de Oro, más:', en: 'All Gold, plus:' },
    { es: 'Concierge personal 24/7', en: 'Personal concierge 24/7' },
    { es: 'Acceso anticipado a colecciones', en: 'Early access to collections' },
    { es: 'Anfitriona de eventos privados', en: 'Private events hostess' },
    { es: 'Servicio a domicilio incluido', en: 'In-home service included' },
  ],
};
