// DSR — Helper utilities

import { ARTISANS, PRODUCTS, SERVICES } from './catalog';
import { GIFTCARD_DESIGNS } from './giftcards';
import { NAIL_LOOKS } from './nails';
import { TIERS } from './tiers';
import type { Lang } from '../i18n/strings';
import type { ArtisanSchedule, ScheduleDay, Tier, WeekDay } from '../types';

export const findService = (id: string) => SERVICES.find((s) => s.id === id);
export const findArtisan = (id: string) => ARTISANS.find((a) => a.id === id);
export const findProduct = (id: string) => PRODUCTS.find((p) => p.id === id);
export const findNailLook = (id: string) => NAIL_LOOKS.find((n) => n.id === id);
export const findGiftCardDesign = (id: string) => GIFTCARD_DESIGNS.find((g) => g.id === id);

/**
 * Tier actual del usuario según sus puntos.
 * Acepta `tiers` opcional — si se omite, cae al seed estático (TIERS).
 * Pasa `useCatalog().getTiers()` cuando quieras los thresholds reales del admin.
 */
export function tierFor(points: number, tiers: Tier[] = TIERS): Tier {
  return tiers.slice().reverse().find((t) => points >= t.min) || tiers[0];
}

export function nextTier(points: number, tiers: Tier[] = TIERS): Tier | null {
  const idx = tiers.findIndex((t) => points >= t.min && points < t.max);
  return tiers[idx + 1] || null;
}

export function greeting(lang: Lang, t: (k: 'goodMorning' | 'goodAfternoon' | 'goodEvening') => string): string {
  void lang;
  const h = new Date().getHours();
  if (h < 12) return t('goodMorning');
  if (h < 19) return t('goodAfternoon');
  return t('goodEvening');
}

// JS Date.getDay() devuelve 0=Sun..6=Sat. Lo mapeamos a nuestro WeekDay.
const JS_DAY_TO_WEEKDAY: WeekDay[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** "HH:MM" -> minutos desde medianoche. */
function hhmmToMinutes(s: string): number {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + (m ?? 0);
}

/** minutos -> "HH:MM" formateado a 2 dígitos. */
function minutesToHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Slot ocupado: una cita existente del artist que bloquea un rango.
 * Pasarlos a `buildSchedule` marca como busy todos los slots de 30 min
 * que solapen con [time, time + duration).
 */
export interface TakenInterval {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (start)
  duration: number; // minutos
}

/**
 * Build a 7-day availability schedule for an artisan.
 * El día off y el rango de horas viene del `schedule` real (admin-managed).
 * Si el caller no lo pasa, asumimos los defaults (10:00-20:00, dom off).
 *
 * `takenSlots` (opcional) viene del RPC `taken_slots`: pending_bookings
 * + appointments confirmed del mismo artist. Cada uno bloquea todos los
 * slots de 30 min cuyo intervalo solape con [time, time+duration).
 *
 * Cuando `takenSlots` está provisto, la disponibilidad de cada slot es
 * data-driven (no seed-determinista). Cuando no se pasa (preview/demo),
 * volvemos al seed para que la lista de slots libres se vea consistente.
 *
 * `startDate` por defecto es hoy.
 */
export function buildSchedule(
  artisanId: string,
  schedule?: ArtisanSchedule,
  takenSlots?: TakenInterval[],
  startDate: Date = new Date(),
): ScheduleDay[] {
  const days: ScheduleDay[] = [];
  const seed = artisanId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

  // Pre-procesar takenSlots a un map date → array de [start, end) en minutos.
  const takenByDate = new Map<string, Array<[number, number]>>();
  if (takenSlots) {
    for (const t of takenSlots) {
      const startMin = hhmmToMinutes(t.time);
      const endMin = startMin + t.duration;
      const arr = takenByDate.get(t.date);
      if (arr) arr.push([startMin, endMin]);
      else takenByDate.set(t.date, [[startMin, endMin]]);
    }
  }

  for (let d = 0; d < 7; d++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + d);
    const wd = JS_DAY_TO_WEEKDAY[date.getDay()];
    const cfg = schedule?.days[wd];
    const isWorking = cfg?.isWorking ?? (wd !== 'sun');
    const startMin = hhmmToMinutes(cfg?.startTime ?? '10:00');
    const endMin = hhmmToMinutes(cfg?.endTime ?? '20:00');

    const dateKey = date.toISOString().slice(0, 10);
    const taken = takenByDate.get(dateKey) ?? [];

    // Genera slots cada 30 min dentro del rango (excluye el end exacto).
    const slots: { time: string; free: boolean }[] = [];
    if (isWorking && endMin > startMin) {
      let i = 0;
      for (let t = startMin; t + 30 <= endMin; t += 30, i++) {
        const slotEnd = t + 30;
        const isTaken = taken.some(
          ([takenStart, takenEnd]) => t < takenEnd && slotEnd > takenStart,
        );
        // Si tenemos data real, free se determina por overlap.
        // Si no, seed-determinista (demo estable).
        const free = takenSlots
          ? !isTaken
          : (seed + d * 7 + i * 3) % 5 !== 0 && (seed + d + i) % 4 !== 0;
        slots.push({ time: minutesToHHMM(t), free });
      }
    }

    days.push({
      date,
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: date.getDate(),
      dayOff: !isWorking,
      slots,
    });
  }
  return days;
}
