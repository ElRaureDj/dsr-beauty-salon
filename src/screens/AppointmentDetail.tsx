// DSR — Appointment detail screen.
// Vista de una cita confirmada o pasada. Permite reagendar (abre Booking
// con servicio + artista pre-cargados) o cancelar (mock — marca como
// past vía AppointmentsProvider).

import { useState } from 'react';
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
  Screen,
  Tiny,
} from '../components/atoms';
import { useAppointments } from '../data/AppointmentsProvider';
import { useCatalog } from '../data/CatalogProvider';
import { useRouter } from '../router/Router';

interface Props {
  id: string;
}

export function AppointmentDetail({ id }: Props) {
  const T = useTheme();
  const { t, lang } = useI18n();
  const { go } = useRouter();
  const { getById, cancel } = useAppointments();
  const { getArtisan, getService } = useCatalog();
  const [confirmingCancel, setConfirmingCancel] = useState(false);

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
      </div>

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
