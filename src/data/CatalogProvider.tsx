// DSR — Catalog provider con overrides editables.
// Encima de los catálogos estáticos (PRODUCTS, SERVICES, ARTISANS, SERVICE_VARIANTS)
// vive una capa de overrides parciales editables desde el admin.
// Cada entidad puede tener un override que sobrescribe campos puntuales.
// Persistido en localStorage por entidad (4 keys separadas).

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ARTISANS, PRODUCTS, SERVICES } from './catalog';
import {
  SERVICE_VARIANTS,
  type VariantId,
} from './service-variants';
import { SEED_COMBOS } from './combos';
import {
  DEFAULT_SETTINGS,
  SEED_PRODUCT_STOCKS,
  SEED_PROMOS,
  SEED_REVIEWS,
  SEED_SCHEDULES,
  SEED_TIER_RULES,
} from './admin-seeds';
import type {
  Artisan,
  ArtisanSchedule,
  Combo,
  Product,
  ProductStock,
  Promo,
  Review,
  SalonSettings,
  Service,
  TierRule,
} from '../types';

const VARIANTS_KEY = 'dsr-admin-variants-v1';
const PRODUCTS_KEY = 'dsr-admin-products-v1';
const SERVICES_KEY = 'dsr-admin-services-v1';
const ARTISANS_KEY = 'dsr-admin-artisans-v1';
const COMBOS_KEY = 'dsr-admin-combos-v1';
const STOCKS_KEY = 'dsr-admin-stocks-v1';
const PROMOS_KEY = 'dsr-admin-promos-v1';
const SCHEDULES_KEY = 'dsr-admin-schedules-v1';
const TIER_RULES_KEY = 'dsr-admin-tier-rules-v1';
const REVIEWS_KEY = 'dsr-admin-reviews-v1';
const SETTINGS_KEY = 'dsr-admin-settings-v1';

interface VariantPremiumConfig {
  addonProductIds: string[];
  label_es: string;
  label_en: string;
}

export interface MergedVariantConfig {
  premium?: VariantPremiumConfig;
  customCompatibleProductIds?: string[];
}

type VariantsOverride = Record<string, MergedVariantConfig | null>;
type ProductOverrides = Record<string, Partial<Product>>;
type ServiceOverrides = Record<string, Partial<Service>>;
type ArtisanOverrides = Record<string, Partial<Artisan>>;

interface CatalogValue {
  // Variants
  getServiceVariants: (serviceId: string) => MergedVariantConfig | null;
  setServiceVariants: (serviceId: string, config: MergedVariantConfig | null) => void;
  resetVariants: () => void;
  overriddenServiceIds: string[];
  // Products
  getProduct: (id: string) => Product | undefined;
  getAllProducts: () => Product[];
  updateProduct: (id: string, fields: Partial<Product>) => void;
  resetProduct: (id: string) => void;
  productOverrideIds: string[];
  // Services
  getService: (id: string) => Service | undefined;
  getAllServices: () => Service[];
  updateService: (id: string, fields: Partial<Service>) => void;
  resetService: (id: string) => void;
  serviceOverrideIds: string[];
  // Artisans
  getArtisan: (id: string) => Artisan | undefined;
  getAllArtisans: () => Artisan[];
  updateArtisan: (id: string, fields: Partial<Artisan>) => void;
  resetArtisan: (id: string) => void;
  artisanOverrideIds: string[];
  // Combos — viven enteros en localStorage, no como overlay (porque
  // es CRUD completo: crear/editar/borrar). El "reset" restaura SEED_COMBOS.
  getCombos: () => Combo[];
  getCombo: (id: string) => Combo | undefined;
  createCombo: (combo: Omit<Combo, 'id'>) => string;
  updateCombo: (id: string, fields: Partial<Omit<Combo, 'id'>>) => void;
  deleteCombo: (id: string) => void;
  resetCombos: () => void;
  // Inventario
  getStock: (productId: string) => ProductStock;
  updateStock: (productId: string, fields: Partial<ProductStock>) => void;
  // Promociones (CRUD completo)
  getPromos: () => Promo[];
  createPromo: (promo: Omit<Promo, 'id'>) => string;
  updatePromo: (id: string, fields: Partial<Omit<Promo, 'id'>>) => void;
  deletePromo: (id: string) => void;
  // Horarios
  getSchedule: (artisanId: string) => ArtisanSchedule;
  updateSchedule: (artisanId: string, fields: Partial<ArtisanSchedule>) => void;
  // Reglas de tier
  getTierRules: () => TierRule[];
  updateTierRule: (
    tierId: 'pearl' | 'gold' | 'noir',
    fields: Partial<Omit<TierRule, 'tierId'>>,
  ) => void;
  // Reseñas
  getReviews: () => Review[];
  respondToReview: (id: string, response: string) => void;
  // Configuración del salón
  getSettings: () => SalonSettings;
  updateSettings: (fields: Partial<SalonSettings>) => void;
}

const noop = () => {};
const CatalogCtx = createContext<CatalogValue>({
  getServiceVariants: (id) => SERVICE_VARIANTS[id] ?? null,
  setServiceVariants: noop,
  resetVariants: noop,
  overriddenServiceIds: [],
  getProduct: (id) => PRODUCTS.find((p) => p.id === id),
  getAllProducts: () => PRODUCTS,
  updateProduct: noop,
  resetProduct: noop,
  productOverrideIds: [],
  getService: (id) => SERVICES.find((s) => s.id === id),
  getAllServices: () => SERVICES,
  updateService: noop,
  resetService: noop,
  serviceOverrideIds: [],
  getArtisan: (id) => ARTISANS.find((a) => a.id === id),
  getAllArtisans: () => ARTISANS,
  updateArtisan: noop,
  resetArtisan: noop,
  artisanOverrideIds: [],
  getCombos: () => SEED_COMBOS,
  getCombo: (id) => SEED_COMBOS.find((c) => c.id === id),
  createCombo: () => '',
  updateCombo: noop,
  deleteCombo: noop,
  resetCombos: noop,
  getStock: (id) => SEED_PRODUCT_STOCKS[id] ?? { productId: id, stock: 0, lowStockAt: 0 },
  updateStock: noop,
  getPromos: () => SEED_PROMOS,
  createPromo: () => '',
  updatePromo: noop,
  deletePromo: noop,
  getSchedule: (id) =>
    SEED_SCHEDULES[id] ?? {
      artisanId: id,
      workingDays: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false },
      startTime: '10:00',
      endTime: '20:00',
    },
  updateSchedule: noop,
  getTierRules: () => SEED_TIER_RULES,
  updateTierRule: noop,
  getReviews: () => SEED_REVIEWS,
  respondToReview: noop,
  getSettings: () => DEFAULT_SETTINGS,
  updateSettings: noop,
});

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as T;
  } catch {
    /* ignore */
  }
  return fallback;
}

function generateComboId(): string {
  return `cmb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function generatePromoId(): string {
  return `pr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [variants, setVariants] = useState<VariantsOverride>(() =>
    loadJSON(VARIANTS_KEY, {}),
  );
  const [productOverrides, setProductOverrides] = useState<ProductOverrides>(() =>
    loadJSON(PRODUCTS_KEY, {}),
  );
  const [serviceOverrides, setServiceOverrides] = useState<ServiceOverrides>(() =>
    loadJSON(SERVICES_KEY, {}),
  );
  const [artisanOverrides, setArtisanOverrides] = useState<ArtisanOverrides>(() =>
    loadJSON(ARTISANS_KEY, {}),
  );
  const [combos, setCombos] = useState<Combo[]>(() =>
    loadJSON<Combo[]>(COMBOS_KEY, SEED_COMBOS),
  );
  const [stocks, setStocks] = useState<Record<string, ProductStock>>(() =>
    loadJSON(STOCKS_KEY, SEED_PRODUCT_STOCKS),
  );
  const [promos, setPromos] = useState<Promo[]>(() =>
    loadJSON<Promo[]>(PROMOS_KEY, SEED_PROMOS),
  );
  const [schedules, setSchedules] = useState<Record<string, ArtisanSchedule>>(() =>
    loadJSON(SCHEDULES_KEY, SEED_SCHEDULES),
  );
  const [tierRules, setTierRules] = useState<TierRule[]>(() =>
    loadJSON<TierRule[]>(TIER_RULES_KEY, SEED_TIER_RULES),
  );
  const [reviews, setReviews] = useState<Review[]>(() =>
    loadJSON<Review[]>(REVIEWS_KEY, SEED_REVIEWS),
  );
  const [settings, setSettings] = useState<SalonSettings>(() =>
    loadJSON<SalonSettings>(SETTINGS_KEY, DEFAULT_SETTINGS),
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(VARIANTS_KEY, JSON.stringify(variants));
    } catch { /* ignore */ }
  }, [variants]);
  useEffect(() => {
    try {
      window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(productOverrides));
    } catch { /* ignore */ }
  }, [productOverrides]);
  useEffect(() => {
    try {
      window.localStorage.setItem(SERVICES_KEY, JSON.stringify(serviceOverrides));
    } catch { /* ignore */ }
  }, [serviceOverrides]);
  useEffect(() => {
    try {
      window.localStorage.setItem(ARTISANS_KEY, JSON.stringify(artisanOverrides));
    } catch { /* ignore */ }
  }, [artisanOverrides]);
  useEffect(() => {
    try {
      window.localStorage.setItem(COMBOS_KEY, JSON.stringify(combos));
    } catch { /* ignore */ }
  }, [combos]);
  useEffect(() => {
    try { window.localStorage.setItem(STOCKS_KEY, JSON.stringify(stocks)); } catch { /* ignore */ }
  }, [stocks]);
  useEffect(() => {
    try { window.localStorage.setItem(PROMOS_KEY, JSON.stringify(promos)); } catch { /* ignore */ }
  }, [promos]);
  useEffect(() => {
    try { window.localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules)); } catch { /* ignore */ }
  }, [schedules]);
  useEffect(() => {
    try { window.localStorage.setItem(TIER_RULES_KEY, JSON.stringify(tierRules)); } catch { /* ignore */ }
  }, [tierRules]);
  useEffect(() => {
    try { window.localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews)); } catch { /* ignore */ }
  }, [reviews]);
  useEffect(() => {
    try { window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* ignore */ }
  }, [settings]);

  // Variants
  const getServiceVariants = useCallback(
    (serviceId: string): MergedVariantConfig | null => {
      const base = SERVICE_VARIANTS[serviceId] ?? null;
      const override = variants[serviceId];
      if (override === null) return null;
      if (override === undefined) return base;
      return override;
    },
    [variants],
  );
  const setServiceVariants = useCallback(
    (serviceId: string, config: MergedVariantConfig | null) =>
      setVariants((prev) => ({ ...prev, [serviceId]: config })),
    [],
  );
  const resetVariants = useCallback(() => setVariants({}), []);
  const overriddenServiceIds = useMemo(() => Object.keys(variants), [variants]);

  // Products — merged + override per id
  const getProduct = useCallback(
    (id: string): Product | undefined => {
      const base = PRODUCTS.find((p) => p.id === id);
      if (!base) return undefined;
      const ov = productOverrides[id];
      return ov ? { ...base, ...ov } : base;
    },
    [productOverrides],
  );
  const getAllProducts = useCallback(
    (): Product[] =>
      PRODUCTS.map((p) =>
        productOverrides[p.id] ? { ...p, ...productOverrides[p.id] } : p,
      ),
    [productOverrides],
  );
  const updateProduct = useCallback(
    (id: string, fields: Partial<Product>) =>
      setProductOverrides((prev) => ({
        ...prev,
        [id]: { ...(prev[id] ?? {}), ...fields },
      })),
    [],
  );
  const resetProduct = useCallback(
    (id: string) =>
      setProductOverrides((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      }),
    [],
  );
  const productOverrideIds = useMemo(
    () => Object.keys(productOverrides),
    [productOverrides],
  );

  // Services
  const getService = useCallback(
    (id: string): Service | undefined => {
      const base = SERVICES.find((s) => s.id === id);
      if (!base) return undefined;
      const ov = serviceOverrides[id];
      return ov ? { ...base, ...ov } : base;
    },
    [serviceOverrides],
  );
  const getAllServices = useCallback(
    (): Service[] =>
      SERVICES.map((s) =>
        serviceOverrides[s.id] ? { ...s, ...serviceOverrides[s.id] } : s,
      ),
    [serviceOverrides],
  );
  const updateService = useCallback(
    (id: string, fields: Partial<Service>) =>
      setServiceOverrides((prev) => ({
        ...prev,
        [id]: { ...(prev[id] ?? {}), ...fields },
      })),
    [],
  );
  const resetService = useCallback(
    (id: string) =>
      setServiceOverrides((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      }),
    [],
  );
  const serviceOverrideIds = useMemo(
    () => Object.keys(serviceOverrides),
    [serviceOverrides],
  );

  // Artisans
  const getArtisan = useCallback(
    (id: string): Artisan | undefined => {
      const base = ARTISANS.find((a) => a.id === id);
      if (!base) return undefined;
      const ov = artisanOverrides[id];
      return ov ? { ...base, ...ov } : base;
    },
    [artisanOverrides],
  );
  const getAllArtisans = useCallback(
    (): Artisan[] =>
      ARTISANS.map((a) =>
        artisanOverrides[a.id] ? { ...a, ...artisanOverrides[a.id] } : a,
      ),
    [artisanOverrides],
  );
  const updateArtisan = useCallback(
    (id: string, fields: Partial<Artisan>) =>
      setArtisanOverrides((prev) => ({
        ...prev,
        [id]: { ...(prev[id] ?? {}), ...fields },
      })),
    [],
  );
  const resetArtisan = useCallback(
    (id: string) =>
      setArtisanOverrides((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      }),
    [],
  );
  const artisanOverrideIds = useMemo(
    () => Object.keys(artisanOverrides),
    [artisanOverrides],
  );

  // Combos
  const getCombos = useCallback((): Combo[] => combos, [combos]);
  const getCombo = useCallback(
    (id: string): Combo | undefined => combos.find((c) => c.id === id),
    [combos],
  );
  const createCombo = useCallback((combo: Omit<Combo, 'id'>) => {
    const id = generateComboId();
    setCombos((prev) => [...prev, { ...combo, id }]);
    return id;
  }, []);
  const updateCombo = useCallback(
    (id: string, fields: Partial<Omit<Combo, 'id'>>) =>
      setCombos((prev) => prev.map((c) => (c.id === id ? { ...c, ...fields } : c))),
    [],
  );
  const deleteCombo = useCallback(
    (id: string) => setCombos((prev) => prev.filter((c) => c.id !== id)),
    [],
  );
  const resetCombos = useCallback(() => setCombos(SEED_COMBOS), []);

  // Inventario
  const getStock = useCallback(
    (productId: string): ProductStock =>
      stocks[productId] ?? { productId, stock: 0, lowStockAt: 0 },
    [stocks],
  );
  const updateStock = useCallback(
    (productId: string, fields: Partial<ProductStock>) =>
      setStocks((prev) => ({
        ...prev,
        [productId]: { ...(prev[productId] ?? { productId, stock: 0, lowStockAt: 0 }), ...fields },
      })),
    [],
  );

  // Promociones
  const getPromos = useCallback(() => promos, [promos]);
  const createPromo = useCallback((p: Omit<Promo, 'id'>) => {
    const id = generatePromoId();
    setPromos((prev) => [...prev, { ...p, id }]);
    return id;
  }, []);
  const updatePromo = useCallback(
    (id: string, fields: Partial<Omit<Promo, 'id'>>) =>
      setPromos((prev) => prev.map((p) => (p.id === id ? { ...p, ...fields } : p))),
    [],
  );
  const deletePromo = useCallback(
    (id: string) => setPromos((prev) => prev.filter((p) => p.id !== id)),
    [],
  );

  // Horarios
  const getSchedule = useCallback(
    (artisanId: string): ArtisanSchedule =>
      schedules[artisanId] ?? {
        artisanId,
        workingDays: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false },
        startTime: '10:00',
        endTime: '20:00',
      },
    [schedules],
  );
  const updateSchedule = useCallback(
    (artisanId: string, fields: Partial<ArtisanSchedule>) =>
      setSchedules((prev) => ({
        ...prev,
        [artisanId]: { ...(prev[artisanId] ?? { artisanId, workingDays: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false }, startTime: '10:00', endTime: '20:00' }), ...fields },
      })),
    [],
  );

  // Tier rules
  const getTierRules = useCallback(() => tierRules, [tierRules]);
  const updateTierRule = useCallback(
    (
      tierId: 'pearl' | 'gold' | 'noir',
      fields: Partial<Omit<TierRule, 'tierId'>>,
    ) =>
      setTierRules((prev) =>
        prev.map((r) => (r.tierId === tierId ? { ...r, ...fields } : r)),
      ),
    [],
  );

  // Reviews
  const getReviews = useCallback(() => reviews, [reviews]);
  const respondToReview = useCallback((id: string, response: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              response,
              responseDate: new Date().toISOString().slice(0, 10),
            }
          : r,
      ),
    );
  }, []);

  // Settings
  const getSettings = useCallback(() => settings, [settings]);
  const updateSettings = useCallback(
    (fields: Partial<SalonSettings>) =>
      setSettings((prev) => ({ ...prev, ...fields })),
    [],
  );

  const value = useMemo<CatalogValue>(
    () => ({
      getServiceVariants,
      setServiceVariants,
      resetVariants,
      overriddenServiceIds,
      getProduct,
      getAllProducts,
      updateProduct,
      resetProduct,
      productOverrideIds,
      getService,
      getAllServices,
      updateService,
      resetService,
      serviceOverrideIds,
      getArtisan,
      getAllArtisans,
      updateArtisan,
      resetArtisan,
      artisanOverrideIds,
      getCombos,
      getCombo,
      createCombo,
      updateCombo,
      deleteCombo,
      resetCombos,
      getStock,
      updateStock,
      getPromos,
      createPromo,
      updatePromo,
      deletePromo,
      getSchedule,
      updateSchedule,
      getTierRules,
      updateTierRule,
      getReviews,
      respondToReview,
      getSettings,
      updateSettings,
    }),
    [
      getServiceVariants,
      setServiceVariants,
      resetVariants,
      overriddenServiceIds,
      getProduct,
      getAllProducts,
      updateProduct,
      resetProduct,
      productOverrideIds,
      getService,
      getAllServices,
      updateService,
      resetService,
      serviceOverrideIds,
      getArtisan,
      getAllArtisans,
      updateArtisan,
      resetArtisan,
      artisanOverrideIds,
      getCombos,
      getCombo,
      createCombo,
      updateCombo,
      deleteCombo,
      resetCombos,
      getStock,
      updateStock,
      getPromos,
      createPromo,
      updatePromo,
      deletePromo,
      getSchedule,
      updateSchedule,
      getTierRules,
      updateTierRule,
      getReviews,
      respondToReview,
      getSettings,
      updateSettings,
    ],
  );

  return <CatalogCtx.Provider value={value}>{children}</CatalogCtx.Provider>;
}

export const useCatalog = () => useContext(CatalogCtx);

/** Convenience: misma signature que el helper estático que reemplaza. */
export function useServiceVariants(serviceId: string): MergedVariantConfig | null {
  const { getServiceVariants } = useCatalog();
  return getServiceVariants(serviceId);
}

export type { VariantId };
