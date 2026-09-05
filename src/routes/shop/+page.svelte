<script lang="ts">
	import { page } from "$app/state";
	import {
		ShoppingBag,
		Package,
		TriangleAlert,
		AlertCircle,
		Plus,
		Search,
		CreditCard,
		Edit,
		Boxes,
		Sparkles,
		Utensils,
		Fish,
		Gift,
		HeartPulse,
		CheckCircle2,
		XCircle,
		TrendingUp,
		Filter,
		Layers,
		ArrowUpDown,
		Tag,
		PackagePlus,
		Check,
		X
	} from "@lucide/svelte";
	import { formatRupiah as money } from "$lib/util";
	import StatCard from "$lib/components/StatCard.svelte";
	import Badge from "$lib/components/Badge.svelte";
	import Modal from "$lib/components/Modal.svelte";
	import EmptyState from "$lib/components/EmptyState.svelte";

	let { data } = $props();

	// State for filters & search
	let searchQuery = $state("");
	let selectedCategory = $state<string>("all");
	let stockFilter = $state<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");

	// Modals state
	let addModalOpen = $state(false);
	let editModalOpen = $state(false);
	let restockModalOpen = $state(false);

	// Selected product for editing or restocking
	let selectedProduct = $state<any>(null);
	let restockAmount = $state<number>(10);

	const form = $derived(page.form);
	const createError = $derived(form?.createError);
	const updateError = $derived(form?.updateError);
	const restockError = $derived(form?.restockError);
	const actionSuccess = $derived(form?.success);

	// Icon lookup for categories
	function getCategoryIcon(slug: string | null) {
		if (slug === "food") return Utensils;
		if (slug === "grooming") return Sparkles;
		if (slug === "aquarium") return Fish;
		if (slug === "treats") return Gift;
		if (slug === "healthcare") return HeartPulse;
		return Tag;
	}

	// Filtered products list
	const filteredProducts = $derived(
		data.products.filter((p) => {
			// Category filter
			if (selectedCategory !== "all") {
				if (selectedCategory === "uncategorized") {
					if (p.categoryId !== null) return false;
				} else if (p.categorySlug !== selectedCategory) {
					return false;
				}
			}

			// Stock level filter
			const qty = p.stockQty ?? 0;
			const threshold = p.lowStockThreshold ?? 5;
			if (stockFilter === "in_stock" && (qty <= threshold || qty === 0)) return false;
			if (stockFilter === "low_stock" && (qty <= 0 || qty > threshold)) return false;
			if (stockFilter === "out_of_stock" && qty > 0) return false;

			// Text search
			const q = searchQuery.toLowerCase().trim();
			if (q) {
				const matchesName = p.name?.toLowerCase().includes(q);
				const matchesSku = p.sku?.toLowerCase().includes(q);
				const matchesBarcode = p.barcode?.toLowerCase().includes(q);
				const matchesDesc = p.description?.toLowerCase().includes(q);
				if (!matchesName && !matchesSku && !matchesBarcode && !matchesDesc) return false;
			}

			return true;
		})
	);

	function openEdit(prod: any) {
		selectedProduct = prod;
		editModalOpen = true;
	}

	function openRestock(prod: any) {
		selectedProduct = prod;
		restockAmount = 10;
		restockModalOpen = true;
	}

	function calculateMargin(price: number, cost: number) {
		if (!price || price <= 0 || !cost || cost <= 0) return null;
		const margin = ((price - cost) / price) * 100;
		return margin.toFixed(0);
	}
</script>

<svelte:head>
	<title>Products &amp; Inventory · PetCo Retail</title>
</svelte:head>

<div class="page-header">
	<div class="title-block">
		<div class="kicker"><ShoppingBag size={13} /> PetCo Retail &amp; Pet Shop</div>
		<h1>Products &amp; Inventory</h1>
		<p class="subtitle">Real-time stock monitoring, pricing, SKU catalog, and fast restocking</p>
	</div>
	<div class="actions">
		<a href="/pos" class="btn">
			<CreditCard size={15} />
			<span>POS Cashier</span>
		</a>
		<button class="btn btn-primary" onclick={() => (addModalOpen = true)}>
			<Plus size={15} />
			<span>Add Product</span>
		</button>
	</div>
</div>

{#if actionSuccess}
	<div class="alert alert-success mb">
		<CheckCircle2 size={16} />
		<span>Inventory updated successfully!</span>
	</div>
{/if}

{#if createError || updateError || restockError}
	<div class="alert alert-error mb">
		<AlertCircle size={16} />
		<span>{createError || updateError || restockError}</span>
	</div>
{/if}

<!-- Metrics Strip -->
<div class="stat-grid mb">
	<StatCard
		title="Total Catalog SKUs"
		value={data.metrics.totalSkus}
		subtitle="{data.metrics.activeSkus} active items"
		tint="purple"
		icon={Package}
	/>
	<StatCard
		title="Retail Inventory Value"
		value={money(data.metrics.inStockValue)}
		subtitle="Cost: {money(data.metrics.totalCostValue)}"
		tint="blue"
		icon={ShoppingBag}
	/>
	<StatCard
		title="Low Stock Alerts"
		value={data.metrics.lowStockCount}
		subtitle="{data.metrics.outOfStockCount} items out of stock"
		tint={data.metrics.lowStockCount > 0 ? "amber" : "green"}
		icon={TriangleAlert}
	/>
	<StatCard
		title="Product Categories"
		value={data.metrics.categoriesCount}
		subtitle="Organized retail aisles"
		tint="green"
		icon={Boxes}
	/>
</div>

<!-- Filter Toolbar -->
<div class="card mb">
	<div class="toolbar spread">
		<div class="search-box">
			<Search size={15} class="search-icon" />
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search product name, SKU, barcode..."
				aria-label="Search products"
			/>
			{#if searchQuery}
				<button class="search-clear" onclick={() => (searchQuery = "")} aria-label="Clear search">
					<XCircle size={14} />
				</button>
			{/if}
		</div>

		<div class="row gap-2">
			<!-- Stock status segment -->
			<div class="segmented">
				<button
					type="button"
					class={stockFilter === "all" ? "active" : ""}
					onclick={() => (stockFilter = "all")}
				>
					<Layers size={13} />
					<span>All ({data.products.length})</span>
				</button>
				<button
					type="button"
					class={stockFilter === "in_stock" ? "active" : ""}
					onclick={() => (stockFilter = "in_stock")}
				>
					<CheckCircle2 size={13} />
					<span>In Stock</span>
				</button>
				<button
					type="button"
					class={stockFilter === "low_stock" ? "active" : ""}
					onclick={() => (stockFilter = "low_stock")}
				>
					<TriangleAlert size={13} />
					<span>Low ({data.metrics.lowStockCount})</span>
				</button>
				<button
					type="button"
					class={stockFilter === "out_of_stock" ? "active" : ""}
					onclick={() => (stockFilter = "out_of_stock")}
				>
					<XCircle size={13} />
					<span>Out ({data.metrics.outOfStockCount})</span>
				</button>
			</div>
		</div>
	</div>

	<!-- Category Pills -->
	<div class="category-tabs">
		<button
			type="button"
			class="cat-pill {selectedCategory === 'all' ? 'active' : ''}"
			onclick={() => (selectedCategory = "all")}
		>
			<Layers size={13} />
			<span>All Categories</span>
		</button>
		{#each data.categories as cat}
			{@const CatIcon = getCategoryIcon(cat.slug)}
			<button
				type="button"
				class="cat-pill {selectedCategory === cat.slug ? 'active' : ''}"
				onclick={() => (selectedCategory = cat.slug)}
			>
				<CatIcon size={13} />
				<span>{cat.name}</span>
			</button>
		{/each}
	</div>
</div>

<!-- Products Table -->
<div class="card">
	<div class="table-wrap">
		<table>
			<thead>
				<tr>
					<th>Product Item</th>
					<th>Category</th>
					<th class="num">Retail Price</th>
					<th class="num">Cost / Margin</th>
					<th>Stock Level</th>
					<th>Status</th>
					<th class="num">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#if filteredProducts.length === 0}
					<tr>
						<td colspan="7">
							<EmptyState
								title="No products found"
								description="No inventory items match your current search and filter criteria."
								icon={ShoppingBag}
							>
								<button class="btn btn-sm btn-primary" onclick={() => (addModalOpen = true)}>
									<Plus size={14} />
									<span>Add New Product</span>
								</button>
							</EmptyState>
						</td>
					</tr>
				{:else}
					{#each filteredProducts as p (p.id)}
						{@const CatIcon = getCategoryIcon(p.categorySlug)}
						{@const margin = calculateMargin(p.priceCents, p.costCents ?? 0)}
						{@const isLow = (p.stockQty ?? 0) > 0 && (p.stockQty ?? 0) <= (p.lowStockThreshold ?? 5)}
						{@const isOut = (p.stockQty ?? 0) <= 0}
						<tr class={!p.active ? "row-inactive" : ""}>
							<td>
								<div class="product-cell">
									<div class="prod-icon-box {p.categorySlug ?? 'other'}">
										<CatIcon size={16} />
									</div>
									<div class="prod-info">
										<div class="prod-name">{p.name}</div>
										<div class="prod-meta">
											<span class="mono sku-tag">{p.sku}</span>
											{#if p.barcode}
												<span class="barcode-tag">|| {p.barcode}</span>
											{/if}
										</div>
									</div>
								</div>
							</td>
							<td>
								{#if p.categoryName}
									<span class="cat-badge">
										<CatIcon size={12} />
										{p.categoryName}
									</span>
								{:else}
									<span class="faint tiny">—</span>
								{/if}
							</td>
							<td class="num">
								<span class="mono cell-strong text-primary">{money(p.priceCents)}</span>
							</td>
							<td class="num">
								{#if p.costCents && p.costCents > 0}
									<div class="cost-col">
										<span class="mono small muted">{money(p.costCents)}</span>
										{#if margin}
											<span class="margin-pill {parseInt(margin) > 25 ? 'good' : 'fair'}">
												+{margin}%
											</span>
										{/if}
									</div>
								{:else}
									<span class="faint tiny">—</span>
								{/if}
							</td>
							<td>
								<div class="stock-status-wrap">
									<div class="stock-qty-row">
										<span class="mono font-bold {isOut ? 'text-danger' : isLow ? 'text-amber' : ''}">
											{p.stockQty ?? 0}
										</span>
										<span class="tiny faint">{p.unit ?? "pcs"}</span>
									</div>
									{#if isOut}
										<Badge variant="danger" label="Out of Stock" dot={true} />
									{:else if isLow}
										<Badge variant="warning" label="Low Stock (≤{p.lowStockThreshold})" dot={true} />
									{:else}
										<Badge variant="success" label="In Stock" dot={false} />
									{/if}
								</div>
							</td>
							<td>
								{#if p.active}
									<span class="badge status-valid">Active</span>
								{:else}
									<span class="badge status-cancelled">Archived</span>
								{/if}
							</td>
							<td class="num">
								<div class="row gap-1 justify-end">
									<button
										type="button"
										class="btn btn-sm btn-ghost"
										title="Quick Restock"
										onclick={() => openRestock(p)}
									>
										<PackagePlus size={14} />
										<span>Restock</span>
									</button>
									<button
										type="button"
										class="btn btn-sm btn-ghost"
										title="Edit Product"
										onclick={() => openEdit(p)}
									>
										<Edit size={14} />
										<span>Edit</span>
									</button>
								</div>
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>

<!-- Modal 1: Add New Product -->
<Modal bind:open={addModalOpen} title="Add New Product" subtitle="Register a retail product or inventory item" maxWidth="640px">
	<form method="POST" action="?/createProduct" class="stack gap-4">
		<div class="field">
			<label for="add-name">Product Name <span class="req">*</span></label>
			<input
				id="add-name"
				name="name"
				type="text"
				placeholder="e.g. Royal Canin Medium Adult (4kg)"
				required
			/>
		</div>

		<div class="grid cols-2">
			<div class="field">
				<label for="add-cat">Category</label>
				<select id="add-cat" name="categoryId">
					<option value="">-- Select Category --</option>
					{#each data.categories as cat}
						<option value={cat.id}>{cat.name}</option>
					{/each}
				</select>
			</div>

			<div class="field">
				<label for="add-unit">Unit Type</label>
				<select id="add-unit" name="unit">
					<option value="pcs">pcs (Pieces)</option>
					<option value="bag">bag (Pet Food Bag)</option>
					<option value="can">can (Canned Food)</option>
					<option value="bottle">bottle (Shampoo/Syrup)</option>
					<option value="pack">pack (Treats Pack)</option>
					<option value="box">box</option>
				</select>
			</div>
		</div>

		<div class="grid cols-2">
			<div class="field">
				<label for="add-sku">SKU / Item Code</label>
				<input id="add-sku" name="sku" type="text" placeholder="Auto-generated if blank (e.g. RC-MED-4K)" />
			</div>

			<div class="field">
				<label for="add-barcode">Barcode / EAN (Optional)</label>
				<input id="add-barcode" name="barcode" type="text" placeholder="e.g. 885123456789" />
			</div>
		</div>

		<div class="grid cols-2">
			<div class="field">
				<label for="add-price">Retail Selling Price (IDR) <span class="req">*</span></label>
				<input
					id="add-price"
					name="price"
					type="number"
					placeholder="150000"
					min="0"
					step="1000"
					required
				/>
			</div>

			<div class="field">
				<label for="add-cost">Cost / Buy Price (IDR)</label>
				<input
					id="add-cost"
					name="cost"
					type="number"
					placeholder="110000"
					min="0"
					step="1000"
				/>
			</div>
		</div>

		<div class="grid cols-2">
			<div class="field">
				<label for="add-stock">Initial Stock Quantity</label>
				<input id="add-stock" name="stockQty" type="number" placeholder="10" min="0" value="10" />
			</div>

			<div class="field">
				<label for="add-threshold">Low Stock Alert Threshold</label>
				<input id="add-threshold" name="lowStockThreshold" type="number" placeholder="5" min="1" value="5" />
			</div>
		</div>

		<div class="field">
			<label for="add-desc">Description / Instructions (Optional)</label>
			<textarea id="add-desc" name="description" rows="2" placeholder="Dietary instructions, age group, or usage guidelines"></textarea>
		</div>

		<div class="row spread" style="margin-top: var(--sp-2);">
			<button type="button" class="btn btn-ghost" onclick={() => (addModalOpen = false)}>
				<X size={14} />
				<span>Cancel</span>
			</button>
			<button type="submit" class="btn btn-primary">
				<Plus size={15} />
				<span>Create Product</span>
			</button>
		</div>
	</form>
</Modal>

<!-- Modal 2: Edit Product -->
{#if selectedProduct}
	<Modal bind:open={editModalOpen} title="Edit Product · {selectedProduct.name}" subtitle="Update price, SKU, category, and metadata" maxWidth="640px">
		<form method="POST" action="?/updateProduct" class="stack gap-4">
			<input type="hidden" name="id" value={selectedProduct.id} />

			<div class="field">
				<label for="edit-name">Product Name <span class="req">*</span></label>
				<input
					id="edit-name"
					name="name"
					type="text"
					value={selectedProduct.name}
					required
				/>
			</div>

			<div class="grid cols-2">
				<div class="field">
					<label for="edit-cat">Category</label>
					<select id="edit-cat" name="categoryId">
						<option value="">-- Select Category --</option>
						{#each data.categories as cat}
							<option value={cat.id} selected={selectedProduct.categoryId === cat.id}>{cat.name}</option>
						{/each}
					</select>
				</div>

				<div class="field">
					<label for="edit-unit">Unit Type</label>
					<select id="edit-unit" name="unit">
						<option value="pcs" selected={selectedProduct.unit === 'pcs'}>pcs (Pieces)</option>
						<option value="bag" selected={selectedProduct.unit === 'bag'}>bag (Pet Food Bag)</option>
						<option value="can" selected={selectedProduct.unit === 'can'}>can (Canned Food)</option>
						<option value="bottle" selected={selectedProduct.unit === 'bottle'}>bottle (Shampoo/Syrup)</option>
						<option value="pack" selected={selectedProduct.unit === 'pack'}>pack (Treats Pack)</option>
						<option value="box" selected={selectedProduct.unit === 'box'}>box</option>
					</select>
				</div>
			</div>

			<div class="grid cols-2">
				<div class="field">
					<label for="edit-sku">SKU Code <span class="req">*</span></label>
					<input id="edit-sku" name="sku" type="text" value={selectedProduct.sku} required />
				</div>

				<div class="field">
					<label for="edit-barcode">Barcode / EAN</label>
					<input id="edit-barcode" name="barcode" type="text" value={selectedProduct.barcode ?? ''} />
				</div>
			</div>

			<div class="grid cols-2">
				<div class="field">
					<label for="edit-price">Retail Selling Price (IDR) <span class="req">*</span></label>
					<input
						id="edit-price"
						name="price"
						type="number"
						value={selectedProduct.priceCents}
						min="0"
						step="1000"
						required
					/>
				</div>

				<div class="field">
					<label for="edit-cost">Cost / Buy Price (IDR)</label>
					<input
						id="edit-cost"
						name="cost"
						type="number"
						value={selectedProduct.costCents ?? 0}
						min="0"
						step="1000"
					/>
				</div>
			</div>

			<div class="grid cols-2">
				<div class="field">
					<label for="edit-stock">Current Stock Quantity</label>
					<input id="edit-stock" name="stockQty" type="number" value={selectedProduct.stockQty} min="0" />
				</div>

				<div class="field">
					<label for="edit-threshold">Low Stock Alert Threshold</label>
					<input id="edit-threshold" name="lowStockThreshold" type="number" value={selectedProduct.lowStockThreshold} min="1" />
				</div>
			</div>

			<div class="field">
				<label for="edit-desc">Description (Optional)</label>
				<textarea id="edit-desc" name="description" rows="2" value={selectedProduct.description ?? ''}></textarea>
			</div>

			<div class="field" style="margin-top: 4px;">
				<label class="row gap-2" style="cursor: pointer;">
					<input type="checkbox" name="active" checked={selectedProduct.active} />
					<span>Active SKU in Store Catalog</span>
				</label>
			</div>

			<div class="row spread" style="margin-top: var(--sp-2);">
				<button type="button" class="btn btn-ghost" onclick={() => (editModalOpen = false)}>
					<X size={14} />
					<span>Cancel</span>
				</button>
				<button type="submit" class="btn btn-primary">
					<Check size={14} />
					<span>Save Changes</span>
				</button>
			</div>
		</form>
	</Modal>
{/if}

<!-- Modal 3: Quick Restock -->
{#if selectedProduct}
	<Modal bind:open={restockModalOpen} title="Restock Inventory · {selectedProduct.name}" subtitle="Add incoming shipment or adjust physical inventory count" maxWidth="520px">
		<form method="POST" action="?/restock" class="stack gap-4">
			<input type="hidden" name="id" value={selectedProduct.id} />

			<div class="restock-summary-box">
				<div class="row spread">
					<span class="small muted">Current Stock Level:</span>
					<strong class="mono font-bold text-primary">{selectedProduct.stockQty ?? 0} {selectedProduct.unit ?? 'pcs'}</strong>
				</div>
				<div class="row spread">
					<span class="small muted">After Restock:</span>
					<strong class="mono font-bold text-success">{(selectedProduct.stockQty ?? 0) + (restockAmount || 0)} {selectedProduct.unit ?? 'pcs'}</strong>
				</div>
			</div>

			<div class="field">
				<label for="restock-amount">Quantity to Add <span class="req">*</span></label>
				<input
					id="restock-amount"
					name="quantity"
					type="number"
					bind:value={restockAmount}
					min="1"
					required
				/>
			</div>

			<!-- Preset buttons -->
			<div class="row gap-2" style="margin-top: -6px;">
				<span class="tiny faint">Quick Presets:</span>
				{#each [5, 10, 20, 50, 100] as preset}
					<button
						type="button"
						class="preset-chip {restockAmount === preset ? 'active' : ''}"
						onclick={() => (restockAmount = preset)}
					>
						+{preset}
					</button>
				{/each}
			</div>

			<div class="row spread" style="margin-top: var(--sp-2);">
				<button type="button" class="btn btn-ghost" onclick={() => (restockModalOpen = false)}>
					<X size={14} />
					<span>Cancel</span>
				</button>
				<button type="submit" class="btn btn-primary">
					<PackagePlus size={15} />
					<span>Confirm Restock</span>
				</button>
			</div>
		</form>
	</Modal>
{/if}

<style>
	.search-box {
		flex: 0 1 380px;
	}

	.category-tabs {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 10px 16px;
		border-top: 1px solid var(--border-subtle);
		overflow-x: auto;
		background: var(--surface-2);
	}

	.cat-pill {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 5px 12px;
		border-radius: var(--r-full);
		font-size: 12px;
		font-weight: 600;
		color: var(--ink-2);
		background: var(--surface);
		border: 1px solid var(--border);
		cursor: pointer;
		white-space: nowrap;
		transition: all 130ms ease;
	}

	.cat-pill:hover {
		background: var(--primary-soft);
		border-color: var(--primary-border);
		color: var(--primary);
	}

	.cat-pill.active {
		background: var(--primary);
		border-color: var(--primary);
		color: #ffffff;
		box-shadow: 0 1px 3px rgba(79, 70, 229, 0.3);
	}

	.product-cell {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.prod-icon-box {
		width: 36px;
		height: 36px;
		border-radius: var(--r-md);
		background: var(--surface-3);
		color: var(--ink-2);
		display: grid;
		place-items: center;
		flex-shrink: 0;
	}

	.prod-icon-box.food { background: var(--amber-bg); color: var(--amber); }
	.prod-icon-box.grooming { background: var(--purple-bg); color: var(--purple); }
	.prod-icon-box.aquarium { background: var(--info-bg); color: var(--info); }
	.prod-icon-box.treats { background: var(--success-bg); color: var(--success); }

	.prod-info {
		min-width: 0;
	}

	.prod-name {
		font-size: 13.5px;
		font-weight: 700;
		color: var(--ink);
	}

	.prod-meta {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-top: 2px;
	}

	.sku-tag {
		font-size: 11px;
		background: var(--surface-3);
		padding: 1px 5px;
		border-radius: var(--r-xs);
		color: var(--muted);
	}

	.barcode-tag {
		font-size: 11px;
		color: var(--faint);
		font-family: var(--font-mono);
	}

	.cat-badge {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 12px;
		font-weight: 600;
		color: var(--ink-2);
		background: var(--surface-2);
		padding: 3px 8px;
		border-radius: var(--r-md);
		border: 1px solid var(--border-subtle);
	}

	.cost-col {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 2px;
	}

	.margin-pill {
		font-size: 10.5px;
		font-weight: 700;
		padding: 1px 5px;
		border-radius: var(--r-xs);
		line-height: 1.2;
	}

	.margin-pill.good { background: var(--success-bg); color: var(--success); }
	.margin-pill.fair { background: var(--surface-3); color: var(--muted); }

	.stock-status-wrap {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.stock-qty-row {
		display: flex;
		align-items: baseline;
		gap: 4px;
		font-size: 13px;
	}

	.text-primary { color: var(--primary); }
	.text-success { color: var(--success); }
	.text-danger { color: var(--danger); }
	.text-amber { color: var(--warning); }
	.justify-end { justify-content: flex-end; }

	.row-inactive {
		opacity: 0.6;
		background: var(--surface-2);
	}

	.restock-summary-box {
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--r-md);
		padding: 12px 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
</style>
