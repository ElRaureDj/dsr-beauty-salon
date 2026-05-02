// DSR — Input de cupón para Bag y CartDrawer.
// Lee/setea el state del cart, muestra el cupón aplicado y el descuento.
// Mensajes de error se muestran inline durante 3s.

import { useState } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/LangProvider';
import { useCart } from '../../cart/CartProvider';
import { Tiny } from './Typography';
import { Ico, Icons } from './Icon';

const ERROR_MS = 3000;

export function PromoInput() {
  const T = useTheme();
  const { t, lang } = useI18n();
  const cart = useCart();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const applied = cart.appliedPromo;

  const flashError = (msg: string) => {
    setError(msg);
    window.setTimeout(() => setError(null), ERROR_MS);
  };

  const submit = () => {
    if (!code.trim()) return;
    const r = cart.applyPromo(code);
    if (r.ok) {
      setCode('');
      setError(null);
      return;
    }
    const map: Record<typeof r.reason, string> = {
      invalid: t('promoInvalid'),
      expired: t('promoExpired'),
      exhausted: t('promoExhausted'),
      inactive: t('promoInactive'),
    };
    flashError(map[r.reason]);
  };

  if (applied) {
    const desc = lang === 'es' ? applied.description_es : applied.description_en;
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 12px',
          background: `${T.gold}14`,
          boxShadow: `inset 0 0 0 1px ${T.gold}55`,
        }}
      >
        <Ico size={12} color={T.gold}>
          {Icons.check}
        </Ico>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Tiny
            style={{
              color: T.gold,
              letterSpacing: 1.4,
              fontSize: 10,
            }}
          >
            {applied.code} ·{' '}
            {applied.type === 'pct'
              ? `−${applied.value}%`
              : `−€${applied.value}`}
          </Tiny>
          {desc && (
            <Tiny
              muted
              style={{
                marginTop: 2,
                fontSize: 10,
                letterSpacing: 0.3,
                textTransform: 'none',
                lineHeight: 1.3,
              }}
            >
              {desc}
            </Tiny>
          )}
        </div>
        <button
          onClick={cart.removePromo}
          aria-label={t('promoRemove')}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 4,
            margin: -4,
            cursor: 'pointer',
            color: T.textFaint,
            display: 'flex',
            fontFamily: T.sans,
            fontSize: 10,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
          }}
        >
          {t('promoRemove')}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          boxShadow: `inset 0 0 0 1px ${error ? T.gold : T.line}`,
        }}
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          placeholder={t('promoCodePlaceholder')}
          style={{
            flex: 1,
            padding: '10px 12px',
            background: 'transparent',
            border: 'none',
            color: T.text,
            fontFamily: T.sans,
            fontSize: 12,
            letterSpacing: 0.6,
            outline: 'none',
            textTransform: 'uppercase',
          }}
        />
        <button
          onClick={submit}
          disabled={!code.trim()}
          className="dsr-press"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: code.trim() ? 'pointer' : 'default',
            color: code.trim() ? T.gold : T.textFaint,
            padding: '0 14px',
            fontFamily: T.sans,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
          }}
        >
          {t('promoApply')}
        </button>
      </div>
      {error && (
        <Tiny
          style={{
            marginTop: 6,
            color: T.gold,
            letterSpacing: 0.4,
            textTransform: 'none',
            fontSize: 10,
          }}
        >
          {error}
        </Tiny>
      )}
    </div>
  );
}
