import { db } from "$lib/server/db";
import {
	productCategories,
	products,
	orders,
	orderItems,
	owners,
	pets,
	membershipAccounts,
	membershipTiers,
	staff
} from "$lib/server/db/schema";
import { eq, asc, desc, inArray, sql } from "drizzle-orm";
import { requireUser } from "$lib/server/auth";
import { applyLedger, getOrCreateMembership, InsufficientCreditsError } from "$lib/server/membership";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);

	const [categoriesList, productsList, ownersList, allPets, tiersList, recentOrders] = await Promise.all([
		db.select().from(productCategories).orderBy(asc(productCategories.name)),
		db
			.select({
				id: products.id,
				categoryId: products.categoryId,
				name: products.name,
				sku: products.sku,
				barcode: products.barcode,
				description: products.description,
				priceCents: products.priceCents,
				stockQty: products.stockQty,
				lowStockThreshold: products.lowStockThreshold,
				unit: products.unit,
				active: products.active,
				categoryName: productCategories.name,
				categorySlug: productCategories.slug,
				categoryIcon: productCategories.icon
			})
			.from(products)
			.leftJoin(productCategories, eq(products.categoryId, productCategories.id))
			.where(eq(products.active, true))
			.orderBy(asc(products.name)),
		db
			.select({
				id: owners.id,
				firstName: owners.firstName,
				lastName: owners.lastName,
				phone: owners.phone,
				email: owners.email,
				tier: membershipAccounts.tier,
				pointsBalance: membershipAccounts.pointsBalance
			})
			.from(owners)
			.leftJoin(membershipAccounts, eq(membershipAccounts.ownerId, owners.id))
			.orderBy(asc(owners.lastName)),
		db.select().from(pets).orderBy(asc(pets.name)),
		db.select().from(membershipTiers),
		db.query.orders.findMany({
			orderBy: [desc(orders.createdAt)],
			limit: 50
		})
	]);

	// Group pets by owner
	const petsByOwner = new Map<number, typeof allPets>();
	for (const pet of allPets) {
		const list = petsByOwner.get(pet.ownerId) ?? [];
		list.push(pet);
		petsByOwner.set(pet.ownerId, list);
	}

	const enrichedCustomers = ownersList.map((c) => ({
		...c,
		pets: petsByOwner.get(c.id) ?? []
	}));

	// Group order items for recent orders
	let recentOrderItemsMap = new Map<number, typeof orderItems.$inferSelect[]>();
	if (recentOrders.length > 0) {
		const orderIds = recentOrders.map((o) => o.id);
		const allItems = await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds));
		for (const it of allItems) {
			const list = recentOrderItemsMap.get(it.orderId) ?? [];
			list.push(it);
			recentOrderItemsMap.set(it.orderId, list);
		}
	}

	const enrichedOrders = recentOrders.map((o) => ({
		...o,
		items: recentOrderItemsMap.get(o.id) ?? []
	}));

	return {
		user,
		categories: categoriesList,
		products: productsList,
		customers: enrichedCustomers,
		tiers: tiersList,
		recentOrders: enrichedOrders
	};
};

type CartItemInput = {
	productId: number;
	name?: string;
	unitPriceCents: number;
	quantity: number;
};

export const actions: Actions = {
	checkout: async ({ request, locals }) => {
		const cashier = requireUser(locals);
		const form = await request.formData();

		const rawCart = form.get("cart") as string;
		const ownerId = Number(form.get("ownerId") || 0) || null;
		const petId = Number(form.get("petId") || 0) || null;
		const paymentMethod = (form.get("paymentMethod") as string) || "cash";
		const discountCents = Math.max(0, Number(form.get("discountCents") || 0));
		const notes = (form.get("notes") as string) || null;

		if (!rawCart) {
			return fail(400, { checkoutError: "Cart is empty." });
		}

		let items: CartItemInput[] = [];
		try {
			items = JSON.parse(rawCart);
		} catch {
			return fail(400, { checkoutError: "Invalid cart data payload." });
		}

		if (!items || items.length === 0) {
			return fail(400, { checkoutError: "Cart contains no items." });
		}

		// Calculate subtotal
		let subtotalCents = 0;
		for (const it of items) {
			if (!it.productId || it.quantity <= 0) {
				return fail(400, { checkoutError: "Invalid item quantity in cart." });
			}
			subtotalCents += it.unitPriceCents * it.quantity;
		}

		const totalCents = Math.max(0, subtotalCents - discountCents);

		// Handle payment via loyalty points if selected
		if (paymentMethod === "points" && ownerId) {
			const requiredPoints = Math.ceil(totalCents / 100);
			try {
				await applyLedger({
					type: "points",
					kind: "redeem",
					ownerId,
					amount: -requiredPoints,
					referenceType: "retail_order",
					description: `Redeemed ${requiredPoints} points for retail purchase`
				});
			} catch (err) {
				if (err instanceof InsufficientCreditsError) {
					return fail(400, { checkoutError: "Customer does not have enough points balance for this purchase." });
				}
				return fail(400, { checkoutError: "Points redemption failed." });
			}
		}

		// Generate unique order number
		const todayCode = new Date().toISOString().slice(2, 10).replace(/-/g, "");
		const randomSuffix = Math.floor(1000 + Math.random() * 9000);
		const orderNumber = `POS-${todayCode}-${randomSuffix}`;

		// Insert order record
		const [order] = await db
			.insert(orders)
			.values({
				orderNumber,
				ownerId,
				petId,
				totalCents,
				discountCents,
				paymentMethod,
				paymentStatus: "paid",
				notes,
				actorStaffId: cashier.id
			})
			.returning();

		// Insert line items & deduct stock
		const createdLineItems = [];
		for (const it of items) {
			const subtotal = it.unitPriceCents * it.quantity;
			const [lineItem] = await db
				.insert(orderItems)
				.values({
					orderId: order.id,
					productId: it.productId,
					productName: it.name ?? "Retail Product",
					unitPriceCents: it.unitPriceCents,
					quantity: it.quantity,
					subtotalCents: subtotal
				})
				.returning();

			createdLineItems.push(lineItem);

			// Deduct stock from products inventory
			await db
				.update(products)
				.set({
					stockQty: sql`greatest(0, ${products.stockQty} - ${it.quantity})`
				})
				.where(eq(products.id, it.productId));
		}

		// Award loyalty points for regular payments if customer is attached
		let pointsEarned = 0;
		if (ownerId && paymentMethod !== "points" && totalCents > 0) {
			pointsEarned = Math.max(1, Math.floor(totalCents / 1000));
			try {
				await applyLedger({
					type: "points",
					kind: "earn",
					ownerId,
					amount: pointsEarned,
					referenceType: "retail_order",
					referenceId: order.id,
					description: `Earned for retail order #${order.orderNumber}`
				});
			} catch (e) {
				console.error("Failed to award points for order", e);
			}
		}

		return {
			checkoutSuccess: true,
			order: {
				id: order.id,
				orderNumber: order.orderNumber,
				totalCents: order.totalCents,
				discountCents: order.discountCents,
				paymentMethod: order.paymentMethod,
				createdAt: order.createdAt,
				cashierName: cashier.name,
				customerName: ownerId ? "Registered Member" : "Walk-in Customer",
				petName: null,
				pointsEarned,
				items: items.map((i) => ({
					name: i.name ?? "Item",
					quantity: i.quantity,
					unitPriceCents: i.unitPriceCents,
					subtotalCents: i.unitPriceCents * i.quantity
				}))
			}
		};
	}
};
