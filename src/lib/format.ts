// DSR — Helpers de formato de precio.
// Hasta hoy había ~50 sitios con `€{x}` hardcoded. settings.currency
// en DB es la fuente de verdad (USD para Miami) pero los displays no la
// consumían. Estos helpers cierran la inconsistencia.
//
// API:
//   formatPrice(n, currency)   función pura, útil fuera de React.
//   useCurrency()              hook React que retorna { symbol, format }
//                              leyendo settings vía CatalogProvider.

import { useMemo } from 'react';
import { useCatalog } from '../data/CatalogProvider';
import type { SalonSettings } from '../types';

export function currencySymbol(currency: SalonSettings['currency']): string {
  switch (currency) {
    case 'EUR':
      return '€';
    case 'USD':
      return '$';
    case 'MXN':
      return '$';
    case 'COP':
      return '$';
    default:
      return currency;
  }
}

/**
 * Formatea sin decimales (los precios del catálogo son enteros redondos).
 * Si en el futuro hay precios con decimales, usar Intl.NumberFormat.
 */
export function formatPrice(n: number, currency: SalonSettings['currency']): string {
  return `${currencySymbol(currency)}${n}`;
}

export function useCurrency() {
  const { getSettings } = useCatalog();
  const currency = getSettings().currency;
  return useMemo(
    () => ({
      symbol: currencySymbol(currency),
      format: (n: number) => formatPrice(n, currency),
    }),
    [currency],
  );
}
