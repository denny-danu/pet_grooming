import { db } from "$lib/server/db";
import {
	branches,
	services,
	rooms,
	staff,
	owners,
	pets,
	bookings,
	stays,
	bookingAddons
} from "$lib/server/db/schema";
import { eq, and, desc, ilike, or, inArray, asc } from "drizzle-orm";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
	const lookupParam = url.searchParams.get("lookup")?.trim() || "";
	const branchParam = Number(url.searchParams.get("branch") ?? 0) || null;
	const kindParam = (url.searchParams.get("kind") ?? "grooming") as "grooming" | "hotel" | "aquarium";

	const [activeBranches, activeServices, activeRooms, activeStaff] = await Promise.all([
		db
			.select({
				id: branches.id,
				name: branches.name,
				code: branches.code,
				city: branches.city,
				address: branches.address,
				phone: branches.phone,
				isHeadOffice: branches.isHeadOffice
			})
			.from(branches)
			.where(eq(branches.active, true))
			.orderBy(branches.isHeadOffice ? asc(branches.id) : asc(branches.name)),
		db
			.select({
				id: services.id,
				name: services.name,
				kind: services.kind,
				durationMinutes: services.durationMinutes,
				priceCents: services.priceCents,
				requiresStaffSkill: services.requiresStaffSkill
			})
			.from(services)
			.where(eq(services.active, true))
			.orderBy(asc(services.priceCents)),
		db
			.select({
				id: rooms.id,
				branchId: rooms.branchId,
				name: rooms.name,
				sizeLabel: rooms.sizeLabel,
				maxPetWeightKg: rooms.maxPetWeightKg,
				capacity: rooms.capacity,
				pricePerNightCents: rooms.pricePerNightCents
			})
			.from(rooms)
			.where(eq(rooms.active, true))
			.orderBy(asc(rooms.pricePerNightCents)),
		db
			.select({
				id: staff.id,
				name: staff.name,
				role: staff.role,
				specialty: staff.specialty,
				branchId: staff.branchId
			})
			.from(staff)
			.where(eq(staff.active, true))
	]);

	// Customer Booking Database / Lookup Results
	let lookupResults: Array<{
		id: number;
		bookingCode: string;
		kind: "grooming" | "hotel" | "aquarium";
		status: string;
		startsAt: Date;
		endsAt: Date;
		priceCents: number;
		depositCents: number;
		notes: string | null;
		createdAt: Date;
		branchName: string | null;
		branchCity: string | null;
		ownerName: string;
		ownerPhone: string;
		petName: string | null;
		petSpecies: string | null;
		serviceName: string | null;
		roomName: string | null;
	}> = [];

	if (lookupParam) {
		const isBookingCode = /^PET-?\d+$/i.test(lookupParam);
		const numericId = isBookingCode ? Number(lookupParam.replace(/\D/g, "")) : Number(lookupParam) || null;

		let ownerIds: number[] = [];
		if (!numericId) {
			const matchingOwners = await db
				.select({ id: owners.id })
				.from(owners)
				.where(or(ilike(owners.phone, `%${lookupParam}%`), ilike(owners.email, `%${lookupParam}%`)));
			ownerIds = matchingOwners.map((o) => o.id);
		}

		const bookingConditions = [];
		if (numericId) {
			bookingConditions.push(eq(bookings.id, numericId));
		}
		if (ownerIds.length > 0) {
			bookingConditions.push(inArray(bookings.ownerId, ownerIds));
		}

		if (bookingConditions.length > 0) {
			const foundBookings = await db
				.select({
					id: bookings.id,
					kind: bookings.kind,
					status: bookings.status,
					startsAt: bookings.startsAt,
					endsAt: bookings.endsAt,
					priceCents: bookings.priceCents,
					depositCents: bookings.depositCents,
					notes: bookings.notes,
					createdAt: bookings.createdAt,
					branchName: branches.name,
					branchCity: branches.city,
					ownerFirstName: owners.firstName,
					ownerLastName: owners.lastName,
					ownerPhone: owners.phone,
					petName: pets.name,
					petSpecies: pets.species,
					serviceName: services.name,
					roomName: rooms.name
				})
				.from(bookings)
				.leftJoin(branches, eq(bookings.branchId, branches.id))
				.leftJoin(owners, eq(bookings.ownerId, owners.id))
				.leftJoin(pets, eq(bookings.petId, pets.id))
				.leftJoin(services, eq(bookings.serviceId, services.id))
				.leftJoin(rooms, eq(bookings.roomId, rooms.id))
				.where(or(...bookingConditions))
				.orderBy(desc(bookings.startsAt))
				.limit(20);

			lookupResults = foundBookings.map((b) => ({
				id: b.id,
				bookingCode: `PET-${String(b.id).padStart(5, "0")}`,
				kind: b.kind as "grooming" | "hotel" | "aquarium",
				status: b.status,
				startsAt: b.startsAt,
				endsAt: b.endsAt,
				priceCents: b.priceCents,
				depositCents: b.depositCents,
				notes: b.notes,
				createdAt: b.createdAt,
				branchName: b.branchName,
				branchCity: b.branchCity,
				ownerName: `${b.ownerFirstName} ${b.ownerLastName}`.trim(),
				ownerPhone: b.ownerPhone ?? "",
				petName: b.petName,
				petSpecies: b.petSpecies,
				serviceName: b.serviceName,
				roomName: b.roomName
			}));
		}
	}

	return {
		branches: activeBranches,
		services: activeServices,
		rooms: activeRooms,
		staff: activeStaff,
		initialKind: kindParam,
		initialBranchId: branchParam,
		lookupParam,
		lookupResults
	};
};

export const actions: Actions = {
	book: async ({ request }) => {
		const form = await request.formData();

		// Customer / Owner Information
		const firstName = String(form.get("firstName") ?? "").trim();
		const lastName = String(form.get("lastName") ?? "").trim();
		const phone = String(form.get("phone") ?? "").trim();
		const email = String(form.get("email") ?? "").trim();
		const address = String(form.get("address") ?? "").trim();

		// Pet Information
		const petName = String(form.get("petName") ?? "").trim();
		const species = (String(form.get("species") ?? "dog").toLowerCase() || "dog") as
			| "dog"
			| "cat"
			| "bird"
			| "reptile"
			| "fish"
			| "other";
		const breed = String(form.get("breed") ?? "").trim();
		const weightKg = Number(form.get("weightKg")) || null;
		const healthNotes = String(form.get("healthNotes") ?? "").trim();

		// Service Information
		const kind = (String(form.get("kind") ?? "grooming").toLowerCase() || "grooming") as
			| "grooming"
			| "hotel"
			| "aquarium";
		const branchId = Number(form.get("branchId")) || null;
		const serviceId = Number(form.get("serviceId")) || null;
		const roomId = Number(form.get("roomId")) || null;
		const staffId = Number(form.get("staffId")) || null;
		const dateStr = String(form.get("date") ?? "").trim();
		const timeSlot = String(form.get("timeSlot") ?? "10:00").trim();
		const checkInDate = String(form.get("checkInDate") ?? "").trim();
		const checkOutDate = String(form.get("checkOutDate") ?? "").trim();
		const notes = String(form.get("notes") ?? "").trim();
		const addonIds = form.getAll("addonIds").map((id) => Number(id)).filter(Boolean);

		// Validation
		if (!firstName || !phone) {
			return fail(400, { error: "Please enter your name and phone number." });
		}
		if (!petName && kind !== "aquarium") {
			return fail(400, { error: "Please enter your pet's name." });
		}
		if (!branchId) {
			return fail(400, { error: "Please select a branch location." });
		}

		try {
			// 1. Find or create Owner
			let owner = await db.query.owners.findFirst({
				where: eq(owners.phone, phone)
			});

			if (!owner) {
				const [newOwner] = await db
					.insert(owners)
					.values({
						branchId,
						firstName,
						lastName: lastName || firstName,
						phone,
						email: email || null,
						address: address || null
					})
					.returning();
				owner = newOwner;
			} else {
				// Update email or branch if newly provided
				if (email && !owner.email) {
					await db.update(owners).set({ email }).where(eq(owners.id, owner.id));
				}
			}

			// 2. Find or create Pet
			let pet = null;
			if (petName) {
				pet = await db.query.pets.findFirst({
					where: and(eq(pets.ownerId, owner.id), ilike(pets.name, petName))
				});

				if (!pet) {
					const [newPet] = await db
						.insert(pets)
						.values({
							ownerId: owner.id,
							name: petName,
							species,
							breed: breed || null,
							weightKg: weightKg ? String(weightKg) : null,
							healthNotes: healthNotes || null
						})
						.returning();
					pet = newPet;
				}
			}

			// 3. Compute Schedule & Pricing
			let startsAt: Date;
			let endsAt: Date;
			let totalPriceCents = 0;
			let calculatedServiceId = serviceId;
			let calculatedRoomId = roomId;

			if (kind === "grooming") {
				if (!dateStr) return fail(400, { error: "Please select an appointment date." });
				const service = serviceId
					? await db.query.services.findFirst({ where: eq(services.id, serviceId) })
					: null;
				if (!service) return fail(400, { error: "Please select a grooming service." });

				totalPriceCents = service.priceCents;
				let totalDurationMinutes = service.durationMinutes || 60;

				if (addonIds.length > 0) {
					const selectedAddons = await db
						.select()
						.from(services)
						.where(inArray(services.id, addonIds));
					for (const a of selectedAddons) {
						totalPriceCents += a.priceCents;
						totalDurationMinutes += a.durationMinutes || 15;
					}
				}

				const [hours, minutes] = timeSlot.split(":").map(Number);
				const baseDate = new Date(dateStr);
				baseDate.setHours(hours || 10, minutes || 0, 0, 0);
				startsAt = baseDate;
				endsAt = new Date(startsAt.getTime() + totalDurationMinutes * 60 * 1000);
			} else if (kind === "hotel") {
				if (!checkInDate || !checkOutDate) {
					return fail(400, { error: "Please select check-in and check-out dates." });
				}
				const selectedRoom = roomId
					? await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) })
					: null;
				if (!selectedRoom) return fail(400, { error: "Please select a hotel suite." });

				const startD = new Date(checkInDate);
				startD.setHours(12, 0, 0, 0);
				const endD = new Date(checkOutDate);
				endD.setHours(12, 0, 0, 0);

				if (endD <= startD) {
					return fail(400, { error: "Check-out date must be after check-in date." });
				}

				const nights = Math.max(1, Math.round((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)));
				totalPriceCents = selectedRoom.pricePerNightCents * nights;
				startsAt = startD;
				endsAt = endD;
			} else {
				// Aquarium
				if (!dateStr) return fail(400, { error: "Please select a service date." });
				const service = serviceId
					? await db.query.services.findFirst({ where: eq(services.id, serviceId) })
					: null;
				totalPriceCents = service?.priceCents || 150000;
				const [hours, minutes] = timeSlot.split(":").map(Number);
				const baseDate = new Date(dateStr);
				baseDate.setHours(hours || 10, minutes || 0, 0, 0);
				startsAt = baseDate;
				endsAt = new Date(startsAt.getTime() + (service?.durationMinutes || 60) * 60 * 1000);
			}

			// 4. Determine Assigned Staff (or choose first active staff at branch)
			let assignedStaffId = staffId;
			if (!assignedStaffId) {
				const availableStaff = await db.query.staff.findFirst({
					where: and(eq(staff.active, true), eq(staff.branchId, branchId))
				});
				assignedStaffId = availableStaff?.id ?? null;
			}

			// 5. Create Booking in Database
			const depositCents = Math.round(totalPriceCents * 0.2); // 20% deposit estimate

			const [booking] = await db
				.insert(bookings)
				.values({
					branchId,
					kind,
					ownerId: owner.id,
					petId: pet?.id ?? null,
					serviceId: calculatedServiceId,
					roomId: calculatedRoomId,
					staffId: assignedStaffId,
					status: "pending",
					startsAt,
					endsAt,
					priceCents: totalPriceCents,
					depositCents,
					notes: notes ? `[Online Website Booking] ${notes}` : "[Online Website Booking]"
				})
				.returning();

			// 6. Record Add-ons or Hotel Stay
			if (kind === "grooming" && addonIds.length > 0) {
				for (const addonId of addonIds) {
					const addonSvc = await db.query.services.findFirst({ where: eq(services.id, addonId) });
					if (addonSvc) {
						await db.insert(bookingAddons).values({
							bookingId: booking.id,
							serviceId: addonId,
							name: addonSvc.name,
							priceCents: addonSvc.priceCents,
							durationMinutes: addonSvc.durationMinutes || 0
						});
					}
				}
			}

			if (kind === "hotel" && calculatedRoomId) {
				const nights = Math.max(1, Math.round((endsAt.getTime() - startsAt.getTime()) / (1000 * 60 * 60 * 24)));
				await db.insert(stays).values({
					bookingId: booking.id,
					roomId: calculatedRoomId,
					checkInDate: checkInDate,
					checkOutDate: checkOutDate,
					nightCount: nights,
					petCareJson: {
						petName: pet?.name ?? petName,
						species: pet?.species ?? species,
						healthNotes: healthNotes || null,
						specialNotes: notes || null
					}
				});
			}

			// Fetch branch details for confirmation
			const branch = await db.query.branches.findFirst({ where: eq(branches.id, branchId) });
			const service = calculatedServiceId
				? await db.query.services.findFirst({ where: eq(services.id, calculatedServiceId) })
				: null;
			const room = calculatedRoomId
				? await db.query.rooms.findFirst({ where: eq(rooms.id, calculatedRoomId) })
				: null;

			const bookingCode = `PET-${String(booking.id).padStart(5, "0")}`;

			return {
				success: true,
				booking: {
					id: booking.id,
					bookingCode,
					kind: booking.kind,
					status: booking.status,
					startsAt: booking.startsAt.toISOString(),
					endsAt: booking.endsAt.toISOString(),
					priceCents: booking.priceCents,
					depositCents: booking.depositCents,
					ownerName: `${owner.firstName} ${owner.lastName}`.trim(),
					ownerPhone: owner.phone,
					ownerEmail: owner.email,
					petName: pet?.name ?? petName ?? "Pet",
					petSpecies: pet?.species ?? species,
					serviceName: service?.name ?? (kind === "hotel" ? room?.name : "General Service"),
					branchName: branch?.name ?? "PetCo Branch",
					branchAddress: branch?.address ?? "",
					branchPhone: branch?.phone ?? ""
				}
			};
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Failed to process booking reservation.";
			return fail(500, { error: message });
		}
	}
};
