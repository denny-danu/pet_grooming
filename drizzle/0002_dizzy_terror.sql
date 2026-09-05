CREATE TABLE "branches" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"is_head_office" boolean DEFAULT false NOT NULL,
	"address" text,
	"city" text DEFAULT 'Jakarta',
	"phone" text,
	"email" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "branches_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "store_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"store_name" text DEFAULT 'PetCo Pet Care & Retail' NOT NULL,
	"tagline" text DEFAULT 'Pet CRM, Grooming, Boarding & Aquarium',
	"logo_url" text,
	"contact_phone" text DEFAULT '+62 21-718-2938',
	"contact_email" text DEFAULT 'contact@petco.co.id',
	"tax_rate_percent" integer DEFAULT 11,
	"receipt_header" text DEFAULT 'PetCo Pet Care, Grooming & Hotel',
	"receipt_footer" text DEFAULT 'Terima kasih atas kunjungan Anda! Sampai jumpa kembali.',
	"online_booking_enabled" boolean DEFAULT true,
	"auto_confirm_bookings" boolean DEFAULT true,
	"reminder_24h_enabled" boolean DEFAULT true,
	"reminder_2h_enabled" boolean DEFAULT true,
	"whatsapp_api_key" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "membership_accounts" DROP CONSTRAINT "membership_accounts_owner_id_unique";--> statement-breakpoint
ALTER TABLE "membership_tiers" DROP CONSTRAINT "membership_tiers_name_unique";--> statement-breakpoint
ALTER TABLE "stays" DROP CONSTRAINT "stays_booking_id_unique";--> statement-breakpoint
ALTER TABLE "membership_accounts" DROP CONSTRAINT "membership_accounts_owner_id_owners_id_fk";
--> statement-breakpoint
DROP INDEX "bookings_staff_range_idx";--> statement-breakpoint
DROP INDEX "bookings_room_range_idx";--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "kind" SET DEFAULT 'grooming';--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "price_cents" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "membership_tiers" ADD PRIMARY KEY ("name");--> statement-breakpoint
ALTER TABLE "membership_tiers" ALTER COLUMN "points_per_cent_spend" SET DATA TYPE numeric(5, 2);--> statement-breakpoint
ALTER TABLE "membership_tiers" ALTER COLUMN "points_per_cent_spend" SET DEFAULT '1';--> statement-breakpoint
ALTER TABLE "package_purchases" ALTER COLUMN "package_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "package_purchases" ALTER COLUMN "price_cents" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "packages" ALTER COLUMN "credits" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "packages" ALTER COLUMN "price_cents" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "price_per_night_cents" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "duration_minutes" SET DEFAULT 60;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "duration_minutes" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "price_cents" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "stays" ALTER COLUMN "night_count" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "branch_id" integer;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "customer_tanks" ADD COLUMN "branch_id" integer;--> statement-breakpoint
ALTER TABLE "membership_accounts" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "membership_accounts" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "branch_id" integer;--> statement-breakpoint
ALTER TABLE "owners" ADD COLUMN "branch_id" integer;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "branch_id" integer;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "staff" ADD COLUMN "branch_id" integer;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_tanks" ADD CONSTRAINT "customer_tanks_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_accounts" ADD CONSTRAINT "membership_accounts_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owners" ADD CONSTRAINT "owners_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_resource_idx" ON "bookings" USING btree ("kind","room_id","staff_id","starts_at","ends_at");--> statement-breakpoint
CREATE INDEX "bookings_starts_at_idx" ON "bookings" USING btree ("starts_at");--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "cancelled_at";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "cancelled_by";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "no_show_at";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "no_show_fee_cents";--> statement-breakpoint
ALTER TABLE "membership_accounts" DROP COLUMN "points_lifetime_earned";--> statement-breakpoint
ALTER TABLE "membership_accounts" DROP COLUMN "joined_at";--> statement-breakpoint
ALTER TABLE "membership_tiers" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "membership_tiers" DROP COLUMN "points_per_service";--> statement-breakpoint
ALTER TABLE "package_purchases" DROP COLUMN "expires_at";--> statement-breakpoint
ALTER TABLE "packages" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "rooms" DROP COLUMN "kind";--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "description";