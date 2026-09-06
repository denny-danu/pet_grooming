import { db } from "$lib/server/db";
import { branches } from "$lib/server/db/schema";
import { eq, asc } from "drizzle-orm";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
	const allBranches = await db
		.select({
			id: branches.id,
			name: branches.name,
			code: branches.code,
			city: branches.city,
			isHeadOffice: branches.isHeadOffice,
			active: branches.active
		})
		.from(branches)
		.where(eq(branches.active, true))
		.orderBy(branches.isHeadOffice ? asc(branches.id) : asc(branches.name));

	const activeBranchId = locals.activeBranchId;
	const currentBranch = allBranches.find((b) => b.id === activeBranchId) ?? null;

	return {
		user: locals.user,
		locale: locals.locale,
		branches: allBranches,
		activeBranchId,
		currentBranch,
		isHeadOffice: locals.user?.isHeadOffice ?? (locals.user?.role === "admin")
	};
};
