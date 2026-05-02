# Supabase — DSR Maison

Schema y seed de la base de datos. Hoy el frontend lee de `localStorage` con
seeds estáticos en `src/data/`; estas migraciones replican esos seeds en
Postgres para empezar a moverlos online.

## Estructura

```
supabase/
├─ README.md                  # este archivo
└─ migrations/
   ├─ 0001_init.sql           # schema (tablas + RLS read-only pública)
   └─ 0002_seed.sql           # datos iniciales (idempotente)
```

## Aplicar las migraciones

### Opción A — SQL Editor del dashboard (más simple)

1. Abre [el SQL Editor del proyecto](https://supabase.com/dashboard/project/_/sql/new).
2. Copia el contenido de `0001_init.sql` y ejecútalo.
3. Copia el contenido de `0002_seed.sql` y ejecútalo. Es idempotente —
   re-ejecutarlo no rompe nada (`ON CONFLICT DO NOTHING`).

### Opción B — CLI de Supabase (recomendado para producción)

Requiere [`supabase` CLI](https://supabase.com/docs/guides/cli) instalado.

```bash
# Una sola vez: linkear este repo al proyecto remoto
supabase link --project-ref <ref>

# Aplicar migraciones pendientes
supabase db push
```

## Convenciones

- **IDs son `text`** (no UUID). Respeta los IDs actuales del repo
  (`isabela`, `mani-gel`, `serum-noir`, etc.) para no romper bookings ni
  reviews seed cuando migremos el frontend.
- **`photo` y `photos[]` guardan slugs** (ej: `'product-serum'`), no URLs.
  El frontend los resuelve con `I()` en `src/data/images.ts`. Cuando un
  producto tenga upload real, se guardará la URL completa y el frontend
  decidirá según el prefijo.
- **i18n**: campos `_es` y `_en` separados (mismo modelo que el repo).
- **RLS**: `SELECT` público en todas las tablas de catálogo. Sin policies
  para `INSERT/UPDATE/DELETE` — todo escritura pasa por `service_role` o
  por usuarios con flag de admin (que se agrega cuando llegue auth real
  en Fase 3).
- **Soft-deletes**: por ahora no hay columna `deleted_at`; los soft-deletes
  del admin viven aún en `localStorage` hasta que migremos el admin
  panel a la DB.

## Roadmap (fases)

- [x] Fase 1 — Schema + seed (este commit)
- [ ] Fase 2 — Cliente Supabase + env vars + TanStack Query
- [ ] Fase 3 — Auth real (email magic link, después Apple/Google)
- [ ] Fase 4 — Migrar `CatalogProvider` a fetch desde DB
- [ ] Fase 5 — Migrar cart/bookings/gift cards al backend
