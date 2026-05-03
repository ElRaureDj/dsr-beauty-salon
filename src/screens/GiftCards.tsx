// DSR — Gift Cards landing (balance · buy CTA · designs · how it works)
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import {
  Body,
  Btn,
  Eyebrow,
  H1,
  H3,
  HeaderBar,
  Ico,
  Icons,
  Numeral,
  Screen,
  Tiny,
} from '../components/atoms';
import { GiftCardVisual } from '../components/GiftCardVisual';
import { USER_GIFTCARDS } from '../data/giftcards';
import { useCatalog } from '../data/CatalogProvider';
import { useRouter } from '../router/Router';

export function GiftCards() {
  const T = useTheme();
  const { t, lang } = useI18n();
  const { go } = useRouter();
  const { getGiftCardDesigns } = useCatalog();
  const totalReceived = USER_GIFTCARDS.received.reduce((a, g) => a + g.balance, 0);

  return (
    <Screen padTop={0} padBottom={120}>
      <HeaderBar onBack={() => go('rewards')} />

      <div style={{ padding: '78px 22px 0' }}>
        <Eyebrow>{lang === 'es' ? 'La maison · regalos' : 'The maison · gifts'}</Eyebrow>
        <H1 style={{ marginTop: 10, fontSize: 42, lineHeight: 0.95 }}>Gift</H1>
        <H1
          style={{
            fontFamily: T.serif,
            fontStyle: 'italic',
            fontSize: 42,
            color: T.gold,
            lineHeight: 0.95,
            fontWeight: 300,
          }}
        >
          Cards.
        </H1>
        <Body
          muted
          style={{ marginTop: 14, fontSize: 13, lineHeight: 1.6, maxWidth: 320 }}
        >
          {lang === 'es'
            ? 'El gesto más esperado: una tarjeta DSR. Diseños de la maison, entrega digital o programada, canjeable en cualquier servicio o boutique.'
            : 'The most anticipated gesture: a DSR card. Maison designs, digital or scheduled delivery, redeemable for any service or boutique.'}
        </Body>
      </div>

      {/* My balance */}
      {totalReceived > 0 && (
        <div style={{ padding: '32px 22px 0' }}>
          <div
            onClick={() => go('gift-mine')}
            className="dsr-press"
            style={{
              background: `linear-gradient(135deg, ${T.surface}, ${T.surfaceHi})`,
              padding: 22,
              cursor: 'pointer',
              boxShadow: `inset 0 0 0 1px ${T.gold}33`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 140,
                height: 140,
                borderRadius: 999,
                background: `radial-gradient(circle, ${T.gold}22, transparent 70%)`,
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <div>
                <Tiny muted style={{ letterSpacing: 1.4 }}>
                  {lang === 'es' ? 'Mis gift cards' : 'My gift cards'}
                </Tiny>
                <div
                  style={{
                    marginTop: 8,
                    fontFamily: T.serif,
                    fontStyle: 'italic',
                    fontSize: 36,
                    color: T.gold,
                    lineHeight: 1,
                    fontWeight: 300,
                  }}
                >
                  €{totalReceived}
                </div>
                <Tiny
                  muted
                  style={{
                    marginTop: 6,
                    letterSpacing: 0.4,
                    textTransform: 'none',
                    fontSize: 11,
                  }}
                >
                  {USER_GIFTCARDS.received.length}{' '}
                  {lang === 'es' ? 'tarjetas activas' : 'active cards'} ·{' '}
                  {USER_GIFTCARDS.purchased.length}{' '}
                  {lang === 'es' ? 'enviadas' : 'sent'}
                </Tiny>
              </div>
              <Ico size={16} color={T.gold}>
                {Icons.arrow}
              </Ico>
            </div>
          </div>
        </div>
      )}

      {/* Buy CTA */}
      <div style={{ padding: '32px 22px 0' }}>
        <Btn onClick={() => go('gift-buy')}>
          {t('buyGift')}
          <Ico size={14} color={T.bg}>
            {Icons.arrow}
          </Ico>
        </Btn>
      </div>

      {/* Designs preview */}
      <div style={{ padding: '36px 0 0' }}>
        <div style={{ padding: '0 22px', marginBottom: 16 }}>
          <Eyebrow>{lang === 'es' ? 'Los diseños' : 'The designs'}</Eyebrow>
          <H3 style={{ marginTop: 6, fontSize: 18 }}>
            {lang === 'es' ? 'Seis cartas, una maison.' : 'Six cards, one maison.'}
          </H3>
        </div>
        <div
          className="dsr-scroll"
          style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            padding: '0 22px 4px',
          }}
        >
          {getGiftCardDesigns().map((d) => (
            <div
              key={d.id}
              onClick={() => go('gift-buy', { design: d.id })}
              className="dsr-press"
              style={{ flexShrink: 0, width: 180, cursor: 'pointer' }}
            >
              <GiftCardVisual design={d} amount={null} compact />
              <div style={{ marginTop: 10 }}>
                <Body style={{ fontSize: 13, fontWeight: 500 }}>
                  {lang === 'es' ? d.name_es : d.name_en}
                </Body>
                <Tiny
                  muted
                  style={{
                    marginTop: 3,
                    fontSize: 10,
                    letterSpacing: 0.3,
                    textTransform: 'none',
                    lineHeight: 1.35,
                  }}
                >
                  {lang === 'es' ? d.vibe_es : d.vibe_en}
                </Tiny>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: '40px 22px 0' }}>
        <Eyebrow>{lang === 'es' ? 'Cómo funciona' : 'How it works'}</Eyebrow>
        <div style={{ marginTop: 14 }}>
          {[
            { es: 'Eliges el diseño y el monto.', en: 'Choose the design and amount.' },
            { es: 'Personalizas el mensaje.', en: 'Personalise the message.' },
            { es: 'Envío inmediato o programado.', en: 'Send now or schedule.' },
            { es: 'Se canjea en servicios y boutique.', en: 'Redeem on services and boutique.' },
          ].map((it, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 16,
                padding: '14px 0',
                borderTop: i === 0 ? 'none' : `1px solid ${T.line}`,
              }}
            >
              <Numeral
                value={['I', 'II', 'III', 'IV'][i]}
                style={{ fontSize: 13, width: 26 }}
              />
              <Body style={{ fontSize: 14, lineHeight: 1.4 }}>
                {lang === 'es' ? it.es : it.en}
              </Body>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}
