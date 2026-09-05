import { db } from "./db";
import { bookings } from "./db/schema";
import { and, eq, gte, inArray, lte, ne } from "drizzle-orm";
import { bookingIsActive, rangesOverlap } from "./overlap";

export type BookingConflict = {
	bookingId: number;
	startsAt: Date;
	endsAt: Date;
};

export class BookingConflictError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "BookingConflictError";
	}
}

export async function findConflicts(opts: {
	kind: "grooming" | "hotel" | "aquarium";
	excludeBookingId?: number;
	staffId?: number | null;
	roomId?: number | null;
	startsAt: Date;
	endsAt: Date;
}): Promise<BookingConflict[]> {
	const { kind, staffId, roomId, startsAt, endsAt, excludeBookingId } = opts;
	if (kind === "grooming" && staffId) {
		return listOverlaps({ resourceCol: bookings.staffId, resourceId: staffId, startsAt, endsAt, excludeBookingId });
	}
	if (kind === "hotel" && roomId) {
		return listOverlaps({ resourceCol: bookings.roomId, resourceId: roomId, startsAt, endsAt, excludeBookingId });
	}
	return [];
}

async function listOverlaps(opts: {
	resourceCol: typeof bookings.staffId | typeof bookings.roomId;
	resourceId: number;
	startsAt: Date;
	endsAt: Date;
	excludeBookingId?: number;
}): Promise<BookingConflict[]> {
	const { resourceCol, resourceId, startsAt, endsAt, excludeBookingId } = opts;
	return db
		.select({ bookingId: bookings.id, startsAt: bookings.startsAt, endsAt: bookings.endsAt })
		.from(bookings)
		.where(
			and(
				eq(resourceCol, resourceId),
				inArray(bookings.status, ["pending", "confirmed", "checked_in"]),
				lte(bookings.startsAt, endsAt),
				gte(bookings.endsAt, startsAt),
				excludeBookingId ? ne(bookings.id, excludeBookingId) : undefined
			)
		);
}

export function assertNoConflict(conflicts: BookingConflict[]): void {
	if (conflicts.length > 0) {
		throw new BookingConflictError(`Time slot conflicts with booking #${conflicts[0].bookingId}`);
	}
}

export { rangesOverlap };
