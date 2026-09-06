# PetCo

All-in-one pet retail platform — **CRM · Booking · POS/Shop · Pet Hotel · Aquarium · Grooming**. Built with SvelteKit (SSR) + PostgreSQL + Drizzle.

Bilingual UI: **English** and **Bahasa Indonesia** (cookie-based language switcher, no URL prefix).

## Stack

- SvelteKit 2 (SSR, runes) · Svelte 5 · Vite
- PostgreSQL · Drizzle ORM · postgres.js
- JWT access/refresh session cookies · bcryptjs
- Multi-branch (head office ⇄ child branch data isolation)
- @lucide/svelte icons · Vitest

## Setup

```sh
# 1. Postgres running locally, then:
createdb petco

# 2. Env
cp .env.example .env   # adjust DATABASE_URL if needed

# 3. Install, migrate, seed
pnpm i
pnpm db:migrate
pnpm db:seed

# 4. Run
pnpm dev   # http://localhost:5173
```

Login: `admin@petco.local` / `admin123` (also `groom@`, `rec@`, `mana@`, `care@`).

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm check` | svelte-check typecheck |
| `pnpm test` | Vitest unit tests |
| `pnpm build` | Production build |
| `pnpm db:generate` / `db:migrate` / `db:seed` | Drizzle schema → migration → apply → seed demo |

## Architecture

```
src/
├─ app.css                        design tokens + global component kit
├─ hooks.server.ts                session/refresh, branch scope, locale cookie
├─ lib/
│  ├─ i18n/                       bilingual message layer
│  │  ├─ en.json                  English catalog (source of truth)
│  │  ├─ id.json                  Bahasa Indonesia catalog (same keys)
│  │  ├─ translate.ts             typed t() w/ {param} + en fallback
│  │  ├─ t.ts                     locale-bound typed accessor (makeT)
│  │  └─ labels.ts                enum helpers (booking kind/status labels)
│  ├─ util.ts                     base64 + money formatting
│  ├─ components/                 reusable UI + LanguageSwitcher
│  │  └─ aquarium/                feature-scoped components (TankCard…)
│  ├─ ui/                         presentation logic (param evaluators…)
│  └─ server/
│     ├─ db/
│     │  ├─ index.ts              drizzle client
│     │  └─ schema/               domain-split schema (barrel re-export)
│     │     ├─ enums.ts           shared pgEnums
│     │     ├─ organization.ts    branches, store settings
│     │     ├─ crm.ts             owners, pets, staff
│     │     ├─ booking.ts         services, rooms, bookings, stays, addons
│     │     ├─ membership.ts      accounts, tiers, packages, ledger
│     │     ├─ retail.ts          categories, products, orders
│     │     ├─ hotel.ts           daily care logs
│     │     ├─ aquarium.ts        tanks, water logs, service plans
│     │     ├─ grooming.ts        cut cards
│     │     ├─ notifications.ts   notifications, audit
│     │     └─ relations.ts       cross-module drizzle relations
│     ├─ auth.ts / session.ts     password hashing, JWT, requireUser
│     ├─ booking-engine.ts        conflict detection (groomer/room overlap)
│     ├─ booking-service.ts       booking lifecycle (create…check-out)
│     ├─ vaccine-gate.ts          vaccination compliance guard
│     ├─ membership.ts            points ledger + package redemption
│     ├─ notifications.ts         reminder scan + dispatcher
│     └─ …                        slots, customer-service, overlap
└─ routes/                        SvelteKit pages per feature
```

### Layering rules

- **DB schema is split by bounded context** — one file per domain under `db/schema/`, re-exported through a barrel so consumers import from `$lib/server/db/schema`. New tables go in the matching domain file.
- **Routes stay thin** — data loading lives in `+page.server.ts`; business rules live in `src/lib/server/*` services; presentation helpers live in `src/lib/ui/*`; markup is split into `src/lib/components` once a page section repeats or grows large (see `aquarium/`).
- **UI chrome is bilingual** — new user-facing strings must be added to `en.json` and `id.json` (same key), then read through `const t = makeT($page.data.locale)`.

## i18n (EN + ID)

- Locale is stored in the `petco_locale` cookie; read once in `hooks.server.ts` → `locals.locale`.
- `+layout.server.ts` exposes it as `page.data.locale`; components build `t = makeT(locale)`.
- `LanguageSwitcher.svelte` posts to `/api/i18n/locale` and redirects back to the current page.
- Keys missing from `id.json` fall back to English automatically (never render a raw key).
- Add copy: edit both `en.json` + `id.json`; key union is derived from `en.json` so types enforce parity.

## Domain notes

- **Booking** — single resource engine (groomer slot / hotel room). Conflict detection blocks double-book. Lifecycle: pending → confirmed → checked_in → completed (+ cancelled / no_show).
- **Vaccine gate** — hotel bookings and check-ins block when pet vaccination is missing/expired.
- **Membership** — points ledger (earn/redeem), tier (silver/gold/platinum), prepaid packages sold & redeemed per booking.
- **Reminders** — 24h/2h pre-visit scan, channel preference, delivery log. Transport is a delivered stub; wire a gateway in `runNotificationDispatcher`.
- **Multi-branch** — child-branch staff are locked to `branchId`; head-office/admin switch scope via cookie/query.

## Tests

- `src/lib/server/__tests__/engine.test.ts` — overlap rules, active-status, vaccine status (pure logic).
- Conflict engine + vaccine gate additionally exercised end-to-end at booking API (409 on double-book / vaccine block).

## Roadmap / refactor status

Layering, bilingual chrome, and DB domain split are done. Still pending deeper work: splitting the remaining 800–1700-line monoliths (`hotel-roster`, `pos`, `shop`, `grooming-cuts`) into components, and extending message coverage to nested form/modal/tooltip copy.
