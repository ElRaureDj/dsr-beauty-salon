// DSR Maison — fetchers de Supabase para el catálogo.
// Cada fetcher mapea snake_case (DB) → camelCase / mixto (TS types del repo).
// `photo` y `photos[]` son slugs en DB que el frontend resuelve con I().
// Los queries son SELECT-only — los writes admin viven todavía en localStorage
// hasta una fase posterior.

import { supabase } from './supabase';
import type {
  Address,
  Artisan,
  CartItem,
  CategoryId,
  Combo,
  GiftCardDesign,
  NailLook,
  PendingBooking,
  Perk,
  Product,
  Promo,
  Service,
  Tier,
} from '../types';

// ---------- Helpers ----------

function nullish<T extends string>(v: T | null | undefined): T | undefined {
  return v == null || v === '' ? undefined : v;
}

// ---------- Categories ----------

interface DbCategory {
  id: CategoryId;
  name_es: string;
  name_en: string;
  tag: string;
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name_es, name_en, tag');
  if (error) throw error;
  return (data as DbCategory[]).map((row) => ({
    id: row.id,
    es: row.name_es,
    en: row.name_en,
    tag: row.tag,
  }));
}

// ---------- Services ----------

interface DbService {
  id: string;
  cat_id: CategoryId;
  name_es: string;
  name_en: string;
  desc_es: string;
  desc_en: string;
  duration: number;
  price: number;
  popular: boolean;
}

function mapService(row: DbService): Service {
  return {
    id: row.id,
    cat: row.cat_id,
    es: row.name_es,
    en: row.name_en,
    desc_es: row.desc_es,
    desc_en: row.desc_en,
    duration: row.duration,
    price: Number(row.price),
    popular: row.popular,
  };
}

export async function fetchServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select(
      'id, cat_id, name_es, name_en, desc_es, desc_en, duration, price, popular',
    );
  if (error) throw error;
  return (data as DbService[]).map(mapService);
}

// ---------- Artisans ----------

interface DbArtisan {
  id: string;
  name: string;
  role_es: string;
  role_en: string;
  cats: CategoryId[];
  specialty_es: string;
  specialty_en: string;
  years: number;
  bio_es: string;
  bio_en: string;
  rating: number;
  reviews: number;
  photo: string;
  avatar: string;
  signature_es: string | null;
  signature_en: string | null;
}

function mapArtisan(row: DbArtisan): Artisan {
  return {
    id: row.id,
    name: row.name,
    role_es: row.role_es,
    role_en: row.role_en,
    cats: row.cats,
    specialty_es: row.specialty_es,
    specialty_en: row.specialty_en,
    years: row.years,
    bio_es: row.bio_es,
    bio_en: row.bio_en,
    rating: Number(row.rating),
    reviews: row.reviews,
    photo: row.photo,
    avatar: row.avatar,
    signature_es: nullish(row.signature_es ?? undefined),
    signature_en: nullish(row.signature_en ?? undefined),
  };
}

export async function fetchArtisans(): Promise<Artisan[]> {
  const { data, error } = await supabase
    .from('artisans')
    .select(
      'id, name, role_es, role_en, cats, specialty_es, specialty_en, years, bio_es, bio_en, rating, reviews, photo, avatar, signature_es, signature_en',
    );
  if (error) throw error;
  return (data as DbArtisan[]).map(mapArtisan);
}

// ---------- Products ----------

interface DbProduct {
  id: string;
  name_es: string;
  name_en: string;
  line: string;
  cat_es: string;
  cat_en: string;
  size: string;
  price: number;
  desc_es: string;
  desc_en: string;
  notes_es: string[];
  notes_en: string[];
  photo: string;
  photos: string[];
  video: string | null;
  badge_es: string | null;
  badge_en: string | null;
  rating: number;
  reviews: number;
}

function mapProduct(row: DbProduct): Product {
  return {
    id: row.id,
    name_es: row.name_es,
    name_en: row.name_en,
    line: row.line,
    cat_es: row.cat_es,
    cat_en: row.cat_en,
    size: row.size,
    price: Number(row.price),
    desc_es: row.desc_es,
    desc_en: row.desc_en,
    notes_es: row.notes_es,
    notes_en: row.notes_en,
    photo: row.photo,
    photos: row.photos,
    video: nullish(row.video ?? undefined),
    badge_es: nullish(row.badge_es ?? undefined),
    badge_en: nullish(row.badge_en ?? undefined),
    rating: Number(row.rating),
    reviews: row.reviews,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, name_es, name_en, line, cat_es, cat_en, size, price, desc_es, desc_en, notes_es, notes_en, photo, photos, video, badge_es, badge_en, rating, reviews',
    );
  if (error) throw error;
  return (data as DbProduct[]).map(mapProduct);
}

// ---------- Combos ----------

interface DbCombo {
  id: string;
  name_es: string;
  name_en: string;
  service_ids: string[];
  discount_pct: number;
  description_es: string | null;
  description_en: string | null;
  popular: boolean;
}

function mapCombo(row: DbCombo): Combo {
  return {
    id: row.id,
    name_es: row.name_es,
    name_en: row.name_en,
    serviceIds: row.service_ids,
    discountPct: Number(row.discount_pct),
    description_es: nullish(row.description_es ?? undefined),
    description_en: nullish(row.description_en ?? undefined),
    popular: row.popular,
  };
}

const COMBO_COLS =
  'id, name_es, name_en, service_ids, discount_pct, description_es, description_en, popular';

export async function fetchCombos(): Promise<Combo[]> {
  const { data, error } = await supabase.from('combos').select(COMBO_COLS);
  if (error) throw error;
  return (data as DbCombo[]).map(mapCombo);
}

function comboToDb(combo: Omit<Combo, 'id'>): Omit<DbCombo, 'id'> {
  return {
    name_es: combo.name_es,
    name_en: combo.name_en,
    service_ids: combo.serviceIds,
    discount_pct: combo.discountPct,
    description_es: combo.description_es ?? null,
    description_en: combo.description_en ?? null,
    popular: combo.popular ?? false,
  };
}

/**
 * Crea un combo. Genera id manualmente (la tabla combos.id es text PK,
 * no UUID — el frontend ya tenía generador `cmb-...` que mantenemos
 * para consistencia con seeds).
 */
export async function createCombo(
  combo: Combo,
): Promise<Combo> {
  const { data, error } = await supabase
    .from('combos')
    .insert({ id: combo.id, ...comboToDb(combo) })
    .select(COMBO_COLS)
    .single();
  if (error) throw error;
  return mapCombo(data as DbCombo);
}

export async function updateCombo(
  id: string,
  fields: Partial<Omit<Combo, 'id'>>,
): Promise<Combo> {
  const dbUpdates: Partial<Omit<DbCombo, 'id'>> = {};
  if (fields.name_es !== undefined) dbUpdates.name_es = fields.name_es;
  if (fields.name_en !== undefined) dbUpdates.name_en = fields.name_en;
  if (fields.serviceIds !== undefined) dbUpdates.service_ids = fields.serviceIds;
  if (fields.discountPct !== undefined) dbUpdates.discount_pct = fields.discountPct;
  if (fields.description_es !== undefined)
    dbUpdates.description_es = fields.description_es ?? null;
  if (fields.description_en !== undefined)
    dbUpdates.description_en = fields.description_en ?? null;
  if (fields.popular !== undefined) dbUpdates.popular = fields.popular;

  const { data, error } = await supabase
    .from('combos')
    .update(dbUpdates)
    .eq('id', id)
    .select(COMBO_COLS)
    .single();
  if (error) throw error;
  return mapCombo(data as DbCombo);
}

export async function deleteCombo(id: string): Promise<void> {
  const { error } = await supabase.from('combos').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Reset: borra todos los combos del admin y reinserta el seed inicial.
 * Útil para restaurar el demo durante desarrollo. La función es admin-only
 * vía RLS (delete + insert sobre combos).
 */
export async function resetCombosToSeed(seed: Combo[]): Promise<void> {
  // Delete all (RLS bloquea a non-admins).
  const { error: delErr } = await supabase
    .from('combos')
    .delete()
    .neq('id', '__never_matches__');
  if (delErr) throw delErr;
  if (seed.length === 0) return;
  const rows = seed.map((c) => ({ id: c.id, ...comboToDb(c) }));
  const { error: insErr } = await supabase.from('combos').insert(rows);
  if (insErr) throw insErr;
}

// ---------- Nail Looks ----------

interface DbNailLook {
  id: string;
  img: string;
  name_es: string;
  name_en: string;
  technique_es: string;
  technique_en: string;
  shade: string;
  artisan_id: string | null;
  season_es: string;
  season_en: string;
  service_id: string | null;
  popular: boolean;
}

function mapNailLook(row: DbNailLook): NailLook {
  return {
    id: row.id,
    img: row.img,
    name_es: row.name_es,
    name_en: row.name_en,
    technique_es: row.technique_es,
    technique_en: row.technique_en,
    shade: row.shade,
    artisan: row.artisan_id ?? '',
    season_es: row.season_es,
    season_en: row.season_en,
    service: row.service_id ?? '',
    popular: row.popular,
  };
}

export async function fetchNailLooks(): Promise<NailLook[]> {
  const { data, error } = await supabase
    .from('nail_looks')
    .select(
      'id, img, name_es, name_en, technique_es, technique_en, shade, artisan_id, season_es, season_en, service_id, popular',
    );
  if (error) throw error;
  return (data as DbNailLook[]).map(mapNailLook);
}

// ---------- Tiers + Perks ----------

interface DbTier {
  id: 'pearl' | 'gold' | 'noir';
  name_es: string;
  name_en: string;
  min_points: number;
  max_points: number;
  color: string;
}

function mapTier(row: DbTier): Tier {
  return {
    id: row.id,
    name: { es: row.name_es, en: row.name_en },
    min: row.min_points,
    max: row.max_points,
    color: row.color,
  };
}

export async function fetchTiers(): Promise<Tier[]> {
  const { data, error } = await supabase
    .from('tiers')
    .select('id, name_es, name_en, min_points, max_points, color')
    .order('min_points', { ascending: true });
  if (error) throw error;
  return (data as DbTier[]).map(mapTier);
}

interface DbPerk {
  tier_id: 'pearl' | 'gold' | 'noir';
  position: number;
  perk_es: string;
  perk_en: string;
}

export async function fetchPerks(): Promise<Record<Tier['id'], Perk[]>> {
  const { data, error } = await supabase
    .from('tier_perks')
    .select('tier_id, position, perk_es, perk_en')
    .order('position', { ascending: true });
  if (error) throw error;
  const out: Record<Tier['id'], Perk[]> = { pearl: [], gold: [], noir: [] };
  for (const row of data as DbPerk[]) {
    out[row.tier_id].push({ es: row.perk_es, en: row.perk_en });
  }
  return out;
}

// ---------- Gift Card Designs ----------

interface DbGiftCardDesign {
  id: string;
  name_es: string;
  name_en: string;
  bg: string;
  fg: string;
  accent: string;
  vibe_es: string;
  vibe_en: string;
}

export async function fetchGiftCardDesigns(): Promise<GiftCardDesign[]> {
  const { data, error } = await supabase
    .from('gift_card_designs')
    .select('id, name_es, name_en, bg, fg, accent, vibe_es, vibe_en');
  if (error) throw error;
  return data as DbGiftCardDesign[];
}

// ---------- Profiles (per-user) ----------

export interface DbProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  points: number;
  visits: number;
  spent: number;
  joined: string;
  preferred_artisans: string[];
  is_admin: boolean;
}

/** Lee el profile del user actual (owner). RLS bloquea acceso a otros. */
export async function fetchMyProfile(): Promise<DbProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, email, full_name, display_name, avatar_url, points, visits, spent, joined, preferred_artisans, is_admin',
    )
    .maybeSingle();
  if (error) throw error;
  return data as DbProfile | null;
}

/**
 * Update parcial del profile del owner. Solo campos editables — points/
 * visits/spent vienen del backend (admin/transacciones), no del cliente.
 */
export type ProfileUpdate = Partial<
  Pick<DbProfile, 'full_name' | 'display_name' | 'avatar_url' | 'preferred_artisans'>
>;

export async function updateMyProfile(
  userId: string,
  updates: ProfileUpdate,
): Promise<DbProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select(
      'id, email, full_name, display_name, avatar_url, points, visits, spent, joined, preferred_artisans, is_admin',
    )
    .maybeSingle();
  if (error) throw error;
  return data as DbProfile | null;
}

// ---------- Addresses (per-user) ----------

interface DbAddress {
  id: string;
  user_id: string;
  label: string;
  recipient: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default: boolean;
}

function mapAddress(row: DbAddress): Address {
  return {
    id: row.id,
    label: row.label,
    recipient: row.recipient,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    region: row.region,
    postalCode: row.postal_code,
    country: row.country,
    phone: row.phone,
    isDefault: row.is_default,
  };
}

const ADDRESS_COLS =
  'id, user_id, label, recipient, line1, line2, city, region, postal_code, country, phone, is_default';

export async function fetchMyAddresses(): Promise<Address[]> {
  const { data, error } = await supabase
    .from('addresses')
    .select(ADDRESS_COLS)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as DbAddress[]).map(mapAddress);
}

export type AddressInput = Omit<Address, 'id' | 'isDefault'> & {
  isDefault?: boolean;
};

function toDbAddress(input: AddressInput): Omit<DbAddress, 'id' | 'user_id'> {
  return {
    label: input.label,
    recipient: input.recipient,
    line1: input.line1,
    line2: input.line2,
    city: input.city,
    region: input.region,
    postal_code: input.postalCode,
    country: input.country,
    phone: input.phone,
    is_default: input.isDefault ?? false,
  };
}

export async function createAddress(
  userId: string,
  input: AddressInput,
): Promise<Address> {
  // Si esta es default, primero limpiar el default anterior (parcial unique
  // index en la DB nos rechazaría dos rows con is_default = true).
  if (input.isDefault) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('is_default', true);
  }
  const { data, error } = await supabase
    .from('addresses')
    .insert({ ...toDbAddress(input), user_id: userId })
    .select(ADDRESS_COLS)
    .single();
  if (error) throw error;
  return mapAddress(data as DbAddress);
}

export async function updateAddress(
  userId: string,
  id: string,
  input: AddressInput,
): Promise<Address> {
  if (input.isDefault) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('is_default', true)
      .neq('id', id);
  }
  const { data, error } = await supabase
    .from('addresses')
    .update(toDbAddress(input))
    .eq('id', id)
    .select(ADDRESS_COLS)
    .single();
  if (error) throw error;
  return mapAddress(data as DbAddress);
}

export async function deleteAddress(id: string): Promise<void> {
  const { error } = await supabase.from('addresses').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Promos ----------

interface DbPromo {
  id: string;
  code: string;
  type: 'pct' | 'fixed';
  value: number;
  description_es: string | null;
  description_en: string | null;
  valid_until: string | null;
  max_uses: number | null;
  used_count: number;
  active: boolean;
}

const PROMO_COLS =
  'id, code, type, value, description_es, description_en, valid_until, max_uses, used_count, active';

function mapPromo(row: DbPromo): Promo {
  return {
    id: row.id,
    code: row.code,
    type: row.type,
    value: Number(row.value),
    description_es: row.description_es ?? undefined,
    description_en: row.description_en ?? undefined,
    validUntil: row.valid_until ?? undefined,
    maxUses: row.max_uses ?? undefined,
    usedCount: row.used_count,
    active: row.active,
  };
}

function promoToDb(p: Omit<Promo, 'id'>): Omit<DbPromo, 'id'> {
  return {
    code: p.code.toUpperCase().trim(),
    type: p.type,
    value: p.value,
    description_es: p.description_es ?? null,
    description_en: p.description_en ?? null,
    valid_until: p.validUntil ?? null,
    max_uses: p.maxUses ?? null,
    used_count: p.usedCount,
    active: p.active,
  };
}

export async function fetchPromos(): Promise<Promo[]> {
  const { data, error } = await supabase
    .from('promos')
    .select(PROMO_COLS)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as DbPromo[]).map(mapPromo);
}

export async function createPromo(promo: Promo): Promise<Promo> {
  const { data, error } = await supabase
    .from('promos')
    .insert({ id: promo.id, ...promoToDb(promo) })
    .select(PROMO_COLS)
    .single();
  if (error) throw error;
  return mapPromo(data as DbPromo);
}

export async function updatePromo(
  id: string,
  fields: Partial<Omit<Promo, 'id'>>,
): Promise<Promo> {
  const dbUpdates: Partial<Omit<DbPromo, 'id'>> = {};
  if (fields.code !== undefined) dbUpdates.code = fields.code.toUpperCase().trim();
  if (fields.type !== undefined) dbUpdates.type = fields.type;
  if (fields.value !== undefined) dbUpdates.value = fields.value;
  if (fields.description_es !== undefined)
    dbUpdates.description_es = fields.description_es ?? null;
  if (fields.description_en !== undefined)
    dbUpdates.description_en = fields.description_en ?? null;
  if (fields.validUntil !== undefined)
    dbUpdates.valid_until = fields.validUntil ?? null;
  if (fields.maxUses !== undefined) dbUpdates.max_uses = fields.maxUses ?? null;
  if (fields.usedCount !== undefined) dbUpdates.used_count = fields.usedCount;
  if (fields.active !== undefined) dbUpdates.active = fields.active;

  const { data, error } = await supabase
    .from('promos')
    .update(dbUpdates)
    .eq('id', id)
    .select(PROMO_COLS)
    .single();
  if (error) throw error;
  return mapPromo(data as DbPromo);
}

export async function deletePromo(id: string): Promise<void> {
  const { error } = await supabase.from('promos').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Cart Items (per-user) ----------

interface DbCartItem {
  id: string;
  user_id: string;
  product_id: string;
  qty: number;
}

export async function fetchMyCartItems(): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from('cart_items')
    .select('product_id, qty');
  if (error) throw error;
  return (data as Pick<DbCartItem, 'product_id' | 'qty'>[]).map((row) => ({
    productId: row.product_id,
    qty: row.qty,
  }));
}

/** Upsert: si ya existe el (user_id, product_id), suma qty. */
export async function addCartItem(
  userId: string,
  productId: string,
  qty: number,
): Promise<void> {
  // Buscar existente para sumar; si no existe, insertar.
  const { data: existing } = await supabase
    .from('cart_items')
    .select('qty')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();
  if (existing) {
    const next = (existing as { qty: number }).qty + qty;
    const { error } = await supabase
      .from('cart_items')
      .update({ qty: next })
      .eq('user_id', userId)
      .eq('product_id', productId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('cart_items')
      .insert({ user_id: userId, product_id: productId, qty });
    if (error) throw error;
  }
}

export async function setCartItemQty(
  userId: string,
  productId: string,
  qty: number,
): Promise<void> {
  if (qty <= 0) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    if (error) throw error;
    return;
  }
  const { error } = await supabase
    .from('cart_items')
    .update({ qty })
    .eq('user_id', userId)
    .eq('product_id', productId);
  if (error) throw error;
}

export async function removeCartItem(
  userId: string,
  productId: string,
): Promise<void> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
  if (error) throw error;
}

export async function clearCartItems(userId: string): Promise<void> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
}

// ---------- Pending Bookings (per-user) ----------

interface DbPendingBooking {
  id: string;
  user_id: string;
  service_ids: string[];
  artisan_id: string;
  date: string;
  time: string;
  total: number;
  duration: number;
  notes: string | null;
  variant: 'standard' | 'premium' | 'custom' | null;
  addon_product_ids: string[];
  combo_id: string | null;
  discount_pct: number | null;
}

const PENDING_BOOKING_COLS =
  'id, user_id, service_ids, artisan_id, date, time, total, duration, notes, variant, addon_product_ids, combo_id, discount_pct';

function mapPendingBooking(row: DbPendingBooking): PendingBooking {
  return {
    id: row.id,
    serviceIds: row.service_ids,
    artisanId: row.artisan_id,
    date: row.date,
    time: row.time,
    total: Number(row.total),
    duration: row.duration,
    notes: row.notes ?? undefined,
    variant: row.variant ?? undefined,
    addonProductIds:
      row.addon_product_ids.length > 0 ? row.addon_product_ids : undefined,
    comboId: row.combo_id ?? undefined,
    discountPct: row.discount_pct ?? undefined,
  };
}

export async function fetchMyPendingBookings(): Promise<PendingBooking[]> {
  const { data, error } = await supabase
    .from('pending_bookings')
    .select(PENDING_BOOKING_COLS)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as DbPendingBooking[]).map(mapPendingBooking);
}

export async function addPendingBooking(
  userId: string,
  booking: Omit<PendingBooking, 'id'>,
): Promise<PendingBooking> {
  const { data, error } = await supabase
    .from('pending_bookings')
    .insert({
      user_id: userId,
      service_ids: booking.serviceIds,
      artisan_id: booking.artisanId,
      date: booking.date,
      time: booking.time,
      total: booking.total,
      duration: booking.duration,
      notes: booking.notes ?? null,
      variant: booking.variant ?? null,
      addon_product_ids: booking.addonProductIds ?? [],
      combo_id: booking.comboId ?? null,
      discount_pct: booking.discountPct ?? null,
    })
    .select(PENDING_BOOKING_COLS)
    .single();
  if (error) throw error;
  return mapPendingBooking(data as DbPendingBooking);
}

export async function updatePendingBooking(
  id: string,
  updates: Partial<Omit<PendingBooking, 'id'>>,
): Promise<PendingBooking> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.serviceIds !== undefined) dbUpdates.service_ids = updates.serviceIds;
  if (updates.artisanId !== undefined) dbUpdates.artisan_id = updates.artisanId;
  if (updates.date !== undefined) dbUpdates.date = updates.date;
  if (updates.time !== undefined) dbUpdates.time = updates.time;
  if (updates.total !== undefined) dbUpdates.total = updates.total;
  if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes ?? null;
  if (updates.variant !== undefined) dbUpdates.variant = updates.variant ?? null;
  if (updates.addonProductIds !== undefined)
    dbUpdates.addon_product_ids = updates.addonProductIds ?? [];
  if (updates.comboId !== undefined) dbUpdates.combo_id = updates.comboId ?? null;
  if (updates.discountPct !== undefined)
    dbUpdates.discount_pct = updates.discountPct ?? null;

  const { data, error } = await supabase
    .from('pending_bookings')
    .update(dbUpdates)
    .eq('id', id)
    .select(PENDING_BOOKING_COLS)
    .single();
  if (error) throw error;
  return mapPendingBooking(data as DbPendingBooking);
}

export async function removePendingBooking(id: string): Promise<void> {
  const { error } = await supabase
    .from('pending_bookings')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function clearPendingBookings(userId: string): Promise<void> {
  const { error } = await supabase
    .from('pending_bookings')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
}

// ---------- Service Variants ----------

interface DbServiceVariant {
  service_id: string;
  premium_label_es: string | null;
  premium_label_en: string | null;
  premium_addon_product_ids: string[];
  custom_compatible_product_ids: string[];
}

export interface VariantsRow {
  serviceId: string;
  premium?: {
    label_es: string;
    label_en: string;
    addonProductIds: string[];
  };
  customCompatibleProductIds?: string[];
}

export async function fetchServiceVariants(): Promise<VariantsRow[]> {
  const { data, error } = await supabase
    .from('service_variants')
    .select(
      'service_id, premium_label_es, premium_label_en, premium_addon_product_ids, custom_compatible_product_ids',
    );
  if (error) throw error;
  return (data as DbServiceVariant[]).map((row) => ({
    serviceId: row.service_id,
    premium:
      row.premium_label_es && row.premium_label_en
        ? {
            label_es: row.premium_label_es,
            label_en: row.premium_label_en,
            addonProductIds: row.premium_addon_product_ids,
          }
        : undefined,
    customCompatibleProductIds:
      row.custom_compatible_product_ids.length > 0
        ? row.custom_compatible_product_ids
        : undefined,
  }));
}
