import { db } from "./db";
import { bookings, services, rooms, stays, pets } from "./db/schema";
import { eq } from "drizzle-orm";
import { BookingConflictError, assertNoConflict, findConflicts } from "./booking-engine";
import { vaccineGate } from "./vaccine-gate";

type BookingKind = typeof bookings.$inferSelect.kind;

export type NewBooking = {
	kind: BookingKind;
	ownerId: number;
	petId?: number | null;
	serviceId?: number | null;
	roomId?: number | null;
	staffId?: number | null;
	startsAt: Date;
	endsAt: Date;
	priceCents: number;
	depositCents?: number;
	notes?: string;
};

export async function createBooking(input: NewBooking, actorId: number) {
	if (input.kind === "hotel") {
		if (!input.roomId) throw new BookingConflictError("Hotel booking requires a room");
		if (!input.petId) throw new BookingConflictError("Hotel booking requires a pet");
		await vaccineGate(input.petId, input.startsAt);
	}
	if (input.kind === "grooming" && !input.staffId) {
		throw new BookingConflictError("Grooming requires a staff assignment");
	}
	const conflicts = await findConflicts({
		kind: input.kind,
		staffId: input.staffId,
		roomId: input.roomId,
		startsAt: input.startsAt,
		endsAt: input.endsAt
	});
	assertNoConflict(conflicts);

	const [booking] = await db
		.insert(bookings)
		.values({
			kind: input.kind,
			ownerId: input.ownerId,
			petId: input.petId,
			serviceId: input.serviceId,
			roomId: input.roomId,
			staffId: input.staffId,
			startsAt: input.startsAt,
			endsAt: input.endsAt,
			priceCents: input.priceCents,
			depositCents: input.depositCents ?? 0,
			notes: input.notes,
			status: "confirmed",
			confirmedAt: new Date()
		})
		.returning();

	if (input.kind === "hotel" && input.roomId) {
		await insertStay(input, booking.id, input.roomId);
	}

	return booking;
}

export async function rescheduleBooking(
	bookingId: number,
	startsAt: Date,
	endsAt: Date,
	actorId: number
) {
	const existing = await db.query.bookings.findFirst({ where: eq(bookings.id, bookingId) });
	if (!existing) throw new Error("Booking not found");
	if (["completed", "cancelled", "no_show"].includes(existing.status)) {
		throw new BookingConflictError("Cannot reschedule a closed booking");
	}
	if (existing.kind === "hotel") {
		await vaccineGate(existing.petId!, startsAt);
	}
	const conflicts = await findConflicts({
		kind: existing.kind,
		staffId: existing.staffId,
		roomId: existing.roomId,
		startsAt,
		endsAt,
		excludeBookingId: bookingId
	});
	assertNoConflict(conflicts);
	const [updated] = await db
		.update(bookings)
		.set({ startsAt, endsAt, status: "confirmed", confirmedAt: new Date() })
		.where(eq(bookings.id, bookingId))
		.returning();
	if (existing.kind === "hotel") {
		await db
			.update(stays)
			.set({
				checkInDate: startsAt.toISOString().slice(0, 10),
				checkOutDate: endsAt.toISOString().slice(0, 10)
			})
			.where(eq(stays.bookingId, bookingId));
	}
	return updated;
}

export async function cancelBooking(
	bookingId: number,
	reason: string,
	actorId: number
) {
	const existing = await db.query.bookings.findFirst({ where: eq(bookings.id, bookingId) });
	if (!existing) throw new Error("Booking not found");
	if (["completed", "cancelled", "no_show"].includes(existing.status)) {
		throw new BookingConflictError("Cannot cancel a closed booking");
	}
	const [updated] = await db
		.update(bookings)
		.set({ status: "cancelled", cancelReason: reason, updatedAt: new Date() })
		.where(eq(bookings.id, bookingId))
		.returning();
	return updated;
}

async function insertStay(input: NewBooking, bookingId: number, roomId: number) {
	const nightCount = Math.round((input.endsAt.getTime() - input.startsAt.getTime()) / 86_400_000);
	await db.insert(stays).values({
		bookingId,
		roomId,
		checkInDate: input.startsAt.toISOString().slice(0, 10),
		checkOutDate: input.endsAt.toISOString().slice(0, 10),
		nightCount,
		petCareJson: {}
	});
}

export async function checkInBooking(bookingId: number, actorId: number, vaccineVerifiedBy?: number) {
	const existing = await db.query.bookings.findFirst({ where: eq(bookings.id, bookingId) });
	if (!existing) throw new Error("Booking not found");
	if (existing.status !== "confirmed") throw new BookingConflictError("Only confirmed bookings can be checked in");
	if (existing.kind === "hotel") {
		await vaccineGate(existing.petId!, new Date());
	}
	const [updated] = await db
		.update(bookings)
		.set({ status: "checked_in", checkedInAt: new Date() })
		.where(eq(bookings.id, bookingId))
		.returning();
	if (existing.kind === "hotel") {
		await db
			.update(stays)
			.set({ vaccineVerifiedAt: new Date(), vaccineVerifiedBy: vaccineVerifiedBy ?? actorId })
			.where(eq(stays.bookingId, bookingId));
	}
	return updated;
}

export async function checkOutBooking(bookingId: number) {
	const existing = await db.query.bookings.findFirst({ where: eq(bookings.id, bookingId) });
	if (!existing) throw new Error("Booking not found");
	if (existing.status !== "checked_in") throw new BookingConflictError("Only checked-in bookings can be checked out");
	const [updated] = await db
		.update(bookings)
		.set({ status: "completed", checkedOutAt: new Date() })
		.where(eq(bookings.id, bookingId))
		.returning();
	return updated;
}

export async function markCompleted(bookingId: number) {
	const existing = await db.query.bookings.findFirst({ where: eq(bookings.id, bookingId) });
	if (!existing) throw new Error("Booking not found");
	if (!["confirmed", "checked_in"].includes(existing.status)) {
		throw new BookingConflictError("Booking is not in a completable state");
	}
	const [updated] = await db
		.update(bookings)
		.set({ status: "completed", checkedOutAt: new Date() })
		.where(eq(bookings.id, bookingId))
		.returning();
	return updated;
}

export async function markNoShow(bookingId: number, noShowFeeCents = 0) {
	const existing = await db.query.bookings.findFirst({ where: eq(bookings.id, bookingId) });
	if (!existing) throw new Error("Booking not found");
	if (!["pending", "confirmed"].includes(existing.status)) {
		throw new BookingConflictError("Only pending/confirmed bookings can be no-show");
	}
	const [updated] = await db
		.update(bookings)
		.set({ status: "no_show", updatedAt: new Date() })
		.where(eq(bookings.id, bookingId))
		.returning();
	return updated;
}

export { BookingConflictError };
