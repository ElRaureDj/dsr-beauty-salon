// DSR Admin — Gate de acceso al panel.
// Real auth check: el usuario debe estar autenticado y tener
// is_admin = true en su row de profiles. El "PIN demo" anterior fue
// reemplazado por este flag persistido en DB.
//
// Para promover a un user a admin: en SQL Editor de Supabase →
//   update profiles set is_admin = true where email = 'tu@email.com';

import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import { Body, Btn, Eyebrow, GhostBtn, H1, Numeral } from '../components/atoms';
import { useRouter } from '../router/Router';
import { useUser } from '../data/UserProvider';

export function AdminGate() {
  const T = useTheme();
  const { t, lang } = useI18n();
  const { go } = useRouter();
  const { signedIn, authLoading } = useUser();

  // Mientras el primer fetch de getSession resuelve, no decidimos nada
  // todavía — evita un flash de "Inicia sesión" cuando ya hay sesión válida.
  if (authLoading) {
    return (
      <div
        className="dsr"
        style={{
          width: '100vw',
          minHeight: '100vh',
          background: T.bg,
          color: T.textMuted,
          fontFamily: T.sans,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Body muted style={{ fontSize: 13, letterSpacing: 0.4 }}>
          {lang === 'es' ? 'Verificando sesión…' : 'Verifying session…'}
        </Body>
      </div>
    );
  }

  const needsAuth = !signedIn;

  return (
    <div
      className="dsr"
      style={{
        width: '100vw',
        minHeight: '100vh',
        background: T.bg,
        color: T.text,
        fontFamily: T.sans,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
      }}
    >
      <div
        style={{
          width: 460,
          maxWidth: '100%',
          background: T.surface,
          padding: '44px 36px 36px',
          boxShadow: `inset 0 0 0 1px ${T.line}, 0 30px 80px rgba(0,0,0,0.4)`,
          textAlign: 'center',
        }}
      >
        <Numeral value="·" style={{ fontSize: 18 }} />
        <Eyebrow style={{ marginTop: 8 }}>DSR · Maison</Eyebrow>
        <H1
          style={{
            fontSize: 30,
            marginTop: 12,
            fontStyle: 'italic',
            fontFamily: T.serif,
            fontWeight: 300,
          }}
        >
          {needsAuth
            ? t('adminGateAuthTitle')
            : t('adminGateForbiddenTitle')}
        </H1>
        <Body
          muted
          style={{
            marginTop: 14,
            fontSize: 13,
            lineHeight: 1.6,
            maxWidth: 360,
            margin: '14px auto 0',
          }}
        >
          {needsAuth
            ? t('adminGateAuthSub')
            : t('adminGateForbiddenSub')}
        </Body>

        <div style={{ marginTop: 28 }}>
          {needsAuth ? (
            <Btn onClick={() => go('auth')} fullWidth>
              {t('adminGateSignInCta')}
            </Btn>
          ) : (
            <Btn onClick={() => go('home')} fullWidth>
              {t('adminGateBackHome')}
            </Btn>
          )}
          <GhostBtn
            onClick={() => go('home')}
            style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}
          >
            {lang === 'es' ? '← Volver al inicio' : '← Back to app'}
          </GhostBtn>
        </div>
      </div>
    </div>
  );
}
