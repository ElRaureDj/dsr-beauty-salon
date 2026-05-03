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
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ARTISANS, PRODUCTS, SERVICES } from './catalog';
import { GIFTCARD_DESIGNS } from './giftcards';
import { NAIL_LOOKS } from './nails';
import {
  clearAllServiceVariants,
  createArtisanDb,
  createCombo as dbCreateCombo,
  createProductDb,
  createPromo as dbCreatePromo,
  createServiceDb,
  deleteArtisanDb,
  deleteCombo as dbDeleteCombo,
  deleteProductDb,
  deletePromo as dbDeletePromo,
  deleteServiceDb,
  deleteServiceVariant,
  fetchArtisanSchedules,
  fetchArtisans,
  fetchCombos,
  fetchGiftCardDesigns,
  fetchNailLooks,
  fetchProducts,
  fetchProductStocks,
  fetchPromos,
  fetchReviews,
  fetchSalonSettings,
  fetchServices,
  fetchServiceVariantsRecord,
  fetchTierRules,
  resetCombosToSeed,
  respondToReview as dbRespondToReview,
  updateArtisanDb,
  updateCombo as dbUpdateCombo,
  updateProductDb,
  updatePromo as dbUpdatePromo,
  updateSalonSettings,
  updateServiceDb,
  updateTierRule as dbUpdateTierRule,
  upsertArtisanScheduleDay,
  upsertProductStock,
  upsertServiceVariant,
  type VariantConfigLite,
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
import { TIERS } from './tiers';
import type {
  Artisan,
  ArtisanSchedule,
  ArtisanScheduleDay,
  Combo,
  GiftCardDesign,
  NailLook,
  Product,
  ProductStock,
  Promo,
  Review,
  SalonSettings,
  Service,
  Tier,
  TierRule,
  WeekDay,
} from '../types';

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

interface VariantPremiumConfig {
  addonProductIds: string[];
  label_es: string;
  label_en: string;
}

export interface MergedVariantConfig {
  premium?: VariantPremiumConfig;
  customCompatibleProductIds?: string[];
}

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
  createProduct: (data: Omit<Product, 'id'>) => string;
  deleteProduct: (id: string) => void;
  // Services
  getService: (id: string) => Service | undefined;
  getAllServices: () => Service[];
  updateService: (id: string, fields: Partial<Service>) => void;
  createService: (data: Omit<Service, 'id'>) => string;
  deleteService: (id: string) => void;
  // Artisans
  getArtisan: (id: string) => Artisan | undefined;
  getAllArtisans: () => Artisan[];
  updateArtisan: (id: string, fields: Partial<Artisan>) => void;
  createArtisan: (data: Omit<Artisan, 'id'>) => string;
  deleteArtisan: (id: string) => void;
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
  updateScheduleDay: (
    artisanId: string,
    weekday: WeekDay,
    fields: Partial<Omit<ArtisanScheduleDay, 'weekday'>>,
  ) => void;
  // Reglas de tier
  getTierRules: () => TierRule[];
  /** Tiers con thresholds reales de DB (id/name/color del seed estático). */
  getTiers: () => Tier[];
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
  createProduct: () => '',
  deleteProduct: noop,
  getService: (id) => SERVICES.find((s) => s.id === id),
  getAllServices: () => SERVICES,
  updateService: noop,
  createService: () => '',
  deleteService: noop,
  getArtisan: (id) => ARTISANS.find((a) => a.id === id),
  getAllArtisans: () => ARTISANS,
  updateArtisan: noop,
  createArtisan: () => '',
  deleteArtisan: noop,
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
      days: {
        mon: { weekday: 'mon', isWorking: true, startTime: '10:00', endTime: '20:00' },
        tue: { weekday: 'tue', isWorking: true, startTime: '10:00', endTime: '20:00' },
        wed: { weekday: 'wed', isWorking: true, startTime: '10:00', endTime: '20:00' },
        thu: { weekday: 'thu', isWorking: true, startTime: '10:00', endTime: '20:00' },
        fri: { weekday: 'fri', isWorking: true, startTime: '10:00', endTime: '20:00' },
        sat: { weekday: 'sat', isWorking: true, startTime: '10:00', endTime: '20:00' },
        sun: { weekday: 'sun', isWorking: false, startTime: '10:00', endTime: '20:00' },
      },
    },
  updateScheduleDay: noop,
  getTierRules: () => SEED_TIER_RULES,
  getTiers: () => TIERS,
  updateTierRule: noop,
  getReviews: () => SEED_REVIEWS,
  respondToReview: noop,
  getSettings: () => DEFAULT_SETTINGS,
  updateSettings: noop,
});

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

  // Stocks, schedules, tier rules, reviews, settings y service variants:
  // hidratados desde DB, mutations admin protegidas por RLS (is_admin).
  const { data: dbStocks = SEED_PRODUCT_STOCKS } = useQuery({
    queryKey: ['product_stocks'],
    queryFn: fetchProductStocks,
    initialData: SEED_PRODUCT_STOCKS,
    initialDataUpdatedAt: 0,
  });
  const { data: dbSchedules = SEED_SCHEDULES } = useQuery({
    queryKey: ['artisan_schedules'],
    queryFn: fetchArtisanSchedules,
    initialData: SEED_SCHEDULES,
    initialDataUpdatedAt: 0,
  });
  const { data: dbTierRules = SEED_TIER_RULES } = useQuery({
    queryKey: ['tier_rules'],
    queryFn: fetchTierRules,
    initialData: SEED_TIER_RULES,
    initialDataUpdatedAt: 0,
  });
  const { data: dbReviews = SEED_REVIEWS } = useQuery({
    queryKey: ['reviews'],
    queryFn: fetchReviews,
    initialData: SEED_REVIEWS,
    initialDataUpdatedAt: 0,
  });
  const { data: dbSettings = DEFAULT_SETTINGS } = useQuery({
    queryKey: ['salon_settings'],
    queryFn: async () => (await fetchSalonSettings()) ?? DEFAULT_SETTINGS,
    initialData: DEFAULT_SETTINGS,
    initialDataUpdatedAt: 0,
  });
  // Variants overlay desde DB. Si una row existe → ese es el override
  // (puede tener premium y/o customCompatible). Si no existe → SERVICE_VARIANTS
  // estático actúa como fallback.
  const { data: dbVariantOverrides = {} } = useQuery({
    queryKey: ['service_variants'],
    queryFn: fetchServiceVariantsRecord,
    initialData: {} as Record<string, VariantConfigLite>,
    initialDataUpdatedAt: 0,
  });
  const invalidateStocks = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['product_stocks'] }),
    [queryClient],
  );
  const invalidateSchedules = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['artisan_schedules'] }),
    [queryClient],
  );
  const invalidateTierRules = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['tier_rules'] }),
    [queryClient],
  );
  const invalidateReviews = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
    [queryClient],
  );
  const invalidateSettings = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['salon_settings'] }),
    [queryClient],
  );
  const invalidateVariants = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['service_variants'] }),
    [queryClient],
  );

  // Limpiar legacy localStorage de la fase overlay (overrides + creados + deleted).
  // Una sola vez al montar; el catálogo es 100% DB ahora.
  useEffect(() => {
    try {
      [
        PRODUCTS_KEY, SERVICES_KEY, ARTISANS_KEY,
        CREATED_PRODUCTS_KEY, CREATED_SERVICES_KEY, CREATED_ARTISANS_KEY,
        DELETED_PRODUCTS_KEY, DELETED_SERVICES_KEY, DELETED_ARTISANS_KEY,
      ].forEach((k) => window.localStorage.removeItem(k));
    } catch { /* ignore */ }
  }, []);

  // Variants — overlay desde DB. Si el service_id está en dbVariantOverrides
  // ese gana. Si no, fallback a SERVICE_VARIANTS estático del repo.
  const getServiceVariants = useCallback(
    (serviceId: string): MergedVariantConfig | null => {
      const override = dbVariantOverrides[serviceId];
      if (override) return override as MergedVariantConfig;
      return SERVICE_VARIANTS[serviceId] ?? null;
    },
    [dbVariantOverrides],
  );
  const setServiceVariants = useCallback(
    (serviceId: string, config: MergedVariantConfig | null) => {
      // Optimistic local + dispatch DB.
      queryClient.setQueryData<Record<string, VariantConfigLite>>(
        ['service_variants'],
        (prev) => {
          const next = { ...(prev ?? {}) };
          if (config === null) delete next[serviceId];
          else next[serviceId] = config;
          return next;
        },
      );
      const promise =
        config === null
          ? deleteServiceVariant(serviceId)
          : upsertServiceVariant(serviceId, config);
      void promise
        .then(() => invalidateVariants())
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[catalog] setServiceVariants failed:', err);
          void invalidateVariants();
        });
    },
    [queryClient, invalidateVariants],
  );
  const resetVariants = useCallback(() => {
    queryClient.setQueryData<Record<string, VariantConfigLite>>(
      ['service_variants'],
      {},
    );
    void clearAllServiceVariants()
      .then(() => invalidateVariants())
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[catalog] resetVariants failed:', err);
        void invalidateVariants();
      });
  }, [queryClient, invalidateVariants]);
  const overriddenServiceIds = useMemo(
    () => Object.keys(dbVariantOverrides),
    [dbVariantOverrides],
  );

  // Products — fuente de verdad: DB. Mutations admin protegidas por
  // RLS (is_admin). Optimistic local + dispatch async + invalidate.
  const invalidateProducts = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    [queryClient],
  );
  const getProduct = useCallback(
    (id: string): Product | undefined => dbProducts.find((p) => p.id === id),
    [dbProducts],
  );
  const getAllProducts = useCallback((): Product[] => dbProducts, [dbProducts]);
  const updateProduct = useCallback(
    (id: string, fields: Partial<Product>) => {
      queryClient.setQueryData<Product[]>(['products'], (prev) =>
        prev ? prev.map((p) => (p.id === id ? { ...p, ...fields } : p)) : prev,
      );
      void updateProductDb(id, fields)
        .then(() => invalidateProducts())
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[catalog] updateProduct failed:', err);
          void invalidateProducts();
        });
    },
    [queryClient, invalidateProducts],
  );
  const createProduct = useCallback(
    (data: Omit<Product, 'id'>): string => {
      const id = generateId('prod');
      const full: Product = { ...data, id };
      queryClient.setQueryData<Product[]>(['products'], (prev) =>
        prev ? [...prev, full] : [full],
      );
      void createProductDb(full)
        .then(() => invalidateProducts())
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[catalog] createProduct failed:', err);
          void invalidateProducts();
        });
      return id;
    },
    [queryClient, invalidateProducts],
  );
  const deleteProduct = useCallback(
    (id: string) => {
      queryClient.setQueryData<Product[]>(['products'], (prev) =>
        prev ? prev.filter((p) => p.id !== id) : prev,
      );
      void deleteProductDb(id)
        .then(() => invalidateProducts())
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[catalog] deleteProduct failed:', err);
          void invalidateProducts();
        });
    },
    [queryClient, invalidateProducts],
  );

  // Services — fuente de verdad: DB.
  const invalidateServices = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['services'] }),
    [queryClient],
  );
  const getService = useCallback(
    (id: string): Service | undefined => dbServices.find((s) => s.id === id),
    [dbServices],
  );
  const getAllServices = useCallback((): Service[] => dbServices, [dbServices]);
  const updateService = useCallback(
    (id: string, fields: Partial<Service>) => {
      queryClient.setQueryData<Service[]>(['services'], (prev) =>
        prev ? prev.map((s) => (s.id === id ? { ...s, ...fields } : s)) : prev,
      );
      void updateServiceDb(id, fields)
        .then(() => invalidateServices())
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[catalog] updateService failed:', err);
          void invalidateServices();
        });
    },
    [queryClient, invalidateServices],
  );
  const createService = useCallback(
    (data: Omit<Service, 'id'>): string => {
      const id = generateId('svc');
      const full: Service = { ...data, id };
      queryClient.setQueryData<Service[]>(['services'], (prev) =>
        prev ? [...prev, full] : [full],
      );
      void createServiceDb(full)
        .then(() => invalidateServices())
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[catalog] createService failed:', err);
          void invalidateServices();
        });
      return id;
    },
    [queryClient, invalidateServices],
  );
  const deleteService = useCallback(
    (id: string) => {
      queryClient.setQueryData<Service[]>(['services'], (prev) =>
        prev ? prev.filter((s) => s.id !== id) : prev,
      );
      void deleteServiceDb(id)
        .then(() => invalidateServices())
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[catalog] deleteService failed:', err);
          void invalidateServices();
        });
    },
    [queryClient, invalidateServices],
  );

  // Artisans — fuente de verdad: DB.
  const invalidateArtisans = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['artisans'] }),
    [queryClient],
  );
  const getArtisan = useCallback(
    (id: string): Artisan | undefined => dbArtisans.find((a) => a.id === id),
    [dbArtisans],
  );
  const getAllArtisans = useCallback((): Artisan[] => dbArtisans, [dbArtisans]);
  const updateArtisan = useCallback(
    (id: string, fields: Partial<Artisan>) => {
      queryClient.setQueryData<Artisan[]>(['artisans'], (prev) =>
        prev ? prev.map((a) => (a.id === id ? { ...a, ...fields } : a)) : prev,
      );
      void updateArtisanDb(id, fields)
        .then(() => invalidateArtisans())
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[catalog] updateArtisan failed:', err);
          void invalidateArtisans();
        });
    },
    [queryClient, invalidateArtisans],
  );
  const createArtisan = useCallback(
    (data: Omit<Artisan, 'id'>): string => {
      const id = generateId('art');
      const full: Artisan = { ...data, id };
      queryClient.setQueryData<Artisan[]>(['artisans'], (prev) =>
        prev ? [...prev, full] : [full],
      );
      void createArtisanDb(full)
        .then(() => invalidateArtisans())
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[catalog] createArtisan failed:', err);
          void invalidateArtisans();
        });
      return id;
    },
    [queryClient, invalidateArtisans],
  );
  const deleteArtisan = useCallback(
    (id: string) => {
      queryClient.setQueryData<Artisan[]>(['artisans'], (prev) =>
        prev ? prev.filter((a) => a.id !== id) : prev,
      );
      void deleteArtisanDb(id)
        .then(() => invalidateArtisans())
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[catalog] deleteArtisan failed:', err);
          void invalidateArtisans();
        });
    },
    [queryClient, invalidateArtisans],
  );
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

  // Inventario — leído desde DB.
  const getStock = useCallback(
    (productId: string): ProductStock =>
      dbStocks[productId] ?? { productId, stock: 0, lowStockAt: 0 },
    [dbStocks],
  );
  const updateStock = useCallback(
    (productId: string, fields: Partial<ProductStock>) => {
      const current = dbStocks[productId] ?? {
        productId,
        stock: 0,
        lowStockAt: 0,
      };
      const next = { ...current, ...fields };
      queryClient.setQueryData<Record<string, ProductStock>>(
        ['product_stocks'],
        (prev) => ({ ...(prev ?? {}), [productId]: next }),
      );
      void upsertProductStock(productId, next)
        .then(() => invalidateStocks())
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[catalog] updateStock failed:', err);
          void invalidateStocks();
        });
    },
    [queryClient, invalidateStocks, dbStocks],
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

  // Horarios — schedule por día. Cada artist tiene 7 entries.
  const DEFAULT_WEEK = useMemo<Record<WeekDay, ArtisanScheduleDay>>(
    () => ({
      mon: { weekday: 'mon', isWorking: true, startTime: '10:00', endTime: '20:00' },
      tue: { weekday: 'tue', isWorking: true, startTime: '10:00', endTime: '20:00' },
      wed: { weekday: 'wed', isWorking: true, startTime: '10:00', endTime: '20:00' },
      thu: { weekday: 'thu', isWorking: true, startTime: '10:00', endTime: '20:00' },
      fri: { weekday: 'fri', isWorking: true, startTime: '10:00', endTime: '20:00' },
      sat: { weekday: 'sat', isWorking: true, startTime: '10:00', endTime: '20:00' },
      sun: { weekday: 'sun', isWorking: false, startTime: '10:00', endTime: '20:00' },
    }),
    [],
  );
  const getSchedule = useCallback(
    (artisanId: string): ArtisanSchedule =>
      dbSchedules[artisanId] ?? { artisanId, days: DEFAULT_WEEK },
    [dbSchedules, DEFAULT_WEEK],
  );
  const updateScheduleDay = useCallback(
    (
      artisanId: string,
      weekday: WeekDay,
      fields: Partial<Omit<ArtisanScheduleDay, 'weekday'>>,
    ) => {
      const current = dbSchedules[artisanId] ?? { artisanId, days: DEFAULT_WEEK };
      const currentDay = current.days[weekday];
      const nextDay: ArtisanScheduleDay = { ...currentDay, ...fields, weekday };
      const nextSchedule: ArtisanSchedule = {
        artisanId,
        days: { ...current.days, [weekday]: nextDay },
      };
      queryClient.setQueryData<Record<string, ArtisanSchedule>>(
        ['artisan_schedules'],
        (prev) => ({ ...(prev ?? {}), [artisanId]: nextSchedule }),
      );
      void upsertArtisanScheduleDay(artisanId, weekday, fields)
        .then(() => invalidateSchedules())
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[catalog] updateScheduleDay failed:', err);
          void invalidateSchedules();
        });
    },
    [queryClient, invalidateSchedules, dbSchedules, DEFAULT_WEEK],
  );

  // Tier rules — leídos desde DB.
  const getTierRules = useCallback(() => dbTierRules, [dbTierRules]);

  // Tiers derivados: id/name/color del seed estático, min real de tier_rules,
  // max = min del siguiente tier (último = ∞ proxy 999_999).
  const getTiers = useCallback((): Tier[] => {
    const ruleByTier = new Map(dbTierRules.map((r) => [r.tierId, r]));
    const ordered = TIERS.map((staticTier) => ({
      ...staticTier,
      min: ruleByTier.get(staticTier.id)?.thresholdPoints ?? staticTier.min,
    })).sort((a, b) => a.min - b.min);
    return ordered.map((t, i, arr) => ({
      ...t,
      max: arr[i + 1]?.min ?? 999_999,
    }));
  }, [dbTierRules]);
  const updateTierRule = useCallback(
    (
      tierId: 'pearl' | 'gold' | 'noir',
      fields: Partial<Omit<TierRule, 'tierId'>>,
    ) => {
      queryClient.setQueryData<TierRule[]>(['tier_rules'], (prev) =>
        prev ? prev.map((r) => (r.tierId === tierId ? { ...r, ...fields } : r)) : prev,
      );
      void dbUpdateTierRule(tierId, fields)
        .then(() => invalidateTierRules())
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[catalog] updateTierRule failed:', err);
          void invalidateTierRules();
        });
    },
    [queryClient, invalidateTierRules],
  );

  // Reviews — leídos desde DB. respondToReview es la única mutation
  // (admin contesta una reseña).
  const getReviews = useCallback(() => dbReviews, [dbReviews]);
  const respondToReview = useCallback(
    (id: string, response: string) => {
      const responseDate = new Date().toISOString().slice(0, 10);
      queryClient.setQueryData<Review[]>(['reviews'], (prev) =>
        prev
          ? prev.map((r) =>
              r.id === id ? { ...r, response, responseDate } : r,
            )
          : prev,
      );
      void dbRespondToReview(id, response)
        .then(() => invalidateReviews())
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[catalog] respondToReview failed:', err);
          void invalidateReviews();
        });
    },
    [queryClient, invalidateReviews],
  );

  // Settings (single row).
  const getSettings = useCallback(() => dbSettings, [dbSettings]);
  const updateSettings = useCallback(
    (fields: Partial<SalonSettings>) => {
      queryClient.setQueryData<SalonSettings>(['salon_settings'], (prev) =>
        prev ? { ...prev, ...fields } : prev,
      );
      void updateSalonSettings(fields)
        .then(() => invalidateSettings())
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[catalog] updateSettings failed:', err);
          void invalidateSettings();
        });
    },
    [queryClient, invalidateSettings],
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
      createProduct,
      deleteProduct,
      getService,
      getAllServices,
      updateService,
      createService,
      deleteService,
      getArtisan,
      getAllArtisans,
      updateArtisan,
      createArtisan,
      deleteArtisan,
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
      updateScheduleDay,
      getTierRules,
      getTiers,
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
      createProduct,
      deleteProduct,
      getService,
      getAllServices,
      updateService,
      createService,
      deleteService,
      getArtisan,
      getAllArtisans,
      updateArtisan,
      createArtisan,
      deleteArtisan,
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
      updateScheduleDay,
      getTierRules,
      getTiers,
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
