// DSR — Combos seed.
// Paquetes iniciales de la casa. El admin puede agregar/editar/borrar
// y los cambios se persisten en localStorage (override completo).

import type { Combo } from '../types';

export const SEED_COMBOS: Combo[] = [
  {
    id: 'combo-balayage-cut',
    name_es: 'Édition Couture',
    name_en: 'Couture Edition',
    serviceIds: ['color-balayage', 'cut-signature'],
    discountPct: 15,
    description_es:
      'Balayage de Autor con corte signature finalizado con brushing. La firma de la casa.',
    description_en:
      'Couture balayage with signature cut finished with a blowout. The house signature.',
    popular: true,
  },
  {
    id: 'combo-mani-pedi',
    name_es: 'Ritual de Manos & Pies',
    name_en: 'Hands & Feet Ritual',
    serviceIds: ['mani-gel', 'pedi-spa'],
    discountPct: 12,
    description_es: 'Manicura Gel-X y pedicura spa, mismo día.',
    description_en: 'Gel-X manicure and spa pedicure, same day.',
  },
  {
    id: 'combo-or',
    name_es: 'Ritual de Or',
    name_en: 'Or Ritual',
    serviceIds: ['facial-gold', 'mani-classique'],
    discountPct: 10,
    description_es: 'Facial Or 24K acompañado de manicura clásica.',
    description_en: '24K Gold facial paired with a classic manicure.',
    popular: true,
  },
];
