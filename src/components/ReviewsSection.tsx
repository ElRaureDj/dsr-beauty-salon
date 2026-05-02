// DSR — Sección de reseñas para ServiceDetail / ArtisanProfile.
// Recibe el array ya filtrado y muestra hasta `limit` reviews ordenadas
// por fecha desc. Calcula el rating promedio cuando no se pasa explícito.

import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import { Body, Eyebrow, H3, Tiny } from './atoms/Typography';
import { Ico, Icons } from './atoms/Icon';
import type { Review } from '../types';

interface Props {
  reviews: Review[];
  /** Si se pasa, se usa en vez del promedio calculado (caso Artisan que ya guarda rating + reviews). */
  ratingOverride?: { avg: number; total: number };
  /** Cuántas mostrar antes del "ver todas". */
  limit?: number;
}

export function ReviewsSection({ reviews, ratingOverride, limit = 4 }: Props) {
  const T = useTheme();
  const { t, lang } = useI18n();

  const sorted = [...reviews].sort((a, b) => (a.date < b.date ? 1 : -1));
  const visible = sorted.slice(0, limit);

  const avg =
    ratingOverride?.avg ??
    (reviews.length === 0
      ? 0
      : reviews.reduce((a, r) => a + r.rating, 0) / reviews.length);
  const total = ratingOverride?.total ?? reviews.length;

  return (
    <div style={{ marginTop: 30 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <Eyebrow>{t('reviews')}</Eyebrow>
        {total > 0 && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Ico size={11} color={T.gold} stroke={2}>
              {Icons.star}
            </Ico>
            <Tiny
              style={{
                color: T.text,
                letterSpacing: 0.4,
                textTransform: 'none',
                fontSize: 11,
              }}
            >
              {avg.toFixed(2)} · {total}
            </Tiny>
          </div>
        )}
      </div>

      {visible.length === 0 ? (
        <div
          style={{
            padding: '20px 0',
            borderTop: `1px solid ${T.line}`,
          }}
        >
          <Tiny
            muted
            style={{ letterSpacing: 0.4, textTransform: 'none', fontSize: 12 }}
          >
            {t('noReviewsYet')}
          </Tiny>
        </div>
      ) : (
        visible.map((r, i) => (
          <ReviewCard key={r.id} review={r} first={i === 0} lang={lang} T={T} t={t} />
        ))
      )}

      {total > visible.length && (
        <div style={{ marginTop: 8, textAlign: 'center' }}>
          <Tiny
            style={{
              color: T.gold,
              letterSpacing: 1.2,
              fontSize: 10,
            }}
          >
            {t('seeAllReviews')} ({total})
          </Tiny>
        </div>
      )}
    </div>
  );
}

function ReviewCard({
  review,
  first,
  lang,
  T,
  t,
}: {
  review: Review;
  first: boolean;
  lang: 'es' | 'en';
  T: ReturnType<typeof useTheme>;
  t: ReturnType<typeof useI18n>['t'];
}) {
  const initials = review.customerName
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const dateLabel = new Date(review.date).toLocaleDateString(
    lang === 'es' ? 'es-ES' : 'en-US',
    { day: 'numeric', month: 'short', year: 'numeric' },
  );

  return (
    <div
      style={{
        padding: '18px 0',
        borderTop: first ? 'none' : `1px solid ${T.line}`,
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            background: T.surfaceHi,
            boxShadow: `inset 0 0 0 1px ${T.line}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontFamily: T.serif,
            fontStyle: 'italic',
            fontSize: 13,
            color: T.gold,
            fontWeight: 300,
          }}
        >
          {initials || '·'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <H3 style={{ fontSize: 14 }}>{review.customerName}</H3>
          <Tiny
            muted
            style={{
              marginTop: 2,
              fontSize: 10,
              letterSpacing: 0.3,
              textTransform: 'none',
            }}
          >
            {dateLabel}
          </Tiny>
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Ico
              key={n}
              size={10}
              color={n <= review.rating ? T.gold : T.lineStrong}
              stroke={1.6}
            >
              {Icons.star}
            </Ico>
          ))}
        </div>
      </div>

      <Body
        style={{
          marginTop: 10,
          fontSize: 13,
          lineHeight: 1.6,
          color: T.text,
        }}
      >
        {review.comment}
      </Body>

      {review.response && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            background: T.surface,
            boxShadow: `inset 0 0 0 1px ${T.line}`,
          }}
        >
          <Tiny
            style={{
              color: T.gold,
              letterSpacing: 1.4,
              fontSize: 9,
            }}
          >
            {t('salonResponse')}
            {review.responseDate
              ? ` · ${new Date(review.responseDate).toLocaleDateString(
                  lang === 'es' ? 'es-ES' : 'en-US',
                  { day: 'numeric', month: 'short' },
                )}`
              : ''}
          </Tiny>
          <Body
            style={{
              marginTop: 6,
              fontSize: 12,
              lineHeight: 1.55,
              color: T.textMuted,
            }}
          >
            {review.response}
          </Body>
        </div>
      )}
    </div>
  );
}
