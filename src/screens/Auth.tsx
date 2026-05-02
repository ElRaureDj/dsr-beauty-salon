// DSR — Auth screen (mock).
// Sign-in / sign-up con providers visuales (Apple, Google, WhatsApp, email).
// Mock: no backend real. Click → loader 800ms → signIn(provider) → home.
// Para auth de verdad haría falta integrar Supabase/Firebase/custom + Apple/Google/Meta SDKs.

import { useState } from 'react';
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
import { useUser, type AuthProvider } from '../data/UserProvider';
import { IMG_ONBOARDING } from '../data/images';

export function Auth() {
  const T = useTheme();
  const { t, lang, setLang } = useI18n();
  const { go } = useRouter();
  const { signIn } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState<AuthProvider | null>(null);

  const heroSrc = IMG_ONBOARDING(2);

  const handleProvider = (p: AuthProvider) => {
    if (pending) return;
    setPending(p);
    // Simula round-trip OAuth para feedback visual.
    setTimeout(() => {
      signIn(p);
      go('home');
    }, 850);
  };

  const handleEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    handleProvider('email');
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
      {/* Hero image with cream/dark fade depending on theme */}
      <div style={{ position: 'relative', height: 280, marginTop: 0 }}>
        <Img src={heroSrc} style={{ width: '100%', height: '100%' }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, rgba(${T.bgRgb},0.35) 0%, transparent 30%, transparent 55%, ${T.bg} 100%)`,
          }}
        />
        {/* Lang toggle top-right */}
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

      {/* Form */}
      <div style={{ padding: '0 28px 36px', position: 'relative', zIndex: 1 }}>
        <Eyebrow style={{ color: T.gold }}>DSR · Maison de Beauté</Eyebrow>
        <H1 style={{ fontSize: 36, marginTop: 8, fontStyle: 'italic' }}>
          {t('authWelcome')}
        </H1>
        <Body
          muted
          style={{
            marginTop: 10,
            fontSize: 13,
            lineHeight: 1.5,
            maxWidth: 300,
          }}
        >
          {t('authWelcomeSub')}
        </Body>
        <GoldRule width={28} style={{ marginTop: 18 }} />

        {/* Provider buttons */}
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
            onClick={() => handleProvider('apple')}
            pending={pending === 'apple'}
            disabled={!!pending}
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
            onClick={() => handleProvider('google')}
            pending={pending === 'google'}
            disabled={!!pending}
            T={T}
            t={t}
            icon={<GoogleG />}
            background="#fff"
            color="#000"
          />
          <ProviderButton
            label={t('continueWithWhatsApp')}
            onClick={() => handleProvider('whatsapp')}
            pending={pending === 'whatsapp'}
            disabled={!!pending}
            T={T}
            t={t}
            icon={<WhatsAppBubble />}
            background="#25D366"
            color="#fff"
          />
        </div>

        {/* Or divider */}
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

        {/* Email + password */}
        <form onSubmit={handleEmail}>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('authEmailLabel')}
            disabled={!!pending}
            style={{
              width: '100%',
              padding: '14px 16px',
              background: T.surface,
              border: 'none',
              boxShadow: `inset 0 0 0 1px ${T.line}`,
              color: T.text,
              fontFamily: T.sans,
              fontSize: 13,
              outline: 'none',
              marginBottom: 8,
            }}
          />
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('authPasswordLabel')}
            disabled={!!pending}
            style={{
              width: '100%',
              padding: '14px 16px',
              background: T.surface,
              border: 'none',
              boxShadow: `inset 0 0 0 1px ${T.line}`,
              color: T.text,
              fontFamily: T.sans,
              fontSize: 13,
              outline: 'none',
              marginBottom: 14,
            }}
          />
          <Btn
            disabled={!!pending || !email.trim()}
            onClick={() => handleEmail({ preventDefault: () => {} } as React.FormEvent)}
          >
            {pending === 'email' ? t('authSigningIn') : t('authSubmit')}
          </Btn>
        </form>

        {/* No account / create */}
        <div
          style={{
            textAlign: 'center',
            marginTop: 18,
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Tiny
            muted
            style={{
              letterSpacing: 0.4,
              textTransform: 'none',
              fontSize: 12,
            }}
          >
            {t('authNoAccount')}
          </Tiny>
          <button
            onClick={() => handleProvider('email')}
            disabled={!!pending}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontFamily: T.sans,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: 0.4,
              color: T.gold,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            {t('authCreateAccount')}
          </button>
        </div>

        {/* Guest */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button
            onClick={() => handleProvider('guest')}
            disabled={!!pending}
            className="dsr-press"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px 0',
              cursor: 'pointer',
              fontFamily: T.sans,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: T.textMuted,
            }}
          >
            {t('authGuest')}
          </button>
        </div>

        {/* Mock disclaimer */}
        <Tiny
          style={{
            textAlign: 'center',
            marginTop: 20,
            fontSize: 9,
            letterSpacing: 1.4,
            color: T.textFaint,
          }}
        >
          {t('authMockNote')}
        </Tiny>
      </div>
    </div>
  );
}

interface ProviderButtonProps {
  label: string;
  onClick: () => void;
  pending: boolean;
  disabled: boolean;
  T: ReturnType<typeof useTheme>;
  t: (key: 'authSigningIn') => string;
  icon: React.ReactNode;
  background: string;
  color: string;
}

function ProviderButton({
  label,
  onClick,
  pending,
  disabled,
  T,
  t,
  icon,
  background,
  color,
}: ProviderButtonProps) {
  return (
    <button
      className="dsr-press"
      onClick={disabled ? undefined : onClick}
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
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        opacity: disabled && !pending ? 0.5 : 1,
        transition: 'opacity .2s',
      }}
    >
      {pending ? (
        <span>{t('authSigningIn')}</span>
      ) : (
        <>
          {icon}
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

// Simple "G" decorativo — no es el logo oficial Google (multicolor),
// es solo una glifa serif para evitar issues de brand guidelines.
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
