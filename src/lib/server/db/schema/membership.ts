import { pgTable, serial, text, timestamp, integer, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { bookingKind, ledgerType, txnKind } from "./enums";
import { owners } from "./crm";

/* ==================== Membership: Points, Tiers, Packages ==================== */

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
