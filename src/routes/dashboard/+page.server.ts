import { db } from "$lib/server/db";
import { bookings, owners, pets, services, rooms } from "$lib/server/db/schema";
import { and, gte, lt, count, sum, eq } from "drizzle-orm";
import { requireUser } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);
	if (!user) throw redirect(303, "/login");

	const branchFilter = locals.activeBranchId ?? (!user.isHeadOffice ? user.branchId : null);

	const now = new Date();
	const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const todayEnd = new Date(todayStart.getTime() + 24 * 3600 * 1000);

	const [todayRows, ownerCount, petCount, upcomingRows, revToday, totalBookingsCount] = await Promise.all([
		db
			.select({
				id: bookings.id,
				kind: bookings.kind,
				startsAt: bookings.startsAt,
				endsAt: bookings.endsAt,
				status: bookings.status,
				priceCents: bookings.priceCents,
				ownerId: bookings.ownerId,
				ownerName: owners.firstName,
				ownerLast: owners.lastName,
				ownerPhone: owners.phone,
				petId: bookings.petId,
				petName: pets.name,
				petSpecies: pets.species,
				petBreed: pets.breed,
				serviceName: services.name,
				roomName: rooms.name
			})
			.from(bookings)
			.leftJoin(owners, eq(bookings.ownerId, owners.id))
			.leftJoin(pets, eq(bookings.petId, pets.id))
			.leftJoin(services, eq(bookings.serviceId, services.id))
			.leftJoin(rooms, eq(bookings.roomId, rooms.id))
			.where(
				and(
					gte(bookings.startsAt, todayStart),
					lt(bookings.startsAt, todayEnd),
					branchFilter ? eq(bookings.branchId, branchFilter) : undefined
				)
			)
			.orderBy(bookings.startsAt),
		db
			.select({ v: count() })
			.from(owners)
			.where(branchFilter ? eq(owners.branchId, branchFilter) : undefined),
		db.select({ v: count() }).from(pets),
		db
			.select({
				id: bookings.id,
				kind: bookings.kind,
				startsAt: bookings.startsAt,
				endsAt: bookings.endsAt,
				status: bookings.status,
				ownerId: bookings.ownerId,
				ownerName: owners.firstName,
				ownerLast: owners.lastName,
				ownerPhone: owners.phone,
				petId: bookings.petId,
				petName: pets.name,
				petSpecies: pets.species,
				petBreed: pets.breed,
				serviceName: services.name,
				roomName: rooms.name,
				priceCents: bookings.priceCents
			})
			.from(bookings)
			.leftJoin(owners, eq(bookings.ownerId, owners.id))
			.leftJoin(pets, eq(bookings.petId, pets.id))
			.leftJoin(services, eq(bookings.serviceId, services.id))
			.leftJoin(rooms, eq(bookings.roomId, rooms.id))
			.where(
				and(
					gte(bookings.startsAt, todayStart),
					branchFilter ? eq(bookings.branchId, branchFilter) : undefined
				)
			)
			.orderBy(bookings.startsAt)
			.limit(10),
		db
			.select({ v: sum(bookings.priceCents) })
			.from(bookings)
			.where(
				and(
					gte(bookings.startsAt, todayStart),
					lt(bookings.startsAt, todayEnd),
					branchFilter ? eq(bookings.branchId, branchFilter) : undefined
				)
			),
		db
			.select({ v: count() })
			.from(bookings)
			.where(branchFilter ? eq(bookings.branchId, branchFilter) : undefined)
	]);

	const checkinsDue = todayRows.filter((r) => ["pending", "confirmed"].includes(r.status)).length;
	const upcomingRevenue = upcomingRows.reduce((s, b) => s + b.priceCents, 0);

	return {
		user,
		todayBookings: todayRows,
		ownerCount: ownerCount[0].v,
		petCount: petCount[0].v,
		totalBookingsCount: totalBookingsCount[0].v,
		upcoming: upcomingRows,
		todayRevenueCents: Number(revToday[0].v ?? 0),
		upcomingRevenueCents: upcomingRevenue,
		checkinsDue
	};
};
