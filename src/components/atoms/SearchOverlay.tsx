// DSR — Buscador global.
// Modal full-screen con input arriba, lista de resultados agrupados por
// kind (services, products, artisans, nail looks). Match case-insensitive
// en nombres ES/EN + line/category. Click en resultado navega y cierra.
//
// Vive como atom controlable (open / onClose). El parent decide cuándo
// abrirlo (botón en Home, command-K si lo agregamos en desktop, etc).

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/LangProvider';
import { useCatalog } from '../../data/CatalogProvider';
import { useRouter } from '../../router/Router';
import type { Artisan, NailLook, Product, Service } from '../../types';
import { Body, Eyebrow, Tiny } from './Typography';
import { Ico, Icons } from './Icon';
import { Img } from './Layout';

const ANIMATION_MS = 220;

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

interface ResultGroup {
  services: Service[];
  products: Product[];
  artisans: Artisan[];
  nailLooks: NailLook[];
}

const EMPTY: ResultGroup = { services: [], products: [], artisans: [], nailLooks: [] };

function matches(haystacks: (string | undefined)[], needle: string): boolean {
  const n = needle.toLowerCase();
  return haystacks.some((h) => h && h.toLowerCase().includes(n));
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const T = useTheme();
  const { lang } = useI18n();
  const { go } = useRouter();
  const { getAllServices, getAllProducts, getAllArtisans, getNailLooks } = useCatalog();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset y autofocus al abrir.
  useEffect(() => {
    if (open) {
      setQuery('');
      const id = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  // Escape para cerrar.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const results = useMemo<ResultGroup>(() => {
    const q = query.trim();
    if (q.length < 2) return EMPTY;
    return {
      services: getAllServices()
        .filter((s) => matches([s.es, s.en, s.desc_es, s.desc_en], q))
        .slice(0, 6),
      products: getAllProducts()
        .filter((p) =>
          matches([p.name_es, p.name_en, p.line, p.cat_es, p.cat_en], q),
        )
        .slice(0, 6),
      artisans: getAllArtisans()
        .filter((a) =>
          matches([a.name, a.role_es, a.role_en, a.specialty_es, a.specialty_en], q),
        )
        .slice(0, 6),
      nailLooks: getNailLooks()
        .filter((n) =>
          matches([n.name_es, n.name_en, n.technique_es, n.technique_en, n.shade], q),
        )
        .slice(0, 6),
    };
  }, [query, getAllServices, getAllProducts, getAllArtisans, getNailLooks]);

  const hasResults =
    results.services.length +
      results.products.length +
      results.artisans.length +
      results.nailLooks.length >
    0;
  const showEmpty = query.trim().length >= 2 && !hasResults;

  const navigate = (route: Parameters<typeof go>[0], params?: Parameters<typeof go>[1]) => {
    onClose();
    go(route, params);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden={!open}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 110,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: `opacity ${ANIMATION_MS}ms ease`,
        }}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-label={lang === 'es' ? 'Buscar' : 'Search'}
        aria-modal="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 111,
          background: T.bg,
          transform: open ? 'translateY(0)' : 'translateY(-100%)',
          transition: `transform ${ANIMATION_MS}ms cubic-bezier(0.2, 0.7, 0.3, 1)`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header con input + close */}
        <div
          style={{
            padding: '20px 16px 12px',
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            borderBottom: `1px solid ${T.line}`,
            flexShrink: 0,
          }}
        >
          <Ico size={16} color={T.gold}>
            {Icons.search}
          </Ico>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              lang === 'es' ? 'Buscar servicios, productos, artistas...' : 'Search services, products, artisans...'
            }
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: T.text,
              fontFamily: T.sans,
              fontSize: 14,
              padding: '8px 0',
            }}
          />
          <button
            onClick={onClose}
            aria-label={lang === 'es' ? 'Cerrar' : 'Close'}
            className="dsr-press"
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              border: 'none',
              background: T.surface,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `inset 0 0 0 1px ${T.line}`,
            }}
          >
            <Ico size={12} color={T.text}>
              {Icons.close}
            </Ico>
          </button>
        </div>

        {/* Results */}
        <div
          className="dsr-scroll"
          style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 24px' }}
        >
          {query.trim().length < 2 ? (
            <Tiny
              muted
              style={{
                fontSize: 11,
                letterSpacing: 0.4,
                textTransform: 'none',
                fontStyle: 'italic',
                fontFamily: T.serif,
                lineHeight: 1.5,
              }}
            >
              {lang === 'es'
                ? 'Empieza a escribir para buscar en toda la maison.'
                : 'Start typing to search the entire maison.'}
            </Tiny>
          ) : showEmpty ? (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Body muted style={{ fontSize: 13 }}>
                {lang === 'es'
                  ? `Sin resultados para "${query}".`
                  : `No results for "${query}".`}
              </Body>
            </div>
          ) : (
            <>
              {results.services.length > 0 && (
                <Section title={lang === 'es' ? 'Servicios' : 'Services'}>
                  {results.services.map((s) => (
                    <ResultRow
                      key={s.id}
                      onClick={() => navigate('service', { id: s.id })}
                      title={lang === 'es' ? s.es : s.en}
                      subtitle={`${s.duration} min · €${s.price}`}
                      T={T}
                    />
                  ))}
                </Section>
              )}
              {results.products.length > 0 && (
                <Section title={lang === 'es' ? 'Productos' : 'Products'}>
                  {results.products.map((p) => (
                    <ResultRow
                      key={p.id}
                      onClick={() => navigate('product', { id: p.id })}
                      title={lang === 'es' ? p.name_es : p.name_en}
                      subtitle={`${p.line} · €${p.price}`}
                      photo={p.photo}
                      T={T}
                    />
                  ))}
                </Section>
              )}
              {results.artisans.length > 0 && (
                <Section title={lang === 'es' ? 'Artistas' : 'Artisans'}>
                  {results.artisans.map((a) => (
                    <ResultRow
                      key={a.id}
                      onClick={() => navigate('artisan', { id: a.id })}
                      title={a.name}
                      subtitle={lang === 'es' ? a.role_es : a.role_en}
                      photo={a.photo}
                      avatar
                      T={T}
                    />
                  ))}
                </Section>
              )}
              {results.nailLooks.length > 0 && (
                <Section title={lang === 'es' ? 'Looks de uñas' : 'Nail looks'}>
                  {results.nailLooks.map((n) => (
                    <ResultRow
                      key={n.id}
                      onClick={() => navigate('nail-look', { id: n.id })}
                      title={lang === 'es' ? n.name_es : n.name_en}
                      subtitle={lang === 'es' ? n.technique_es : n.technique_en}
                      photo={n.img}
                      T={T}
                    />
                  ))}
                </Section>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <Eyebrow style={{ marginBottom: 10 }}>{title}</Eyebrow>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {children}
      </div>
    </div>
  );
}

function ResultRow({
  onClick,
  title,
  subtitle,
  photo,
  avatar,
  T,
}: {
  onClick: () => void;
  title: string;
  subtitle: string;
  photo?: string;
  avatar?: boolean;
  T: ReturnType<typeof useTheme>;
}) {
  return (
    <button
      onClick={onClick}
      className="dsr-press"
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '10px 0',
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        textAlign: 'left',
      }}
    >
      {photo && (
        <Img
          src={photo}
          style={{
            width: avatar ? 38 : 38,
            height: avatar ? 38 : 48,
            flexShrink: 0,
            borderRadius: avatar ? 999 : 0,
          }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Body
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: T.text,
          }}
        >
          {title}
        </Body>
        <Tiny
          muted
          style={{
            marginTop: 2,
            fontSize: 11,
            letterSpacing: 0.3,
            textTransform: 'none',
          }}
        >
          {subtitle}
        </Tiny>
      </div>
      <Ico size={12} color={T.textFaint}>
        {Icons.chev}
      </Ico>
    </button>
  );
}
