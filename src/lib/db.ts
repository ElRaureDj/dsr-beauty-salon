// DSR Maison — fetchers de Supabase para el catálogo.
// Cada fetcher mapea snake_case (DB) → camelCase / mixto (TS types del repo).
// `photo` y `photos[]` son slugs en DB que el frontend resuelve con I().
// Los queries son SELECT-only — los writes admin viven todavía en localStorage
// hasta una fase posterior.

import { supabase } from './supabase';
import type {
  Address,
  Artisan,
  ArtisanSchedule,
  ArtisanScheduleDay,
  CartItem,
  CategoryId,
  Combo,
  GiftCardDesign,
  NailLook,
  PendingBooking,
  Perk,
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

const SERVICE_COLS =
  'id, cat_id, name_es, name_en, desc_es, desc_en, duration, price, popular';

export async function fetchServices(): Promise<Service[]> {
  const { data, error } = await supabase.from('services').select(SERVICE_COLS);
  if (error) throw error;
  return (data as DbService[]).map(mapService);
}

function serviceToDb(s: Omit<Service, 'id'>): Omit<DbService, 'id'> {
  return {
    cat_id: s.cat,
    name_es: s.es,
    name_en: s.en,
    desc_es: s.desc_es,
    desc_en: s.desc_en,
    duration: s.duration,
    price: s.price,
    popular: s.popular ?? false,
  };
}

export async function createServiceDb(svc: Service): Promise<Service> {
  const { data, error } = await supabase
    .from('services')
    .insert({ id: svc.id, ...serviceToDb(svc) })
    .select(SERVICE_COLS)
    .single();
  if (error) throw error;
  return mapService(data as DbService);
}

export async function updateServiceDb(
  id: string,
  fields: Partial<Omit<Service, 'id'>>,
): Promise<Service> {
  const update: Record<string, unknown> = {};
  if (fields.cat !== undefined) update.cat_id = fields.cat;
  if (fields.es !== undefined) update.name_es = fields.es;
  if (fields.en !== undefined) update.name_en = fields.en;
  if (fields.desc_es !== undefined) update.desc_es = fields.desc_es;
  if (fields.desc_en !== undefined) update.desc_en = fields.desc_en;
  if (fields.duration !== undefined) update.duration = fields.duration;
  if (fields.price !== undefined) update.price = fields.price;
  if (fields.popular !== undefined) update.popular = fields.popular;
  const { data, error } = await supabase
    .from('services')
    .update(update)
    .eq('id', id)
    .select(SERVICE_COLS)
    .single();
  if (error) throw error;
  return mapService(data as DbService);
}

export async function deleteServiceDb(id: string): Promise<void> {
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw error;
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

const ARTISAN_COLS =
  'id, name, role_es, role_en, cats, specialty_es, specialty_en, years, bio_es, bio_en, rating, reviews, photo, avatar, signature_es, signature_en';

export async function fetchArtisans(): Promise<Artisan[]> {
  const { data, error } = await supabase.from('artisans').select(ARTISAN_COLS);
  if (error) throw error;
  return (data as DbArtisan[]).map(mapArtisan);
}

function artisanToDb(a: Omit<Artisan, 'id'>): Omit<DbArtisan, 'id'> {
  return {
    name: a.name,
    role_es: a.role_es,
    role_en: a.role_en,
    cats: a.cats,
    specialty_es: a.specialty_es,
    specialty_en: a.specialty_en,
    years: a.years,
    bio_es: a.bio_es,
    bio_en: a.bio_en,
    rating: a.rating,
    reviews: a.reviews,
    photo: a.photo,
    avatar: a.avatar,
    signature_es: a.signature_es ?? null,
    signature_en: a.signature_en ?? null,
  };
}

export async function createArtisanDb(art: Artisan): Promise<Artisan> {
  const { data, error } = await supabase
    .from('artisans')
    .insert({ id: art.id, ...artisanToDb(art) })
    .select(ARTISAN_COLS)
    .single();
  if (error) throw error;
  return mapArtisan(data as DbArtisan);
}

export async function updateArtisanDb(
  id: string,
  fields: Partial<Omit<Artisan, 'id'>>,
): Promise<Artisan> {
  const update: Record<string, unknown> = {};
  for (const k of Object.keys(fields) as (keyof Omit<Artisan, 'id'>)[]) {
    const v = fields[k];
    if (v === undefined) continue;
    if (k === 'signature_es') update.signature_es = v ?? null;
    else if (k === 'signature_en') update.signature_en = v ?? null;
    else update[k] = v;
  }
  const { data, error } = await supabase
    .from('artisans')
    .update(update)
    .eq('id', id)
    .select(ARTISAN_COLS)
    .single();
  if (error) throw error;
  return mapArtisan(data as DbArtisan);
}

export async function deleteArtisanDb(id: string): Promise<void> {
  const { error } = await supabase.from('artisans').delete().eq('id', id);
  if (error) throw error;
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

const PRODUCT_COLS =
  'id, name_es, name_en, line, cat_es, cat_en, size, price, desc_es, desc_en, notes_es, notes_en, photo, photos, video, badge_es, badge_en, rating, reviews';

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select(PRODUCT_COLS);
  if (error) throw error;
  return (data as DbProduct[]).map(mapProduct);
}

function productToDb(p: Omit<Product, 'id'>): Omit<DbProduct, 'id'> {
  return {
    name_es: p.name_es,
    name_en: p.name_en,
    line: p.line,
    cat_es: p.cat_es,
    cat_en: p.cat_en,
    size: p.size,
    price: p.price,
    desc_es: p.desc_es,
    desc_en: p.desc_en,
    notes_es: p.notes_es,
    notes_en: p.notes_en,
    photo: p.photo,
    photos: p.photos,
    video: p.video ?? null,
    badge_es: p.badge_es ?? null,
    badge_en: p.badge_en ?? null,
    rating: p.rating,
    reviews: p.reviews,
  };
}

export async function createProductDb(product: Product): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({ id: product.id, ...productToDb(product) })
    .select(PRODUCT_COLS)
    .single();
  if (error) throw error;
  return mapProduct(data as DbProduct);
}

export async function updateProductDb(
  id: string,
  fields: Partial<Omit<Product, 'id'>>,
): Promise<Product> {
  const update: Record<string, unknown> = {};
  for (const k of Object.keys(fields) as (keyof Omit<Product, 'id'>)[]) {
    const v = fields[k];
    if (v === undefined) continue;
    // Map camelCase keys to snake_case DB cols where they differ.
    if (k === 'video') update.video = v ?? null;
    else if (k === 'badge_es') update.badge_es = v ?? null;
    else if (k === 'badge_en') update.badge_en = v ?? null;
    else update[k] = v;
  }
  const { data, error } = await supabase
    .from('products')
    .update(update)
    .eq('id', id)
    .select(PRODUCT_COLS)
    .single();
  if (error) throw error;
  return mapProduct(data as DbProduct);
}

export async function deleteProductDb(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
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

// ---------- Product Stocks ----------

interface DbProductStock {
  product_id: string;
  stock: number;
  low_stock_at: number;
}

export async function fetchProductStocks(): Promise<Record<string, ProductStock>> {
  const { data, error } = await supabase
    .from('product_stocks')
    .select('product_id, stock, low_stock_at');
  if (error) throw error;
  const out: Record<string, ProductStock> = {};
  for (const row of data as DbProductStock[]) {
    out[row.product_id] = {
      productId: row.product_id,
      stock: row.stock,
      lowStockAt: row.low_stock_at,
    };
  }
  return out;
}

export async function upsertProductStock(
  productId: string,
  fields: Partial<ProductStock>,
): Promise<void> {
  const { error } = await supabase.from('product_stocks').upsert(
    {
      product_id: productId,
      stock: fields.stock ?? 0,
      low_stock_at: fields.lowStockAt ?? 0,
    },
    { onConflict: 'product_id' },
  );
  if (error) throw error;
}

// ---------- Artisan Schedules (per-day) ----------
// Schema: artisan_schedule_days(artisan_id, weekday) PK, cada row con su
// propio start/end e is_working. Migration 0008 reemplazó la tabla vieja
// `artisan_schedules` (working_days jsonb + un único start/end).

const WEEKDAYS: WeekDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

interface DbArtisanScheduleDay {
  artisan_id: string;
  weekday: WeekDay;
  is_working: boolean;
  start_time: string;
  end_time: string;
}

function defaultDay(weekday: WeekDay): ArtisanScheduleDay {
  return {
    weekday,
    isWorking: weekday !== 'sun',
    startTime: '10:00',
    endTime: '20:00',
  };
}

function emptyWeek(): Record<WeekDay, ArtisanScheduleDay> {
  return Object.fromEntries(
    WEEKDAYS.map((wd) => [wd, defaultDay(wd)]),
  ) as Record<WeekDay, ArtisanScheduleDay>;
}

export async function fetchArtisanSchedules(): Promise<
  Record<string, ArtisanSchedule>
> {
  const { data, error } = await supabase
    .from('artisan_schedule_days')
    .select('artisan_id, weekday, is_working, start_time, end_time');
  if (error) throw error;

  const out: Record<string, ArtisanSchedule> = {};
  for (const row of (data ?? []) as DbArtisanScheduleDay[]) {
    if (!out[row.artisan_id]) {
      out[row.artisan_id] = { artisanId: row.artisan_id, days: emptyWeek() };
    }
    out[row.artisan_id].days[row.weekday] = {
      weekday: row.weekday,
      isWorking: row.is_working,
      startTime: row.start_time.slice(0, 5),
      endTime: row.end_time.slice(0, 5),
    };
  }
  return out;
}

/** Upsert de UNA entrada (artisan, weekday). Mucho más granular que antes. */
export async function upsertArtisanScheduleDay(
  artisanId: string,
  weekday: WeekDay,
  fields: Partial<Omit<ArtisanScheduleDay, 'weekday'>>,
): Promise<void> {
  const update: Record<string, unknown> = {
    artisan_id: artisanId,
    weekday,
  };
  if (fields.isWorking !== undefined) update.is_working = fields.isWorking;
  if (fields.startTime !== undefined) update.start_time = fields.startTime;
  if (fields.endTime !== undefined) update.end_time = fields.endTime;
  const { error } = await supabase
    .from('artisan_schedule_days')
    .upsert(update, { onConflict: 'artisan_id,weekday' });
  if (error) throw error;
}

// ---------- Tier Rules ----------

interface DbTierRule {
  tier_id: 'pearl' | 'gold' | 'noir';
  threshold_points: number;
  multiplier_hair: number;
  multiplier_nails: number;
  multiplier_facial: number;
}

function mapTierRule(row: DbTierRule): TierRule {
  return {
    tierId: row.tier_id,
    thresholdPoints: row.threshold_points,
    multipliers: {
      hair: Number(row.multiplier_hair),
      nails: Number(row.multiplier_nails),
      facial: Number(row.multiplier_facial),
    },
  };
}

export async function fetchTierRules(): Promise<TierRule[]> {
  const { data, error } = await supabase
    .from('tier_rules')
    .select('tier_id, threshold_points, multiplier_hair, multiplier_nails, multiplier_facial')
    .order('threshold_points', { ascending: true });
  if (error) throw error;
  return (data as DbTierRule[]).map(mapTierRule);
}

export async function updateTierRule(
  tierId: TierRule['tierId'],
  fields: Partial<Omit<TierRule, 'tierId'>>,
): Promise<void> {
  const update: Record<string, unknown> = {};
  if (fields.thresholdPoints !== undefined)
    update.threshold_points = fields.thresholdPoints;
  if (fields.multipliers !== undefined) {
    update.multiplier_hair = fields.multipliers.hair;
    update.multiplier_nails = fields.multipliers.nails;
    update.multiplier_facial = fields.multipliers.facial;
  }
  const { error } = await supabase
    .from('tier_rules')
    .update(update)
    .eq('tier_id', tierId);
  if (error) throw error;
}

// ---------- Salon Settings (single row) ----------

interface DbSalonSettings {
  id: number;
  name: string;
  tagline_es: string;
  tagline_en: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  instagram: string | null;
  whatsapp: string | null;
  hours_open: string;
  hours_close: string;
  currency: SalonSettings['currency'];
  timezone: string;
}

const SALON_COLS =
  'id, name, tagline_es, tagline_en, address, city, phone, email, instagram, whatsapp, hours_open, hours_close, currency, timezone';

function mapSalonSettings(row: DbSalonSettings): SalonSettings {
  return {
    name: row.name,
    tagline_es: row.tagline_es,
    tagline_en: row.tagline_en,
    address: row.address,
    city: row.city,
    phone: row.phone,
    email: row.email,
    instagram: row.instagram ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    hoursOpen: row.hours_open.slice(0, 5),
    hoursClose: row.hours_close.slice(0, 5),
    currency: row.currency,
    timezone: row.timezone,
  };
}

export async function fetchSalonSettings(): Promise<SalonSettings | null> {
  const { data, error } = await supabase
    .from('salon_settings')
    .select(SALON_COLS)
    .eq('id', 1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapSalonSettings(data as DbSalonSettings);
}

export async function updateSalonSettings(
  fields: Partial<SalonSettings>,
): Promise<void> {
  const update: Record<string, unknown> = {};
  if (fields.name !== undefined) update.name = fields.name;
  if (fields.tagline_es !== undefined) update.tagline_es = fields.tagline_es;
  if (fields.tagline_en !== undefined) update.tagline_en = fields.tagline_en;
  if (fields.address !== undefined) update.address = fields.address;
  if (fields.city !== undefined) update.city = fields.city;
  if (fields.phone !== undefined) update.phone = fields.phone;
  if (fields.email !== undefined) update.email = fields.email;
  if (fields.instagram !== undefined)
    update.instagram = fields.instagram ?? null;
  if (fields.whatsapp !== undefined) update.whatsapp = fields.whatsapp ?? null;
  if (fields.hoursOpen !== undefined) update.hours_open = fields.hoursOpen;
  if (fields.hoursClose !== undefined) update.hours_close = fields.hoursClose;
  if (fields.currency !== undefined) update.currency = fields.currency;
  if (fields.timezone !== undefined) update.timezone = fields.timezone;
  const { error } = await supabase
    .from('salon_settings')
    .update(update)
    .eq('id', 1);
  if (error) throw error;
}

// ---------- Reviews ----------

interface DbReview {
  id: string;
  customer_name: string;
  artisan_id: string | null;
  service_id: string | null;
  rating: number;
  comment: string;
  date: string;
  response: string | null;
  response_date: string | null;
}

const REVIEW_COLS =
  'id, customer_name, artisan_id, service_id, rating, comment, date, response, response_date';

function mapReview(row: DbReview): Review {
  return {
    id: row.id,
    customerName: row.customer_name,
    artisanId: row.artisan_id ?? '',
    serviceId: row.service_id ?? '',
    rating: row.rating,
    comment: row.comment,
    date: row.date,
    response: row.response ?? undefined,
    responseDate: row.response_date ?? undefined,
  };
}

export async function fetchReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(REVIEW_COLS)
    .order('date', { ascending: false });
  if (error) throw error;
  return (data as DbReview[]).map(mapReview);
}

export async function respondToReview(
  id: string,
  response: string,
): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .update({
      response,
      response_date: new Date().toISOString().slice(0, 10),
    })
    .eq('id', id);
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

// ---------- Admin: vista cross-user de pending_bookings ----------
// Solo accesible para users con is_admin = true (RLS lo enforce vía
// pending_bookings_admin_select en migration 0007). Combina los bookings
// con info del profile dueño para mostrar nombre/email del cliente.

export interface AdminPendingBookingRow extends PendingBooking {
  userId: string;
  userName: string | null;
  userEmail: string | null;
  userAvatarUrl: string | null;
}

export async function fetchAllPendingBookingsForAdmin(): Promise<
  AdminPendingBookingRow[]
> {
  const { data, error } = await supabase
    .from('pending_bookings')
    .select(PENDING_BOOKING_COLS)
    .order('date', { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as DbPendingBooking[];
  if (rows.length === 0) return [];

  // Segundo round trip: profiles de los users implicados. Más simple que
  // un join cross-schema (pending_bookings → auth.users vs profiles).
  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('id, full_name, display_name, email, avatar_url')
    .in('id', userIds);
  if (pErr) throw pErr;
  const profileMap = new Map<
    string,
    {
      full_name: string | null;
      display_name: string | null;
      email: string | null;
      avatar_url: string | null;
    }
  >();
  for (const p of (profiles ?? []) as Array<{
    id: string;
    full_name: string | null;
    display_name: string | null;
    email: string | null;
    avatar_url: string | null;
  }>) {
    profileMap.set(p.id, {
      full_name: p.full_name,
      display_name: p.display_name,
      email: p.email,
      avatar_url: p.avatar_url,
    });
  }

  return rows.map((row): AdminPendingBookingRow => {
    const base = mapPendingBooking(row);
    const prof = profileMap.get(row.user_id);
    return {
      ...base,
      userId: row.user_id,
      userName: prof?.display_name ?? prof?.full_name ?? null,
      userEmail: prof?.email ?? null,
      userAvatarUrl: prof?.avatar_url ?? null,
    };
  });
}

// ---------- Service Variants ----------

interface DbServiceVariant {
  service_id: string;
  premium_label_es: string | null;
  premium_label_en: string | null;
  premium_addon_product_ids: string[];
  custom_compatible_product_ids: string[];
}

export interface VariantPremiumLite {
  addonProductIds: string[];
  label_es: string;
  label_en: string;
}

export interface VariantConfigLite {
  premium?: VariantPremiumLite;
  customCompatibleProductIds?: string[];
}

function mapVariantRow(row: DbServiceVariant): VariantConfigLite {
  return {
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
  };
}

/** Devuelve un Record indexado por service_id — formato que usa CatalogProvider. */
export async function fetchServiceVariantsRecord(): Promise<
  Record<string, VariantConfigLite>
> {
  const { data, error } = await supabase
    .from('service_variants')
    .select(
      'service_id, premium_label_es, premium_label_en, premium_addon_product_ids, custom_compatible_product_ids',
    );
  if (error) throw error;
  const out: Record<string, VariantConfigLite> = {};
  for (const row of data as DbServiceVariant[]) {
    out[row.service_id] = mapVariantRow(row);
  }
  return out;
}

export async function upsertServiceVariant(
  serviceId: string,
  config: VariantConfigLite,
): Promise<void> {
  const { error } = await supabase.from('service_variants').upsert(
    {
      service_id: serviceId,
      premium_label_es: config.premium?.label_es ?? null,
      premium_label_en: config.premium?.label_en ?? null,
      premium_addon_product_ids: config.premium?.addonProductIds ?? [],
      custom_compatible_product_ids: config.customCompatibleProductIds ?? [],
    },
    { onConflict: 'service_id' },
  );
  if (error) throw error;
}

export async function deleteServiceVariant(serviceId: string): Promise<void> {
  const { error } = await supabase
    .from('service_variants')
    .delete()
    .eq('service_id', serviceId);
  if (error) throw error;
}

export async function clearAllServiceVariants(): Promise<void> {
  // Wildcard delete protegido: eq fingiendo neq de algo imposible.
  const { error } = await supabase
    .from('service_variants')
    .delete()
    .neq('service_id', '__never_matches__');
  if (error) throw error;
}
