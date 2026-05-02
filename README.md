# DSR Maison de Beauté

A luxury beauty-salon mobile app, ported from a Claude Design handoff bundle into a production **Vite + React + TypeScript** application.

> **Aesthetic:** *Noir Couture* — a single dark theme inspired by Dior couture and Aman hospitality, tuned for a Latin clientele. Cormorant Garamond italic for accents, Inter Tight for body, JetBrains Mono for numerals.

---

## Stack

| | |
|---|---|
| **Framework** | React 18.3 + TypeScript 5.6 |
| **Bundler** | Vite 5.4 |
| **Routing** | Custom in-memory state machine (no router lib — by design, this is a self-contained mobile prototype) |
| **State** | React context only (`ThemeProvider`, `LangProvider`, `Router`) |
| **Styling** | Inline style objects driven by typed design tokens (`src/theme/tokens.ts`) — no CSS-in-JS runtime |
| **Imagery** | AI-generated editorial photography via `pollinations.ai` (deterministic prompt URLs) |
| **i18n** | Spanish (default) + English, fully typed string keys |

---

## Run it

```bash
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # type-check + production bundle into dist/
npm run preview   # preview the production build
npm run typecheck # tsc only, no emit
```

The build currently produces **~79 KB gzipped** (1 JS chunk + 1 CSS chunk).

---

## Project layout

```
src/
├─ App.tsx                  # composes providers + route switch + iOS preview frame
├─ main.tsx                 # ReactDOM root
│
├─ theme/
│   ├─ tokens.ts            # `noir` ThemeTokens (colors, fonts, spacing)
│   ├─ ThemeProvider.tsx    # context + useTheme()
│   └─ global.css           # resets, keyframes (fade-up, shimmer, spin), grain texture
│
├─ i18n/
│   ├─ strings.ts           # typed I18nStrings + ES/EN dictionaries
│   └─ LangProvider.tsx     # context + useI18n() with t()
│
├─ types/index.ts           # CategoryId, Service, Artisan, Product, NailLook,
│                           # GiftCardDesign, Tier, Perk, Appointment, Route, …
│
├─ data/
│   ├─ images.ts            # 38 pollinations.ai prompts, lookup helpers
│   ├─ catalog.ts           # CATEGORIES, SERVICES (17), ARTISANS (7), PRODUCTS (8)
│   ├─ nails.ts             # NAIL_LOOKS (6 editorial Gel-X/acrylic looks)
│   ├─ giftcards.ts         # 6 designs + mock wallet (received/sent)
│   ├─ tiers.ts             # Pearl / Gold / Noir tiers + perks
│   ├─ user.ts              # mock USER profile, STORIES capsules
│   └─ helpers.ts           # findService/Artisan/…, tierFor, greeting, buildSchedule
│
├─ router/Router.tsx        # state-machine router with go(name, params), tab tracking
│
├─ components/
│   ├─ atoms/
│   │   ├─ Typography.tsx   # Eyebrow, H1, H2, H3, Body, Tiny, Numeral, Divider, GoldRule
│   │   ├─ Icon.tsx         # Ico + Icons set (chevron, heart, cart, mail, cal, …)
│   │   ├─ Buttons.tsx      # Btn (primary/secondary), GhostBtn, Chip
│   │   ├─ Layout.tsx       # Img (fade-in fallback), Screen (full-bleed scroll wrapper)
│   │   ├─ Chrome.tsx       # HeaderBar (with optional back), TabBar (5 tabs)
│   │   └─ index.ts         # barrel
│   └─ GiftCardVisual.tsx   # compact + full gift card renderer with hairline frame
│
└─ screens/                 # 16 screens, all wired into the router
    ├─ Onboarding.tsx       # 3-slide intro, ES/EN toggle, skip
    ├─ Home.tsx             # hero · upcoming · AI pick · stories · look-of-month · artisans · member
    ├─ Services.tsx         # category chips · nail-atelier banner · service list
    ├─ ServiceDetail.tsx    # ritual in 4 acts · eligible artisans · sticky CTA
    ├─ ArtisanProfile.tsx   # bio · specialties · services · sticky CTA
    ├─ Booking.tsx          # 4-step flow → confirmed (with calendar export)
    ├─ Rewards.tsx          # 3D-tilt membership card · stats · perks · gift-cards entry
    ├─ Shop.tsx             # featured Sérum Noir · 2-col grid
    ├─ ProductDetail.tsx    # video+photo carousel · "Cómo se usa" notes · sticky add-to-bag
    ├─ Bag.tsx              # line items · subtotal · Apple Pay
    ├─ Profile.tsx          # avatar · upcoming · past appointments · settings
    ├─ NailAtelier.tsx      # editorial mosaic · season chips · "En boga" badges
    ├─ NailLookDetail.tsx   # spec grid · artisan link · "Reservar este look"
    ├─ GiftCards.tsx        # landing · balance card · designs scroll · how-it-works
    ├─ GiftBuy.tsx          # 3-step purchase with live preview · Apple Pay
    └─ GiftMine.tsx         # wallet (Recibidas/Enviadas) with apply / status
```

---

## Routing

The router is a deliberately small state machine in `src/router/Router.tsx`:

```ts
go(name: RouteName, params?: RouteParams): void
```

Routes that **hide** the tab bar: `onboarding`, `service`, `artisan`, `product`, `bag`, `nail-look`, `gift-buy`, `gift-mine`. App.tsx applies that rule centrally.

A `queueMicrotask` scroll-to-top runs on every navigation so screens always open at their hero.

---

## Theme tokens

`src/theme/tokens.ts` exports a single `noir` token bundle. The shape (`ThemeTokens`) is exported, so adding *Marbre Doré* later is a one-file change plus a context update — but per scope decision, only Noir Couture ships in this build.

```ts
colors: {
  bg:          '#0A0908',
  surface:     '#1B1815',
  surfaceHi:   '#252119',
  text:        '#F5EDDC',
  textMuted:   'rgba(245,237,220,0.62)',
  gold:        '#D4B886',
  goldHi:      '#EBD5A8',
  goldDeep:    '#A88B4F',
  line:        'rgba(212,184,134,0.12)',
  lineStrong:  'rgba(212,184,134,0.28)',
}
```

---

## Notable port decisions

- **No global `window.AI_IMG`** — the prototype mounted images on `window`; they are now proper ES module exports from `src/data/images.ts`.
- **Typed string table** — every i18n key is enforced at compile time. Adding a new screen with an untranslated string fails the build.
- **Schedule generator is deterministic** — `buildSchedule(artisanId)` seeds from the artisan id, so the same artisan always shows the same week. This keeps demo screenshots consistent.
- **Two missing icon glyphs** in the original (`Icons.mail`, `Icons.cal`) were added to the icon set during the port; they were referenced in `screens-atelier-gift.jsx` but never defined in the prototype's `atoms.jsx`.
- **Apple Pay buttons** keep the iOS visual contract (black surface, white wordmark) instead of using the generic primary button — this matches the prototype's intent and Apple's HIG.
- **Mobile-first layout, desktop preview frame** — on viewports ≥ 480 px, the app renders inside a centered iOS-style frame so the design reads correctly on a desktop browser, while remaining edge-to-edge on a phone.

---

## Build verification

`npm run build` produces:

```
dist/index.html                 1.21 kB │ gzip:  0.65 kB
dist/assets/index-*.css         1.56 kB │ gzip:  0.84 kB
dist/assets/index-*.js        272.66 kB │ gzip: 78.93 kB
```

66 modules, 0 TS errors, 0 warnings.
