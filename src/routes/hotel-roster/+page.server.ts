import { db } from "$lib/server/db";
import { bookings, dailyCareLogs, owners, pets, rooms, staff, stays } from "$lib/server/db/schema";
import { and, eq, gte, lte, or, notInArray } from "drizzle-orm";
import { requireUser } from "$lib/server/auth";
import { fail } from "@sveltejs/kit";
import { addDays, format, isValid, parseISO, startOfDay } from "date-fns";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
	requireUser(locals);

	const dateParam = url.searchParams.get("date");
	let selectedDateObj: Date;
	if (dateParam && isValid(parseISO(dateParam))) {
		selectedDateObj = startOfDay(parseISO(dateParam));
	} else {
		selectedDateObj = startOfDay(new Date());
	}

	const selectedDate = format(selectedDateObj, "yyyy-MM-dd");
	const prevDate = format(addDays(selectedDateObj, -1), "yyyy-MM-dd");
	const nextDate = format(addDays(selectedDateObj, 1), "yyyy-MM-dd");
	const todayDate = format(startOfDay(new Date()), "yyyy-MM-dd");
	const isToday = selectedDate === todayDate;

	// 1. Fetch all hotel rooms
	const allRooms = await db.query.rooms.findMany({
		where: (r, { eq }) => eq(r.active, true),
		orderBy: (r, { asc }) => [asc(r.id)]
	});

	// 2. Fetch active stays on the selected date (checkInDate <= selectedDate <= checkOutDate)
	const activeStays = await db.query.stays.findMany({
		where: (s, { and, lte, gte }) =>
			and(lte(s.checkInDate, selectedDate), gte(s.checkOutDate, selectedDate)),
		with: {
			room: true,
			booking: {
				with: {
					pet: true,
					owner: true,
					staff: true
				}
			}
		}
	});

	// Filter out cancelled / no-show bookings
	const validStays = activeStays.filter(
		(s) => s.booking && s.booking.status !== "cancelled" && s.booking.status !== "no_show"
	);

	// Also find direct hotel bookings on this date in case stay row was delayed
	const activeBookings = await db.query.bookings.findMany({
		where: (b, { and, eq, notInArray, gte, lte }) =>
			and(
				eq(b.kind, "hotel"),
				notInArray(b.status, ["cancelled", "no_show"]),
				lte(b.startsAt, new Date(`${selectedDate}T23:59:59.999Z`)),
				gte(b.endsAt, new Date(`${selectedDate}T00:00:00.000Z`))
			),
		with: {
			pet: true,
			owner: true,
			room: true,
			staff: true,
			stay: true
		}
	});

	// 3. Fetch daily care logs for the selected date
	const logs = await db.query.dailyCareLogs.findMany({
		where: (l, { eq }) => eq(l.careDate, selectedDate)
	});

	const logsByBookingId = new Map<number, (typeof logs)[0]>();
	for (const log of logs) {
		logsByBookingId.set(log.bookingId, log);
	}

	// 4. Fetch all active staff
	const staffList = await db.query.staff.findMany({
		where: (s, { eq }) => eq(s.active, true),
		orderBy: (s, { asc }) => [asc(s.name)]
	});
	const staffMap = new Map<number, string>();
	for (const st of staffList) {
		staffMap.set(st.id, st.name);
	}

	// 5. Build Room Suite Roster
	const suiteRoster = allRooms.map((room) => {
		const stayMatch = validStays.find((s) => s.roomId === room.id);
		const bookingMatch =
			stayMatch?.booking ?? activeBookings.find((b) => b.roomId === room.id);

		if (stayMatch && bookingMatch && bookingMatch.pet && bookingMatch.owner) {
			const log = logsByBookingId.get(bookingMatch.id);
			return {
				room,
				occupied: true,
				stay: {
					id: stayMatch.id,
					checkInDate: stayMatch.checkInDate,
					checkOutDate: stayMatch.checkOutDate,
					nightCount: stayMatch.nightCount,
					petCareJson: stayMatch.petCareJson ?? {},
					vaccineVerifiedAt: stayMatch.vaccineVerifiedAt
				},
				booking: {
					id: bookingMatch.id,
					status: bookingMatch.status,
					startsAt: bookingMatch.startsAt,
					endsAt: bookingMatch.endsAt,
					notes: bookingMatch.notes,
					priceCents: bookingMatch.priceCents
				},
				pet: bookingMatch.pet,
				owner: bookingMatch.owner,
				staff: bookingMatch.staff,
				careLog: {
					id: log?.id ?? null,
					feedingAmDone: log?.feedingAmDone ?? false,
					feedingPmDone: log?.feedingPmDone ?? false,
					walkAmDone: log?.walkAmDone ?? false,
					walkPmDone: log?.walkPmDone ?? false,
					medicationDone: log?.medicationDone ?? false,
					moodNotes: log?.moodNotes ?? "",
					photoUrl: log?.photoUrl ?? "",
					staffId: log?.staffId ?? null,
					staffName: log?.staffId ? (staffMap.get(log.staffId) ?? null) : null,
					updatedAt: log?.updatedAt ?? null
				}
			};
		}

		return {
			room,
			occupied: false,
			stay: null,
			booking: null,
			pet: null,
			owner: null,
			staff: null,
			careLog: null
		};
	});

	// Check if there are any stays unassigned to standard rooms
	const unassignedStays = validStays
		.filter(
			(s) => !allRooms.some((r) => r.id === s.roomId) && s.booking?.pet && s.booking?.owner
		)
		.map((s) => {
			const b = s.booking!;
			const log = logsByBookingId.get(b.id);
			return {
				room: s.room ?? {
					id: s.roomId,
					name: "Unassigned Suite",
					sizeLabel: "Standard",
					kind: "hotel",
					capacity: 1,
					maxPetWeightKg: null,
					pricePerNightCents: 0,
					active: true
				},
				occupied: true,
				stay: {
					id: s.id,
					checkInDate: s.checkInDate,
					checkOutDate: s.checkOutDate,
					nightCount: s.nightCount,
					petCareJson: s.petCareJson ?? {},
					vaccineVerifiedAt: s.vaccineVerifiedAt
				},
				booking: {
					id: b.id,
					status: b.status,
					startsAt: b.startsAt,
					endsAt: b.endsAt,
					notes: b.notes,
					priceCents: b.priceCents
				},
				pet: b.pet!,
				owner: b.owner!,
				staff: b.staff,
				careLog: {
					id: log?.id ?? null,
					feedingAmDone: log?.feedingAmDone ?? false,
					feedingPmDone: log?.feedingPmDone ?? false,
					walkAmDone: log?.walkAmDone ?? false,
					walkPmDone: log?.walkPmDone ?? false,
					medicationDone: log?.medicationDone ?? false,
					moodNotes: log?.moodNotes ?? "",
					photoUrl: log?.photoUrl ?? "",
					staffId: log?.staffId ?? null,
					staffName: log?.staffId ? (staffMap.get(log.staffId) ?? null) : null,
					updatedAt: log?.updatedAt ?? null
				}
			};
		});

	const fullRoster = [...suiteRoster, ...unassignedStays];
	const occupiedSuites = fullRoster.filter((r) => r.occupied);

	// Summary Metrics
	const totalSuites = allRooms.length;
	const occupiedCount = occupiedSuites.length;
	const amFeedingsDone = occupiedSuites.filter((s) => s.careLog?.feedingAmDone).length;
	const pmFeedingsDone = occupiedSuites.filter((s) => s.careLog?.feedingPmDone).length;
	const walksCompleted = occupiedSuites.reduce((acc, s) => {
		let c = 0;
		if (s.careLog?.walkAmDone) c++;
		if (s.careLog?.walkPmDone) c++;
		return acc + c;
	}, 0);
	const totalWalksExpected = occupiedSuites.reduce((acc, s) => {
		const perDay = (s.stay?.petCareJson as { walksPerDay?: number })?.walksPerDay ?? 2;
		return acc + perDay;
	}, 0);

	const petsWithMeds = occupiedSuites.filter((s) => {
		const petCare = s.stay?.petCareJson as { medication?: string; meds?: string };
		return (
			(petCare?.medication && petCare.medication.trim() !== "") ||
			(petCare?.meds && petCare.meds.trim() !== "") ||
			(s.pet?.healthNotes && s.pet.healthNotes.toLowerCase().includes("med"))
		);
	});
	const medsVerified = petsWithMeds.filter((s) => s.careLog?.medicationDone).length;

	return {
		selectedDate,
		prevDate,
		nextDate,
		todayDate,
		isToday,
		roster: fullRoster,
		staffList,
		metrics: {
			totalSuites,
			occupiedCount,
			occupancyRate: totalSuites > 0 ? Math.round((occupiedCount / totalSuites) * 100) : 0,
			amFeedingsDone,
			pmFeedingsDone,
			walksCompleted,
			totalWalksExpected,
			medsVerified,
			medsTotal: petsWithMeds.length
		}
	};
};

export const actions: Actions = {
	toggleCare: async ({ request, locals }) => {
		const actor = requireUser(locals);
		const fd = await request.formData();
		const bookingId = Number(fd.get("bookingId"));
		const petId = Number(fd.get("petId"));
		const careDate = String(fd.get("careDate") ?? "");
		const field = String(fd.get("field") ?? "");
		const currentValue = fd.get("currentValue") === "true";
		const nextValue = !currentValue;

		if (!bookingId || !petId || !careDate || !field) {
			return fail(400, { error: "Missing required parameters for toggleCare" });
		}

		const validFields = [
			"feedingAmDone",
			"feedingPmDone",
			"walkAmDone",
			"walkPmDone",
			"medicationDone"
		];
		if (!validFields.includes(field)) {
			return fail(400, { error: "Invalid care task field" });
		}

		const existing = await db.query.dailyCareLogs.findFirst({
			where: (l, { and, eq }) => and(eq(l.bookingId, bookingId), eq(l.careDate, careDate))
		});

		if (existing) {
			await db
				.update(dailyCareLogs)
				.set({
					[field]: nextValue,
					staffId: actor.id,
					updatedAt: new Date()
				})
				.where(eq(dailyCareLogs.id, existing.id));
		} else {
			await db.insert(dailyCareLogs).values({
				bookingId,
				petId,
				careDate,
				[field]: nextValue,
				staffId: actor.id
			});
		}

		return { success: true, field, value: nextValue };
	},

	saveNotes: async ({ request, locals }) => {
		const actor = requireUser(locals);
		const fd = await request.formData();
		const bookingId = Number(fd.get("bookingId"));
		const petId = Number(fd.get("petId"));
		const careDate = String(fd.get("careDate") ?? "");
		const moodNotes = String(fd.get("moodNotes") ?? "");
		const photoUrl = fd.get("photoUrl") ? String(fd.get("photoUrl")) : null;

		if (!bookingId || !petId || !careDate) {
			return fail(400, { error: "Missing required parameters for saveNotes" });
		}

		const existing = await db.query.dailyCareLogs.findFirst({
			where: (l, { and, eq }) => and(eq(l.bookingId, bookingId), eq(l.careDate, careDate))
		});

		if (existing) {
			await db
				.update(dailyCareLogs)
				.set({
					moodNotes,
					photoUrl: photoUrl ?? existing.photoUrl,
					staffId: actor.id,
					updatedAt: new Date()
				})
				.where(eq(dailyCareLogs.id, existing.id));
		} else {
			await db.insert(dailyCareLogs).values({
				bookingId,
				petId,
				careDate,
				moodNotes,
				photoUrl,
				staffId: actor.id
			});
		}

		return { success: true, savedNotes: true };
	}
};
