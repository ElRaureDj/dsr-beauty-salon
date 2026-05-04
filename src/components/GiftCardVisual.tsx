// DSR — Reusable gift-card visual (compact thumbnail or full-size preview)
import { useTheme } from '../theme/ThemeProvider';
import { useCurrency } from '../lib/format';
import type { GiftCardDesign } from '../types';

interface GiftCardVisualProps {
  design: GiftCardDesign;
  amount?: number | null;
  recipient?: string;
  compact?: boolean;
}

export function GiftCardVisual({
  design,
  amount,
  recipient,
  compact = false,
}: GiftCardVisualProps) {
  const T = useTheme();
  const { format: fmt } = useCurrency();
  const w = compact ? 180 : '100%';
  const h = compact ? 112 : 220;
  const padX = compact ? 14 : 24;
  const padY = compact ? 14 : 22;
  const titleSize = compact ? 14 : 22;
  const numSize = compact ? 18 : 36;

  return (
    <div
      style={{
        width: w,
        height: h,
        position: 'relative',
        background: design.bg,
        color: design.fg,
        padding: `${padY}px ${padX}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        boxShadow: `0 1px 3px rgba(0,0,0,0.15), inset 0 0 0 1px ${design.accent}33`,
      }}
    >
      {/* hairline frame */}
      <div
        style={{
          position: 'absolute',
          top: compact ? 8 : 14,
          left: compact ? 8 : 14,
          right: compact ? 8 : 14,
          bottom: compact ? 8 : 14,
          boxShadow: `inset 0 0 0 0.5px ${design.accent}55`,
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
        <div>
          <div
            style={{
              fontFamily: T.sans,
              fontSize: compact ? 7 : 9,
              letterSpacing: 2,
              fontWeight: 600,
            }}
          >
            DSR · MAISON
          </div>
          <div
            style={{
              fontFamily: T.serif,
              fontStyle: 'italic',
              fontSize: titleSize,
              fontWeight: 300,
              marginTop: compact ? 4 : 8,
              color: design.accent,
            }}
          >
            {design.name_es}
          </div>
        </div>
        {amount != null && (
          <div
            style={{
              fontFamily: T.serif,
              fontStyle: 'italic',
              fontSize: numSize,
              fontWeight: 300,
              color: design.accent,
              lineHeight: 1,
            }}
          >
            {amount != null ? fmt(amount) : ''}
          </div>
        )}
      </div>
      {!compact && recipient && (
        <div style={{ position: 'relative' }}>
          <div
            style={{
              fontFamily: T.sans,
              fontSize: 8,
              letterSpacing: 1.6,
              fontWeight: 600,
              opacity: 0.7,
            }}
          >
            POUR
          </div>
          <div
            style={{
              fontFamily: T.serif,
              fontStyle: 'italic',
              fontSize: 18,
              marginTop: 4,
              color: design.accent,
            }}
          >
            {recipient}
          </div>
        </div>
      )}
      {!compact && (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: 1.5, opacity: 0.6 }}>
            DSR · GIFT
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: 1.5, opacity: 0.6 }}>
            VALABLE 12 MOIS
          </div>
        </div>
      )}
    </div>
  );
}
