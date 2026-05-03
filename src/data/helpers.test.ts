// DSR — Tests críticos de helpers puros.
// Cubre lo que rompe plata si falla:
// - tierFor / nextTier: thresholds correctos según puntos del user.
// - buildSchedule: dayOff, generación de slots, collision check con
//   takenSlots reales (overlap detection).

import { describe, expect, it } from 'vitest';
import { buildSchedule, nextTier, tierFor } from './helpers';
import { TIERS } from './tiers';
import type { ArtisanSchedule, Tier } from '../types';

describe('tierFor', () => {
  it('devuelve pearl para 0 puntos', () => {
    expect(tierFor(0).id).toBe('pearl');
  });
  it('devuelve pearl para puntos < 1500', () => {
    expect(tierFor(1499).id).toBe('pearl');
  });
  it('devuelve gold al alcanzar el threshold', () => {
    expect(tierFor(1500).id).toBe('gold');
  });
  it('devuelve gold para puntos < 5000', () => {
    expect(tierFor(4999).id).toBe('gold');
  });
  it('devuelve noir al alcanzar el threshold', () => {
    expect(tierFor(5000).id).toBe('noir');
  });
  it('respeta thresholds custom de DB (override admin)', () => {
    const customTiers: Tier[] = [
      { ...TIERS[0], min: 0, max: 3000 },
      { ...TIERS[1], min: 3000, max: 8000 },
      { ...TIERS[2], min: 8000, max: 999_999 },
    ];
    // Usuario con 5000 puntos: con seed default sería noir, con override
    // debería ser gold (no llega al nuevo threshold de 8000).
    expect(tierFor(5000).id).toBe('noir'); // default
    expect(tierFor(5000, customTiers).id).toBe('gold'); // override
  });
});

describe('nextTier', () => {
  it('un user en pearl tiene a gold como next', () => {
    const next = nextTier(500);
    expect(next?.id).toBe('gold');
  });
  it('un user en gold tiene a noir como next', () => {
    const next = nextTier(2000);
    expect(next?.id).toBe('noir');
  });
  it('un user en noir no tiene next tier', () => {
    expect(nextTier(10_000)).toBeNull();
  });
});

describe('buildSchedule', () => {
  // Schedule simple: lunes a viernes 10-18, sáb/dom off.
  const weekdaySchedule: ArtisanSchedule = {
    artisanId: 'isabela',
    days: {
      mon: { weekday: 'mon', isWorking: true, startTime: '10:00', endTime: '18:00' },
      tue: { weekday: 'tue', isWorking: true, startTime: '10:00', endTime: '18:00' },
      wed: { weekday: 'wed', isWorking: true, startTime: '10:00', endTime: '18:00' },
      thu: { weekday: 'thu', isWorking: true, startTime: '10:00', endTime: '18:00' },
      fri: { weekday: 'fri', isWorking: true, startTime: '10:00', endTime: '18:00' },
      sat: { weekday: 'sat', isWorking: false, startTime: '10:00', endTime: '18:00' },
      sun: { weekday: 'sun', isWorking: false, startTime: '10:00', endTime: '18:00' },
    },
  };

  it('genera 7 días', () => {
    const days = buildSchedule('isabela', weekdaySchedule, undefined, new Date('2026-05-04')); // lunes
    expect(days).toHaveLength(7);
  });

  it('marca dom y sáb como dayOff cuando isWorking=false', () => {
    const days = buildSchedule('isabela', weekdaySchedule, undefined, new Date('2026-05-04'));
    // Empezamos lunes 4 mayo. Sábado = day 5, domingo = day 6.
    expect(days[5].dayOff).toBe(true); // sat
    expect(days[6].dayOff).toBe(true); // sun
    expect(days[0].dayOff).toBe(false); // mon
  });

  it('genera slots cada 30 min dentro del rango working', () => {
    const days = buildSchedule('isabela', weekdaySchedule, undefined, new Date('2026-05-04'));
    const monday = days[0];
    // 10:00 a 18:00 = 8 horas = 16 slots de 30 min.
    expect(monday.slots).toHaveLength(16);
    expect(monday.slots[0].time).toBe('10:00');
    expect(monday.slots[15].time).toBe('17:30');
  });

  it('no genera slots en days off', () => {
    const days = buildSchedule('isabela', weekdaySchedule, undefined, new Date('2026-05-04'));
    expect(days[5].slots).toEqual([]); // sat
    expect(days[6].slots).toEqual([]); // sun
  });

  it('marca slots ocupados cuando hay collision con taken (exact match)', () => {
    const taken = [
      { date: '2026-05-04', time: '11:00', duration: 30 },
    ];
    const days = buildSchedule('isabela', weekdaySchedule, taken, new Date('2026-05-04'));
    const monday = days[0];
    const slot1100 = monday.slots.find((s) => s.time === '11:00');
    expect(slot1100?.free).toBe(false);
  });

  it('marca múltiples slots ocupados cuando taken duration > 30', () => {
    const taken = [
      { date: '2026-05-04', time: '11:00', duration: 90 }, // 11:00-12:30
    ];
    const days = buildSchedule('isabela', weekdaySchedule, taken, new Date('2026-05-04'));
    const monday = days[0];
    expect(monday.slots.find((s) => s.time === '11:00')?.free).toBe(false);
    expect(monday.slots.find((s) => s.time === '11:30')?.free).toBe(false);
    expect(monday.slots.find((s) => s.time === '12:00')?.free).toBe(false);
    // 12:30 ya empieza después del fin (12:30) → libre.
    expect(monday.slots.find((s) => s.time === '12:30')?.free).toBe(true);
  });

  it('slots fuera del rango taken siguen libres', () => {
    const taken = [{ date: '2026-05-04', time: '11:00', duration: 30 }];
    const days = buildSchedule('isabela', weekdaySchedule, taken, new Date('2026-05-04'));
    const monday = days[0];
    expect(monday.slots.find((s) => s.time === '10:00')?.free).toBe(true);
    expect(monday.slots.find((s) => s.time === '14:00')?.free).toBe(true);
  });

  it('takenSlots de otros días no afecta', () => {
    const taken = [{ date: '2026-05-05', time: '11:00', duration: 30 }]; // martes
    const days = buildSchedule('isabela', weekdaySchedule, taken, new Date('2026-05-04'));
    const monday = days[0];
    // 11:00 del lunes sigue libre — el taken es del martes.
    expect(monday.slots.find((s) => s.time === '11:00')?.free).toBe(true);
  });

  it('cuando NO hay takenSlots, cae al seed determinista', () => {
    const days = buildSchedule('isabela', weekdaySchedule, undefined, new Date('2026-05-04'));
    const monday = days[0];
    // El seed es determinista, así que el mismo artisan en la misma fecha
    // produce los mismos slots free.
    const days2 = buildSchedule('isabela', weekdaySchedule, undefined, new Date('2026-05-04'));
    expect(monday.slots).toEqual(days2[0].slots);
  });
});
