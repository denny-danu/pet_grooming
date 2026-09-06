import { pgTable, serial, text, timestamp, integer, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { notifChannel, notifStatus } from "./enums";
import { owners, staff } from "./crm";
import { bookings } from "./booking";

/* ==================== Notifications & Audit ==================== */

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

export const notifRelations = relations(notifications, ({ one }) => ({
	booking: one(bookings, { fields: [notifications.bookingId], references: [bookings.id] }),
	owner: one(owners, { fields: [notifications.ownerId], references: [owners.id] })
}));

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
