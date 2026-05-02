// DSR — Helper utilities

import { ARTISANS, PRODUCTS, SERVICES } from './catalog';
import { GIFTCARD_DESIGNS } from './giftcards';
import { NAIL_LOOKS } from './nails';
import { TIERS } from './tiers';
import type { Lang } from '../i18n/strings';
import type { ScheduleDay, Tier } from '../types';

export const findService = (id: string) => SERVICES.find((s) => s.id === id);
export const findArtisan = (id: string) => ARTISANS.find((a) => a.id === id);
export const findProduct = (id: string) => PRODUCTS.find((p) => p.id === id);
export const findNailLook = (id: string) => NAIL_LOOKS.find((n) => n.id === id);
export const findGiftCardDesign = (id: string) => GIFTCARD_DESIGNS.find((g) => g.id === id);

export function tierFor(points: number): Tier {
  return TIERS.slice().reverse().find((t) => points >= t.min) || TIERS[0];
}

export function nextTier(points: number): Tier | null {
  const idx = TIERS.findIndex((t) => points >= t.min && points < t.max);
  return TIERS[idx + 1] || null;
}

export function greeting(lang: Lang, t: (k: 'goodMorning' | 'goodAfternoon' | 'goodEvening') => string): string {
  void lang;
  const h = new Date().getHours();
  if (h < 12) return t('goodMorning');
  if (h < 19) return t('goodAfternoon');
  return t('goodEvening');
}

/**
 * Build a deterministic 7-day availability schedule for an artisan.
 * Pseudo-random based on the artisan's id so the calendar is stable across renders.
 */
export function buildSchedule(
  artisanId: string,
  startDate: Date = new Date('2026-05-02'),
): ScheduleDay[] {
  const slots = [
    '09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30',
    '14:00','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00',
  ];
  const days: ScheduleDay[] = [];
  const seed = artisanId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  for (let d = 0; d < 7; d++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + d);
    const dayOff = (seed + d) % 7 === 5;
    days.push({
      date,
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: date.getDate(),
      dayOff,
      slots: slots.map((time, i) => ({
        time,
        free: !dayOff && (seed + d * 7 + i * 3) % 5 !== 0 && (seed + d + i) % 4 !== 0,
      })),
    });
  }
  return days;
}
