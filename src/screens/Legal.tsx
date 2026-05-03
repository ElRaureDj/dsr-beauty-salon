// DSR — Legal screen.
// Tres documentos: política de cancelación, términos, privacidad.
// Tabs en el header. Copy bilingüe desde src/data/legal.ts.
//
// Accesible desde Profile y desde links inline en checkout/booking.
// Acepta param `doc` para abrir en una sección específica.

import { useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import {
  Body,
  Chip,
  Eyebrow,
  H1,
  H3,
  HeaderBar,
  Screen,
  Tiny,
} from '../components/atoms';
import { useRouter } from '../router/Router';
import { LEGAL, type LegalDocId } from '../data/legal';

const TABS: { id: LegalDocId; es: string; en: string }[] = [
  { id: 'cancellation', es: 'Cancelación', en: 'Cancellation' },
  { id: 'terms', es: 'Términos', en: 'Terms' },
  { id: 'privacy', es: 'Privacidad', en: 'Privacy' },
];

interface LegalProps {
  /** Documento inicial a mostrar. Default: cancellation. */
  doc?: LegalDocId;
}

export function Legal({ doc = 'cancellation' }: LegalProps) {
  const T = useTheme();
  const { lang } = useI18n();
  const { go } = useRouter();
  const [active, setActive] = useState<LegalDocId>(doc);

  const docContent = LEGAL[active][lang];

  return (
    <Screen padTop={0} padBottom={60}>
      <HeaderBar
        onBack={() => go('profile')}
        title={lang === 'es' ? 'Información legal' : 'Legal info'}
      />

      <div style={{ padding: '108px 22px 0' }}>
        {/* Tabs */}
        <div
          className="dsr-scroll"
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            marginBottom: 22,
            paddingBottom: 4,
          }}
        >
          {TABS.map((t) => (
            <Chip
              key={t.id}
              active={active === t.id}
              onClick={() => setActive(t.id)}
            >
              {lang === 'es' ? t.es : t.en}
            </Chip>
          ))}
        </div>

        {/* Doc */}
        <Eyebrow style={{ color: T.gold }}>
          {lang === 'es'
            ? `Actualizado · ${new Date(docContent.updated).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`
            : `Updated · ${new Date(docContent.updated).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`}
        </Eyebrow>
        <H1 style={{ marginTop: 8, fontSize: 32 }}>{docContent.title}</H1>

        <Body
          muted
          style={{
            marginTop: 16,
            fontSize: 14,
            lineHeight: 1.65,
            fontStyle: 'italic',
            fontFamily: T.serif,
          }}
        >
          {docContent.intro}
        </Body>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {docContent.sections.map((section) => (
            <div key={section.heading}>
              <H3 style={{ fontSize: 17, color: T.gold, fontStyle: 'italic' }}>
                {section.heading}
              </H3>
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {section.body.map((p, i) => (
                  <Body
                    key={i}
                    style={{ fontSize: 13, lineHeight: 1.6, color: T.text }}
                  >
                    {p}
                  </Body>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Tiny
          muted
          style={{
            marginTop: 36,
            display: 'block',
            textAlign: 'center',
            fontSize: 11,
            letterSpacing: 0.4,
            textTransform: 'none',
            fontStyle: 'italic',
            fontFamily: T.serif,
          }}
        >
          {lang === 'es'
            ? '¿Dudas? Escríbenos a hola@dsr-maison.com'
            : 'Questions? Write to hola@dsr-maison.com'}
        </Tiny>
      </div>
    </Screen>
  );
}
