import type { Component } from "svelte";
import { getCategoryIcon } from "$lib/ui/retail";

/* ============================================================
 * POS cart state (runes module).
 * Holds line items + financial/payment state and exposes the
 * reactive totals and operations used by the register UI.
 * ============================================================ */

export type CartItem = {
	productId: number;
	name: string;
	sku: string;
	unitPriceCents: number;
	unit: string;
	quantity: number;
	stockQty?: number;
	categorySlug?: string | null;
};

export type PosProduct = {
	id: number;
	name: string;
	sku: string;
	barcode?: string | null;
	priceCents: number;
	stockQty?: number | null;
	lowStockThreshold?: number | null;
	unit?: string | null;
	categorySlug?: string | null;
};

export type PosPet = {
	id: number;
	name?: string | null;
	species?: string | null;
	breed?: string | null;
};

export type PosCustomer = {
	id: number;
	name?: string | null;
	tier?: string | null;
	pointsBalance?: number | null;
	pets?: PosPet[];
};

export type PaymentMethod = "cash" | "qris" | "card" | "points";

export class CartState {
	cart = $state<CartItem[]>([]);
	selectedCustomerId = $state<string>("");
	selectedPetId = $state<string>("");
	discountType = $state<"preset" | "custom">("preset");
	discountPercent = $state<number>(0);
	customDiscountAmount = $state<number>(0);
	paymentMethod = $state<PaymentMethod>("cash");
	receiptNotes = $state<string>("");

	constructor(private customers: PosCustomer[]) {}

	// --- derived lookups ---
	get selectedCustomer(): PosCustomer | null {
		return this.customers.find((c) => String(c.id) === this.selectedCustomerId) || null;
	}

	get customerPets() {
		return this.selectedCustomer?.pets || [];
	}

	// --- totals ---
	get subtotalCents() {
		return this.cart.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
	}

	get discountCents() {
		if (this.discountPercent > 0) return Math.round((this.subtotalCents * this.discountPercent) / 100);
		return this.customDiscountAmount > 0 ? this.customDiscountAmount : 0;
	}

	get grandTotalCents() {
		return Math.max(0, this.subtotalCents - this.discountCents);
	}

	get estimatedPointsEarned() {
		if (!this.selectedCustomer) return 0;
		if (this.paymentMethod === "points") return 0;
		let multiplier = 1;
		if (this.selectedCustomer.tier === "platinum") multiplier = 3;
		else if (this.selectedCustomer.tier === "gold") multiplier = 2;
		return Math.max(1, Math.floor(this.grandTotalCents / 1000) * multiplier);
	}

	get pointsRequiredForPayment() {
		return Math.ceil(this.grandTotalCents / 100);
	}

	// --- ops ---
	addProduct(p: PosProduct) {
		const existing = this.cart.find((item) => item.productId === p.id);
		if (existing) {
			existing.quantity += 1;
		} else {
			this.cart.push({
				productId: p.id,
				name: p.name,
				sku: p.sku,
				unitPriceCents: p.priceCents,
				unit: p.unit ?? "pcs",
				quantity: 1,
				stockQty: p.stockQty ?? 0,
				categorySlug: p.categorySlug
			});
		}
	}

	incrementQty(productId: number) {
		const item = this.cart.find((i) => i.productId === productId);
		if (item) item.quantity += 1;
	}

	decrementQty(productId: number) {
		const index = this.cart.findIndex((i) => i.productId === productId);
		if (index === -1) return;
		if (this.cart[index].quantity > 1) {
			this.cart[index].quantity -= 1;
		} else {
			this.cart.splice(index, 1);
		}
	}

	removeFromCart(productId: number) {
		this.cart = this.cart.filter((i) => i.productId !== productId);
	}

	clearCart() {
		this.cart = [];
		this.discountPercent = 0;
		this.customDiscountAmount = 0;
		this.receiptNotes = "";
	}

	qtyFor(productId: number): number {
		return this.cart.find((i) => i.productId === productId)?.quantity ?? 0;
	}

	applyTierDiscount() {
		if (this.selectedCustomer?.tier === "platinum") this.discountPercent = 10;
		else if (this.selectedCustomer?.tier === "gold") this.discountPercent = 5;
	}

	/** Reset per-line + pet state after a completed sale. */
	resetAfterSale() {
		this.clearCart();
		this.selectedPetId = "";
	}
}
