// DSR — Profile (avatar · upcoming/past appointments · settings list)
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import {
  Body,
  Eyebrow,
  H2,
  Ico,
  Icons,
  Img,
  Screen,
  Tiny,
} from '../components/atoms';
import { findArtisan, findService, tierFor } from '../data/helpers';
import { USER } from '../data/user';

export function Profile() {
  const T = useTheme();
  const { t, lang, setLang } = useI18n();
  const tier = tierFor(USER.points);
  const upcoming = USER.appointments.filter((a) => a.status === 'confirmed');
  const past = USER.appointments.filter((a) => a.status === 'past');

  const settings: { es: string; en: string; onClick?: () => void }[] = [
    { es: 'Información personal', en: 'Personal info' },
    { es: 'Favoritos', en: 'Favorites' },
    { es: 'Métodos de pago', en: 'Payment methods' },
    { es: 'Notificaciones', en: 'Notifications' },
    {
      es: 'Idioma · Español',
      en: 'Language · English',
      onClick: () => setLang(lang === 'es' ? 'en' : 'es'),
    },
    { es: 'Cerrar sesión', en: 'Sign out' },
  ];

  return (
    <Screen padTop={0} padBottom={120}>
      <div style={{ padding: '74px 22px 0' }}>
        <Eyebrow>{t('profile')}</Eyebrow>
        <div
          style={{
            marginTop: 16,
            display: 'flex',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              background: `linear-gradient(135deg, ${T.gold}, ${T.goldDeep})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: T.serif,
              fontSize: 26,
              fontStyle: 'italic',
              color: '#0A0908',
              fontWeight: 400,
            }}
          >
            {USER.name[0]}
          </div>
          <div>
            <H2 style={{ fontSize: 26 }}>{USER.fullName}</H2>
            <Tiny
              style={{
                color: T.gold,
                marginTop: 4,
                letterSpacing: 0.4,
                textTransform: 'none',
                fontSize: 11,
              }}
            >
              {tier.name[lang]} · {USER.points.toLocaleString()} {t('points')}
            </Tiny>
          </div>
        </div>
      </div>

      {/* Upcoming */}
      <div style={{ padding: '32px 22px 0' }}>
        <Eyebrow>{t('upcoming')}</Eyebrow>
        <div style={{ marginTop: 14 }}>
          {upcoming.map((apt) => {
            const ar = findArtisan(apt.artisan);
            if (!ar) return null;
            return (
              <div
                key={apt.id}
                style={{
                  background: T.surface,
                  padding: 18,
                  marginBottom: 10,
                  boxShadow: `inset 0 0 0 1px ${T.gold}33`,
                  position: 'relative',
                }}
              >
                <Tiny
                  style={{ color: T.gold, letterSpacing: 1.4, fontSize: 10 }}
                >
                  {new Date(apt.date)
                    .toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })
                    .toUpperCase()}{' '}
                  · {apt.time}
                </Tiny>
                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    marginTop: 12,
                  }}
                >
                  <Img
                    src={ar.photo}
                    style={{ width: 40, height: 40, borderRadius: 999, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Body style={{ fontSize: 14, fontWeight: 500 }}>
                      {apt.services
                        .map((sid) => {
                          const s = findService(sid);
                          if (!s) return sid;
                          return lang === 'es' ? s.es : s.en;
                        })
                        .join(' + ')}
                    </Body>
                    <Tiny
                      muted
                      style={{
                        marginTop: 2,
                        fontSize: 11,
                        letterSpacing: 0.3,
                        textTransform: 'none',
                      }}
                    >
                      {lang === 'es' ? 'con' : 'with'} {ar.name} · €{apt.total}
                    </Tiny>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Past */}
        <div style={{ marginTop: 28 }}>
          <Eyebrow>{t('past')}</Eyebrow>
          <div style={{ marginTop: 14 }}>
            {past.map((apt, i) => {
              const ar = findArtisan(apt.artisan);
              if (!ar) return null;
              return (
                <div
                  key={apt.id}
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    padding: '14px 0',
                    borderTop: i === 0 ? 'none' : `1px solid ${T.line}`,
                    opacity: 0.7,
                  }}
                >
                  <Img
                    src={ar.photo}
                    style={{ width: 36, height: 36, borderRadius: 999, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Body style={{ fontSize: 13 }}>
                      {apt.services
                        .map((sid) => {
                          const s = findService(sid);
                          if (!s) return sid;
                          return lang === 'es' ? s.es : s.en;
                        })
                        .join(' + ')}
                    </Body>
                    <Tiny
                      muted
                      style={{
                        marginTop: 2,
                        fontSize: 10,
                        letterSpacing: 0.3,
                        textTransform: 'none',
                      }}
                    >
                      {new Date(apt.date).toLocaleDateString(
                        lang === 'es' ? 'es-ES' : 'en-US',
                        { day: 'numeric', month: 'short', year: 'numeric' },
                      )}{' '}
                      · €{apt.total}
                    </Tiny>
                  </div>
                  <Tiny
                    style={{ color: T.gold, fontSize: 10, letterSpacing: 1.2 }}
                  >
                    {t('rebook').toUpperCase()}
                  </Tiny>
                </div>
              );
            })}
          </div>
        </div>

        {/* Settings */}
        <div style={{ marginTop: 32 }}>
          <Eyebrow>{lang === 'es' ? 'Preferencias' : 'Preferences'}</Eyebrow>
          <div style={{ marginTop: 14 }}>
            {settings.map((it, i) => (
              <div
                key={i}
                onClick={it.onClick}
                className="dsr-press"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 0',
                  borderTop: i === 0 ? 'none' : `1px solid ${T.line}`,
                  cursor: 'pointer',
                }}
              >
                <Body style={{ fontSize: 14 }}>{lang === 'es' ? it.es : it.en}</Body>
                <Ico size={12} color={T.textMuted}>
                  {Icons.chev}
                </Ico>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Screen>
  );
}
