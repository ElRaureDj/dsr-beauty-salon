// DSR Admin — Vista global de citas (cross-user).
// Lee pending_bookings de TODOS los users vía RLS admin SELECT (migration 0007).
// Combina con info del profile dueño para mostrar nombre/email del cliente.
// Filtro por horizonte temporal (próximas / pasadas) basado en la fecha del booking.

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
import { fetchAllPendingBookingsForAdmin } from '../../lib/db';

type Horizon = 'all' | 'upcoming' | 'past';

const todayISO = () => new Date().toISOString().slice(0, 10);

export function AppointmentsSection() {
  const T = useTheme();
  const { lang } = useI18n();
  const { getArtisan, getService } = useCatalog();
  const [horizon, setHorizon] = useState<Horizon>('all');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-pending-bookings'],
    queryFn: fetchAllPendingBookingsForAdmin,
    initialData: [],
    initialDataUpdatedAt: 0,
    staleTime: 30_000,
  });

  const today = todayISO();
  const all = data ?? [];

  const counts = {
    all: all.length,
    upcoming: all.filter((b) => b.date >= today).length,
    past: all.filter((b) => b.date < today).length,
  };

  const filtered =
    horizon === 'all'
      ? all
      : horizon === 'upcoming'
        ? all.filter((b) => b.date >= today)
        : all.filter((b) => b.date < today);

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

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Eyebrow>{lang === 'es' ? 'Operación' : 'Operations'}</Eyebrow>
        <H1 style={{ marginTop: 8, fontSize: 32, fontStyle: 'italic' }}>
          {lang === 'es' ? 'Citas' : 'Appointments'}
        </H1>
        <Body muted style={{ marginTop: 8, fontSize: 13, maxWidth: 540 }}>
          {lang === 'es'
            ? 'Vista global de reservas guardadas en el cart de todas las clientas. Próximas y pasadas en función de la fecha programada.'
            : 'Global view of bookings saved in client carts. Upcoming and past based on scheduled date.'}
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
          {sorted.map((b) => {
            const ar = getArtisan(b.artisanId);
            const services = b.serviceIds
              .map(getService)
              .filter((s): s is NonNullable<ReturnType<typeof getService>> => !!s);
            const isUpcoming = b.date >= today;
            const customerLabel = b.userName ?? b.userEmail ?? `${b.userId.slice(0, 8)}...`;
            return (
              <div
                key={b.id}
                style={{
                  background: T.surface,
                  boxShadow: `inset 0 0 0 1px ${isUpcoming ? `${T.gold}55` : T.line}`,
                  padding: '16px 18px',
                  display: 'grid',
                  gridTemplateColumns: '120px 180px 200px 1fr 110px 100px',
                  gap: 16,
                  alignItems: 'center',
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
                    {b.date}
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
                    {b.time}
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
                  {b.userEmail && b.userName && (
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
                      {b.userEmail}
                    </Tiny>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
                  {ar && (
                    <Img src={ar.photo} style={{ width: 36, height: 44, flexShrink: 0 }} />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <Body style={{ fontSize: 12, fontWeight: 500 }}>
                      {ar?.name ?? b.artisanId}
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
                      {b.duration} min
                    </Tiny>
                  </div>
                </div>
                <Body style={{ fontSize: 12, lineHeight: 1.4 }}>
                  {services.length > 0
                    ? services.map((s) => (lang === 'es' ? s.es : s.en)).join(' + ')
                    : b.serviceIds.join(' + ')}
                </Body>
                <Tiny
                  style={{
                    fontSize: 10,
                    letterSpacing: 1.2,
                    color: isUpcoming ? T.gold : T.textFaint,
                  }}
                >
                  {isUpcoming
                    ? (lang === 'es' ? 'PRÓXIMA' : 'UPCOMING')
                    : (lang === 'es' ? 'PASADA' : 'PAST')}
                </Tiny>
                <H3
                  style={{
                    fontSize: 16,
                    color: T.gold,
                    fontStyle: 'italic',
                    textAlign: 'right',
                  }}
                >
                  €{b.total}
                </H3>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
