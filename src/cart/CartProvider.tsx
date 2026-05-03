// DSR — Cart context, session-aware.
// - Sin sesión (guest): persiste en localStorage. Preserva el demo experience.
// - Con sesión: lee/escribe en cart_items + pending_bookings de Supabase.
//   Las mutations son optimistic — actualizan state local primero y luego
//   dispatchan al backend en background (fire and forget). Los errores se
//   loggean pero no rompen UX; el siguiente refetch normaliza divergencias.
//
// Auto-merge en sign-in: si el guest tenía items/bookings en localStorage,
// se insertan en la DB del user y se limpia el localStorage.

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
import { useUser } from '../data/UserProvider';
import {
  addCartItem,
  addPendingBooking,
  clearCartItems,
  clearPendingBookings,
  fetchMyCartItems,
  fetchMyPendingBookings,
  removeCartItem,
  removePendingBooking,
  setCartItemQty,
  updatePendingBooking,
} from '../lib/db';
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

function logErr(action: string) {
  return (err: unknown) => {
    // eslint-disable-next-line no-console
    console.error(`[cart] ${action} failed:`, err);
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Catálogo con overrides — para que los precios mostrados reflejen
  // ediciones del admin sin que el customer recargue.
  const catalog = useCatalog();
  const { session } = useUser();
  const userId = session?.user?.id ?? null;

  const [items, setItems] = useState<CartItem[]>(loadItems);
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>(loadBookings);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(loadPromoCode);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Cuando cambia el contexto de auth: si llega un userId, mergear el guest
  // cart en DB (one-shot) y luego refetch de la fuente de verdad. Si vamos
  // a guest, restaurar lo que hay en localStorage.
  useEffect(() => {
    if (!userId) {
      setItems(loadItems());
      setPendingBookings(loadBookings());
      return;
    }

    let cancelled = false;
    const run = async () => {
      try {
        // Auto-merge: si el guest dejó items/bookings en localStorage, los
        // subimos al backend del user y limpiamos local. Idempotente —
        // addCartItem suma qty si ya existía.
        const guestItems = loadItems();
        for (const it of guestItems) {
          await addCartItem(userId, it.productId, it.qty);
        }
        if (guestItems.length > 0) {
          window.localStorage.removeItem(ITEMS_KEY);
        }
        const guestBookings = loadBookings();
        for (const b of guestBookings) {
          // Quitamos el id local antes de insertar — la DB asigna uno UUID.
          const { id: _localId, ...rest } = b;
          void _localId;
          await addPendingBooking(userId, rest);
        }
        if (guestBookings.length > 0) {
          window.localStorage.removeItem(BOOKINGS_KEY);
        }

        // Fetch fuente de verdad.
        const [dbItems, dbBookings] = await Promise.all([
          fetchMyCartItems(),
          fetchMyPendingBookings(),
        ]);
        if (cancelled) return;
        setItems(dbItems);
        setPendingBookings(dbBookings);
      } catch (err) {
        logErr('initial sync')(err);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Persist a localStorage solo en modo guest. Para users autenticados, la DB
  // ya tiene la verdad — localStorage podría desincronizar con multi-tab.
  useEffect(() => {
    if (userId) return;
    save(ITEMS_KEY, items);
  }, [items, userId]);

  useEffect(() => {
    if (userId) return;
    save(BOOKINGS_KEY, pendingBookings);
  }, [pendingBookings, userId]);

  // Promo siempre en localStorage (es session-level, no account data).
  useEffect(() => {
    save(PROMO_KEY, appliedPromoCode);
  }, [appliedPromoCode]);

  const add = useCallback(
    (productId: string, qty: number = 1) => {
      if (qty <= 0) return;
      setItems((prev) => {
        const idx = prev.findIndex((it) => it.productId === productId);
        if (idx === -1) return [...prev, { productId, qty }];
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      });
      if (userId) addCartItem(userId, productId, qty).catch(logErr('add'));
    },
    [userId],
  );

  const setQty = useCallback(
    (productId: string, qty: number) => {
      setItems((prev) => {
        if (qty <= 0) return prev.filter((it) => it.productId !== productId);
        return prev.map((it) =>
          it.productId === productId ? { ...it, qty } : it,
        );
      });
      if (userId) setCartItemQty(userId, productId, qty).catch(logErr('setQty'));
    },
    [userId],
  );

  const remove = useCallback(
    (productId: string) => {
      setItems((prev) => prev.filter((it) => it.productId !== productId));
      if (userId) removeCartItem(userId, productId).catch(logErr('remove'));
    },
    [userId],
  );

  const addBooking = useCallback(
    (booking: Omit<PendingBooking, 'id'>) => {
      const localId = generateBookingId();
      setPendingBookings((prev) => [...prev, { ...booking, id: localId }]);
      if (userId) {
        // Reemplazar el id local con el UUID real cuando vuelva la DB.
        addPendingBooking(userId, booking)
          .then((created) => {
            setPendingBookings((prev) =>
              prev.map((b) => (b.id === localId ? created : b)),
            );
          })
          .catch(logErr('addBooking'));
      }
      return localId;
    },
    [userId],
  );

  const updateBooking = useCallback(
    (id: string, updates: Partial<Omit<PendingBooking, 'id'>>) => {
      setPendingBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      );
      if (userId) updatePendingBooking(id, updates).catch(logErr('updateBooking'));
    },
    [userId],
  );

  const removeBooking = useCallback(
    (id: string) => {
      setPendingBookings((prev) => prev.filter((b) => b.id !== id));
      if (userId) removePendingBooking(id).catch(logErr('removeBooking'));
    },
    [userId],
  );

  const clear = useCallback(() => {
    setItems([]);
    setPendingBookings([]);
    setAppliedPromoCode(null);
    if (userId) {
      clearCartItems(userId).catch(logErr('clear items'));
      clearPendingBookings(userId).catch(logErr('clear bookings'));
    }
  }, [userId]);

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
