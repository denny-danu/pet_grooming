import { db } from "$lib/server/db";
import { groomingCutCards, pets, owners, staff, bookings, services } from "$lib/server/db/schema";
import { desc, eq, asc, sql } from "drizzle-orm";
import { requireUser } from "$lib/server/auth";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);

	// Fetch all grooming cut cards with joined pet, owner, staff, and booking info
	const cutCards = await db
		.select({
			id: groomingCutCards.id,
			petId: groomingCutCards.petId,
			bookingId: groomingCutCards.bookingId,
			bladeLengthBody: groomingCutCards.bladeLengthBody,
			bladeLengthFace: groomingCutCards.bladeLengthFace,
			scissorNotes: groomingCutCards.scissorNotes,
			coatCondition: groomingCutCards.coatCondition,
			behaviorScore: groomingCutCards.behaviorScore,
			skinIssues: groomingCutCards.skinIssues,
			photosJson: groomingCutCards.photosJson,
			staffId: groomingCutCards.staffId,
			createdAt: groomingCutCards.createdAt,
			petName: pets.name,
			petSpecies: pets.species,
			petBreed: pets.breed,
			petWeightKg: pets.weightKg,
			petAggressive: pets.aggressive,
			petAllergies: pets.allergies,
			petBehaviorNotes: pets.behaviorNotes,
			ownerId: owners.id,
			ownerFirstName: owners.firstName,
			ownerLastName: owners.lastName,
			ownerPhone: owners.phone,
			ownerEmail: owners.email,
			staffName: staff.name,
			staffRole: staff.role,
			staffSpecialty: staff.specialty,
			bookingStartsAt: bookings.startsAt,
			bookingStatus: bookings.status
		})
		.from(groomingCutCards)
		.innerJoin(pets, eq(groomingCutCards.petId, pets.id))
		.innerJoin(owners, eq(pets.ownerId, owners.id))
		.leftJoin(staff, eq(groomingCutCards.staffId, staff.id))
		.leftJoin(bookings, eq(groomingCutCards.bookingId, bookings.id))
		.orderBy(desc(groomingCutCards.createdAt));

	// Fetch all grooming add-ons / services
	const groomingServices = await db
		.select()
		.from(services)
		.where(eq(services.kind, "grooming"))
		.orderBy(asc(services.priceCents));

	// Fetch list of pets for modal select dropdown
	const petsList = await db
		.select({
			id: pets.id,
			name: pets.name,
			species: pets.species,
			breed: pets.breed,
			ownerId: owners.id,
			ownerFirstName: owners.firstName,
			ownerLastName: owners.lastName,
			ownerPhone: owners.phone
		})
		.from(pets)
		.innerJoin(owners, eq(pets.ownerId, owners.id))
		.orderBy(asc(pets.name));

	// Fetch list of active groomers/staff
	const staffList = await db
		.select({
			id: staff.id,
			name: staff.name,
			role: staff.role,
			specialty: staff.specialty
		})
		.from(staff)
		.where(eq(staff.active, true))
		.orderBy(asc(staff.name));

	// Metrics
	const totalCutCards = cutCards.length;
	const behaviorScores = cutCards
		.map((c) => c.behaviorScore)
		.filter((s): s is number => typeof s === "number");
	const avgBehaviorScore =
		behaviorScores.length > 0
			? Number((behaviorScores.reduce((a, b) => a + b, 0) / behaviorScores.length).toFixed(1))
			: 5.0;

	const activeGroomersCount = staffList.filter(
		(s) => s.role === "groomer" || s.specialty?.toLowerCase().includes("groom")
	).length;
	const addonsCount = groomingServices.filter((s) => s.active).length;

	return {
		user,
		cutCards,
		groomingServices,
		petsList,
		staffList,
		totalCutCards,
		avgBehaviorScore,
		activeGroomersCount,
		addonsCount
	};
};

export const actions: Actions = {
	saveCutCard: async ({ request, locals }) => {
		requireUser(locals);
		const form = await request.formData();
		const id = form.get("id") ? Number(form.get("id")) : null;
		const petId = Number(form.get("petId"));
		const staffId = form.get("staffId") ? Number(form.get("staffId")) : null;
		const bookingId = form.get("bookingId") ? Number(form.get("bookingId")) : null;
		const bladeLengthBody = String(form.get("bladeLengthBody") ?? "").trim() || null;
		const bladeLengthFace = String(form.get("bladeLengthFace") ?? "").trim() || null;
		const scissorNotes = String(form.get("scissorNotes") ?? "").trim() || null;
		const coatCondition = String(form.get("coatCondition") ?? "").trim() || null;
		const behaviorScore = Math.min(5, Math.max(1, Number(form.get("behaviorScore") ?? 5)));
		const skinIssues = String(form.get("skinIssues") ?? "").trim() || null;

		if (!petId || isNaN(petId)) {
			return fail(400, { saveCutCardError: "Please select a pet." });
		}

		if (id && !isNaN(id)) {
			await db
				.update(groomingCutCards)
				.set({
					petId,
					staffId,
					bookingId,
					bladeLengthBody,
					bladeLengthFace,
					scissorNotes,
					coatCondition,
					behaviorScore,
					skinIssues
				})
				.where(eq(groomingCutCards.id, id));

			return { success: true, updated: true };
		} else {
			await db.insert(groomingCutCards).values({
				petId,
				staffId,
				bookingId,
				bladeLengthBody,
				bladeLengthFace,
				scissorNotes,
				coatCondition,
				behaviorScore,
				skinIssues
			});

			return { success: true, created: true };
		}
	},

	createAddon: async ({ request, locals }) => {
		requireUser(locals);
		const form = await request.formData();
		const name = String(form.get("name") ?? "").trim();
		const durationMinutes = Number(form.get("durationMinutes") ?? 15);
		const priceCents = Number(form.get("priceCents") ?? 0);
		const requiresStaffSkill = String(form.get("requiresStaffSkill") ?? "").trim() || null;

		if (!name) {
			return fail(400, { createAddonError: "Service name is required." });
		}

		if (isNaN(priceCents) || priceCents < 0) {
			return fail(400, { createAddonError: "Valid price is required." });
		}

		await db.insert(services).values({
			kind: "grooming",
			name,
			durationMinutes: isNaN(durationMinutes) ? 15 : durationMinutes,
			priceCents,
			active: true,
			requiresStaffSkill
		});
		return { success: true, addonCreated: true };
	},

	deleteCutCard: async ({ request, locals }) => {
		requireUser(locals);
		const form = await request.formData();
		const id = Number(form.get("id"));

		if (!id || isNaN(id)) {
			return fail(400, { deleteError: "Invalid cut card ID." });
		}

		await db.delete(groomingCutCards).where(eq(groomingCutCards.id, id));
		return { success: true, deleted: true };
	}
};
