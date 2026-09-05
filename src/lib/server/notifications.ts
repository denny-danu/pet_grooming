import { db } from "./db";
import { notifications, bookings, owners } from "./db/schema";
import { and, eq, gte, inArray, lt, lte } from "drizzle-orm";

export type ReminderKind = "pre24h" | "pre2h" | "vaccine" | "pickup";

export function bookingChannel(target: { preferredChannel?: string | null }): "email" | "sms" | "whatsapp" {
	if (target.preferredChannel === "sms" || target.preferredChannel === "whatsapp") return target.preferredChannel;
	return "email";
}

export async function queueBookingReminder(opts: {
	bookingId: number;
	ownerId?: number;
	channel: "email" | "sms" | "whatsapp";
	kind: ReminderKind;
	to: string;
	payload: Record<string, unknown>;
}) {
	return db.insert(notifications).values({
		bookingId: opts.bookingId,
		ownerId: opts.ownerId,
		channel: opts.channel,
		template: `booking-${opts.kind}`,
		to: opts.to,
		status: "queued",
		payload: opts.payload
	});
}

export async function dueReminders(now = new Date()) {
	const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
	const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
	const rows = await db
		.select({
			id: bookings.id,
			startsAt: bookings.startsAt,
			status: bookings.status,
			ownerId: owners.id,
			ownerName: owners.firstName,
			ownerPhone: owners.phone,
			ownerEmail: owners.email,
			preferredChannel: owners.preferredChannel
		})
		.from(bookings)
		.innerJoin(owners, eq(bookings.ownerId, owners.id))
		.where(
			and(
				inArray(bookings.status, ["confirmed"]),
				gte(bookings.startsAt, now),
				lte(bookings.startsAt, in24h)
			)
		);
	for (const row of rows) {
		const deltaH = (row.startsAt.getTime() - now.getTime()) / 3_600_000;
		const kind: ReminderKind = deltaH <= 3 ? "pre2h" : "pre24h";
		const channel = bookingChannel(row);
		const already = await db.query.notifications.findFirst({
			where: and(
				eq(notifications.bookingId, row.id),
				eq(notifications.template, `booking-${kind}`),
				inArray(notifications.status, ["queued", "sent", "delivered"])
			)
		});
		if (already) continue;
		await queueBookingReminder({
			bookingId: row.id,
			ownerId: row.ownerId,
			channel,
			kind,
			to: channel === "email" ? row.ownerEmail ?? "" : row.ownerPhone,
			payload: { bookingId: row.id, startsAt: row.startsAt.toISOString() }
		});
	}
	return rows.length;
}

export async function runNotificationDispatcher(now = new Date()) {
	const queued = await db
		.select()
		.from(notifications)
		.where(and(eq(notifications.status, "queued"), lt(notifications.createdAt, new Date(now.getTime() + 5000))));
	let sent = 0;
	for (const n of queued) {
		// Transport stub: mark as delivered. Real impl would call SMS/WhatsApp/email gateway.
		const [updated] = await db
			.update(notifications)
			.set({ status: "delivered", sentAt: new Date() })
			.where(eq(notifications.id, n.id))
			.returning();
		if (updated) sent++;
	}
	return sent;
}
