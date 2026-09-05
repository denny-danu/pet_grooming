import { db } from "./db";
import { membershipAccounts, ledgerEntries, packagePurchases } from "./db/schema";
import { eq, and, gt } from "drizzle-orm";

type LedgerColumnKind = typeof ledgerEntries.$inferSelect.kind;
type LedgerColumnType = typeof ledgerEntries.$inferSelect.type;

export type LedgerOp = {
	type: LedgerColumnType;
	kind: LedgerColumnKind;
	ownerId: number;
	amount: number;
	referenceType?: string;
	referenceId?: number;
	description?: string;
};

export class InsufficientCreditsError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "InsufficientCreditsError";
	}
}

export async function getOrCreateMembership(ownerId: number) {
	const existing = await db.query.membershipAccounts.findFirst({ where: eq(membershipAccounts.ownerId, ownerId) });
	if (existing) return existing;
	const [created] = await db.insert(membershipAccounts).values({ ownerId }).returning();
	return created;
}

async function recomputeTier(accountId: number, points: number) {
	const tier = await db.query.membershipTiers.findFirst({
		where: (t, { lte }) => lte(t.minPoints, points),
		orderBy: (t, { desc }) => [desc(t.minPoints)]
	});
	if (tier) {
		await db.update(membershipAccounts).set({ tier: tier.name }).where(eq(membershipAccounts.id, accountId));
	}
}

export async function applyLedger(op: LedgerOp) {
	const account = await getOrCreateMembership(op.ownerId);
	let newBalance: number;
	if (op.type === "points") {
		newBalance = account.pointsBalance + op.amount;
		if (newBalance < 0) throw new InsufficientCreditsError("Not enough points");
	const [updated] = await db
		.update(membershipAccounts)
		.set({
			pointsBalance: newBalance,
			updatedAt: new Date()
		})
		.where(eq(membershipAccounts.id, account.id))
		.returning();
	await recomputeTier(account.id, newBalance);
	await db.insert(ledgerEntries).values({
			type: "points",
			kind: op.kind,
			ownerId: op.ownerId,
			amount: op.amount,
			balanceAfter: newBalance,
			referenceType: op.referenceType,
			referenceId: op.referenceId,
			description: op.description
		});
		return updated;
	}
	throw new Error(`Unsupported ledger type ${op.type}`);
}

export async function redeemPackageCredit(opts: {
	ownerId: number;
	kind: "grooming" | "hotel" | "aquarium";
	bookingId: number;
}) {
	const purchase = await db.query.packagePurchases.findFirst({
		where: and(
			eq(packagePurchases.ownerId, opts.ownerId),
			eq(packagePurchases.kind, opts.kind),
			gt(packagePurchases.creditsRemaining, 0)
		),
		orderBy: (t, { asc }) => [asc(t.purchasedAt)]
	});
	if (!purchase) return null;
	const remaining = purchase.creditsRemaining - 1;
	const [updated] = await db
		.update(packagePurchases)
		.set({ creditsRemaining: remaining })
		.where(eq(packagePurchases.id, purchase.id))
		.returning();
	await db.insert(ledgerEntries).values({
		type: "package",
		kind: "redeem",
		ownerId: opts.ownerId,
		amount: -1,
		balanceAfter: remaining,
		referenceType: "booking",
		referenceId: opts.bookingId,
		description: `Redeemed ${purchase.packageName} credit`
	});
	return updated;
}

export function pointsForService(opts: { priceCents: number; pointsPerCent: number; pointsPerService: number }) {
	return Math.max(opts.pointsPerService, Math.floor(opts.priceCents / 100) * opts.pointsPerCent);
}
