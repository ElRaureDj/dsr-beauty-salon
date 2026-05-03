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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ARTISANS, PRODUCTS, SERVICES } from './catalog';
import { GIFTCARD_DESIGNS } from './giftcards';
import { NAIL_LOOKS } from './nails';
import {
  createCombo as dbCreateCombo,
  createPromo as dbCreatePromo,
  deleteCombo as dbDeleteCombo,
  deletePromo as dbDeletePromo,
  fetchArtisans,
  fetchCombos,
  fetchGiftCardDesigns,
  fetchNailLooks,
  fetchProducts,
  fetchPromos,
  fetchServices,
  resetCombosToSeed,
  updateCombo as dbUpdateCombo,
  updatePromo as dbUpdatePromo,
} from '../lib/db';
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
  GiftCardDesign,
  NailLook,
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
// Items creados desde admin (no existen en seeds).
const CREATED_PRODUCTS_KEY = 'dsr-admin-created-products-v1';
const CREATED_SERVICES_KEY = 'dsr-admin-created-services-v1';
const CREATED_ARTISANS_KEY = 'dsr-admin-created-artisans-v1';
// Items del seed que el admin marcó como borrados (soft delete).
const DELETED_PRODUCTS_KEY = 'dsr-admin-deleted-products-v1';
const DELETED_SERVICES_KEY = 'dsr-admin-deleted-services-v1';
const DELETED_ARTISANS_KEY = 'dsr-admin-deleted-artisans-v1';
const STOCKS_KEY = 'dsr-admin-stocks-v1';
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
  createProduct: (data: Omit<Product, 'id'>) => string;
  deleteProduct: (id: string) => void;
  productOverrideIds: string[];
  // Services
  getService: (id: string) => Service | undefined;
  getAllServices: () => Service[];
  updateService: (id: string, fields: Partial<Service>) => void;
  resetService: (id: string) => void;
  createService: (data: Omit<Service, 'id'>) => string;
  deleteService: (id: string) => void;
  serviceOverrideIds: string[];
  // Artisans
  getArtisan: (id: string) => Artisan | undefined;
  getAllArtisans: () => Artisan[];
  updateArtisan: (id: string, fields: Partial<Artisan>) => void;
  resetArtisan: (id: string) => void;
  createArtisan: (data: Omit<Artisan, 'id'>) => string;
  deleteArtisan: (id: string) => void;
  artisanOverrideIds: string[];
  // Nail looks (read-only, customer-only, sin CRUD admin)
  getNailLooks: () => NailLook[];
  getNailLook: (id: string) => NailLook | undefined;
  // Gift card designs (read-only, sin CRUD admin desde el cliente)
  getGiftCardDesigns: () => GiftCardDesign[];
  getGiftCardDesign: (id: string) => GiftCardDesign | undefined;
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
  createProduct: () => '',
  deleteProduct: noop,
  productOverrideIds: [],
  getService: (id) => SERVICES.find((s) => s.id === id),
  getAllServices: () => SERVICES,
  updateService: noop,
  resetService: noop,
  createService: () => '',
  deleteService: noop,
  serviceOverrideIds: [],
  getArtisan: (id) => ARTISANS.find((a) => a.id === id),
  getAllArtisans: () => ARTISANS,
  updateArtisan: noop,
  resetArtisan: noop,
  createArtisan: () => '',
  deleteArtisan: noop,
  artisanOverrideIds: [],
  getNailLooks: () => NAIL_LOOKS,
  getNailLook: (id) => NAIL_LOOKS.find((n) => n.id === id),
  getGiftCardDesigns: () => GIFTCARD_DESIGNS,
  getGiftCardDesign: (id) => GIFTCARD_DESIGNS.find((g) => g.id === id),
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

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
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
  // Items nuevos creados desde admin (no en seeds estáticos).
  const [createdProducts, setCreatedProducts] = useState<Product[]>(() =>
    loadJSON<Product[]>(CREATED_PRODUCTS_KEY, []),
  );
  const [createdServices, setCreatedServices] = useState<Service[]>(() =>
    loadJSON<Service[]>(CREATED_SERVICES_KEY, []),
  );
  const [createdArtisans, setCreatedArtisans] = useState<Artisan[]>(() =>
    loadJSON<Artisan[]>(CREATED_ARTISANS_KEY, []),
  );
  // Soft-delete: ids del seed marcados como borrados.
  const [deletedProductIds, setDeletedProductIds] = useState<string[]>(() =>
    loadJSON<string[]>(DELETED_PRODUCTS_KEY, []),
  );
  const [deletedServiceIds, setDeletedServiceIds] = useState<string[]>(() =>
    loadJSON<string[]>(DELETED_SERVICES_KEY, []),
  );
  const [deletedArtisanIds, setDeletedArtisanIds] = useState<string[]>(() =>
    loadJSON<string[]>(DELETED_ARTISANS_KEY, []),
  );
  const [stocks, setStocks] = useState<Record<string, ProductStock>>(() =>
    loadJSON(STOCKS_KEY, SEED_PRODUCT_STOCKS),
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

  // ---------- Catálogo desde Supabase ----------
  // initialData = seed estático para tener UI inmediata sin flash de carga.
  // initialDataUpdatedAt: 0 marca el seed como "muy viejo" para que la query
  // dispare un refetch en background al montar. Cuando la query resuelva,
  // los datos reales reemplazan el seed. Si la red falla, seguimos con el
  // seed (degradación elegante).
  const { data: dbProducts = PRODUCTS } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    initialData: PRODUCTS,
    initialDataUpdatedAt: 0,
  });
  const { data: dbServices = SERVICES } = useQuery({
    queryKey: ['services'],
    queryFn: fetchServices,
    initialData: SERVICES,
    initialDataUpdatedAt: 0,
  });
  const { data: dbArtisans = ARTISANS } = useQuery({
    queryKey: ['artisans'],
    queryFn: fetchArtisans,
    initialData: ARTISANS,
    initialDataUpdatedAt: 0,
  });
  const { data: dbNailLooks = NAIL_LOOKS } = useQuery({
    queryKey: ['nail_looks'],
    queryFn: fetchNailLooks,
    initialData: NAIL_LOOKS,
    initialDataUpdatedAt: 0,
  });
  const { data: dbGiftCardDesigns = GIFTCARD_DESIGNS } = useQuery({
    queryKey: ['gift_card_designs'],
    queryFn: fetchGiftCardDesigns,
    initialData: GIFTCARD_DESIGNS,
    initialDataUpdatedAt: 0,
  });
  // Combos y promos: state hidratado desde DB. SEED_COMBOS / SEED_PROMOS
  // como initialData para UI inmediata. Las mutations llaman a Supabase
  // (RLS bloquea si !is_admin) y luego invalidan el query para refetch.
  const queryClient = useQueryClient();
  const { data: dbCombos = SEED_COMBOS } = useQuery({
    queryKey: ['combos'],
    queryFn: fetchCombos,
    initialData: SEED_COMBOS,
    initialDataUpdatedAt: 0,
  });
  const { data: dbPromos = SEED_PROMOS } = useQuery({
    queryKey: ['promos'],
    queryFn: fetchPromos,
    initialData: SEED_PROMOS,
    initialDataUpdatedAt: 0,
  });
  const invalidateCombos = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['combos'] }),
    [queryClient],
  );
  const invalidatePromos = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['promos'] }),
    [queryClient],
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
    try { window.localStorage.setItem(CREATED_PRODUCTS_KEY, JSON.stringify(createdProducts)); } catch { /* ignore */ }
  }, [createdProducts]);
  useEffect(() => {
    try { window.localStorage.setItem(CREATED_SERVICES_KEY, JSON.stringify(createdServices)); } catch { /* ignore */ }
  }, [createdServices]);
  useEffect(() => {
    try { window.localStorage.setItem(CREATED_ARTISANS_KEY, JSON.stringify(createdArtisans)); } catch { /* ignore */ }
  }, [createdArtisans]);
  useEffect(() => {
    try { window.localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(deletedProductIds)); } catch { /* ignore */ }
  }, [deletedProductIds]);
  useEffect(() => {
    try { window.localStorage.setItem(DELETED_SERVICES_KEY, JSON.stringify(deletedServiceIds)); } catch { /* ignore */ }
  }, [deletedServiceIds]);
  useEffect(() => {
    try { window.localStorage.setItem(DELETED_ARTISANS_KEY, JSON.stringify(deletedArtisanIds)); } catch { /* ignore */ }
  }, [deletedArtisanIds]);
  useEffect(() => {
    try { window.localStorage.setItem(STOCKS_KEY, JSON.stringify(stocks)); } catch { /* ignore */ }
  }, [stocks]);
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

  // Products — merged (base de DB + creados localmente) - eliminados,
  // con override por id. La base ahora viene de Supabase via useQuery.
  const getProduct = useCallback(
    (id: string): Product | undefined => {
      if (deletedProductIds.includes(id)) return undefined;
      const created = createdProducts.find((p) => p.id === id);
      const base = created ?? dbProducts.find((p) => p.id === id);
      if (!base) return undefined;
      const ov = productOverrides[id];
      return ov ? { ...base, ...ov } : base;
    },
    [productOverrides, createdProducts, deletedProductIds, dbProducts],
  );
  const getAllProducts = useCallback((): Product[] => {
    const baseFiltered = dbProducts.filter(
      (p) => !deletedProductIds.includes(p.id),
    );
    const merged = [...baseFiltered, ...createdProducts];
    return merged.map((p) =>
      productOverrides[p.id] ? { ...p, ...productOverrides[p.id] } : p,
    );
  }, [productOverrides, createdProducts, deletedProductIds, dbProducts]);
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
  const createProduct = useCallback((data: Omit<Product, 'id'>): string => {
    const id = generateId('prod');
    setCreatedProducts((prev) => [...prev, { ...data, id }]);
    return id;
  }, []);
  const deleteProduct = useCallback(
    (id: string) => {
      // Si era un creado, lo quitamos del array. Si era de DB seed, soft-delete.
      setCreatedProducts((prev) => {
        if (prev.some((p) => p.id === id)) return prev.filter((p) => p.id !== id);
        return prev;
      });
      if (dbProducts.some((p) => p.id === id)) {
        setDeletedProductIds((prev) =>
          prev.includes(id) ? prev : [...prev, id],
        );
      }
      setProductOverrides((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [dbProducts],
  );
  const productOverrideIds = useMemo(
    () => Object.keys(productOverrides),
    [productOverrides],
  );

  // Services — base desde Supabase
  const getService = useCallback(
    (id: string): Service | undefined => {
      if (deletedServiceIds.includes(id)) return undefined;
      const created = createdServices.find((s) => s.id === id);
      const base = created ?? dbServices.find((s) => s.id === id);
      if (!base) return undefined;
      const ov = serviceOverrides[id];
      return ov ? { ...base, ...ov } : base;
    },
    [serviceOverrides, createdServices, deletedServiceIds, dbServices],
  );
  const getAllServices = useCallback((): Service[] => {
    const baseFiltered = dbServices.filter(
      (s) => !deletedServiceIds.includes(s.id),
    );
    const merged = [...baseFiltered, ...createdServices];
    return merged.map((s) =>
      serviceOverrides[s.id] ? { ...s, ...serviceOverrides[s.id] } : s,
    );
  }, [serviceOverrides, createdServices, deletedServiceIds, dbServices]);
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
  const createService = useCallback((data: Omit<Service, 'id'>): string => {
    const id = generateId('svc');
    setCreatedServices((prev) => [...prev, { ...data, id }]);
    return id;
  }, []);
  const deleteService = useCallback(
    (id: string) => {
      setCreatedServices((prev) => {
        if (prev.some((s) => s.id === id)) return prev.filter((s) => s.id !== id);
        return prev;
      });
      if (dbServices.some((s) => s.id === id)) {
        setDeletedServiceIds((prev) =>
          prev.includes(id) ? prev : [...prev, id],
        );
      }
      setServiceOverrides((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [dbServices],
  );
  const serviceOverrideIds = useMemo(
    () => Object.keys(serviceOverrides),
    [serviceOverrides],
  );

  // Artisans — base desde Supabase
  const getArtisan = useCallback(
    (id: string): Artisan | undefined => {
      if (deletedArtisanIds.includes(id)) return undefined;
      const created = createdArtisans.find((a) => a.id === id);
      const base = created ?? dbArtisans.find((a) => a.id === id);
      if (!base) return undefined;
      const ov = artisanOverrides[id];
      return ov ? { ...base, ...ov } : base;
    },
    [artisanOverrides, createdArtisans, deletedArtisanIds, dbArtisans],
  );
  const getAllArtisans = useCallback((): Artisan[] => {
    const baseFiltered = dbArtisans.filter(
      (a) => !deletedArtisanIds.includes(a.id),
    );
    const merged = [...baseFiltered, ...createdArtisans];
    return merged.map((a) =>
      artisanOverrides[a.id] ? { ...a, ...artisanOverrides[a.id] } : a,
    );
  }, [artisanOverrides, createdArtisans, deletedArtisanIds, dbArtisans]);
  const updateArtisan = useCallback(
    (id: string, fields: Partial<Artisan>) =>
      setArtisanOverrides((prev) => ({
        ...prev,
        [id]: { ...(prev[id] ?? {}), ...fields },
      })),
    [],
  );
  const createArtisan = useCallback((data: Omit<Artisan, 'id'>): string => {
    const id = generateId('art');
    setCreatedArtisans((prev) => [...prev, { ...data, id }]);
    return id;
  }, []);
  const deleteArtisan = useCallback(
    (id: string) => {
      setCreatedArtisans((prev) => {
        if (prev.some((a) => a.id === id)) return prev.filter((a) => a.id !== id);
        return prev;
      });
      if (dbArtisans.some((a) => a.id === id)) {
        setDeletedArtisanIds((prev) =>
          prev.includes(id) ? prev : [...prev, id],
        );
      }
      setArtisanOverrides((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [dbArtisans],
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
  // Nail looks (read-only desde DB; sin overrides locales).
  const getNailLooks = useCallback((): NailLook[] => dbNailLooks, [dbNailLooks]);
  const getNailLook = useCallback(
    (id: string) => dbNailLooks.find((n) => n.id === id),
    [dbNailLooks],
  );

  // Gift card designs (read-only desde DB; sin overrides locales).
  const getGiftCardDesigns = useCallback(
    (): GiftCardDesign[] => dbGiftCardDesigns,
    [dbGiftCardDesigns],
  );
  const getGiftCardDesign = useCallback(
    (id: string) => dbGiftCardDesigns.find((g) => g.id === id),
    [dbGiftCardDesigns],
  );

  // Combos: leídos desde DB via useQuery (dbCombos arriba). Mutations
  // optimistic local + dispatch async a Supabase + invalidate para
  // refetch. Errores se loggean; el siguiente refetch normaliza.
  const getCombos = useCallback((): Combo[] => dbCombos, [dbCombos]);
  const getCombo = useCallback(
    (id: string): Combo | undefined => dbCombos.find((c) => c.id === id),
    [dbCombos],
  );
  const createCombo = useCallback(
    (combo: Omit<Combo, 'id'>) => {
      const id = generateComboId();
      const full: Combo = { ...combo, id };
      // Optimistic update del cache (TanStack).
      queryClient.setQueryData<Combo[]>(['combos'], (prev) =>
        prev ? [...prev, full] : [full],
      );
      void dbCreateCombo(full)
        .then(() => invalidateCombos())
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[catalog] createCombo failed:', err);
          void invalidateCombos();
        });
      return id;
    },
    [queryClient, invalidateCombos],
  );
  const updateCombo = useCallback(
    (id: string, fields: Partial<Omit<Combo, 'id'>>) => {
      queryClient.setQueryData<Combo[]>(['combos'], (prev) =>
        prev ? prev.map((c) => (c.id === id ? { ...c, ...fields } : c)) : prev,
      );
      void dbUpdateCombo(id, fields)
        .then(() => invalidateCombos())
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[catalog] updateCombo failed:', err);
          void invalidateCombos();
        });
    },
    [queryClient, invalidateCombos],
  );
  const deleteCombo = useCallback(
    (id: string) => {
      queryClient.setQueryData<Combo[]>(['combos'], (prev) =>
        prev ? prev.filter((c) => c.id !== id) : prev,
      );
      void dbDeleteCombo(id)
        .then(() => invalidateCombos())
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[catalog] deleteCombo failed:', err);
          void invalidateCombos();
        });
    },
    [queryClient, invalidateCombos],
  );
  const resetCombos = useCallback(() => {
    queryClient.setQueryData<Combo[]>(['combos'], SEED_COMBOS);
    void resetCombosToSeed(SEED_COMBOS)
      .then(() => invalidateCombos())
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[catalog] resetCombos failed:', err);
        void invalidateCombos();
      });
  }, [queryClient, invalidateCombos]);

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

  // Promociones: mismo patrón que combos. SELECT abierto (RLS) + writes
  // protegidos por is_admin().
  const getPromos = useCallback(() => dbPromos, [dbPromos]);
  const createPromo = useCallback(
    (p: Omit<Promo, 'id'>) => {
      const id = generatePromoId();
      const full: Promo = { ...p, id };
      queryClient.setQueryData<Promo[]>(['promos'], (prev) =>
        prev ? [full, ...prev] : [full],
      );
      void dbCreatePromo(full)
        .then(() => invalidatePromos())
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[catalog] createPromo failed:', err);
          void invalidatePromos();
        });
      return id;
    },
    [queryClient, invalidatePromos],
  );
  const updatePromo = useCallback(
    (id: string, fields: Partial<Omit<Promo, 'id'>>) => {
      queryClient.setQueryData<Promo[]>(['promos'], (prev) =>
        prev ? prev.map((p) => (p.id === id ? { ...p, ...fields } : p)) : prev,
      );
      void dbUpdatePromo(id, fields)
        .then(() => invalidatePromos())
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[catalog] updatePromo failed:', err);
          void invalidatePromos();
        });
    },
    [queryClient, invalidatePromos],
  );
  const deletePromo = useCallback(
    (id: string) => {
      queryClient.setQueryData<Promo[]>(['promos'], (prev) =>
        prev ? prev.filter((p) => p.id !== id) : prev,
      );
      void dbDeletePromo(id)
        .then(() => invalidatePromos())
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[catalog] deletePromo failed:', err);
          void invalidatePromos();
        });
    },
    [queryClient, invalidatePromos],
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
      createProduct,
      deleteProduct,
      productOverrideIds,
      getService,
      getAllServices,
      updateService,
      resetService,
      createService,
      deleteService,
      serviceOverrideIds,
      getArtisan,
      getAllArtisans,
      updateArtisan,
      resetArtisan,
      createArtisan,
      deleteArtisan,
      artisanOverrideIds,
      getNailLooks,
      getNailLook,
      getGiftCardDesigns,
      getGiftCardDesign,
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
      createProduct,
      deleteProduct,
      productOverrideIds,
      getService,
      getAllServices,
      updateService,
      resetService,
      createService,
      deleteService,
      serviceOverrideIds,
      getArtisan,
      getAllArtisans,
      updateArtisan,
      resetArtisan,
      createArtisan,
      deleteArtisan,
      artisanOverrideIds,
      getNailLooks,
      getNailLook,
      getGiftCardDesigns,
      getGiftCardDesign,
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
