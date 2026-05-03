// DSR — Profile (avatar · upcoming/past appointments · settings list)
import { useEffect, useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import {
  AvatarPicker,
  Body,
  Eyebrow,
  H2,
  HeaderBar,
  Ico,
  Icons,
  Img,
  Screen,
  Tiny,
} from '../components/atoms';
import { tierFor } from '../data/helpers';
import { useCatalog } from '../data/CatalogProvider';
import { useAppointments } from '../data/AppointmentsProvider';
import { useRouter } from '../router/Router';
import { useUser } from '../data/UserProvider';
import { useUserData } from '../data/useUserData';

export function Profile() {
  const T = useTheme();
  const { t, lang, setLang } = useI18n();
  const { go } = useRouter();
  const { getArtisan, getService } = useCatalog();
  const { appointments } = useAppointments();
  const { avatar, signOut, isAdmin } = useUser();
  const user = useUserData();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  useEffect(() => {
    setAvatarFailed(false);
  }, [avatar]);
  const showAvatarImg = !!avatar && !avatarFailed;
  const tier = tierFor(user.points);
  const upcoming = appointments.filter((a) => a.status === 'confirmed');
  const past = appointments.filter((a) => a.status === 'past');

  const handleResetOnboarding = () => {
    try {
      window.localStorage.removeItem('dsr-onboarding-seen');
    } catch {
      /* ignore */
    }
    go('onboarding');
  };

  const themeLabel = T.name === 'noir' ? 'Noir Couture' : 'Marbre Doré';
  const settings: {
    es: string;
    en: string;
    onClick?: () => void;
    badge?: { es: string; en: string };
  }[] = [
    {
      es: 'Información personal',
      en: 'Personal info',
      onClick: () => go('personal-info'),
    },
    {
      es: 'Direcciones de envío',
      en: 'Shipping addresses',
      onClick: () => go('addresses'),
    },
    { es: 'Favoritos', en: 'Favorites' },
    {
      es: 'Métodos de pago',
      en: 'Payment methods',
      badge: { es: 'Próximamente', en: 'Coming soon' },
    },
    { es: 'Notificaciones', en: 'Notifications' },
    {
      es: `Tema · ${themeLabel}`,
      en: `Theme · ${themeLabel}`,
      onClick: T.toggleTheme,
    },
    {
      es: 'Idioma · Español',
      en: 'Language · English',
      onClick: () => setLang(lang === 'es' ? 'en' : 'es'),
    },
    {
      es: 'Ver bienvenida de nuevo',
      en: 'Replay welcome',
      onClick: handleResetOnboarding,
    },
    {
      es: 'Información legal',
      en: 'Legal info',
      onClick: () => go('legal'),
    },
    // El item de admin solo aparece si el profile tiene is_admin = true.
    ...(isAdmin
      ? [
          {
            es: 'Modo administrador',
            en: 'Admin mode',
            onClick: () => go('admin'),
          },
        ]
      : []),
    {
      es: 'Cerrar sesión',
      en: 'Sign out',
      onClick: () => {
        void signOut().then(() => go('auth'));
      },
    },
  ];

  return (
    <>
      <Screen padTop={0} padBottom={120}>
      <HeaderBar onBack={() => go('home')} title={t('profile')} />
      <div style={{ padding: '108px 22px 0' }}>
        <Eyebrow>{t('profile')}</Eyebrow>
        <div
          style={{
            marginTop: 16,
            display: 'flex',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => setPickerOpen(true)}
            aria-label={t('chooseAvatar')}
            className="dsr-press"
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              background: showAvatarImg
                ? T.surface
                : `linear-gradient(135deg, ${T.gold}, ${T.goldDeep})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: T.serif,
              fontSize: 26,
              fontStyle: 'italic',
              color: T.bg,
              fontWeight: 400,
              overflow: 'hidden',
              position: 'relative',
              boxShadow: `inset 0 0 0 1px ${T.line}`,
            }}
          >
            {showAvatarImg ? (
              <Img
                src={avatar!}
                style={{ width: '100%', height: '100%' }}
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              user.name[0]
            )}
            {/* Edit indicator overlay */}
            <span
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 22,
                height: 22,
                borderRadius: 999,
                background: T.gold,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 0 2px ${T.bg}`,
              }}
            >
              <Ico size={10} color={T.bg} stroke={2}>
                {Icons.edit}
              </Ico>
            </span>
          </button>
          <div>
            <H2 style={{ fontSize: 26 }}>{user.fullName}</H2>
            <Tiny
              style={{
                color: T.gold,
                marginTop: 4,
                letterSpacing: 0.4,
                textTransform: 'none',
                fontSize: 11,
              }}
            >
              {tier.name[lang]} · {user.points.toLocaleString()} {t('points')}
            </Tiny>
          </div>
        </div>
      </div>

      {/* Upcoming */}
      <div style={{ padding: '32px 22px 0' }}>
        <Eyebrow>{t('upcoming')}</Eyebrow>
        <div style={{ marginTop: 14 }}>
          {upcoming.map((apt) => {
            const ar = getArtisan(apt.artisan);
            if (!ar) return null;
            return (
              <div
                key={apt.id}
                onClick={() => go('appointment', { id: apt.id })}
                className="dsr-press"
                style={{
                  background: T.surface,
                  padding: 18,
                  marginBottom: 10,
                  boxShadow: `inset 0 0 0 1px ${T.gold}33`,
                  position: 'relative',
                  cursor: 'pointer',
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
                          const s = getService(sid);
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
              const ar = getArtisan(apt.artisan);
              if (!ar) return null;
              return (
                <div
                  key={apt.id}
                  onClick={() => go('appointment', { id: apt.id })}
                  className="dsr-press"
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    padding: '14px 0',
                    borderTop: i === 0 ? 'none' : `1px solid ${T.line}`,
                    opacity: 0.7,
                    cursor: 'pointer',
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
                          const s = getService(sid);
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
            {settings.map((it, i) => {
              const enabled = !!it.onClick;
              return (
                <div
                  key={i}
                  onClick={enabled ? it.onClick : undefined}
                  className={enabled ? 'dsr-press' : undefined}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 0',
                    borderTop: i === 0 ? 'none' : `1px solid ${T.line}`,
                    cursor: enabled ? 'pointer' : 'default',
                    opacity: enabled ? 1 : 0.45,
                  }}
                >
                  <Body style={{ fontSize: 14 }}>{lang === 'es' ? it.es : it.en}</Body>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {it.badge && (
                      <Tiny
                        style={{
                          color: T.textMuted,
                          letterSpacing: 1.2,
                          fontSize: 9,
                          padding: '3px 8px',
                          background: T.surface,
                          boxShadow: `inset 0 0 0 1px ${T.line}`,
                        }}
                      >
                        {lang === 'es' ? it.badge.es : it.badge.en}
                      </Tiny>
                    )}
                    {enabled && (
                      <Ico size={12} color={T.textMuted}>
                        {Icons.chev}
                      </Ico>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Screen>
      <AvatarPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </>
  );
}
