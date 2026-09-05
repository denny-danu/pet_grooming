import { db } from "$lib/server/db";
import { bookings, owners, pets, stays, rooms } from "$lib/server/db/schema";
import { and, eq, gte, lt, inArray } from "drizzle-orm";
import { requireUser } from "$lib/server/auth";
import { checkInBooking, checkOutBooking, BookingConflictError } from "$lib/server/booking-service";
import { VaccineGateError } from "$lib/server/vaccine-gate";
import { fail } from "@sveltejs/kit";
import { startOfDay, addDays } from "date-fns";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	requireUser(locals);
	const today = startOfDay(new Date());
	const tomorrow = addDays(today, 1);

	const upcoming = await db
		.select({
			id: bookings.id,
			kind: bookings.kind,
			status: bookings.status,
			startsAt: bookings.startsAt,
			endsAt: bookings.endsAt,
			ownerId: owners.id,
			ownerName: owners.firstName,
			ownerLast: owners.lastName,
			petName: pets.name,
			roomName: rooms.name
		})
		.from(bookings)
		.innerJoin(owners, eq(bookings.ownerId, owners.id))
		.leftJoin(pets, eq(bookings.petId, pets.id))
		.leftJoin(rooms, eq(bookings.roomId, rooms.id))
		.where(
			and(
				gte(bookings.startsAt, today),
				lt(bookings.startsAt, tomorrow),
				inArray(bookings.status, ["pending", "confirmed", "checked_in"])
			)
		)
		.orderBy(bookings.startsAt);

	return { rows: upcoming };
};

export const actions: Actions = {
	checkin: async ({ request, locals, url }) => {
		const actor = requireUser(locals);
		const fd = await request.formData();
		const id = Number(fd.get("bookingId"));
		try {
			await checkInBooking(id, actor.id);
		} catch (e) {
			if (e instanceof VaccineGateError || e instanceof BookingConflictError) return fail(409, { actionError: e.message });
			throw e;
		}
		return { ok: true };
	}
};
