import { db } from "$lib/server/db";
import { pets, packagePurchases, packages, ledgerEntries } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { getCustomerWithRelations } from "$lib/server/customer-service";
import { vaccineStatus } from "$lib/server/vaccine-gate";
import { requireUser } from "$lib/server/auth";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params }) => {
	requireUser(locals);
	const id = Number(params.id);
	const data = await getCustomerWithRelations(id);
	if (!data) {
		return { notFound: true };
	}
	const catalog = await db.query.packages.findMany({ where: eq(packages.active, true) });
	return {
		...data,
		catalog,
		customer: {
			...data.customer,
			pets: (data.customer.pets as any[]).map((p) => ({ ...p, vaccineStatus: vaccineStatus(p) }))
		} as typeof data.customer & { pets: (typeof data.customer.pets[number] & { vaccineStatus: string })[] }
	};
};

export const actions: Actions = {
	addPet: async ({ request, params, locals }) => {
		requireUser(locals);
		const ownerId = Number(params.id);
		const data = await request.formData();
		const name = String(data.get("name") ?? "").trim();
		if (!name) return fail(400, { addPetError: "Pet name required" });
		await db.insert(pets).values({
			ownerId,
			name,
			species: String(data.get("species") ?? "dog") as never,
			breed: String(data.get("breed") ?? "").trim() || null,
			weightKg: String(data.get("weightKg") ?? "").trim() || null,
			birthDate: String(data.get("birthDate") ?? "") || null,
			allergies: String(data.get("allergies") ?? "").trim() || null,
			healthNotes: String(data.get("healthNotes") ?? "").trim() || null,
			behaviorNotes: String(data.get("behaviorNotes") ?? "").trim() || null,
			aggressive: data.get("aggressive") === "on",
			lastVaccinationDate: String(data.get("lastVaccinationDate") ?? "") || null,
			vaccinationDueDate: String(data.get("vaccinationDueDate") ?? "") || null
		});
		return { added: true };
	},

	buyPackage: async ({ request, params, locals }) => {
		requireUser(locals);
		const ownerId = Number(params.id);
		const data = await request.formData();
		const packageId = Number(data.get("packageId"));
		const pkg = await db.query.packages.findFirst({ where: eq(packages.id, packageId) });
		if (!pkg) return fail(404, { packageError: "Package not found" });

		await db.insert(packagePurchases).values({
			ownerId,
			packageId: pkg.id,
			packageName: pkg.name,
			kind: pkg.kind,
			creditsIssued: pkg.credits,
			creditsRemaining: pkg.credits,
			priceCents: pkg.priceCents
		});
		await db.insert(ledgerEntries).values({
			type: "package",
			kind: "issue",
			ownerId,
			amount: pkg.credits,
			balanceAfter: pkg.credits,
			referenceType: "package",
			referenceId: pkg.id,
			description: `Issued ${pkg.name} (${pkg.credits} credits)`
		});
		return { ok: true };
	}
};
