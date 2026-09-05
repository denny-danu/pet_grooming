import postgres from "postgres";

const connectionString = process.env.DATABASE_URL ?? "postgres://denny@localhost:5432/petco";
const sql = postgres(connectionString, { prepare: false });

async function migrate() {
	console.log("Running direct schema migration...");

	await sql`
		CREATE TABLE IF NOT EXISTS "branches" (
			"id" serial PRIMARY KEY NOT NULL,
			"name" text NOT NULL,
			"code" text NOT NULL UNIQUE,
			"is_head_office" boolean DEFAULT false NOT NULL,
			"address" text,
			"city" text DEFAULT 'Jakarta',
			"phone" text,
			"email" text,
			"active" boolean DEFAULT true NOT NULL,
			"created_at" timestamp with time zone DEFAULT now() NOT NULL
		);
	`;

	await sql`
		CREATE TABLE IF NOT EXISTS "store_settings" (
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
	`;

	// Add created_at / updated_at on existing tables
	await sql`ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;`;
	await sql`ALTER TABLE "membership_accounts" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;`;
	await sql`ALTER TABLE "membership_accounts" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;`;
	await sql`ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;`;

	// Add branch_id columns if not exist
	const tablesToAlter = ["staff", "owners", "bookings", "orders", "rooms", "customer_tanks"];
	for (const table of tablesToAlter) {
		await sql.unsafe(`
			DO $$ 
			BEGIN 
				IF NOT EXISTS (
					SELECT 1 FROM information_schema.columns 
					WHERE table_name = '${table}' AND column_name = 'branch_id'
				) THEN 
					ALTER TABLE "${table}" ADD COLUMN "branch_id" integer REFERENCES "branches"("id");
				END IF;
			END $$;
		`);
	}

	console.log("Migration complete!");
	await sql.end();
}

migrate().catch((e) => {
	console.error(e);
	process.exit(1);
});
