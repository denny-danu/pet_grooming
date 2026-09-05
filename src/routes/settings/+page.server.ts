import { db } from "$lib/server/db";
import { branches, storeSettings, staff, bookings, orders } from "$lib/server/db/schema";
import { eq, desc, asc, sql } from "drizzle-orm";
import { requireUser } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);

	let settings = await db.query.storeSettings.findFirst();
	if (!settings) {
		const [created] = await db
			.insert(storeSettings)
			.values({
				storeName: "PetCo Pet Care, Retail & Hotel",
				tagline: "Integrated Pet CRM, Salon, Boarding & Aquarium",
				contactPhone: "+62 21-718-2938",
				contactEmail: "contact@petco.co.id",
				taxRatePercent: 11
			})
			.returning();
		settings = created;
	}

	const branchRows = await db
		.select({
			id: branches.id,
			name: branches.name,
			code: branches.code,
			isHeadOffice: branches.isHeadOffice,
			city: branches.city,
			address: branches.address,
			phone: branches.phone,
			email: branches.email,
			active: branches.active,
			createdAt: branches.createdAt,
			staffCount: sql<number>`cast((select count(*) from staff s where s.branch_id = ${branches.id}) as integer)`,
			bookingCount: sql<number>`cast((select count(*) from bookings b where b.branch_id = ${branches.id}) as integer)`
		})
		.from(branches)
		.orderBy(desc(branches.isHeadOffice), asc(branches.name));

	return {
		user,
		settings,
		branches: branchRows,
		isHeadOffice: user.isHeadOffice || user.role === "admin"
	};
};

export const actions: Actions = {
	updateSettings: async ({ request, locals }) => {
		requireUser(locals);
		const form = await request.formData();

		const storeName = String(form.get("storeName") ?? "").trim();
		const tagline = String(form.get("tagline") ?? "").trim();
		const contactPhone = String(form.get("contactPhone") ?? "").trim();
		const contactEmail = String(form.get("contactEmail") ?? "").trim();
		const taxRatePercent = Number(form.get("taxRatePercent") ?? 11);
		const receiptHeader = String(form.get("receiptHeader") ?? "").trim();
		const receiptFooter = String(form.get("receiptFooter") ?? "").trim();
		const onlineBookingEnabled = form.get("onlineBookingEnabled") === "on";
		const autoConfirmBookings = form.get("autoConfirmBookings") === "on";
		const reminder24hEnabled = form.get("reminder24hEnabled") === "on";
		const reminder2hEnabled = form.get("reminder2hEnabled") === "on";
		const whatsappApiKey = String(form.get("whatsappApiKey") ?? "").trim();

		const settings = await db.query.storeSettings.findFirst();
		if (settings) {
			await db
				.update(storeSettings)
				.set({
					storeName,
					tagline,
					contactPhone,
					contactEmail,
					taxRatePercent,
					receiptHeader,
					receiptFooter,
					onlineBookingEnabled,
					autoConfirmBookings,
					reminder24hEnabled,
					reminder2hEnabled,
					whatsappApiKey,
					updatedAt: new Date()
				})
				.where(eq(storeSettings.id, settings.id));
		}

		return { settingsSaved: true };
	},

	createBranch: async ({ request, locals }) => {
		const user = requireUser(locals);
		if (!user.isHeadOffice && user.role !== "admin") {
			return fail(403, { branchError: "Only Head Office administrators can create branch offices." });
		}

		const form = await request.formData();
		const name = String(form.get("name") ?? "").trim();
		const code = String(form.get("code") ?? "").toUpperCase().trim();
		const city = String(form.get("city") ?? "").trim() || "Jakarta";
		const address = String(form.get("address") ?? "").trim() || null;
		const phone = String(form.get("phone") ?? "").trim() || null;
		const email = String(form.get("email") ?? "").trim() || null;
		const isHeadOffice = form.get("isHeadOffice") === "on";

		if (!name || !code) {
			return fail(400, { branchError: "Branch name and unique code are required." });
		}

		const existing = await db.query.branches.findFirst({ where: eq(branches.code, code) });
		if (existing) {
			return fail(400, { branchError: `A branch with code “${code}” already exists.` });
		}

		await db.insert(branches).values({
			name,
			code,
			city,
			address,
			phone,
			email,
			isHeadOffice,
			active: true
		});

		return { branchCreated: true };
	},

	toggleBranch: async ({ request, locals }) => {
		const user = requireUser(locals);
		if (!user.isHeadOffice && user.role !== "admin") {
			return fail(403, { branchError: "Unauthorized." });
		}

		const form = await request.formData();
		const branchId = Number(form.get("branchId"));
		const branch = await db.query.branches.findFirst({ where: eq(branches.id, branchId) });
		if (!branch) return fail(404, { branchError: "Branch not found." });

		if (branch.isHeadOffice) {
			return fail(400, { branchError: "Cannot deactivate Head Office." });
		}

		await db.update(branches).set({ active: !branch.active }).where(eq(branches.id, branchId));
		return { branchToggled: true };
	}
};
