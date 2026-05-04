// DSR — Bag (line items · Apple Pay)
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import {
  Body,
  Btn,
  Divider,
  H1,
  H2,
  H3,
  HeaderBar,
  Ico,
  Icons,
  Img,
  PromoInput,
  Screen,
  Tiny,
} from '../components/atoms';
import { useCatalog } from '../data/CatalogProvider';
import { useRouter } from '../router/Router';
import { useCart } from '../cart/CartProvider';
import { useCurrency } from '../lib/format';

export function Bag() {
  const T = useTheme();
  const { t, lang } = useI18n();
  const { go } = useRouter();
  const cart = useCart();
  const { getProduct } = useCatalog();
  const { format: fmt } = useCurrency();

  const rows = cart.items
    .map((it) => {
      const product = getProduct(it.productId);
      return product ? { product, qty: it.qty } : null;
    })
    .filter(
      (r): r is { product: NonNullable<ReturnType<typeof getProduct>>; qty: number } =>
        r !== null,
    );

  const subtotal = cart.subtotal;
  const shipping = 0;
  const isEmpty = rows.length === 0;
  const total = Math.max(0, subtotal + shipping - cart.promoDiscount);

  return (
    <Screen padTop={0} padBottom={isEmpty ? 0 : 140}>
      <HeaderBar onBack={() => go('shop')} title={t('bag')} />

      {isEmpty ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 36px',
            textAlign: 'center',
            gap: 18,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `inset 0 0 0 1px ${T.line}`,
              opacity: 0.7,
            }}
          >
            <Ico size={28} color={T.gold}>
              {Icons.bag}
            </Ico>
          </div>
          <H2 style={{ fontStyle: 'italic', color: T.gold }}>{t('emptyBag')}</H2>
          <Body style={{ color: T.textMuted, fontSize: 13, lineHeight: 1.6, maxWidth: 260 }}>
            {t('emptyBagSub')}
          </Body>
          <Btn fullWidth={false} onClick={() => go('shop')} style={{ marginTop: 8 }}>
            {t('continueShopping')}
          </Btn>
        </div>
      ) : (
        <>
          <div style={{ padding: '108px 22px 0' }}>
            <H1 style={{ fontSize: 32 }}>{t('bag')}</H1>
            <Tiny muted style={{ marginTop: 6, letterSpacing: 0.4, textTransform: 'none' }}>
              {cart.count} {lang === 'es' ? (cart.count === 1 ? 'producto' : 'productos') : cart.count === 1 ? 'item' : 'items'}
            </Tiny>

            <div style={{ marginTop: 28 }}>
              {rows.map(({ product: p, qty }, i) => (
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <Tiny muted style={{ fontSize: 9, letterSpacing: 1.2 }}>
                        {p.line}
                      </Tiny>
                      <button
                        onClick={() => cart.remove(p.id)}
                        aria-label={t('removeFromBag')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: 4,
                          margin: -4,
                          cursor: 'pointer',
                          color: T.textFaint,
                          display: 'flex',
                        }}
                      >
                        <Ico size={12} color={T.textFaint}>
                          {Icons.close}
                        </Ico>
                      </button>
                    </div>
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
                        <button
                          onClick={() => cart.setQty(p.id, qty - 1)}
                          aria-label="−"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            display: 'flex',
                          }}
                        >
                          <Ico size={10} color={T.text}>
                            {Icons.minus}
                          </Ico>
                        </button>
                        <Tiny style={{ minWidth: 12, textAlign: 'center' }}>{qty}</Tiny>
                        <button
                          onClick={() => cart.setQty(p.id, qty + 1)}
                          aria-label="+"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            display: 'flex',
                          }}
                        >
                          <Ico size={10} color={T.text}>
                            {Icons.plus}
                          </Ico>
                        </button>
                      </div>
                      <Tiny
                        style={{
                          color: T.gold,
                          fontFamily: T.serif,
                          fontStyle: 'italic',
                          fontSize: 16,
                        }}
                      >
                        {fmt(p.price * qty)}
                      </Tiny>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 28 }}>
              <PromoInput />
            </div>

            <div
              style={{
                marginTop: 14,
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
                <Tiny>{fmt(subtotal)}</Tiny>
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
              {cart.appliedPromo && cart.promoDiscount > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '4px 0',
                  }}
                >
                  <Tiny
                    style={{
                      color: T.gold,
                      letterSpacing: 0.4,
                      textTransform: 'none',
                    }}
                  >
                    {t('promoApplied')} · {cart.appliedPromo.code}
                  </Tiny>
                  <Tiny style={{ color: T.gold }}>−{fmt(cart.promoDiscount)}</Tiny>
                </div>
              )}
              <Divider style={{ margin: '10px 0' }} />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <Body style={{ fontWeight: 500 }}>Total</Body>
                <H3 style={{ color: T.gold, fontStyle: 'italic' }}>{fmt(total)}</H3>
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
                +{Math.round(total * 10)} {t('points')}
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
              onClick={() => go('checkout-success')}
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
        </>
      )}
    </Screen>
  );
}
