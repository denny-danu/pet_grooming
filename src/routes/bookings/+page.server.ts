import { db } from "$lib/server/db";
import { bookings, owners, pets, services, staff, rooms } from "$lib/server/db/schema";
import { and, gte, lt, eq } from "drizzle-orm";
import { requireUser } from "$lib/server/auth";
import { addDays, startOfDay } from "date-fns";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
	requireUser(locals);
	const dayParam = url.searchParams.get("day");
	const viewDate = dayParam ? startOfDay(new Date(dayParam)) : startOfDay(new Date());

	const days = Array.from({ length: 7 }, (_, i) => addDays(viewDate, i));

	const rows = await db
		.select({
			id: bookings.id,
			kind: bookings.kind,
			status: bookings.status,
			startsAt: bookings.startsAt,
			endsAt: bookings.endsAt,
			priceCents: bookings.priceCents,
			ownerId: owners.id,
			ownerName: owners.firstName,
			ownerLast: owners.lastName,
			ownerPhone: owners.phone,
			petId: bookings.petId,
			petName: pets.name,
			petSpecies: pets.species,
			petBreed: pets.breed,
			serviceName: services.name,
			roomName: rooms.name,
			staffName: staff.name
		})
		.from(bookings)
		.innerJoin(owners, eq(bookings.ownerId, owners.id))
		.leftJoin(pets, eq(bookings.petId, pets.id))
		.leftJoin(services, eq(bookings.serviceId, services.id))
		.leftJoin(rooms, eq(bookings.roomId, rooms.id))
		.leftJoin(staff, eq(bookings.staffId, staff.id))
		.where(and(gte(bookings.startsAt, days[0]), lt(bookings.startsAt, addDays(days[6], 1))))
		.orderBy(bookings.startsAt);

	const grouped = days.map((d) => ({
		date: d,
		items: rows.filter((r) => r.startsAt >= d && r.startsAt < addDays(d, 1))
	}));

	return { days: grouped, viewDate, totalCount: rows.length };
};
