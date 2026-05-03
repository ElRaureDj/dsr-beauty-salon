// DSR — Auth screen.
// Email magic link real (Supabase). Apple/Google/WhatsApp visibles pero
// deshabilitados con badge "Próximamente" hasta que se conecten en una
// fase futura (requieren OAuth setup en Supabase + Apple Developer / Google Cloud).
//
// Flow:
// 1. Usuario ingresa email → "Enviar enlace"
// 2. Estado pasa a "sent" — pantalla "Revisa tu inbox"
// 3. Usuario clickea link en su email → vuelve a la app autenticado
// 4. onAuthStateChange en UserProvider actualiza signedIn → este screen
//    detecta el cambio y navega a home automáticamente.

import { useEffect, useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import {
  Body,
  Btn,
  Eyebrow,
  GoldRule,
  H1,
  Ico,
  Icons,
  Img,
  Tiny,
} from '../components/atoms';
import { useRouter } from '../router/Router';
import { useUser } from '../data/UserProvider';
import { useCatalog } from '../data/CatalogProvider';
import { IMG_ONBOARDING } from '../data/images';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function Auth() {
  const T = useTheme();
  const { t, lang, setLang } = useI18n();
  const { go } = useRouter();
  const { signInWithEmail, signedIn } = useUser();
  const { getSettings } = useCatalog();
  const settings = getSettings();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const heroSrc = IMG_ONBOARDING(2);

  // Si la sesión llega (magic link callback o ya estaba), saltar a home.
  useEffect(() => {
    if (signedIn) go('home');
  }, [signedIn, go]);

  const sendLink = async () => {
    if (!email.trim() || status === 'sending') return;
    setStatus('sending');
    setErrorMsg(null);
    const r = await signInWithEmail(email);
    if (r.ok) {
      setStatus('sent');
    } else {
      setStatus('error');
      setErrorMsg(r.error);
    }
  };

  const handleEmail = (e: React.FormEvent) => {
    e.preventDefault();
    void sendLink();
  };

  return (
    <div
      className="dsr dsr-scroll"
      style={{
        width: '100%',
        height: '100%',
        background: T.bg,
        color: T.text,
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ position: 'relative', height: 280, marginTop: 0 }}>
        <Img src={heroSrc} style={{ width: '100%', height: '100%' }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, rgba(${T.bgRgb},0.35) 0%, transparent 30%, transparent 55%, ${T.bg} 100%)`,
          }}
        />
        <div style={{ position: 'absolute', top: 18, right: 18, zIndex: 10 }}>
          <div
            style={{
              display: 'flex',
              gap: 1,
              background: `rgba(${T.bgRgb},0.45)`,
              backdropFilter: 'blur(10px)',
              padding: 3,
              borderRadius: 999,
              boxShadow: `inset 0 0 0 1px ${T.lineStrong}`,
            }}
          >
            {(['es', 'en'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="dsr-press"
                style={{
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px 14px',
                  borderRadius: 999,
                  fontFamily: T.sans,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: 1.4,
                  textTransform: 'uppercase',
                  background: lang === l ? T.gold : 'transparent',
                  color: lang === l ? T.bg : T.text,
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 28px 36px', position: 'relative', zIndex: 1 }}>
        <Eyebrow style={{ color: T.gold }}>{settings.name}</Eyebrow>
        <H1 style={{ fontSize: 36, marginTop: 8, fontStyle: 'italic' }}>
          {status === 'sent' ? t('authMagicLinkTitle') : t('authWelcome')}
        </H1>
        <Body
          muted
          style={{
            marginTop: 10,
            fontSize: 13,
            lineHeight: 1.5,
            maxWidth: 320,
          }}
        >
          {status === 'sent'
            ? t('authMagicLinkSub').replace('{email}', email)
            : t('authWelcomeSub')}
        </Body>
        <GoldRule width={28} style={{ marginTop: 18 }} />

        {status === 'sent' ? (
          <CheckInbox
            email={email}
            onResend={() => sendLink()}
            onChangeEmail={() => {
              setStatus('idle');
              setErrorMsg(null);
            }}
            T={T}
            t={t}
            lang={lang}
          />
        ) : (
          <>
            {/* Provider buttons — visualmente presentes pero deshabilitados. */}
            <div
              style={{
                marginTop: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <ProviderButton
                label={t('continueWithApple')}
                T={T}
                t={t}
                icon={
                  <Ico size={16} color="#000">
                    {Icons.apple}
                  </Ico>
                }
                background="#fff"
                color="#000"
              />
              <ProviderButton
                label={t('continueWithGoogle')}
                T={T}
                t={t}
                icon={<GoogleG />}
                background="#fff"
                color="#000"
              />
              <ProviderButton
                label={t('continueWithWhatsApp')}
                T={T}
                t={t}
                icon={<WhatsAppBubble />}
                background="#25D366"
                color="#fff"
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                margin: '22px 0 16px',
              }}
            >
              <div style={{ flex: 1, height: 1, background: T.line }} />
              <Tiny muted style={{ fontSize: 10, letterSpacing: 1.6 }}>
                {t('authOr')}
              </Tiny>
              <div style={{ flex: 1, height: 1, background: T.line }} />
            </div>

            <form onSubmit={handleEmail}>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('authEmailLabel')}
                disabled={status === 'sending'}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: T.surface,
                  border: 'none',
                  boxShadow: `inset 0 0 0 1px ${
                    status === 'error' ? T.gold : T.line
                  }`,
                  color: T.text,
                  fontFamily: T.sans,
                  fontSize: 13,
                  outline: 'none',
                  marginBottom: 14,
                }}
              />
              <Btn
                disabled={status === 'sending' || !email.trim()}
                onClick={() => void sendLink()}
              >
                {status === 'sending' ? t('authSending') : t('authSendLink')}
              </Btn>
            </form>

            {status === 'error' && errorMsg && (
              <Tiny
                style={{
                  marginTop: 12,
                  color: T.gold,
                  letterSpacing: 0.4,
                  textTransform: 'none',
                  fontSize: 11,
                }}
              >
                {errorMsg}
              </Tiny>
            )}

            <Tiny
              muted
              style={{
                textAlign: 'center',
                marginTop: 22,
                fontSize: 10,
                letterSpacing: 0.4,
                textTransform: 'none',
                lineHeight: 1.5,
              }}
            >
              {lang === 'es'
                ? 'Sin contraseña — te enviamos un enlace de un solo uso a tu email.'
                : 'No password — we email you a one-time sign-in link.'}
            </Tiny>
          </>
        )}
      </div>
    </div>
  );
}

function CheckInbox({
  email,
  onResend,
  onChangeEmail,
  T,
  t,
  lang,
}: {
  email: string;
  onResend: () => void;
  onChangeEmail: () => void;
  T: ReturnType<typeof useTheme>;
  t: ReturnType<typeof useI18n>['t'];
  lang: 'es' | 'en';
}) {
  return (
    <div style={{ marginTop: 28 }}>
      <div
        style={{
          padding: 24,
          background: T.surface,
          boxShadow: `inset 0 0 0 1px ${T.gold}33, 0 0 40px ${T.gold}15`,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            margin: '0 auto 14px',
            background: `radial-gradient(circle at 30% 30%, ${T.goldHi}, ${T.gold} 50%, ${T.goldDeep})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 40px ${T.gold}55`,
          }}
        >
          <Ico size={22} color="#0A0908" stroke={1.6}>
            {Icons.mail}
          </Ico>
        </div>
        <Body
          style={{
            fontSize: 13,
            fontFamily: T.mono,
            letterSpacing: 0.5,
            wordBreak: 'break-all',
          }}
        >
          {email}
        </Body>
      </div>

      <button
        onClick={onResend}
        className="dsr-press"
        style={{
          marginTop: 18,
          width: '100%',
          background: 'transparent',
          border: 'none',
          padding: '12px 0',
          cursor: 'pointer',
          color: T.gold,
          fontFamily: T.sans,
          fontSize: 11,
          letterSpacing: 1.4,
          textTransform: 'uppercase',
          fontWeight: 500,
        }}
      >
        {t('authResend')}
      </button>

      <button
        onClick={onChangeEmail}
        className="dsr-press"
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          padding: '8px 0',
          cursor: 'pointer',
          color: T.textMuted,
          fontFamily: T.sans,
          fontSize: 10,
          letterSpacing: 1.4,
          textTransform: 'uppercase',
          fontWeight: 500,
        }}
      >
        {lang === 'es' ? 'Usar otro email' : 'Use another email'}
      </button>
    </div>
  );
}

interface ProviderButtonProps {
  label: string;
  T: ReturnType<typeof useTheme>;
  t: ReturnType<typeof useI18n>['t'];
  icon: React.ReactNode;
  background: string;
  color: string;
}

function ProviderButton({
  label,
  T,
  t,
  icon,
  background,
  color,
}: ProviderButtonProps) {
  return (
    <button
      disabled
      title={t('authComingSoon')}
      style={{
        width: '100%',
        height: 50,
        padding: '0 18px',
        background,
        color,
        fontFamily: T.sans,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 1.6,
        textTransform: 'uppercase',
        border: 'none',
        cursor: 'not-allowed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        opacity: 0.45,
        position: 'relative',
      }}
    >
      {icon}
      <span>{label}</span>
      <span
        style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 8,
          letterSpacing: 1.2,
          color: '#000',
          background: 'rgba(0,0,0,0.08)',
          padding: '2px 6px',
          fontWeight: 500,
        }}
      >
        {t('authComingSoon')}
      </span>
    </button>
  );
}

function GoogleG() {
  return (
    <span
      style={{
        width: 18,
        height: 18,
        borderRadius: 999,
        background: '#000',
        color: '#fff',
        fontFamily: '"Cormorant Garamond", Georgia, serif',
        fontStyle: 'italic',
        fontWeight: 600,
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      G
    </span>
  );
}

function WhatsAppBubble() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ flexShrink: 0 }}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.76.46 3.42 1.27 4.85L2 22l5.32-1.4A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.27 14.27c-.22.61-1.27 1.16-1.78 1.21-.51.05-.98.07-1.58-.1-.36-.11-.83-.27-1.43-.53-2.52-1.09-4.16-3.62-4.29-3.79-.13-.17-1.03-1.37-1.03-2.61 0-1.24.65-1.85.88-2.1.23-.25.5-.31.67-.31h.48c.15 0 .36-.05.55.42.2.49.69 1.7.75 1.83.06.13.1.27.02.43-.08.16-.12.26-.24.4-.12.14-.25.31-.36.42-.12.12-.24.25-.1.49.14.24.61 1.01 1.32 1.63.91.81 1.68 1.06 1.92 1.18.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.41.66 1.65.78.24.12.4.18.46.28.06.1.06.59-.16 1.17z" />
    </svg>
  );
}
