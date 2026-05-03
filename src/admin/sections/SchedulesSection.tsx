// DSR Admin — Horarios por artista, día por día.
// Cada artista tiene 7 entradas (lun-dom). Para cada una, el admin puede
// togglear si trabaja ese día y ajustar start/end independientemente.
// Permite horarios variables (ej: lun 09:00-18:00, sáb 10:00-14:00, dom off).

import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/LangProvider';
import { Body, Eyebrow, H1, H3, Img, Tiny } from '../../components/atoms';
import { useCatalog } from '../../data/CatalogProvider';
import type { ArtisanSchedule, ArtisanScheduleDay, WeekDay } from '../../types';

const DAYS: { key: WeekDay; es: string; en: string; short: string }[] = [
  { key: 'mon', es: 'Lunes',     en: 'Monday',    short: 'L' },
  { key: 'tue', es: 'Martes',    en: 'Tuesday',   short: 'M' },
  { key: 'wed', es: 'Miércoles', en: 'Wednesday', short: 'X' },
  { key: 'thu', es: 'Jueves',    en: 'Thursday',  short: 'J' },
  { key: 'fri', es: 'Viernes',   en: 'Friday',    short: 'V' },
  { key: 'sat', es: 'Sábado',    en: 'Saturday',  short: 'S' },
  { key: 'sun', es: 'Domingo',   en: 'Sunday',    short: 'D' },
];

export function SchedulesSection() {
  const T = useTheme();
  const { lang } = useI18n();
  const { getAllArtisans, getSchedule, updateScheduleDay } = useCatalog();
  const artisans = getAllArtisans();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Eyebrow>{lang === 'es' ? 'Personal' : 'People'}</Eyebrow>
        <H1 style={{ marginTop: 8, fontSize: 32, fontStyle: 'italic' }}>
          {lang === 'es' ? 'Horarios' : 'Schedules'}
        </H1>
        <Body muted style={{ marginTop: 8, fontSize: 13, maxWidth: 540 }}>
          {lang === 'es'
            ? 'Agenda por día y por artista. Cada día puede tener su propio horario o estar libre.'
            : 'Per-day, per-artisan agenda. Each day can have its own hours or be a day off.'}
        </Body>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {artisans.map((a) => {
          const sch = getSchedule(a.id);
          return (
            <ArtisanScheduleCard
              key={a.id}
              name={a.name}
              role={lang === 'es' ? a.role_es : a.role_en}
              photo={a.photo}
              schedule={sch}
              onChangeDay={(weekday, fields) =>
                updateScheduleDay(a.id, weekday, fields)
              }
              T={T}
              lang={lang}
            />
          );
        })}
      </div>
    </div>
  );
}

function ArtisanScheduleCard({
  name,
  role,
  photo,
  schedule,
  onChangeDay,
  T,
  lang,
}: {
  name: string;
  role: string;
  photo: string;
  schedule: ArtisanSchedule;
  onChangeDay: (
    weekday: WeekDay,
    fields: Partial<Omit<ArtisanScheduleDay, 'weekday'>>,
  ) => void;
  T: ReturnType<typeof useTheme>;
  lang: 'es' | 'en';
}) {
  const workingDays = DAYS.filter((d) => schedule.days[d.key].isWorking).length;

  return (
    <div
      style={{
        background: T.surface,
        boxShadow: `inset 0 0 0 1px ${T.line}`,
        padding: 22,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          gap: 14,
          alignItems: 'center',
          marginBottom: 18,
          paddingBottom: 14,
          borderBottom: `1px solid ${T.line}`,
        }}
      >
        <Img src={photo} style={{ width: 52, height: 64, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <H3 style={{ fontSize: 17 }}>{name}</H3>
          <Tiny
            muted
            style={{
              fontSize: 11,
              letterSpacing: 0.3,
              textTransform: 'none',
              marginTop: 4,
              fontStyle: 'italic',
              fontFamily: T.serif,
              color: T.gold,
            }}
          >
            {role}
          </Tiny>
        </div>
        <Tiny
          muted
          style={{
            fontSize: 10,
            letterSpacing: 1.4,
          }}
        >
          {workingDays} {lang === 'es' ? 'DÍAS / SEMANA' : 'DAYS / WEEK'}
        </Tiny>
      </div>

      {/* Day rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {DAYS.map((d) => {
          const day = schedule.days[d.key];
          return (
            <DayRow
              key={d.key}
              label={lang === 'es' ? d.es : d.en}
              shortLabel={d.short}
              day={day}
              onToggle={() =>
                onChangeDay(d.key, { isWorking: !day.isWorking })
              }
              onTime={(field, value) => onChangeDay(d.key, { [field]: value })}
              T={T}
              lang={lang}
            />
          );
        })}
      </div>
    </div>
  );
}

function DayRow({
  label,
  shortLabel,
  day,
  onToggle,
  onTime,
  T,
  lang,
}: {
  label: string;
  shortLabel: string;
  day: ArtisanScheduleDay;
  onToggle: () => void;
  onTime: (field: 'startTime' | 'endTime', value: string) => void;
  T: ReturnType<typeof useTheme>;
  lang: 'es' | 'en';
}) {
  const isWorking = day.isWorking;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '46px 130px 1fr 220px',
        gap: 14,
        alignItems: 'center',
        padding: '10px 12px',
        background: isWorking ? `${T.gold}0A` : 'transparent',
        boxShadow: `inset 0 0 0 1px ${isWorking ? `${T.gold}33` : T.line}`,
        opacity: isWorking ? 1 : 0.55,
        transition: 'opacity .15s, background .15s',
      }}
    >
      {/* Day badge */}
      <button
        onClick={onToggle}
        className="dsr-press"
        aria-label={`${isWorking ? (lang === 'es' ? 'Desactivar' : 'Disable') : (lang === 'es' ? 'Activar' : 'Enable')} ${label}`}
        style={{
          width: 36,
          height: 36,
          borderRadius: 999,
          border: 'none',
          cursor: 'pointer',
          background: isWorking ? T.gold : 'transparent',
          color: isWorking ? T.bg : T.textMuted,
          boxShadow: isWorking ? 'none' : `inset 0 0 0 1px ${T.lineStrong}`,
          fontFamily: T.sans,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: 0.4,
          transition: 'background .15s, color .15s',
        }}
      >
        {shortLabel}
      </button>

      {/* Day label */}
      <Body
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: isWorking ? T.text : T.textMuted,
        }}
      >
        {label}
      </Body>

      {/* Off / range */}
      {!isWorking ? (
        <Tiny
          muted
          style={{
            fontSize: 11,
            letterSpacing: 0.4,
            textTransform: 'none',
            fontStyle: 'italic',
            fontFamily: T.serif,
          }}
        >
          {lang === 'es' ? 'Día libre' : 'Day off'}
        </Tiny>
      ) : (
        <Tiny
          muted
          style={{
            fontSize: 11,
            letterSpacing: 0.3,
            textTransform: 'none',
            fontFamily: T.mono,
            color: T.textMuted,
          }}
        >
          {durationLabel(day.startTime, day.endTime, lang)}
        </Tiny>
      )}

      {/* Time inputs */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifySelf: 'end' }}>
        <TimeInput
          value={day.startTime}
          disabled={!isWorking}
          onChange={(v) => onTime('startTime', v)}
          T={T}
        />
        <Tiny muted style={{ fontFamily: T.mono, fontSize: 11 }}>
          -
        </Tiny>
        <TimeInput
          value={day.endTime}
          disabled={!isWorking}
          onChange={(v) => onTime('endTime', v)}
          T={T}
        />
      </div>
    </div>
  );
}

function TimeInput({
  value,
  disabled,
  onChange,
  T,
}: {
  value: string;
  disabled?: boolean;
  onChange: (v: string) => void;
  T: ReturnType<typeof useTheme>;
}) {
  return (
    <input
      type="time"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: 90,
        padding: '8px 10px',
        background: disabled ? 'transparent' : T.bgAlt,
        border: 'none',
        boxShadow: `inset 0 0 0 1px ${T.line}`,
        color: disabled ? T.textFaint : T.text,
        fontFamily: T.mono,
        fontSize: 12,
        outline: 'none',
        cursor: disabled ? 'not-allowed' : 'text',
      }}
    />
  );
}

function durationLabel(start: string, end: string, lang: 'es' | 'en'): string {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const minutes = (eh * 60 + em) - (sh * 60 + sm);
  if (!Number.isFinite(minutes) || minutes <= 0) return '';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const hLabel = lang === 'es' ? 'h' : 'h';
  if (rest === 0) return `${hours}${hLabel}`;
  return `${hours}${hLabel} ${rest}m`;
}
