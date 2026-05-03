// DSR — Domain types

export type CategoryId = 'hair' | 'nails' | 'facial';

export interface Category {
  id: CategoryId;
  es: string;
  en: string;
  tag: string; // Roman numeral
}

export interface Service {
  id: string;
  cat: CategoryId;
  es: string;
  en: string;
  desc_es: string;
  desc_en: string;
  duration: number; // minutes
  price: number; // EUR
  popular?: boolean;
}

export interface Artisan {
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
  signature_es?: string;
  signature_en?: string;
}

export interface Product {
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
  video?: string;
  badge_es?: string;
  badge_en?: string;
  rating: number;
  reviews: number;
}

export interface NailLook {
  id: string;
  img: string;
  name_es: string;
  name_en: string;
  technique_es: string;
  technique_en: string;
  shade: string;
  artisan: string; // artisan id
  season_es: string;
  season_en: string;
  service: string; // service id
  popular?: boolean;
}

export interface GiftCardDesign {
  id: string;
  name_es: string;
  name_en: string;
  bg: string; // CSS background
  fg: string;
  accent: string;
  vibe_es: string;
  vibe_en: string;
}

export interface ReceivedGiftCard {
  id: string;
  code: string;
  design: string;
  amount: number;
  balance: number;
  from: string;
  message_es: string;
  message_en: string;
  received: string;
  expires: string;
}

export interface SentGiftCard {
  id: string;
  code: string;
  design: string;
  amount: number;
  balance: number;
  to: string;
  sent: string;
  deliveryDate?: string;
  method: 'email' | 'whatsapp' | 'schedule';
  status_es: string;
  status_en: string;
}

export interface Tier {
  id: 'pearl' | 'gold' | 'noir';
  name: { es: string; en: string };
  min: number;
  max: number;
  color: string;
}

export interface Perk {
  es: string;
  en: string;
}

export interface Appointment {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  services: string[]; // service ids
  artisan: string; // artisan id
  /** Status visible al customer. Mapeado en db.ts:
   *  - DB 'confirmed' + date >= today → 'confirmed'
   *  - DB 'confirmed' + date < today  → 'past' (no marcada como completed aún)
   *  - DB 'completed'                 → 'past'
   *  - DB 'cancelled'                 → 'cancelled' (visible con badge distinto)
   */
  status: 'confirmed' | 'past' | 'cancelled';
  total: number;
  duration: number;
  notes_es?: string;
  /** Campos extendidos (vienen de DB; legacy USER mock no los tiene). */
  variant?: 'standard' | 'premium' | 'custom';
  addonProductIds?: string[];
  comboId?: string;
  discountPct?: number;
  pointsEarned?: number;
}

export interface Story {
  id: string;
  artisan: string;
  title_es: string;
  title_en: string;
  cover: string;
}

export interface ScheduleSlot {
  time: string;
  free: boolean;
}

export interface ScheduleDay {
  date: Date;
  day: string; // weekday abbrev
  dayNum: number;
  dayOff: boolean;
  slots: ScheduleSlot[];
}

export interface CartItem {
  productId: string;
  qty: number;
}

// Admin: stock por producto.
export interface ProductStock {
  productId: string;
  stock: number;
  lowStockAt: number;
}

// Admin: cupones de descuento.
export interface Promo {
  id: string;
  code: string;
  type: 'pct' | 'fixed';
  value: number;
  description_es?: string;
  description_en?: string;
  validUntil?: string;
  maxUses?: number;
  usedCount: number;
  active: boolean;
}

// Admin: agenda semanal por artista — schedule por día.
// Cada artista tiene 7 entradas (una por weekday), cada una con su propio
// is_working / start_time / end_time. Permite horarios distintos por día.
export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export interface ArtisanScheduleDay {
  weekday: WeekDay;
  isWorking: boolean;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
}
export interface ArtisanSchedule {
  artisanId: string;
  /** Indexado por weekday — siempre incluye los 7 días (working o no). */
  days: Record<WeekDay, ArtisanScheduleDay>;
}

// Admin: reglas de puntos por tier.
export interface TierRule {
  tierId: 'pearl' | 'gold' | 'noir';
  thresholdPoints: number;
  multipliers: { hair: number; nails: number; facial: number };
}

// Admin: reseña de cliente post-cita.
export interface Review {
  id: string;
  customerName: string;
  artisanId: string;
  serviceId: string;
  rating: number; // 1-5
  comment: string;
  date: string; // YYYY-MM-DD
  response?: string;
  responseDate?: string;
  /** auth.uid del cliente que la dejó. Null para rows legacy/seed. */
  userId?: string;
}

// Admin: configuración del salón.
export interface SalonSettings {
  name: string;
  tagline_es: string;
  tagline_en: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  instagram?: string;
  whatsapp?: string;
  hoursOpen: string; // HH:MM
  hoursClose: string;
  currency: 'EUR' | 'USD' | 'MXN' | 'COP';
  timezone: string;
}

// Una cita guardada en la bolsa pero aún no confirmada.
// Cuando el usuario "paga" desde el drawer, las pendingBookings
// se confirmarían (en una versión real con backend, se mueven a USER.appointments).
export interface PendingBooking {
  id: string;
  serviceIds: string[];
  artisanId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  total: number;
  duration: number;
  notes?: string;
  /** Variante elegida (si el servicio tenía variantes definidas). */
  variant?: 'standard' | 'premium' | 'custom';
  /** Productos add-on incluidos en la cita. */
  addonProductIds?: string[];
  /** Si la cita viene de un combo, su id (para mostrar nombre + badge). */
  comboId?: string;
  /** Descuento aplicado al subtotal de servicios (0–100). Hoy solo lo set un combo. */
  discountPct?: number;
}

// Combos: paquetes predefinidos de servicios con descuento.
// Creados/editados desde el admin, visibles en home del customer.
export interface Combo {
  id: string;
  name_es: string;
  name_en: string;
  /** Servicios incluidos (todos en una misma cita típicamente). */
  serviceIds: string[];
  /** Descuento en porcentaje sobre la suma de precios base. 15 = 15% off. */
  discountPct: number;
  description_es?: string;
  description_en?: string;
  popular?: boolean;
}

// Direcciones de envío por user (boutique).
export interface Address {
  id: string;
  label: string;
  recipient: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

// Routing
export type RouteName =
  | 'onboarding'
  | 'auth'
  | 'admin'
  | 'home'
  | 'services'
  | 'service'
  | 'artisan'
  | 'book'
  | 'rewards'
  | 'shop'
  | 'product'
  | 'bag'
  | 'checkout-success'
  | 'profile'
  | 'nail-atelier'
  | 'nail-look'
  | 'gift-cards'
  | 'gift-buy'
  | 'gift-mine'
  | 'appointment'
  | 'personal-info'
  | 'addresses'
  | 'legal'
  | 'favorites';

export type TabId = 'home' | 'services' | 'book' | 'rewards' | 'shop';

export interface RouteParams {
  id?: string;
  service?: string;
  artisan?: string;
  look?: string;
  design?: string;
  editingBooking?: string;
  variant?: 'standard' | 'premium' | 'custom';
  addonProductIds?: string[];
  /** Combo seleccionado: prellena servicios + aplica descuento en Booking. */
  combo?: string;
  /** Documento legal a abrir: cancellation | terms | privacy. */
  doc?: string;
}

export interface Route {
  name: RouteName;
  params: RouteParams;
}
