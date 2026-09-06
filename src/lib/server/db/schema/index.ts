/* ============================================================
 * Domain schema modules (split for maintainability).
 * Tables/enums/relations grouped by bounded context.
 * Import schema pieces as:
 *   import { bookings, owners } from "$lib/server/db/schema";
 * ============================================================ */

export * from "./enums";
export * from "./organization";
export * from "./crm";
export * from "./booking";
export * from "./membership";
export * from "./notifications";
export * from "./retail";
export * from "./hotel";
export * from "./aquarium";
export * from "./grooming";
export * from "./relations";
