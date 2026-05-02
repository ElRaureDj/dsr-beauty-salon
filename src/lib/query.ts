// DSR Maison — QueryClient global de TanStack Query.
// Defaults pensados para una app pequeña con datos de catálogo que
// cambian raramente desde el admin (5 min stale, 30 min gc).

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
