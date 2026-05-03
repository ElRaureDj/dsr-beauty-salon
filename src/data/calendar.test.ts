// DSR — Tests del generador de .ics para "Añadir al calendario".
// Verifica que el output respete RFC 5545 lo suficiente para que iOS
// Calendar / Google Calendar lo importen sin error.

import { describe, expect, it } from 'vitest';
import { buildIcsEvent } from './calendar';

describe('buildIcsEvent', () => {
  const baseInput = {
    uid: 'apt-123@dsr-maison.com',
    date: '2026-05-07',
    time: '15:30',
    duration: 90,
    summary: 'Balayage de Autor',
    description: 'Cita en DSR con Isabela',
    location: 'Lincoln Road 1234, Miami',
    timezone: 'America/New_York',
  };

  it('arma un VCALENDAR/VEVENT bien formado', () => {
    const ics = buildIcsEvent(baseInput);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('END:VCALENDAR');
  });

  it('incluye UID intacto', () => {
    const ics = buildIcsEvent(baseInput);
    expect(ics).toContain('UID:apt-123@dsr-maison.com');
  });

  it('formatea DTSTART con TZID y timestamp local sin Z', () => {
    const ics = buildIcsEvent(baseInput);
    expect(ics).toContain('DTSTART;TZID=America/New_York:20260507T153000');
    // No debe tener Z (que indicaría UTC).
    expect(ics).not.toContain('DTSTART;TZID=America/New_York:20260507T153000Z');
  });

  it('calcula DTEND sumando duration en minutos', () => {
    const ics = buildIcsEvent(baseInput);
    // 15:30 + 90 min = 17:00.
    expect(ics).toContain('DTEND;TZID=America/New_York:20260507T170000');
  });

  it('escapa commas en SUMMARY/DESCRIPTION/LOCATION', () => {
    const ics = buildIcsEvent({
      ...baseInput,
      summary: 'Color, corte y peinado',
      location: 'Lincoln Road 1234, Miami',
    });
    expect(ics).toContain('SUMMARY:Color\\, corte y peinado');
    expect(ics).toContain('LOCATION:Lincoln Road 1234\\, Miami');
  });

  it('escapa newlines en DESCRIPTION', () => {
    const ics = buildIcsEvent({
      ...baseInput,
      description: 'Línea 1\nLínea 2',
    });
    expect(ics).toContain('DESCRIPTION:Línea 1\\nLínea 2');
  });

  it('omite DESCRIPTION/LOCATION si no se pasan', () => {
    const ics = buildIcsEvent({
      uid: 'apt-x',
      date: '2026-05-07',
      time: '10:00',
      duration: 60,
      summary: 'Solo summary',
    });
    expect(ics).not.toContain('DESCRIPTION:');
    expect(ics).not.toContain('LOCATION:');
  });

  it('default timezone es America/New_York', () => {
    const ics = buildIcsEvent({
      uid: 'x',
      date: '2026-05-07',
      time: '10:00',
      duration: 60,
      summary: 'X',
    });
    expect(ics).toContain('DTSTART;TZID=America/New_York:20260507T100000');
  });

  it('cruza medianoche correctamente', () => {
    // 23:30 + 60 min = 00:30 del día siguiente.
    const ics = buildIcsEvent({
      ...baseInput,
      time: '23:30',
      duration: 60,
    });
    expect(ics).toContain('DTSTART;TZID=America/New_York:20260507T233000');
    expect(ics).toContain('DTEND;TZID=America/New_York:20260508T003000');
  });

  it('STATUS:CONFIRMED siempre presente', () => {
    const ics = buildIcsEvent(baseInput);
    expect(ics).toContain('STATUS:CONFIRMED');
  });
});
