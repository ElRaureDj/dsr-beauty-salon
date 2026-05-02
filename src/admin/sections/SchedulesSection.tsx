// DSR Admin — Horarios por artista.
// Cada artista tiene una agenda semanal: días que trabaja + horario de apertura.

import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/LangProvider';
import { Body, Eyebrow, H1, Img, Tiny } from '../../components/atoms';
import { useCatalog } from '../../data/CatalogProvider';
import type { ArtisanSchedule, WeekDay } from '../../types';

const DAYS: { key: WeekDay; es: string; en: string }[] = [
  { key: 'mon', es: 'L', en: 'M' },
  { key: 'tue', es: 'M', en: 'T' },
  { key: 'wed', es: 'X', en: 'W' },
  { key: 'thu', es: 'J', en: 'T' },
  { key: 'fri', es: 'V', en: 'F' },
  { key: 'sat', es: 'S', en: 'S' },
  { key: 'sun', es: 'D', en: 'S' },
];

export function SchedulesSection() {
  const T = useTheme();
  const { lang } = useI18n();
  const { getAllArtisans, getSchedule, updateSchedule } = useCatalog();
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
            ? 'Agenda semanal por artista. Días de trabajo + apertura/cierre.'
            : 'Weekly agenda per artisan. Working days + open/close.'}
        </Body>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {artisans.map((a) => {
          const sch = getSchedule(a.id);
          return (
            <ArtisanScheduleRow
              key={a.id}
              name={a.name}
              role={lang === 'es' ? a.role_es : a.role_en}
              photo={a.photo}
              schedule={sch}
              onToggle={(d) =>
                updateSchedule(a.id, {
                  workingDays: { ...sch.workingDays, [d]: !sch.workingDays[d] },
                })
              }
              onTime={(field, value) => updateSchedule(a.id, { [field]: value })}
              T={T}
              lang={lang}
            />
          );
        })}
      </div>
    </div>
  );
}

function ArtisanScheduleRow({
  name,
  role,
  photo,
  schedule,
  onToggle,
  onTime,
  T,
  lang,
}: {
  name: string;
  role: string;
  photo: string;
  schedule: ArtisanSchedule;
  onToggle: (d: WeekDay) => void;
  onTime: (field: 'startTime' | 'endTime', value: string) => void;
  T: ReturnType<typeof useTheme>;
  lang: 'es' | 'en';
}) {
  return (
    <div
      style={{
        background: T.surface,
        boxShadow: `inset 0 0 0 1px ${T.line}`,
        padding: 18,
        display: 'grid',
        gridTemplateColumns: '220px 1fr 240px',
        gap: 22,
        alignItems: 'center',
      }}
    >
      {/* Identity */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
        <Img src={photo} style={{ width: 48, height: 60, flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <Body style={{ fontSize: 13, fontWeight: 500 }}>{name}</Body>
          <Tiny
            muted
            style={{
              fontSize: 11,
              letterSpacing: 0.3,
              textTransform: 'none',
              marginTop: 2,
              fontStyle: 'italic',
              fontFamily: T.serif,
              color: T.gold,
            }}
          >
            {role}
          </Tiny>
        </div>
      </div>

      {/* Day toggles */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {DAYS.map((d) => {
          const sel = schedule.workingDays[d.key];
          return (
            <button
              key={d.key}
              onClick={() => onToggle(d.key)}
              className="dsr-press"
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                background: sel ? T.gold : 'transparent',
                color: sel ? T.bg : T.textMuted,
                boxShadow: sel ? 'none' : `inset 0 0 0 1px ${T.lineStrong}`,
                fontFamily: T.sans,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 0.4,
                transition: 'background .15s, color .15s',
              }}
            >
              {d[lang]}
            </button>
          );
        })}
      </div>

      {/* Time range */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <TimeInput
          value={schedule.startTime}
          onChange={(v) => onTime('startTime', v)}
          T={T}
        />
        <Tiny muted style={{ fontFamily: T.mono, fontSize: 11 }}>
          —
        </Tiny>
        <TimeInput
          value={schedule.endTime}
          onChange={(v) => onTime('endTime', v)}
          T={T}
        />
      </div>
    </div>
  );
}

function TimeInput({
  value,
  onChange,
  T,
}: {
  value: string;
  onChange: (v: string) => void;
  T: ReturnType<typeof useTheme>;
}) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        flex: 1,
        padding: '8px 10px',
        background: T.bgAlt,
        border: 'none',
        boxShadow: `inset 0 0 0 1px ${T.line}`,
        color: T.text,
        fontFamily: T.mono,
        fontSize: 12,
        outline: 'none',
      }}
    />
  );
}
