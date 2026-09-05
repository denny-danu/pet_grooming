import { db } from "$lib/server/db";
import {
	customerTanks,
	waterParameterLogs,
	aquariumServicePlans,
	bookings,
	owners,
	staff,
	services
} from "$lib/server/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { requireUser } from "$lib/server/auth";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	requireUser(locals);

	// 1. Fetch all customer tanks with owner info
	const tankRows = await db
		.select({
			id: customerTanks.id,
			ownerId: customerTanks.ownerId,
			name: customerTanks.name,
			volumeLiters: customerTanks.volumeLiters,
			ecosystem: customerTanks.ecosystem,
			dimensions: customerTanks.dimensions,
			filtrationType: customerTanks.filtrationType,
			lightingType: customerTanks.lightingType,
			notes: customerTanks.notes,
			createdAt: customerTanks.createdAt,
			ownerFirstName: owners.firstName,
			ownerLastName: owners.lastName,
			ownerPhone: owners.phone,
			ownerEmail: owners.email
		})
		.from(customerTanks)
		.innerJoin(owners, eq(customerTanks.ownerId, owners.id))
		.orderBy(desc(customerTanks.createdAt));

	// 2. Fetch all water parameter logs with tank, owner, and staff details
	const waterLogs = await db
		.select({
			id: waterParameterLogs.id,
			tankId: waterParameterLogs.tankId,
			bookingId: waterParameterLogs.bookingId,
			recordedAt: waterParameterLogs.recordedAt,
			ph: waterParameterLogs.ph,
			ammoniaPpm: waterParameterLogs.ammoniaPpm,
			nitritePpm: waterParameterLogs.nitritePpm,
			nitratePpm: waterParameterLogs.nitratePpm,
			salinityPpt: waterParameterLogs.salinityPpt,
			temperatureC: waterParameterLogs.temperatureC,
			khDkh: waterParameterLogs.khDkh,
			notes: waterParameterLogs.notes,
			staffId: waterParameterLogs.staffId,
			createdAt: waterParameterLogs.createdAt,
			tankName: customerTanks.name,
			tankVolume: customerTanks.volumeLiters,
			tankEcosystem: customerTanks.ecosystem,
			ownerFirstName: owners.firstName,
			ownerLastName: owners.lastName,
			staffName: staff.name
		})
		.from(waterParameterLogs)
		.innerJoin(customerTanks, eq(waterParameterLogs.tankId, customerTanks.id))
		.innerJoin(owners, eq(customerTanks.ownerId, owners.id))
		.leftJoin(staff, eq(waterParameterLogs.staffId, staff.id))
		.orderBy(desc(waterParameterLogs.recordedAt));

	// 3. Fetch active recurring service plans
	const servicePlans = await db
		.select({
			id: aquariumServicePlans.id,
			ownerId: aquariumServicePlans.ownerId,
			tankId: aquariumServicePlans.tankId,
			planName: aquariumServicePlans.planName,
			frequency: aquariumServicePlans.frequency,
			pricePerVisitCents: aquariumServicePlans.pricePerVisitCents,
			active: aquariumServicePlans.active,
			nextScheduledDate: aquariumServicePlans.nextScheduledDate,
			notes: aquariumServicePlans.notes,
			createdAt: aquariumServicePlans.createdAt,
			tankName: customerTanks.name,
			tankEcosystem: customerTanks.ecosystem,
			ownerFirstName: owners.firstName,
			ownerLastName: owners.lastName,
			ownerPhone: owners.phone,
			ownerEmail: owners.email
		})
		.from(aquariumServicePlans)
		.innerJoin(customerTanks, eq(aquariumServicePlans.tankId, customerTanks.id))
		.innerJoin(owners, eq(aquariumServicePlans.ownerId, owners.id))
		.orderBy(desc(aquariumServicePlans.active), asc(aquariumServicePlans.nextScheduledDate));

	// 4. Fetch upcoming specialist visits (aquarium bookings)
	const now = new Date();
	const upcomingVisits = await db
		.select({
			id: bookings.id,
			kind: bookings.kind,
			status: bookings.status,
			startsAt: bookings.startsAt,
			endsAt: bookings.endsAt,
			priceCents: bookings.priceCents,
			notes: bookings.notes,
			ownerId: owners.id,
			ownerFirstName: owners.firstName,
			ownerLastName: owners.lastName,
			ownerPhone: owners.phone,
			staffId: staff.id,
			staffName: staff.name,
			serviceName: services.name
		})
		.from(bookings)
		.innerJoin(owners, eq(bookings.ownerId, owners.id))
		.leftJoin(staff, eq(bookings.staffId, staff.id))
		.leftJoin(services, eq(bookings.serviceId, services.id))
		.where(eq(bookings.kind, "aquarium"))
		.orderBy(desc(bookings.startsAt))
		.limit(15);

	// 5. Owners list for dropdowns
	const ownersList = await db
		.select({
			id: owners.id,
			firstName: owners.firstName,
			lastName: owners.lastName,
			phone: owners.phone,
			email: owners.email
		})
		.from(owners)
		.orderBy(asc(owners.firstName), asc(owners.lastName));

	// 6. Active staff list (specialists / team)
	const staffList = await db
		.select({
			id: staff.id,
			name: staff.name,
			role: staff.role,
			specialty: staff.specialty
		})
		.from(staff)
		.where(eq(staff.active, true))
		.orderBy(asc(staff.name));

	// Enhance tanks with latest water parameters & active service plan
	const tanks = tankRows.map((tank) => {
		const latestLog = waterLogs.find((l) => l.tankId === tank.id) || null;
		const activePlan = servicePlans.find((p) => p.tankId === tank.id && p.active) || null;
		return {
			...tank,
			latestLog,
			activePlan
		};
	});

	// Calculate metrics
	const totalTanks = tanks.length;

	// Healthy logs calculation: ammonia <= 0.25, nitrite <= 0.25, nitrate <= 40, pH between 6.0 and 8.8
	const healthyLogsCount = waterLogs.filter((log) => {
		const amm = log.ammoniaPpm ? parseFloat(log.ammoniaPpm) : 0;
		const nit = log.nitritePpm ? parseFloat(log.nitritePpm) : 0;
		const ntr = log.nitratePpm ? parseFloat(log.nitratePpm) : 0;
		const phVal = log.ph ? parseFloat(log.ph) : 7.2;
		return amm <= 0.25 && nit <= 0.25 && ntr <= 50 && phVal >= 6.0 && phVal <= 8.8;
	}).length;

	const activeContractsCount = servicePlans.filter((p) => p.active).length;
	const upcomingVisitsCount = upcomingVisits.filter(
		(v) => new Date(v.startsAt) >= now && v.status !== "cancelled"
	).length;

	return {
		tanks,
		waterLogs,
		servicePlans,
		upcomingVisits,
		owners: ownersList,
		staff: staffList,
		metrics: {
			totalTanks,
			healthyLogsCount,
			totalLogsCount: waterLogs.length,
			activeContractsCount,
			upcomingVisitsCount
		}
	};
};

export const actions: Actions = {
	addTank: async ({ request, locals }) => {
		requireUser(locals);
		const form = await request.formData();
		const ownerId = Number(form.get("ownerId"));
		const name = String(form.get("name") ?? "").trim();
		const volumeLiters = form.get("volumeLiters") ? Number(form.get("volumeLiters")) : null;
		const ecosystem = String(form.get("ecosystem") ?? "freshwater").trim();
		const dimensions = String(form.get("dimensions") ?? "").trim() || null;
		const filtrationType = String(form.get("filtrationType") ?? "").trim() || null;
		const lightingType = String(form.get("lightingType") ?? "").trim() || null;
		const notes = String(form.get("notes") ?? "").trim() || null;

		if (!ownerId || !name) {
			return fail(400, {
				error: "Owner and Tank Name are required.",
				ownerId,
				name,
				volumeLiters,
				ecosystem,
				dimensions,
				filtrationType,
				lightingType,
				notes
			});
		}

		try {
			const [newTank] = await db
				.insert(customerTanks)
				.values({
					ownerId,
					name,
					volumeLiters,
					ecosystem,
					dimensions,
					filtrationType,
					lightingType,
					notes
				})
				.returning();

			return { success: true, action: "addTank", tankId: newTank.id };
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Failed to register aquarium tank.";
			return fail(500, { error: message });
		}
	},

	logWaterTest: async ({ request, locals }) => {
		requireUser(locals);
		const form = await request.formData();
		const tankId = Number(form.get("tankId"));
		const ph = form.get("ph") ? String(form.get("ph")).trim() : null;
		const ammoniaPpm = form.get("ammoniaPpm") ? String(form.get("ammoniaPpm")).trim() : null;
		const nitritePpm = form.get("nitritePpm") ? String(form.get("nitritePpm")).trim() : null;
		const nitratePpm = form.get("nitratePpm") ? String(form.get("nitratePpm")).trim() : null;
		const salinityPpt = form.get("salinityPpt") ? String(form.get("salinityPpt")).trim() : null;
		const temperatureC = form.get("temperatureC") ? String(form.get("temperatureC")).trim() : null;
		const khDkh = form.get("khDkh") ? String(form.get("khDkh")).trim() : null;
		const notes = String(form.get("notes") ?? "").trim() || null;
		const staffId = form.get("staffId") ? Number(form.get("staffId")) : null;
		const recordedAtRaw = form.get("recordedAt") ? String(form.get("recordedAt")).trim() : null;
		const recordedAt = recordedAtRaw ? new Date(recordedAtRaw) : new Date();

		if (!tankId) {
			return fail(400, { error: "Please select an aquarium tank to log test parameters." });
		}

		try {
			await db.insert(waterParameterLogs).values({
				tankId,
				ph,
				ammoniaPpm,
				nitritePpm,
				nitratePpm,
				salinityPpt,
				temperatureC,
				khDkh,
				notes,
				staffId: staffId || null,
				recordedAt
			});

			return { success: true, action: "logWaterTest" };
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Failed to record water test log.";
			return fail(500, { error: message });
		}
	},

	createServicePlan: async ({ request, locals }) => {
		requireUser(locals);
		const form = await request.formData();
		const ownerId = Number(form.get("ownerId"));
		const tankId = Number(form.get("tankId"));
		const planName = String(form.get("planName") ?? "").trim();
		const frequency = String(form.get("frequency") ?? "monthly").trim();
		const pricePerVisitCents = Number(form.get("pricePerVisitCents") ?? 0);
		const nextScheduledDate = form.get("nextScheduledDate")
			? String(form.get("nextScheduledDate")).trim()
			: null;
		const notes = String(form.get("notes") ?? "").trim() || null;

		if (!ownerId || !tankId || !planName || pricePerVisitCents <= 0) {
			return fail(400, {
				error: "Customer, Tank, Plan Name, and Price per Visit (IDR) are required.",
				ownerId,
				tankId,
				planName,
				frequency,
				pricePerVisitCents,
				nextScheduledDate,
				notes
			});
		}

		try {
			await db.insert(aquariumServicePlans).values({
				ownerId,
				tankId,
				planName,
				frequency,
				pricePerVisitCents,
				active: true,
				nextScheduledDate: nextScheduledDate || null,
				notes
			});

			return { success: true, action: "createServicePlan" };
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Failed to create service plan.";
			return fail(500, { error: message });
		}
	},

	toggleServicePlan: async ({ request, locals }) => {
		requireUser(locals);
		const form = await request.formData();
		const planId = Number(form.get("planId"));

		if (!planId) {
			return fail(400, { error: "Plan ID is required." });
		}

		try {
			const [plan] = await db
				.select({ id: aquariumServicePlans.id, active: aquariumServicePlans.active })
				.from(aquariumServicePlans)
				.where(eq(aquariumServicePlans.id, planId));

			if (!plan) {
				return fail(404, { error: "Service plan not found." });
			}

			await db
				.update(aquariumServicePlans)
				.set({ active: !plan.active })
				.where(eq(aquariumServicePlans.id, planId));

			return { success: true, action: "toggleServicePlan", newActive: !plan.active };
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Failed to update service plan status.";
			return fail(500, { error: message });
		}
	}
};
