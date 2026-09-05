import { db } from "$lib/server/db";
import { eq, sql } from "drizzle-orm";
import { requireUser } from "$lib/server/auth";
import { bookings, stays } from "$lib/server/db/schema";
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

	const membership = row.owner
		? await db.query.membershipAccounts.findFirst({
				where: (t, { eq }) => eq(t.ownerId, row.owner!.id)
		  })
		: null;

	return { booking: row, petVax, membership, user };
};

export const actions: Actions = {
	reschedule: async ({ request, locals, params }) => {
		const actor = requireUser(locals);
		const id = Number(params.id);
		const fd = await request.formData();
		const start = String(fd.get("start") ?? "");
		const end = String(fd.get("end") ?? "");
		try {
			await rescheduleBooking(id, parseISO(start), parseISO(end), actor.id);
		} catch (e) {
			if (e instanceof BookingConflictError || e instanceof VaccineGateError) return fail(409, { actionError: e.message });
			throw e;
		}
		return { ok: true };
	},
	cancel: async ({ request, locals, params }) => {
		requireUser(locals);
		const id = Number(params.id);
		const fd = await request.formData();
		const reason = String(fd.get("reason") ?? "");
		await cancelBooking(id, reason, locals.user!.id);
		return { ok: true };
	},
	checkin: async ({ locals, params }) => {
		const actor = requireUser(locals);
		try {
			await checkInBooking(Number(params.id), actor.id);
		} catch (e) {
			if (e instanceof VaccineGateError) return fail(409, { actionError: e.message });
			throw e;
		}
		return { ok: true };
	},
	checkout: async ({ locals, params }) => {
		requireUser(locals);
		await checkOutBooking(Number(params.id));
		return { ok: true };
	},
	complete: async ({ locals, params }) => {
		requireUser(locals);
		await markCompleted(Number(params.id));
		return { ok: true };
	},
	noshow: async ({ locals, params }) => {
		requireUser(locals);
		await markNoShow(Number(params.id), 2500);
		return { ok: true };
	},
	earnPoints: async ({ locals, params }) => {
		const actor = requireUser(locals);
		const id = Number(params.id);
		const row = await db.query.bookings.findFirst({
			where: eq(bookings.id, id),
			with: { owner: true }
		});
		if (!row?.owner) return fail(404, { actionError: "Booking not found" });
		const existingEarn = await db.query.ledgerEntries.findFirst({
			where: (t, { and, eq }) => and(eq(t.referenceType, "booking"), eq(t.referenceId, id), eq(t.kind, "earn"))
		});
		if (!existingEarn) {
			const points = Math.floor(row.priceCents / 100);
			await applyLedger({
				type: "points",
				kind: "earn",
				ownerId: row.ownerId,
				amount: points,
				referenceType: "booking",
				referenceId: id,
				description: `Earned ${points} pts on booking #${id}`
			});
		}
		return { ok: true };
	},
	sendReminder: async ({ locals, params }) => {
		requireUser(locals);
		const id = Number(params.id);
		const row = await db.query.bookings.findFirst({
			where: eq(bookings.id, id),
			with: { owner: true }
		});
		if (!row?.owner) return fail(404, { actionError: "Booking not found" });
		const channel = bookingChannel(row.owner);
		const to = channel === "email" ? row.owner.email ?? "" : row.owner.phone;
		await queueBookingReminder({
			bookingId: id,
			ownerId: row.ownerId,
			channel,
			kind: "pre2h",
			to,
			payload: { bookingId: id, startsAt: row.startsAt.toISOString() }
		});
		return { ok: true };
	},

	redeemPackage: async ({ locals, params }) => {
		requireUser(locals);
		const id = Number(params.id);
		const row = await db.query.bookings.findFirst({ where: eq(bookings.id, id) });
		if (!row) return fail(404, { actionError: "Booking not found" });
		const updated = await redeemPackageCredit({ ownerId: row.ownerId, kind: row.kind, bookingId: id });
		if (!updated) return fail(400, { actionError: "No matching package credits available" });
		return { ok: true };
	}
};
