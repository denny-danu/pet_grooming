import { db } from "$lib/server/db";
import { notifications, owners, bookings } from "$lib/server/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireUser } from "$lib/server/auth";
import { dueReminders, runNotificationDispatcher } from "$lib/server/notifications";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	requireUser(locals);
	const rows = await db
		.select({
			id: notifications.id,
			channel: notifications.channel,
			template: notifications.template,
			status: notifications.status,
			to: notifications.to,
			sentAt: notifications.sentAt,
			createdAt: notifications.createdAt,
			ownerName: owners.firstName,
			ownerLast: owners.lastName
		})
		.from(notifications)
		.leftJoin(owners, eq(notifications.ownerId, owners.id))
		.orderBy(desc(notifications.createdAt))
		.limit(100);

	return { rows };
};

export const actions: Actions = {
	dispatch: async ({ locals }) => {
		requireUser(locals);
		const queued = await dueReminders();
		const sent = await runNotificationDispatcher();
		return { dispatched: queued, sent };
	}
};
