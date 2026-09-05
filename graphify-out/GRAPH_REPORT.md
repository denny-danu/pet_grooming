# Graph Report - .  (2026-09-06)

## Corpus Check
- 81 files · ~70,854 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 376 nodes · 743 edges · 31 communities (19 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.86)
- Token cost: 2,600 input · 4,200 output

## Community Hubs (Navigation)
- Database Schema & Seed
- Booking Engine & Service
- Auth & Staff Utilities
- Dev Dependencies (Drizzle/Lucide)
- Session & App Hooks
- Runtime Dependencies
- Product Vision (PRD)
- Membership & Ledger
- Customer Profile UI
- Shared UI Components
- Toolchain Config (tsconfig)
- Page UI & Form Layouts
- Utility & Booking Detail
- Reminders UI
- Bookings List UI
- Customers List UI
- Docs (README/PRD)
- DB Migration Script
- Lucide Svelte Pkg
- PRD API Contracts
- PRD Compliance
- PRD Multi-branch
- PRD Roles
- App Shell
- Favicon Asset
- Money Util
- Robots Config

## God Nodes (most connected - your core abstractions)
1. `requireUser()` - 33 edges
2. `db` - 28 edges
3. `bookings` - 17 edges
4. `owners` - 16 edges
5. `pets` - 15 edges
6. `staff` - 13 edges
7. `$lib/util` - 13 edges
8. `scripts` - 11 edges
9. `compilerOptions` - 11 edges
10. `services` - 9 edges

## Surprising Connections (you probably didn't know these)
- `CRM module (implemented)` --implements--> `Pet CRM (owner + pet profiles)`  [INFERRED]
  README.md → PRD.md
- `Reminders module (implemented)` --conceptually_related_to--> `Unified resource-calendar booking engine`  [INFERRED]
  README.md → PRD.md
- `Membership module (implemented)` --implements--> `Membership & loyalty`  [INFERRED]
  README.md → PRD.md
- `PetCo README (current build state)` --references--> `PRD: Pet CRM + Booking + Membership`  [INFERRED]
  README.md → PRD.md
- `Booking module (implemented)` --implements--> `Unified resource-calendar booking engine`  [INFERRED]
  README.md → PRD.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Four business lines unified on one CRM + booking platform** — prd_pet_crm, prd_grooming_booking, prd_pet_hotel, prd_aquarium_services, prd_booking_engine [EXTRACTED 1.00]
- **Vaccine gate compliance flow (records -> gate -> check-in -> alerts)** — prd_vaccination_records, prd_vaccine_gate, prd_pet_hotel, prd_reminders_notifications [EXTRACTED 1.00]
- **Phase 1 platform slice implemented in the scaffolded app** — readme_crm_module, readme_booking_module, readme_vaccine_gate, readme_membership_module, readme_reminders_module, prd_phase_1_scope [INFERRED 0.95]

## Communities (31 total, 12 thin omitted)

### Community 0 - "Database Schema & Seed"
Cohesion: 0.08
Nodes (42): getCustomerWithRelations(), aquariumServicePlans, auditLogs, bookingKind, bookings, bookingsRelations, bookingStatus, branches (+34 more)

### Community 1 - "Booking Engine & Service"
Cohesion: 0.12
Nodes (32): assertNoConflict(), BookingConflict, BookingConflictError, findConflicts(), listOverlaps(), BookingKind, cancelBooking(), checkInBooking() (+24 more)

### Community 2 - "Auth & Staff Utilities"
Cohesion: 0.09
Nodes (25): main(), bcryptHash(), bcryptVerify(), getBranchFilter(), requireUser(), dailyCareLogs, groomingCutCards, staff (+17 more)

### Community 3 - "Dev Dependencies (Drizzle/Lucide)"
Cohesion: 0.06
Nodes (31): drizzle-kit, @lucide/svelte, devDependencies, drizzle-kit, @lucide/svelte, playwright-core, svelte, svelte-check (+23 more)

### Community 4 - "Session & App Hooks"
Cohesion: 0.13
Nodes (21): App, Locals, handle, handleSession(), base64UrlDecode(), base64UrlEncode(), createAccessToken(), createAuthTokens() (+13 more)

### Community 5 - "Runtime Dependencies"
Cohesion: 0.07
Nodes (26): bcryptjs, date-fns, dotenv, drizzle-orm, dependencies, bcryptjs, date-fns, dotenv (+18 more)

### Community 6 - "Product Vision (PRD)"
Cohesion: 0.13
Nodes (25): Aquarium maintenance services, Unified resource-calendar booking engine, Grooming booking, Membership & loyalty, Named module boundaries, Out-of-scope items, Prepaid packages ledger, Payments & deposits (+17 more)

### Community 7 - "Membership & Ledger"
Cohesion: 0.12
Nodes (17): membershipTiers, productCategories, products, applyLedger(), getOrCreateMembership(), InsufficientCreditsError, LedgerColumnKind, LedgerColumnType (+9 more)

### Community 8 - "Customer Profile UI"
Cohesion: 0.11
Nodes (12): addPetOpen, bookingsList, buyPackageOpen, cust, customerTanksList, editCustomerOpen, editPetOpen, ledgersList (+4 more)

### Community 9 - "Shared UI Components"
Cohesion: 0.24
Nodes (7): $app/forms, $app/navigation, $lib/components/Badge.svelte, $lib/components/EmptyState.svelte, $lib/components/Modal.svelte, $lib/components/PetAvatar.svelte, $lib/components/StatCard.svelte

### Community 10 - "Toolchain Config (tsconfig)"
Cohesion: 0.14
Nodes (13): ./.svelte-kit/tsconfig.json, compilerOptions, allowJs, checkJs, esModuleInterop, forceConsistentCasingInFileNames, moduleResolution, resolveJsonModule (+5 more)

### Community 11 - "Page UI & Form Layouts"
Cohesion: 0.15
Nodes (5): $lib/components/DatePicker.svelte, done, filteredRows, $app/state, ../app.css

### Community 13 - "Reminders UI"
Cohesion: 0.20
Nodes (6): deliveredCount, deliveryRate, disp, filteredRows, sent, showResult

### Community 14 - "Bookings List UI"
Cohesion: 0.25
Nodes (5): filteredDays, groomingCount, hotelCount, totalFilteredItems, weekTotal

### Community 16 - "Docs (README/PRD)"
Cohesion: 0.67
Nodes (3): PRD: Pet CRM + Booking + Membership, PetCo README (current build state), SvelteKit + Postgres + Drizzle stack

## Knowledge Gaps
- **125 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+120 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `requireUser()` connect `Auth & Staff Utilities` to `Database Schema & Seed`, `Booking Engine & Service`, `Membership & Ledger`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `db` connect `Booking Engine & Service` to `Database Schema & Seed`, `Auth & Staff Utilities`, `Session & App Hooks`, `Membership & Ledger`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Dependencies (Drizzle/Lucide)` to `Runtime Dependencies`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _125 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Database Schema & Seed` be split into smaller, more focused modules?**
  _Cohesion score 0.0784313725490196 - nodes in this community are weakly interconnected._
- **Should `Booking Engine & Service` be split into smaller, more focused modules?**
  _Cohesion score 0.11515151515151516 - nodes in this community are weakly interconnected._
- **Should `Auth & Staff Utilities` be split into smaller, more focused modules?**
  _Cohesion score 0.0873440285204991 - nodes in this community are weakly interconnected._