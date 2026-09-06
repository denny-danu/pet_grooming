import { relations } from "drizzle-orm";
import { branches } from "./organization";
import { owners, pets, staff } from "./crm";
import { bookings, stays, bookingAddons, rooms } from "./booking";
import { orders } from "./retail";

/* ============================================================
 * Relations that span module boundaries live here to avoid
 * circular imports between domain modules.
 * ============================================================ */

export const branchesRelations = relations(branches, ({ many }) => ({
	staff: many(staff),
	bookings: many(bookings),
	orders: many(orders),
	owners: many(owners),
	rooms: many(rooms)
}));

export const ownersRelations = relations(owners, ({ one, many }) => ({
	branch: one(branches, { fields: [owners.branchId], references: [branches.id] }),
	pets: many(pets),
	bookings: many(bookings)
}));

export const petsRelations = relations(pets, ({ one }) => ({
	owner: one(owners, { fields: [pets.ownerId], references: [owners.id] })
}));
