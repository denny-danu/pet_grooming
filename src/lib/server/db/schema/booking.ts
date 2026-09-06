import {
	pgTable,
	serial,
	text,
	timestamp,
	integer,
	decimal,
	boolean,
	date,
	jsonb,
	index
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { bookingKind, bookingStatus } from "./enums";
import { branches } from "./organization";
import { owners, pets, staff } from "./crm";

/* ==================== Services & Rooms (catalog) ==================== */

export const services = pgTable(
	"services",
	{
		id: serial("id").primaryKey(),
		name: text("name").notNull(),
		kind: bookingKind("kind").notNull(),
		durationMinutes: integer("duration_minutes").notNull().default(60),
		priceCents: integer("price_cents").notNull(),
		requiresStaffSkill: text("requires_staff_skill"),
		active: boolean("active").notNull().default(true),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
	},
	(t) => [index("services_kind_idx").on(t.kind)]
);

export const rooms = pgTable(
	"rooms",
	{
		id: serial("id").primaryKey(),
		branchId: integer("branch_id").references(() => branches.id),
		name: text("name").notNull(),
		sizeLabel: text("size_label"),
		maxPetWeightKg: decimal("max_pet_weight_kg", { precision: 5, scale: 2 }),
		capacity: integer("capacity").notNull().default(1),
		pricePerNightCents: integer("price_per_night_cents").notNull(),
		active: boolean("active").notNull().default(true)
	}
);

/* ==================== Bookings & Stays ==================== */

export const bookings = pgTable(
	"bookings",
	{
		id: serial("id").primaryKey(),
		branchId: integer("branch_id").references(() => branches.id),
		kind: bookingKind("kind").notNull().default("grooming"),
		ownerId: integer("owner_id")
			.notNull()
			.references(() => owners.id),
		petId: integer("pet_id").references(() => pets.id),
		serviceId: integer("service_id").references(() => services.id),
		roomId: integer("room_id").references(() => rooms.id),
		staffId: integer("staff_id").references(() => staff.id),
		status: bookingStatus("status").notNull().default("pending"),
		startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
		endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
		priceCents: integer("price_cents").notNull(),
		depositCents: integer("deposit_cents").default(0).notNull(),
		notes: text("notes"),
		cancelReason: text("cancel_reason"),
		confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
		checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
		checkedOutAt: timestamp("checked_out_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
	},
	(t) => [
		index("bookings_resource_idx").on(t.kind, t.roomId, t.staffId, t.startsAt, t.endsAt),
		index("bookings_status_idx").on(t.status),
		index("bookings_owner_idx").on(t.ownerId),
		index("bookings_starts_at_idx").on(t.startsAt)
	]
);

export const stays = pgTable(
	"stays",
	{
		id: serial("id").primaryKey(),
		bookingId: integer("booking_id")
			.notNull()
			.references(() => bookings.id, { onDelete: "cascade" }),
		roomId: integer("room_id")
			.notNull()
			.references(() => rooms.id),
		checkInDate: date("check_in_date").notNull(),
		checkOutDate: date("check_out_date").notNull(),
		nightCount: integer("night_count").notNull().default(1),
		petCareJson: jsonb("pet_care_json").$type<Record<string, unknown>>().default({}),
		vaccineVerifiedAt: timestamp("vaccine_verified_at", { withTimezone: true }),
		vaccineVerifiedBy: integer("vaccine_verified_by").references(() => staff.id)
	},
	(t) => [index("stays_room_date_idx").on(t.roomId, t.checkInDate, t.checkOutDate)]
);

/* ==================== Grooming Add-ons ==================== */

export const bookingAddons = pgTable(
	"booking_addons",
	{
		id: serial("id").primaryKey(),
		bookingId: integer("booking_id").references(() => bookings.id).notNull(),
		serviceId: integer("service_id").references(() => services.id),
		name: text("name").notNull(),
		priceCents: integer("price_cents").notNull(),
		durationMinutes: integer("duration_minutes").default(0),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
	}
);

export const bookingAddonsRelations = relations(bookingAddons, ({ one }) => ({
	booking: one(bookings, { fields: [bookingAddons.bookingId], references: [bookings.id] })
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
	branch: one(branches, { fields: [bookings.branchId], references: [branches.id] }),
	owner: one(owners, { fields: [bookings.ownerId], references: [owners.id] }),
	pet: one(pets, { fields: [bookings.petId], references: [pets.id] }),
	service: one(services, { fields: [bookings.serviceId], references: [services.id] }),
	room: one(rooms, { fields: [bookings.roomId], references: [rooms.id] }),
	staff: one(staff, { fields: [bookings.staffId], references: [staff.id] }),
	stay: one(stays, { fields: [bookings.id], references: [stays.bookingId] }),
	addons: many(bookingAddons)
}));

export const staysRelations = relations(stays, ({ one }) => ({
	booking: one(bookings, { fields: [stays.bookingId], references: [bookings.id] }),
	room: one(rooms, { fields: [stays.roomId], references: [rooms.id] })
}));
