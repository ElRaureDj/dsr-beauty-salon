// DSR — Rewards (3D tilt membership card · stats · progress · perks · gift cards · redeem)
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import {
  Body,
  Eyebrow,
  H1,
  H2,
  Ico,
  Icons,
  Numeral,
  Screen,
  Tiny,
} from '../components/atoms';
import { PERKS } from '../data/tiers';
import { useCatalog } from '../data/CatalogProvider';
import { useUser } from '../data/UserProvider';
import { useUserData } from '../data/useUserData';
import { nextTier, tierFor } from '../data/helpers';
import { useRouter } from '../router/Router';
import { fetchMyReferralCode } from '../lib/db';
import { useToast } from '../components/atoms';
import { useCurrency, currencySymbol } from '../lib/format';

export function Rewards() {
  const T = useTheme();
  const { t, lang } = useI18n();
  const { go } = useRouter();
  const { getTiers, getSettings } = useCatalog();
  const { format: fmt } = useCurrency();
  const sym = currencySymbol(getSettings().currency);
  const { signedIn } = useUser();
  const { show: showToast } = useToast();
  const user = useUserData();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  // Fetch del código del user actual cuando hay sesión.
  useEffect(() => {
    if (!signedIn) {
      setReferralCode(null);
      return;
    }
    let cancelled = false;
    void fetchMyReferralCode()
      .then((code) => {
        if (!cancelled) setReferralCode(code);
      })
      .catch(() => {
        /* silent */
      });
    return () => {
      cancelled = true;
    };
  }, [signedIn]);
  const tiers = getTiers();
  const tier = tierFor(user.points, tiers);
  const next = nextTier(user.points, tiers);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMove = (e: { clientX: number; clientY: number }) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    setTilt({ x, y });
  };
  const reset = () => setTilt({ x: 0, y: 0 });

  return (
    <Screen padTop={0} padBottom={120}>
      <div style={{ padding: '74px 22px 0' }}>
        <Eyebrow>
          {t('member')} · {t('yourCard')}
        </Eyebrow>
        <H1 style={{ fontSize: 36, marginTop: 8 }}>
          {lang === 'es' ? 'Tu tarjeta DSR' : 'Your DSR card'}
        </H1>
      </div>

      {/* The Card */}
      <div style={{ padding: '30px 22px', perspective: 1200 }}>
        <div
          ref={cardRef}
          onMouseMove={onMove}
          onMouseLeave={reset}
          onTouchMove={(e) => {
            if (e.touches[0])
              onMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
          }}
          onTouchEnd={reset}
          style={{
            aspectRatio: 1.586,
            background:
              tier.id === 'noir'
                ? 'linear-gradient(135deg, #0A0908 0%, #1B1815 50%, #0A0908 100%)'
                : tier.id === 'gold'
                  ? 'linear-gradient(135deg, #C9A96E 0%, #EBD5A8 35%, #A88B4F 70%, #D4B886 100%)'
                  : 'linear-gradient(135deg, #ECE5D7 0%, #FBF8F1 50%, #D9CFB9 100%)',
            boxShadow: `0 30px 80px ${T.gold}33, 0 0 0 1px ${T.gold}44`,
            position: 'relative',
            overflow: 'hidden',
            transform: `rotateY(${tilt.x * 8}deg) rotateX(${-tilt.y * 8}deg)`,
            transition: 'transform .15s',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* shimmer */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(${135 + tilt.x * 30}deg, transparent 30%, rgba(255,255,255,${tier.id === 'noir' ? 0.06 : 0.4}) 50%, transparent 70%)`,
              mixBlendMode: 'overlay',
              transition: 'background .15s',
            }}
          />
          {/* engraved pattern */}
          <svg
            style={{ position: 'absolute', top: 18, right: 18, opacity: 0.3 }}
            width="60"
            height="60"
            viewBox="0 0 60 60"
            fill="none"
          >
            <circle
              cx="30"
              cy="30"
              r="28"
              stroke={tier.id === 'noir' ? '#D4B886' : '#0A0908'}
              strokeWidth="0.5"
            />
            <circle
              cx="30"
              cy="30"
              r="22"
              stroke={tier.id === 'noir' ? '#D4B886' : '#0A0908'}
              strokeWidth="0.5"
            />
            <path
              d="M30 6 L30 54 M6 30 L54 30 M12 12 L48 48 M48 12 L12 48"
              stroke={tier.id === 'noir' ? '#D4B886' : '#0A0908'}
              strokeWidth="0.3"
            />
          </svg>
          <div style={{ position: 'absolute', top: 24, left: 24 }}>
            <div
              style={{
                fontFamily: T.serif,
                fontSize: 26,
                fontStyle: 'italic',
                fontWeight: 300,
                color: tier.id === 'noir' ? '#D4B886' : '#0A0908',
                lineHeight: 1,
              }}
            >
              DSR
            </div>
            <Tiny
              style={{
                marginTop: 4,
                color:
                  tier.id === 'noir'
                    ? 'rgba(212,184,134,0.7)'
                    : 'rgba(10,9,8,0.5)',
                fontSize: 9,
                letterSpacing: 1.4,
              }}
            >
              MAISON DE BEAUTÉ
            </Tiny>
          </div>
          <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
            <Tiny
              style={{
                color:
                  tier.id === 'noir'
                    ? 'rgba(212,184,134,0.6)'
                    : 'rgba(10,9,8,0.5)',
                letterSpacing: 1.5,
                fontSize: 9,
              }}
            >
              {tier.name[lang].toUpperCase()} · {user.fullName.toUpperCase()}
            </Tiny>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: 14,
                marginTop: 6,
                color: tier.id === 'noir' ? '#D4B886' : '#0A0908',
                letterSpacing: 2,
              }}
            >
              5290 · 0294 · {user.joined.split('-')[0]}
            </div>
          </div>
        </div>
        <Tiny
          muted
          style={{
            textAlign: 'center',
            marginTop: 14,
            letterSpacing: 0.4,
            textTransform: 'none',
          }}
        >
          {lang === 'es' ? '· Mueve para inclinar la tarjeta ·' : '· Move to tilt the card ·'}
        </Tiny>
      </div>

      {/* Stats grid */}
      <div
        style={{
          padding: '0 22px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 1,
          background: T.line,
          marginTop: 6,
        }}
      >
        {[
          { v: user.points.toLocaleString(), l: t('points') },
          { v: String(user.visits), l: t('visits') },
          { v: `${sym}${user.spent.toLocaleString()}`, l: t('spent') },
        ].map((s, i) => (
          <div
            key={i}
            style={{ background: T.bg, padding: '20px 6px', textAlign: 'center' }}
          >
            <div
              style={{
                fontFamily: T.serif,
                fontSize: 26,
                fontStyle: 'italic',
                color: T.gold,
                lineHeight: 1,
                fontWeight: 300,
              }}
            >
              {s.v}
            </div>
            <Tiny muted style={{ marginTop: 6, fontSize: 9, letterSpacing: 1.4 }}>
              {s.l}
            </Tiny>
          </div>
        ))}
      </div>

      {/* Progress to next tier */}
      {next && (
        <div style={{ padding: '30px 22px 0' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 12,
            }}
          >
            <Eyebrow>
              {lang === 'es' ? 'Camino a' : 'Path to'} {next.name[lang]}
            </Eyebrow>
            <Tiny style={{ color: T.gold, letterSpacing: 0.4, textTransform: 'none' }}>
              {(next.min - user.points).toLocaleString()} {t('points')}
            </Tiny>
          </div>
          <div style={{ height: 4, background: T.surface, position: 'relative', overflow: 'hidden' }}>
            <div
              style={{
                width: `${((user.points - tier.min) / (next.min - tier.min)) * 100}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${T.gold}, ${T.goldHi})`,
                transition: 'width 1s',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <Tiny
              muted
              style={{ fontSize: 10, letterSpacing: 0.4, textTransform: 'none' }}
            >
              {tier.name[lang]}
            </Tiny>
            <Tiny
              muted
              style={{ fontSize: 10, letterSpacing: 0.4, textTransform: 'none' }}
            >
              {next.name[lang]}
            </Tiny>
          </div>
        </div>
      )}

      {/* Perks */}
      <div style={{ padding: '34px 22px 0' }}>
        <Eyebrow>
          {t('perks')} · {tier.name[lang]}
        </Eyebrow>
        <div style={{ marginTop: 16 }}>
          {PERKS[tier.id].map((p, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 14,
                padding: '14px 0',
                borderTop: i === 0 ? 'none' : `1px solid ${T.line}`,
              }}
            >
              <Numeral
                value={['I', 'II', 'III', 'IV', 'V'][i]}
                style={{ fontSize: 14, width: 24 }}
              />
              <Body style={{ fontSize: 13, lineHeight: 1.5 }}>
                {lang === 'es' ? p.es : p.en}
              </Body>
            </div>
          ))}
        </div>
      </div>

      {/* Gift Cards entry */}
      <div style={{ padding: '32px 22px 0' }}>
        <div
          onClick={() => go('gift-cards')}
          className="dsr-press"
          style={{
            padding: 22,
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #0A0908, #1c1814)',
            boxShadow: `inset 0 0 0 1px ${T.gold}55`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              right: 14,
              bottom: 14,
              boxShadow: `inset 0 0 0 0.5px ${T.gold}33`,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              position: 'relative',
            }}
          >
            <div style={{ flex: 1 }}>
              <Tiny
                style={{
                  color: T.goldHi,
                  fontSize: 9,
                  letterSpacing: 1.6,
                  fontWeight: 600,
                }}
              >
                DSR · MAISON
              </Tiny>
              <H2
                style={{
                  marginTop: 8,
                  fontSize: 26,
                  color: '#F5EDDC',
                  fontFamily: T.serif,
                  fontStyle: 'italic',
                  fontWeight: 300,
                }}
              >
                {t('giftCards')}
              </H2>
              <Tiny
                muted
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  letterSpacing: 0.4,
                  textTransform: 'none',
                  color: 'rgba(245,237,220,0.65)',
                  maxWidth: 220,
                  lineHeight: 1.5,
                }}
              >
                {t('giftCardsSub')}
              </Tiny>
            </div>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 999,
                flexShrink: 0,
                background: T.gold,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ico size={14} color="#0A0908">
                {Icons.arrow}
              </Ico>
            </div>
          </div>
          <div
            style={{
              marginTop: 18,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              position: 'relative',
            }}
          >
            <Tiny
              style={{
                fontFamily: 'monospace',
                fontSize: 9,
                letterSpacing: 1.5,
                color: 'rgba(212,184,134,0.6)',
              }}
            >
              DSR · GIFT
            </Tiny>
            <Tiny
              style={{
                fontFamily: 'monospace',
                fontSize: 9,
                letterSpacing: 1.5,
                color: 'rgba(212,184,134,0.6)',
              }}
            >
              {fmt(50)} — {fmt(1000)}
            </Tiny>
          </div>
        </div>
      </div>

      {/* Redeem */}
      <div style={{ padding: '30px 22px 0' }}>
        <Eyebrow>{lang === 'es' ? 'Canjea tus puntos' : 'Redeem your points'}</Eyebrow>
        <div style={{ marginTop: 14 }}>
          {[
            { points: 500, es: 'Manicura express', en: 'Express manicure' },
            { points: 1500, es: 'Brushing Couture', en: 'Couture Blowout' },
            { points: 3000, es: 'Facial Signature', en: 'Signature Facial' },
            { points: 5000, es: 'Ritual de Oro 24K', en: '24K Gold Ritual' },
          ].map((r, i) => {
            const can = user.points >= r.points;
            return (
              <div
                key={i}
                style={{
                  padding: '16px 0',
                  borderTop: i === 0 ? 'none' : `1px solid ${T.line}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: can ? 1 : 0.5,
                }}
              >
                <div>
                  <Body style={{ fontSize: 14 }}>{lang === 'es' ? r.es : r.en}</Body>
                  <Tiny
                    style={{
                      color: T.gold,
                      marginTop: 4,
                      letterSpacing: 0.4,
                      textTransform: 'none',
                      fontSize: 11,
                    }}
                  >
                    {r.points.toLocaleString()} {t('points')}
                  </Tiny>
                </div>
                <button
                  disabled={!can}
                  className="dsr-press"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: can ? 'pointer' : 'not-allowed',
                    fontFamily: T.sans,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: 1.6,
                    textTransform: 'uppercase',
                    color: can ? T.gold : T.textFaint,
                    padding: '8px 14px',
                    boxShadow: `inset 0 0 0 1px ${can ? T.gold : T.line}`,
                  }}
                >
                  {t('redeem')}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Programa de amigas — solo si signed in (necesita código del user). */}
      {signedIn && referralCode && (
        <div style={{ padding: '40px 22px 0' }}>
          <Eyebrow>
            {lang === 'es' ? 'Programa Amigas' : 'Friends Program'}
          </Eyebrow>
          <H2 style={{ marginTop: 6, fontSize: 22, fontStyle: 'italic' }}>
            {lang === 'es' ? 'Invita y gana' : 'Invite and earn'}
          </H2>
          <Body
            muted
            style={{ marginTop: 8, fontSize: 13, lineHeight: 1.55 }}
          >
            {lang === 'es'
              ? `Comparte tu código. Cuando una amiga reserve su primera cita, ambas reciben un crédito de ${fmt(50)}.`
              : `Share your code. When a friend books her first visit, you both get a ${fmt(50)} credit.`}
          </Body>
          <div
            style={{
              marginTop: 16,
              padding: 18,
              background: T.surface,
              boxShadow: `inset 0 0 0 1px ${T.gold}33`,
              display: 'flex',
              gap: 14,
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1 }}>
              <Tiny
                muted
                style={{
                  fontSize: 9,
                  letterSpacing: 1.4,
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                {lang === 'es' ? 'TU CÓDIGO' : 'YOUR CODE'}
              </Tiny>
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: 20,
                  letterSpacing: 4,
                  color: T.gold,
                  fontWeight: 600,
                }}
              >
                {referralCode}
              </div>
            </div>
            <button
              onClick={async () => {
                const settings = getSettings();
                const shareText =
                  lang === 'es'
                    ? `Te invito a ${settings.name}. Usa mi código ${referralCode} en tu primera cita.`
                    : `Join me at ${settings.name}. Use my code ${referralCode} on your first visit.`;
                const shareUrl = `${window.location.origin}/?ref=${referralCode}`;
                if (navigator.share) {
                  try {
                    await navigator.share({
                      title: settings.name,
                      text: shareText,
                      url: shareUrl,
                    });
                    return;
                  } catch {
                    /* user cancelled — fallback al copy. */
                  }
                }
                try {
                  await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                  showToast({
                    kind: 'success',
                    message:
                      lang === 'es'
                        ? 'Copiado al portapapeles'
                        : 'Copied to clipboard',
                  });
                } catch {
                  showToast({
                    kind: 'error',
                    message:
                      lang === 'es'
                        ? 'No pudimos compartir'
                        : 'Could not share',
                  });
                }
              }}
              className="dsr-press"
              style={{
                background: T.gold,
                border: 'none',
                cursor: 'pointer',
                padding: '12px 18px',
                color: T.bg,
                fontFamily: T.sans,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                display: 'flex',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <Ico size={12} color={T.bg}>
                {Icons.share}
              </Ico>
              {lang === 'es' ? 'Compartir' : 'Share'}
            </button>
          </div>
          <Tiny
            muted
            style={{
              marginTop: 10,
              fontSize: 10,
              letterSpacing: 0.4,
              textTransform: 'none',
              fontStyle: 'italic',
              fontFamily: T.serif,
              display: 'block',
            }}
          >
            {lang === 'es'
              ? 'El crédito se acredita cuando tu invitada complete su primera cita.'
              : 'Credit posts when your friend completes her first visit.'}
          </Tiny>
        </div>
      )}
    </Screen>
  );
}
