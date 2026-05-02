// DSR Admin — Gift Cards.
// MVP: lista de diseños (read) + lista de gift cards emitidas (read).

import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/LangProvider';
import { Body, Chip, Eyebrow, H1, H3, Tiny } from '../../components/atoms';
import { GIFTCARD_DESIGNS, USER_GIFTCARDS } from '../../data/giftcards';
import { useState } from 'react';

type Tab = 'designs' | 'codes';

export function GiftCardsSection() {
  const T = useTheme();
  const { lang } = useI18n();
  const [tab, setTab] = useState<Tab>('designs');

  const allCodes = [
    ...USER_GIFTCARDS.received.map((g) => ({
      code: g.code,
      design: g.design,
      amount: g.amount,
      balance: g.balance,
      counterpart: g.from,
      counterpartLabel: lang === 'es' ? 'De' : 'From',
      date: g.received,
      expires: g.expires,
      type: 'received' as const,
    })),
    ...USER_GIFTCARDS.purchased.map((g) => ({
      code: g.code,
      design: g.design,
      amount: g.amount,
      balance: g.balance,
      counterpart: g.to,
      counterpartLabel: lang === 'es' ? 'Para' : 'To',
      date: g.sent,
      expires: undefined,
      type: 'purchased' as const,
    })),
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Eyebrow>{lang === 'es' ? 'Fidelidad' : 'Loyalty'}</Eyebrow>
        <H1 style={{ marginTop: 8, fontSize: 32, fontStyle: 'italic' }}>Gift Cards</H1>
        <Body muted style={{ marginTop: 8, fontSize: 13, maxWidth: 540 }}>
          {lang === 'es'
            ? 'Diseños disponibles y códigos emitidos. CRUD editable próximamente.'
            : 'Available designs and issued codes. Editable CRUD coming soon.'}
        </Body>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <Chip active={tab === 'designs'} onClick={() => setTab('designs')}>
          {lang === 'es' ? 'Diseños' : 'Designs'} · {GIFTCARD_DESIGNS.length}
        </Chip>
        <Chip active={tab === 'codes'} onClick={() => setTab('codes')}>
          {lang === 'es' ? 'Códigos emitidos' : 'Issued codes'} · {allCodes.length}
        </Chip>
      </div>

      {tab === 'designs' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 12,
          }}
        >
          {GIFTCARD_DESIGNS.map((d) => (
            <div
              key={d.id}
              style={{
                aspectRatio: '1.586',
                background: d.bg,
                borderRadius: 8,
                padding: 18,
                position: 'relative',
                color: d.fg,
                boxShadow: `inset 0 0 0 1px ${T.line}`,
                overflow: 'hidden',
              }}
            >
              <Tiny
                style={{
                  letterSpacing: 1.4,
                  fontSize: 9,
                  color: d.accent,
                }}
              >
                DSR · MAISON
              </Tiny>
              <H3
                style={{
                  fontFamily: T.serif,
                  fontStyle: 'italic',
                  fontSize: 22,
                  marginTop: 6,
                  color: d.fg,
                  lineHeight: 1.1,
                }}
              >
                {lang === 'es' ? d.name_es : d.name_en}
              </H3>
              <Tiny
                style={{
                  position: 'absolute',
                  bottom: 18,
                  left: 18,
                  right: 18,
                  fontSize: 10,
                  letterSpacing: 0.4,
                  textTransform: 'none',
                  color: d.accent,
                }}
              >
                {lang === 'es' ? d.vibe_es : d.vibe_en}
              </Tiny>
              <Tiny
                style={{
                  position: 'absolute',
                  top: 18,
                  right: 18,
                  fontSize: 9,
                  letterSpacing: 1,
                  fontFamily: T.mono,
                  color: d.accent,
                }}
              >
                {d.id}
              </Tiny>
            </div>
          ))}
        </div>
      )}

      {tab === 'codes' && (
        <div style={{ background: T.surface, boxShadow: `inset 0 0 0 1px ${T.line}` }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '180px 100px 100px 1fr 120px 120px',
              gap: 14,
              padding: '12px 18px',
              borderBottom: `1px solid ${T.line}`,
              alignItems: 'center',
            }}
          >
            <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2 }}>
              {lang === 'es' ? 'CÓDIGO' : 'CODE'}
            </Tiny>
            <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2 }}>
              {lang === 'es' ? 'DISEÑO' : 'DESIGN'}
            </Tiny>
            <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2 }}>
              MONTO
            </Tiny>
            <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2 }}>
              {lang === 'es' ? 'CONTRAPARTE' : 'COUNTERPARTY'}
            </Tiny>
            <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2 }}>
              {lang === 'es' ? 'FECHA' : 'DATE'}
            </Tiny>
            <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2, textAlign: 'right' }}>
              {lang === 'es' ? 'BALANCE' : 'BALANCE'}
            </Tiny>
          </div>
          {allCodes.map((c, i) => (
            <div
              key={c.code}
              style={{
                display: 'grid',
                gridTemplateColumns: '180px 100px 100px 1fr 120px 120px',
                gap: 14,
                padding: '12px 18px',
                borderBottom: i === allCodes.length - 1 ? 'none' : `1px solid ${T.line}`,
                alignItems: 'center',
              }}
            >
              <Tiny
                style={{
                  fontFamily: T.mono,
                  fontSize: 11,
                  color: T.gold,
                  letterSpacing: 0.4,
                  textTransform: 'none',
                }}
              >
                {c.code}
              </Tiny>
              <Tiny
                style={{
                  fontFamily: T.mono,
                  fontSize: 11,
                  color: T.textMuted,
                  textTransform: 'none',
                }}
              >
                {c.design}
              </Tiny>
              <Tiny
                style={{
                  color: T.gold,
                  fontFamily: T.serif,
                  fontStyle: 'italic',
                  fontSize: 14,
                  textTransform: 'none',
                }}
              >
                €{c.amount}
              </Tiny>
              <Body style={{ fontSize: 12 }}>
                <span
                  style={{
                    fontSize: 10,
                    color: T.textMuted,
                    marginRight: 6,
                    fontFamily: T.mono,
                  }}
                >
                  {c.counterpartLabel}:
                </span>
                {c.counterpart}
              </Body>
              <Tiny
                style={{
                  fontFamily: T.mono,
                  fontSize: 11,
                  color: T.textMuted,
                  textTransform: 'none',
                }}
              >
                {c.date}
              </Tiny>
              <H3
                style={{
                  fontSize: 14,
                  color: c.balance === 0 ? T.textFaint : T.gold,
                  fontStyle: 'italic',
                  textAlign: 'right',
                }}
              >
                €{c.balance}
              </H3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
