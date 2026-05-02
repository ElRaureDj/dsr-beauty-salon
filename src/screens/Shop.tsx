// DSR — Shop / Boutique (featured product + 2-col grid)
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import {
  Body,
  Eyebrow,
  H1,
  H2,
  Img,
  Screen,
  Tiny,
} from '../components/atoms';
import { useCatalog } from '../data/CatalogProvider';
import { useRouter } from '../router/Router';

export function Shop() {
  const T = useTheme();
  const { t, lang } = useI18n();
  const { go } = useRouter();
  const products = useCatalog().getAllProducts();

  const featured = products[0];

  return (
    <Screen padTop={0} padBottom={120}>
      <div style={{ padding: '74px 22px 0' }}>
        <Eyebrow>{t('boutique')}</Eyebrow>
        <H1 style={{ marginTop: 8, fontSize: 40 }}>Boutique</H1>
        <Body muted style={{ marginTop: 12, fontSize: 13, lineHeight: 1.55 }}>
          {lang === 'es'
            ? 'Una selección curada de la casa. Pocos productos, todos esenciales.'
            : 'A curated selection from the house. Few products, all essential.'}
        </Body>
      </div>

      {/* Featured product */}
      <div style={{ padding: '32px 22px 0' }}>
        <div onClick={() => go('product', { id: featured.id })} style={{ cursor: 'pointer' }}>
          <div style={{ position: 'relative' }}>
            <Img src={featured.photo} style={{ width: '100%', aspectRatio: '4/5' }} />
            {featured.badge_es && (
              <div
                style={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  background: 'rgba(10,9,8,0.75)',
                  backdropFilter: 'blur(10px)',
                  padding: '6px 12px',
                  boxShadow: `inset 0 0 0 1px ${T.gold}55`,
                }}
              >
                <Tiny style={{ color: T.goldHi, letterSpacing: 1.5, fontSize: 9 }}>
                  {lang === 'es' ? featured.badge_es : featured.badge_en}
                </Tiny>
              </div>
            )}
          </div>
          <div
            style={{
              marginTop: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div>
              <Tiny muted style={{ letterSpacing: 1.4 }}>
                {featured.line}
              </Tiny>
              <H2 style={{ marginTop: 6, fontSize: 26 }}>
                {lang === 'es' ? featured.name_es : featured.name_en}
              </H2>
              <Tiny
                muted
                style={{ marginTop: 6, letterSpacing: 0.3, textTransform: 'none' }}
              >
                {lang === 'es' ? featured.cat_es : featured.cat_en} · {featured.size}
              </Tiny>
            </div>
            <div
              style={{
                fontFamily: T.serif,
                fontStyle: 'italic',
                fontSize: 22,
                color: T.gold,
                fontWeight: 300,
              }}
            >
              €{featured.price}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: '36px 22px 0' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 18,
          }}
        >
          <Eyebrow>{lang === 'es' ? 'La colección' : 'The collection'}</Eyebrow>
          <Tiny muted>· {products.length} ·</Tiny>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            columnGap: 12,
          }}
        >
          {products.slice(1).map((p) => (
            <div
              key={p.id}
              onClick={() => go('product', { id: p.id })}
              className="dsr-press"
              style={{ cursor: 'pointer' }}
            >
              <div style={{ position: 'relative', aspectRatio: '3/4' }}>
                <Img src={p.photo} style={{ width: '100%', height: '100%' }} />
                {p.badge_es && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      background: 'rgba(10,9,8,0.75)',
                      backdropFilter: 'blur(10px)',
                      padding: '4px 8px',
                      boxShadow: `inset 0 0 0 1px ${T.gold}55`,
                    }}
                  >
                    <Tiny
                      style={{ color: T.goldHi, letterSpacing: 1.2, fontSize: 8 }}
                    >
                      {lang === 'es' ? p.badge_es : p.badge_en}
                    </Tiny>
                  </div>
                )}
              </div>
              <div style={{ marginTop: 10 }}>
                <Tiny muted style={{ fontSize: 9, letterSpacing: 1.2 }}>
                  {p.line}
                </Tiny>
                <Body
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    fontWeight: 500,
                    lineHeight: 1.3,
                  }}
                >
                  {lang === 'es' ? p.name_es : p.name_en}
                </Body>
                <div
                  style={{
                    marginTop: 4,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Tiny
                    muted
                    style={{
                      fontSize: 10,
                      letterSpacing: 0.3,
                      textTransform: 'none',
                    }}
                  >
                    {p.size}
                  </Tiny>
                  <Tiny
                    style={{
                      color: T.gold,
                      fontFamily: T.serif,
                      fontStyle: 'italic',
                      fontSize: 14,
                    }}
                  >
                    €{p.price}
                  </Tiny>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}
