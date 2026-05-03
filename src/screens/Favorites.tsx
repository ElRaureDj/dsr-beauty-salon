// DSR — Favorites screen.
// Lista de productos, servicios y artistas favoriteados por el customer.
// Tres secciones; cada una linkea al detalle correspondiente.
// Si el customer aún no favoritó nada, empty state editorial.

import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import {
  Body,
  Eyebrow,
  H1,
  H3,
  HeaderBar,
  Ico,
  Icons,
  Img,
  Screen,
  Tiny,
} from '../components/atoms';
import { useCatalog } from '../data/CatalogProvider';
import { useFavorites } from '../data/FavoritesProvider';
import { useRouter } from '../router/Router';

export function Favorites() {
  const T = useTheme();
  const { lang } = useI18n();
  const { go } = useRouter();
  const { byKind } = useFavorites();
  const { getProduct, getService, getArtisan } = useCatalog();

  const products = byKind('product')
    .map((id) => getProduct(id))
    .filter((p): p is NonNullable<ReturnType<typeof getProduct>> => !!p);
  const services = byKind('service')
    .map((id) => getService(id))
    .filter((s): s is NonNullable<ReturnType<typeof getService>> => !!s);
  const artisans = byKind('artisan')
    .map((id) => getArtisan(id))
    .filter((a): a is NonNullable<ReturnType<typeof getArtisan>> => !!a);

  const totalCount = products.length + services.length + artisans.length;

  return (
    <Screen padTop={0} padBottom={40}>
      <HeaderBar
        onBack={() => go('profile')}
        title={lang === 'es' ? 'Favoritos' : 'Favorites'}
      />

      <div style={{ padding: '108px 22px 0' }}>
        <Eyebrow>{lang === 'es' ? 'Tu maison curada' : 'Your curated maison'}</Eyebrow>
        <H1 style={{ marginTop: 8, fontSize: 32 }}>
          {lang === 'es' ? 'Favoritos' : 'Favorites'}
        </H1>
        <Body muted style={{ marginTop: 8, fontSize: 13, lineHeight: 1.55 }}>
          {totalCount === 0
            ? lang === 'es'
              ? 'Toca el corazón en cualquier producto, servicio o artista para tenerlo a mano.'
              : 'Tap the heart on any product, service, or artisan to keep them at hand.'
            : lang === 'es'
              ? `${totalCount} ${totalCount === 1 ? 'guardado' : 'guardados'}`
              : `${totalCount} saved`}
        </Body>

        {totalCount === 0 && (
          <div
            style={{
              marginTop: 60,
              textAlign: 'center',
              opacity: 0.7,
            }}
          >
            <Ico size={36} color={T.gold} stroke={1.4}>
              {Icons.heart}
            </Ico>
          </div>
        )}

        {/* Productos */}
        {products.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <Eyebrow>{lang === 'es' ? 'Productos' : 'Products'}</Eyebrow>
            <div
              style={{
                marginTop: 12,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}
            >
              {products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => go('product', { id: p.id })}
                  className="dsr-press"
                  style={{ cursor: 'pointer' }}
                >
                  <Img src={p.photo} style={{ width: '100%', aspectRatio: '4/5' }} />
                  <Body
                    style={{ marginTop: 8, fontSize: 12, fontWeight: 500 }}
                  >
                    {lang === 'es' ? p.name_es : p.name_en}
                  </Body>
                  <Tiny
                    style={{
                      color: T.gold,
                      fontFamily: T.serif,
                      fontStyle: 'italic',
                      fontSize: 13,
                      marginTop: 2,
                    }}
                  >
                    €{p.price}
                  </Tiny>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Servicios */}
        {services.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <Eyebrow>{lang === 'es' ? 'Servicios' : 'Services'}</Eyebrow>
            <div
              style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              {services.map((s) => (
                <div
                  key={s.id}
                  onClick={() => go('service', { id: s.id })}
                  className="dsr-press"
                  style={{
                    padding: 16,
                    background: T.surface,
                    boxShadow: `inset 0 0 0 1px ${T.line}`,
                    cursor: 'pointer',
                  }}
                >
                  <H3 style={{ fontSize: 16 }}>{lang === 'es' ? s.es : s.en}</H3>
                  <Tiny
                    muted
                    style={{
                      marginTop: 4,
                      fontSize: 11,
                      letterSpacing: 0.3,
                      textTransform: 'none',
                    }}
                  >
                    {s.duration} min · €{s.price}
                  </Tiny>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Artistas */}
        {artisans.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <Eyebrow>{lang === 'es' ? 'Artistas' : 'Artisans'}</Eyebrow>
            <div
              className="dsr-scroll"
              style={{ marginTop: 12, display: 'flex', gap: 10, overflowX: 'auto' }}
            >
              {artisans.map((a) => (
                <div
                  key={a.id}
                  onClick={() => go('artisan', { id: a.id })}
                  className="dsr-press"
                  style={{ flexShrink: 0, width: 130, cursor: 'pointer' }}
                >
                  <Img src={a.photo} style={{ width: '100%', height: 160 }} />
                  <Tiny
                    style={{
                      marginTop: 8,
                      fontSize: 11,
                      letterSpacing: 0.3,
                      textTransform: 'none',
                      fontWeight: 500,
                    }}
                  >
                    {a.name}
                  </Tiny>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Screen>
  );
}
