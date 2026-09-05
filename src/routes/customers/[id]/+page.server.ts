import { db } from "$lib/server/db";
import { owners, pets, packagePurchases, packages, ledgerEntries, orders, orderItems, customerTanks, waterParameterLogs } from "$lib/server/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
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

	const [catalog, customerOrders, tanksList] = await Promise.all([
		db.query.packages.findMany({ where: eq(packages.active, true) }),
		db.query.orders.findMany({
			where: eq(orders.ownerId, id),
			orderBy: [desc(orders.createdAt)],
			limit: 30
		}),
		db.query.customerTanks.findMany({
			where: eq(customerTanks.ownerId, id),
			orderBy: [desc(customerTanks.createdAt)]
		})
	]);

	// Fetch order items for customer orders if any
	let orderItemsMap = new Map<number, typeof orderItems.$inferSelect[]>();
	if (customerOrders.length > 0) {
		const orderIds = customerOrders.map((o) => o.id);
		const allItems = await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds));
		for (const item of allItems) {
			const list = orderItemsMap.get(item.orderId) ?? [];
			list.push(item);
			orderItemsMap.set(item.orderId, list);
		}
	}

	const enrichedOrders = customerOrders.map((o) => ({
		...o,
		items: orderItemsMap.get(o.id) ?? []
	}));

	return {
		...data,
		catalog,
		retailOrders: enrichedOrders,
		tanks: tanksList,
		membership: data.account,
		bookings: data.history.map((b) => ({
			...b,
			petName: b.pet?.name,
			serviceName: b.service?.name,
			roomName: null
		})),
		customer: {
			...data.customer,
			pets: data.customer.pets.map((p) => ({
				...p,
				vaccineStatus: vaccineStatus(p)
			}))
		}
	};
};

export const actions: Actions = {
	editCustomer: async ({ request, params, locals }) => {
		requireUser(locals);
		const ownerId = Number(params.id);
		const data = await request.formData();
		const firstName = String(data.get("firstName") ?? "").trim();
		const lastName = String(data.get("lastName") ?? "").trim();
		const phone = String(data.get("phone") ?? "").trim();
		const email = String(data.get("email") ?? "").trim() || null;
		const address = String(data.get("address") ?? "").trim() || null;
		const notes = String(data.get("notes") ?? "").trim() || null;

		if (!firstName || !lastName || !phone) {
			return fail(400, { editCustomerError: "First name, last name, and phone are required." });
		}

		await db
			.update(owners)
			.set({
				firstName,
				lastName,
				phone,
				email,
				address,
				notes,
				updatedAt: new Date()
			})
			.where(eq(owners.id, ownerId));

		return { customerUpdated: true };
	},

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

	editPet: async ({ request, locals }) => {
		requireUser(locals);
		const data = await request.formData();
		const petId = Number(data.get("petId"));
		const name = String(data.get("name") ?? "").trim();
		if (!petId || !name) return fail(400, { editPetError: "Pet ID and name required" });

		await db
			.update(pets)
			.set({
				name,
				species: String(data.get("species") ?? "dog") as never,
				breed: String(data.get("breed") ?? "").trim() || null,
				weightKg: String(data.get("weightKg") ?? "").trim() || null,
				birthDate: String(data.get("birthDate") ?? "") || null,
				allergies: String(data.get("allergies") ?? "").trim() || null,
				behaviorNotes: String(data.get("behaviorNotes") ?? "").trim() || null,
				vaccinationDueDate: String(data.get("vaccinationDueDate") ?? "") || null
			})
			.where(eq(pets.id, petId));

		return { petUpdated: true };
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
