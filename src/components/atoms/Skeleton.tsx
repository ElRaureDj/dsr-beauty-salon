// DSR — Skeleton placeholder atom.
// Bloque animado para usar como placeholder mientras carga data. Reusa
// la keyframe `dsr-shimmer` global. Variantes: text (line con altura
// estándar de Body), block (caja arbitraria), circle (avatar).
//
// Uso:
//   <Skeleton variant="text" width="60%" />
//   <Skeleton variant="block" height={120} />
//   <Skeleton variant="circle" size={40} />

import { useTheme } from '../../theme/ThemeProvider';

interface SkeletonProps {
  variant?: 'text' | 'block' | 'circle';
  width?: number | string;
  height?: number | string;
  /** Solo para variant='circle'. Sobrescribe width/height. */
  size?: number;
  style?: React.CSSProperties;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  size,
  style,
}: SkeletonProps) {
  const T = useTheme();
  const isCircle = variant === 'circle';
  const w = isCircle ? (size ?? 40) : (width ?? '100%');
  const h = isCircle ? (size ?? 40) : (height ?? (variant === 'text' ? 14 : 80));

  return (
    <div
      aria-hidden="true"
      style={{
        width: w,
        height: h,
        borderRadius: isCircle ? 999 : 2,
        background: `linear-gradient(90deg, ${T.surface} 0%, ${T.surfaceHi} 50%, ${T.surface} 100%)`,
        backgroundSize: '200% 100%',
        animation: 'dsr-shimmer 1.4s ease-in-out infinite',
        ...style,
      }}
    />
  );
}
