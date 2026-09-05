import { db } from "$lib/server/db";
import { owners, pets, membershipAccounts } from "$lib/server/db/schema";
import { eq, or, ilike, sql, count } from "drizzle-orm";
import { requireUser } from "$lib/server/auth";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
	requireUser(locals);
	const q = (url.searchParams.get("q") ?? "").trim();
	const filter = q
		? or(
				ilike(owners.firstName, `%${q}%`),
				ilike(owners.lastName, `%${q}%`),
				ilike(owners.phone, `%${q}%`),
				ilike(owners.email, `%${q}%`)
		  )
		: undefined;

	const [rows, allPets, totalOwnersRes, totalPetsRes] = await Promise.all([
		db
			.select({
				id: owners.id,
				firstName: owners.firstName,
				lastName: owners.lastName,
				email: owners.email,
				phone: owners.phone,
				tier: membershipAccounts.tier,
				pointsBalance: membershipAccounts.pointsBalance,
				petCount: sql<number>`cast((select count(*) from pets p where p.owner_id = ${owners.id}) as integer)`,
				lastBooking: sql<Date | null>`(select max(b.starts_at) from bookings b where b.owner_id = ${owners.id})`
			})
			.from(owners)
			.leftJoin(membershipAccounts, eq(membershipAccounts.ownerId, owners.id))
			.where(filter)
			.orderBy(owners.lastName, owners.firstName)
			.limit(200),
		db.select({ id: pets.id, ownerId: pets.ownerId, name: pets.name, species: pets.species, breed: pets.breed }).from(pets),
		db.select({ count: count() }).from(owners),
		db.select({ count: count() }).from(pets)
	]);

	const petsByOwner = new Map<number, typeof allPets>();
	for (const pet of allPets) {
		const list = petsByOwner.get(pet.ownerId) ?? [];
		list.push(pet);
		petsByOwner.set(pet.ownerId, list);
	}

	const enrichedRows = rows.map((r) => ({
		...r,
		pets: petsByOwner.get(r.id) ?? []
	}));

	const vipCount = enrichedRows.filter((r) => r.tier === 'gold' || r.tier === 'platinum').length;

	return {
		q,
		customers: enrichedRows,
		totalOwners: totalOwnersRes[0]?.count ?? enrichedRows.length,
		totalPets: totalPetsRes[0]?.count ?? allPets.length,
		vipCount
	};
};
