// DSR — Gift wallet (received / sent tabs with cards + actions)
import { useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import {
  Body,
  Eyebrow,
  H1,
  HeaderBar,
  Ico,
  Icons,
  Screen,
  Tiny,
} from '../components/atoms';
import { GiftCardVisual } from '../components/GiftCardVisual';
import { USER_GIFTCARDS } from '../data/giftcards';
import { findGiftCardDesign } from '../data/helpers';
import { useRouter } from '../router/Router';
import type { ReceivedGiftCard, SentGiftCard } from '../types';

type Tab = 'received' | 'sent';

export function GiftMine() {
  const T = useTheme();
  const { t, lang } = useI18n();
  const { go } = useRouter();
  const [tab, setTab] = useState<Tab>('received');

  const list: (ReceivedGiftCard | SentGiftCard)[] =
    tab === 'received' ? USER_GIFTCARDS.received : USER_GIFTCARDS.purchased;

  return (
    <Screen padTop={0} padBottom={120}>
      <HeaderBar onBack={() => go('gift-cards')} />

      <div style={{ padding: '78px 22px 0' }}>
        <Eyebrow>{lang === 'es' ? 'Cartera de regalos' : 'Gift wallet'}</Eyebrow>
        <H1 style={{ marginTop: 8, fontSize: 32 }}>{t('myGifts')}</H1>

        {/* Tabs */}
        <div
          style={{
            marginTop: 22,
            display: 'flex',
            gap: 0,
            boxShadow: `inset 0 -1px 0 ${T.line}`,
          }}
        >
          {(
            [
              {
                id: 'received',
                es: 'Recibidas',
                en: 'Received',
                n: USER_GIFTCARDS.received.length,
              },
              {
                id: 'sent',
                es: 'Enviadas',
                en: 'Sent',
                n: USER_GIFTCARDS.purchased.length,
              },
            ] as const
          ).map((tt) => (
            <button
              key={tt.id}
              onClick={() => setTab(tt.id)}
              className="dsr-press"
              style={{
                flex: 1,
                padding: '14px 0',
                border: 'none',
                cursor: 'pointer',
                background: 'transparent',
                fontFamily: T.sans,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 1.6,
                textTransform: 'uppercase',
                color: tab === tt.id ? T.gold : T.textMuted,
                boxShadow: tab === tt.id ? `inset 0 -1.5px 0 ${T.gold}` : 'none',
                transition: 'all .2s',
              }}
            >
              {lang === 'es' ? tt.es : tt.en} · {tt.n}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ marginTop: 26 }}>
          {list.map((gc) => {
            const d = findGiftCardDesign(gc.design);
            if (!d) return null;
            const isReceived = tab === 'received';
            const received = isReceived ? (gc as ReceivedGiftCard) : null;
            const sent = !isReceived ? (gc as SentGiftCard) : null;
            return (
              <div key={gc.id} style={{ marginBottom: 24 }}>
                <GiftCardVisual
                  design={d}
                  amount={gc.balance}
                  recipient={isReceived ? '' : (sent as SentGiftCard).to}
                />
                <div style={{ marginTop: 12, padding: '0 4px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                    }}
                  >
                    <Tiny
                      style={{
                        color: T.gold,
                        fontFamily: 'monospace',
                        letterSpacing: 1.5,
                        fontSize: 11,
                      }}
                    >
                      {gc.code}
                    </Tiny>
                    {received ? (
                      <Tiny
                        muted
                        style={{
                          fontSize: 10,
                          letterSpacing: 0.3,
                          textTransform: 'none',
                        }}
                      >
                        {lang === 'es' ? 'de' : 'from'}{' '}
                        <span style={{ color: T.text }}>{received.from}</span>
                      </Tiny>
                    ) : (
                      <Tiny
                        muted
                        style={{
                          fontSize: 10,
                          letterSpacing: 0.3,
                          textTransform: 'none',
                        }}
                      >
                        {lang === 'es' ? sent!.status_es : sent!.status_en}
                      </Tiny>
                    )}
                  </div>
                  {received && received.message_es && (
                    <Body
                      style={{
                        marginTop: 8,
                        fontSize: 13,
                        fontStyle: 'italic',
                        fontFamily: T.serif,
                        fontWeight: 300,
                        lineHeight: 1.5,
                        color: T.textMuted,
                      }}
                    >
                      "{lang === 'es' ? received.message_es : received.message_en}"
                    </Body>
                  )}
                  <div
                    style={{
                      marginTop: 10,
                      display: 'flex',
                      gap: 12,
                      alignItems: 'center',
                    }}
                  >
                    {received ? (
                      <>
                        <Tiny
                          muted
                          style={{
                            fontSize: 10,
                            letterSpacing: 0.3,
                            textTransform: 'none',
                          }}
                        >
                          {lang === 'es' ? 'Saldo' : 'Balance'}:{' '}
                          <span
                            style={{
                              color: T.gold,
                              fontFamily: T.serif,
                              fontStyle: 'italic',
                              fontSize: 14,
                            }}
                          >
                            €{received.balance}
                          </span>{' '}
                          / €{received.amount}
                        </Tiny>
                        <div style={{ flex: 1 }} />
                        <button
                          className="dsr-press"
                          onClick={() => go('book')}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            fontFamily: T.sans,
                            fontSize: 10,
                            fontWeight: 600,
                            letterSpacing: 1.6,
                            textTransform: 'uppercase',
                            color: T.gold,
                            display: 'flex',
                            gap: 6,
                            alignItems: 'center',
                          }}
                        >
                          {lang === 'es' ? 'Aplicar' : 'Apply'}
                          <Ico size={10} color={T.gold} stroke={1.6}>
                            {Icons.arrow}
                          </Ico>
                        </button>
                      </>
                    ) : (
                      <Tiny
                        muted
                        style={{
                          fontSize: 10,
                          letterSpacing: 0.3,
                          textTransform: 'none',
                        }}
                      >
                        {lang === 'es' ? 'Para' : 'To'}:{' '}
                        <span style={{ color: T.text }}>{sent!.to}</span>
                      </Tiny>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Screen>
  );
}
