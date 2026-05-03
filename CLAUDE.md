# CLAUDE.md

Contexto persistente para Claude Code. Este archivo se lee al inicio de cada sesión.

---

## Qué es esto

**DSR Maison de Beauté** — app móvil de un salón de belleza de lujo dirigido a clientela latina. Estética inspirada en Dior couture y hospitalidad Aman. Foco en uñas (Gel-X / acrílico) y un sistema de gift cards.

Originalmente un bundle de Claude Design (HTML + JSX prototípico) que fue portado a una app de producción **Vite + React 18 + TypeScript** durante una sesión en claude.ai. En sesiones posteriores se construyeron customer + admin completos contra `localStorage` (Fase 1) y luego se migró a backend real con Supabase (Fase 2).

- **Customer app** (mobile, dentro de iPhone frame en desktop) con 21 pantallas
- **Admin panel** (`/admin`, layout desktop sin iPhone frame) con 14 secciones operativas, cada una con CRUD real contra Postgres
- Build limpio: ~100 módulos, **0 errores TS**

---

## Estado actual

- **Fase 1** (`phase1/original-code`) ✅ — mergeada en PR #1. App completa funcionando 100% con `localStorage`.
- **Fase 2** (`phase2/moving-online`) ✅ — mergeada en PR #2. Schema + seed inicial, cliente Supabase, magic-link auth real (PKCE), catálogo (products/services/artisans/nail_looks/gift_card_designs) leyendo desde DB con TanStack Query, profiles + `useUserData`, personal info editable, direcciones de envío US-only.
- **Fase 7** (`phase2/conectando-con-el-exterior`, branch actual) ✅ — completada localmente, **no pusheada** todavía. 5 commits encima de main:
  - `cfa1e6a` cart_items + pending_bookings session-aware con auto-merge guest → user al login.
  - `d4e96bb` admin role real (`profile.is_admin`) reemplaza el PIN demo. `AdminGate.tsx` con 3 estados.
  - `91d4b84` combos y promos al backend (mutations vía Supabase).
  - `3d2abd3` stocks / schedules / tier_rules / reviews / settings / variants a DB.
  - `b9c8562` products / services / artisans writes a Supabase. Cierra la migración del catálogo.

> Próxima acción sugerida: push de la rama + PR #3 a main, después configurar Vercel.

---

## Stack

- **Frontend**: React 18.3, TypeScript 5.6, Vite 5.4
- **State server**: TanStack Query 5 (catalog, mutations admin)
- **Backend**: Supabase (Postgres + Auth con magic link PKCE + RLS)
- **Routing**: máquina de estados propia en `src/router/Router.tsx`, sin react-router.
- **Estilos**: inline tipados desde `src/theme/tokens.ts`, sin CSS-in-JS.
- **Estado cliente**: React Context — `ThemeProvider`, `LangProvider`, `Router`, `CartProvider`, `UserProvider`, `CatalogProvider`, `AppointmentsProvider`.
- **i18n** propia, **string keys tipadas** en `src/i18n/strings.ts` (agregar una key sin traducir rompe el build, esto es a propósito).

Comandos:

```bash
npm run dev        # http://localhost:5173 (Vite respeta process.env.PORT)
npm run build      # tsc -b && vite build
npm run typecheck  # tsc -b --noEmit
npm run preview    # preview del build
```

---

## Backend (Supabase)

### Variables de entorno (`.env.local`)

```
VITE_SUPABASE_URL=https://scruipyuxewznlrujjgk.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable__fYtbk7SYClaJyNAWgXQLA_NUstNSl-
```

`.env.local.example` está commiteado para referencia. Nunca pongas la `service_role` key en el cliente.

### Migrations aplicadas (`supabase/migrations/`)

1. `0001_init.sql` — 16 tablas de catálogo + dominio. RLS read-only pública para anónimos.
2. `0002_seed.sql` — datos del repo (products, services, artisans, nail_looks, gift_card_designs, combos, promos, stocks, schedules, tier_rules, reviews, settings). Idempotente (ON CONFLICT DO NOTHING).
3. `0003_profiles.sql` — `profiles` 1:1 con `auth.users`, trigger `handle_new_user()` SECURITY DEFINER + backfill, RLS owner-only.
4. `0004_addresses.sql` — `addresses` por user con índice único parcial `addresses_one_default_per_user`. RLS owner-only.
5. `0005_cart_and_bookings.sql` — `cart_items` (unique user_id+product_id) + `pending_bookings` con FKs a artisans/services/combos.
6. `0006_admin.sql` — flag `is_admin boolean` en profiles, helper `is_admin() returns boolean security definer stable`, write policies para todas las tablas administrables, hardening `profiles_update_own` para evitar self-promotion.

### Promoverse a admin

```sql
update profiles set is_admin = true where email = 'tu@email.com';
```

### Patrones de datos

- **Slug-based images** — la DB guarda strings tipo `product-serum`, el frontend resuelve con `I()` en `src/data/images.ts`. Permite swap a uploads reales sin migración de DB.
- **IDs `text` PK** en la mayoría de tablas (`isabela`, `mani-gel`, `cmb-...`, `pr-...`) para mantener compatibilidad con seeds del repo. Sólo `addresses`, `cart_items` y `pending_bookings` son uuid.
- **Session-aware providers** (`CartProvider`, `AppointmentsProvider`) — sin sesión usan `localStorage` y mantienen la experiencia demo (Camila Vargas + appointments seed). Con sesión leen/escriben DB. Auto-merge guest → user en signin (idempotente).
- **Optimistic updates** en CatalogProvider:
  ```ts
  queryClient.setQueryData(['key'], updateFn);          // UI instantánea
  void dbMutator(...).then(invalidate).catch((e) => {   // dispatch async
    console.error(e);
    invalidate();                                       // resync ante fallo
  });
  ```
  RLS bloquea writes para non-admins; el siguiente refetch normaliza.
- **TanStack Query con seeds**:
  ```ts
  useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    initialData: PRODUCTS_SEED,        // UI nunca está vacía
    initialDataUpdatedAt: 0,           // marca seed como stale → refetch
  });
  ```

---

## Convenciones de código

### Estilos
- **No CSS modules ni styled-components.** Estilos inline con objetos `style={{...}}` que leen de `tokens.ts`.
- Colores: siempre desde `theme.colors.*`, nunca hex literales en componentes (excepto Apple Pay HIG y la loyalty card en Rewards.tsx que tiene identidad propia por tier).
- Tipografía: usar los átomos de `src/components/atoms/Typography.tsx` (`Eyebrow`, `H1`, `H2`, `H3`, `Body`, `Tiny`, `Numeral`) en vez de `<h1>`/`<p>` directos.
- Keyframes globales en `src/theme/global.css`: `dsr-fade-up`, `dsr-fade`, `dsr-shimmer`, `dsr-spin`, `dsr-pulse`, `dsr-route-in` (transición de pantallas, 0.5s). Reutilizar antes de inventar.
- **No emojis en UI.** Solo el set `Icons` en `src/components/atoms/Icon.tsx` (SVG path strings).
- Para gradients que se desvanecen al fondo del tema, usar `rgba(${T.bgRgb}, X)` (no `rgba(10,9,8,X)` hardcoded). Esto permite que ambos temas (Noir / Marbre) se vean coherentes.
- En texto en español, usar guion simple `-`. Evitar em-dash `—` en strings de UI (se ve "como IA").

### TypeScript
- `strict: true`. No `any` salvo en interop muy puntual.
- Todos los tipos de dominio viven en `src/types/index.ts`. Incluye: `Service`, `Artisan`, `Product`, `NailLook`, `GiftCardDesign`, `Tier`, `Route`, `CartItem`, `PendingBooking`, `Combo`, `ProductStock`, `Promo`, `WeekDay`, `ArtisanSchedule`, `TierRule`, `Review`, `SalonSettings`, `Address`.

### Routing
- `useRouter()` da `{ route, tab, go }`. Llamar `go('product', { id: 'p1' })`.
- Routes: `onboarding`, `auth`, `admin`, `home`, `services`, `service`, `artisan`, `book`, `rewards`, `shop`, `product`, `bag`, `checkout-success`, `profile`, `appointment`, `personal-info`, `addresses`, `nail-atelier`, `nail-look`, `gift-cards`, `gift-buy`, `gift-mine`.
- Las pantallas que **ocultan el TabBar** y/o el **TopChrome** se centralizan en `App.tsx` (`HIDE_TAB_ROUTES`, `HIDE_CHROME_ROUTES`). Si agregas una pantalla nueva inmersiva, edita ambas listas.
- `App.tsx::RootLayout` decide entre `<DesktopFrame>` (customer mobile) y `<AdminApp>` (admin desktop) según `route.name`.
- Cada navegación dispara `queueMicrotask` con scroll-to-top — no agregar `scrollTo` manual en pantallas.
- El wrapper de transición tiene `key={routeName + JSON.stringify(params)}` para remontar en cada cambio y disparar `dsr-route-in`.

### i18n
- Toda string visible va por `t('clave')`. Si falta la traducción en EN, TS lo marca.
- Idioma por defecto: **español**. El toggle ES/EN vive en Onboarding y Auth.
- Convención de keys: camelCase descriptivo (`upcomingAppointment`, `bookThisRitual`).

### Datos
- **CatalogProvider** (`src/data/CatalogProvider.tsx`) es **single source of truth contra DB**. Todas las entidades vía `useQuery` con seeds como `initialData` + `initialDataUpdatedAt: 0`. Todas las mutaciones admin: optimistic local + dispatch async vía `src/lib/db.ts` + invalidate.
- El antiguo modelo overlay (productOverrides + createdProducts + deletedProductIds) **fue removido** en `b9c8562`. Hoy edits/creates/deletes van directo a Postgres.
- **Customer screens leen de `useCatalog()` hooks** (`getProduct`, `getAllServices`, `getArtisan`, etc.) — NO importan `PRODUCTS/SERVICES/ARTISANS` ni usan `findX(id)` directamente.
- `helpers.ts::findX` son lookups estáticos sin reactividad — **se usan solo para validación** (ej: en `CartProvider` al cargar storage para descartar IDs huérfanos). NO migrar esos sites a hooks.
- `buildSchedule(artisanId)` es **determinista** (seed por id) — la misma artesana siempre muestra la misma semana. Estabiliza screenshots de demo.
- Imágenes vienen de `pollinations.ai` con prompts en `src/data/images.ts`. Los avatares en `src/data/avatars.ts` reutilizan imágenes ya cacheadas en pollinations CDN para evitar el cold-start.

### Persistencia
- DB Postgres para: catálogo, profiles, addresses, cart_items, pending_bookings, todos los CRUDs admin.
- `localStorage` se mantiene para:
  - `dsr-onboarding-seen`, `dsr-theme-v1` (preferencias UI).
  - `dsr-cart-guest-v1`, `dsr-cart-bookings-guest-v1` (cart guest, antes de signin).
  - `dsr-appointments-guest-v1`, `dsr-appointments-user-{uid}-v1` (mock appointments por sesión).
  - `dsr-promo-code-v1` (código de cupón aplicado, session-level).
  - `dsr-user-avatar-v1` (cache local del avatar para evitar flash en reload).
- Nunca cambiar el formato de una key existente sin bump de versión + migración.

---

## Decisiones importantes (no deshacer sin razón)

1. **Sin `window.AI_IMG`** — imágenes son imports ES desde `src/data/images.ts` y `src/data/avatars.ts`.
2. **Iconos `mail` y `cal`** se agregaron durante el port. Si ves un icono nuevo referenciado, verifica que esté en `Icons`.
3. **Dos temas: Noir Couture (oscuro, default) + Marbre Doré (claro)**. Toggle en Profile, persistido. `bgRgb` token permite gradients theme-aware.
4. **Apple Pay buttons** son `<button>` inline con `background: '#fff'` + `color: '#000'` (HIG). NO usar el `Btn` primario para ellos. Igual en `CartDrawer`. Hoy son **mock visual** — Apple Pay real requiere Stripe SetupIntent + Apple Developer Account.
5. **iPhone frame en desktop** — en viewports ≥ 480 px la app customer se centra en un marco tipo iPhone (`DesktopFrame`). En móvil real es edge-to-edge. La media query vive en `src/theme/global.css`.
6. **`/admin` salta el iPhone frame** — `RootLayout` detecta la ruta y monta `<AdminApp>` (desktop full-viewport con sidebar) en vez de `<DesktopFrame><FrameInner>`.
7. **TopChrome y CartDrawer son persistentes** — viven a nivel de iPhone frame (sibling de ScreenSwitch), NO dentro de cada pantalla. El cart chip aparece solo cuando `cart.count > 0`.
8. **Sticky CTAs por encima del TabBar** — usar `bottom: TAB_BAR_HEIGHT` (exportado en `Chrome.tsx`) + `zIndex: 60`. Nunca dejar un CTA crítico atrapado bajo el TabBar.
9. **Auth con Supabase magic link (PKCE)** — `flowType: 'pkce'` + `detectSessionInUrl: true` en `src/lib/supabase.ts`. Necesario porque escáneres de email pre-consumían OTP. Apple/Google/WhatsApp se muestran como botones disabled con badge "Próximamente".
10. **Admin gate real** — `AdminGate.tsx` discrimina por `profile.is_admin`. 3 estados: cargando, no-signed-in (CTA login), signed-in pero sin permisos (mensaje). El item "Modo administrador" en Profile sólo aparece si `isAdmin === true`.
11. **Pollinations cold-start** — generar imágenes nuevas tarda 10-30s la primera vez. Los avatares reutilizan imágenes existentes para evitar esto.
12. **`Img` component tiene `onError`** — usado en TopChrome y Profile para fallback a iniciales si la imagen del avatar falla.
13. **`useUserData()`** es la fuente para nombre/avatar mostrados en UI: si hay profile real lo usa; si no, cae al USER mock (Camila). NO usar `USER` directo en componentes — siempre `useUserData()`.

---

## Estructura

```
src/
├─ App.tsx                  # providers + RootLayout decide customer/admin
├─ main.tsx                 # ReactDOM root + QueryClientProvider
├─ vite-env.d.ts            # types de import.meta.env
├─ lib/
│  ├─ supabase.ts           # singleton client (PKCE)
│  ├─ query.ts              # QueryClient (5min stale, 30min gc)
│  └─ db.ts                 # ~1000 líneas. fetchers + mutators + mappers DB→TS
├─ theme/                   # tokens (Noir + Marbre), ThemeProvider, global.css
├─ i18n/                    # strings tipadas (~150 keys) + LangProvider
├─ types/index.ts           # 18 tipos de dominio (incluye Address)
├─ data/
│  ├─ catalog.ts            # PRODUCTS, SERVICES, ARTISANS (seeds para initialData)
│  ├─ nails.ts              # NAIL_LOOKS seed
│  ├─ giftcards.ts          # GIFTCARD_DESIGNS, USER_GIFTCARDS
│  ├─ tiers.ts              # TIERS + PERKS
│  ├─ user.ts               # USER + STORIES (mock cliente — fallback guest)
│  ├─ images.ts             # AI_IMG via pollinations + I() resolver de slugs
│  ├─ helpers.ts            # findX estáticos (solo validación) + buildSchedule
│  ├─ avatars.ts            # 10 retratos editoriales para AvatarPicker
│  ├─ combos.ts             # SEED_COMBOS
│  ├─ admin-seeds.ts        # seeds de stocks, promos, schedules, tier rules, reviews, settings
│  ├─ service-variants.ts   # SEED_VARIANTS
│  ├─ us-states.ts          # US_STATES + detectLabelType + AddressLabelType
│  ├─ useUserData.ts        # hook EffectiveUser (profile real o mock)
│  ├─ AppointmentsProvider.tsx  # session-aware: guest seed vs user namespaced
│  ├─ CatalogProvider.tsx   # single source of truth: DB via TanStack Query
│  └─ UserProvider.tsx      # auth + profile + isAdmin (derived from profile.is_admin)
├─ cart/CartProvider.tsx    # session-aware: localStorage guest, DB authed, auto-merge
├─ router/Router.tsx        # state machine
├─ components/
│  ├─ atoms/                # Typography, Icon, Buttons, Layout, Chrome,
│  │                        # TopChrome, CartDrawer, AvatarPicker
│  └─ GiftCardVisual.tsx
├─ screens/                 # 21 pantallas customer
└─ admin/
   ├─ AdminApp.tsx          # shell desktop con sidebar de 14 secciones
   ├─ AdminGate.tsx         # bloquea acceso si !isAdmin
   ├─ SidePanel.tsx         # drawer lateral genérico para forms
   └─ sections/             # 14 sections operativas

supabase/migrations/        # 0001..0006.sql
```

**21 pantallas customer:** `Onboarding`, `Auth`, `Home`, `Services`, `ServiceDetail`, `ArtisanProfile`, `Booking` (4 pasos + edit mode), `AppointmentDetail`, `Rewards`, `Shop`, `ProductDetail`, `Bag`, `CheckoutSuccess`, `Profile`, `PersonalInfo`, `Addresses`, `NailAtelier`, `NailLookDetail`, `GiftCards`, `GiftBuy` (3 pasos), `GiftMine`.

**14 secciones admin:** `Variants`, `Products`, `Services`, `Combos`, `Artisans`, `Schedules`, `Appointments`, `Inventory`, `Points`, `GiftCards`, `Promotions`, `Reviews`, `Reports`, `Settings`. Todas escriben a Postgres con RLS por rol. `StubSection.tsx` queda para futuras secciones.

---

## Pendientes (orden recomendado)

### Inmediato — cerrar Fase 7
- **Push `phase2/conectando-con-el-exterior` y abrir PR #3 a main.** Branch tiene 5 commits sin pushear. URL para el PR: `https://github.com/ElRaureDj/dsr-beauty-salon/compare/main...phase2/conectando-con-el-exterior?expand=1`.

### Deploy a Vercel
- Importar repo en Vercel + configurar las 2 env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) en Production + Preview + Development.
- En Supabase Dashboard → Authentication → URL Configuration: agregar el dominio de Vercel (`https://<proj>.vercel.app`) como Site URL y `https://<proj>-*.vercel.app/**` en Redirect URLs.
- **Configurar SMTP custom** (Resend free tier 100/día, SendGrid o Postmark) para reemplazar el provider default de Supabase. El default tiene rate limit de ~4 emails/hora — bloquea testing con varios users.

### Customer surfaces que faltan integrar
- **Aplicar promociones al cart** — input "código de cupón" en Bag/CartDrawer, descuento computado server-side o validado contra promos activos.
- **Mostrar reseñas** en ServiceDetail / ArtisanProfile (la DB ya las tiene).
- **Indicar bajo stock** en ProductDetail (si `stock <= lowStockAt`, badge visible).
- **Booking de combo completo** — actualmente click en combo → `go('book', {service: combo.serviceIds[0]})`. Falta multi-service en Booking + aplicar el descuento del combo + reflejarlo en PendingBooking.

### Auth & pagos reales
- **OAuth Apple / Google con Supabase** — fase grande, requiere Apple Developer ($99/año) + Google Cloud Console. Los botones ya están en `Auth.tsx` con badge "Próximamente".
- **Apple Pay real** — Stripe SetupIntent + Apple Pay JS, integrado en Bag y GiftBuy.
- **WhatsApp login** — opcional, requiere provider externo (Wassenger, Twilio Verify) porque Supabase no lo trae nativo.

### Admin — falta migrar a queries DB cross-user
- **AppointmentsSection y ReportsSection** — todavía leen del USER mock. Para producción necesitan agregaciones reales (`select count, sum, group by month`) sobre `pending_bookings` + appointments confirmados de todos los users.

### Calidad
- **Tests** — Vitest + React Testing Library; helpers deterministas y CatalogProvider son buenos primeros candidatos. No hay ninguno todavía.
- **Accesibilidad** — auditar contraste, `aria-label` en botones de iconos, focus management al cambiar de ruta.

### Plataforma
- **Multi-tenant** — el admin asume un solo salón. Para varias sedes haría falta un `tenant_id` en todas las tablas + selector + filtros RLS.

---

## Cómo trabajar conmigo (Claude Code) en este repo

- **Idioma de comunicación con el usuario: español.** Comentarios en código: español también.
- Antes de tocar pantallas, **lee el átomo o helper correspondiente** — la mayoría del comportamiento ya está abstraído. Si una pantalla customer toca catálogo, debe usar `useCatalog()`, no imports estáticos.
- Si algo se siente repetido entre pantallas, probablemente debería ser un átomo nuevo en `components/atoms/`. Para el admin, un componente reutilizable en `src/admin/`.
- Antes de cerrar una tarea, corre `npm run typecheck` o `npm run build` y reporta el resultado.
- **Verificación visual con Claude Preview**: para cambios de UI, abrir preview (`mcp__Claude_Preview__preview_start` con `vite-dev`), navegar al screen afectado vía `preview_eval` clicks, hacer `preview_screenshot`, confirmar visualmente. El usuario espera ver la screenshot del cambio funcionando antes de declarar listo.
- **Cadencia**: una tarea = un commit. Typecheck + verify visual + commit. El usuario avanza fase por fase con "continua" o "sigue".
- Si vas a agregar una dependencia, justifícala — el proyecto es deliberadamente minimalista (`react`, `react-dom`, `@supabase/supabase-js`, `@tanstack/react-query`).
- Cuando algo es claramente mock vs real, ser **explícito** ("Apple Pay es mock — no hay Stripe integrado, el botón solo navega a CheckoutSuccess").
- Para sesiones nuevas: este `CLAUDE.md` se carga automáticamente. `git log` da el detalle de los últimos cambios.
