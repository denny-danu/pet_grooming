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
	uniqueIndex,
	index,
	time,
	check,
	pgEnum
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const petSpecies = pgEnum("pet_species", ["dog", "cat", "bird", "fish", "reptile", "other"]);
export const bookingStatus = pgEnum("booking_status", [
	"pending",
	"confirmed",
	"checked_in",
	"completed",
	"cancelled",
	"no_show"
]);
export const bookingKind = pgEnum("booking_kind", ["grooming", "hotel", "aquarium"]);
export const staffRole = pgEnum("staff_role", ["admin", "manager", "receptionist", "groomer", "caretaker", "specialist"]);
export const notifChannel = pgEnum("notif_channel", ["email", "sms", "whatsapp"]);
export const notifStatus = pgEnum("notif_status", ["queued", "sent", "delivered", "failed", "skipped"]);
export const ledgerType = pgEnum("ledger_type", ["points", "package"]);
export const txnKind = pgEnum("txn_kind", ["earn", "redeem", "issue", "refund", "expire", "adj"]);

export const owners = pgTable(
	"owners",
	{
		id: serial("id").primaryKey(),
		firstName: text("first_name").notNull(),
		lastName: text("last_name").notNull(),
		email: text("email"),
		phone: text("phone").notNull(),
		address: text("address"),
		preferredChannel: notifChannel("preferred_channel").default("email").notNull(),
		notes: text("notes"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
	},
	(t) => [uniqueIndex("owners_phone_idx").on(t.phone)]
);

export const pets = pgTable(
	"pets",
	{
		id: serial("id").primaryKey(),
		ownerId: integer("owner_id")
			.notNull()
			.references(() => owners.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		species: petSpecies("species").notNull().default("dog"),
		breed: text("breed"),
		birthDate: date("birth_date"),
		weightKg: decimal("weight_kg", { precision: 5, scale: 2 }),
		aggressive: boolean("aggressive").notNull().default(false),
		allergies: text("allergies"),
		healthNotes: text("health_notes"),
		behaviorNotes: text("behavior_notes"),
		lastVaccinationDate: date("last_vaccination_date"),
		vaccinationDueDate: date("vaccination_due_date"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
	},
	(t) => [index("pets_owner_idx").on(t.ownerId), index("pets_name_idx").on(t.name)]
);

export const staff = pgTable(
	"staff",
	{
		id: serial("id").primaryKey(),
		email: text("email").notNull(),
		passwordHash: text("password_hash").notNull(),
		name: text("name").notNull(),
		role: staffRole("role").notNull().default("receptionist"),
		active: boolean("active").notNull().default(true),
		specialty: text("specialty"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
	},
	(t) => [uniqueIndex("staff_email_idx").on(t.email)]
);

export const services = pgTable(
	"services",
	{
		id: serial("id").primaryKey(),
		kind: bookingKind("kind").notNull(),
		name: text("name").notNull(),
		description: text("description"),
		durationMinutes: integer("duration_minutes"),
		priceCents: integer("price_cents").notNull().default(0),
		active: boolean("active").notNull().default(true),
		requiresStaffSkill: text("requires_staff_skill")
	},
	(t) => [index("services_kind_idx").on(t.kind)]
);

export const rooms = pgTable(
	"rooms",
	{
		id: serial("id").primaryKey(),
		name: text("name").notNull(),
		kind: text("kind").notNull().default("hotel"),
		sizeLabel: text("size_label"),
		maxPetWeightKg: decimal("max_pet_weight_kg", { precision: 5, scale: 2 }),
		capacity: integer("capacity").notNull().default(1),
		pricePerNightCents: integer("price_per_night_cents").notNull().default(0),
		active: boolean("active").notNull().default(true)
	}
);

export const bookings = pgTable(
	"bookings",
	{
		id: serial("id").primaryKey(),
		kind: bookingKind("kind").notNull(),
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
		priceCents: integer("price_cents").notNull().default(0),
		depositCents: integer("deposit_cents").notNull().default(0),
		notes: text("notes"),
		confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
		checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
		checkedOutAt: timestamp("checked_out_at", { withTimezone: true }),
		cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
		cancelledBy: text("cancelled_by"),
		cancelReason: text("cancel_reason"),
		noShowAt: timestamp("no_show_at", { withTimezone: true }),
		noShowFeeCents: integer("no_show_fee_cents").notNull().default(0),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
	},
	(t) => [
		index("bookings_staff_range_idx").on(t.staffId, t.startsAt, t.endsAt),
		index("bookings_room_range_idx").on(t.roomId, t.startsAt, t.endsAt),
		index("bookings_owner_idx").on(t.ownerId),
		index("bookings_status_idx").on(t.status)
	]
);

export const stays = pgTable(
	"stays",
	{
		id: serial("id").primaryKey(),
		bookingId: integer("booking_id")
			.notNull()
			.references(() => bookings.id, { onDelete: "cascade" })
			.unique(),
		roomId: integer("room_id")
			.notNull()
			.references(() => rooms.id),
		checkInDate: date("check_in_date").notNull(),
		checkOutDate: date("check_out_date").notNull(),
		nightCount: integer("night_count").notNull(),
		petCareJson: jsonb("pet_care_json").$type<{
			feeding?: string;
			walksPerDay?: number;
			medication?: string;
			extras?: string[];
		}>().default({}),
		vaccineVerifiedAt: timestamp("vaccine_verified_at", { withTimezone: true }),
		vaccineVerifiedBy: integer("vaccine_verified_by").references(() => staff.id)
	},
	(t) => [index("stays_room_date_idx").on(t.roomId, t.checkInDate, t.checkOutDate)]
);

export const membershipAccounts = pgTable(
	"membership_accounts",
	{
		id: serial("id").primaryKey(),
		ownerId: integer("owner_id")
			.notNull()
			.references(() => owners.id)
			.unique(),
		tier: text("tier").notNull().default("silver"),
		pointsBalance: integer("points_balance").notNull().default(0),
		pointsLifetimeEarned: integer("points_lifetime_earned").notNull().default(0),
		joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull()
	}
);

export const membershipTiers = pgTable(
	"membership_tiers",
	{
		id: serial("id").primaryKey(),
		name: text("name").notNull().unique(),
		minPoints: integer("min_points").notNull().default(0),
		pointsPerCentSpend: integer("points_per_cent_spend").notNull().default(1),
		pointsPerService: integer("points_per_service").notNull().default(0),
		discountPercent: integer("discount_percent").notNull().default(0)
	}
);

export const packages = pgTable(
	"packages",
	{
		id: serial("id").primaryKey(),
		name: text("name").notNull(),
		kind: bookingKind("kind").notNull(),
		credits: integer("credits").notNull().default(1),
		priceCents: integer("price_cents").notNull().default(0),
		description: text("description"),
		active: boolean("active").notNull().default(true)
	}
);

export const packagePurchases = pgTable(
	"package_purchases",
	{
		id: serial("id").primaryKey(),
		ownerId: integer("owner_id")
			.notNull()
			.references(() => owners.id),
		packageId: integer("package_id").references(() => packages.id),
		packageName: text("package_name").notNull(),
		kind: bookingKind("kind").notNull(),
		creditsIssued: integer("credits_issued").notNull(),
		creditsRemaining: integer("credits_remaining").notNull(),
		priceCents: integer("price_cents").notNull().default(0),
		purchasedAt: timestamp("purchased_at", { withTimezone: true }).defaultNow().notNull(),
		expiresAt: date("expires_at")
	},
	(t) => [index("package_purchases_owner_idx").on(t.ownerId)]
);

export const ledgerEntries = pgTable(
	"ledger_entries",
	{
		id: serial("id").primaryKey(),
		type: ledgerType("type").notNull(),
		ownerId: integer("owner_id")
			.notNull()
			.references(() => owners.id),
		kind: txnKind("kind").notNull(),
		amount: integer("amount").notNull(),
		balanceAfter: integer("balance_after").notNull(),
		referenceType: text("reference_type"),
		referenceId: integer("reference_id"),
		description: text("description"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
	},
	(t) => [index("ledger_owner_idx").on(t.ownerId, t.createdAt)]
);

export const notifications = pgTable(
	"notifications",
	{
		id: serial("id").primaryKey(),
		ownerId: integer("owner_id").references(() => owners.id),
		bookingId: integer("booking_id").references(() => bookings.id),
		channel: notifChannel("channel").notNull(),
		template: text("template").notNull(),
		to: text("to").notNull(),
		status: notifStatus("status").notNull().default("queued"),
		payload: jsonb("payload").$type<Record<string, unknown>>().default({}),
		sentAt: timestamp("sent_at", { withTimezone: true }),
		error: text("error"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
	},
	(t) => [index("notif_booking_idx").on(t.bookingId, t.status)]
);

export const auditLogs = pgTable(
	"audit_logs",
	{
		id: serial("id").primaryKey(),
		actorId: integer("actor_id").references(() => staff.id),
		action: text("action").notNull(),
		entity: text("entity").notNull(),
		entityId: integer("entity_id"),
		before: jsonb("before").$type<Record<string, unknown> | null>(),
		after: jsonb("after").$type<Record<string, unknown> | null>(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
	},
	(t) => [index("audit_entity_idx").on(t.entity, t.entityId)]
);

export const ownersRelations = relations(owners, ({ many }) => ({
	pets: many(pets),
	bookings: many(bookings)
}));

export const petsRelations = relations(pets, ({ one }) => ({
	owner: one(owners, { fields: [pets.ownerId], references: [owners.id] })
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
	owner: one(owners, { fields: [bookings.ownerId], references: [owners.id] }),
	pet: one(pets, { fields: [bookings.petId], references: [pets.id] }),
	service: one(services, { fields: [bookings.serviceId], references: [services.id] }),
	room: one(rooms, { fields: [bookings.roomId], references: [rooms.id] }),
	staff: one(staff, { fields: [bookings.staffId], references: [staff.id] }),
	stay: one(stays, { fields: [bookings.id], references: [stays.bookingId] })
}));

export const staysRelations = relations(stays, ({ one }) => ({
	booking: one(bookings, { fields: [stays.bookingId], references: [bookings.id] }),
	room: one(rooms, { fields: [stays.roomId], references: [rooms.id] })
}));

export const notifRelations = relations(notifications, ({ one }) => ({
	booking: one(bookings, { fields: [notifications.bookingId], references: [bookings.id] })
}));
