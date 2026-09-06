import {
	pgTable,
	serial,
	text,
	timestamp,
	integer,
	decimal,
	boolean,
	date,
	uniqueIndex,
	index
} from "drizzle-orm/pg-core";
import { petSpecies, staffRole, notifChannel } from "./enums";
import { branches } from "./organization";

/* ==================== CRM: Owners, Pets & Staff ==================== */

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
