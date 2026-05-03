// DSR — Generador de eventos .ics para "Añadir al calendario".
// Standalone, sin libs externas. Genera un VCALENDAR con un VEVENT y
// dispara descarga browser-side via Blob URL.
//
// Format spec: RFC 5545. Lo mínimo que respetan iOS Calendar / Google
// Calendar / Outlook al hacer doble-click en el .ics.
//
// La cita es local-time del salón (no UTC). Para que no se mueva entre
// timezones del usuario, especificamos TZID en DTSTART/DTEND.

interface IcsEventInput {
  /** ID estable y único; recomendado: `<appointmentId>@dsr-maison.com`. */
  uid: string;
  /** YYYY-MM-DD del día de la cita en la zona del salón. */
  date: string;
  /** HH:MM de inicio en la zona del salón. */
  time: string;
  /** Duración en minutos. */
  duration: number;
  /** Título corto que aparece en el calendario. */
  summary: string;
  /** Texto largo (descripción de servicios, artista, notas). */
  description?: string;
  /** Dirección física legible. Si la app conoce coords podemos sumar GEO. */
  location?: string;
  /** TZID IANA. Default America/New_York (sede Miami). */
  timezone?: string;
}

/** YYYY-MM-DD + HH:MM → YYYYMMDDTHHMMSS sin Z (formato local). */
function localStamp(date: string, time: string): string {
  const [y, m, d] = date.split('-');
  const [h, mm] = time.split(':');
  return `${y}${m}${d}T${h}${mm}00`;
}

function addMinutes(date: string, time: string, minutes: number): { date: string; time: string } {
  const [y, m, d] = date.split('-').map(Number);
  const [h, mm] = time.split(':').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, h, mm));
  dt.setUTCMinutes(dt.getUTCMinutes() + minutes);
  const newDate = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
  const newTime = `${String(dt.getUTCHours()).padStart(2, '0')}:${String(dt.getUTCMinutes()).padStart(2, '0')}`;
  return { date: newDate, time: newTime };
}

/** Escapa caracteres especiales según RFC 5545 (commas, semicolons, newlines). */
function escapeIcs(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

/** Construye el string completo de un VCALENDAR/VEVENT. */
export function buildIcsEvent(input: IcsEventInput): string {
  const tz = input.timezone ?? 'America/New_York';
  const start = localStamp(input.date, input.time);
  const end = (() => {
    const e = addMinutes(input.date, input.time, input.duration);
    return localStamp(e.date, e.time);
  })();
  const stamp = (() => {
    // DTSTAMP debe ser UTC con Z. Hoy + ahora.
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
  })();

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DSR Maison de Beauté//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${input.uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${tz}:${start}`,
    `DTEND;TZID=${tz}:${end}`,
    `SUMMARY:${escapeIcs(input.summary)}`,
  ];
  if (input.description) lines.push(`DESCRIPTION:${escapeIcs(input.description)}`);
  if (input.location) lines.push(`LOCATION:${escapeIcs(input.location)}`);
  lines.push('STATUS:CONFIRMED', 'END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
}

/** Dispara descarga browser-side de un .ics como `<filename>.ics`. */
export function downloadIcs(filename: string, ics: string): void {
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Liberar el blob URL después del click (algunos browsers lo necesitan async).
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
