import { db } from "$lib/server/db";
import { owners, pets, services, rooms, staff, customerTanks, bookingAddons } from "$lib/server/db/schema";
import { eq, asc, inArray } from "drizzle-orm";
import { requireUser } from "$lib/server/auth";
import { freeGroomingSlots } from "$lib/server/slots";
import { createBooking, BookingConflictError } from "$lib/server/booking-service";
import { VaccineGateError } from "$lib/server/vaccine-gate";
import { parseISO, startOfDay } from "date-fns";
import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
	requireUser(locals);
	const ownerParam = Number(url.searchParams.get("owner") ?? 0) || null;
	const kind = (url.searchParams.get("kind") ?? "grooming") as "grooming" | "hotel" | "aquarium";
	const dateParam = url.searchParams.get("date");
	const staffParam = Number(url.searchParams.get("staff") ?? 0) || null;
	const serviceParam = Number(url.searchParams.get("service") ?? 0) || null;

	const [ownersList, servicesList, roomsList, staffList, allPets, allTanks] = await Promise.all([
		db.select().from(owners).orderBy(asc(owners.lastName)).limit(300),
		db.select().from(services).where(eq(services.active, true)),
		db.select().from(rooms).where(eq(rooms.active, true)),
		db.select().from(staff).where(eq(staff.active, true)),
		db.select().from(pets).orderBy(asc(pets.name)),
		db.select().from(customerTanks).orderBy(asc(customerTanks.name))
	]);

	let preselectOwner = null;
	let preselectPets = [] as { id: number; name: string }[];
	let availableSlots: { start: Date; end: Date }[] = [];
	let selectedService = null;
	let selectedStaff = null;
	let selectedRoom = null;

	if (ownerParam) {
		preselectOwner = await db.query.owners.findFirst({ where: eq(owners.id, ownerParam) });
	}

	if (kind === "grooming" && staffParam && serviceParam && dateParam) {
		selectedStaff = staffList.find((s) => s.id === staffParam) ?? null;
		selectedService = servicesList.find((s) => s.id === serviceParam) ?? null;
		const day = startOfDay(parseISO(dateParam));
		if (selectedService?.durationMinutes) {
			availableSlots = await freeGroomingSlots({
				staffId: staffParam,
				durationMin: selectedService.durationMinutes,
				day
			});
		}
	}

	if (kind === "hotel" && Number(url.searchParams.get("room") ?? 0)) {
		const roomParam = Number(url.searchParams.get("room"));
		selectedRoom = roomsList.find((r) => r.id === roomParam) ?? null;
	}

	return {
		owners: ownersList,
		pets: allPets,
		tanks: allTanks,
		services: servicesList,
		rooms: roomsList,
		staff: staffList,
		kind,
		preselectOwner,
		preselectPets,
		preselectOwnerId: ownerParam,
		preselectStaffId: staffParam,
		preselectServiceId: serviceParam,
		preselectDate: dateParam,
		preselectRoomId: Number(url.searchParams.get("room") ?? 0) || null,
		selectedService,
		selectedStaff,
		selectedRoom,
		availableSlots
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const staffUser = requireUser(locals);
		const form = await request.formData();
		const kind = form.get("kind") as "grooming" | "hotel" | "aquarium";
		const ownerId = Number(form.get("ownerId"));
		const petId = Number(form.get("petId") || 0);
		const notes = (form.get("notes") as string | null) || undefined;

		if (!ownerId) {
			return fail(400, { createError: "Please select an owner / client." });
		}

		try {
			if (kind === "grooming") {
				if (!petId) return fail(400, { createError: "Please select a pet for grooming." });
				const serviceId = Number(form.get("serviceId"));
				const staffId = Number(form.get("staffId"));
				const slotISO = form.get("slotISO") as string;
				const addonIds = form.getAll("addonIds").map((id) => Number(id)).filter(Boolean);

				if (!serviceId || !staffId || !slotISO) {
					return fail(400, { createError: "Service, groomer, and slot are required." });
				}

				const service = await db.query.services.findFirst({ where: eq(services.id, serviceId) });
				if (!service) return fail(400, { createError: "Selected service not found." });

				let totalPrice = service.priceCents;
				let totalDuration = service.durationMinutes ?? 60;

				let selectedAddons: typeof services.$inferSelect[] = [];
				if (addonIds.length > 0) {
					selectedAddons = await db.select().from(services).where(inArray(services.id, addonIds));
					for (const a of selectedAddons) {
						totalPrice += a.priceCents;
						totalDuration += (a.durationMinutes ?? 15);
					}
				}

				const startsAt = new Date(slotISO);
				const endsAt = new Date(startsAt.getTime() + totalDuration * 60 * 1000);

				const booking = await createBooking(
					{
						kind: "grooming",
						ownerId,
						petId,
						serviceId,
						staffId,
						startsAt,
						endsAt,
						priceCents: totalPrice,
						notes
					},
					staffUser.id
				);

				// Insert booking add-ons if selected
				if (selectedAddons.length > 0) {
					for (const a of selectedAddons) {
						await db.insert(bookingAddons).values({
							bookingId: booking.id,
							serviceId: a.id,
							name: a.name,
							priceCents: a.priceCents,
							durationMinutes: a.durationMinutes ?? 15
						});
					}
				}

				throw redirect(303, `/bookings/${booking.id}`);
			} else if (kind === "hotel") {
				if (!petId) return fail(400, { createError: "Please select a pet for boarding." });
				const roomId = Number(form.get("roomId"));
				const checkInDate = form.get("checkInDate") as string;
				const checkOutDate = form.get("checkOutDate") as string;
				const extraWalk = form.get("extraWalk") === "on";
				const playtime = form.get("playtime") === "on";
				const bathPickup = form.get("bathPickup") === "on";

				if (!roomId || !checkInDate || !checkOutDate) {
					return fail(400, { createError: "Room, check-in, and check-out dates are required." });
				}

				const room = await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
				if (!room) return fail(400, { createError: "Selected room not found." });

				const startsAt = new Date(`${checkInDate}T14:00:00`);
				const endsAt = new Date(`${checkOutDate}T11:00:00`);
				const nights = Math.max(1, Math.round((Number(endsAt) - Number(startsAt)) / 864e5));

				let extraCents = 0;
				if (extraWalk) extraCents += 35000 * nights;
				if (playtime) extraCents += 40000 * nights;
				if (bathPickup) extraCents += 95000;

				const priceCents = nights * room.pricePerNightCents + extraCents;

				const booking = await createBooking(
					{
						kind: "hotel",
						ownerId,
						petId,
						roomId,
						startsAt,
						endsAt,
						priceCents,
						notes
					},
					staffUser.id
				);

				throw redirect(303, `/bookings/${booking.id}`);
			} else if (kind === "aquarium") {
				const serviceId = Number(form.get("serviceId"));
				const staffId = Number(form.get("staffId") || 0) || null;
				const dateStr = form.get("appointmentDate") as string;
				const timeStr = form.get("appointmentTime") as string || "09:00";

				if (!serviceId || !dateStr) {
					return fail(400, { createError: "Service and appointment date are required." });
				}

				const service = await db.query.services.findFirst({ where: eq(services.id, serviceId) });
				if (!service) return fail(400, { createError: "Selected aquarium service not found." });

				const startsAt = new Date(`${dateStr}T${timeStr}:00`);
				const duration = service.durationMinutes ?? 60;
				const endsAt = new Date(startsAt.getTime() + duration * 60 * 1000);

				const booking = await createBooking(
					{
						kind: "aquarium",
						ownerId,
						serviceId,
						staffId,
						startsAt,
						endsAt,
						priceCents: service.priceCents,
						notes
					},
					staffUser.id
				);

				throw redirect(303, `/bookings/${booking.id}`);
			}
		} catch (err) {
			if (err && typeof err === "object" && "status" in err && (err as { status: number }).status === 303) {
				throw err;
			}
			if (err instanceof VaccineGateError) {
				return fail(400, { createError: `Vaccine policy block: ${err.message}` });
			}
			if (err instanceof BookingConflictError) {
				return fail(400, { createError: `Schedule conflict: ${err.message}` });
			}
			const msg = err instanceof Error ? err.message : "Failed to create booking";
			return fail(400, { createError: msg });
		}
	}
};
