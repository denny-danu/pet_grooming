import { describe, it, expect } from "vitest";
import { rangesOverlap, filterConflictingBusy, bookingIsActive } from "../overlap";
import { vaccineStatus } from "../vaccine-gate";

describe("rangesOverlap", () => {
	it("returns true when bookings overlap", () => {
		expect(rangesOverlap(100, 200, 150, 250)).toBe(true);
		expect(rangesOverlap(100, 200, 50, 150)).toBe(true);
		expect(rangesOverlap(100, 200, 100, 200)).toBe(true);
	});
	it("returns false when touching but not overlapping", () => {
		expect(rangesOverlap(100, 200, 200, 300)).toBe(false);
		expect(rangesOverlap(100, 200, 0, 100)).toBe(false);
	});
});

describe("filterConflictingBusy", () => {
	const busy = [
		{ startsAt: new Date(2026, 0, 1, 10, 0), endsAt: new Date(2026, 0, 1, 11, 30) },
		{ startsAt: new Date(2026, 0, 1, 14, 0), endsAt: new Date(2026, 0, 1, 15, 0) }
	];
	const day = new Date(2026, 0, 1);
	const at = (h: number, m = 0) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m).getTime();

	it("does not flag slot fully before busy", () => {
		expect(filterConflictingBusy(busy, at(9), at(10))).toBe(false);
	});
	it("flags slot that overlaps existing booking", () => {
		expect(filterConflictingBusy(busy, at(11), at(12))).toBe(true);
	});
	it("does not flag gap slot between bookings", () => {
		expect(filterConflictingBusy(busy, at(12), at(13))).toBe(false);
	});
});

describe("bookingIsActive", () => {
	it("accepts schedulable statuses", () => {
		expect(bookingIsActive("pending")).toBe(true);
		expect(bookingIsActive("confirmed")).toBe(true);
		expect(bookingIsActive("checked_in")).toBe(true);
	});
	it("rejects closed statuses", () => {
		expect(bookingIsActive("completed")).toBe(false);
		expect(bookingIsActive("cancelled")).toBe(false);
		expect(bookingIsActive("no_show")).toBe(false);
	});
});

describe("vaccineStatus", () => {
	it("missing when no due date", () => {
		expect(vaccineStatus({ vaccinationDueDate: null })).toBe("missing");
	});
	it("expired when past due", () => {
		expect(vaccineStatus({ vaccinationDueDate: new Date(Date.now() - 86400000) })).toBe("expired");
	});
	it("expiring within 30 days", () => {
		expect(vaccineStatus({ vaccinationDueDate: new Date(Date.now() + 10 * 86400000) })).toBe("expiring");
	});
	it("valid when far future", () => {
		expect(vaccineStatus({ vaccinationDueDate: new Date(Date.now() + 90 * 86400000) })).toBe("valid");
	});
});
