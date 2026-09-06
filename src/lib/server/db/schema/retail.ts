import {
	pgTable,
	serial,
	text,
	timestamp,
	integer,
	boolean,
	index
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { branches } from "./organization";
import { owners, pets, staff } from "./crm";

/* ==================== Pet Shop / POS & Inventory ==================== */

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
