// DSR Admin — Sección stub para módulos aún no implementados.
// Muestra un placeholder editorial con el nombre + descripción + íconos.

import type { ReactNode } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/LangProvider';
import { Body, Eyebrow, H1, Ico, Tiny } from '../../components/atoms';

interface StubSectionProps {
  title: string;
  description: string;
  bullets?: string[];
  icon?: ReactNode;
}

export function StubSection({
  title,
  description,
  bullets,
  icon,
}: StubSectionProps) {
  const T = useTheme();
  const { lang } = useI18n();
  return (
    <div style={{ maxWidth: 720 }}>
      <Eyebrow>{lang === 'es' ? 'Próximamente' : 'Coming soon'}</Eyebrow>
      <H1 style={{ marginTop: 8, fontSize: 32, fontStyle: 'italic' }}>{title}</H1>
      <Body
        muted
        style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6, maxWidth: 540 }}
      >
        {description}
      </Body>

      {/* Icon + bullets card */}
      <div
        style={{
          marginTop: 24,
          padding: 24,
          background: T.surface,
          boxShadow: `inset 0 0 0 1px ${T.line}`,
          display: 'flex',
          gap: 22,
          alignItems: 'flex-start',
        }}
      >
        {icon && (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: `radial-gradient(circle at 30% 30%, ${T.goldHi}, ${T.gold} 40%, ${T.goldDeep})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: `0 6px 24px ${T.gold}22`,
            }}
          >
            <Ico size={22} color={T.bg} stroke={1.6}>
              {icon}
            </Ico>
          </div>
        )}
        <div style={{ flex: 1 }}>
          <Tiny
            muted
            style={{
              letterSpacing: 1.2,
              fontSize: 9,
              marginBottom: 10,
              display: 'block',
            }}
          >
            {lang === 'es' ? 'Funcionalidades planeadas' : 'Planned features'}
          </Tiny>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {(bullets ?? []).map((b, i) => (
              <li
                key={i}
                style={{
                  padding: '8px 0',
                  borderTop: i === 0 ? 'none' : `1px solid ${T.line}`,
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 999,
                    background: T.gold,
                    marginTop: 7,
                    flexShrink: 0,
                  }}
                />
                <Body style={{ fontSize: 13, lineHeight: 1.5 }}>{b}</Body>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
