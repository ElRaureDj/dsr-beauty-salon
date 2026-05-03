// DSR — Appointment detail screen.
// Vista de una cita confirmada o pasada. Permite reagendar (abre Booking
// con servicio + artista pre-cargados) o cancelar (mock — marca como
// past vía AppointmentsProvider). En citas pasadas, si el user está
// signed in, puede dejar una reseña por el primer servicio (modal).

import { useMemo, useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import {
  Body,
  Btn,
  Divider,
  Eyebrow,
  H1,
  H3,
  HeaderBar,
  Ico,
  Icons,
  Img,
  Numeral,
  RateStars,
  Screen,
  Tiny,
} from '../components/atoms';
import { useAppointments } from '../data/AppointmentsProvider';
import { useCatalog } from '../data/CatalogProvider';
import { useUser } from '../data/UserProvider';
import { useUserData } from '../data/useUserData';
import { useRouter } from '../router/Router';
import type { Review } from '../types';

interface Props {
  id: string;
}

export function AppointmentDetail({ id }: Props) {
  const T = useTheme();
  const { t, lang } = useI18n();
  const { go } = useRouter();
  const { getById, cancel } = useAppointments();
  const { getArtisan, getService, getReviews, createReview } = useCatalog();
  const { session } = useUser();
  const userData = useUserData();
  const userId = session?.user?.id ?? null;
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const appt = getById(id);

  if (!appt) {
    return (
      <Screen padTop={0} padBottom={40}>
        <HeaderBar onBack={() => go('home')} title={t('appointmentTitle')} />
        <div
          style={{
            padding: '160px 36px 0',
            textAlign: 'center',
          }}
        >
          <Body muted style={{ fontSize: 14 }}>
            {t('appointmentNotFound')}
          </Body>
          <Btn onClick={() => go('home')} fullWidth={false} style={{ marginTop: 24 }}>
            {t('appointmentBackHome')}
          </Btn>
        </div>
      </Screen>
    );
  }

  const ar = getArtisan(appt.artisan);
  const services = appt.services
    .map(getService)
    .filter((s): s is NonNullable<ReturnType<typeof getService>> => !!s);
  const isPast = appt.status === 'past';

  const dateLabel = new Date(appt.date).toLocaleDateString(
    lang === 'es' ? 'es-ES' : 'en-US',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  );

  const handleReschedule = () => {
    go('book', {
      service: appt.services[0],
      artisan: appt.artisan,
    });
  };

  const handleCancel = () => {
    if (!confirmingCancel) {
      setConfirmingCancel(true);
      return;
    }
    cancel(appt.id);
    go('home');
  };

  // Reseñable solo el primer servicio del appointment (multi-service review
  // sería un flow más grande). Buscamos si ya existe una review del cliente
  // actual para este (artisan, service).
  const reviewableServiceId = appt.services[0] ?? null;
  const existingReview = useMemo<Review | null>(() => {
    if (!userId || !reviewableServiceId) return null;
    return (
      getReviews().find(
        (r) =>
          r.userId === userId &&
          r.artisanId === appt.artisan &&
          r.serviceId === reviewableServiceId,
      ) ?? null
    );
  }, [userId, reviewableServiceId, appt.artisan, getReviews]);

  return (
    <Screen padTop={0} padBottom={isPast ? 40 : 140}>
      <HeaderBar onBack={() => go('home')} title={t('appointmentTitle')} />

      <div style={{ padding: '108px 22px 0' }}>
        <Numeral value="·" style={{ fontSize: 14 }} />
        <H1 style={{ fontSize: 32, marginTop: 6 }}>
          {t('appointmentTitle')}
        </H1>
        {isPast && (
          <div
            style={{
              marginTop: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              background: T.surface,
              boxShadow: `inset 0 0 0 1px ${T.lineStrong}`,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: 999,
                background: T.textFaint,
              }}
            />
            <Tiny
              style={{
                color: T.textMuted,
                letterSpacing: 1.4,
                fontSize: 10,
              }}
            >
              {t('appointmentPastBadge')}
            </Tiny>
          </div>
        )}

        {ar && (
          <div
            style={{
              marginTop: 28,
              padding: 22,
              background: T.surface,
              boxShadow: `inset 0 0 0 1px ${T.line}`,
            }}
          >
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <Img
                src={ar.photo}
                style={{ width: 56, height: 56, borderRadius: 999 }}
              />
              <div>
                <Tiny
                  style={{ color: T.gold, letterSpacing: 0.4, textTransform: 'none' }}
                >
                  {lang === 'es' ? 'con' : 'with'}
                </Tiny>
                <H3 style={{ fontSize: 19, marginTop: 2 }}>{ar.name}</H3>
              </div>
            </div>

            <Divider style={{ margin: '20px 0' }} />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <Tiny muted style={{ letterSpacing: 0.4, textTransform: 'none' }}>
                {lang === 'es' ? 'Cuándo' : 'When'}
              </Tiny>
              <Tiny
                style={{
                  letterSpacing: 0.4,
                  textTransform: 'none',
                  textAlign: 'right',
                }}
              >
                {dateLabel}
                <br />
                <span style={{ color: T.gold }}>{appt.time}</span>
              </Tiny>
            </div>

            <Divider />

            <div style={{ marginTop: 14 }}>
              <Tiny
                muted
                style={{
                  letterSpacing: 0.4,
                  textTransform: 'none',
                  marginBottom: 10,
                }}
              >
                {lang === 'es' ? 'Servicios' : 'Services'}
              </Tiny>
              {services.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                  }}
                >
                  <Body style={{ fontSize: 13 }}>
                    {lang === 'es' ? s.es : s.en}
                  </Body>
                  <Body style={{ fontSize: 13 }}>€{s.price}</Body>
                </div>
              ))}
            </div>

            <Divider style={{ margin: '14px 0' }} />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <Body style={{ fontWeight: 500 }}>Total</Body>
              <H3 style={{ color: T.gold, fontStyle: 'italic' }}>
                €{appt.total}
              </H3>
            </div>
            <Tiny
              muted
              style={{
                marginTop: 6,
                letterSpacing: 0.4,
                textTransform: 'none',
                textAlign: 'right',
                fontSize: 11,
              }}
            >
              {appt.duration} min
            </Tiny>
          </div>
        )}

        {appt.notes_es && (
          <div style={{ marginTop: 22 }}>
            <Eyebrow>{lang === 'es' ? 'Notas' : 'Notes'}</Eyebrow>
            <Body
              style={{
                marginTop: 10,
                fontSize: 13,
                lineHeight: 1.6,
                fontStyle: 'italic',
                fontFamily: T.serif,
                color: T.textMuted,
              }}
            >
              "{appt.notes_es}"
            </Body>
          </div>
        )}

        {/* Reseña — sólo en citas pasadas. */}
        {isPast && reviewableServiceId && (
          <div style={{ marginTop: 28 }}>
            {existingReview ? (
              <ExistingReviewCard review={existingReview} T={T} t={t} />
            ) : userId ? (
              <button
                onClick={() => setReviewOpen(true)}
                className="dsr-press"
                style={{
                  width: '100%',
                  padding: '16px 18px',
                  background: T.surface,
                  boxShadow: `inset 0 0 0 1px ${T.gold}55`,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Ico size={16} color={T.gold}>
                  {Icons.star}
                </Ico>
                <Body
                  style={{
                    flex: 1,
                    textAlign: 'left',
                    fontSize: 13,
                    fontWeight: 500,
                    color: T.gold,
                    letterSpacing: 0.4,
                  }}
                >
                  {t('reviewLeaveCta')}
                </Body>
                <Ico size={14} color={T.gold}>
                  {Icons.arrow}
                </Ico>
              </button>
            ) : (
              <Tiny
                muted
                style={{
                  fontSize: 11,
                  letterSpacing: 0.4,
                  textTransform: 'none',
                  fontStyle: 'italic',
                }}
              >
                {t('reviewSignInRequired')}
              </Tiny>
            )}
          </div>
        )}
      </div>

      {/* Review modal */}
      {reviewOpen && reviewableServiceId && userId && (
        <ReviewModal
          onClose={() => setReviewOpen(false)}
          onSubmit={async (rating, comment) => {
            await createReview({
              userId,
              customerName: userData.fullName,
              artisanId: appt.artisan,
              serviceId: reviewableServiceId,
              rating,
              comment,
            });
          }}
          T={T}
          t={t}
        />
      )}

      {/* Sticky CTAs — solo cuando la cita es próxima (no past). */}
      {!isPast && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '14px 22px 36px',
            background: `linear-gradient(180deg, transparent, ${T.bg} 30%)`,
            zIndex: 30,
          }}
        >
          <Btn onClick={handleReschedule}>
            <Ico size={14} color={T.bg}>
              {Icons.edit}
            </Ico>
            {t('appointmentReschedule')}
          </Btn>
          <button
            onClick={handleCancel}
            className="dsr-press"
            style={{
              width: '100%',
              marginTop: 14,
              background: 'transparent',
              border: 'none',
              padding: '12px 0',
              cursor: 'pointer',
              color: confirmingCancel ? T.gold : T.textMuted,
              fontFamily: T.sans,
              fontSize: 11,
              letterSpacing: 1.4,
              textTransform: 'uppercase',
              fontWeight: 500,
              transition: 'color .2s',
            }}
          >
            {confirmingCancel
              ? lang === 'es'
                ? '¿Cancelar la cita? Toca de nuevo para confirmar'
                : 'Cancel this appointment? Tap again to confirm'
              : t('appointmentCancel')}
          </button>
        </div>
      )}
    </Screen>
  );
}

function ExistingReviewCard({
  review,
  T,
  t,
}: {
  review: Review;
  T: ReturnType<typeof useTheme>;
  t: (key: 'reviewYoursBadge') => string;
}) {
  return (
    <div
      style={{
        padding: 18,
        background: T.surface,
        boxShadow: `inset 0 0 0 1px ${T.gold}33`,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Tiny
          style={{
            color: T.gold,
            letterSpacing: 1.4,
            fontSize: 10,
          }}
        >
          {t('reviewYoursBadge').toUpperCase()}
        </Tiny>
        <RateStars value={review.rating} onChange={() => {}} size={14} readonly />
      </div>
      {review.comment && (
        <Body
          style={{
            fontSize: 13,
            lineHeight: 1.6,
            fontStyle: 'italic',
            fontFamily: T.serif,
            color: T.textMuted,
          }}
        >
          "{review.comment}"
        </Body>
      )}
      {review.response && (
        <div
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: `1px solid ${T.line}`,
          }}
        >
          <Tiny
            muted
            style={{
              fontSize: 9,
              letterSpacing: 1.2,
              marginBottom: 6,
              display: 'block',
            }}
          >
            DSR
          </Tiny>
          <Body style={{ fontSize: 12, lineHeight: 1.5, color: T.text }}>
            {review.response}
          </Body>
        </div>
      )}
    </div>
  );
}

function ReviewModal({
  onClose,
  onSubmit,
  T,
  t,
}: {
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  T: ReturnType<typeof useTheme>;
  t: (
    key:
      | 'reviewModalTitle'
      | 'reviewModalSub'
      | 'reviewRatingLabel'
      | 'reviewCommentLabel'
      | 'reviewCommentPlaceholder'
      | 'reviewSubmit'
      | 'reviewSubmitting'
      | 'reviewCancel'
      | 'reviewErrorDuplicate'
      | 'reviewErrorGeneric',
  ) => string;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (rating < 1 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(rating, comment.trim());
      onClose();
    } catch (err) {
      // Postgres unique violation = code 23505. Mensaje user-facing.
      const code = (err as { code?: string })?.code;
      setError(code === '23505' ? t('reviewErrorDuplicate') : t('reviewErrorGeneric'));
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 22,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          width: '100%',
          maxWidth: 400,
          background: T.bg,
          boxShadow: `inset 0 0 0 1px ${T.gold}33, 0 30px 80px rgba(0,0,0,0.5)`,
          padding: '28px 24px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div>
          <H3 style={{ fontSize: 22, fontStyle: 'italic', color: T.text }}>
            {t('reviewModalTitle')}
          </H3>
          <Body
            muted
            style={{ marginTop: 6, fontSize: 12, lineHeight: 1.5 }}
          >
            {t('reviewModalSub')}
          </Body>
        </div>

        <div>
          <Tiny
            muted
            style={{
              fontSize: 9,
              letterSpacing: 1.4,
              display: 'block',
              marginBottom: 10,
            }}
          >
            {t('reviewRatingLabel').toUpperCase()}
          </Tiny>
          <RateStars value={rating} onChange={setRating} size={32} />
        </div>

        <div>
          <Tiny
            muted
            style={{
              fontSize: 9,
              letterSpacing: 1.4,
              display: 'block',
              marginBottom: 8,
            }}
          >
            {t('reviewCommentLabel').toUpperCase()}
          </Tiny>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('reviewCommentPlaceholder')}
            maxLength={500}
            rows={4}
            style={{
              width: '100%',
              padding: 12,
              background: T.surface,
              border: 'none',
              boxShadow: `inset 0 0 0 1px ${T.line}`,
              color: T.text,
              fontFamily: T.sans,
              fontSize: 13,
              lineHeight: 1.5,
              resize: 'none',
              outline: 'none',
            }}
          />
        </div>

        {error && (
          <Tiny
            style={{
              color: T.gold,
              fontSize: 11,
              letterSpacing: 0.3,
              textTransform: 'none',
              lineHeight: 1.4,
            }}
          >
            {error}
          </Tiny>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            onClick={onClose}
            disabled={submitting}
            className="dsr-press"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              padding: '14px 0',
              boxShadow: `inset 0 0 0 1px ${T.line}`,
              cursor: submitting ? 'default' : 'pointer',
              color: T.textMuted,
              fontFamily: T.sans,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 1.4,
              textTransform: 'uppercase',
            }}
          >
            {t('reviewCancel')}
          </button>
          <button
            onClick={submit}
            disabled={rating < 1 || submitting}
            className="dsr-press"
            style={{
              flex: 2,
              background: rating < 1 || submitting ? T.surface : T.gold,
              border: 'none',
              padding: '14px 0',
              cursor: rating < 1 || submitting ? 'default' : 'pointer',
              color: rating < 1 || submitting ? T.textFaint : T.bg,
              fontFamily: T.sans,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 1.4,
              textTransform: 'uppercase',
              transition: 'background .15s, color .15s',
            }}
          >
            {submitting ? t('reviewSubmitting') : t('reviewSubmit')}
          </button>
        </div>
      </div>
    </div>
  );
}
