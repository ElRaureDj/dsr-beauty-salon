// DSR — Gift card purchase flow (design+amount → recipient/message → review + Apple Pay)
import { useState, type CSSProperties } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import {
  Body,
  Btn,
  Eyebrow,
  H1,
  HeaderBar,
  Ico,
  Icons,
  Screen,
  Tiny,
} from '../components/atoms';
import { GiftCardVisual } from '../components/GiftCardVisual';
import { GIFTCARD_AMOUNTS } from '../data/giftcards';
import { useCatalog } from '../data/CatalogProvider';
import { useUserData } from '../data/useUserData';
import { useRouter } from '../router/Router';

interface GiftBuyProps {
  initial?: { design?: string };
}

interface GiftFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

function GiftField({ label, value, onChange, placeholder }: GiftFieldProps) {
  const T = useTheme();
  return (
    <div style={{ marginTop: 14 }}>
      <Tiny muted style={{ fontSize: 9, letterSpacing: 1.4 }}>
        {label}
      </Tiny>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          height: 50,
          marginTop: 6,
          padding: '0 16px',
          fontFamily: T.sans,
          fontSize: 14,
          fontWeight: 400,
          color: T.text,
          background: T.surface,
          border: 'none',
          boxShadow: `inset 0 0 0 1px ${value ? T.gold + '66' : T.line}`,
          outline: 'none',
        }}
      />
    </div>
  );
}

interface ReviewRowProps {
  label: string;
  value: string;
  accent?: boolean;
  last?: boolean;
}

function ReviewRow({ label, value, accent, last }: ReviewRowProps) {
  const T = useTheme();
  const valueStyle: CSSProperties = {
    fontSize: accent ? 18 : 13,
    fontFamily: accent ? T.serif : T.sans,
    fontStyle: accent ? 'italic' : 'normal',
    color: accent ? T.gold : T.text,
    fontWeight: accent ? 300 : 400,
    textAlign: 'right',
    maxWidth: '60%',
  };
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        padding: '10px 0',
        borderBottom: last ? 'none' : `1px solid ${T.line}`,
      }}
    >
      <Tiny
        muted
        style={{ letterSpacing: 0.4, textTransform: 'none', fontSize: 12 }}
      >
        {label}
      </Tiny>
      <Body style={valueStyle}>{value}</Body>
    </div>
  );
}

export function GiftBuy({ initial = {} }: GiftBuyProps) {
  const T = useTheme();
  const { t, lang } = useI18n();
  const { go } = useRouter();
  const { getGiftCardDesigns, getGiftCardDesign } = useCatalog();
  const user = useUserData();

  const [step, setStep] = useState(0);
  const [designId, setDesignId] = useState(initial.design || 'noir');
  const [amount, setAmount] = useState(150);
  const [custom, setCustom] = useState('');
  const [recipient, setRecipient] = useState('');
  const [from, setFrom] = useState(user.fullName);
  const [message, setMessage] = useState(
    lang === 'es'
      ? 'Para que vivas un momento de la maison.'
      : 'For a moment at the maison.',
  );
  const [delivery, setDelivery] = useState<'email' | 'whatsapp' | 'schedule'>('email');
  const [scheduleDate, setScheduleDate] = useState('');
  const [contact, setContact] = useState('');
  const [done, setDone] = useState(false);

  const design = getGiftCardDesign(designId);
  if (!design) return null;
  const finalAmount = custom ? parseInt(custom, 10) || amount : amount;

  // Success state
  if (done) {
    return (
      <Screen padTop={0} padBottom={120}>
        <HeaderBar onBack={() => go('gift-cards')} />
        <div style={{ padding: '120px 22px 0', textAlign: 'center' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 999,
              margin: '0 auto',
              background: `radial-gradient(circle at 30% 30%, ${T.goldHi}, ${T.gold})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ico size={28} color="#0A0908" stroke={2}>
              {Icons.check}
            </Ico>
          </div>
          <H1 style={{ marginTop: 28, fontSize: 32 }}>
            {lang === 'es' ? 'Enviada.' : 'Sent.'}
          </H1>
          <Body
            muted
            style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6 }}
          >
            {lang === 'es'
              ? `Tu gift card de €${finalAmount} viaja a ${recipient}.`
              : `Your €${finalAmount} gift card is on its way to ${recipient}.`}
          </Body>
          <div style={{ marginTop: 32, padding: '0 22px' }}>
            <GiftCardVisual design={design} amount={finalAmount} recipient={recipient} />
          </div>
          <div style={{ marginTop: 32, padding: '0 22px' }}>
            <Btn onClick={() => go('gift-cards')}>
              {lang === 'es' ? 'Volver a la maison' : 'Back to the maison'}
            </Btn>
          </div>
        </div>
      </Screen>
    );
  }

  return (
    <Screen padTop={0} padBottom={140}>
      <HeaderBar
        onBack={() => (step > 0 ? setStep(step - 1) : go('gift-cards'))}
        title={t('buyGift')}
      />

      <div style={{ padding: '108px 22px 0' }}>
        {/* Stepper */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 26 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 1.5,
                background: i <= step ? T.gold : T.line,
                transition: 'all .3s',
              }}
            />
          ))}
        </div>

        {/* Live preview */}
        <GiftCardVisual design={design} amount={finalAmount} recipient={recipient || ''} />

        {/* STEP 0 — design + amount */}
        {step === 0 && (
          <>
            <div style={{ marginTop: 30 }}>
              <Eyebrow>{lang === 'es' ? 'Diseño' : 'Design'}</Eyebrow>
              <div
                className="dsr-scroll"
                style={{
                  marginTop: 12,
                  display: 'flex',
                  gap: 8,
                  overflowX: 'auto',
                  margin: '12px -22px 0',
                  padding: '0 22px',
                }}
              >
                {getGiftCardDesigns().map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDesignId(d.id)}
                    className="dsr-press"
                    style={{
                      flexShrink: 0,
                      width: 64,
                      height: 64,
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      background: d.bg,
                      boxShadow:
                        designId === d.id
                          ? `0 0 0 2px ${T.gold}, inset 0 0 0 1px ${d.accent}66`
                          : `inset 0 0 0 1px ${d.accent}66`,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        right: 8,
                        bottom: 8,
                        boxShadow: `inset 0 0 0 0.5px ${d.accent}55`,
                      }}
                    />
                  </button>
                ))}
              </div>
              <Tiny
                muted
                style={{
                  marginTop: 10,
                  fontSize: 11,
                  letterSpacing: 0.3,
                  textTransform: 'none',
                }}
              >
                {lang === 'es' ? design.vibe_es : design.vibe_en}
              </Tiny>
            </div>

            <div style={{ marginTop: 28 }}>
              <Eyebrow>{lang === 'es' ? 'Monto' : 'Amount'}</Eyebrow>
              <div
                style={{
                  marginTop: 14,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 8,
                }}
              >
                {GIFTCARD_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => {
                      setAmount(a);
                      setCustom('');
                    }}
                    className="dsr-press"
                    style={{
                      height: 56,
                      border: 'none',
                      cursor: 'pointer',
                      background: !custom && amount === a ? T.text : T.surface,
                      color: !custom && amount === a ? T.bg : T.text,
                      fontFamily: T.serif,
                      fontStyle: 'italic',
                      fontSize: 20,
                      fontWeight: 300,
                      boxShadow: `inset 0 0 0 1px ${
                        !custom && amount === a ? T.gold : T.line
                      }`,
                    }}
                  >
                    €{a}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 12, position: 'relative' }}>
                <input
                  value={custom}
                  onChange={(e) => setCustom(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder={lang === 'es' ? 'Otro monto · €' : 'Other amount · €'}
                  style={{
                    width: '100%',
                    height: 52,
                    padding: '0 18px',
                    fontFamily: T.serif,
                    fontStyle: 'italic',
                    fontSize: 16,
                    fontWeight: 300,
                    color: T.text,
                    background: T.surface,
                    border: 'none',
                    boxShadow: `inset 0 0 0 1px ${custom ? T.gold : T.line}`,
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: 32 }}>
              <Btn onClick={() => setStep(1)} disabled={!finalAmount}>
                {t('continue')}
                <Ico size={14} color={T.bg}>
                  {Icons.arrow}
                </Ico>
              </Btn>
            </div>
          </>
        )}

        {/* STEP 1 — recipient + message */}
        {step === 1 && (
          <>
            <div style={{ marginTop: 30 }}>
              <Eyebrow>{lang === 'es' ? 'Destinataria' : 'Recipient'}</Eyebrow>
              <GiftField
                label={lang === 'es' ? 'Nombre' : 'Name'}
                value={recipient}
                onChange={setRecipient}
                placeholder={lang === 'es' ? 'Para… ej. Lucía García' : 'To… e.g. Lucía García'}
              />
              <GiftField
                label={lang === 'es' ? 'De parte de' : 'From'}
                value={from}
                onChange={setFrom}
              />
            </div>

            <div style={{ marginTop: 24 }}>
              <Eyebrow>{lang === 'es' ? 'Mensaje' : 'Message'}</Eyebrow>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={200}
                style={{
                  width: '100%',
                  minHeight: 96,
                  padding: 16,
                  marginTop: 10,
                  fontFamily: T.serif,
                  fontStyle: 'italic',
                  fontSize: 14,
                  lineHeight: 1.5,
                  fontWeight: 300,
                  color: T.text,
                  background: T.surface,
                  border: 'none',
                  resize: 'none',
                  boxShadow: `inset 0 0 0 1px ${T.line}`,
                  outline: 'none',
                }}
              />
              <Tiny
                muted
                style={{
                  marginTop: 6,
                  fontSize: 10,
                  letterSpacing: 0.3,
                  textTransform: 'none',
                  textAlign: 'right',
                }}
              >
                {message.length}/200
              </Tiny>
            </div>

            <div style={{ marginTop: 24 }}>
              <Eyebrow>{lang === 'es' ? 'Entrega' : 'Delivery'}</Eyebrow>
              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {(
                  [
                    { id: 'email', es: 'Email · ahora', en: 'Email · now', icon: Icons.mail },
                    { id: 'whatsapp', es: 'WhatsApp · ahora', en: 'WhatsApp · now', icon: Icons.share },
                    { id: 'schedule', es: 'Programar fecha', en: 'Schedule a date', icon: Icons.cal },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setDelivery(opt.id)}
                    className="dsr-press"
                    style={{
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: '14px 16px',
                      background: T.surface,
                      boxShadow: `inset 0 0 0 1px ${
                        delivery === opt.id ? T.gold : T.line
                      }`,
                      display: 'flex',
                      gap: 14,
                      alignItems: 'center',
                    }}
                  >
                    <Ico
                      size={14}
                      color={delivery === opt.id ? T.gold : T.textMuted}
                      stroke={1.5}
                    >
                      {opt.icon}
                    </Ico>
                    <Body style={{ flex: 1, fontSize: 14 }}>
                      {lang === 'es' ? opt.es : opt.en}
                    </Body>
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 999,
                        boxShadow: `inset 0 0 0 1px ${
                          delivery === opt.id ? T.gold : T.line
                        }`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {delivery === opt.id && (
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 999,
                            background: T.gold,
                          }}
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <GiftField
                label={
                  delivery === 'whatsapp'
                    ? lang === 'es'
                      ? 'Teléfono'
                      : 'Phone'
                    : lang === 'es'
                      ? 'Email'
                      : 'Email'
                }
                value={contact}
                onChange={setContact}
                placeholder={
                  delivery === 'whatsapp' ? '+34 · · · · · · · · ·' : 'lucia@maison.com'
                }
              />
              {delivery === 'schedule' && (
                <GiftField
                  label={lang === 'es' ? 'Fecha de entrega' : 'Delivery date'}
                  value={scheduleDate}
                  onChange={setScheduleDate}
                  placeholder="2026 · 05 · 15"
                />
              )}
            </div>

            <div style={{ marginTop: 32 }}>
              <Btn onClick={() => setStep(2)} disabled={!recipient || !contact}>
                {t('continue')}
                <Ico size={14} color={T.bg}>
                  {Icons.arrow}
                </Ico>
              </Btn>
            </div>
          </>
        )}

        {/* STEP 2 — review + pay */}
        {step === 2 && (
          <>
            <div style={{ marginTop: 30 }}>
              <Eyebrow>{lang === 'es' ? 'Revisión' : 'Review'}</Eyebrow>
              <div
                style={{
                  marginTop: 14,
                  padding: 18,
                  background: T.surface,
                  boxShadow: `inset 0 0 0 1px ${T.line}`,
                }}
              >
                <ReviewRow
                  label={lang === 'es' ? 'Para' : 'To'}
                  value={recipient}
                />
                <ReviewRow label={lang === 'es' ? 'De' : 'From'} value={from} />
                <ReviewRow
                  label={lang === 'es' ? 'Diseño' : 'Design'}
                  value={lang === 'es' ? design.name_es : design.name_en}
                />
                <ReviewRow
                  label={lang === 'es' ? 'Monto' : 'Amount'}
                  value={`€${finalAmount}`}
                  accent
                />
                <ReviewRow
                  label={lang === 'es' ? 'Entrega' : 'Delivery'}
                  value={
                    delivery === 'email'
                      ? `Email · ${contact}`
                      : delivery === 'whatsapp'
                        ? `WhatsApp · ${contact}`
                        : `${scheduleDate || 'TBD'} · ${contact}`
                  }
                  last
                />
              </div>
              <div
                style={{
                  marginTop: 16,
                  padding: 18,
                  background: T.surface,
                  boxShadow: `inset 0 0 0 1px ${T.line}`,
                }}
              >
                <Tiny muted style={{ fontSize: 9, letterSpacing: 1.4 }}>
                  {lang === 'es' ? 'Mensaje' : 'Message'}
                </Tiny>
                <Body
                  style={{
                    marginTop: 8,
                    fontSize: 14,
                    fontStyle: 'italic',
                    fontFamily: T.serif,
                    fontWeight: 300,
                    lineHeight: 1.5,
                  }}
                >
                  "{message}"
                </Body>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sticky pay (only on step 2) */}
      {step === 2 && (
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              padding: '0 4px 12px',
            }}
          >
            <Tiny muted style={{ letterSpacing: 0.4, textTransform: 'none' }}>
              Total
            </Tiny>
            <div
              style={{
                color: T.gold,
                fontFamily: T.serif,
                fontStyle: 'italic',
                fontSize: 24,
                fontWeight: 300,
              }}
            >
              €{finalAmount}
            </div>
          </div>
          <button
            className="dsr-press"
            onClick={() => setDone(true)}
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
        </div>
      )}
    </Screen>
  );
}
