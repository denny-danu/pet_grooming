CREATE TYPE "public"."booking_kind" AS ENUM('grooming', 'hotel', 'aquarium');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."ledger_type" AS ENUM('points', 'package');--> statement-breakpoint
CREATE TYPE "public"."notif_channel" AS ENUM('email', 'sms', 'whatsapp');--> statement-breakpoint
CREATE TYPE "public"."notif_status" AS ENUM('queued', 'sent', 'delivered', 'failed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."pet_species" AS ENUM('dog', 'cat', 'bird', 'fish', 'reptile', 'other');--> statement-breakpoint
CREATE TYPE "public"."staff_role" AS ENUM('admin', 'manager', 'receptionist', 'groomer', 'caretaker', 'specialist');--> statement-breakpoint
CREATE TYPE "public"."txn_kind" AS ENUM('earn', 'redeem', 'issue', 'refund', 'expire', 'adj');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_id" integer,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" integer,
	"before" jsonb,
	"after" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" "booking_kind" NOT NULL,
	"owner_id" integer NOT NULL,
	"pet_id" integer,
	"service_id" integer,
	"room_id" integer,
	"staff_id" integer,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"price_cents" integer DEFAULT 0 NOT NULL,
	"deposit_cents" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"confirmed_at" timestamp with time zone,
	"checked_in_at" timestamp with time zone,
	"checked_out_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"cancelled_by" text,
	"cancel_reason" text,
	"no_show_at" timestamp with time zone,
	"no_show_fee_cents" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ledger_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "ledger_type" NOT NULL,
	"owner_id" integer NOT NULL,
	"kind" "txn_kind" NOT NULL,
	"amount" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"reference_type" text,
	"reference_id" integer,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "membership_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" integer NOT NULL,
	"tier" text DEFAULT 'silver' NOT NULL,
	"points_balance" integer DEFAULT 0 NOT NULL,
	"points_lifetime_earned" integer DEFAULT 0 NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "membership_accounts_owner_id_unique" UNIQUE("owner_id")
);
--> statement-breakpoint
CREATE TABLE "membership_tiers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"min_points" integer DEFAULT 0 NOT NULL,
	"points_per_cent_spend" integer DEFAULT 1 NOT NULL,
	"points_per_service" integer DEFAULT 0 NOT NULL,
	"discount_percent" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "membership_tiers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" integer,
	"booking_id" integer,
	"channel" "notif_channel" NOT NULL,
	"template" text NOT NULL,
	"to" text NOT NULL,
	"status" "notif_status" DEFAULT 'queued' NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb,
	"sent_at" timestamp with time zone,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "owners" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text NOT NULL,
	"address" text,
	"preferred_channel" "notif_channel" DEFAULT 'email' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "package_purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" integer NOT NULL,
	"package_id" integer,
	"package_name" text NOT NULL,
	"kind" "booking_kind" NOT NULL,
	"credits_issued" integer NOT NULL,
	"credits_remaining" integer NOT NULL,
	"price_cents" integer DEFAULT 0 NOT NULL,
	"purchased_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" date
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"kind" "booking_kind" NOT NULL,
	"credits" integer DEFAULT 1 NOT NULL,
	"price_cents" integer DEFAULT 0 NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pets" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" integer NOT NULL,
	"name" text NOT NULL,
	"species" "pet_species" DEFAULT 'dog' NOT NULL,
	"breed" text,
	"birth_date" date,
	"weight_kg" numeric(5, 2),
	"aggressive" boolean DEFAULT false NOT NULL,
	"allergies" text,
	"health_notes" text,
	"behavior_notes" text,
	"last_vaccination_date" date,
	"vaccination_due_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"kind" text DEFAULT 'hotel' NOT NULL,
	"size_label" text,
	"max_pet_weight_kg" numeric(5, 2),
	"capacity" integer DEFAULT 1 NOT NULL,
	"price_per_night_cents" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" "booking_kind" NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"duration_minutes" integer,
	"price_cents" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"requires_staff_skill" text
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" "staff_role" DEFAULT 'receptionist' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"specialty" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stays" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"room_id" integer NOT NULL,
	"check_in_date" date NOT NULL,
	"check_out_date" date NOT NULL,
	"night_count" integer NOT NULL,
	"pet_care_json" jsonb DEFAULT '{}'::jsonb,
	"vaccine_verified_at" timestamp with time zone,
	"vaccine_verified_by" integer,
	CONSTRAINT "stays_booking_id_unique" UNIQUE("booking_id")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_staff_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_accounts" ADD CONSTRAINT "membership_accounts_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_purchases" ADD CONSTRAINT "package_purchases_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_purchases" ADD CONSTRAINT "package_purchases_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets" ADD CONSTRAINT "pets_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stays" ADD CONSTRAINT "stays_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stays" ADD CONSTRAINT "stays_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stays" ADD CONSTRAINT "stays_vaccine_verified_by_staff_id_fk" FOREIGN KEY ("vaccine_verified_by") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_logs" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "bookings_staff_range_idx" ON "bookings" USING btree ("staff_id","starts_at","ends_at");--> statement-breakpoint
CREATE INDEX "bookings_room_range_idx" ON "bookings" USING btree ("room_id","starts_at","ends_at");--> statement-breakpoint
CREATE INDEX "bookings_owner_idx" ON "bookings" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ledger_owner_idx" ON "ledger_entries" USING btree ("owner_id","created_at");--> statement-breakpoint
CREATE INDEX "notif_booking_idx" ON "notifications" USING btree ("booking_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "owners_phone_idx" ON "owners" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "package_purchases_owner_idx" ON "package_purchases" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "pets_owner_idx" ON "pets" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "pets_name_idx" ON "pets" USING btree ("name");--> statement-breakpoint
CREATE INDEX "services_kind_idx" ON "services" USING btree ("kind");--> statement-breakpoint
CREATE UNIQUE INDEX "staff_email_idx" ON "staff" USING btree ("email");--> statement-breakpoint
CREATE INDEX "stays_room_date_idx" ON "stays" USING btree ("room_id","check_in_date","check_out_date");