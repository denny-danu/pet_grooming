import { db } from "$lib/server/db";
import { branches, services, rooms } from "$lib/server/db/schema";
import { eq, asc } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	const [activeBranches, activeServices, activeRooms] = await Promise.all([
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
			.orderBy(asc(rooms.pricePerNightCents))
	]);

	return {
		branches: activeBranches,
		services: activeServices,
		rooms: activeRooms
	};
};
