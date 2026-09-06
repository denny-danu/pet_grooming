import {
	pgTable,
	serial,
	text,
	timestamp,
	integer,
	decimal,
	date,
	boolean,
	index
} from "drizzle-orm/pg-core";
import { branches } from "./organization";
import { owners, staff } from "./crm";
import { bookings } from "./booking";

/* ==================== Aquarium: Tanks, Water Parameters, Service Plans ==================== */

export const customerTanks = pgTable(
	"customer_tanks",
	{
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
	},
);

export const waterParameterLogs = pgTable(
	"water_parameter_logs",
	{
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
	},
);

export const aquariumServicePlans = pgTable(
	"aquarium_service_plans",
	{
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
	},
);
