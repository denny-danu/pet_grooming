import { db } from "$lib/server/db";
import { productCategories, products } from "$lib/server/db/schema";
import { eq, desc, asc, sql } from "drizzle-orm";
import { requireUser } from "$lib/server/auth";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

// Ensure default categories exist if empty
async function ensureDefaultCategories() {
	const existing = await db.select({ id: productCategories.id }).from(productCategories).limit(1);
	if (existing.length === 0) {
		await db.insert(productCategories).values([
			{ name: "Pet Food & Nutrition", slug: "food", icon: "Utensils" },
			{ name: "Grooming & Shampoos", slug: "grooming", icon: "Sparkles" },
			{ name: "Aquarium & Fish Supplies", slug: "aquarium", icon: "Fish" },
			{ name: "Treats & Toys", slug: "treats", icon: "Gift" },
			{ name: "Healthcare & Wellness", slug: "healthcare", icon: "HeartPulse" }
		]);
	}
}

export const load: PageServerLoad = async ({ locals }) => {
	requireUser(locals);
	await ensureDefaultCategories();

	const [categoriesList, productsList] = await Promise.all([
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
				costCents: products.costCents,
				stockQty: products.stockQty,
				lowStockThreshold: products.lowStockThreshold,
				unit: products.unit,
				active: products.active,
				createdAt: products.createdAt,
				categoryName: productCategories.name,
				categorySlug: productCategories.slug,
				categoryIcon: productCategories.icon
			})
			.from(products)
			.leftJoin(productCategories, eq(products.categoryId, productCategories.id))
			.orderBy(desc(products.active), asc(products.name))
	]);

	// Compute metrics
	const totalSkus = productsList.length;
	const activeSkus = productsList.filter((p) => p.active).length;
	const inStockValue = productsList.reduce(
		(sum, p) => sum + (p.priceCents ?? 0) * (p.stockQty ?? 0),
		0
	);
	const totalCostValue = productsList.reduce(
		(sum, p) => sum + (p.costCents ?? 0) * (p.stockQty ?? 0),
		0
	);
	const lowStockCount = productsList.filter(
		(p) => (p.stockQty ?? 0) > 0 && (p.stockQty ?? 0) <= (p.lowStockThreshold ?? 5)
	).length;
	const outOfStockCount = productsList.filter((p) => (p.stockQty ?? 0) <= 0).length;

	return {
		categories: categoriesList,
		products: productsList,
		metrics: {
			totalSkus,
			activeSkus,
			inStockValue,
			totalCostValue,
			lowStockCount,
			outOfStockCount,
			categoriesCount: categoriesList.length
		}
	};
};

export const actions: Actions = {
	createProduct: async ({ request, locals }) => {
		requireUser(locals);
		const data = await request.formData();

		const name = (data.get("name") as string)?.trim();
		let sku = (data.get("sku") as string)?.trim();
		const barcode = (data.get("barcode") as string)?.trim() || null;
		const description = (data.get("description") as string)?.trim() || null;
		const categoryIdRaw = data.get("categoryId") as string;
		const priceRaw = data.get("price") as string;
		const costRaw = data.get("cost") as string;
		const stockRaw = data.get("stockQty") as string;
		const thresholdRaw = data.get("lowStockThreshold") as string;
		const unit = (data.get("unit") as string)?.trim() || "pcs";

		if (!name) {
			return fail(400, { createError: "Product name is required" });
		}

		const priceCents = parseInt(priceRaw, 10);
		if (isNaN(priceCents) || priceCents < 0) {
			return fail(400, { createError: "Valid retail price is required" });
		}

		const costCents = costRaw ? parseInt(costRaw, 10) : 0;
		const stockQty = stockRaw ? parseInt(stockRaw, 10) : 0;
		const lowStockThreshold = thresholdRaw ? parseInt(thresholdRaw, 10) : 5;
		const categoryId = categoryIdRaw ? parseInt(categoryIdRaw, 10) : null;

		// Generate SKU if omitted
		if (!sku) {
			const prefix = name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase() || "SKU";
			const randomSuffix = Math.floor(1000 + Math.random() * 9000);
			sku = `${prefix}-${randomSuffix}`;
		}

		try {
			const [newProd] = await db
				.insert(products)
				.values({
					name,
					sku,
					barcode,
					description,
					categoryId,
					priceCents,
					costCents: isNaN(costCents) ? 0 : costCents,
					stockQty: isNaN(stockQty) ? 0 : stockQty,
					lowStockThreshold: isNaN(lowStockThreshold) ? 5 : lowStockThreshold,
					unit,
					active: true
				})
				.returning();

			return { success: true, createdId: newProd.id };
		} catch (err: unknown) {
			console.error("Failed to create product:", err);
			return fail(500, { createError: "Database error while saving product" });
		}
	},

	updateProduct: async ({ request, locals }) => {
		requireUser(locals);
		const data = await request.formData();

		const idRaw = data.get("id") as string;
		const id = parseInt(idRaw, 10);
		if (isNaN(id)) {
			return fail(400, { updateError: "Invalid product ID" });
		}

		const name = (data.get("name") as string)?.trim();
		const sku = (data.get("sku") as string)?.trim();
		const barcode = (data.get("barcode") as string)?.trim() || null;
		const description = (data.get("description") as string)?.trim() || null;
		const categoryIdRaw = data.get("categoryId") as string;
		const priceRaw = data.get("price") as string;
		const costRaw = data.get("cost") as string;
		const stockRaw = data.get("stockQty") as string;
		const thresholdRaw = data.get("lowStockThreshold") as string;
		const unit = (data.get("unit") as string)?.trim() || "pcs";
		const active = data.get("active") === "true" || data.get("active") === "on";

		if (!name || !sku) {
			return fail(400, { updateError: "Product name and SKU are required" });
		}

		const priceCents = parseInt(priceRaw, 10);
		if (isNaN(priceCents) || priceCents < 0) {
			return fail(400, { updateError: "Valid retail price is required" });
		}

		const costCents = costRaw ? parseInt(costRaw, 10) : 0;
		const stockQty = stockRaw ? parseInt(stockRaw, 10) : 0;
		const lowStockThreshold = thresholdRaw ? parseInt(thresholdRaw, 10) : 5;
		const categoryId = categoryIdRaw ? parseInt(categoryIdRaw, 10) : null;

		try {
			await db
				.update(products)
				.set({
					name,
					sku,
					barcode,
					description,
					categoryId,
					priceCents,
					costCents: isNaN(costCents) ? 0 : costCents,
					stockQty: isNaN(stockQty) ? 0 : stockQty,
					lowStockThreshold: isNaN(lowStockThreshold) ? 5 : lowStockThreshold,
					unit,
					active
				})
				.where(eq(products.id, id));

			return { success: true, updatedId: id };
		} catch (err: unknown) {
			console.error("Failed to update product:", err);
			return fail(500, { updateError: "Database error while updating product" });
		}
	},

	restock: async ({ request, locals }) => {
		requireUser(locals);
		const data = await request.formData();

		const idRaw = data.get("productId") as string;
		const qtyRaw = data.get("quantity") as string;
		const id = parseInt(idRaw, 10);
		const quantity = parseInt(qtyRaw, 10);

		if (isNaN(id) || isNaN(quantity) || quantity <= 0) {
			return fail(400, { restockError: "Valid product ID and positive quantity required" });
		}

		try {
			const [prod] = await db
				.select({ id: products.id, stockQty: products.stockQty })
				.from(products)
				.where(eq(products.id, id))
				.limit(1);

			if (!prod) {
				return fail(404, { restockError: "Product not found" });
			}

			const newQty = (prod.stockQty ?? 0) + quantity;
			await db.update(products).set({ stockQty: newQty }).where(eq(products.id, id));

			return { success: true, restockedId: id, newStock: newQty };
		} catch (err: unknown) {
			console.error("Failed to restock product:", err);
			return fail(500, { restockError: "Database error while updating stock" });
		}
	}
};
