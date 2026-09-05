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

/* ==================== 0. Multi-Branch & Website Settings ==================== */
export const branches = pgTable("branches", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	code: text("code").notNull().unique(),
	isHeadOffice: boolean("is_head_office").notNull().default(false),
	address: text("address"),
	city: text("city").default("Jakarta"),
	phone: text("phone"),
	email: text("email"),
	active: boolean("active").notNull().default(true),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const storeSettings = pgTable("store_settings", {
	id: serial("id").primaryKey(),
	storeName: text("store_name").notNull().default("PetCo Pet Care & Retail"),
	tagline: text("tagline").default("Pet CRM, Grooming, Boarding & Aquarium"),
	logoUrl: text("logo_url"),
	contactPhone: text("contact_phone").default("+62 21-718-2938"),
	contactEmail: text("contact_email").default("contact@petco.co.id"),
	taxRatePercent: integer("tax_rate_percent").default(11),
	receiptHeader: text("receipt_header").default("PetCo Pet Care, Grooming & Hotel"),
	receiptFooter: text("receipt_footer").default("Terima kasih atas kunjungan Anda! Sampai jumpa kembali."),
	onlineBookingEnabled: boolean("online_booking_enabled").default(true),
	autoConfirmBookings: boolean("auto_confirm_bookings").default(true),
	reminder24hEnabled: boolean("reminder_24h_enabled").default(true),
	reminder2hEnabled: boolean("reminder_2h_enabled").default(true),
	whatsappApiKey: text("whatsapp_api_key"),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const owners = pgTable(
	"owners",
	{
		id: serial("id").primaryKey(),
		branchId: integer("branch_id").references(() => branches.id),
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
		branchId: integer("branch_id").references(() => branches.id),
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

export const membershipAccounts = pgTable(
	"membership_accounts",
	{
		id: serial("id").primaryKey(),
		ownerId: integer("owner_id")
			.notNull()
			.references(() => owners.id, { onDelete: "cascade" }),
		tier: text("tier").notNull().default("silver"),
		pointsBalance: integer("points_balance").notNull().default(0),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
	}
);

export const membershipTiers = pgTable(
	"membership_tiers",
	{
		name: text("name").primaryKey(),
		minPoints: integer("min_points").notNull().default(0),
		pointsPerCentSpend: integer("points_per_cent_spend").notNull().default(1),
		discountPercent: integer("discount_percent").notNull().default(0)
	}
);

export const packages = pgTable(
	"packages",
	{
		id: serial("id").primaryKey(),
		name: text("name").notNull(),
		kind: bookingKind("kind").notNull(),
		credits: integer("credits").notNull(),
		priceCents: integer("price_cents").notNull(),
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
		packageId: integer("package_id")
			.notNull()
			.references(() => packages.id),
		packageName: text("package_name").notNull(),
		kind: bookingKind("kind").notNull(),
		creditsIssued: integer("credits_issued").notNull(),
		creditsRemaining: integer("credits_remaining").notNull(),
		priceCents: integer("price_cents").notNull(),
		purchasedAt: timestamp("purchased_at", { withTimezone: true }).defaultNow().notNull()
	},
	(t) => [index("package_purchases_owner_idx").on(t.ownerId)]
);

export const ledgerEntries = pgTable(
	"ledger_entries",
	{
		id: serial("id").primaryKey(),
		ownerId: integer("owner_id")
			.notNull()
			.references(() => owners.id),
		type: ledgerType("type").notNull(),
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

/* ==================== 1. Pet Shop / POS & Inventory ==================== */
export const productCategories = pgTable("product_categories", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	slug: text("slug").notNull(),
	icon: text("icon"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const products = pgTable("products", {
	id: serial("id").primaryKey(),
	categoryId: integer("category_id").references(() => productCategories.id),
	name: text("name").notNull(),
	sku: text("sku").notNull(),
	barcode: text("barcode"),
	description: text("description"),
	priceCents: integer("price_cents").notNull(),
	costCents: integer("cost_cents").default(0),
	stockQty: integer("stock_qty").notNull().default(0),
	lowStockThreshold: integer("low_stock_threshold").default(5),
	unit: text("unit").default("pcs"),
	active: boolean("active").notNull().default(true),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const orders = pgTable("orders", {
	id: serial("id").primaryKey(),
	branchId: integer("branch_id").references(() => branches.id),
	orderNumber: text("order_number").notNull(),
	ownerId: integer("owner_id").references(() => owners.id),
	petId: integer("pet_id").references(() => pets.id),
	totalCents: integer("total_cents").notNull(),
	discountCents: integer("discount_cents").default(0),
	paymentMethod: text("payment_method").notNull().default("cash"),
	paymentStatus: text("payment_status").notNull().default("paid"),
	notes: text("notes"),
	actorStaffId: integer("actor_staff_id").references(() => staff.id),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const orderItems = pgTable("order_items", {
	id: serial("id").primaryKey(),
	orderId: integer("order_id").references(() => orders.id).notNull(),
	productId: integer("product_id").references(() => products.id).notNull(),
	productName: text("product_name").notNull(),
	unitPriceCents: integer("unit_price_cents").notNull(),
	quantity: integer("quantity").notNull().default(1),
	subtotalCents: integer("subtotal_cents").notNull()
});

/* ==================== 2. Pet Hotel Caretaker Daily Roster ==================== */
export const dailyCareLogs = pgTable("daily_care_logs", {
	id: serial("id").primaryKey(),
	bookingId: integer("booking_id").references(() => bookings.id).notNull(),
	petId: integer("pet_id").references(() => pets.id).notNull(),
	careDate: date("care_date").notNull(),
	feedingAmDone: boolean("feeding_am_done").default(false),
	feedingPmDone: boolean("feeding_pm_done").default(false),
	walkAmDone: boolean("walk_am_done").default(false),
	walkPmDone: boolean("walk_pm_done").default(false),
	medicationDone: boolean("medication_done").default(false),
	moodNotes: text("mood_notes"),
	photoUrl: text("photo_url"),
	staffId: integer("staff_id").references(() => staff.id),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

/* ==================== 3. Aquarium Tanks & Water Parameters ==================== */
export const customerTanks = pgTable("customer_tanks", {
	id: serial("id").primaryKey(),
	branchId: integer("branch_id").references(() => branches.id),
	ownerId: integer("owner_id").references(() => owners.id).notNull(),
	name: text("name").notNull(),
	volumeLiters: integer("volume_liters"),
	ecosystem: text("ecosystem").notNull().default("freshwater"),
	dimensions: text("dimensions"),
	filtrationType: text("filtration_type"),
	lightingType: text("lighting_type"),
	notes: text("notes"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const waterParameterLogs = pgTable("water_parameter_logs", {
	id: serial("id").primaryKey(),
	tankId: integer("tank_id").references(() => customerTanks.id).notNull(),
	bookingId: integer("booking_id").references(() => bookings.id),
	recordedAt: timestamp("recorded_at", { withTimezone: true }).defaultNow().notNull(),
	ph: decimal("ph", { precision: 4, scale: 2 }),
	ammoniaPpm: decimal("ammonia_ppm", { precision: 5, scale: 2 }),
	nitritePpm: decimal("nitrite_ppm", { precision: 5, scale: 2 }),
	nitratePpm: decimal("nitrate_ppm", { precision: 5, scale: 2 }),
	salinityPpt: decimal("salinity_ppt", { precision: 5, scale: 2 }),
	temperatureC: decimal("temperature_c", { precision: 4, scale: 1 }),
	khDkh: decimal("kh_dkh", { precision: 4, scale: 1 }),
	notes: text("notes"),
	staffId: integer("staff_id").references(() => staff.id),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const aquariumServicePlans = pgTable("aquarium_service_plans", {
	id: serial("id").primaryKey(),
	ownerId: integer("owner_id").references(() => owners.id).notNull(),
	tankId: integer("tank_id").references(() => customerTanks.id).notNull(),
	planName: text("plan_name").notNull(),
	frequency: text("frequency").notNull().default("monthly"),
	pricePerVisitCents: integer("price_per_visit_cents").notNull(),
	active: boolean("active").notNull().default(true),
	nextScheduledDate: date("next_scheduled_date"),
	notes: text("notes"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

/* ==================== 4. Grooming Add-ons & Cut Specifications ==================== */
export const groomingCutCards = pgTable("grooming_cut_cards", {
	id: serial("id").primaryKey(),
	petId: integer("pet_id").references(() => pets.id).notNull(),
	bookingId: integer("booking_id").references(() => bookings.id),
	bladeLengthBody: text("blade_length_body"),
	bladeLengthFace: text("blade_length_face"),
	scissorNotes: text("scissor_notes"),
	coatCondition: text("coat_condition"),
	behaviorScore: integer("behavior_score").default(5),
	skinIssues: text("skin_issues"),
	photosJson: jsonb("photos_json").$type<string[]>().default([]),
	staffId: integer("staff_id").references(() => staff.id),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const bookingAddons = pgTable("booking_addons", {
	id: serial("id").primaryKey(),
	bookingId: integer("booking_id").references(() => bookings.id).notNull(),
	serviceId: integer("service_id").references(() => services.id),
	name: text("name").notNull(),
	priceCents: integer("price_cents").notNull(),
	durationMinutes: integer("duration_minutes").default(0),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

/* ==================== Relationships ==================== */
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

export const notifRelations = relations(notifications, ({ one }) => ({
	booking: one(bookings, { fields: [notifications.bookingId], references: [bookings.id] })
}));
