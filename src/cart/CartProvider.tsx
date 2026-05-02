// DSR — Cart context con persistencia en localStorage.
// La verdad de la bolsa: productos (items) + servicios pendientes (pendingBookings).
// Subtotales y counts son derivados.
// El estado del drawer (open/closed) vive acá para que cualquier consumidor
// pueda abrirlo (TopChrome, Booking review, ProductDetail).

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { PRODUCTS, SERVICES, ARTISANS } from '../data/catalog';
import { useCatalog } from '../data/CatalogProvider';
import type { CartItem, PendingBooking, Promo } from '../types';

const ITEMS_KEY = 'dsr-cart-v1';
const BOOKINGS_KEY = 'dsr-cart-bookings-v1';
const PROMO_KEY = 'dsr-cart-promo-v1';

export type PromoApplyResult =
  | { ok: true }
  | { ok: false; reason: 'invalid' | 'expired' | 'exhausted' | 'inactive' };

interface CartValue {
  items: CartItem[];
  pendingBookings: PendingBooking[];
  productCount: number;
  serviceCount: number;
  count: number;
  productSubtotal: number;
  serviceSubtotal: number;
  subtotal: number;
  /** Código de cupón aplicado (si pasa la validación contra el catálogo). */
  appliedPromoCode: string | null;
  /** Promo resuelta del catálogo si está aplicada y aún es válida; null si no. */
  appliedPromo: Promo | null;
  /** Descuento absoluto aplicado por la promo. 0 si no aplica. */
  promoDiscount: number;
  /** Total final (subtotal − promoDiscount, mínimo 0). */
  total: number;
  applyPromo: (code: string) => PromoApplyResult;
  removePromo: () => void;
  add: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  addBooking: (booking: Omit<PendingBooking, 'id'>) => string;
  updateBooking: (id: string, updates: Partial<Omit<PendingBooking, 'id'>>) => void;
  removeBooking: (id: string) => void;
  clear: () => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const noop = () => {};
const CartCtx = createContext<CartValue>({
  items: [],
  pendingBookings: [],
  productCount: 0,
  serviceCount: 0,
  count: 0,
  productSubtotal: 0,
  serviceSubtotal: 0,
  subtotal: 0,
  appliedPromoCode: null,
  appliedPromo: null,
  promoDiscount: 0,
  total: 0,
  applyPromo: () => ({ ok: false, reason: 'invalid' }),
  removePromo: noop,
  add: noop,
  setQty: noop,
  remove: noop,
  addBooking: () => '',
  updateBooking: noop,
  removeBooking: noop,
  clear: noop,
  drawerOpen: false,
  openDrawer: noop,
  closeDrawer: noop,
  toggleDrawer: noop,
});

// Defensa: descarta items / bookings con ids desconocidos del catálogo.
function loadItems(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(ITEMS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const knownIds = new Set(PRODUCTS.map((p) => p.id));
    return parsed.flatMap((it): CartItem[] => {
      if (
        it &&
        typeof it === 'object' &&
        typeof (it as CartItem).productId === 'string' &&
        typeof (it as CartItem).qty === 'number' &&
        (it as CartItem).qty > 0 &&
        knownIds.has((it as CartItem).productId)
      ) {
        return [{ productId: (it as CartItem).productId, qty: (it as CartItem).qty }];
      }
      return [];
    });
  } catch {
    return [];
  }
}

function loadBookings(): PendingBooking[] {
  try {
    const raw = window.localStorage.getItem(BOOKINGS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const knownServices = new Set(SERVICES.map((s) => s.id));
    const knownArtisans = new Set(ARTISANS.map((a) => a.id));
    return parsed.flatMap((b): PendingBooking[] => {
      if (
        b &&
        typeof b === 'object' &&
        typeof (b as PendingBooking).id === 'string' &&
        Array.isArray((b as PendingBooking).serviceIds) &&
        (b as PendingBooking).serviceIds.every(
          (s) => typeof s === 'string' && knownServices.has(s),
        ) &&
        typeof (b as PendingBooking).artisanId === 'string' &&
        knownArtisans.has((b as PendingBooking).artisanId) &&
        typeof (b as PendingBooking).date === 'string' &&
        typeof (b as PendingBooking).time === 'string' &&
        typeof (b as PendingBooking).total === 'number' &&
        typeof (b as PendingBooking).duration === 'number'
      ) {
        return [b as PendingBooking];
      }
      return [];
    });
  } catch {
    return [];
  }
}

function save<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage lleno o privado — no es fatal */
  }
}

function loadPromoCode(): string | null {
  try {
    const raw = window.localStorage.getItem(PROMO_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === 'string' && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

// Valida una promo del catálogo: activa, no expirada, no agotada.
function validatePromo(
  promo: Promo,
): { ok: true } | { ok: false; reason: 'expired' | 'exhausted' | 'inactive' } {
  if (!promo.active) return { ok: false, reason: 'inactive' };
  if (promo.validUntil) {
    const today = new Date().toISOString().slice(0, 10);
    if (promo.validUntil < today) return { ok: false, reason: 'expired' };
  }
  if (typeof promo.maxUses === 'number' && promo.usedCount >= promo.maxUses) {
    return { ok: false, reason: 'exhausted' };
  }
  return { ok: true };
}

function generateBookingId(): string {
  return `pb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Catálogo con overrides — para que los precios mostrados reflejen
  // ediciones del admin sin que el customer recargue.
  const catalog = useCatalog();
  const [items, setItems] = useState<CartItem[]>(loadItems);
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>(loadBookings);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(loadPromoCode);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    save(ITEMS_KEY, items);
  }, [items]);

  useEffect(() => {
    save(BOOKINGS_KEY, pendingBookings);
  }, [pendingBookings]);

  useEffect(() => {
    save(PROMO_KEY, appliedPromoCode);
  }, [appliedPromoCode]);

  const add = useCallback((productId: string, qty: number = 1) => {
    if (qty <= 0) return;
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.productId === productId);
      if (idx === -1) return [...prev, { productId, qty }];
      const next = [...prev];
      next[idx] = { ...next[idx], qty: next[idx].qty + qty };
      return next;
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((it) => it.productId !== productId);
      return prev.map((it) =>
        it.productId === productId ? { ...it, qty } : it,
      );
    });
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((it) => it.productId !== productId));
  }, []);

  const addBooking = useCallback((booking: Omit<PendingBooking, 'id'>) => {
    const id = generateBookingId();
    setPendingBookings((prev) => [...prev, { ...booking, id }]);
    return id;
  }, []);

  const updateBooking = useCallback(
    (id: string, updates: Partial<Omit<PendingBooking, 'id'>>) => {
      setPendingBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      );
    },
    [],
  );

  const removeBooking = useCallback((id: string) => {
    setPendingBookings((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setPendingBookings([]);
    setAppliedPromoCode(null);
  }, []);

  const applyPromo = useCallback(
    (code: string): PromoApplyResult => {
      const normalized = code.trim().toUpperCase();
      if (!normalized) return { ok: false, reason: 'invalid' };
      const promo = catalog
        .getPromos()
        .find((p) => p.code.toUpperCase() === normalized);
      if (!promo) return { ok: false, reason: 'invalid' };
      const v = validatePromo(promo);
      if (!v.ok) return { ok: false, reason: v.reason };
      setAppliedPromoCode(normalized);
      return { ok: true };
    },
    [catalog],
  );

  const removePromo = useCallback(() => setAppliedPromoCode(null), []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setDrawerOpen((v) => !v), []);

  const productMetrics = useMemo(() => {
    let count = 0;
    let subtotal = 0;
    for (const it of items) {
      const p = catalog.getProduct(it.productId);
      if (!p) continue;
      count += it.qty;
      subtotal += p.price * it.qty;
    }
    return { count, subtotal };
  }, [items, catalog]);

  const serviceMetrics = useMemo(() => {
    let count = 0;
    let subtotal = 0;
    for (const b of pendingBookings) {
      count += 1;
      subtotal += b.total;
    }
    return { count, subtotal };
  }, [pendingBookings]);

  // Promo derivada del code aplicado. Si la promo dejó de ser válida
  // (admin la borró/desactivó/expiró), el cupón se ignora silenciosamente
  // hasta que el user lo quite o ingrese otro.
  const subtotal = productMetrics.subtotal + serviceMetrics.subtotal;
  const appliedPromo = useMemo<Promo | null>(() => {
    if (!appliedPromoCode) return null;
    const promo = catalog
      .getPromos()
      .find((p) => p.code.toUpperCase() === appliedPromoCode);
    if (!promo) return null;
    return validatePromo(promo).ok ? promo : null;
  }, [appliedPromoCode, catalog]);
  const promoDiscount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.type === 'pct') {
      return Math.min(subtotal, Math.round((subtotal * appliedPromo.value) / 100));
    }
    return Math.min(subtotal, appliedPromo.value);
  }, [appliedPromo, subtotal]);
  const total = Math.max(0, subtotal - promoDiscount);

  const value = useMemo<CartValue>(
    () => ({
      items,
      pendingBookings,
      productCount: productMetrics.count,
      serviceCount: serviceMetrics.count,
      count: productMetrics.count + serviceMetrics.count,
      productSubtotal: productMetrics.subtotal,
      serviceSubtotal: serviceMetrics.subtotal,
      subtotal,
      appliedPromoCode,
      appliedPromo,
      promoDiscount,
      total,
      applyPromo,
      removePromo,
      add,
      setQty,
      remove,
      addBooking,
      updateBooking,
      removeBooking,
      clear,
      drawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
    }),
    [
      items,
      pendingBookings,
      productMetrics,
      serviceMetrics,
      subtotal,
      appliedPromoCode,
      appliedPromo,
      promoDiscount,
      total,
      applyPromo,
      removePromo,
      add,
      setQty,
      remove,
      addBooking,
      updateBooking,
      removeBooking,
      clear,
      drawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
    ],
  );

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export const useCart = () => useContext(CartCtx);
