// DSR Admin — Reportes.
// KPIs computados de los datos existentes (USER.appointments + reviews + cart).

import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/LangProvider';
import { Body, Eyebrow, H1, H3, Ico, Icons, Tiny } from '../../components/atoms';
import { useCatalog } from '../../data/CatalogProvider';
import { useCart } from '../../cart/CartProvider';
import { USER } from '../../data/user';

export function ReportsSection() {
  const T = useTheme();
  const { lang } = useI18n();
  const { getReviews, getAllArtisans, getAllServices, getSettings } = useCatalog();
  const cart = useCart();
  const settings = getSettings();
  const reviews = getReviews();
  const artisans = getAllArtisans();
  const services = getAllServices();

  // ─── KPIs ────────────────────────────────────────────────────────────
  const allAppointments = USER.appointments;
  const past = allAppointments.filter((a) => a.status === 'past');
  const confirmed = allAppointments.filter((a) => a.status === 'confirmed');
  const pending = cart.pendingBookings;

  const revenuePast = past.reduce((s, a) => s + a.total, 0);
  const revenueConfirmed = confirmed.reduce((s, a) => s + a.total, 0);
  const revenuePending = pending.reduce((s, a) => s + a.total, 0);
  const revenueTotal = revenuePast + revenueConfirmed + revenuePending;

  const avgTicket = past.length > 0 ? revenuePast / past.length : 0;
  const avgRating =
    reviews.reduce((a, r) => a + r.rating, 0) / Math.max(1, reviews.length);
  const lowRatingCount = reviews.filter((r) => r.rating <= 3).length;

  // Top artist by appointments + revenue
  const artistStats = artisans.map((ar) => {
    const ap = allAppointments.filter((x) => x.artisan === ar.id);
    return {
      artisan: ar,
      count: ap.length,
      revenue: ap.reduce((s, a) => s + a.total, 0),
    };
  });
  const topArtist = artistStats.sort((a, b) => b.revenue - a.revenue)[0];

  // Top service by appointments
  const serviceStats = services.map((s) => {
    const count = allAppointments.filter((a) => a.services.includes(s.id)).length;
    return { service: s, count };
  });
  const topServices = serviceStats.filter((s) => s.count > 0).sort((a, b) => b.count - a.count).slice(0, 3);

  const cur = settings.currency === 'EUR' ? '€' : settings.currency === 'USD' ? '$' : settings.currency;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Eyebrow>{lang === 'es' ? 'Otros' : 'Other'}</Eyebrow>
        <H1 style={{ marginTop: 8, fontSize: 32, fontStyle: 'italic' }}>
          {lang === 'es' ? 'Reportes' : 'Reports'}
        </H1>
        <Body muted style={{ marginTop: 8, fontSize: 13, maxWidth: 540 }}>
          {lang === 'es'
            ? 'KPIs del salón calculados sobre el periodo visible. Demo — datos limitados a la cuenta actual.'
            : 'Salon KPIs computed over the visible period. Demo — data limited to the current account.'}
        </Body>
      </div>

      {/* KPI cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 12,
          marginBottom: 28,
        }}
      >
        <KPICard
          T={T}
          label={lang === 'es' ? 'Ingresos totales' : 'Total revenue'}
          value={`${cur}${revenueTotal}`}
          hint={`${past.length} ${lang === 'es' ? 'pasadas' : 'past'} + ${confirmed.length} ${lang === 'es' ? 'confirmadas' : 'confirmed'} + ${pending.length} ${lang === 'es' ? 'en cart' : 'in cart'}`}
        />
        <KPICard
          T={T}
          label={lang === 'es' ? 'Ticket promedio' : 'Avg ticket'}
          value={`${cur}${Math.round(avgTicket)}`}
          hint={`${past.length} ${lang === 'es' ? 'visitas pasadas' : 'past visits'}`}
        />
        <KPICard
          T={T}
          label={lang === 'es' ? 'Reseñas' : 'Reviews'}
          value={`${avgRating.toFixed(2)} ★`}
          hint={`${reviews.length} ${lang === 'es' ? 'totales' : 'total'} · ${lowRatingCount} ${lang === 'es' ? 'bajas' : 'low'}`}
          accent={lowRatingCount > 0 ? T.rouge : undefined}
        />
        <KPICard
          T={T}
          label={lang === 'es' ? 'Tier de la cuenta' : 'Account tier'}
          value={USER.points.toLocaleString()}
          hint={`${lang === 'es' ? 'puntos · visitas' : 'points · visits'}: ${USER.visits}`}
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
        {topArtist && (
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
          </div>
        )}

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

      {/* Notice */}
      <div
        style={{
          padding: 18,
          background: `${T.gold}11`,
          boxShadow: `inset 0 0 0 1px ${T.gold}33`,
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
        }}
      >
        <Ico size={14} color={T.gold} stroke={1.4}>
          {Icons.sparkle}
        </Ico>
        <Tiny
          style={{
            fontSize: 12,
            letterSpacing: 0.3,
            textTransform: 'none',
            color: T.textMuted,
            lineHeight: 1.5,
          }}
        >
          {lang === 'es'
            ? 'Demo: KPIs calculados sobre la cuenta de Camila + cart actual. En producción se computan sobre todas las clientas con cohortes mensuales y exports a CSV.'
            : 'Demo: KPIs computed over Camila\'s account + current cart. In production they\'d span all customers with monthly cohorts and CSV exports.'}
        </Tiny>
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
