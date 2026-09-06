import { pgEnum } from "drizzle-orm/pg-core";

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
