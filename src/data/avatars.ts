// DSR — Avatar gallery.
// Reutilizamos las imágenes editoriales ya cacheadas en pollinations.ai
// (las del catálogo principal) para evitar el cold-start de generaciones nuevas.
// Si más adelante queremos avatares "originales" sin overlap con artistas,
// se pueden generar con seeds dedicados — pero implica esperar el primer hit.

import { I } from './images';

export interface AvatarOption {
  id: string;
  src: string;
  /** Caption breve para accesibilidad / hover. */
  label: { es: string; en: string };
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'av-spring',
    src: I('hero-spring'),
    label: { es: 'Clásica luminosa', en: 'Luminous classic' },
  },
  {
    id: 'av-evening',
    src: I('hero-evening'),
    label: { es: 'Dramatique', en: 'Dramatique' },
  },
  {
    id: 'av-hair',
    src: I('service-hair'),
    label: { es: 'Profil', en: 'Profil' },
  },
  {
    id: 'av-onboarding-1',
    src: I('onboarding-1'),
    label: { es: 'Serenité', en: 'Serenity' },
  },
  {
    id: 'av-cuts',
    src: I('story-cuts'),
    label: { es: 'Bob signature', en: 'Bob signature' },
  },
  {
    id: 'av-isabela',
    src: I('artisan-isabela'),
    label: { es: 'Couture', en: 'Couture' },
  },
  {
    id: 'av-ana',
    src: I('artisan-ana'),
    label: { es: 'Édition III', en: 'Édition III' },
  },
  {
    id: 'av-olivia',
    src: I('artisan-olivia'),
    label: { es: 'Atelier', en: 'Atelier' },
  },
  {
    id: 'av-leonor',
    src: I('artisan-leonor'),
    label: { es: 'Holistique', en: 'Holistique' },
  },
  {
    id: 'av-marta',
    src: I('artisan-marta'),
    label: { es: 'Maison muse', en: 'Maison muse' },
  },
];
