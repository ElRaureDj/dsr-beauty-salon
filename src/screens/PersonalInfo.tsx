// DSR — Personal info screen.
// Editar full_name + display_name del profile (Supabase). Email es
// read-only (viene de auth.users). Sin sesión, muestra empty state que
// redirige a Auth.

import { useEffect, useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import {
  Body,
  Btn,
  Eyebrow,
  H1,
  HeaderBar,
  Numeral,
  Screen,
  Tiny,
} from '../components/atoms';
import { useRouter } from '../router/Router';
import { useUser } from '../data/UserProvider';

type Status = 'idle' | 'saving' | 'saved' | 'error';

export function PersonalInfo() {
  const T = useTheme();
  const { t, lang } = useI18n();
  const { go } = useRouter();
  const { signedIn, profile, updateProfile, session } = useUser();

  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Hidratar el form cuando llega el profile.
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setDisplayName(profile.display_name ?? '');
    }
  }, [profile]);

  const email = session?.user?.email ?? '';

  const handleSave = async () => {
    if (status === 'saving') return;
    setStatus('saving');
    setErrorMsg(null);
    try {
      await updateProfile({
        full_name: fullName.trim() || null,
        display_name: displayName.trim() || null,
      });
      setStatus('saved');
      window.setTimeout(() => setStatus('idle'), 2400);
    } catch (e) {
      setStatus('error');
      setErrorMsg(e instanceof Error ? e.message : 'Error desconocido');
    }
  };

  if (!signedIn) {
    return (
      <Screen padTop={0} padBottom={40}>
        <HeaderBar onBack={() => go('profile')} title={t('personalInfoTitle')} />
        <div
          style={{
            padding: '160px 32px 0',
            textAlign: 'center',
          }}
        >
          <Numeral value="·" style={{ fontSize: 18 }} />
          <Body
            muted
            style={{ marginTop: 18, fontSize: 14, lineHeight: 1.6 }}
          >
            {t('personalInfoLoginRequired')}
          </Body>
          <Btn
            onClick={() => go('auth')}
            fullWidth={false}
            style={{ marginTop: 26 }}
          >
            {t('personalInfoLoginCta')}
          </Btn>
        </div>
      </Screen>
    );
  }

  const dirty =
    (profile?.full_name ?? '') !== fullName.trim() ||
    (profile?.display_name ?? '') !== displayName.trim();

  return (
    <Screen padTop={0} padBottom={140}>
      <HeaderBar onBack={() => go('profile')} title={t('personalInfoTitle')} />
      <div style={{ padding: '108px 22px 0' }}>
        <Numeral value="·" style={{ fontSize: 14 }} />
        <H1 style={{ fontSize: 32, marginTop: 6 }}>
          {t('personalInfoTitle')}
        </H1>
        <Body
          muted
          style={{ marginTop: 12, fontSize: 13, lineHeight: 1.5, maxWidth: 320 }}
        >
          {t('personalInfoSub')}
        </Body>

        <FormField
          label={t('personalInfoEmailLabel')}
          hint={t('personalInfoEmailHint')}
          T={T}
        >
          <input
            value={email}
            readOnly
            style={readonlyInputStyle(T)}
          />
        </FormField>

        <FormField label={t('personalInfoDisplayNameLabel')} T={T}>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={lang === 'es' ? 'Camila' : 'Camila'}
            style={inputStyle(T)}
          />
        </FormField>

        <FormField label={t('personalInfoFullNameLabel')} T={T}>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={lang === 'es' ? 'Camila Vargas' : 'Camila Vargas'}
            style={inputStyle(T)}
          />
        </FormField>

        {status === 'error' && errorMsg && (
          <Tiny
            style={{
              marginTop: 14,
              color: T.gold,
              letterSpacing: 0.4,
              textTransform: 'none',
              fontSize: 11,
            }}
          >
            {errorMsg}
          </Tiny>
        )}

        {status === 'saved' && (
          <div className="dsr-fadein" style={{ marginTop: 14 }}>
            <Tiny
              style={{
                color: T.gold,
                letterSpacing: 1.4,
                fontSize: 10,
              }}
            >
              ✓ {t('personalInfoSaved')}
            </Tiny>
          </div>
        )}
      </div>

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
        <Btn
          onClick={handleSave}
          disabled={!dirty || status === 'saving'}
        >
          {status === 'saving'
            ? t('personalInfoSaving')
            : t('personalInfoSave')}
        </Btn>
      </div>
    </Screen>
  );
}

function FormField({
  label,
  hint,
  children,
  T,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  T: ReturnType<typeof useTheme>;
}) {
  return (
    <div style={{ marginTop: 24 }}>
      <Eyebrow>{label}</Eyebrow>
      <div style={{ marginTop: 10 }}>{children}</div>
      {hint && (
        <Tiny
          muted
          style={{
            marginTop: 6,
            fontSize: 10,
            letterSpacing: 0.3,
            textTransform: 'none',
            lineHeight: 1.4,
            display: 'block',
          }}
        >
          {hint}
        </Tiny>
      )}
      <span style={{ display: 'none' }}>{T.bg}</span>
    </div>
  );
}

function inputStyle(T: ReturnType<typeof useTheme>): React.CSSProperties {
  return {
    width: '100%',
    padding: '14px 16px',
    background: T.surface,
    border: 'none',
    boxShadow: `inset 0 0 0 1px ${T.line}`,
    color: T.text,
    fontFamily: T.sans,
    fontSize: 13,
    outline: 'none',
  };
}

function readonlyInputStyle(T: ReturnType<typeof useTheme>): React.CSSProperties {
  return {
    ...inputStyle(T),
    color: T.textMuted,
    cursor: 'not-allowed',
  };
}
