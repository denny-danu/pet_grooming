import { db } from "../src/lib/server/db";
import {
	branches,
	storeSettings,
	owners,
	pets,
	staff,
	services,
	rooms,
	membershipAccounts,
	membershipTiers,
	packages,
	bookings,
	stays,
	notifications,
	ledgerEntries,
	packagePurchases,
	auditLogs,
	productCategories,
	products,
	orders,
	orderItems,
	dailyCareLogs,
	customerTanks,
	waterParameterLogs,
	aquariumServicePlans,
	groomingCutCards,
	bookingAddons
} from "../src/lib/server/db/schema";
import { bcryptHash } from "../src/lib/server/auth";
import { addMinutes, addDays, startOfDay } from "date-fns";

async function main() {
	await db.delete(orderItems);
	await db.delete(orders);
	await db.delete(products);
	await db.delete(productCategories);
	await db.delete(dailyCareLogs);
	await db.delete(waterParameterLogs);
	await db.delete(aquariumServicePlans);
	await db.delete(customerTanks);
	await db.delete(groomingCutCards);
	await db.delete(bookingAddons);
	await db.delete(notifications);
	await db.delete(ledgerEntries);
	await db.delete(auditLogs);
	await db.delete(packagePurchases);
	await db.delete(stays);
	await db.delete(bookings);
	await db.delete(packages);
	await db.delete(membershipAccounts);
	await db.delete(membershipTiers);
	await db.delete(rooms);
	await db.delete(services);
	await db.delete(pets);
	await db.delete(staff);
	await db.delete(owners);
	await db.delete(storeSettings);
	await db.delete(branches);

	// 1. Seed Branch Offices (Head Office + Child Branches)
	const branchList = await db
		.insert(branches)
		.values([
			{
				name: "Kantor Pusat & Salon Simpang Lima",
				code: "SMG-01",
				isHeadOffice: true,
				city: "Semarang Tengah",
				address: "Jl. Pandanaran No. 58, Simpang Lima, Semarang",
				phone: "+62 24 841-5500",
				email: "simpanglima@petco.co.id",
				active: true
			},
			{
				name: "Cabang Candi Hills & Luxury Hotel",
				code: "CND-01",
				isHeadOffice: false,
				city: "Semarang Selatan / Candi",
				address: "Jl. Sultan Agung No. 88, Candi Baru, Gajahmungkur, Semarang",
				phone: "+62 24 831-2290",
				email: "candihills@petco.co.id",
				active: true
			},
			{
				name: "Cabang Banyumanik Spa",
				code: "BYM-01",
				isHeadOffice: false,
				city: "Semarang Atas",
				address: "Jl. Sukun Raya No. 24, Banyumanik, Semarang",
				phone: "+62 24 747-8810",
				email: "banyumanik@petco.co.id",
				active: true
			},
			{
				name: "Cabang Puri Anjasmoro Studio",
				code: "PURI-01",
				isHeadOffice: false,
				city: "Semarang Barat",
				address: "Jl. Puri Anjasmoro Blok E1 No. 12, Semarang Barat",
				phone: "+62 24 760-4420",
				email: "purianjasmoro@petco.co.id",
				active: true
			},
			{
				name: "Cabang Ngaliyan Pet Haven",
				code: "NGL-01",
				isHeadOffice: false,
				city: "Semarang Barat",
				address: "Jl. Prof. Dr. Hamka No. 35, Ngaliyan, Semarang",
				phone: "+62 24 761-9930",
				email: "ngaliyan@petco.co.id",
				active: true
			}
		])
		.returning();

	const [hoBranch, kemangBranch, senopatiBranch, bsdBranch, sbyBranch] = branchList;

	// 2. Seed Store Settings
	await db.insert(storeSettings).values({
		storeName: "PetCo Pet Care, Retail & Hotel",
		tagline: "Integrated Pet CRM, Salon, Boarding & Aquarium Systems",
		contactPhone: "+62 21-718-2938",
		contactEmail: "contact@petco.co.id",
		taxRatePercent: 11,
		receiptHeader: "PetCo Pet Care, Grooming & Hotel",
		receiptFooter: "Terima kasih atas kunjungan Anda! Sampai jumpa kembali.",
		onlineBookingEnabled: true,
		autoConfirmBookings: true,
		reminder24hEnabled: true,
		reminder2hEnabled: true,
		whatsappApiKey: "pk_live_petco_wa_secret_2026"
	});

	// 3. Seed Staff (Admin assigned to HO, Branch Staff assigned to Kemang & Senopati)
	const [admin] = await db
		.insert(staff)
		.values({
			email: "admin@petco.local",
			passwordHash: await bcryptHash("admin123"),
			name: "Ada Admin",
			role: "admin",
			branchId: hoBranch.id
		})
		.returning();

	await db.insert(staff).values([
		{ email: "mana@petco.local", passwordHash: await bcryptHash("admin123"), name: "Manny Manager", role: "manager", branchId: hoBranch.id },
		{ email: "rec@petco.local", passwordHash: await bcryptHash("admin123"), name: "Reena Reception", role: "receptionist", branchId: kemangBranch.id },
		{ email: "groom@petco.local", passwordHash: await bcryptHash("admin123"), name: "Grace Groomer", role: "groomer", specialty: "Full Groom & Cat Styling", branchId: kemangBranch.id },
		{ email: "care@petco.local", passwordHash: await bcryptHash("admin123"), name: "Carl Caretaker", role: "caretaker", specialty: "Hotel & Dog Behavior", branchId: kemangBranch.id },
		{ email: "aqua@petco.local", passwordHash: await bcryptHash("admin123"), name: "Arya Aquarist", role: "specialist", specialty: "Reef & Planted Aquascapes", branchId: kemangBranch.id },
		{ email: "seno.rec@petco.local", passwordHash: await bcryptHash("admin123"), name: "Siti Senopati", role: "receptionist", branchId: senopatiBranch.id }
	]);

	// 4. Seed Services
	const svc = await db
		.insert(services)
		.values([
			{ kind: "grooming", name: "Full Groom (Grooming Lengkap)", durationMinutes: 90, priceCents: 180000, requiresStaffSkill: "full-groom" },
			{ kind: "grooming", name: "Bath & Brush (Mandi & Sisir)", durationMinutes: 45, priceCents: 95000, requiresStaffSkill: "bath" },
			{ kind: "grooming", name: "Nail Trim (Gunting Kuku)", durationMinutes: 15, priceCents: 35000 },
			{ kind: "grooming", name: "Teeth Brushing (Sikat Gigi)", durationMinutes: 15, priceCents: 30000 },
			{ kind: "grooming", name: "Flea & Tick Medicated Bath (Mandi Kutu)", durationMinutes: 30, priceCents: 50000 },
			{ kind: "aquarium", name: "Tank Maintenance (Perawatan Akuarium)", durationMinutes: 60, priceCents: 250000 },
			{ kind: "aquarium", name: "Aquascape Setup & Installation", durationMinutes: 180, priceCents: 750000 }
		])
		.returning();
	const [fullGroom, bathBrush, nailTrim] = svc;

	// 5. Seed Rooms per branch
	const roomList = await db
		.insert(rooms)
		.values([
			{ branchId: kemangBranch.id, name: "Small Suite (Kamar Kecil - Kemang)", sizeLabel: "S", maxPetWeightKg: "10", pricePerNightCents: 120000 },
			{ branchId: kemangBranch.id, name: "Standard Suite (Kamar Standar - Kemang)", sizeLabel: "M", maxPetWeightKg: "25", pricePerNightCents: 175000 },
			{ branchId: kemangBranch.id, name: "VIP Suite (Kamar VIP - Kemang)", sizeLabel: "L", maxPetWeightKg: "50", pricePerNightCents: 250000 },
			{ branchId: kemangBranch.id, name: "Cat Condo (Kandang Kucing - Kemang)", sizeLabel: "C", pricePerNightCents: 100000 },
			{ branchId: senopatiBranch.id, name: "Luxury Penthouse (Senopati)", sizeLabel: "XL", maxPetWeightKg: "60", pricePerNightCents: 350000 }
		])
		.returning();
	const [smallSuite, standardSuite, largeSuite, catCondo] = roomList;

	// 6. Seed Membership Tiers
	await db.insert(membershipTiers).values([
		{ name: "silver", minPoints: 0, pointsPerCentSpend: 1, discountPercent: 0 },
		{ name: "gold", minPoints: 1000, pointsPerCentSpend: 2, discountPercent: 5 },
		{ name: "platinum", minPoints: 5000, pointsPerCentSpend: 3, discountPercent: 10 }
	]);

	// 7. Seed Packages
	await db.insert(packages).values([
		{ name: "5x Full Grooming Pack", kind: "grooming", credits: 5, priceCents: 800000 },
		{ name: "10 Night Hotel Stay Pass", kind: "hotel", credits: 10, priceCents: 1100000 }
	]);

	// 8. Seed Owners
	const demoOwners = [
		{ firstName: "Olivia", lastName: "Baker", email: "olivia@example.com", phone: "+62 812-3456-7001", tier: "silver", branchId: kemangBranch.id },
		{ firstName: "Budi", lastName: "Santoso", email: "budi@example.com", phone: "+62 813-9876-5002", tier: "gold", branchId: kemangBranch.id },
		{ firstName: "Siti", lastName: "Rahma", email: "siti@example.com", phone: "+62 815-4321-8003", tier: "platinum", branchId: senopatiBranch.id },
		{ firstName: "Denny", lastName: "Pratama", email: "denny@example.com", phone: "+62 818-5678-9004", tier: "silver", branchId: kemangBranch.id }
	];

	for (const o of demoOwners) {
		const [owner] = await db.insert(owners).values(o).returning();
		await db
			.insert(membershipAccounts)
			.values({
				ownerId: owner.id,
				tier: o.tier,
				pointsBalance: o.tier === "platinum" ? 6000 : o.tier === "gold" ? 1500 : 200
			});
		await db.insert(pets).values([
			{
				ownerId: owner.id,
				name: o.firstName === "Olivia" ? "Rex" : o.firstName === "Budi" ? "Mochi" : o.firstName === "Siti" ? "Bella" : "Simba",
				species: "dog",
				breed: "Golden Retriever",
				weightKg: "28",
				lastVaccinationDate: "2026-01-10",
				vaccinationDueDate: "2027-01-10"
			},
			o.tier === "platinum" || o.tier === "gold"
				? { ownerId: owner.id, name: o.firstName === "Siti" ? "Milo" : "Luna", species: "cat", breed: "Persian Cat" }
				: undefined
		].filter(Boolean) as never[]);
	}

	const groomer = (await db.query.staff.findFirst({ where: (s, { eq }) => eq(s.email, "groom@petco.local") }))!;
	const caretaker = (await db.query.staff.findFirst({ where: (s, { eq }) => eq(s.email, "care@petco.local") }))!;
	const specialist = (await db.query.staff.findFirst({ where: (s, { eq }) => eq(s.email, "aqua@petco.local") }))!;
	const ownerOlivia = (await db.query.owners.findFirst({ where: (o, { eq }) => eq(o.email, "olivia@example.com") }))!;
	const ownerBudi = (await db.query.owners.findFirst({ where: (o, { eq }) => eq(o.email, "budi@example.com") }))!;
	const rex = (await db.query.pets.findFirst({ where: (p, { and, eq }) => and(eq(p.ownerId, ownerOlivia.id), eq(p.name, "Rex")) }))!;
	const mochi = (await db.query.pets.findFirst({ where: (p, { and, eq }) => and(eq(p.ownerId, ownerBudi.id), eq(p.name, "Mochi")) }))!;

	const bookingDate = startOfDay(addDays(new Date(), 1));
	const todayDate = startOfDay(new Date());

	// Grooming Booking (Kemang Branch)
	const [groomBooking] = await db
		.insert(bookings)
		.values({
			branchId: kemangBranch.id,
			kind: "grooming",
			ownerId: ownerOlivia.id,
			petId: rex.id,
			serviceId: fullGroom.id,
			staffId: groomer.id,
			status: "confirmed",
			startsAt: addMinutes(bookingDate, 9 * 60),
			endsAt: addMinutes(bookingDate, 9 * 60 + 90),
			priceCents: fullGroom.priceCents
		})
		.returning();

	// Grooming Cut Card
	await db.insert(groomingCutCards).values({
		petId: rex.id,
		bookingId: groomBooking.id,
		bladeLengthBody: "#7F (3.2mm) Teddy Cut",
		bladeLengthFace: "Scissor round face & clean muzzle",
		coatCondition: "Healthy, slight matting behind ears",
		behaviorScore: 5,
		skinIssues: "Sensitive underbelly, use oatmeal shampoo",
		staffId: groomer.id
	});

	// Hotel Booking (Kemang Branch)
	const [hotelBooking] = await db
		.insert(bookings)
		.values({
			branchId: kemangBranch.id,
			kind: "hotel",
			ownerId: ownerOlivia.id,
			petId: rex.id,
			roomId: standardSuite.id,
			status: "checked_in",
			startsAt: todayDate,
			endsAt: addDays(todayDate, 3),
			priceCents: standardSuite.pricePerNightCents * 3,
			depositCents: standardSuite.pricePerNightCents
		})
		.returning();

	await db.insert(stays).values({
		bookingId: hotelBooking.id,
		roomId: standardSuite.id,
		checkInDate: todayDate.toISOString().slice(0, 10),
		checkOutDate: addDays(todayDate, 3).toISOString().slice(0, 10),
		nightCount: 3,
		petCareJson: { feeding: "twice daily (08:00 & 18:00)", walksPerDay: 2, meds: "Glucosamine chew with breakfast" }
	});

	// Care Log for today
	await db.insert(dailyCareLogs).values({
		bookingId: hotelBooking.id,
		petId: rex.id,
		careDate: todayDate.toISOString().slice(0, 10),
		feedingAmDone: true,
		feedingPmDone: false,
		walkAmDone: true,
		walkPmDone: false,
		medicationDone: true,
		moodNotes: "Rex ate all his morning kibble happily. Very playful in the garden.",
		staffId: caretaker.id
	});

	// Product Categories & Retail Products
	const cats = await db
		.insert(productCategories)
		.values([
			{ name: "Pet Food & Nutrition", slug: "food", icon: "Utensils" },
			{ name: "Grooming & Shampoos", slug: "grooming", icon: "Sparkles" },
			{ name: "Aquarium & Fish Supplies", slug: "aquarium", icon: "Fish" },
			{ name: "Treats & Toys", slug: "treats", icon: "Gift" }
		])
		.returning();

	await db.insert(products).values([
		{ categoryId: cats[0].id, name: "Royal Canin Golden Retriever Adult (3kg)", sku: "RC-GR-3KG", priceCents: 385000, costCents: 310000, stockQty: 18, lowStockThreshold: 5, unit: "bag" },
		{ categoryId: cats[0].id, name: "Pro Plan Sensitive Skin & Stomach (2.5kg)", sku: "PP-SSS-25", priceCents: 320000, costCents: 260000, stockQty: 12, lowStockThreshold: 4, unit: "bag" },
		{ categoryId: cats[0].id, name: "Whiskas Ocean Fish Adult (1.2kg)", sku: "WH-FISH-12", priceCents: 78000, costCents: 60000, stockQty: 25, lowStockThreshold: 8, unit: "bag" },
		{ categoryId: cats[1].id, name: "Bio-Groom Oatmeal Soothing Shampoo (355ml)", sku: "BG-OAT-355", priceCents: 145000, costCents: 105000, stockQty: 8, lowStockThreshold: 3, unit: "bottle" },
		{ categoryId: cats[1].id, name: "TropiClean Flea & Tick Treatment Shampoo", sku: "TC-FT-590", priceCents: 195000, costCents: 140000, stockQty: 6, lowStockThreshold: 3, unit: "bottle" },
		{ categoryId: cats[2].id, name: "Hikari Micro Pellets Tropical Fish (45g)", sku: "HK-MP-45", priceCents: 45000, costCents: 30000, stockQty: 30, lowStockThreshold: 10, unit: "can" },
		{ categoryId: cats[2].id, name: "Seachem Prime Water Conditioner (250ml)", sku: "SC-PRIME-250", priceCents: 165000, costCents: 120000, stockQty: 14, lowStockThreshold: 5, unit: "bottle" },
		{ categoryId: cats[3].id, name: "Dental Chew Bones Multipack (6pcs)", sku: "DC-BONE-6P", priceCents: 55000, costCents: 35000, stockQty: 40, lowStockThreshold: 10, unit: "pack" }
	]);

	// Customer Tanks & Water Tests
	const [tankOlivia] = await db
		.insert(customerTanks)
		.values({
			branchId: kemangBranch.id,
			ownerId: ownerOlivia.id,
			name: "Living Room Reef Oasis",
			volumeLiters: 250,
			ecosystem: "reef",
			dimensions: "100x50x50 cm",
			filtrationType: "Sump with Nyos Skimmer",
			lightingType: "Radion XR15 G6 Pro LED",
			notes: "LPS and Soft Coral mixed reef. Clean weekly filter sock."
		})
		.returning();

	const [tankBudi] = await db
		.insert(customerTanks)
		.values({
			branchId: kemangBranch.id,
			ownerId: ownerBudi.id,
			name: "Office Nature Aquascape",
			volumeLiters: 120,
			ecosystem: "planted",
			dimensions: "90x45x45 cm",
			filtrationType: "Oase Biomaster 350 External Canister",
			lightingType: "Chihiros WRGB II Pro",
			notes: "High tech planted tank with pressurized CO2 (2 bps)."
		})
		.returning();

	await db.insert(waterParameterLogs).values({
		tankId: tankOlivia.id,
		ph: "8.20",
		salinityPpt: "35.00",
		temperatureC: "25.5",
		nitratePpm: "5.00",
		ammoniaPpm: "0.00",
		nitritePpm: "0.00",
		khDkh: "8.5",
		notes: "Parameters stable. Performed 20% RO water change and skimmer cup cleaning.",
		staffId: specialist.id
	});

	await db.insert(aquariumServicePlans).values({
		ownerId: ownerOlivia.id,
		tankId: tankOlivia.id,
		planName: "Monthly Reef Bi-Weekly Maintenance Plan",
		frequency: "biweekly",
		pricePerVisitCents: 250000,
		active: true,
		nextScheduledDate: addDays(todayDate, 7).toISOString().slice(0, 10),
		notes: "Includes water testing, glass scraping, filter sock swap, coral nutrition."
	});

	console.log(`Seeded multi-branch ecosystem (HO + 4 Child Branches, Store Settings, CRM, Hotel, Aquarium, Shop). Login: admin@petco.local / admin123`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => process.exit(0));
