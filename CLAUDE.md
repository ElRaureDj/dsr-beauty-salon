# CLAUDE.md

Contexto persistente para Claude Code. Este archivo se lee al inicio de cada sesión.

---

## Qué es esto

**DSR Maison de Beauté** — app móvil de un salón de belleza de lujo dirigido a clientela latina. Estética inspirada en Dior couture y hospitalidad Aman. Foco en uñas (Gel-X / acrílico) y un sistema de gift cards.

Originalmente un bundle de Claude Design (HTML + JSX prototípico) que fue portado a una app de producción **Vite + React 18 + TypeScript** durante una sesión en claude.ai. Después de varias sesiones en Claude Code, ahora incluye:

- **Customer app** (mobile, dentro de iPhone frame en desktop) con 18 pantallas
- **Admin panel** (`/admin`, layout desktop sin iPhone frame) con 14 secciones operativas
- Build limpio: **93 módulos, ~109 KB gzipped, 0 errores TS**

---

## Stack

- **React 18.3** + **TypeScript 5.6** + **Vite 5.4**
- Sin librería de routing — router propio, máquina de estados en `src/router/Router.tsx`
- Sin CSS-in-JS — estilos inline tipados desde `src/theme/tokens.ts`
- Estado en React context: `ThemeProvider`, `LangProvider`, `Router`, `CartProvider`, `UserProvider`, `CatalogProvider`
- i18n propia, **string keys tipadas** en `src/i18n/strings.ts` (agregar una key sin traducir rompe el build, esto es a propósito)
- Sin backend — todo persiste en `localStorage` con keys versionadas (`dsr-*-v1`)

Comandos:

```bash
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build
npm run typecheck  # solo tsc, sin emit
npm run preview    # preview del build
```

Vite respeta `process.env.PORT` para que las herramientas externas (Claude Preview) puedan asignar otro puerto.

---

## Convenciones de código

### Estilos
- **No CSS modules ni styled-components.** Estilos inline con objetos `style={{...}}` que leen de `tokens.ts`.
- Colores: siempre desde `theme.colors.*`, nunca hex literales en componentes (excepto Apple Pay HIG y la loyalty card en Rewards.tsx que tiene identidad propia por tier).
- Tipografía: usar los átomos de `src/components/atoms/Typography.tsx` (`Eyebrow`, `H1`, `H2`, `H3`, `Body`, `Tiny`, `Numeral`) en vez de `<h1>`/`<p>` directos.
- Keyframes globales en `src/theme/global.css`: `dsr-fade-up`, `dsr-fade`, `dsr-shimmer`, `dsr-spin`, `dsr-pulse`, `dsr-route-in` (transición de pantallas, 0.5s). Reutilizar antes de inventar.
- **No emojis en UI.** Solo el set `Icons` en `src/components/atoms/Icon.tsx` (SVG path strings).
- Para gradients que se desvanecen al fondo del tema, usar `rgba(${T.bgRgb}, X)` (no `rgba(10,9,8,X)` hardcoded). Esto permite que ambos temas (Noir / Marbre) se vean coherentes.

### TypeScript
- `strict: true`. No `any` salvo en interop muy puntual.
- Todos los tipos de dominio viven en `src/types/index.ts`. Ya incluye: `Service`, `Artisan`, `Product`, `NailLook`, `GiftCardDesign`, `Tier`, `Route`, `CartItem`, `PendingBooking`, `Combo`, `ProductStock`, `Promo`, `WeekDay`, `ArtisanSchedule`, `TierRule`, `Review`, `SalonSettings`.

### Routing
- `useRouter()` da `{ route, tab, go }`. Llamar `go('product', { id: 'p1' })`.
- Routes: `onboarding`, `auth`, `admin`, `home`, `services`, `service`, `artisan`, `book`, `rewards`, `shop`, `product`, `bag`, `checkout-success`, `profile`, `nail-atelier`, `nail-look`, `gift-cards`, `gift-buy`, `gift-mine`.
- Las pantallas que **ocultan el TabBar** y/o el **TopChrome** se centralizan en `App.tsx` (`HIDE_TAB_ROUTES`, `HIDE_CHROME_ROUTES`). Si agregas una pantalla nueva inmersiva, edita ambas listas.
- `App.tsx::RootLayout` decide entre `<DesktopFrame>` (customer mobile) y `<AdminApp>` (admin desktop) según `route.name`.
- Cada navegación dispara `queueMicrotask` con scroll-to-top — no agregar `scrollTo` manual en pantallas.
- El wrapper de transición tiene `key={routeName + JSON.stringify(params)}` para remontar en cada cambio y disparar `dsr-route-in`.

### i18n
- Toda string visible va por `t('clave')`. Si falta la traducción en EN, TS lo marca.
- Idioma por defecto: **español**. El toggle ES/EN vive en Onboarding y Auth.
- Convención de keys: camelCase descriptivo (`upcomingAppointment`, `bookThisRitual`).

### Datos
- **CatalogProvider** (`src/data/CatalogProvider.tsx`) es la fuente de verdad de catálogo + admin overrides. Wrappea los catálogos estáticos (`PRODUCTS`, `SERVICES`, `ARTISANS`, `SERVICE_VARIANTS`) con una capa de overrides parciales por entidad + entidades CRUD-only (combos, promos, reviews, settings, stocks, schedules, tier rules).
- **Customer screens leen de `useCatalog()` hooks** (`getProduct`, `getAllServices`, `getArtisan`, etc.) — NO importan `PRODUCTS/SERVICES/ARTISANS` ni usan `findX(id)` directamente. Edits del admin propagan en vivo a los screens.
- `helpers.ts::findX` son lookups estáticos sin reactividad — **se usan solo para validación** (ej: en `CartProvider` al cargar storage para descartar IDs huérfanos). NO migrar esos sites a hooks.
- `buildSchedule(artisanId)` es **determinista** (seed por id) — la misma artesana siempre muestra la misma semana. No romper esto sin razón: estabiliza screenshots de demo.
- Imágenes vienen de `pollinations.ai` con prompts en `src/data/images.ts`. Los avatares en `src/data/avatars.ts` reutilizan imágenes ya cacheadas en pollinations CDN (heroes + portraits de artistas) para evitar el cold-start de generaciones nuevas.

### Persistencia
- Todo está en `localStorage` con keys versionadas. Resumen actual:
  - `dsr-onboarding-seen`, `dsr-theme-v1`
  - `dsr-cart-v1` (productos), `dsr-cart-bookings-v1` (servicios pendientes)
  - `dsr-user-avatar-v1`, `dsr-user-auth-v1`
  - `dsr-admin-{variants,products,services,artisans,combos,stocks,promos,schedules,tier-rules,reviews,settings,section}-v1`
- Nunca cambiar el formato de una key existente sin bump de versión + migración.

---

## Decisiones importantes (no deshacer sin razón)

1. **Sin `window.AI_IMG`** — imágenes son imports ES desde `src/data/images.ts` y `src/data/avatars.ts`. No volver al patrón global.
2. **Iconos `mail` y `cal`** se agregaron durante el port. Si ves un icono nuevo referenciado, verifica que esté en `Icons`.
3. **Dos temas: Noir Couture (oscuro, default) + Marbre Doré (claro)**. Toggle en Profile, persistido. `bgRgb` token permite gradients theme-aware.
4. **Apple Pay buttons** son `<button>` inline con `background: '#fff'` + `color: '#000'` (HIG). NO usar el `Btn` primario para ellos. Igual en `CartDrawer`.
5. **iPhone frame en desktop** — en viewports ≥ 480 px la app customer se centra en un marco tipo iPhone (`DesktopFrame`). En móvil real es edge-to-edge. La media query vive en `src/theme/global.css`.
6. **`/admin` salta el iPhone frame** — `RootLayout` detecta la ruta y monta `<AdminApp>` (desktop full-viewport con sidebar) en vez de `<DesktopFrame><FrameInner>`.
7. **TopChrome y CartDrawer son persistentes** — viven a nivel de iPhone frame (sibling de ScreenSwitch), NO dentro de cada pantalla. El cart chip aparece solo cuando `cart.count > 0`.
8. **Sticky CTAs por encima del TabBar** — usar `bottom: TAB_BAR_HEIGHT` (exportado en `Chrome.tsx`) + `zIndex: 60`. Nunca dejar un CTA crítico atrapado bajo el TabBar.
9. **Auth es 100% mock** — `signIn(provider)` solo flips state + persiste. Para auth real haría falta backend (Supabase/Firebase) + SDKs Apple/Google/Meta.
10. **Admin sin auth gate todavía** — accesible desde Profile. En producción tendría que ir tras un rol.
11. **Pollinations cold-start** — generar imágenes nuevas tarda 10-30s la primera vez. Los avatares reutilizan imágenes existentes para evitar esto.
12. **Img component tiene `onError`** — usado en TopChrome y Profile para fallback a iniciales si la imagen del avatar falla.

---

## Estructura

```
src/
├─ App.tsx                  # providers + RootLayout decide customer/admin
├─ main.tsx                 # ReactDOM root
├─ theme/                   # tokens (Noir + Marbre), ThemeProvider, global.css
├─ i18n/                    # strings tipadas (~150 keys) + LangProvider
├─ types/index.ts           # 17 tipos de dominio
├─ data/
│  ├─ catalog.ts            # PRODUCTS, SERVICES, ARTISANS, CATEGORIES (estático)
│  ├─ nails.ts              # NAIL_LOOKS
│  ├─ giftcards.ts          # GIFTCARD_DESIGNS, USER_GIFTCARDS
│  ├─ tiers.ts              # TIERS + PERKS
│  ├─ user.ts               # USER + STORIES (mock cliente)
│  ├─ images.ts             # AI_IMG via pollinations
│  ├─ helpers.ts            # findX estáticos (solo validación) + buildSchedule
│  ├─ avatars.ts            # 10 retratos editoriales para AvatarPicker
│  ├─ combos.ts             # SEED_COMBOS (seed inicial editable)
│  ├─ admin-seeds.ts        # seeds de stocks, promos, schedules, tier rules, reviews, settings
│  ├─ service-variants.ts   # SEED_VARIANTS (overlay editable)
│  ├─ CatalogProvider.tsx   # fuente de verdad de catálogo + admin overrides
│  └─ UserProvider.tsx      # avatar + auth state mock
├─ cart/CartProvider.tsx    # cart productos + bookings + drawer state
├─ router/Router.tsx        # state machine
├─ components/
│  ├─ atoms/                # Typography, Icon, Buttons, Layout, Chrome,
│  │                        # TopChrome, CartDrawer, AvatarPicker
│  └─ GiftCardVisual.tsx
├─ screens/                 # 18 pantallas customer
└─ admin/
   ├─ AdminApp.tsx          # shell desktop con sidebar de 14 secciones
   ├─ SidePanel.tsx         # drawer lateral genérico para forms
   └─ sections/             # 14 sections operativas
```

**18 pantallas customer:** `Onboarding`, `Auth`, `Home`, `Services`, `ServiceDetail`, `ArtisanProfile`, `Booking` (4 pasos + edit mode), `Rewards`, `Shop`, `ProductDetail`, `Bag`, `CheckoutSuccess`, `Profile`, `NailAtelier`, `NailLookDetail`, `GiftCards`, `GiftBuy` (3 pasos), `GiftMine`.

**14 secciones admin:** `Variants`, `Products`, `Services`, `Combos`, `Artisans`, `Schedules`, `Appointments`, `Inventory`, `Points`, `GiftCards`, `Promotions`, `Reviews`, `Reports`, `Settings`. Todas funcionales (no stubs). El `StubSection.tsx` queda en el repo por si se necesita para futuras secciones.

---

## Áreas naturales para iterar

Pendientes ya identificados, ordenados por valor/esfuerzo:

- **Booking de combo completo** — actualmente click en combo → `go('book', {service: combo.serviceIds[0]})`. Falta multi-service en Booking + aplicar el descuento del combo + reflejarlo en PendingBooking.
- **Create / Delete entidades** en admin — productos/servicios/artistas solo editan, no crean ni borran. Combos y promos sí tienen CRUD completo (modelo a seguir).
- **Customer surfaces para los nuevos módulos**:
  - Aplicar promociones al cart (input "código de cupón" en Bag/CartDrawer)
  - Mostrar reseñas en ServiceDetail / ArtisanProfile
  - Indicar bajo stock en ProductDetail (si `stock <= lowStockAt`)
- **Auth gate en `/admin`** — agregar mock de "esto requiere rol manager" antes de mostrar el panel.
- **Backend real** — reemplazar `localStorage` por API. CatalogProvider sigue siendo el punto de inyección natural.
- **Apple Pay / OAuth real** — actualmente todo es mock. Stripe + Apple Pay JS, Sign in with Apple, Google Sign-In, Meta Login.
- **Multi-tenant** — el admin asume un solo salón. Para varias sedes haría falta otro provider y selector.
- **Tests** — no hay. Vitest + React Testing Library; helpers deterministas y CatalogProvider son buenos primeros candidatos.
- **Accesibilidad** — auditar contraste, `aria-label` en botones de iconos, focus management al cambiar de ruta.
- **Reportes con cohortes** — actualmente solo computa sobre USER actual. Para producción haría falta agregación real por mes/cohorte + exports a CSV.

---

## Cómo trabajar conmigo (Claude Code) en este repo

- **Idioma de comunicación con el usuario: español.** Comentarios en código: español también.
- Antes de tocar pantallas, **lee el átomo o helper correspondiente** — la mayoría del comportamiento ya está abstraído. Si una pantalla customer toca catálogo, debe usar `useCatalog()`, no imports estáticos.
- Si algo se siente repetido entre pantallas, probablemente debería ser un átomo nuevo en `components/atoms/`. Para el admin, un componente reutilizable en `src/admin/`.
- Antes de cerrar una tarea, corre `npm run typecheck` o `npm run build` y reporta el resultado.
- **Verificación visual con Claude Preview**: para cambios de UI, abrir preview (`mcp__Claude_Preview__preview_start` con `vite-dev`), navegar al screen afectado vía `preview_eval` clicks, hacer `preview_screenshot`, confirmar visualmente. El usuario espera ver la screenshot del cambio funcionando antes de declarar listo.
- Si vas a agregar una dependencia, justifícala — el proyecto es deliberadamente minimalista (solo `react` + `react-dom` en runtime).
- Cuando el usuario dice "continua" o "sigue", retoma la siguiente fase pendiente del roadmap.
- Cuando algo es claramente mock vs real, ser **explícito** ("auth flow mock — no hay backend real, los botones de Apple/Google solo simulan OAuth").
- Para sesiones nuevas: este `CLAUDE.md` se carga automáticamente. El último commit (`881aad8`) cubre todo el scope actual; un `git log` da el detalle.
