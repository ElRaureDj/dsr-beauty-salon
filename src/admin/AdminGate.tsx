// DSR Admin — Gate de acceso al panel.
// Mock: pide un PIN demo (visible en el hint) que UserProvider valida.
// En producción esto sería un check de rol/permiso contra el backend.

import { useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import { Body, Btn, Eyebrow, GhostBtn, H1, Numeral, Tiny } from '../components/atoms';
import { useRouter } from '../router/Router';
import { ADMIN_DEMO_PIN, useUser } from '../data/UserProvider';

const PIN_LENGTH = ADMIN_DEMO_PIN.length;

export function AdminGate() {
  const T = useTheme();
  const { t, lang } = useI18n();
  const { go } = useRouter();
  const { unlockAdmin } = useUser();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const submit = (value: string) => {
    if (unlockAdmin(value)) {
      setError(false);
      // El parent re-renderiza al cambiar adminUnlocked.
      return;
    }
    setError(true);
    setShake(true);
    window.setTimeout(() => setShake(false), 400);
    setPin('');
  };

  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, PIN_LENGTH);
    setPin(digits);
    setError(false);
    if (digits.length === PIN_LENGTH) submit(digits);
  };

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
          width: 420,
          maxWidth: '100%',
          background: T.surface,
          padding: '44px 36px 36px',
          boxShadow: `inset 0 0 0 1px ${T.line}, 0 30px 80px rgba(0,0,0,0.4)`,
          textAlign: 'center',
          animation: shake ? 'dsr-shake 0.4s' : undefined,
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
          {t('adminGateTitle')}
        </H1>
        <Body
          muted
          style={{
            marginTop: 12,
            fontSize: 13,
            lineHeight: 1.6,
            maxWidth: 320,
            margin: '12px auto 0',
          }}
        >
          {t('adminGateSub')}
        </Body>

        <div style={{ marginTop: 28 }}>
          <input
            value={pin}
            onChange={(e) => handleChange(e.target.value)}
            inputMode="numeric"
            autoFocus
            aria-label={t('adminGatePinLabel')}
            placeholder={'•'.repeat(PIN_LENGTH)}
            style={{
              width: '100%',
              padding: '18px 14px',
              background: T.bg,
              border: 'none',
              boxShadow: `inset 0 0 0 1px ${error ? T.gold : T.lineStrong}`,
              color: T.text,
              fontFamily: T.mono,
              fontSize: 28,
              letterSpacing: 18,
              textAlign: 'center',
              outline: 'none',
              transition: 'box-shadow .2s',
            }}
          />
          <Tiny
            style={{
              marginTop: 12,
              color: error ? T.gold : T.textFaint,
              letterSpacing: 0.4,
              textTransform: 'none',
              fontSize: 11,
              minHeight: 14,
            }}
          >
            {error
              ? t('adminGateInvalid')
              : `${t('adminGateHint')} ${ADMIN_DEMO_PIN}`}
          </Tiny>
        </div>

        <div style={{ marginTop: 24 }}>
          <Btn
            onClick={() => submit(pin)}
            disabled={pin.length !== PIN_LENGTH}
            fullWidth
          >
            {t('adminGateEnter')}
          </Btn>
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
