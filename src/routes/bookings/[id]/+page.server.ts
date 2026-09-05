import { db } from "$lib/server/db";
import { eq, sql } from "drizzle-orm";
import { requireUser } from "$lib/server/auth";
import { bookings, stays, bookingAddons, groomingCutCards } from "$lib/server/db/schema";
import { rescheduleBooking, cancelBooking, checkInBooking, checkOutBooking, markCompleted, markNoShow, BookingConflictError } from "$lib/server/booking-service";
import { queueBookingReminder, bookingChannel } from "$lib/server/notifications";
import { applyLedger, redeemPackageCredit } from "$lib/server/membership";
import { vaccineStatus } from "$lib/server/vaccine-gate";
import { VaccineGateError } from "$lib/server/vaccine-gate";
import { fail } from "@sveltejs/kit";
import { parseISO } from "date-fns";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = requireUser(locals);
	const id = Number(params.id);
	const row = await db.query.bookings.findFirst({
		where: eq(bookings.id, id),
		with: {
			owner: true,
			pet: true,
			service: true,
			room: true,
			staff: true,
			stay: true
		}
	});
	if (!row) return { notFound: true };

	let petVax: string | null = null;
	if (row.pet) {
		petVax = vaccineStatus(row.pet);
	}

	const [membership, addons, cutCard] = await Promise.all([
		row.owner
			? db.query.membershipAccounts.findFirst({
					where: (t, { eq }) => eq(t.ownerId, row.owner!.id)
			  })
			: null,
		db.select().from(bookingAddons).where(eq(bookingAddons.bookingId, id)),
		row.petId
			? db.query.groomingCutCards.findFirst({
					where: (t, { eq, or }) =>
						or(eq(t.bookingId, id), eq(t.petId, row.petId!)),
					orderBy: (t, { desc }) => [desc(t.createdAt)]
			  })
			: null
	]);

	return {
		booking: row,
		petVax,
		membership,
		addons,
		cutCard,
		user
	};
};

export const actions: Actions = {
	reschedule: async ({ request, locals, params }) => {
		const actor = requireUser(locals);
		const id = Number(params.id);
		const form = await request.formData();
		const startStr = form.get("start") as string;
		const endStr = form.get("end") as string;
		if (!startStr || !endStr) return fail(400, { actionError: "Both start and end are required." });

		try {
			await rescheduleBooking(id, parseISO(startStr), parseISO(endStr), actor.id);
		} catch (e) {
			if (e instanceof BookingConflictError) return fail(409, { actionError: e.message });
			throw e;
		}
		return { ok: true };
	},

	cancel: async ({ request, locals, params }) => {
		const actor = requireUser(locals);
		const id = Number(params.id);
		const form = await request.formData();
		const reason = (form.get("reason") as string) || "Customer requested cancellation";
		await cancelBooking(id, reason, actor.id);
		return { ok: true };
	},

	checkin: async ({ locals, params }) => {
		const actor = requireUser(locals);
		const id = Number(params.id);
		try {
			await checkInBooking(id, actor.id);
		} catch (e) {
			if (e instanceof VaccineGateError || e instanceof BookingConflictError) {
				return fail(409, { actionError: e.message });
			}
			throw e;
		}
		return { ok: true };
	},

	checkout: async ({ locals, params }) => {
		const actor = requireUser(locals);
		const id = Number(params.id);
		await checkOutBooking(id);
		return { ok: true };
	},

	complete: async ({ locals, params }) => {
		const actor = requireUser(locals);
		const id = Number(params.id);
		await markCompleted(id);
		return { ok: true };
	},

	noshow: async ({ locals, params }) => {
		const actor = requireUser(locals);
		const id = Number(params.id);
		await markNoShow(id, 50000);
		return { ok: true };
	},

	earnPoints: async ({ locals, params }) => {
		requireUser(locals);
		const id = Number(params.id);
		const b = await db.query.bookings.findFirst({ where: eq(bookings.id, id) });
		if (!b) return fail(404);
		const pts = Math.max(1, Math.floor(b.priceCents / 1000));
		await applyLedger({
			type: "points",
			kind: "earn",
			ownerId: b.ownerId,
			amount: pts,
			referenceType: "booking",
			referenceId: b.id,
			description: `Earned for booking #${b.id}`
		});
		return { ok: true };
	},

	sendReminder: async ({ locals, params }) => {
		requireUser(locals);
		const id = Number(params.id);
		const b = await db.query.bookings.findFirst({
			where: eq(bookings.id, id),
			with: { owner: true }
		});
		if (!b || !b.owner) return fail(404);
		const channel = bookingChannel(b.owner);
		await queueBookingReminder({
			bookingId: b.id,
			ownerId: b.ownerId,
			channel,
			kind: "pre24h",
			to: channel === "email" ? (b.owner.email || "") : b.owner.phone,
			payload: { bookingId: b.id, startsAt: b.startsAt }
		});
		return { ok: true, reminderSent: true };
	},

	redeemPackage: async ({ locals, params }) => {
		requireUser(locals);
		const id = Number(params.id);
		const b = await db.query.bookings.findFirst({ where: eq(bookings.id, id) });
		if (!b || b.status !== "confirmed") return fail(400);
		await redeemPackageCredit({
			ownerId: b.ownerId,
			kind: b.kind,
			bookingId: b.id
		});
		return { ok: true };
	}
};
