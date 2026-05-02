// DSR Admin — Reseñas.
// Lista con filtros por estado de respuesta + responder inline.

import { useState } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/LangProvider';
import { Body, Btn, Chip, Eyebrow, H1, Ico, Icons, Tiny } from '../../components/atoms';
import { useCatalog } from '../../data/CatalogProvider';

type Filter = 'all' | 'pending' | 'responded' | 'low';

export function ReviewsSection() {
  const T = useTheme();
  const { lang } = useI18n();
  const { getReviews, respondToReview, getArtisan, getService } = useCatalog();
  const reviews = getReviews();
  const [filter, setFilter] = useState<Filter>('all');
  const [draftResponses, setDraftResponses] = useState<Record<string, string>>({});

  const counts = {
    all: reviews.length,
    pending: reviews.filter((r) => !r.response).length,
    responded: reviews.filter((r) => r.response).length,
    low: reviews.filter((r) => r.rating <= 3).length,
  };

  const filtered = reviews.filter((r) => {
    if (filter === 'pending') return !r.response;
    if (filter === 'responded') return !!r.response;
    if (filter === 'low') return r.rating <= 3;
    return true;
  });

  const avgRating =
    reviews.reduce((a, r) => a + r.rating, 0) / Math.max(1, reviews.length);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18, marginBottom: 24 }}>
        <div>
          <Eyebrow>{lang === 'es' ? 'Otros' : 'Other'}</Eyebrow>
          <H1 style={{ marginTop: 8, fontSize: 32, fontStyle: 'italic' }}>
            {lang === 'es' ? 'Reseñas' : 'Reviews'}
          </H1>
          <Body muted style={{ marginTop: 8, fontSize: 13, maxWidth: 540 }}>
            {lang === 'es'
              ? 'Feedback de clientes post-cita. Responde para mantener la conversación con la maison.'
              : 'Client post-appointment feedback. Respond to keep the maison conversation going.'}
          </Body>
        </div>
        <div
          style={{
            padding: '10px 14px',
            background: T.surface,
            boxShadow: `inset 0 0 0 1px ${T.line}`,
            display: 'flex',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <Tiny
            muted
            style={{
              fontFamily: T.mono,
              fontSize: 9,
              letterSpacing: 1.2,
            }}
          >
            {lang === 'es' ? 'PROMEDIO' : 'AVERAGE'}
          </Tiny>
          <span
            style={{
              fontFamily: T.serif,
              fontStyle: 'italic',
              fontSize: 22,
              color: T.gold,
            }}
          >
            {avgRating.toFixed(2)}
          </span>
          <Ico size={14} color={T.gold}>
            {Icons.star}
          </Ico>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {(['all', 'pending', 'responded', 'low'] as const).map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {lang === 'es'
              ? f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : f === 'responded' ? 'Respondidas' : 'Bajas (≤3)'
              : f === 'all' ? 'All' : f === 'pending' ? 'Pending' : f === 'responded' ? 'Responded' : 'Low (≤3)'}{' '}
            · {counts[f]}
          </Chip>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((r) => {
          const artisan = getArtisan(r.artisanId);
          const service = getService(r.serviceId);
          const draft = draftResponses[r.id] ?? '';
          return (
            <div
              key={r.id}
              style={{
                background: T.surface,
                boxShadow: `inset 0 0 0 1px ${r.rating <= 3 ? `${T.rouge}55` : T.line}`,
                padding: 20,
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 14,
                  marginBottom: 12,
                }}
              >
                <div>
                  <Body style={{ fontSize: 14, fontWeight: 500 }}>
                    {r.customerName}
                  </Body>
                  <Tiny
                    muted
                    style={{
                      marginTop: 4,
                      fontSize: 11,
                      letterSpacing: 0.3,
                      textTransform: 'none',
                    }}
                  >
                    {service ? (lang === 'es' ? service.es : service.en) : r.serviceId}
                    {artisan ? ` · ${lang === 'es' ? 'con' : 'with'} ${artisan.name}` : ''}
                    {' · '}
                    <span style={{ fontFamily: T.mono }}>{r.date}</span>
                  </Tiny>
                </div>
                <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Ico
                      key={n}
                      size={14}
                      color={n <= r.rating ? T.gold : T.lineStrong}
                      stroke={1.6}
                    >
                      {Icons.star}
                    </Ico>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <Body style={{ fontSize: 13, lineHeight: 1.55 }}>{r.comment}</Body>

              {/* Existing response or draft */}
              {r.response ? (
                <div
                  style={{
                    marginTop: 14,
                    padding: 14,
                    background: T.bgAlt,
                    boxShadow: `inset 0 0 0 1px ${T.gold}33`,
                    borderLeft: `2px solid ${T.gold}`,
                  }}
                >
                  <Tiny
                    style={{
                      color: T.gold,
                      fontFamily: T.serif,
                      fontStyle: 'italic',
                      fontSize: 11,
                      letterSpacing: 0.4,
                      textTransform: 'none',
                      marginBottom: 6,
                      display: 'block',
                    }}
                  >
                    {lang === 'es' ? 'Respuesta de la maison' : 'Maison response'} · {r.responseDate}
                  </Tiny>
                  <Body style={{ fontSize: 12, lineHeight: 1.5 }}>{r.response}</Body>
                </div>
              ) : (
                <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                  <textarea
                    value={draft}
                    onChange={(e) =>
                      setDraftResponses((p) => ({ ...p, [r.id]: e.target.value }))
                    }
                    placeholder={
                      lang === 'es'
                        ? 'Responder a esta reseña...'
                        : 'Reply to this review...'
                    }
                    rows={2}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      background: T.bgAlt,
                      border: 'none',
                      boxShadow: `inset 0 0 0 1px ${T.line}`,
                      color: T.text,
                      fontFamily: T.sans,
                      fontSize: 12,
                      outline: 'none',
                      resize: 'none',
                      lineHeight: 1.5,
                    }}
                  />
                  <Btn
                    onClick={() => {
                      if (draft.trim()) {
                        respondToReview(r.id, draft.trim());
                        setDraftResponses((p) => {
                          const n = { ...p };
                          delete n[r.id];
                          return n;
                        });
                      }
                    }}
                    fullWidth={false}
                    disabled={!draft.trim()}
                  >
                    {lang === 'es' ? 'Responder' : 'Reply'}
                  </Btn>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div
            style={{
              padding: 28,
              background: T.surface,
              boxShadow: `inset 0 0 0 1px ${T.line}`,
              textAlign: 'center',
            }}
          >
            <Body muted style={{ fontSize: 13 }}>
              {lang === 'es' ? 'Sin reseñas en esta categoría.' : 'No reviews in this category.'}
            </Body>
          </div>
        )}
      </div>
    </div>
  );
}
