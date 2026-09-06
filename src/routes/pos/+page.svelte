<script lang="ts">
	import { page } from "$app/state";
	import { makeT } from "$lib/i18n/t";
	import {
		CreditCard,
		ShoppingBag,
		Search,
		Plus,
		Minus,
		Trash2,
		XCircle,
		Utensils,
		Sparkles,
		Fish,
		Gift,
		HeartPulse,
		Tag,
		User,
		PawPrint,
		CheckCircle2,
		Receipt,
		Package,
		ArrowRight,
		Printer,
		Layers,
		Check,
		Award,
		Store,
		ChevronRight,
		Percent,
		Banknote,
		QrCode,
		ReceiptText,
		AlertCircle,
		RotateCcw
	} from "@lucide/svelte";
	import { formatRupiah as money } from "$lib/util";
	import Modal from "$lib/components/Modal.svelte";
	import Badge from "$lib/components/Badge.svelte";
	import PetAvatar from "$lib/components/PetAvatar.svelte";
	import EmptyState from "$lib/components/EmptyState.svelte";
	import ProductCard from "$lib/components/pos/ProductCard.svelte";

	let { data } = $props();
	const t = $derived(makeT(page.data.locale ?? "en"));

	// Cart item type
	type CartItem = {
		productId: number;
		name: string;
		sku: string;
		unitPriceCents: number;
		unit: string;
		quantity: number;
		stockQty?: number;
		categorySlug?: string | null;
	};

	let receiptModalOpen = $state(false);
	let salesHistoryModalOpen = $state(false);
	let completedOrder = $state<any | null>(null);
	// Local State
	let cart = $state<CartItem[]>([]);
	let searchQuery = $state("");
	let selectedCategory = $state<string>("all");
	let onlyInStock = $state(false);

	// Customer selection
	let selectedCustomerId = $state<string>("");
	let selectedPetId = $state<string>("");

	// Financials & Payment
	let discountType = $state<"preset" | "custom">("preset");
	let discountPercent = $state<number>(0);
	let customDiscountAmount = $state<number>(0);
	let paymentMethod = $state<"cash" | "qris" | "card" | "points">("cash");
	let receiptNotes = $state<string>("");


	const form = $derived(page.form);
	const checkoutError = $derived(form?.checkoutError);

	// When checkout completes, show receipt modal
	$effect(() => {
		if (form?.success && form?.order) {
			completedOrder = form.order;
			receiptModalOpen = true;
			// Clear local cart
			cart = [];
			discountPercent = 0;
			customDiscountAmount = 0;
			selectedPetId = "";
			receiptNotes = "";
		}
	});

	// Selected customer object
	const selectedCustomer = $derived(
		data.customers.find((c) => String(c.id) === selectedCustomerId) || null
	);

	// Customer's pets
	const customerPets = $derived(selectedCustomer?.pets || []);

	// Auto-reset pet if customer changes
	$effect(() => {
		if (selectedCustomer && customerPets.length > 0 && !selectedPetId) {
			selectedPetId = String(customerPets[0].id);
		} else if (!selectedCustomer) {
			selectedPetId = "";
		}
	});

	// Cart calculations
	const subtotalCents = $derived(
		cart.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0)
	);

	const calculatedDiscountCents = $derived.by(() => {
		if (discountPercent > 0) {
			return Math.round((subtotalCents * discountPercent) / 100);
		}
		return customDiscountAmount > 0 ? customDiscountAmount : 0;
	});

	const grandTotalCents = $derived(
		Math.max(0, subtotalCents - calculatedDiscountCents)
	);

	// Loyalty points calculation
	const estimatedPointsEarned = $derived.by(() => {
		if (!selectedCustomer) return 0;
		if (paymentMethod === "points") return 0;
		let multiplier = 1;
		if (selectedCustomer.tier === "platinum") multiplier = 3;
		else if (selectedCustomer.tier === "gold") multiplier = 2;
		return Math.max(1, Math.floor(grandTotalCents / 1000) * multiplier);
	});

	const pointsRequiredForPayment = $derived(
		Math.ceil(grandTotalCents / 100)
	);

	// Filtered catalog
	const filteredProducts = $derived(
		data.products.filter((p) => {
			if (onlyInStock && (p.stockQty ?? 0) <= 0) return false;
			if (selectedCategory !== "all" && p.categorySlug !== selectedCategory) return false;

			const q = searchQuery.toLowerCase().trim();
			if (q) {
				const matchesName = p.name?.toLowerCase().includes(q);
				const matchesSku = p.sku?.toLowerCase().includes(q);
				const matchesBarcode = p.barcode?.toLowerCase().includes(q);
				if (!matchesName && !matchesSku && !matchesBarcode) return false;
			}
			return true;
		})
	);

	// Cart operations
	function addToCart(p: any) {
		const existing = cart.find((item) => item.productId === p.id);
		if (existing) {
			existing.quantity += 1;
		} else {
			cart.push({
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

	function incrementQty(productId: number) {
		const item = cart.find((i) => i.productId === productId);
		if (item) item.quantity += 1;
	}

	function decrementQty(productId: number) {
		const itemIndex = cart.findIndex((i) => i.productId === productId);
		if (itemIndex > -1) {
			if (cart[itemIndex].quantity > 1) {
				cart[itemIndex].quantity -= 1;
			} else {
				cart.splice(itemIndex, 1);
			}
		}
	}

	function removeFromCart(productId: number) {
		cart = cart.filter((i) => i.productId !== productId);
	}

	function clearCart() {
		cart = [];
		discountPercent = 0;
		customDiscountAmount = 0;
		receiptNotes = "";
	}

	function applyTierDiscount() {
		if (selectedCustomer?.tier === "platinum") {
			discountPercent = 10;
		} else if (selectedCustomer?.tier === "gold") {
			discountPercent = 5;
		}
	}

	function getCartItemCount(productId: number): number {
		const item = cart.find((i) => i.productId === productId);
		return item ? item.quantity : 0;
	}

	function getCategoryIcon(slug: string | null) {
		if (slug === "food") return Utensils;
		if (slug === "grooming") return Sparkles;
		if (slug === "aquarium") return Fish;
		if (slug === "treats") return Gift;
		if (slug === "healthcare") return HeartPulse;
		return Tag;
	}

	function printReceipt() {
		window.print();
	}

	function closeReceiptAndNewSale() {
		receiptModalOpen = false;
		completedOrder = null;
	}
</script>

<svelte:head>
	<title>POS Cashier Register · PetCo</title>
</svelte:head>

<div class="pos-container">
	<!-- Top Bar -->
	<header class="pos-header">
		<div class="pos-title-wrap">
			<div class="kicker"><CreditCard size={13} /> {t['pos.kicker']()}</div>
			<div class="pos-heading-row">
				<h1>{t['pos.title']()}</h1>
				<span class="cashier-badge">
					<Store size={13} />
					<span>Cashier: <strong>{data.user?.name || "Staff"}</strong></span>
				</span>
			</div>
		</div>

		<div class="pos-header-actions">
			<button class="btn btn-sm btn-subtle" onclick={() => salesHistoryModalOpen = true}>
				<Receipt size={14} />
				<span>Sales History ({data.recentOrders?.length ?? 0})</span>
			</button>
			<a href="/shop" class="btn btn-ghost btn-sm">
				<ShoppingBag size={14} />
				<span>Inventory &amp; SKUs</span>
			</a>
			{#if cart.length > 0}
				<button class="btn btn-ghost btn-sm text-danger" onclick={clearCart}>
					<Trash2 size={14} />
					<span>Clear Cart</span>
				</button>
			{/if}
		</div>
	</header>

	{#if checkoutError}
		<div class="alert alert-error mb">
			<AlertCircle size={16} />
			<span>{checkoutError}</span>
		</div>
	{/if}

	<!-- Main POS Layout: 2 Columns -->
	<div class="pos-body">
		<!-- Left: Catalog & Product Grid -->
		<section class="catalog-pane">
			<!-- Search & Filter Bar -->
			<div class="catalog-toolbar">
				<div class="search-box pos-search">
					<Search size={16} class="search-icon" />
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search products by name, SKU, or barcode (or press /)..."
						aria-label="Search catalog"
					/>
					{#if searchQuery}
						<button class="search-clear" onclick={() => (searchQuery = "")} aria-label="Clear search">
							<XCircle size={14} />
						</button>
					{/if}
				</div>

				<div class="row gap-2 align-center">
					<label class="stock-toggle-label">
						<input type="checkbox" bind:checked={onlyInStock} />
						<span>In Stock Only</span>
					</label>
				</div>
			</div>

			<!-- Category Pills -->
			<div class="category-strip">
				<button
					type="button"
					class="cat-chip {selectedCategory === 'all' ? 'active' : ''}"
					onclick={() => (selectedCategory = "all")}
				>
					<Layers size={13} />
					<span>All Items ({data.products.length})</span>
				</button>
				{#each data.categories as cat}
					{@const CatIcon = getCategoryIcon(cat.slug)}
					<button
						type="button"
						class="cat-chip {selectedCategory === cat.slug ? 'active' : ''}"
						onclick={() => (selectedCategory = cat.slug)}
					>
						<CatIcon size={13} />
						<span>{cat.name}</span>
					</button>
				{/each}
			</div>

			<!-- Products Grid -->
			<div class="products-grid">
				{#if filteredProducts.length === 0}
					<div class="empty-catalog-box">
						<EmptyState
							title="No items found"
							description="No active retail products match your filter."
							icon={ShoppingBag}
						>
							<button class="btn btn-sm btn-ghost" onclick={() => { searchQuery = ""; selectedCategory = "all"; onlyInStock = false; }}>
								<RotateCcw size={13} />
								<span>Reset Filters</span>
							</button>
						</EmptyState>
					</div>
				{:else}
					{#each filteredProducts as p (p.id)}
						<ProductCard product={p} inCartCount={getCartItemCount(p.id)} onAdd={(prod) => { if ((prod.stockQty ?? 0) > 0) addToCart(prod); }} />
					{/each}
				{/if}
			</div>
		</section>

		<!-- Right: Live Interactive Cart & Checkout -->
		<aside class="cart-pane">
			<div class="cart-card">
				<!-- Customer & Pet Selector Header -->
				<div class="cart-customer-section">
					<div class="field mb-2">
						<label for="pos-customer" class="cart-field-label">
							<User size={13} />
							<span>Customer / Member</span>
						</label>
						<select id="pos-customer" bind:value={selectedCustomerId} class="customer-select">
							<option value="">Walk-in Customer (Guest)</option>
							{#each data.customers as cust}
								<option value={String(cust.id)}>
									{cust.firstName} {cust.lastName} ({cust.phone}) — {cust.tier ? cust.tier.toUpperCase() : 'SILVER'} ({cust.pointsBalance ?? 0} pts)
								</option>
							{/each}
						</select>
					</div>

					{#if selectedCustomer}
						<!-- Customer Loyalty Strip -->
						<div class="customer-loyalty-card">
							<div class="row spread align-center">
								<div class="row gap-2 align-center">
									<Badge variant={selectedCustomer.tier ?? 'silver'} label={selectedCustomer.tier ? selectedCustomer.tier.toUpperCase() : 'SILVER'} />
									<span class="points-text mono">
										<Award size={13} />
										<strong>{selectedCustomer.pointsBalance ?? 0}</strong> pts
									</span>
								</div>

								{#if selectedCustomer.tier === "gold" || selectedCustomer.tier === "platinum"}
									<button
										type="button"
										class="btn btn-xs btn-ghost text-primary"
										onclick={applyTierDiscount}
										title="Apply member discount rate"
									>
										<Percent size={11} />
										<span>Apply {selectedCustomer.tier === 'platinum' ? '10%' : '5%'} Perk</span>
									</button>
								{/if}
							</div>
							<!-- Pet Selector if customer has pets -->
							{#if customerPets.length > 0}
								<div class="pet-pick-row" style="margin-top: 8px;">
									<span class="tiny muted">Patient / Pet:</span>
									<div class="pet-chips row gap-1">
										{#each customerPets as pet}
											<button
												type="button"
												class="pet-chip {selectedPetId === String(pet.id) ? 'active' : ''}"
												onclick={() => (selectedPetId = String(pet.id))}
											>
												<PetAvatar name={pet.name} species={pet.species} size="sm" />
											</button>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{/if}
				</div>

				<!-- Cart Items List -->
				<div class="cart-items-wrap">
					<div class="cart-items-header row spread">
						<span class="cart-header-title">Receipt Items ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
						<span class="tiny muted">Price &amp; Subtotal</span>
					</div>

					{#if cart.length === 0}
						<div class="cart-empty">
							<ShoppingBag size={32} strokeWidth={1.5} class="muted" />
							<p>Cart is empty</p>
							<span class="tiny faint">Tap products on the left to add items</span>
						</div>
					{:else}
						<div class="cart-items-list">
							{#each cart as item (item.productId)}
								<div class="cart-item-row">
									<div class="item-main">
										<div class="item-name">{item.name}</div>
										<div class="item-meta row gap-2">
											<span class="mono tiny muted">{item.sku}</span>
											<span class="mono tiny text-primary">{money(item.unitPriceCents)}</span>
										</div>
									</div>

									<div class="item-controls-col">
										<!-- Stepper -->
										<div class="qty-stepper">
											<button
												type="button"
												class="step-btn"
												onclick={() => decrementQty(item.productId)}
												aria-label="Decrease quantity"
											>
												<Minus size={12} />
											</button>
											<span class="qty-num mono">{item.quantity}</span>
											<button
												type="button"
												class="step-btn"
												onclick={() => incrementQty(item.productId)}
												aria-label="Increase quantity"
											>
												<Plus size={12} />
											</button>
										</div>

										<div class="item-subtotal mono font-bold">
											{money(item.unitPriceCents * item.quantity)}
										</div>

										<button
											type="button"
											class="item-delete-btn"
											onclick={() => removeFromCart(item.productId)}
											aria-label="Remove item"
										>
											<Trash2 size={13} />
										</button>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Cart Summary & Calculations -->
				<div class="cart-calculations">
					<div class="calc-row">
						<span class="calc-label">Subtotal</span>
						<span class="calc-val mono">{money(subtotalCents)}</span>
					</div>

					<!-- Discount Control -->
					<div class="discount-section">
						<div class="calc-row align-center">
							<span class="calc-label">Discount</span>
							<div class="discount-pills row gap-1">
								<button
									type="button"
									class="disc-btn {discountPercent === 0 && customDiscountAmount === 0 ? 'active' : ''}"
									onclick={() => { discountPercent = 0; customDiscountAmount = 0; }}
								>
									0%
								</button>
								<button
									type="button"
									class="disc-btn {discountPercent === 5 ? 'active' : ''}"
									onclick={() => { discountPercent = 5; customDiscountAmount = 0; }}
								>
									5%
								</button>
								<button
									type="button"
									class="disc-btn {discountPercent === 10 ? 'active' : ''}"
									onclick={() => { discountPercent = 10; customDiscountAmount = 0; }}
								>
									10%
								</button>
								<button
									type="button"
									class="disc-btn {discountPercent === 15 ? 'active' : ''}"
									onclick={() => { discountPercent = 15; customDiscountAmount = 0; }}
								>
									15%
								</button>
							</div>
						</div>
						{#if calculatedDiscountCents > 0}
							<div class="calc-row discount-applied">
								<span class="tiny text-success">Discount Applied ({discountPercent > 0 ? `${discountPercent}%` : 'Custom'})</span>
								<span class="mono text-success font-bold">-{money(calculatedDiscountCents)}</span>
							</div>
						{/if}
					</div>

					<!-- Grand Total -->
					<div class="grand-total-box">
						<div class="total-label-col">
							<span class="total-label">Grand Total</span>
							<span class="tax-inclusive-tag">Tax inclusive</span>
						</div>
						<div class="total-amount mono">{money(grandTotalCents)}</div>
					</div>

					<!-- Loyalty Points Accrual Notice -->
					{#if selectedCustomer && grandTotalCents > 0 && paymentMethod !== 'points'}
						<div class="points-accrual-box">
							<Sparkles size={13} class="text-purple" />
							<span>Customer will earn <strong>+{estimatedPointsEarned}</strong> loyalty points</span>
						</div>
					{/if}
				</div>

				<!-- Payment Method Selection -->
				<div class="payment-method-section">
					<div class="payment-title">Payment Method</div>
					<div class="payment-grid">
						<button
							type="button"
							class="pay-method-card {paymentMethod === 'cash' ? 'active' : ''}"
							onclick={() => (paymentMethod = "cash")}
						>
							<Banknote size={18} />
							<span>Cash</span>
						</button>

						<button
							type="button"
							class="pay-method-card {paymentMethod === 'qris' ? 'active' : ''}"
							onclick={() => (paymentMethod = "qris")}
						>
							<QrCode size={18} />
							<span>QRIS</span>
						</button>

						<button
							type="button"
							class="pay-method-card {paymentMethod === 'card' ? 'active' : ''}"
							onclick={() => (paymentMethod = "card")}
						>
							<CreditCard size={18} />
							<span>Debit/Card</span>
						</button>

						<button
							type="button"
							class="pay-method-card {paymentMethod === 'points' ? 'active' : ''} {!selectedCustomer || ((selectedCustomer.pointsBalance ?? 0) < pointsRequiredForPayment) ? 'disabled' : ''}"
							onclick={() => {
								if (selectedCustomer && (selectedCustomer.pointsBalance ?? 0) >= pointsRequiredForPayment) {
									paymentMethod = "points";
								}
							}}
							disabled={!selectedCustomer || ((selectedCustomer.pointsBalance ?? 0) < pointsRequiredForPayment)}
						>
							<Award size={18} />
							<span>Points</span>
							{#if selectedCustomer}
								<span class="tiny faint">({pointsRequiredForPayment} pts)</span>
							{/if}
						</button>
					</div>
				</div>

				<!-- Checkout Submission Form -->
				<form method="POST" action="?/checkout" class="checkout-form">
					<input type="hidden" name="cart" value={JSON.stringify(cart)} />
					<input type="hidden" name="ownerId" value={selectedCustomerId} />
					<input type="hidden" name="petId" value={selectedPetId} />
					<input type="hidden" name="paymentMethod" value={paymentMethod} />
					<input type="hidden" name="discountCents" value={calculatedDiscountCents} />
					<input type="hidden" name="notes" value={receiptNotes} />

					<button
						type="submit"
						class="btn btn-primary checkout-btn"
						disabled={cart.length === 0}
					>
						<ReceiptText size={18} strokeWidth={2.2} />
						<div class="btn-text-col">
							<span class="checkout-main-text">Complete Checkout &amp; Print Receipt</span>
							<span class="checkout-sub-text">{money(grandTotalCents)} · {paymentMethod.toUpperCase()}</span>
						</div>
						<ArrowRight size={16} />
					</button>
				</form>
			</div>
		</aside>
	</div>
</div>

<!-- Modal: Thermal Receipt View -->
{#if completedOrder}
	<Modal bind:open={receiptModalOpen} title="Sale Completed · Receipt" subtitle="Transaction successfully recorded and stock deducted" maxWidth="480px">
		<div class="receipt-paper">
			<!-- Receipt Header -->
			<div class="receipt-header">
				<div class="receipt-brand">
					<PawPrint size={22} strokeWidth={2.4} />
					<h2>PetCo Pet Care &amp; Retail</h2>
				</div>
				<p class="receipt-store-sub">Main Branch · Jl. Kemang Raya No. 42</p>
				<p class="receipt-store-sub">Tel: (021) 718-2938</p>
				<div class="receipt-divider">--------------------------------</div>
			</div>

			<!-- Meta info -->
			<div class="receipt-meta">
				<div class="row spread">
					<span>Receipt No:</span>
					<strong class="mono">{completedOrder.orderNumber}</strong>
				</div>
				<div class="row spread">
					<span>Date/Time:</span>
					<span>{new Date(completedOrder.createdAt).toLocaleString('id-ID')}</span>
				</div>
				<div class="row spread">
					<span>Cashier:</span>
					<span>{completedOrder.cashierName}</span>
				</div>
				<div class="row spread">
					<span>Customer:</span>
					<span>{completedOrder.customerName}</span>
				</div>
				{#if completedOrder.petName}
					<div class="row spread">
						<span>Pet:</span>
						<span>{completedOrder.petName}</span>
					</div>
				{/if}
			</div>

			<div class="receipt-divider">--------------------------------</div>

			<!-- Items List -->
			<div class="receipt-items">
				{#each completedOrder.items as item}
					<div class="receipt-item-row">
						<div class="receipt-item-top row spread">
							<span class="item-name-str">{item.name}</span>
							<span class="mono font-bold">{money(item.subtotalCents)}</span>
						</div>
						<div class="receipt-item-sub tiny muted">
							{item.quantity} x {money(item.unitPriceCents)}
						</div>
					</div>
				{/each}
			</div>

			<div class="receipt-divider">--------------------------------</div>

			<!-- Totals -->
			<div class="receipt-totals">
				<div class="row spread">
					<span>Subtotal</span>
					<span class="mono">{money(completedOrder.subtotalCents)}</span>
				</div>
				{#if completedOrder.discountCents > 0}
					<div class="row spread text-success">
						<span>Discount</span>
						<span class="mono">-{money(completedOrder.discountCents)}</span>
					</div>
				{/if}
				<div class="row spread font-bold grand-row">
					<span>TOTAL PAID</span>
					<span class="mono text-primary font-lg">{money(completedOrder.totalCents)}</span>
				</div>
				<div class="row spread payment-badge-row">
					<span>Payment Method:</span>
					<span class="badge status-valid">{completedOrder.paymentMethod.toUpperCase()}</span>
				</div>
			</div>

			<!-- Loyalty Points summary -->
			{#if completedOrder.pointsEarned > 0 || completedOrder.newPointsBalance > 0}
				<div class="receipt-divider">--------------------------------</div>
				<div class="receipt-points-box">
					<div class="row spread">
						<span>✨ Loyalty Points Earned:</span>
						<strong class="mono text-purple">+{completedOrder.pointsEarned} pts</strong>
					</div>
					<div class="row spread">
						<span>New Total Points Balance:</span>
						<span class="mono font-bold">{completedOrder.newPointsBalance} pts</span>
					</div>
				</div>
			{/if}

			<div class="receipt-divider">--------------------------------</div>

			<!-- Footer Greeting -->
			<div class="receipt-footer-text">
				<p>Thank you for shopping at PetCo!</p>
				<p class="tiny muted">Bring your receipt for returns or exchanges within 7 days.</p>
				<p class="pet-wish">Have a wonderful day with your pets! 🐾</p>
			</div>
		</div>

		<div class="modal-footer row spread" style="margin-top: 16px;">
			<button type="button" class="btn btn-secondary" onclick={printReceipt}>
				<Printer size={15} />
				<span>Print Receipt</span>
			</button>
			<button type="button" class="btn btn-primary" onclick={closeReceiptAndNewSale}>
				<Check size={15} />
				<span>New Sale / Next Order</span>
			</button>
		</div>
	</Modal>
{/if}

<!-- Modal: Sales History Log -->
<Modal bind:open={salesHistoryModalOpen} title="POS Sales &amp; Transaction History" subtitle="Review past retail register receipts and reprint invoices" maxWidth="780px">
	<div class="table-wrap">
		{#if !data.recentOrders || data.recentOrders.length === 0}
			<div class="empty-state" style="padding: var(--sp-6);">
				<p class="small muted">No transactions recorded yet.</p>
			</div>
		{:else}
			<table>
				<thead>
					<tr>
						<th>Receipt #</th>
						<th>Time</th>
						<th>Items</th>
						<th>Payment</th>
						<th class="num">Total Amount</th>
						<th class="num">Action</th>
					</tr>
				</thead>
				<tbody>
					{#each data.recentOrders as ord}
						<tr>
							<td class="mono font-bold text-primary">#{ord.orderNumber}</td>
							<td class="small muted mono">{new Date(ord.createdAt).toLocaleString('id-ID')}</td>
							<td>
								<span class="small font-semibold">{ord.items?.length ?? 0} item(s)</span>
							</td>
							<td>
								<span class="badge badge-neutral uppercase font-bold">{ord.paymentMethod}</span>
							</td>
							<td class="num mono cell-strong text-success">{money(ord.totalCents)}</td>
							<td class="num">
								<button class="btn btn-sm btn-ghost" onclick={() => {
									completedOrder = {
										...ord,
										cashierName: data.user?.name || "Cashier",
										customerName: "Customer",
										petName: null,
										pointsEarned: Math.floor(ord.totalCents / 1000),
										items: ord.items ? ord.items.map((it) => ({
											name: it.productName,
											quantity: it.quantity,
											unitPriceCents: it.unitPriceCents,
											subtotalCents: it.subtotalCents
										})) : []
									};
									salesHistoryModalOpen = false;
									receiptModalOpen = true;
								}}>
									<Printer size={13} />
									<span>View Receipt</span>
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</Modal>
<style>
	.pos-container {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.pos-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: var(--surface);
		padding: 16px 20px;
		border-radius: var(--r-lg);
		border: 1px solid var(--border);
		box-shadow: var(--shadow-xs);
	}

	.pos-heading-row {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.pos-heading-row h1 {
		font-size: 20px;
		font-weight: 800;
		color: var(--ink);
		margin: 0;
	}

	.cashier-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		color: var(--ink-2);
		background: var(--surface-2);
		padding: 3px 8px;
		border-radius: var(--r-full);
		border: 1px solid var(--border-subtle);
	}

	.pos-header-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	/* Two-column Layout */
	.pos-body {
		display: grid;
		grid-template-columns: 1fr 420px;
		gap: 20px;
		align-items: start;
	}

	@media (max-width: 1024px) {
		.pos-body {
			grid-template-columns: 1fr;
		}
	}

	/* Catalog Pane */
	.catalog-pane {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.catalog-toolbar {
		display: flex;
		gap: 12px;
		align-items: center;
		justify-content: space-between;
		background: var(--surface);
		padding: 12px 16px;
		border-radius: var(--r-lg);
		border: 1px solid var(--border);
	}

	.pos-search {
		flex: 1;
		max-width: 500px;
	}

	.stock-toggle-label {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12.5px;
		font-weight: 600;
		color: var(--ink-2);
		cursor: pointer;
		user-select: none;
	}

	.category-strip {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.cat-chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		border-radius: var(--r-full);
		font-size: 12px;
		font-weight: 600;
		color: var(--ink-2);
		background: var(--surface);
		border: 1px solid var(--border);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.cat-chip:hover {
		background: var(--surface-2);
		border-color: var(--border-strong);
	}

	.cat-chip.active {
		background: var(--primary-soft);
		color: var(--primary);
		border-color: var(--primary-border);
	}

	/* Product Grid */
	.products-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 12px;
	}

	/* Cart Pane */
	.cart-pane {
		position: sticky;
		top: 16px;
	}

	.cart-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-lg);
		box-shadow: var(--shadow-sm);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.cart-customer-section {
		padding: 14px 16px;
		border-bottom: 1px solid var(--border);
		background: var(--surface-2);
	}

	.cart-field-label {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		font-weight: 700;
		color: var(--ink-2);
		margin-bottom: 4px;
	}

	.customer-select {
		font-size: 12.5px;
		padding: 6px 10px;
	}

	.customer-loyalty-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-md);
		padding: 8px 12px;
	}

	.points-text {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 12px;
		color: var(--purple);
	}

	.pet-chips {
		margin-top: 4px;
	}

	.pet-chip {
		padding: 2px 6px;
		border: 1px solid var(--border);
		border-radius: var(--r-sm);
		background: var(--surface-2);
		cursor: pointer;
	}

	.pet-chip.active {
		border-color: var(--primary);
		background: var(--primary-soft);
	}

	/* Cart items */
	.cart-items-wrap {
		padding: 12px 16px;
		max-height: 280px;
		overflow-y: auto;
		border-bottom: 1px solid var(--border);
	}

	.cart-items-header {
		margin-bottom: 8px;
	}

	.cart-header-title {
		font-size: 12px;
		font-weight: 700;
		color: var(--ink-3);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.cart-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 24px 0;
		gap: 4px;
		text-align: center;
	}

	.cart-empty p {
		font-weight: 600;
		color: var(--ink-2);
		margin: 0;
		font-size: 14px;
	}

	.cart-items-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.cart-item-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 0;
		border-bottom: 1px solid var(--border-subtle);
		gap: 8px;
	}

	.cart-item-row:last-child {
		border-bottom: none;
	}

	.item-main {
		min-width: 0;
		flex: 1;
	}

	.item-name {
		font-size: 12.5px;
		font-weight: 600;
		color: var(--ink);
		line-height: 1.3;
	}

	.item-controls-col {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.qty-stepper {
		display: flex;
		align-items: center;
		border: 1px solid var(--border);
		border-radius: var(--r-sm);
		background: var(--surface-2);
		overflow: hidden;
	}

	.step-btn {
		width: 24px;
		height: 24px;
		display: grid;
		place-items: center;
		background: transparent;
		border: none;
		cursor: pointer;
		color: var(--ink-2);
	}

	.step-btn:hover {
		background: var(--surface-3);
	}

	.qty-num {
		font-size: 12px;
		font-weight: 700;
		padding: 0 6px;
		min-width: 20px;
		text-align: center;
	}

	.item-subtotal {
		font-size: 12.5px;
		color: var(--ink);
		min-width: 75px;
		text-align: right;
	}

	.item-delete-btn {
		background: transparent;
		border: none;
		color: var(--muted);
		cursor: pointer;
		padding: 4px;
		border-radius: var(--r-xs);
	}

	.item-delete-btn:hover {
		color: var(--danger);
		background: var(--danger-bg);
	}

	/* Calculations */
	.cart-calculations {
		padding: 12px 16px;
		background: var(--surface-2);
		border-bottom: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.calc-row {
		display: flex;
		justify-content: space-between;
		font-size: 13px;
		color: var(--ink-2);
	}

	.discount-pills {
		display: flex;
		gap: 4px;
	}

	.disc-btn {
		padding: 2px 7px;
		font-size: 11px;
		font-weight: 600;
		border-radius: var(--r-xs);
		background: var(--surface);
		border: 1px solid var(--border);
		cursor: pointer;
	}

	.disc-btn.active {
		background: var(--primary);
		color: #ffffff;
		border-color: var(--primary);
	}

	.grand-total-box {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 8px;
		margin-top: 4px;
		border-top: 1px dashed var(--border-strong);
	}

	.total-label {
		font-size: 14px;
		font-weight: 800;
		color: var(--ink);
	}

	.tax-inclusive-tag {
		display: block;
		font-size: 10.5px;
		color: var(--muted);
	}

	.total-amount {
		font-size: 20px;
		font-weight: 900;
		color: var(--primary);
	}

	.points-accrual-box {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11.5px;
		color: var(--ink-2);
		background: var(--purple-bg);
		border: 1px solid var(--purple-border);
		padding: 5px 10px;
		border-radius: var(--r-sm);
	}

	/* Payment methods */
	.payment-method-section {
		padding: 12px 16px;
		border-bottom: 1px solid var(--border);
	}

	.payment-title {
		font-size: 11.5px;
		font-weight: 700;
		color: var(--ink-3);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 8px;
	}

	.payment-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 6px;
	}

	.pay-method-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 10px 4px;
		gap: 4px;
		border-radius: var(--r-md);
		background: var(--surface-2);
		border: 1px solid var(--border);
		font-size: 11.5px;
		font-weight: 600;
		color: var(--ink-2);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.pay-method-card:hover:not(:disabled) {
		background: var(--surface-3);
		border-color: var(--border-strong);
	}

	.pay-method-card.active {
		background: var(--primary-soft);
		color: var(--primary);
		border-color: var(--primary);
		box-shadow: 0 0 0 1px var(--primary);
	}

	.pay-method-card.disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* Checkout button */
	.checkout-form {
		padding: 14px 16px;
	}

	.checkout-btn {
		width: 100%;
		padding: 14px 16px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 14px;
		border-radius: var(--r-md);
	}

	.btn-text-col {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		line-height: 1.2;
	}

	.checkout-main-text {
		font-weight: 800;
		font-size: 13.5px;
	}

	.checkout-sub-text {
		font-size: 11.5px;
		opacity: 0.85;
		font-family: var(--font-mono);
	}

	/* Thermal Receipt Styling */
	.receipt-paper {
		background: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: var(--r-md);
		padding: 20px;
		font-family: var(--font-mono);
		font-size: 12px;
		color: #0f172a;
		box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
	}

	.receipt-header {
		text-align: center;
	}

	.receipt-brand {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		margin-bottom: 4px;
	}

	.receipt-brand h2 {
		font-size: 15px;
		font-weight: 800;
		margin: 0;
	}

	.receipt-store-sub {
		font-size: 11px;
		color: #64748b;
		margin: 1px 0;
	}

	.receipt-divider {
		color: #94a3b8;
		text-align: center;
		margin: 8px 0;
		overflow: hidden;
		white-space: nowrap;
		letter-spacing: 2px;
	}

	.receipt-meta {
		display: flex;
		flex-direction: column;
		gap: 3px;
		font-size: 11.5px;
	}

	.receipt-items {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.receipt-item-row {
		display: flex;
		flex-direction: column;
	}

	.receipt-totals {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.grand-row {
		font-size: 14px;
		padding-top: 4px;
		margin-top: 2px;
		border-top: 1px solid #e2e8f0;
	}

	.receipt-points-box {
		background: #f5f3ff;
		padding: 8px 10px;
		border-radius: 4px;
		display: flex;
		flex-direction: column;
		gap: 2px;
		font-size: 11.5px;
	}

	.receipt-footer-text {
		text-align: center;
		font-size: 11.5px;
		margin-top: 6px;
	}

	.receipt-footer-text p {
		margin: 2px 0;
	}

	.pet-wish {
		font-weight: 700;
		margin-top: 6px !important;
	}
</style>
