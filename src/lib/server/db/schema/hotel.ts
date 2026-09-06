import { pgTable, serial, text, timestamp, integer, date, boolean, index } from "drizzle-orm/pg-core";
import { bookings } from "./booking";
import { pets, staff } from "./crm";

/* ==================== Pet Hotel: Caretaker Daily Roster ==================== */

export const dailyCareLogs = pgTable(
	"daily_care_logs",
	{
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
	},
);
