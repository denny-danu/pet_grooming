export function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
	return aStart < bEnd && aEnd > bStart;
}

export function filterConflictingBusy(
	busy: { startsAt: Date; endsAt: Date }[],
	candidateStart: number,
	candidateEnd: number
): boolean {
	return busy.some((b) => rangesOverlap(candidateStart, candidateEnd, b.startsAt.getTime(), b.endsAt.getTime()));
}

export function bookingIsActive(status: string): boolean {
	return ["pending", "confirmed", "checked_in"].includes(status);
}
