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

- **Fase 1** (`phase1/original-code`) ✅ — mergeada en PR #1. App completa funcionando 100% con `localStorage`. Incluye desde el origen: promos en cart, reseñas en Service/Artisan, badge de bajo stock en Product, combo booking end-to-end con descuento.
- **Fase 2** (`phase2/moving-online`) ✅ — mergeada en PR #2. Schema + seed inicial, cliente Supabase, magic-link auth real (PKCE), catálogo (products/services/artisans/nail_looks/gift_card_designs) leyendo desde DB con TanStack Query, profiles + `useUserData`, personal info editable, direcciones de envío US-only.
- **Fase 7** (`phase2/conectando-con-el-exterior`) ✅ — mergeada en PR #3 (`f063a8e`). cart_items + pending_bookings session-aware (`cfa1e6a`), admin role real `profile.is_admin` (`d4e96bb`), combos/promos al backend (`91d4b84`), stocks/schedules/tier_rules/reviews/settings/variants a DB (`3d2abd3`), products/services/artisans writes a Supabase (`b9c8562`). Cerró la migración del catálogo.
- **Fase 8** (`phase2/missing-details`) ✅ — mergeada en PR #5. Cross-user admin reads (`6c6988c`), schedule per-day (`5e5dd1b`), email template bilingüe (`fe648e7` + `5fdb285`), settings+tier thresholds al customer (`13e34d7`), promo usedCount RPC + fecha real (`69e535f`), reseñas customer (`a7486f3`), theme+lang en profile (`a15eb25`), appointments tabla real + checkout integrado (`e9324e8`), slot collision check (`284347d`), unify HIDE_TAB/CHROME (`d0e55d3`). Migrations 0007-0014.
- **Fase 9** (`phase2/last-details`, branch actual) 🚧 — auditoría exhaustiva de production-readiness. Sprint largo completado.
  - **SEO + manifest + favicon real** (`5af7bc0`): meta tags, Open Graph, Twitter card, manifest.webmanifest, favicon.svg en `public/`.
  - **Toast + Skeleton globales** (`f646013`): atoms infra + ToastProvider en App.tsx. Conectados a CheckoutSuccess error y AppointmentDetail review success.
  - **Salon a Miami** (`c318c1c`): DEFAULT_SETTINGS con city/address/phone/whatsapp/currency=USD/timezone=America/New_York. Migration 0015 hace UPDATE idempotente.
  - **Política de cancelación + términos + privacidad bilingüe** (`29bdd8a`): `src/data/legal.ts` + screen `Legal` con tabs. Linkeado desde Profile y disclaimer en Booking step 3. Política con depósito tier-based (Pearl $50 / Gold $25 / Noir 0).
  - **Customer ve "Cancelada" distinto de "Pasada"** (`fde93de`): `Appointment.status` amplía a `'cancelled'`. AppointmentDetail badge rouge, Profile rows con badge distinto.
  - **Calendar export `.ics`** (`db81575`): `src/data/calendar.ts` con `buildIcsEvent()` + `downloadIcs()` standalone (sin libs). Conectado a Booking step 4 y AppointmentDetail.
  - **Favoritos** (`a8359aa`): tabla `favorites` migration 0016 + FavoritesProvider session-aware + screen Favorites. Botón corazón funcional en ProductDetail/ServiceDetail/ArtisanProfile.
  - **Buscador global** (`f49a814`): atom `<SearchOverlay>` con input + resultados agrupados. Conectado al icono de lupa en Home.
  - **Code splitting** (`5977476`): lazy load de Admin + 14 screens secundarias. Bundle index 722 → 589 kB.
  - **Reagendar cancela cita vieja** (`c344437`): `RouteParams.replacesAppointment` + cancelAppointmentRpc al guardar nueva.
  - **Programa Amigas / referidos** (`aa92f53`): migration 0017 con tabla `referrals` + `my_referral_code()` + `find_referrer_by_code()`. UI en Rewards con código + Share. Lógica de aplicar crédito al referrer pendiente (depende de pagos reales).
  - **Gift cards reales** (`8de9879`): migration 0018 con tabla `gift_cards` + RPC `redeem_gift_card`. GiftBuy persiste row al "comprar" (cobro sigue mock).
  - **Audit log admin** (`f059499`, expandido en `975d12f`): migration 0019 + 0021 con tabla `audit_log` + triggers en salon_settings/tier_rules/products/services/artisans/promos/combos/product_stocks/artisan_schedule_days. Admin section `AuditLog` con filter chips y diff visual.
  - **Tests críticos Vitest** (`968ab25`): 28 tests cubriendo `tierFor/nextTier`, `buildSchedule` (collision check, dayOff, fallback determinista), `buildIcsEvent`. Encontró y arregló bug UTC en buildSchedule.
  - **Sentry error tracking** (`52df697`): `@sentry/react` + ErrorBoundary global con fallback editorial. No-op si `VITE_SENTRY_DSN` vacío. **Activación pendiente del usuario** (ver "En hold" abajo).
  - **Edge Function send-appointment-email** (`96e529e`, expandida en `9752606`): Deno + Resend API. Soporta `kind=confirmation` (al checkout, ya conectado en CheckoutSuccess) y `kind=reminder` (24h antes, dispatched por pg_cron). Migration 0020 con `send_appointment_reminders()` + `cron.schedule` diario 10:00 UTC. **Activación pendiente del usuario** (ver "En hold" abajo).
  - **Currency refactor** (`859c9a3`): `src/lib/format.ts` con `useCurrency()` + `currencySymbol()`. Reemplazo de ~50 `€{x}` hardcoded en 26 archivos. Customer y admin ahora muestran el símbolo según `salon_settings.currency` (hoy USD para Miami).

> Próxima acción sugerida: PR #6 a main, después atacar Sentry / Resend cuando el usuario decida activarlos.

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
npm run test       # vitest run (28 tests cubriendo helpers + calendar)
npm run test:watch # vitest en modo watch
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
7. `0007_admin_cross_user.sql` — admin SELECT en `pending_bookings` (vista global de citas) y `profiles` (nombre/email del cliente en cada row de admin). Las policies `_own` siguen vivas para customers.
8. `0008_schedule_per_day.sql` — reemplaza `artisan_schedules` (working_days jsonb + un único start/end) por `artisan_schedule_days(artisan_id, weekday)` PK compuesta con `is_working` + `start_time` + `end_time` por día. Migra automáticamente las rows viejas y backfilla artistas sin schedule previo. Permite "lun 09-18, sáb 10-14, dom off" estilo agenda real.
9. `0009_promo_use_rpc.sql` — RPC `increment_promo_use(text)` SECURITY DEFINER atómico. Valida active + maxUses + validUntil y hace UPDATE de `used_count`. Necesario porque RLS bloquea writes a `promos` para non-admins (0006). CheckoutSuccess la dispatcha al mount si había promo aplicada.
10. `0010_reviews_customer.sql` — `reviews.user_id` (uuid → auth.users), INSERT/UPDATE/DELETE policies por user, unique parcial `(user_id, artisan_id, service_id)` para evitar duplicados. Las rows legacy/seed sin user_id no entran al constraint.
11. `0011_profile_preferences.sql` — `profiles.theme` ('noir'|'marbre') y `profiles.preferred_lang` ('es'|'en') con defaults + check constraints. Las RLS `_own` existentes ya cubren las nuevas columnas.
12. `0012_appointments.sql` — tabla `appointments` (uuid PK, status `confirmed/completed/cancelled`, `points_earned` snapshot, FKs a artisans y combos). RLS `_own` para customer + admin SELECT cross-user + admin UPDATE para gestión.
13. `0013_checkout_rpcs.sql` — dos RPCs SECURITY DEFINER: `confirm_checkout()` mueve pending_bookings → appointments + decrementa stock + suma points/visits/spent (con multiplier del tier actual del user) + limpia bolsa, todo atómico. `cancel_appointment(uuid)` valida ownership + actualiza status + hace rollback de points/visits/spent si la cita era futura.
14. `0014_taken_slots_rpc.sql` — RPC `taken_slots(artisan_id, from, to)` SECURITY DEFINER. Devuelve `(slot_date, slot_time, slot_duration)` para todos los pending_bookings + appointments confirmadas del artist en el rango, SIN exponer PII (user_id, services, total). Booking customer la consume para marcar slots ocupados — evita doble booking.
15. `0015_settings_to_miami.sql` — UPDATE idempotente del row salon_settings: city='Miami', address='Lincoln Road 1234', phone/whatsapp '+1 786...', currency='USD', timezone='America/New_York'. Solo dispara si los valores actuales coinciden con el seed europeo (Madrid/EUR/Europe/Madrid).
16. `0016_favorites.sql` — tabla `favorites(user_id, kind, target_id)` PK compuesta. RLS owner-only. Tres kinds: 'product' | 'service' | 'artisan'.
17. `0017_referrals.sql` — tabla `referrals(referrer_id, referee_id, code, status, applied_at)` con RLS owner + admin. Helpers: `my_referral_code()` deriva 8 chars upper del uuid del caller; `find_referrer_by_code(text)` reverse lookup.
18. `0018_gift_cards.sql` — tabla `gift_cards` con código único, balance, sender/recipient, delivery_method (email/whatsapp/schedule), status. RLS sender ve sus envíos + redeemer ve sus canjes + admin cross-user. RPC `redeem_gift_card(text)` SECURITY DEFINER vincula al user actual usando el código.
19. `0019_audit_log.sql` — tabla `audit_log` (bigserial, action insert/update/delete, before/after jsonb) append-only. Function `audit_trigger()` SECURITY DEFINER. Triggers en salon_settings y tier_rules.
20. `0020_reminder_cron.sql` — `send_appointment_reminders()` PL/pgSQL que recorre appointments confirmed con date=mañana y dispara la Edge Function `send-appointment-email` con `kind=reminder` via `pg_net.http_post`. `cron.schedule` diario 10:00 UTC. Requiere extensions `pg_cron` + `pg_net` activadas y GUC settings `app.edge_url` + `app.edge_key`.
21. `0021_audit_log_more_tables.sql` — extiende `audit_trigger()` para soportar product_id (product_stocks) y composite artisan_id:weekday (artisan_schedule_days). Triggers nuevos en products/services/artisans/promos/combos/product_stocks/artisan_schedule_days.

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
├─ main.tsx                 # ReactDOM root + QueryClientProvider + Sentry boundary
├─ vite-env.d.ts            # types de import.meta.env (incluye VITE_SENTRY_DSN)
├─ lib/
│  ├─ supabase.ts           # singleton client (PKCE)
│  ├─ query.ts              # QueryClient (5min stale, 30min gc)
│  ├─ db.ts                 # ~1700 líneas. fetchers + RPC wrappers + mappers
│  ├─ format.ts             # useCurrency() + currencySymbol() + formatPrice()
│  └─ sentry.ts             # initSentry + SentryErrorBoundary (no-op sin DSN)
├─ theme/                   # tokens (Noir + Marbre), ThemeProvider, global.css
├─ i18n/                    # strings tipadas + LangProvider (persiste en dsr-lang-v1)
├─ types/index.ts           # 22+ tipos de dominio
├─ data/
│  ├─ catalog.ts            # PRODUCTS, SERVICES, ARTISANS (seeds para initialData)
│  ├─ nails.ts              # NAIL_LOOKS seed
│  ├─ giftcards.ts          # GIFTCARD_DESIGNS (catálogo de diseños — distinto de gift_cards table)
│  ├─ tiers.ts              # TIERS + PERKS
│  ├─ user.ts               # USER + STORIES (mock cliente — fallback guest)
│  ├─ images.ts             # AI_IMG via pollinations + I() resolver de slugs
│  ├─ helpers.ts            # findX estáticos + tierFor/nextTier + buildSchedule (con collision)
│  ├─ avatars.ts            # 10 retratos editoriales para AvatarPicker
│  ├─ combos.ts             # SEED_COMBOS
│  ├─ admin-seeds.ts        # seeds de stocks, promos, schedules, tier rules, reviews, settings
│  ├─ service-variants.ts   # SEED_VARIANTS
│  ├─ us-states.ts          # US_STATES + detectLabelType + AddressLabelType
│  ├─ useUserData.ts        # hook EffectiveUser (profile real o mock)
│  ├─ legal.ts              # copy bilingüe cancellation/terms/privacy
│  ├─ calendar.ts           # buildIcsEvent + downloadIcs (sin libs)
│  ├─ AppointmentsProvider.tsx  # session-aware: USER seed guest, DB query authed
│  ├─ CatalogProvider.tsx   # single source of truth: DB via TanStack Query
│  ├─ FavoritesProvider.tsx # session-aware: localStorage guest, DB authed
│  └─ UserProvider.tsx      # auth + profile + avatar + refreshProfile + theme/lang sync
├─ cart/CartProvider.tsx    # session-aware: localStorage guest, DB authed, auto-merge
├─ router/Router.tsx        # state machine
├─ components/
│  ├─ atoms/                # Typography, Icon, Buttons, Layout, Chrome,
│  │                        # TopChrome, CartDrawer, AvatarPicker, PromoInput,
│  │                        # RateStars, Skeleton, SearchOverlay, Toast
│  ├─ ReviewsSection.tsx
│  └─ GiftCardVisual.tsx
├─ screens/                 # 23 pantallas customer (ver lista abajo)
└─ admin/
   ├─ AdminApp.tsx          # shell desktop con sidebar de 15 secciones
   ├─ AdminGate.tsx         # bloquea acceso si !isAdmin
   ├─ SidePanel.tsx         # drawer lateral genérico para forms
   └─ sections/             # 15 sections operativas

supabase/
├─ migrations/              # 0001..0021.sql
├─ email-templates/
│  └─ magic-link.html       # pegar manual en Supabase Dashboard → Auth → Email Templates
└─ functions/
   └─ send-appointment-email/
      └─ index.ts            # Deno + Resend. kind: confirmation | reminder

src/data/helpers.test.ts          # vitest, 16 tests (tierFor, nextTier, buildSchedule)
src/data/calendar.test.ts         # vitest, 12 tests (buildIcsEvent)
public/
├─ favicon.svg              # SVG inline DSR (usado por manifest + apple-touch-icon)
└─ manifest.webmanifest     # PWA manifest mínimo
```

**23 pantallas customer:** `Onboarding`, `Auth`, `Home`, `Services`, `ServiceDetail`, `ArtisanProfile`, `Booking` (4 pasos + edit mode + reschedule), `AppointmentDetail`, `Rewards`, `Shop`, `ProductDetail`, `Bag`, `CheckoutSuccess`, `Profile`, `PersonalInfo`, `Addresses`, `NailAtelier`, `NailLookDetail`, `GiftCards`, `GiftBuy` (3 pasos), `GiftMine`, `Legal` (3 docs en tabs), `Favorites`.

**15 secciones admin:** `Variants`, `Products`, `Services`, `Combos`, `Artisans`, `Schedules`, `Appointments`, `Inventory`, `Points`, `GiftCards`, `Promotions`, `Reviews`, `Reports`, `Settings`, `AuditLog`. Todas escriben a Postgres con RLS por rol. `StubSection.tsx` queda para futuras secciones.

---

## Backlog

### Resuelto
- **Vercel deploy** ✅
- **SMTP custom Supabase** ✅ (Pro plan)
- **Migrations 0007-0021 aplicadas en Supabase** ✅
- **Email template magic link bilingüe** ✅ pegado en dashboard
- **Currency display refactor** ✅ (Bundle 1 de Fase 9 — `857c9a3`).
- **Audit log expandido** ✅ (migration 0021 — `975d12f`).
- **Reminder cron infrastructure** ✅ código listo (migration 0020 + Edge Function `kind=reminder`). Activación pendiente: ver "En hold > Resend".

### En hold (decisión del usuario, no perder de vista)

**Pagos / autenticación externa** (todos requieren cuentas o developer accounts):
- **Apple Pay real** — Stripe SetupIntent + Apple Developer Account ($99/año). Mock visual hoy.
- **OAuth Apple / Google** — botones en `Auth.tsx` con badge "Próximamente". Requiere Apple Dev + Google Cloud Console.
- **WhatsApp login** — provider externo (Wassenger / Twilio Verify).
- **Phone login + Web OTP** — depende de configurar SMS provider en Supabase (Twilio).

**Sentry — error tracking en producción**:
- Código instalado y listo (`src/lib/sentry.ts` + `<SentryErrorBoundary>` global). No-op hoy porque `VITE_SENTRY_DSN` está vacío.
- Para activar:
  1. Crear cuenta en [sentry.io](https://sentry.io/signup/) → New Project → React → name `dsr-maison`.
  2. Copiar DSN desde Settings → Projects → dsr-maison → Client Keys.
  3. Vercel → Settings → Environment Variables → add `VITE_SENTRY_DSN` con el valor (Production + Preview, NO Development).
  4. Redeploy. Verificar con `throw new Error("test")` en consola producción → debe aparecer en Sentry Issues.

**Resend — emails transaccionales (cita confirmada + recordatorio 24h)**:
- Edge Function `supabase/functions/send-appointment-email/` lista, código cliente conectado en `CheckoutSuccess`. Migration 0020 con cron diario aplicada (job `dsr_appointment_reminders` programado pero falla silencio sin secrets).
- Para activar:
  1. Crear cuenta en [resend.com](https://resend.com) (free 3k/mes).
  2. **Verificar dominio sender** (`dsr-maison.com`) — agregar 4 DNS records (1 MX + 3 TXT) que Resend muestra. O skip esta paso y usar sandbox `onboarding@resend.dev` (solo manda al email del owner del proyecto).
  3. Generar API Key (Sending Access).
  4. Setear secrets via Supabase CLI:
     ```bash
     supabase login
     supabase link --project-ref scruipyuxewznlrujjgk
     supabase secrets set RESEND_API_KEY=re_xxx
     supabase secrets set EMAIL_FROM='DSR Maison <reservas@dsr-maison.com>'
     supabase functions deploy send-appointment-email
     ```
  5. Para que el cron funcione: habilitar `pg_cron` y `pg_net` en Dashboard → Database → Extensions, después en SQL Editor:
     ```sql
     alter database postgres set app.edge_url = 'https://scruipyuxewznlrujjgk.supabase.co/functions/v1';
     alter database postgres set app.edge_key = '<anon-key>';
     ```
  6. Test:
     - Confirmation: hacer checkout autenticado → email "Tu cita está confirmada".
     - Reminder manual: `select send_appointment_reminders();` en SQL Editor.

**Features de catálogo / contenido**:
- **Recomendaciones AI reales en Home** — hoy el "96% match" es hardcoded.
- **Stories de artisans** — cards estáticas sin contenido al click.
- **Imágenes de producción** — todo el catálogo viene de pollinations.ai (cold-start 10-30s). Migrar a Supabase Storage cuando haya assets finales. También subir `public/og-image.png` (1200x630) + descomentar en `index.html`.

**Plataforma**:
- **PWA manifest + service worker** — instalable como app, offline support. Manifest mínimo ya existe (`public/manifest.webmanifest`); falta service worker para offline.
- **Roles admin granulares** — hoy `is_admin` es flag binario; manager / artist / recepcionista pendiente.
- **Multi-tenant** — `tenant_id` en todas las tablas para múltiples sedes.

### Conocidos a refactorear / mejorar
- **Lógica de aplicar crédito al referrer** (Bundle K Fase 9) — la tabla `referrals` y el código del usuario están listos, pero al primer checkout del referee no se da crédito al referrer. Depende de pagos reales para aplicar el descuento.
- **Redención de gift cards en checkout** — tabla `gift_cards` lista (migration 0018) + RPC `redeem_gift_card` lista, pero al hacer checkout no se descuenta del balance ni se aplica al total. Depende de Stripe.
- **Code splitting de vendor** — index.js sigue ~590 kB (gzip 164 kB). Partir React + Supabase + TanStack vía `build.rollupOptions.output.manualChunks` bajaría a ~100-200 kB de app.
- **Currency en helpers que NO son hooks** — algunos sub-componentes en admin (Editor inside SidePanel) tienen su propio `useCurrency()` instead de recibir prop. Funciona pero repite la lookup. Refactor menor.
- **Multi-booking email** — `CheckoutSuccess` solo envía email del primer pending. Si el customer agendó 2+, los demás no se confirman por mail. Iteración futura: agruparlos en un solo email o mandar uno por cada uno.

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
