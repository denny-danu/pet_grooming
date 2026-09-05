import { db } from "$lib/server/db";
import { bookings, owners, pets, membershipAccounts } from "$lib/server/db/schema";
import { and, gte, lt, count } from "drizzle-orm";
import { requireUser } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);
	if (!user) throw redirect(303, "/login");

	const now = new Date();
	const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const todayEnd = new Date(todayStart.getTime() + 24 * 3600 * 1000);

	const todayBookings = await db
		.select({ id: bookings.id, kind: bookings.kind, startsAt: bookings.startsAt, status: bookings.status })
		.from(bookings)
		.where(and(gte(bookings.startsAt, todayStart), lt(bookings.startsAt, todayEnd)))
		.orderBy(bookings.startsAt);

	const ownerCount = await db.select({ v: count() }).from(owners);
	const petCount = await db.select({ v: count() }).from(pets);
	const upcoming = await db
		.select({ id: bookings.id, kind: bookings.kind, startsAt: bookings.startsAt, status: bookings.status })
		.from(bookings)
		.where(gte(bookings.startsAt, todayStart))
		.orderBy(bookings.startsAt)
		.limit(8);

	return {
		user,
		todayBookings,
		ownerCount: ownerCount[0].v,
		petCount: petCount[0].v,
		upcoming
	};
};
