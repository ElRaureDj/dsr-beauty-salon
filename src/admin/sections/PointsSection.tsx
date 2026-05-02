// DSR Admin — Reglas de puntos por tier.
// 3 tarjetas (Pearl, Oro, Noir) con threshold + multiplicadores por categoría.

import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/LangProvider';
import { Body, Eyebrow, H1, H3, Tiny } from '../../components/atoms';
import { useCatalog } from '../../data/CatalogProvider';
import type { TierRule } from '../../types';

const TIER_NAMES: Record<TierRule['tierId'], { es: string; en: string; color: string }> = {
  pearl: { es: 'Perla', en: 'Pearl', color: '#ECE5D7' },
  gold: { es: 'Oro', en: 'Gold', color: '#C9A96E' },
  noir: { es: 'Noir', en: 'Noir', color: '#0A0A0A' },
};

export function PointsSection() {
  const T = useTheme();
  const { lang } = useI18n();
  const { getTierRules, updateTierRule } = useCatalog();
  const rules = getTierRules();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Eyebrow>{lang === 'es' ? 'Fidelidad' : 'Loyalty'}</Eyebrow>
        <H1 style={{ marginTop: 8, fontSize: 32, fontStyle: 'italic' }}>
          {lang === 'es' ? 'Puntos & Tiers' : 'Points & Tiers'}
        </H1>
        <Body muted style={{ marginTop: 8, fontSize: 13, maxWidth: 540 }}>
          {lang === 'es'
            ? 'Threshold de cada tier (puntos requeridos) + multiplicador por categoría de servicio. La cliente gana puntos = (precio × multiplicador) por cada visita.'
            : 'Each tier threshold (points required) + multiplier per service category. The client earns points = (price × multiplier) per visit.'}
        </Body>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 14,
        }}
      >
        {rules.map((r) => (
          <TierCard
            key={r.tierId}
            rule={r}
            onUpdate={(fields) => updateTierRule(r.tierId, fields)}
            T={T}
            lang={lang}
          />
        ))}
      </div>
    </div>
  );
}

function TierCard({
  rule,
  onUpdate,
  T,
  lang,
}: {
  rule: TierRule;
  onUpdate: (fields: Partial<Omit<TierRule, 'tierId'>>) => void;
  T: ReturnType<typeof useTheme>;
  lang: 'es' | 'en';
}) {
  const meta = TIER_NAMES[rule.tierId];
  return (
    <div
      style={{
        background: T.surface,
        boxShadow: `inset 0 0 0 1px ${T.line}`,
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Tier accent stripe */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: meta.color,
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <H3 style={{ fontSize: 22, fontStyle: 'italic', color: T.gold }}>
          {meta[lang]}
        </H3>
        <Tiny
          muted
          style={{
            fontFamily: T.mono,
            fontSize: 10,
            letterSpacing: 0.4,
            textTransform: 'none',
          }}
        >
          {rule.tierId}
        </Tiny>
      </div>

      <div style={{ marginTop: 16 }}>
        <Tiny
          muted
          style={{ fontSize: 9, letterSpacing: 1.2, marginBottom: 4, display: 'block' }}
        >
          {lang === 'es' ? 'PUNTOS REQUERIDOS' : 'POINTS REQUIRED'}
        </Tiny>
        <input
          type="number"
          value={rule.thresholdPoints}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n)) onUpdate({ thresholdPoints: Math.max(0, n) });
          }}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: T.bgAlt,
            border: 'none',
            boxShadow: `inset 0 0 0 1px ${T.line}`,
            color: T.text,
            fontFamily: T.serif,
            fontStyle: 'italic',
            fontSize: 18,
            outline: 'none',
            textAlign: 'right',
          }}
        />
      </div>

      <div style={{ marginTop: 18 }}>
        <Tiny
          muted
          style={{ fontSize: 9, letterSpacing: 1.2, marginBottom: 8, display: 'block' }}
        >
          {lang === 'es' ? 'MULTIPLICADORES' : 'MULTIPLIERS'}
        </Tiny>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {(['hair', 'nails', 'facial'] as const).map((cat) => (
            <div key={cat}>
              <Tiny
                muted
                style={{
                  fontSize: 9,
                  letterSpacing: 0.8,
                  marginBottom: 4,
                  display: 'block',
                  textTransform: 'none',
                }}
              >
                {lang === 'es'
                  ? cat === 'hair' ? 'Pelo' : cat === 'nails' ? 'Uñas' : 'Facial'
                  : cat === 'hair' ? 'Hair' : cat === 'nails' ? 'Nails' : 'Facial'}
              </Tiny>
              <input
                type="number"
                step="0.25"
                value={rule.multipliers[cat]}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isFinite(n))
                    onUpdate({
                      multipliers: { ...rule.multipliers, [cat]: Math.max(0, n) },
                    });
                }}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: T.bgAlt,
                  border: 'none',
                  boxShadow: `inset 0 0 0 1px ${T.line}`,
                  color: T.gold,
                  fontFamily: T.mono,
                  fontSize: 13,
                  outline: 'none',
                  textAlign: 'right',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
