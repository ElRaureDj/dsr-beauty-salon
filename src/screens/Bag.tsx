// DSR — Bag (line items · Apple Pay)
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import {
  Body,
  Divider,
  H1,
  H3,
  HeaderBar,
  Ico,
  Icons,
  Img,
  Screen,
  Tiny,
} from '../components/atoms';
import { PRODUCTS } from '../data/catalog';
import { useRouter } from '../router/Router';

export function Bag() {
  const T = useTheme();
  const { t, lang } = useI18n();
  const { go } = useRouter();
  const items = [PRODUCTS[0], PRODUCTS[2]];
  const subtotal = items.reduce((a, p) => a + p.price, 0);
  const shipping = 0;

  return (
    <Screen padTop={0} padBottom={140}>
      <HeaderBar onBack={() => go('shop')} title={t('bag')} />

      <div style={{ padding: '108px 22px 0' }}>
        <H1 style={{ fontSize: 32 }}>{t('bag')}</H1>
        <Tiny muted style={{ marginTop: 6, letterSpacing: 0.4, textTransform: 'none' }}>
          {items.length} {lang === 'es' ? 'productos' : 'items'}
        </Tiny>

        <div style={{ marginTop: 28 }}>
          {items.map((p, i) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                gap: 14,
                padding: '18px 0',
                borderTop: i === 0 ? 'none' : `1px solid ${T.line}`,
              }}
            >
              <Img src={p.photo} style={{ width: 80, height: 100, flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Tiny muted style={{ fontSize: 9, letterSpacing: 1.2 }}>
                  {p.line}
                </Tiny>
                <Body style={{ marginTop: 4, fontSize: 14, fontWeight: 500 }}>
                  {lang === 'es' ? p.name_es : p.name_en}
                </Body>
                <Tiny
                  muted
                  style={{
                    marginTop: 4,
                    fontSize: 11,
                    letterSpacing: 0.3,
                    textTransform: 'none',
                  }}
                >
                  {p.size}
                </Tiny>
                <div style={{ flex: 1 }} />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      boxShadow: `inset 0 0 0 1px ${T.line}`,
                      padding: '4px 10px',
                    }}
                  >
                    <Ico size={10} color={T.text}>
                      {Icons.minus}
                    </Ico>
                    <Tiny>1</Tiny>
                    <Ico size={10} color={T.text}>
                      {Icons.plus}
                    </Ico>
                  </div>
                  <Tiny
                    style={{
                      color: T.gold,
                      fontFamily: T.serif,
                      fontStyle: 'italic',
                      fontSize: 16,
                    }}
                  >
                    €{p.price}
                  </Tiny>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 28,
            padding: 18,
            background: T.surface,
            boxShadow: `inset 0 0 0 1px ${T.line}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '4px 0',
            }}
          >
            <Tiny muted style={{ letterSpacing: 0.4, textTransform: 'none' }}>
              Subtotal
            </Tiny>
            <Tiny>€{subtotal}</Tiny>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '4px 0',
            }}
          >
            <Tiny muted style={{ letterSpacing: 0.4, textTransform: 'none' }}>
              {lang === 'es' ? 'Envío' : 'Shipping'}
            </Tiny>
            <Tiny style={{ color: T.gold }}>{t('free')}</Tiny>
          </div>
          <Divider style={{ margin: '10px 0' }} />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <Body style={{ fontWeight: 500 }}>Total</Body>
            <H3 style={{ color: T.gold, fontStyle: 'italic' }}>€{subtotal + shipping}</H3>
          </div>
          <Tiny
            style={{
              color: T.gold,
              marginTop: 8,
              fontSize: 10,
              letterSpacing: 0.4,
              textTransform: 'none',
              textAlign: 'right',
            }}
          >
            +{Math.round(subtotal * 10)} {t('points')}
          </Tiny>
        </div>
      </div>

      {/* Sticky Apple Pay */}
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
        <button
          className="dsr-press"
          onClick={() => go('shop')}
          style={{
            width: '100%',
            height: 52,
            padding: '0 22px',
            background: '#fff',
            color: '#000',
            fontFamily: T.sans,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: 'uppercase',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <Ico size={16} color="#000">
            {Icons.apple}
          </Ico>
          {lang === 'es' ? 'Pagar con Apple Pay' : 'Pay with Apple Pay'}
        </button>
        <Tiny
          muted
          style={{
            textAlign: 'center',
            marginTop: 14,
            fontSize: 10,
            letterSpacing: 0.4,
            textTransform: 'none',
          }}
        >
          {lang === 'es'
            ? 'Envío gratis · Devolución 30 días'
            : 'Free shipping · 30-day returns'}
        </Tiny>
      </div>
    </Screen>
  );
}
