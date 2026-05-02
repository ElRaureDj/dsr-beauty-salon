// DSR Admin — Vista global de citas.
// Mock: combina citas confirmadas/pasadas del USER + pendientes del cart.
// Filtro por estado. Read-only por ahora.

import { useState } from 'react';
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
import { useCart } from '../../cart/CartProvider';
import { USER } from '../../data/user';
import type { Appointment } from '../../types';

type StatusFilter = 'all' | 'confirmed' | 'past' | 'pending';

interface UnifiedAppointment {
  id: string;
  status: 'confirmed' | 'past' | 'pending';
  date: string;
  time: string;
  artisanId: string;
  serviceIds: string[];
  total: number;
  duration: number;
}

export function AppointmentsSection() {
  const T = useTheme();
  const { lang } = useI18n();
  const { getArtisan, getService } = useCatalog();
  const cart = useCart();
  const [filter, setFilter] = useState<StatusFilter>('all');

  const all: UnifiedAppointment[] = [
    ...USER.appointments.map(
      (a: Appointment): UnifiedAppointment => ({
        id: a.id,
        status: a.status,
        date: a.date,
        time: a.time,
        artisanId: a.artisan,
        serviceIds: a.services,
        total: a.total,
        duration: a.duration,
      }),
    ),
    ...cart.pendingBookings.map(
      (b): UnifiedAppointment => ({
        id: b.id,
        status: 'pending',
        date: b.date,
        time: b.time,
        artisanId: b.artisanId,
        serviceIds: b.serviceIds,
        total: b.total,
        duration: b.duration,
      }),
    ),
  ];

  const filtered = filter === 'all' ? all : all.filter((a) => a.status === filter);
  const sorted = filtered.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const counts = {
    all: all.length,
    confirmed: all.filter((a) => a.status === 'confirmed').length,
    past: all.filter((a) => a.status === 'past').length,
    pending: all.filter((a) => a.status === 'pending').length,
  };

  const statusLabel = (s: UnifiedAppointment['status']) => {
    if (s === 'confirmed') return lang === 'es' ? 'Confirmada' : 'Confirmed';
    if (s === 'past') return lang === 'es' ? 'Pasada' : 'Past';
    return lang === 'es' ? 'Pendiente' : 'Pending';
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
            ? 'Vista global de reservas confirmadas, pasadas y pendientes en el cart de clientas.'
            : 'Global view of confirmed, past, and pending appointments in client carts.'}
        </Body>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {(['all', 'pending', 'confirmed', 'past'] as const).map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {lang === 'es'
              ? f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : f === 'confirmed' ? 'Confirmadas' : 'Pasadas'
              : f === 'all' ? 'All' : f === 'pending' ? 'Pending' : f === 'confirmed' ? 'Confirmed' : 'Past'}{' '}
            · {counts[f]}
          </Chip>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div
          style={{
            padding: 28,
            background: T.surface,
            boxShadow: `inset 0 0 0 1px ${T.line}`,
            textAlign: 'center',
          }}
        >
          <Body muted style={{ fontSize: 13 }}>
            {lang === 'es' ? 'Sin citas en esta categoría.' : 'No appointments in this category.'}
          </Body>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sorted.map((a) => {
            const ar = getArtisan(a.artisanId);
            const services = a.serviceIds
              .map(getService)
              .filter((s): s is NonNullable<ReturnType<typeof getService>> => !!s);
            return (
              <div
                key={a.id}
                style={{
                  background: T.surface,
                  boxShadow: `inset 0 0 0 1px ${a.status === 'pending' ? `${T.gold}55` : T.line}`,
                  padding: '16px 18px',
                  display: 'grid',
                  gridTemplateColumns: '140px 220px 1fr 100px 100px',
                  gap: 18,
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
                    {a.date}
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
                    {a.time}
                  </Tiny>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
                  {ar && (
                    <Img src={ar.photo} style={{ width: 36, height: 44, flexShrink: 0 }} />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <Body style={{ fontSize: 12, fontWeight: 500 }}>
                      {ar?.name ?? a.artisanId}
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
                      {a.duration} min
                    </Tiny>
                  </div>
                </div>
                <Body style={{ fontSize: 12, lineHeight: 1.4 }}>
                  {services.map((s) => (lang === 'es' ? s.es : s.en)).join(' + ')}
                </Body>
                <Tiny
                  style={{
                    fontSize: 10,
                    letterSpacing: 1.2,
                    color:
                      a.status === 'pending'
                        ? T.gold
                        : a.status === 'confirmed'
                          ? T.text
                          : T.textFaint,
                  }}
                >
                  {statusLabel(a.status).toUpperCase()}
                </Tiny>
                <H3
                  style={{
                    fontSize: 16,
                    color: T.gold,
                    fontStyle: 'italic',
                    textAlign: 'right',
                  }}
                >
                  €{a.total}
                </H3>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
