import { db } from "$lib/server/db";
import { owners, membershipAccounts } from "$lib/server/db/schema";
import { eq, like, sql } from "drizzle-orm";
import { requireUser } from "$lib/server/auth";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
	requireUser(locals);
	const q = (url.searchParams.get("q") ?? "").trim();
	const filter = q ? like(owners.firstName, `%${q}%`) : undefined;

	const rows = await db
		.select({
			id: owners.id,
			firstName: owners.firstName,
			lastName: owners.lastName,
			email: owners.email,
			phone: owners.phone,
			tier: membershipAccounts.tier,
			petCount: sql<number>`(select count(*) from pets p where p.owner_id = ${owners.id})`,
			lastBooking: sql<Date | null>`(select max(b.starts_at) from bookings b where b.owner_id = ${owners.id})`
		})
		.from(owners)
		.leftJoin(membershipAccounts, eq(membershipAccounts.ownerId, owners.id))
		.where(filter)
		.orderBy(owners.lastName, owners.firstName)
		.limit(200);

	return { q, customers: rows };
};
