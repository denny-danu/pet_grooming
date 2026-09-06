import { pgTable, serial, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

/* ==================== Core: Branches & Store Settings ==================== */

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
