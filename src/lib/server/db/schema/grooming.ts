import { pgTable, serial, text, timestamp, integer, jsonb, index } from "drizzle-orm/pg-core";
import { bookings } from "./booking";
import { pets, staff } from "./crm";

/* ==================== Grooming: Cut Specification Cards ==================== */

export const groomingCutCards = pgTable(
	"grooming_cut_cards",
	{
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
	},
);
