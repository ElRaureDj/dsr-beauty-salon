// DSR Admin — Vista global de citas (cross-user).
// Combina dos fuentes:
//   - pending_bookings: lo que el customer guardó en su bolsa, sin confirmar.
//   - appointments: confirmadas/completadas tras pasar por checkout.
// Las cancelled (status DB) también se ven aquí — el admin las distingue.
//
// Filter chips por horizonte temporal (próximas / pasadas) basados en
// la fecha de la cita.

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/LangProvider';
import {
  Body,
  Chip,
  Eyebrow,
  H1,
  H3,
  Img,
  Tiny,
} from '../../components/atoms';
import { useCatalog } from '../../data/CatalogProvider';
import {
  fetchAllAppointmentsForAdmin,
  fetchAllPendingBookingsForAdmin,
  type AdminAppointmentRow,
  type AdminPendingBookingRow,
} from '../../lib/db';

type Horizon = 'all' | 'upcoming' | 'past';

type UnifiedRow = {
  kind: 'pending' | 'appointment';
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  artisanId: string;
  serviceIds: string[];
  date: string;
  time: string;
  total: number;
  duration: number;
  /** Sólo para kind='appointment'. */
  rawStatus?: 'confirmed' | 'completed' | 'cancelled';
};

const todayISO = () => new Date().toISOString().slice(0, 10);

function unifyPending(b: AdminPendingBookingRow): UnifiedRow {
  return {
    kind: 'pending',
    id: b.id,
    userId: b.userId,
    userName: b.userName,
    userEmail: b.userEmail,
    artisanId: b.artisanId,
    serviceIds: b.serviceIds,
    date: b.date,
    time: b.time,
    total: b.total,
    duration: b.duration,
  };
}

function unifyAppointment(a: AdminAppointmentRow): UnifiedRow {
  return {
    kind: 'appointment',
    id: a.id,
    userId: a.userId,
    userName: a.userName,
    userEmail: a.userEmail,
    artisanId: a.artisan,
    serviceIds: a.services,
    date: a.date,
    time: a.time,
    total: a.total,
    duration: a.duration,
    rawStatus: a.rawStatus,
  };
}

export function AppointmentsSection() {
  const T = useTheme();
  const { lang } = useI18n();
  const { getArtisan, getService } = useCatalog();
  const [horizon, setHorizon] = useState<Horizon>('all');

  const pendingsQ = useQuery({
    queryKey: ['admin-pending-bookings'],
    queryFn: fetchAllPendingBookingsForAdmin,
    initialData: [],
    initialDataUpdatedAt: 0,
    staleTime: 30_000,
  });
  const appointmentsQ = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: fetchAllAppointmentsForAdmin,
    initialData: [],
    initialDataUpdatedAt: 0,
    staleTime: 30_000,
  });

  const isLoading = pendingsQ.isLoading || appointmentsQ.isLoading;
  const isError = pendingsQ.isError || appointmentsQ.isError;
  const error = pendingsQ.error ?? appointmentsQ.error;

  const today = todayISO();
  const all: UnifiedRow[] = [
    ...(pendingsQ.data ?? []).map(unifyPending),
    ...(appointmentsQ.data ?? []).map(unifyAppointment),
  ];

  const counts = {
    all: all.length,
    upcoming: all.filter((r) => r.date >= today).length,
    past: all.filter((r) => r.date < today).length,
  };

  const filtered =
    horizon === 'all'
      ? all
      : horizon === 'upcoming'
        ? all.filter((r) => r.date >= today)
        : all.filter((r) => r.date < today);

  // Próximas: ascendente (las más cercanas primero). Pasadas: descendente.
  const sorted = [...filtered].sort((a, b) => {
    const ka = `${a.date} ${a.time}`;
    const kb = `${b.date} ${b.time}`;
    if (horizon === 'past') return kb.localeCompare(ka);
    return ka.localeCompare(kb);
  });

  const horizonLabel = (h: Horizon) =>
    lang === 'es'
      ? h === 'all'
        ? 'Todas'
        : h === 'upcoming'
          ? 'Próximas'
          : 'Pasadas'
      : h === 'all'
        ? 'All'
        : h === 'upcoming'
          ? 'Upcoming'
          : 'Past';

  const kindBadge = (row: UnifiedRow): { label: string; color: string } => {
    if (row.kind === 'pending') {
      return {
        label: lang === 'es' ? 'EN CART' : 'IN CART',
        color: T.textMuted,
      };
    }
    if (row.rawStatus === 'cancelled') {
      return { label: lang === 'es' ? 'CANCELADA' : 'CANCELLED', color: T.rouge };
    }
    if (row.rawStatus === 'completed') {
      return { label: lang === 'es' ? 'COMPLETADA' : 'COMPLETED', color: T.gold };
    }
    return {
      label: lang === 'es' ? 'CONFIRMADA' : 'CONFIRMED',
      color: T.gold,
    };
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Eyebrow>{lang === 'es' ? 'Operación' : 'Operations'}</Eyebrow>
        <H1 style={{ marginTop: 8, fontSize: 32, fontStyle: 'italic' }}>
          {lang === 'es' ? 'Citas' : 'Appointments'}
        </H1>
        <Body muted style={{ marginTop: 8, fontSize: 13, maxWidth: 540 }}>
          {lang === 'es'
            ? 'Reservas confirmadas y bolsas en curso de todas las clientas. El badge en cada fila distingue el origen.'
            : 'Confirmed bookings and live carts across all clients. Per-row badge marks the source.'}
        </Body>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {(['all', 'upcoming', 'past'] as const).map((h) => (
          <Chip key={h} active={horizon === h} onClick={() => setHorizon(h)}>
            {horizonLabel(h)} · {counts[h]}
          </Chip>
        ))}
      </div>

      {isError ? (
        <div
          style={{
            padding: 28,
            background: T.surface,
            boxShadow: `inset 0 0 0 1px ${T.rouge}55`,
            textAlign: 'center',
          }}
        >
          <Body style={{ fontSize: 13, color: T.rouge }}>
            {lang === 'es' ? 'No se pudieron cargar las citas.' : 'Could not load appointments.'}
          </Body>
          <Tiny
            muted
            style={{
              marginTop: 6,
              fontSize: 11,
              letterSpacing: 0.3,
              textTransform: 'none',
            }}
          >
            {error instanceof Error ? error.message : String(error)}
          </Tiny>
        </div>
      ) : isLoading && all.length === 0 ? (
        <div
          style={{
            padding: 28,
            background: T.surface,
            boxShadow: `inset 0 0 0 1px ${T.line}`,
            textAlign: 'center',
          }}
        >
          <Body muted style={{ fontSize: 13 }}>
            {lang === 'es' ? 'Cargando citas...' : 'Loading appointments...'}
          </Body>
        </div>
      ) : sorted.length === 0 ? (
        <div
          style={{
            padding: 28,
            background: T.surface,
            boxShadow: `inset 0 0 0 1px ${T.line}`,
            textAlign: 'center',
          }}
        >
          <Body muted style={{ fontSize: 13 }}>
            {lang === 'es'
              ? 'Sin citas en esta categoría.'
              : 'No appointments in this category.'}
          </Body>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sorted.map((r) => {
            const ar = getArtisan(r.artisanId);
            const services = r.serviceIds
              .map(getService)
              .filter((s): s is NonNullable<ReturnType<typeof getService>> => !!s);
            const isUpcoming = r.date >= today;
            const customerLabel = r.userName ?? r.userEmail ?? `${r.userId.slice(0, 8)}...`;
            const badge = kindBadge(r);
            return (
              <div
                key={`${r.kind}-${r.id}`}
                style={{
                  background: T.surface,
                  boxShadow: `inset 0 0 0 1px ${isUpcoming && r.rawStatus !== 'cancelled' ? `${T.gold}55` : T.line}`,
                  padding: '16px 18px',
                  display: 'grid',
                  gridTemplateColumns: '120px 180px 200px 1fr 130px 100px',
                  gap: 16,
                  alignItems: 'center',
                  opacity: r.rawStatus === 'cancelled' ? 0.5 : 1,
                }}
              >
                <div>
                  <Tiny
                    style={{
                      color: T.gold,
                      fontFamily: T.mono,
                      fontSize: 11,
                      letterSpacing: 1,
                    }}
                  >
                    {r.date}
                  </Tiny>
                  <Tiny
                    style={{
                      marginTop: 4,
                      fontFamily: T.serif,
                      fontStyle: 'italic',
                      fontSize: 16,
                      color: T.text,
                      textTransform: 'none',
                      letterSpacing: 0.3,
                    }}
                  >
                    {r.time}
                  </Tiny>
                </div>
                <div style={{ minWidth: 0 }}>
                  <Tiny
                    muted
                    style={{
                      fontSize: 9,
                      letterSpacing: 1.2,
                    }}
                  >
                    {lang === 'es' ? 'CLIENTE' : 'CLIENT'}
                  </Tiny>
                  <Body
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {customerLabel}
                  </Body>
                  {r.userEmail && r.userName && (
                    <Tiny
                      muted
                      style={{
                        marginTop: 2,
                        fontSize: 10,
                        letterSpacing: 0.3,
                        textTransform: 'none',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                      }}
                    >
                      {r.userEmail}
                    </Tiny>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
                  {ar && (
                    <Img src={ar.photo} style={{ width: 36, height: 44, flexShrink: 0 }} />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <Body style={{ fontSize: 12, fontWeight: 500 }}>
                      {ar?.name ?? r.artisanId}
                    </Body>
                    <Tiny
                      muted
                      style={{
                        fontSize: 10,
                        letterSpacing: 0.3,
                        textTransform: 'none',
                        marginTop: 2,
                      }}
                    >
                      {r.duration} min
                    </Tiny>
                  </div>
                </div>
                <Body style={{ fontSize: 12, lineHeight: 1.4 }}>
                  {services.length > 0
                    ? services.map((s) => (lang === 'es' ? s.es : s.en)).join(' + ')
                    : r.serviceIds.join(' + ')}
                </Body>
                <Tiny
                  style={{
                    fontSize: 10,
                    letterSpacing: 1.2,
                    color: badge.color,
                  }}
                >
                  {badge.label}
                </Tiny>
                <H3
                  style={{
                    fontSize: 16,
                    color: T.gold,
                    fontStyle: 'italic',
                    textAlign: 'right',
                  }}
                >
                  €{r.total}
                </H3>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
