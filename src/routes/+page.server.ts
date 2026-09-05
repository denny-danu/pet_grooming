import { db } from "$lib/server/db";
import { bookings, owners, pets } from "$lib/server/db/schema";
import { and, gte, lt, count, sum } from "drizzle-orm";
import { requireUser } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);
	if (!user) throw redirect(303, "/login");

	const now = new Date();
	const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const todayEnd = new Date(todayStart.getTime() + 24 * 3600 * 1000);
	const in7 = new Date(todayStart.getTime() + 7 * 24 * 3600 * 1000);

	const [todayRows, ownerCount, petCount, upcoming, revToday] = await Promise.all([
		db
			.select({
				id: bookings.id,
				kind: bookings.kind,
				startsAt: bookings.startsAt,
				status: bookings.status,
				priceCents: bookings.priceCents
			})
			.from(bookings)
			.where(and(gte(bookings.startsAt, todayStart), lt(bookings.startsAt, todayEnd)))
			.orderBy(bookings.startsAt),
		db.select({ v: count() }).from(owners),
		db.select({ v: count() }).from(pets),
		db
			.select({
				id: bookings.id,
				kind: bookings.kind,
				startsAt: bookings.startsAt,
				status: bookings.status,
				ownerId: bookings.ownerId,
				petId: bookings.petId,
				priceCents: bookings.priceCents
			})
			.from(bookings)
			.where(gte(bookings.startsAt, todayStart))
			.orderBy(bookings.startsAt)
			.limit(8),
		db
			.select({ v: sum(bookings.priceCents) })
			.from(bookings)
			.where(and(gte(bookings.startsAt, todayStart), lt(bookings.startsAt, todayEnd)))
	]);

	const checkinsDue = todayRows.filter((r) => ["pending", "confirmed"].includes(r.status)).length;
	const upcomingRevenue = upcoming.reduce((s, b) => s + b.priceCents, 0);

	return {
		user,
		todayBookings: todayRows,
		ownerCount: ownerCount[0].v,
		petCount: petCount[0].v,
		upcoming,
		todayRevenueCents: Number(revToday[0].v ?? 0),
		upcomingRevenueCents: upcomingRevenue,
		checkinsDue
	};
};
