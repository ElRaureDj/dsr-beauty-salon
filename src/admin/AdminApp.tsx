// DSR Admin — Layout desktop.
// Vive fuera del iPhone frame del customer app. Sidebar + content.
// Sección activa en localStorage para persistir entre reloads.
// Compartido state con el customer app vía CartProvider/CatalogProvider/UserProvider.

import { useEffect, useState, type ReactNode } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import { Body, Eyebrow, Ico, Icons, Tiny } from '../components/atoms';
import { useRouter } from '../router/Router';
import { useCatalog } from '../data/CatalogProvider';
import { useUser } from '../data/UserProvider';
import { AdminGate } from './AdminGate';
import { VariantsSection } from './sections/VariantsSection';
import { ProductsSection, ServicesSection } from './sections/CatalogList';
import { ArtisansSection } from './sections/ArtisansSection';
import { CombosSection } from './sections/CombosSection';
import { InventorySection } from './sections/InventorySection';
import { PromotionsSection } from './sections/PromotionsSection';
import { PointsSection } from './sections/PointsSection';
import { SchedulesSection } from './sections/SchedulesSection';
import { AppointmentsSection } from './sections/AppointmentsSection';
import { GiftCardsSection } from './sections/GiftCardsSection';
import { ReviewsSection } from './sections/ReviewsSection';
import { ReportsSection } from './sections/ReportsSection';
import { SettingsSection } from './sections/SettingsSection';

const SECTION_KEY = 'dsr-admin-section-v1';

type SectionId =
  | 'variants'
  | 'products'
  | 'services'
  | 'combos'
  | 'artisans'
  | 'schedules'
  | 'appointments'
  | 'inventory'
  | 'points'
  | 'giftCards'
  | 'promotions'
  | 'reviews'
  | 'reports'
  | 'settings';

interface SectionDef {
  id: SectionId;
  group: 'catalog' | 'people' | 'ops' | 'loyalty' | 'misc';
  icon: ReactNode;
  label: { es: string; en: string };
}

const SECTIONS: SectionDef[] = [
  // Catálogo
  { id: 'variants', group: 'catalog', icon: Icons.edit, label: { es: 'Variantes', en: 'Variants' } },
  { id: 'products', group: 'catalog', icon: Icons.bag, label: { es: 'Productos', en: 'Products' } },
  { id: 'services', group: 'catalog', icon: Icons.scissors, label: { es: 'Servicios', en: 'Services' } },
  { id: 'combos', group: 'catalog', icon: Icons.diamond, label: { es: 'Combos', en: 'Bundles' } },
  // Personal
  { id: 'artisans', group: 'people', icon: Icons.user, label: { es: 'Artistas', en: 'Artisans' } },
  { id: 'schedules', group: 'people', icon: Icons.cal, label: { es: 'Horarios', en: 'Schedules' } },
  // Operación
  { id: 'appointments', group: 'ops', icon: Icons.clock, label: { es: 'Citas', en: 'Appointments' } },
  { id: 'inventory', group: 'ops', icon: Icons.filter, label: { es: 'Inventario', en: 'Inventory' } },
  // Loyalty
  { id: 'points', group: 'loyalty', icon: Icons.award, label: { es: 'Puntos & Tiers', en: 'Points & Tiers' } },
  { id: 'giftCards', group: 'loyalty', icon: Icons.mail, label: { es: 'Gift Cards', en: 'Gift Cards' } },
  // Otros
  { id: 'promotions', group: 'misc', icon: Icons.sparkle, label: { es: 'Promociones', en: 'Promotions' } },
  { id: 'reviews', group: 'misc', icon: Icons.star, label: { es: 'Reseñas', en: 'Reviews' } },
  { id: 'reports', group: 'misc', icon: Icons.chev, label: { es: 'Reportes', en: 'Reports' } },
  { id: 'settings', group: 'misc', icon: Icons.globe, label: { es: 'Configuración', en: 'Settings' } },
];

const GROUP_LABELS: Record<SectionDef['group'], { es: string; en: string }> = {
  catalog: { es: 'Catálogo', en: 'Catalog' },
  people: { es: 'Personal', en: 'People' },
  ops: { es: 'Operación', en: 'Operations' },
  loyalty: { es: 'Fidelidad', en: 'Loyalty' },
  misc: { es: 'Otros', en: 'Other' },
};

function loadSection(): SectionId {
  try {
    const v = window.localStorage.getItem(SECTION_KEY);
    if (v && SECTIONS.some((s) => s.id === v)) return v as SectionId;
  } catch {
    /* ignore */
  }
  return 'variants';
}

export function AdminApp() {
  const T = useTheme();
  const { lang } = useI18n();
  const { go } = useRouter();
  const { overriddenServiceIds } = useCatalog();
  const { isAdmin } = useUser();
  const [section, setSection] = useState<SectionId>(loadSection);

  useEffect(() => {
    try {
      window.localStorage.setItem(SECTION_KEY, section);
    } catch {
      /* ignore */
    }
  }, [section]);

  // Gate: solo admins reales (profile.is_admin = true) entran al panel.
  // El PIN demo fue reemplazado por este check en la fase 7. Después de
  // todos los hooks para no romper Rules of Hooks.
  if (!isAdmin) return <AdminGate />;

  // Group sections for sidebar rendering
  const groupedSections = (
    ['catalog', 'people', 'ops', 'loyalty', 'misc'] as const
  ).map((g) => ({
    group: g,
    items: SECTIONS.filter((s) => s.group === g),
  }));

  return (
    <div
      className="dsr"
      style={{
        width: '100vw',
        minHeight: '100vh',
        background: T.bg,
        color: T.text,
        display: 'flex',
        fontFamily: T.sans,
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 260,
          minHeight: '100vh',
          background: T.bgAlt,
          borderRight: `1px solid ${T.line}`,
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          maxHeight: '100vh',
          overflowY: 'auto',
        }}
      >
        {/* Brand */}
        <div
          style={{
            padding: '24px 22px',
            borderBottom: `1px solid ${T.line}`,
          }}
        >
          <Eyebrow style={{ fontSize: 9, color: T.gold }}>DSR · Admin</Eyebrow>
          <div
            style={{
              fontFamily: T.serif,
              fontStyle: 'italic',
              fontSize: 22,
              fontWeight: 300,
              marginTop: 4,
              lineHeight: 1.1,
            }}
          >
            Maison de Beauté
          </div>
        </div>

        {/* Sections */}
        <nav style={{ flex: 1, padding: '14px 0' }}>
          {groupedSections.map(({ group, items }) => (
            <div key={group} style={{ marginBottom: 14 }}>
              <Tiny
                muted
                style={{
                  display: 'block',
                  fontSize: 9,
                  letterSpacing: 1.4,
                  padding: '6px 22px',
                  fontFamily: T.mono,
                }}
              >
                {GROUP_LABELS[group][lang].toUpperCase()}
              </Tiny>
              {items.map((s) => {
                const active = section === s.id;
                const overridden =
                  s.id === 'variants' && overriddenServiceIds.length > 0;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSection(s.id)}
                    className="dsr-press"
                    style={{
                      width: '100%',
                      padding: '10px 22px',
                      background: active ? T.surface : 'transparent',
                      border: 'none',
                      borderLeft: active
                        ? `2px solid ${T.gold}`
                        : '2px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontFamily: T.sans,
                      fontSize: 13,
                      color: active ? T.text : T.textMuted,
                      letterSpacing: 0.3,
                      textAlign: 'left',
                      position: 'relative',
                      transition: 'background .15s, border-color .15s, color .15s',
                    }}
                  >
                    <Ico size={14} color={active ? T.gold : T.textMuted}>
                      {s.icon}
                    </Ico>
                    <span style={{ flex: 1 }}>{s.label[lang]}</span>
                    {overridden && (
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 999,
                          background: T.gold,
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer: back to customer app */}
        <div
          style={{
            padding: '16px 22px',
            borderTop: `1px solid ${T.line}`,
          }}
        >
          <button
            onClick={() => go('home')}
            className="dsr-press"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              padding: '8px 0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: T.gold,
              fontFamily: T.sans,
              fontSize: 11,
              letterSpacing: 1.4,
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            <Ico size={12} color={T.gold}>
              {Icons.back}
            </Ico>
            {lang === 'es' ? 'Volver al app' : 'Back to app'}
          </button>
        </div>
      </aside>

      {/* Content */}
      <main
        style={{
          flex: 1,
          padding: '32px 36px 60px',
          minWidth: 0,
        }}
      >
        <SectionRouter id={section} />
      </main>
    </div>
  );
}

function SectionRouter({ id }: { id: SectionId }) {
  switch (id) {
    case 'variants':
      return <VariantsSection />;
    case 'products':
      return <ProductsSection />;
    case 'services':
      return <ServicesSection />;
    case 'combos':
      return <CombosSection />;
    case 'artisans':
      return <ArtisansSection />;
    case 'schedules':
      return <SchedulesSection />;
    case 'appointments':
      return <AppointmentsSection />;
    case 'inventory':
      return <InventorySection />;
    case 'points':
      return <PointsSection />;
    case 'giftCards':
      return <GiftCardsSection />;
    case 'promotions':
      return <PromotionsSection />;
    case 'reviews':
      return <ReviewsSection />;
    case 'reports':
      return <ReportsSection />;
    case 'settings':
      return <SettingsSection />;
  }
}

// Helper export for App.tsx
export function isAdminRoute(routeName: string) {
  return routeName === 'admin';
}

// Re-export referenced atom for convenience
export { Body };
