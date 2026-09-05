# PetCo

Pet CRM + Booking + Membership. SvelteKit (SSR) + Postgres + Drizzle.

Covers pet shop, grooming, pet hotel, aquarium workflows (Phase 1: CRM + grooming/hotel booking + reminders + membership).

## Stack

- SvelteKit 2 (SSR, runes) · Svelte 5
- PostgreSQL · Drizzle ORM · postgres.js
- bcryptjs session cookie auth
- Vitest

## Setup

```sh
# 1. Postgres running locally, then:
createdb petco

# 2. Env
cp .env.example .env   # adjust DATABASE_URL if needed

# 3. Install, migrate, seed
pnpm i
pnpm db:generate
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

## Modules

- **CRM** — owner + pets (species, breed, weight, allergy/behavior/aggressive flags, vaccination record), vaccine status badge, history.
- **Booking** — single calendar engine for resources (groomer slot / hotel room). Conflict detection blocks double-booking. Create/reschedule/cancel/check-in/check-out/no-show/completed. Free-slot finder for grooming.
- **Vaccine gate** — hotel bookings and check-in blocked when pet vaccination missing/expired.
- **Membership** — points ledger (earn/redeem), tier auto-upgrade, prepaid packages sold & redeemed against bookings.
- **Reminders** — pre-2h/pre-24h reminder scan, notification queue/log, channel preference (email default). Transport is a delivered-stub; wire a gateway in `runNotificationDispatcher`.

## Tests

Pure-logic unit tests for scheduling overlap, active-status rules, and vaccine status:
`src/lib/server/__tests__/engine.test.ts`

Conflict engine + vaccine gate are additionally exercised end-to-end at the booking API (409 on double-book / vaccine block).
