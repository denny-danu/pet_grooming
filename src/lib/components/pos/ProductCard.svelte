<script lang="ts">
	import { Plus } from "@lucide/svelte";
	import { formatRupiah as money } from "$lib/util";
	import { getCategoryIcon } from "$lib/ui/pos";

	type Product = {
		id: number;
		name: string;
		sku: string;
		priceCents: number;
		stockQty?: number | null;
		lowStockThreshold?: number | null;
		unit?: string | null;
		categorySlug?: string | null;
	};

	let {
		product,
		inCartCount = 0,
		onAdd
	}: { product: Product; inCartCount?: number; onAdd: (product: Product) => void } = $props();

	const CatIcon = $derived(getCategoryIcon(product.categorySlug ?? null));
	const isOutOfStock = $derived((product.stockQty ?? 0) <= 0);
	const isLowStock = $derived((product.stockQty ?? 0) > 0 && (product.stockQty ?? 0) <= (product.lowStockThreshold ?? 5));
</script>

<button
	type="button"
	class="product-card {isOutOfStock ? 'card-disabled' : ''} {inCartCount > 0 ? 'in-cart' : ''}"
	onclick={() => !isOutOfStock && onAdd(product)}
	disabled={isOutOfStock}
	aria-label="Add {product.name} to cart"
>
	{#if inCartCount > 0}
		<span class="cart-qty-badge">{inCartCount} in cart</span>
	{/if}

	<div class="card-top-row">
		<div class="card-icon {product.categorySlug ?? 'other'}">
			<CatIcon size={16} />
		</div>
		<div class="card-stock">
			{#if isOutOfStock}
				<span class="badge status-cancelled">Out of Stock</span>
			{:else if isLowStock}
				<span class="badge status-pending">{product.stockQty} left</span>
			{:else}
				<span class="stock-pill">{product.stockQty} {product.unit ?? 'pcs'}</span>
			{/if}
		</div>
	</div>

	<div class="card-body-content">
		<h3 class="card-prod-title">{product.name}</h3>
		<span class="card-sku mono">{product.sku}</span>
	</div>

	<div class="card-price-row">
		<span class="card-price mono">{money(product.priceCents)}</span>
		<span class="add-icon-pill"><Plus size={14} strokeWidth={2.5} /></span>
	</div>
</button>

<style>
	.product-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-md);
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		text-align: left;
		cursor: pointer;
		position: relative;
		transition: all 0.15s ease;
		box-shadow: var(--shadow-xs);
		width: 100%;
	}
	.product-card:hover:not(:disabled) { transform: translateY(-2px); border-color: var(--primary); box-shadow: var(--shadow-md); }
	.product-card.in-cart { border-color: var(--primary); background: #fdfefe; }
	.product-card.card-disabled { opacity: 0.5; cursor: not-allowed; background: var(--surface-2); }
	.cart-qty-badge { position: absolute; top: -6px; right: -6px; background: var(--primary); color: #fff; font-size: 10.5px; font-weight: 700; padding: 2px 7px; border-radius: var(--r-full); box-shadow: var(--shadow-sm); }
	.card-top-row { display: flex; justify-content: space-between; align-items: center; }
	.card-icon { width: 30px; height: 30px; border-radius: var(--r-sm); display: grid; place-items: center; background: var(--surface-3); color: var(--ink-2); }
	.card-icon.food { background: #fef3c7; color: #b45309; }
	.card-icon.grooming { background: #f5f3ff; color: #7c3aed; }
	.card-icon.aquarium { background: #f0fdfa; color: #0d9488; }
	.card-icon.treats { background: #ecfdf5; color: #059669; }
	.card-icon.healthcare { background: #fff1f2; color: #e11d48; }
	.stock-pill { font-size: 11px; color: var(--muted); background: var(--surface-2); padding: 2px 6px; border-radius: var(--r-xs); }
	.card-body-content { flex: 1; min-width: 0; }
	.card-prod-title { font-size: 13px; font-weight: 600; color: var(--ink); margin: 0 0 2px; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
	.card-sku { font-size: 10.5px; color: var(--muted); }
	.card-price-row { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; padding-top: 6px; border-top: 1px solid var(--border-subtle); }
	.card-price { font-size: 13.5px; font-weight: 700; color: var(--primary); }
	.add-icon-pill { width: 22px; height: 22px; border-radius: var(--r-full); background: var(--primary-soft); color: var(--primary); display: grid; place-items: center; }
</style>
