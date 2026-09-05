# PRD: Pet CRM + Booking + Membership

## Problem Statement

Pet retail/services operators (pet shop, grooming, pet hotel, aquarium) run disconnected workflows: walk-in sales, grooming appointments, boarding stays, aquarium services/maintenance. No unified customer profile, no booking system, no reminders, no repeat-purchase loop. Result: missed appointments, empty grooming slots, low boarding occupancy, zero visibility into pet history, no membership retention.

Target users: store owner/manager, receptionist/booker, groomer, hotel caretaker, aquarium specialist, pet owner customer.

## Solution

Unified platform: Pet CRM + Booking + Membership covering all four business lines. Single pet-owner profile with pets, service history, purchases. Bookable services (grooming, hotel, aquarium) with calendar, reminders, payments/deposits. Membership/loyalty driving repeat purchase. Admin dashboard for occupancy, revenue, retention.

Phase 1: CRM + grooming/hotel booking + reminders + simple membership. Phase 2: aquarium service jobs, advanced loyalty, online store tie-in.

## User Stories

### Pet CRM / Profiles
1. As a receptionist, I want to create owner profile with contact/prefs, so that I can identify customer fast.
2. As a receptionist, I want to add multiple pets per owner with species/breed/age/weight/health notes, so that services fit pet.
3. As a groomer, I want to see pet history (cuts, allergies, behavior), so that I avoid incidents.
4. As a hotel caretaker, I want to see vaccination/feeding/medication notes, so that I care safely.
5. As a manager, I want to search/filter customers by pet type, spend, last visit, so that I target win-back.
6. As a pet owner, I want to view/edit my pets, so that records stay correct.
7. As a pet owner, I want to upload vaccination records, so that boarding check-in passes.
8. As a manager, I want to flag aggressive/allergic/special-needs pets, so that staff take care.
9. As a receptionist, I want to merge duplicate profiles, so that data stays clean.
10. As a manager, I want to import existing customer list via CSV, so that onboarding fast.

### Booking – Grooming
11. As a pet owner, I want to book grooming slot online by service/pet/staff/time, so that I skip phone call.
12. As a receptionist, I want to book/reschedule/cancel grooming for walk-in/phone, so that calendar accurate.
13. As a manager, I want to define grooming services with duration/price/staff skill, so that scheduling realistic.
14. As a groomer, I want to see daily queue with pet notes, so that I prep.
15. As a pet owner, I want to pick groomer preference, so that pet comfortable.
16. As a system, I want to block double-booking and buffer time, so that delays avoided.
17. As a receptionist, I want waitlist for full days, so that cancellations refill.
18. As a pet owner, I want to add grooming add-ons (nail, teeth, de-shed), so that I customize.

### Booking – Pet Hotel
19. As a pet owner, I want to book boarding by date range/pet/room type, so that stay reserved.
20. As a manager, I want to define room/kennel inventory with capacity/size/price, so that overbooking blocked.
21. As a caretaker, I want daily board roster with feeding/walk/meds checklist, so that nothing missed.
22. As a receptionist, I want check-in/out flow with deposit/ID/vaccine verify, so that compliance met.
23. As a pet owner, I want to request extras (walk, play, bath before pickup), so that pet happy.
24. As a manager, I want peak pricing/weekend surcharge rules, so that revenue optimized.
25. As a system, I want to enforce vaccination expiry block, so that risk reduced.
26. As a pet owner, I want photo updates during stay, so that I trust service.

### Aquarium
27. As a pet owner, I want to book aquarium maintenance/installation visit, so that tank healthy.
28. As a specialist, I want job sheet with tank size/issues/history, so that I bring parts.
29. As a manager, I want to sell aquarium service plans (monthly visits), so that recurring revenue grows.
30. As a receptionist, I want to link livestock/equipment sales to service record, so that warranty tracked.

### Shop / POS tie-in
31. As a cashier, I want to attach sale to pet profile, so that purchase history builds.
32. As a pet owner, I want reorder reminders for food/litter/meds, so that I repurchase here.
33. As a manager, I want to see repeat-purchase rate by category, so that I stock right.
34. As a system, I want to auto-suggest consumables based on pet + last purchase, so that basket grows.

### Reminders / Notifications
35. As a pet owner, I want SMS/WhatsApp/email reminders 24h + 2h before appointment, so that I show up.
36. As a receptionist, I want to see confirm/unconfirmed status, so that I chase no-shows.
37. As a system, I want to send vaccine expiry + grooming due + boarding pickup alerts, so that rebooking happens.
38. As a manager, I want no-show tracking + fee rule, so that losses drop.
39. As a pet owner, I want one-tap confirm/reschedule link, so that changes easy.

### Membership / Loyalty
40. As a manager, I want to create tiers (e.g. Silver/Gold) with points per spend, so that retention rises.
41. As a pet owner, I want to earn/redeem points across shop + services, so that I stay loyal.
42. As a manager, I want prepaid packages (e.g. 5 grooms, 10 hotel nights), so that cash upfront.
43. As a system, I want to auto-apply package credits at checkout, so that staff fast.
44. As a manager, I want referral bonus, so that word-of-mouth grows.
45. As a pet owner, I want birthday perks for pets, so that I return.
46. As a manager, I want churn list (no visit 60/90 days) with coupon blast, so that win-back works.

### Payments / Ops / Reporting
47. As a receptionist, I want deposits for hotel + no-show protection, so that revenue safe.
48. As a manager, I want calendar view by resource (groomer/room/specialist), so that capacity clear.
49. As a manager, I want dashboard: bookings, occupancy, revenue, retention, top pets/services, so that decisions data-driven.
50. As a manager, I want staff roles/permissions, so that data secure.
51. As a pet owner, I want online payment + receipts, so that checkout fast.

## Implementation Decisions

- Modules: `customers` (owners+pets), `catalog` (services/rooms/packages), `scheduling` (calendar/resources), `hotel` (stays/roster), `aquarium-jobs`, `pos-link`, `notifications`, `loyalty/membership`, `payments`, `reporting`.
- One CRM record shared across shop/grooming/hotel/aquarium; pet is first-class entity linked to owner.
- Scheduling seam: single resource-calendar engine; grooming slots, hotel nights, aquarium visits are resource types with capacity rules. One seam only.
- Notifications via pluggable provider (SMS/WhatsApp/email); templates versioned; confirm/reschedule magic links.
- Membership: points ledger + package credits ledger; both decrement/accrue transactionally with sales/bookings.
- Vaccine gate: boarding/hotel check-in blocked if vaccination expired; override requires manager role + audit log.
- API contracts: `Customer`, `Pet`, `Booking`, `Stay`, `Job`, `MembershipAccount`, `Notification` REST/JSON; webhooks for payment + reminder delivery status.
- Schema: owners 1-N pets; bookings reference pet+service+resource+staff; stays reference room inventory; packages reference redeemable service SKUs.
- Multi-branch ready: branch_id on all entities, but Phase 1 single-branch ops.
- Prototype note: none yet; calendar + ledger shapes to be prototyped before build.

## Testing Decisions

- Good test = external behavior (book, block double-book, redeem points, send reminder), not internal impl.
- Test: scheduling conflict/capacity rules, vaccine gate, points/packages ledger math, reminder dispatch + confirm flow, check-in/out flow.
- Prior art: none in repo (empty). Use standard API integration tests + calendar property tests + ledger invariant tests.
- Seed demo data: 50 owners, 80 pets, 3 groomers, 20 rooms, 2 aquarium specialists.

## Out of Scope

- Full e-commerce storefront (Phase 2); Phase 1 only reorder reminders + POS link.
- Vet/medical records beyond vaccination/allergy notes; no diagnosis/prescriptions.
- Multi-branch rostering, payroll, accounting integration.
- IoT tank monitoring, GPS pet tracking.
- Native mobile apps; responsive web + WhatsApp links suffice Phase 1.

## Further Notes

- Upsell path: grooming → hotel bath-before-pickup; hotel → food reorder; aquarium sale → maintenance plan.
- Compliance: pet data + consent for photos; vaccination doc storage with expiry.
- Metrics: rebooking rate, no-show rate, occupancy, membership penetration, repeat-purchase interval, NPS.
- Risks: reminder fatigue → preference center; overbooking → hard capacity locks; staff adoption → simple calendar UX.
