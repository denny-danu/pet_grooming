import { db } from "../src/lib/server/db";
import {
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
	auditLogs
} from "../src/lib/server/db/schema";
import { bcryptHash } from "../src/lib/server/auth";
import { addMinutes, addDays, startOfDay } from "date-fns";

async function main() {
	await db.delete(notifications);
	await db.delete(ledgerEntries);
	await db.delete(auditLogs);
	await db.delete(packagePurchases);
	await db.delete(bookings);
	await db.delete(packages);
	await db.delete(membershipAccounts);
	await db.delete(membershipTiers);
	await db.delete(rooms);
	await db.delete(services);
	await db.delete(pets);
	await db.delete(staff);
	await db.delete(owners);

	const [admin] = await db
		.insert(staff)
		.values({
			email: "admin@petco.local",
			passwordHash: await bcryptHash("admin123"),
			name: "Ada Admin",
			role: "admin"
		})
		.returning();

	await db.insert(staff).values([
		{ email: "mana@petco.local", passwordHash: await bcryptHash("admin123"), name: "Manny Manager", role: "manager" },
		{ email: "rec@petco.local", passwordHash: await bcryptHash("admin123"), name: "Reena Reception", role: "receptionist" },
		{ email: "groom@petco.local", passwordHash: await bcryptHash("admin123"), name: "Grace Groomer", role: "groomer", specialty: "full-groom" },
		{ email: "care@petco.local", passwordHash: await bcryptHash("admin123"), name: "Carl Caretaker", role: "caretaker" }
	]);

	const svc = await db
		.insert(services)
		.values([
			{ kind: "grooming", name: "Full Groom", durationMinutes: 90, priceCents: 6500, requiresStaffSkill: "full-groom" },
			{ kind: "grooming", name: "Bath & Brush", durationMinutes: 45, priceCents: 3500, requiresStaffSkill: "bath" },
			{ kind: "grooming", name: "Nail Trim", durationMinutes: 15, priceCents: 1500 },
			{ kind: "aquarium", name: "Tank Maintenance Visit", durationMinutes: 60, priceCents: 8000 }
		])
		.returning();
	const [fullGroom, bathBrush, nailTrim] = svc;

	const roomList = await db
		.insert(rooms)
		.values([
			{ name: "Small Suite", sizeLabel: "S", maxPetWeightKg: "10", pricePerNightCents: 3000 },
			{ name: "Standard Suite", sizeLabel: "M", maxPetWeightKg: "25", pricePerNightCents: 4500 },
			{ name: "Large Suite", sizeLabel: "L", maxPetWeightKg: "50", pricePerNightCents: 6500 },
			{ name: "Cat Condo", sizeLabel: "C", pricePerNightCents: 2800 }
		])
		.returning();
	const [smallSuite, standardSuite, largeSuite, catCondo] = roomList;

	await db.insert(membershipTiers).values([
		{ name: "silver", minPoints: 0, pointsPerCentSpend: 1 },
		{ name: "gold", minPoints: 1000, pointsPerCentSpend: 2, discountPercent: 5 },
		{ name: "platinum", minPoints: 5000, pointsPerCentSpend: 3, discountPercent: 10 }
	]);

	await db.insert(packages).values([
		{ name: "5x Full Groom Pack", kind: "grooming", credits: 5, priceCents: 30000 },
		{ name: "10 Night Hotel Pass", kind: "hotel", credits: 10, priceCents: 40000 }
	]);

	const demoOwners: { firstName: string; lastName: string; email: string; phone: string; tier: string }[] = [
		{ firstName: "Olivia", lastName: "Baker", email: "olivia@example.com", phone: "+15551234001", tier: "silver" },
		{ firstName: "Liam", lastName: "Chen", email: "liam@example.com", phone: "+15551234002", tier: "gold" },
		{ firstName: "Sofia", lastName: "Garcia", email: "sofia@example.com", phone: "+15551234003", tier: "platinum" },
		{ firstName: "Noah", lastName: "Patel", email: "noah@example.com", phone: "+15551234004", tier: "silver" }
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
				name: o.firstName === "Olivia" ? "Rex" : o.firstName === "Liam" ? "Mochi" : o.firstName === "Sofia" ? "Bella" : "Simba",
				species: "dog",
				breed: "Labrador",
				weightKg: "28",
				lastVaccinationDate: "2026-01-10",
				vaccinationDueDate: "2027-01-10"
			},
			o.tier === "platinum" || o.tier === "gold"
				? { ownerId: owner.id, name: o.firstName === "Sofia" ? "Milo" : "Luna", species: "cat", breed: "Siamese" }
				: undefined
		].filter(Boolean) as never[]);
	}

	const groomer = (await db.query.staff.findFirst({ where: (s, { eq }) => eq(s.email, "groom@petco.local") }))!;
	const ownerOlivia = (await db.query.owners.findFirst({ where: (o, { eq }) => eq(o.email, "olivia@example.com") }))!;
	const rex = (await db.query.pets.findFirst({ where: (p, { and, eq }) => and(eq(p.ownerId, ownerOlivia.id), eq(p.name, "Rex")) }))!;
	const bookingDate = startOfDay(addDays(new Date(), 1));

	await db.insert(bookings).values({
		kind: "grooming",
		ownerId: ownerOlivia.id,
		petId: rex.id,
		serviceId: fullGroom.id,
		staffId: groomer.id,
		status: "confirmed",
		startsAt: addMinutes(bookingDate, 9 * 60),
		endsAt: addMinutes(bookingDate, 9 * 60 + 90),
		priceCents: fullGroom.priceCents
	});

	const [hotelBooking] = await db
		.insert(bookings)
		.values({
			kind: "hotel",
			ownerId: ownerOlivia.id,
			petId: rex.id,
			roomId: smallSuite.id,
			status: "pending",
			startsAt: addDays(bookingDate, 3),
			endsAt: addDays(bookingDate, 5),
			priceCents: smallSuite.pricePerNightCents * 2,
			depositCents: smallSuite.pricePerNightCents
		})
		.returning();

	await db.insert(stays).values({
		bookingId: hotelBooking.id,
		roomId: smallSuite.id,
		checkInDate: addDays(bookingDate, 3).toISOString().slice(0, 10),
		checkOutDate: addDays(bookingDate, 5).toISOString().slice(0, 10),
		nightCount: 2,
		petCareJson: { feeding: "twice daily", walksPerDay: 2 }
	});

	console.log(`Seeded. login: admin@petco.local / admin123`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => process.exit(0));
