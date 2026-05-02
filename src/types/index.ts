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
  status: 'confirmed' | 'past';
  total: number;
  duration: number;
  notes_es?: string;
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

// Routing
export type RouteName =
  | 'onboarding'
  | 'home'
  | 'services'
  | 'service'
  | 'artisan'
  | 'book'
  | 'rewards'
  | 'shop'
  | 'product'
  | 'bag'
  | 'profile'
  | 'nail-atelier'
  | 'nail-look'
  | 'gift-cards'
  | 'gift-buy'
  | 'gift-mine';

export type TabId = 'home' | 'services' | 'book' | 'rewards' | 'shop';

export interface RouteParams {
  id?: string;
  service?: string;
  artisan?: string;
  look?: string;
  design?: string;
}

export interface Route {
  name: RouteName;
  params: RouteParams;
}
