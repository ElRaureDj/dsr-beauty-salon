// DSR — Layout atoms (Image with fallback, full-screen scroll wrapper)
import { useState, type CSSProperties, type ReactNode } from 'react';
import { useTheme } from '../../theme/ThemeProvider';

interface ImgProps {
  src: string;
  alt?: string;
  style?: CSSProperties;
  fallback?: string;
}

export function Img({ src, alt, style, fallback = '#1B1815' }: ImgProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: fallback,
        ...style,
      }}
    >
      <img
        src={src}
        alt={alt || ''}
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: loaded ? 1 : 0,
          transition: 'opacity .5s',
          display: 'block',
        }}
      />
    </div>
  );
}

interface ScreenProps {
  children: ReactNode;
  padBottom?: number;
  padTop?: number;
  style?: CSSProperties;
}

export function Screen({ children, padBottom = 100, padTop = 60, style }: ScreenProps) {
  const T = useTheme();
  return (
    <div
      className="dsr dsr-scroll"
      style={{
        width: '100%',
        height: '100%',
        background: T.bg,
        color: T.text,
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        ...style,
      }}
    >
      {T.grain && (
        <div
          className="dsr-grain"
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.55,
            pointerEvents: 'none',
            mixBlendMode: 'overlay',
          }}
        />
      )}
      <div style={{ paddingTop: padTop, paddingBottom: padBottom, position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
