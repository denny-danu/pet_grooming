import { fail, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { owners, pets } from "$lib/server/db/schema";
import { getOrCreateMembership } from "$lib/server/membership";
import { requireUser } from "$lib/server/auth";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	requireUser(locals);
	return {};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		requireUser(locals);
		const data = await request.formData();
		const firstName = String(data.get("firstName") ?? "").trim();
		const lastName = String(data.get("lastName") ?? "").trim();
		const phone = String(data.get("phone") ?? "").trim();
		const email = String(data.get("email") ?? "").trim();
		if (!firstName || !lastName || !phone) {
			return fail(400, { error: "First name, last name, and phone are required", firstName, lastName, phone, email });
		}

		const [owner] = await db
			.insert(owners)
			.values({ firstName, lastName, phone, email: email || null, preferredChannel: "email" })
			.returning();

		await getOrCreateMembership(owner.id);

		const petName = String(data.get("petName") ?? "").trim();
		if (petName) {
			const weightKg = String(data.get("weightKg") ?? "").trim() || null;
			const vaccinationDueDate = String(data.get("vaccinationDueDate") ?? "") || null;
			await db.insert(pets).values({
				ownerId: owner.id,
				name: petName,
				species: (String(data.get("species") ?? "dog") as never),
				breed: String(data.get("breed") ?? "").trim() || null,
				weightKg,
				vaccinationDueDate
			});
		}

		throw redirect(303, `/customers/${owner.id}`);
	}
};
