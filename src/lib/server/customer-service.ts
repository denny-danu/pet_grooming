import { db } from "./db";
import { owners, pets, bookings, membershipAccounts, packagePurchases, ledgerEntries, notifications } from "./db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function getCustomerWithRelations(ownerId: number) {
	const customer = await db.query.owners.findFirst({
		where: eq(owners.id, ownerId),
		with: {
			pets: true
		}
	});
	if (!customer) return null;

	const account = await db.query.membershipAccounts.findFirst({
		where: eq(membershipAccounts.ownerId, ownerId)
	});

	const history = await db.query.bookings.findMany({
		where: eq(bookings.ownerId, ownerId),
		with: { pet: true, service: true, staff: true, stay: true },
		orderBy: (t, { desc }) => [desc(t.startsAt)],
		limit: 50
	});

	const packages = await db.query.packagePurchases.findMany({
		where: eq(packagePurchases.ownerId, ownerId),
		orderBy: (t, { desc }) => [desc(t.purchasedAt)]
	});

	const ledgers = await db.query.ledgerEntries.findMany({
		where: eq(ledgerEntries.ownerId, ownerId),
		orderBy: (t, { desc }) => [desc(t.createdAt)],
		limit: 30
	});

	const recentNotifs = await db.query.notifications.findMany({
		where: eq(notifications.ownerId, ownerId),
		orderBy: (t, { desc }) => [desc(t.createdAt)],
		limit: 10
	});

	return { customer, account, history, packages, ledgers, recentNotifs };
}
