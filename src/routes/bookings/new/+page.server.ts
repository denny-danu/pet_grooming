import { db } from "$lib/server/db";
import { owners, pets, services, rooms, staff } from "$lib/server/db/schema";
import { eq, asc } from "drizzle-orm";
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
	const kind = (url.searchParams.get("kind") ?? "grooming") as "grooming" | "hotel";
	const dateParam = url.searchParams.get("date");
	const staffParam = Number(url.searchParams.get("staff") ?? 0) || null;
	const serviceParam = Number(url.searchParams.get("service") ?? 0) || null;

	const [ownersList, servicesList, roomsList, staffList, allPets] = await Promise.all([
		db.select().from(owners).orderBy(asc(owners.lastName)).limit(300),
		db.select().from(services).where(eq(services.active, true)),
		db.select().from(rooms).where(eq(rooms.active, true)),
		db.select().from(staff).where(eq(staff.active, true)),
		db.query.pets.findMany({ columns: { id: true, ownerId: true, name: true, species: true } })
	]);

	let preselectOwner = null;
	let preselectPets = [] as { id: number; name: string }[];
	let availableSlots: Awaited<ReturnType<typeof freeGroomingSlots>> = [];
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
		requireUser(locals);
		const data = await request.formData();
		const kind = String(data.get("kind"));
		const ownerId = Number(data.get("ownerId"));
		const petId = Number(data.get("petId") ?? 0) || null;
		const serviceId = Number(data.get("serviceId") ?? 0) || null;
		const staffId = Number(data.get("staffId") ?? 0) || null;
		const roomId = Number(data.get("roomId") ?? 0) || null;
		const startRaw = String(data.get("start") ?? "");
		const endRaw = String(data.get("end") ?? "");

		let startsAt: Date, endsAt: Date;
		try {
			startsAt = startRaw.includes("T") ? parseISO(startRaw) : parseISO(`${startRaw}T09:00:00`);
			endsAt = endRaw.includes("T") ? parseISO(endRaw) : parseISO(`${endRaw}T17:00:00`);
		} catch {
			return fail(400, { createError: "Invalid date/time" });
		}
		if (!ownerId) return fail(400, { createError: "Customer required" });

		const owner = await db.query.owners.findFirst({ where: eq(owners.id, ownerId) });
		if (!owner) return fail(400, { createError: "Customer not found" });

		let priceCents = 0;
		let depositCents = 0;
		if (kind === "grooming") {
			const svc = serviceId ? await db.query.services.findFirst({ where: eq(services.id, serviceId) }) : null;
			if (!svc) return fail(400, { createError: "Service required" });
			priceCents = svc.priceCents;
			if (!staffId) return fail(400, { createError: "Groomer required" });
			if (svc.durationMinutes) endsAt = new Date(startsAt.getTime() + svc.durationMinutes * 60_000);
		} else if (kind === "hotel") {
			const room = roomId ? await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) }) : null;
			if (!room) return fail(400, { createError: "Room required" });
			startsAt = startOfDay(startsAt);
			endsAt = startOfDay(endsAt);
			const nights = Math.round((endsAt.getTime() - startsAt.getTime()) / 86_400_000);
			if (nights < 1) return fail(400, { createError: "Hotel stay must be at least 1 night" });
			priceCents = nights * room.pricePerNightCents;
			depositCents = room.pricePerNightCents;
			if (!petId) return fail(400, { createError: "Pet required for hotel" });
		} else return fail(400, { createError: "Unsupported kind" });
		if (startsAt >= endsAt) return fail(400, { createError: "Invalid time window" });

		try {
			await createBooking({
				kind: kind as never,
				ownerId,
				petId,
				serviceId,
				staffId,
				roomId,
				startsAt,
				endsAt,
				priceCents,
				depositCents
			}, locals.user!.id);
		} catch (e) {
			if (e instanceof BookingConflictError || e instanceof VaccineGateError) {
				return fail(409, { createError: e.message });
			}
			throw e;
		}
		throw redirect(303, "/bookings");
	}
};
