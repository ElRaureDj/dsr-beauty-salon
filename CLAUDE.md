# CLAUDE.md

Contexto persistente para Claude Code. Este archivo se lee al inicio de cada sesión.

---

## Qué es esto

**DSR Maison de Beauté** — app móvil de un salón de belleza de lujo dirigido a clientela latina. Estética inspirada en Dior couture y hospitalidad Aman. Foco en uñas (Gel-X / acrílico) y un sistema de gift cards.

Originalmente un bundle de Claude Design (HTML + JSX prototípico) que fue portado a una app de producción **Vite + React 18 + TypeScript** durante una sesión en claude.ai. El build compila limpio: **66 módulos, 79 KB gzipped, 0 errores TS**.

---

## Stack

- **React 18.3** + **TypeScript 5.6** + **Vite 5.4**
- Sin librería de routing — router propio, máquina de estados en `src/router/Router.tsx`
- Sin CSS-in-JS — estilos inline tipados desde `src/theme/tokens.ts`
- Sin librería de estado — solo React context (`ThemeProvider`, `LangProvider`, `Router`)
- i18n propia, **string keys tipadas** en `src/i18n/strings.ts` (agregar una key sin traducir rompe el build, esto es a propósito)

Comandos:

```bash
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build
npm run typecheck  # solo tsc, sin emit
npm run preview    # preview del build
```

---

## Convenciones de código

### Estilos
- **No CSS modules ni styled-components.** Estilos inline con objetos `style={{...}}` que leen de `tokens.ts`.
- Colores: siempre desde `theme.colors.*`, nunca hex literales en componentes.
- Tipografía: usar los átomos de `src/components/atoms/Typography.tsx` (`Eyebrow`, `H1`, `H2`, `H3`, `Body`, `Tiny`, `Numeral`) en vez de `<h1>`/`<p>` directos.
- `dsr-fade-up`, `dsr-fade`, `dsr-shimmer`, `dsr-spin`, `dsr-pulse` — keyframes globales en `src/theme/global.css`. Reutilizar antes de inventar.
- **No emojis en UI.** Solo el set `Icons` en `src/components/atoms/Icon.tsx` (SVG path strings).

### TypeScript
- `strict: true`. No `any` salvo en interop muy puntual.
- Todos los tipos de dominio viven en `src/types/index.ts` (`Service`, `Artisan`, `Product`, `NailLook`, `GiftCardDesign`, `Tier`, `Route`…).
- Helpers de búsqueda en `src/data/helpers.ts` (`findService`, `findArtisan`, `tierFor`, `nextTier`, `greeting`, `buildSchedule`).

### Routing
- `useRouter()` da `{ route, go, back }`. Llamar `go('product', { productId: 'p1' })`.
- Las pantallas que **ocultan el TabBar** se centralizan en `App.tsx` (lista: `onboarding`, `service`, `artisan`, `product`, `bag`, `nail-look`, `gift-buy`, `gift-mine`). Si agregas una pantalla nueva inmersiva, edita esa lista.
- Cada navegación dispara un `queueMicrotask` que hace scroll-to-top — no agregar `scrollTo` manual en pantallas.

### i18n
- Toda string visible va por `t('clave')`. Si falta la traducción en EN, TS lo marca.
- Idioma por defecto: **español**. El toggle ES/EN vive en `Onboarding.tsx`.
- Convención de keys: camelCase descriptivo (`upcomingAppointment`, `bookThisRitual`).

### Datos
- Todo es **mock estático** en `src/data/`. No hay backend.
- `buildSchedule(artisanId)` es **determinista** (seed por id) — la misma artesana siempre muestra la misma semana. No romper esto sin razón: estabiliza screenshots de demo.
- Imágenes vienen de `pollinations.ai` con prompts en `src/data/images.ts`. Si se agregan nuevas, mantener el estilo editorial latino (ver prompts existentes para referencia).

---

## Decisiones de port (importantes para no deshacer sin querer)

1. **Sin `window.AI_IMG`** — el prototipo montaba imágenes en `window`; ahora son imports ES desde `src/data/images.ts`. No volver al patrón global.
2. **Iconos `mail` y `cal` agregados** durante el port. El prototipo los referenciaba sin definirlos. Si ves un icono nuevo referenciado, verifica que esté en `Icons`.
3. **Tema único: Noir Couture.** El sistema de tokens (`ThemeTokens`) está hecho para soportar múltiples temas (`Marbre Doré` se descartó en esta entrega) — agregar un tema nuevo es un cambio en `tokens.ts` + `ThemeProvider.tsx`, no requiere tocar pantallas.
4. **Apple Pay buttons** son `<button>` inline con fondo negro y wordmark blanco — **no** usar el `Btn` primario para ellos. Es contrato visual de iOS HIG.
5. **Frame de iOS en desktop** — en viewports ≥ 480 px la app se centra en un marco tipo iPhone. En móvil real es edge-to-edge. La media query vive en `src/theme/global.css`.

---

## Estructura

```
src/
├─ App.tsx                  # providers + switch de rutas + frame iOS
├─ main.tsx                 # ReactDOM root
├─ theme/                   # tokens, ThemeProvider, global.css
├─ i18n/                    # strings tipadas + LangProvider
├─ types/index.ts           # tipos de dominio
├─ data/                    # catalog, nails, giftcards, tiers, user, helpers, images
├─ router/Router.tsx        # state machine
├─ components/
│   ├─ atoms/               # Typography, Icon, Buttons, Layout, Chrome
│   └─ GiftCardVisual.tsx
└─ screens/                 # 16 pantallas
```

16 pantallas: `Onboarding`, `Home`, `Services`, `ServiceDetail`, `ArtisanProfile`, `Booking` (4 pasos), `Rewards`, `Shop`, `ProductDetail`, `Bag`, `Profile`, `NailAtelier`, `NailLookDetail`, `GiftCards`, `GiftBuy` (3 pasos), `GiftMine`.

---

## Áreas naturales para iterar

Ideas que quedaron en el aire o que serían siguientes pasos lógicos:

- **Tema Marbre Doré** (claro, mármol + dorado) — agregarlo en `tokens.ts` y un toggle en `Profile.tsx`.
- **Animación de transición entre pantallas** — actualmente son cortes secos; un cross-fade o slide encajaría con la estética.
- **Backend real** — reemplazar mocks en `src/data/` por llamadas a una API. Los `find*` helpers son el punto de inyección natural.
- **Persistencia de carrito y bag** — hoy se pierden al recargar.
- **Apple Pay real** — actualmente el botón solo navega a un estado de éxito; integrar Stripe / Apple Pay JS sería el paso de producción.
- **Tests** — no hay. Vitest + React Testing Library para empezar por los helpers deterministas y el router.
- **Accesibilidad** — auditar contraste de `textMuted` sobre `bg`, agregar `aria-label` en los botones de iconos, gestionar foco al cambiar de ruta.
- **Storybook** — los átomos en `components/atoms/` están bien aislados, serían el primer candidato.

---

## Cómo trabajar conmigo (Claude Code) en este repo

- Antes de tocar pantallas, **lee el átomo o helper correspondiente** — la mayoría del comportamiento ya está abstraído.
- Si algo se siente repetido entre pantallas, probablemente debería ser un átomo nuevo en `components/atoms/`.
- Antes de cerrar una tarea, corre `npm run typecheck` o `npm run build` y reporta el resultado.
- Si vas a agregar una dependencia, justifícala — el proyecto es deliberadamente minimalista (solo `react` + `react-dom` en runtime).
- Idioma de comunicación con el usuario: **español** (a menos que pida otra cosa). Comentarios en código: español también, para mantener consistencia con los strings.
