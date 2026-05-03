// DSR Admin — Reportes (cross-user).
// KPIs reales sobre dos fuentes:
//   - pending_bookings (lo que está en bolsas, sin confirmar)
//   - appointments confirmed/completed (excluye cancelled)
// Reseñas y settings vienen de CatalogProvider (ya DB-backed).

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/LangProvider';
import { Body, Eyebrow, H1, H3, Tiny } from '../../components/atoms';
import { useCatalog } from '../../data/CatalogProvider';
import {
  fetchAllAppointmentsForAdmin,
  fetchAllPendingBookingsForAdmin,
  type AdminAppointmentRow,
  type AdminPendingBookingRow,
} from '../../lib/db';

interface UnifiedRow {
  userId: string;
  artisanId: string;
  serviceIds: string[];
  date: string;
  total: number;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

// Devuelve los últimos N meses (incluyendo el actual) como YYYY-MM, ordenados
// del más antiguo al más reciente.
function lastNMonths(n: number): string[] {
  const now = new Date();
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    out.push(ym);
  }
  return out;
}

function monthLabel(ym: string, lang: 'es' | 'en'): string {
  const [yy, mm] = ym.split('-');
  const d = new Date(Number(yy), Number(mm) - 1, 1);
  return d.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
    month: 'short',
    year: '2-digit',
  });
}

export function ReportsSection() {
  const T = useTheme();
  const { lang } = useI18n();
  const { getReviews, getAllArtisans, getAllServices, getSettings } = useCatalog();
  const settings = getSettings();
  const reviews = getReviews();
  const artisans = getAllArtisans();
  const services = getAllServices();

  const pendingsQ = useQuery({
    queryKey: ['admin-pending-bookings'],
    queryFn: fetchAllPendingBookingsForAdmin,
    initialData: [] as AdminPendingBookingRow[],
    initialDataUpdatedAt: 0,
    staleTime: 30_000,
  });
  const appointmentsQ = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: fetchAllAppointmentsForAdmin,
    initialData: [] as AdminAppointmentRow[],
    initialDataUpdatedAt: 0,
    staleTime: 30_000,
  });

  const isLoading = pendingsQ.isLoading || appointmentsQ.isLoading;
  const isError = pendingsQ.isError || appointmentsQ.isError;

  const today = todayISO();
  const all: UnifiedRow[] = useMemo(() => {
    const out: UnifiedRow[] = [];
    for (const p of pendingsQ.data ?? []) {
      out.push({
        userId: p.userId,
        artisanId: p.artisanId,
        serviceIds: p.serviceIds,
        date: p.date,
        total: p.total,
      });
    }
    for (const a of appointmentsQ.data ?? []) {
      // Excluimos cancelled — no representa revenue real.
      if (a.rawStatus === 'cancelled') continue;
      out.push({
        userId: a.userId,
        artisanId: a.artisan,
        serviceIds: a.services,
        date: a.date,
        total: a.total,
      });
    }
    return out;
  }, [pendingsQ.data, appointmentsQ.data]);

  // ─── KPIs ────────────────────────────────────────────────────────────
  const upcoming = all.filter((r) => r.date >= today);
  const past = all.filter((r) => r.date < today);

  const revenueUpcoming = upcoming.reduce((s, r) => s + r.total, 0);
  const revenuePast = past.reduce((s, r) => s + r.total, 0);
  const revenueTotal = revenueUpcoming + revenuePast;

  const avgTicket = all.length > 0 ? revenueTotal / all.length : 0;
  const uniqueClients = new Set(all.map((r) => r.userId)).size;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
      : 0;
  const lowRatingCount = reviews.filter((r) => r.rating <= 3).length;

  // Top artist por revenue (sólo entre los que tienen al menos 1 cita).
  const artistStats = useMemo(() => {
    const stats = artisans.map((ar) => {
      const ap = all.filter((b) => b.artisanId === ar.id);
      return {
        artisan: ar,
        count: ap.length,
        revenue: ap.reduce((s, b) => s + b.total, 0),
      };
    });
    return stats.filter((s) => s.count > 0).sort((a, b) => b.revenue - a.revenue);
  }, [artisans, all]);
  const topArtist = artistStats[0] ?? null;

  // Top services por count.
  const topServices = useMemo(() => {
    const stats = services.map((s) => ({
      service: s,
      count: all.filter((b) => b.serviceIds.includes(s.id)).length,
    }));
    return stats.filter((s) => s.count > 0).sort((a, b) => b.count - a.count).slice(0, 3);
  }, [services, all]);

  // Revenue por mes — últimos 6 meses.
  const months = useMemo(() => {
    const buckets = new Map<string, { count: number; revenue: number }>();
    for (const ym of lastNMonths(6)) {
      buckets.set(ym, { count: 0, revenue: 0 });
    }
    for (const b of all) {
      const ym = b.date.slice(0, 7);
      const cur = buckets.get(ym);
      if (!cur) continue; // fuera del rango de los últimos 6 meses
      cur.count += 1;
      cur.revenue += b.total;
    }
    return Array.from(buckets.entries()).map(([ym, v]) => ({ ym, ...v }));
  }, [all]);

  const maxMonthRevenue = months.reduce((m, x) => Math.max(m, x.revenue), 0);

  const cur =
    settings.currency === 'EUR' ? '€' : settings.currency === 'USD' ? '$' : settings.currency;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Eyebrow>{lang === 'es' ? 'Otros' : 'Other'}</Eyebrow>
        <H1 style={{ marginTop: 8, fontSize: 32, fontStyle: 'italic' }}>
          {lang === 'es' ? 'Reportes' : 'Reports'}
        </H1>
        <Body muted style={{ marginTop: 8, fontSize: 13, maxWidth: 540 }}>
          {lang === 'es'
            ? 'KPIs calculados sobre todas las reservas guardadas en el cart de las clientas. Excluye visitas pasadas no registradas y compras de productos.'
            : 'KPIs computed over all bookings saved in client carts. Excludes legacy past visits and product orders.'}
        </Body>
      </div>

      {isError && (
        <div
          style={{
            padding: 14,
            marginBottom: 16,
            background: T.surface,
            boxShadow: `inset 0 0 0 1px ${T.rouge}55`,
          }}
        >
          <Tiny style={{ color: T.rouge, letterSpacing: 0.3, textTransform: 'none' }}>
            {lang === 'es'
              ? 'No se pudieron cargar los datos de reservas.'
              : 'Could not load booking data.'}
          </Tiny>
        </div>
      )}

      {/* KPI cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 12,
          marginBottom: 28,
          opacity: isLoading && all.length === 0 ? 0.5 : 1,
        }}
      >
        <KPICard
          T={T}
          label={lang === 'es' ? 'Ingresos totales' : 'Total revenue'}
          value={`${cur}${revenueTotal}`}
          hint={`${past.length} ${lang === 'es' ? 'pasadas' : 'past'} + ${upcoming.length} ${lang === 'es' ? 'próximas' : 'upcoming'}`}
        />
        <KPICard
          T={T}
          label={lang === 'es' ? 'Ticket promedio' : 'Avg ticket'}
          value={`${cur}${Math.round(avgTicket)}`}
          hint={`${all.length} ${lang === 'es' ? 'reservas en total' : 'bookings total'}`}
        />
        <KPICard
          T={T}
          label={lang === 'es' ? 'Clientas únicas' : 'Unique clients'}
          value={uniqueClients.toLocaleString()}
          hint={
            lang === 'es'
              ? 'con al menos 1 reserva'
              : 'with at least 1 booking'
          }
        />
        <KPICard
          T={T}
          label={lang === 'es' ? 'Reseñas' : 'Reviews'}
          value={`${avgRating.toFixed(2)} ★`}
          hint={`${reviews.length} ${lang === 'es' ? 'totales' : 'total'} · ${lowRatingCount} ${lang === 'es' ? 'bajas' : 'low'}`}
          accent={lowRatingCount > 0 ? T.rouge : undefined}
        />
      </div>

      {/* Top artist + top services */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            background: T.surface,
            boxShadow: `inset 0 0 0 1px ${T.line}`,
            padding: 22,
          }}
        >
          <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2, display: 'block' }}>
            {lang === 'es' ? 'TOP ARTISTA' : 'TOP ARTISAN'}
          </Tiny>
          {!topArtist ? (
            <Body muted style={{ marginTop: 12, fontSize: 12 }}>
              {lang === 'es' ? 'Sin reservas todavía.' : 'No bookings yet.'}
            </Body>
          ) : (
            <div
              style={{
                marginTop: 12,
                display: 'flex',
                gap: 14,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 70,
                  background: T.bgAlt,
                  flexShrink: 0,
                  backgroundImage: `url(${topArtist.artisan.photo})`,
                  backgroundSize: 'cover',
                }}
              />
              <div style={{ flex: 1 }}>
                <H3 style={{ fontSize: 20 }}>{topArtist.artisan.name}</H3>
                <Tiny
                  muted
                  style={{
                    marginTop: 4,
                    fontSize: 11,
                    letterSpacing: 0.4,
                    textTransform: 'none',
                    fontStyle: 'italic',
                    fontFamily: T.serif,
                    color: T.gold,
                  }}
                >
                  {lang === 'es' ? topArtist.artisan.role_es : topArtist.artisan.role_en}
                </Tiny>
                <div
                  style={{
                    marginTop: 10,
                    display: 'flex',
                    gap: 18,
                  }}
                >
                  <div>
                    <Tiny muted style={{ fontSize: 9, letterSpacing: 1.2 }}>
                      {lang === 'es' ? 'CITAS' : 'APPTS'}
                    </Tiny>
                    <Body style={{ fontSize: 16, fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>
                      {topArtist.count}
                    </Body>
                  </div>
                  <div>
                    <Tiny muted style={{ fontSize: 9, letterSpacing: 1.2 }}>
                      {lang === 'es' ? 'INGRESOS' : 'REVENUE'}
                    </Tiny>
                    <Body style={{ fontSize: 16, fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>
                      {cur}{topArtist.revenue}
                    </Body>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            background: T.surface,
            boxShadow: `inset 0 0 0 1px ${T.line}`,
            padding: 22,
          }}
        >
          <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2, display: 'block' }}>
            {lang === 'es' ? 'TOP SERVICIOS' : 'TOP SERVICES'}
          </Tiny>
          {topServices.length === 0 ? (
            <Body muted style={{ marginTop: 12, fontSize: 12 }}>
              {lang === 'es' ? 'Sin datos suficientes.' : 'Not enough data.'}
            </Body>
          ) : (
            <div style={{ marginTop: 14 }}>
              {topServices.map((ts, i) => (
                <div
                  key={ts.service.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    padding: '10px 0',
                    borderTop: i === 0 ? 'none' : `1px solid ${T.line}`,
                  }}
                >
                  <Body style={{ fontSize: 13 }}>
                    <span
                      style={{
                        marginRight: 10,
                        color: T.gold,
                        fontFamily: T.serif,
                        fontStyle: 'italic',
                      }}
                    >
                      {i + 1}.
                    </span>
                    {lang === 'es' ? ts.service.es : ts.service.en}
                  </Body>
                  <Tiny
                    style={{
                      fontFamily: T.mono,
                      fontSize: 12,
                      color: T.gold,
                      textTransform: 'none',
                    }}
                  >
                    {ts.count} {lang === 'es' ? 'citas' : 'appts'}
                  </Tiny>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cohorte mensual: revenue por mes (últimos 6) */}
      <div
        style={{
          background: T.surface,
          boxShadow: `inset 0 0 0 1px ${T.line}`,
          padding: 22,
          marginBottom: 28,
        }}
      >
        <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2, display: 'block' }}>
          {lang === 'es' ? 'INGRESOS POR MES' : 'REVENUE BY MONTH'}
        </Tiny>
        {maxMonthRevenue === 0 ? (
          <Body muted style={{ marginTop: 12, fontSize: 12 }}>
            {lang === 'es' ? 'Sin datos en los últimos 6 meses.' : 'No data in the last 6 months.'}
          </Body>
        ) : (
          <div
            style={{
              marginTop: 18,
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: 10,
              alignItems: 'end',
              minHeight: 120,
            }}
          >
            {months.map((m) => {
              const h = maxMonthRevenue > 0 ? (m.revenue / maxMonthRevenue) * 100 : 0;
              return (
                <div
                  key={m.ym}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <div style={{ width: '100%', height: 80, display: 'flex', alignItems: 'flex-end' }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${h}%`,
                        minHeight: m.revenue > 0 ? 4 : 0,
                        background: `linear-gradient(180deg, ${T.gold}, ${T.goldDeep})`,
                        transition: 'height 0.4s ease',
                      }}
                    />
                  </div>
                  <Tiny
                    style={{
                      fontSize: 9,
                      letterSpacing: 0.3,
                      textTransform: 'none',
                      color: T.textMuted,
                    }}
                  >
                    {monthLabel(m.ym, lang)}
                  </Tiny>
                  <Tiny
                    style={{
                      fontFamily: T.mono,
                      fontSize: 10,
                      color: m.revenue > 0 ? T.gold : T.textFaint,
                      textTransform: 'none',
                      letterSpacing: 0.3,
                    }}
                  >
                    {cur}{m.revenue}
                  </Tiny>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function KPICard({
  T,
  label,
  value,
  hint,
  accent,
}: {
  T: ReturnType<typeof useTheme>;
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: T.surface,
        boxShadow: `inset 0 0 0 1px ${accent ?? T.line}`,
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Tiny
        muted
        style={{
          fontFamily: T.mono,
          fontSize: 9,
          letterSpacing: 1.2,
          display: 'block',
        }}
      >
        {label.toUpperCase()}
      </Tiny>
      <div
        style={{
          fontFamily: T.serif,
          fontStyle: 'italic',
          fontSize: 32,
          marginTop: 6,
          color: accent ?? T.gold,
          fontWeight: 300,
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {hint && (
        <Tiny
          muted
          style={{
            marginTop: 6,
            fontSize: 10,
            letterSpacing: 0.3,
            textTransform: 'none',
            display: 'block',
          }}
        >
          {hint}
        </Tiny>
      )}
    </div>
  );
}
