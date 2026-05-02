// DSR — Variantes de servicio.
// Define qué servicios tienen variantes Premium (con productos pre-seleccionados)
// y Custom (con un set de productos compatibles que el usuario puede combinar).
// Servicios no listados acá solo muestran el flow Standard de toda la vida.

export type VariantId = 'standard' | 'premium' | 'custom';

interface ServiceVariantConfig {
  /** Variante Premium: productos add-on pre-curados por la casa. */
  premium?: {
    addonProductIds: string[];
    /** Caption editorial para describir la variante. */
    label_es: string;
    label_en: string;
  };
  /** Variante Custom: pool de productos compatibles que el cliente puede mezclar. */
  customCompatibleProductIds?: string[];
}

export const SERVICE_VARIANTS: Record<string, ServiceVariantConfig> = {
  'mani-gel': {
    premium: {
      addonProductIds: ['cuticle-oil'],
      label_es: 'Con élixir de cutícula al cierre',
      label_en: 'With cuticle élixir finish',
    },
    customCompatibleProductIds: ['cuticle-oil', 'nail-set', 'nail-treatment'],
  },
  'mani-acrylic': {
    premium: {
      addonProductIds: ['cuticle-oil', 'nail-treatment'],
      label_es: 'Con base fortificante y cutícula',
      label_en: 'With strengthening base and cuticle care',
    },
    customCompatibleProductIds: ['cuticle-oil', 'nail-set', 'nail-treatment'],
  },
  'mani-classique': {
    premium: {
      addonProductIds: ['cuticle-oil'],
      label_es: 'Con élixir de cutícula al cierre',
      label_en: 'With cuticle élixir finish',
    },
    customCompatibleProductIds: ['cuticle-oil', 'nail-set', 'nail-treatment'],
  },
  'color-balayage': {
    premium: {
      addonProductIds: ['hair-oil'],
      label_es: 'Con elixir capilar Or al final',
      label_en: 'With Or hair elixir finish',
    },
    customCompatibleProductIds: ['hair-oil'],
  },
  'cut-signature': {
    premium: {
      addonProductIds: ['hair-oil'],
      label_es: 'Con elixir capilar Or',
      label_en: 'With Or hair elixir',
    },
    customCompatibleProductIds: ['hair-oil'],
  },
  'facial-signature': {
    premium: {
      addonProductIds: ['mask-gold'],
      label_es: 'Con mascarilla Or 24K',
      label_en: 'With 24K Gold mask',
    },
    customCompatibleProductIds: ['serum-noir', 'mask-gold', 'gua-sha'],
  },
  'facial-gold': {
    premium: {
      addonProductIds: ['serum-noir', 'mask-gold'],
      label_es: 'Con sérum Noir y mascarilla Or',
      label_en: 'With Sérum Noir and Or mask',
    },
    customCompatibleProductIds: ['serum-noir', 'mask-gold', 'gua-sha'],
  },
};

export function getServiceVariants(serviceId: string): ServiceVariantConfig | null {
  return SERVICE_VARIANTS[serviceId] ?? null;
}
