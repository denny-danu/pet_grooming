import { db } from "./db";
import { bookings, staff } from "./db/schema";
import { and, gte, lte, eq, inArray, ne, sql } from "drizzle-orm";
import { addMinutes } from "date-fns";

export const OPEN_HOUR_START = 9;
export const OPEN_HOUR_END = 18;
export const SLOT_MIN = 15;

export type GroomingSlot = { start: Date; end: Date };

export async function freeGroomingSlots(opts: {
	staffId: number;
	durationMin: number;
	day: Date;
	excludeBookingId?: number;
}): Promise<GroomingSlot[]> {
	const { staffId, durationMin, day, excludeBookingId } = opts;
	const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), OPEN_HOUR_START, 0, 0);
	const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), OPEN_HOUR_END, 0, 0);

	const busy = await db
		.select({ startsAt: bookings.startsAt, endsAt: bookings.endsAt })
		.from(bookings)
		.where(
			and(
				eq(bookings.staffId, staffId),
				inArray(bookings.status, ["pending", "confirmed", "checked_in"]),
				gte(bookings.endsAt, dayStart),
				lte(bookings.startsAt, dayEnd),
				excludeBookingId ? ne(bookings.id, excludeBookingId) : undefined
			)
		);

	const busyRanges = busy.map((b) => [b.startsAt.getTime(), b.endsAt.getTime()] as [number, number]);

	const slots: GroomingSlot[] = [];
	for (let t = dayStart.getTime(); t + durationMin * 60_000 <= dayEnd.getTime(); t += SLOT_MIN * 60_000) {
		const s = t;
		const e = t + durationMin * 60_000;
		const overlaps = busyRanges.some(([bs, be]) => s < be && e > bs);
		if (!overlaps) slots.push({ start: new Date(s), end: new Date(e) });
	}
	return slots;
}
