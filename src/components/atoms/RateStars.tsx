// DSR — Selector de rating 1-5 estrellas (controlado).
// 5 estrellas clickeables. Hover preview opcional. Tamaño y color desde props.

import { useState } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { Ico, Icons } from './Icon';

interface RateStarsProps {
  value: number; // 0-5; 0 = ninguna seleccionada
  onChange: (rating: number) => void;
  size?: number;
  readonly?: boolean;
}

export function RateStars({ value, onChange, size = 28, readonly = false }: RateStarsProps) {
  const T = useTheme();
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <div
      style={{ display: 'flex', gap: 6 }}
      onMouseLeave={() => setHover(null)}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= display;
        return (
          <button
            key={n}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange(n)}
            onMouseEnter={() => !readonly && setHover(n)}
            aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
            className="dsr-press"
            style={{
              background: 'transparent',
              border: 'none',
              padding: 4,
              cursor: readonly ? 'default' : 'pointer',
              display: 'flex',
              transition: 'transform .12s',
            }}
          >
            <Ico
              size={size}
              color={filled ? T.gold : T.lineStrong}
              stroke={filled ? 0 : 1.5}
            >
              {Icons.star}
            </Ico>
          </button>
        );
      })}
    </div>
  );
}
