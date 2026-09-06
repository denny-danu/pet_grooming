<script lang="ts">
	import { page } from "$app/state";
	import {
		ArrowLeft,
		Phone,
		Mail,
		MapPin,
		Plus,
		CalendarPlus,
		Award,
		Wallet,
		PawPrint,
		Syringe,
		ShieldAlert,
		ShieldCheck,
		TriangleAlert,
		Tag,
		History,
		ReceiptText,
		ChevronDown,
		Star,
		Sparkles,
		CalendarDays,
		PackageCheck,
		User,
		Info,
		AlertCircle,
		CheckCircle2,
		ExternalLink,
		Scissors,
		Hotel,
		X,
		Pencil,
		ShoppingBag,
		Fish,
		CreditCard,
		Save,
		FileText
	} from "@lucide/svelte";
	import { formatRupiah as money } from "$lib/util";
	import { getSpeciesEmoji } from "$lib/ui/species";
	import DatePicker from "$lib/components/DatePicker.svelte";
	import Modal from "$lib/components/Modal.svelte";

	let { data } = $props();
	const form = $derived(page.form);
	const addPetError = $derived(form?.addPetError);
	const packageError = $derived(form?.packageError);
	const editCustomerError = $derived(form?.editCustomerError);
	const editPetError = $derived(form?.editPetError);

	const fmtWhen = (d: Date | string) =>
		new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	const fmtDay = (d: Date | string) =>
		new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
	const fmtWhenShort = (d: Date | string | null) => (d ? fmtDay(d) : '—');

	const cust = $derived(data.customer);
	const bookingsList = $derived(data.bookings ?? []);
	const ledgersList = $derived(data.ledgers ?? []);
	const packagesList = $derived(data.packages ?? []);
	const retailOrders = $derived(data.retailOrders ?? []);
	const customerTanksList = $derived(data.tanks ?? []);

	let addPetOpen = $state(false);
	let editCustomerOpen = $state(false);
	let editPetOpen = $state(false);
	let editingPet = $state<any | null>(null);
	let buyPackageOpen = $state(false);
	let activeTab = $state<"visits" | "orders" | "tanks" | "ledger">("visits");

	function initials(name: string | undefined | null) {
		return (name || '?').split(/\s+/).map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";
	}

	function vaxInfo(s: string | null | undefined) {
		if (s === 'valid') return { label: 'Vaccinated', cls: 'badge-success', Icon: ShieldCheck };
		if (s === 'expiring') return { label: 'Due Soon', cls: 'badge-warning', Icon: TriangleAlert };
		if (s === 'expired') return { label: 'Expired', cls: 'badge-danger', Icon: ShieldAlert };
		return { label: 'No record', cls: 'badge-neutral', Icon: Syringe };
	}

	function pointsToNextTier(pts: number, tier: string | undefined) {
		if (tier === 'platinum') return { label: 'Max Tier (Platinum 👑)', progress: 100, remaining: 0 };
		if (tier === 'gold') {
			const target = 5000;
			const remaining = Math.max(0, target - pts);
			const progress = Math.min(100, Math.round((pts / target) * 100));
			return { label: `${remaining} pts to Platinum`, progress, remaining };
		}
		const target = 1500;
		const remaining = Math.max(0, target - pts);
		const progress = Math.min(100, Math.round((pts / target) * 100));
		return { label: `${remaining} pts to Gold ⭐`, progress, remaining };
	}

	const tierProgress = $derived(
		pointsToNextTier(data.membership?.pointsBalance ?? 0, data.membership?.tier)
	);

	const totalPackageCredits = $derived(
		packagesList.reduce((acc, p) => acc + (p.creditsRemaining ?? 0), 0)
	);

	function openEditPet(pet: any) {
		editingPet = pet;
		editPetOpen = true;
	}
</script>

<svelte:head>
	<title>{cust ? `${cust.firstName} ${cust.lastName}` : 'Customer'} · PetCo</title>
</svelte:head>

{#if data.notFound}
	<div class="empty-state" style="margin-top: 60px">
		<div class="empty-icon"><User /></div>
		<h3>Customer not found</h3>
		<p>The requested customer profile could not be located.</p>
		<a href="/customers" class="btn btn-primary">
			<ArrowLeft size={14} /> Back to Directory
		</a>
	</div>
{:else if cust}
	<a href="/customers" class="back-link">
		<ArrowLeft size={15} /> Back to Customers
	</a>

	<!-- Customer Hero Profile Header -->
	<div class="card pad mb profile-hero-card">
		<div class="spread" style="align-items: flex-start;">
			<div class="row gap-3" style="align-items: flex-start;">
				<span class="avatar xl">{initials(`${cust.firstName} ${cust.lastName}`)}</span>
				<div class="stack-sm">
					<div class="row gap-2">
						<h1 style="font-size: 24px;">{cust.firstName} {cust.lastName}</h1>
						<span class="badge tier-{data.membership?.tier ?? 'silver'}">
							{data.membership?.tier ? data.membership.tier.toUpperCase() : 'SILVER TIER'}
						</span>
						<button class="btn btn-sm btn-ghost" onclick={() => editCustomerOpen = true} title="Edit Client Profile">
							<Pencil size={13} />
							<span>Edit Profile</span>
						</button>
					</div>
					<div class="row gap-3 small muted">
						<span class="row gap-1 mono">
							<Phone size={13} class="muted" />
							<span>{cust.phone}</span>
						</span>
						{#if cust.email}
							<span class="row gap-1">
								<Mail size={13} class="muted" />
								<span>{cust.email}</span>
							</span>
						{/if}
						{#if cust.address}
							<span class="row gap-1">
								<MapPin size={13} class="muted" />
								<span>{cust.address}</span>
							</span>
						{/if}
						<span>· Client ID #{cust.id}</span>
					</div>
				</div>
			</div>

			<div class="actions">
				<button class="btn" type="button" onclick={() => { addPetOpen = true; buyPackageOpen = false; }}>
					<PawPrint size={14} />
					<span>Add Pet</span>
				</button>
				<button class="btn" type="button" onclick={() => { buyPackageOpen = true; addPetOpen = false; }}>
					<PackageCheck size={14} />
					<span>Sell Package</span>
				</button>
				<a href="/bookings/new?owner={cust.id}" class="btn btn-primary">
					<CalendarPlus size={14} />
					<span>Book Visit</span>
				</a>
			</div>
		</div>
	</div>

	{#if form?.customerUpdated}
		<div class="alert alert-success mb">
			<CheckCircle2 size={16} />
			<span>Customer profile details updated successfully!</span>
		</div>
	{/if}

	{#if form?.petUpdated}
		<div class="alert alert-success mb">
			<CheckCircle2 size={16} />
			<span>Pet patient record updated successfully!</span>
		</div>
	{/if}

	<!-- Profile Summary Metrics -->
	<div class="stat-grid" style="margin-bottom: var(--sp-6);">
		<div class="stat-card">
			<div class="stat-top">
				<div class="stat-icon amber">
					<PawPrint size={18} />
				</div>
				<span class="stat-trend neutral">Profiles</span>
			</div>
			<div class="stat-value">{cust.pets.length}</div>
			<div class="stat-label">Registered Pets</div>
		</div>

		<div class="stat-card">
			<div class="stat-top">
				<div class="stat-icon purple">
					<CalendarDays size={18} />
				</div>
				<span class="stat-trend up">Lifetime</span>
			</div>
			<div class="stat-value">{bookingsList.length}</div>
			<div class="stat-label">Total Visits &amp; Stays</div>
		</div>

		<div class="stat-card">
			<div class="stat-top">
				<div class="stat-icon blue">
					<ShoppingBag size={18} />
				</div>
				<span class="stat-trend neutral">Purchases</span>
			</div>
			<div class="stat-value">{retailOrders.length}</div>
			<div class="stat-label">Retail Shop Orders</div>
		</div>

		<div class="stat-card">
			<div class="stat-top">
				<div class="stat-icon green">
					<Award size={18} />
				</div>
				<span class="stat-trend up">{data.membership?.pointsBalance ?? 0} pts</span>
			</div>
			<div class="stat-value">{data.membership?.pointsBalance ?? 0}</div>
			<div class="stat-label">Loyalty Points</div>
		</div>
	</div>

	<!-- Registered Pets Dossier Section -->
	<section class="card mb">
		<div class="card-head">
			<h2>
				<PawPrint size={17} />
				Registered Pets ({cust.pets.length})
			</h2>
			<button class="btn btn-sm btn-subtle" onclick={() => { addPetOpen = true; buyPackageOpen = false; }}>
				<Plus size={13} /> <span>Add Pet</span>
			</button>
		</div>

		<div class="card-body">
			{#if cust.pets.length === 0}
				<div class="empty-state" style="padding: var(--sp-6);">
					<div class="empty-icon"><PawPrint /></div>
					<h3>No pets registered yet</h3>
					<p>Add a pet record to track grooming preferences, allergies, and vaccination compliance.</p>
					<button class="btn btn-primary btn-sm" onclick={() => addPetOpen = true}>
						<Plus size={14} /> <span>Add First Pet</span>
					</button>
				</div>
			{:else}
				<div class="grid cols-2 pet-dossier-grid">
					{#each cust.pets as pet}
						{@const vi = vaxInfo(pet.vaccineStatus)}
						{@const VaxIcon = vi.Icon}
						<div class="pet-card">
							<div class="pet-card-head">
								<div class="row gap-2">
									<span class="pet-emoji-avatar">{getSpeciesEmoji(pet.species)}</span>
									<div>
										<div class="pet-card-name">{pet.name}</div>
										<div class="pet-card-sub">{pet.breed ?? pet.species}{pet.weightKg ? ` · ${pet.weightKg} kg` : ''}</div>
									</div>
								</div>
								<div class="row gap-2">
									<span class="badge {vi.cls}">
										<VaxIcon size={12} />
										{vi.label}
									</span>
									<button class="btn btn-sm btn-ghost" onclick={() => openEditPet(pet)} title="Edit Pet Details">
										<Pencil size={12} />
									</button>
								</div>
							</div>

							<div class="pet-card-body">
								<div class="pet-meta-grid">
									<div>
										<span class="pet-meta-label">Species</span>
										<div class="pet-meta-val">{pet.species.toUpperCase()}</div>
									</div>
									<div>
										<span class="pet-meta-label">Vaccine Expiry</span>
										<div class="pet-meta-val mono">{fmtWhenShort(pet.vaccinationDueDate)}</div>
									</div>
									{#if pet.allergies}
										<div style="grid-column: span 2;">
											<span class="pet-meta-label">Allergies / Special Notes</span>
											<div class="pet-meta-val text-danger">{pet.allergies}</div>
										</div>
									{/if}
									{#if pet.behaviorNotes}
										<div style="grid-column: span 2;">
											<span class="pet-meta-label">Temperament</span>
											<div class="pet-meta-val">{pet.behaviorNotes}</div>
										</div>
									{/if}
								</div>
							</div>

							<div class="pet-card-foot">
								<a href="/bookings/new?owner={cust.id}&pet={pet.id}&kind=grooming" class="btn btn-ghost btn-sm">
									<Scissors size={12} />
									<span>Book Grooming</span>
								</a>
								<a href="/bookings/new?owner={cust.id}&pet={pet.id}&kind=hotel" class="btn btn-ghost btn-sm">
									<Hotel size={12} />
									<span>Book Boarding</span>
								</a>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<!-- Membership & Package Credits Section -->
	<div class="grid cols-2" style="margin-bottom: var(--sp-6);">
		<!-- Loyalty Status Card -->
		<section class="card">
			<div class="card-head">
				<h2>
					<Award size={17} />
					Loyalty Program
				</h2>
				<span class="badge tier-{data.membership?.tier ?? 'silver'}">
					{data.membership?.tier ? data.membership.tier.toUpperCase() : 'SILVER'}
				</span>
			</div>
			<div class="card-body">
				<div class="spread" style="margin-bottom: 8px;">
					<span class="small font-semibold">Current Balance:</span>
					<span class="mono cell-strong" style="font-size: 18px;">
						{data.membership?.pointsBalance ?? 0} <span class="small muted">points</span>
					</span>
				</div>

				<div class="progress-bar-wrap">
					<div class="progress-bar-fill" style="width: {tierProgress.progress}%;"></div>
				</div>
				<div class="spread small muted" style="margin-top: 6px;">
					<span>Tier Progress</span>
					<span class="font-semibold">{tierProgress.label}</span>
				</div>
			</div>
		</section>

		<!-- Prepaid Packages Card -->
		<section class="card">
			<div class="card-head">
				<h2>
					<PackageCheck size={17} />
					Active Prepaid Packages
				</h2>
				<button class="btn btn-ghost btn-sm" onclick={() => buyPackageOpen = true}>
					<Plus size={13} /> <span>Sell Package</span>
				</button>
			</div>
			<div class="card-body">
				{#if packagesList.length === 0}
					<div class="empty-state" style="padding: var(--sp-4);">
						<p class="small muted">No active packages on file.</p>
						<button class="btn btn-sm btn-subtle" onclick={() => buyPackageOpen = true}>
							<PackageCheck size={13} /> <span>Sell Prepaid Pack</span>
						</button>
					</div>
				{:else}
					<div class="stack-sm">
						{#each packagesList as pkg}
							<div class="pkg-row">
								<div>
									<div class="cell-strong">{pkg.packageName}</div>
									<div class="small muted">{pkg.creditsRemaining} of {pkg.creditsIssued} credits remaining</div>
								</div>
								<span class="badge badge-success">{pkg.creditsRemaining} left</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</section>
	</div>

	<!-- History Tabs: Visits, Retail Orders, Tanks, Points Ledger -->
	<div class="card mb">
		<div class="toolbar spread">
			<div class="segmented">
				<button class={activeTab === 'visits' ? 'active' : ''} onclick={() => activeTab = 'visits'}>
					<CalendarDays size={14} />
					<span>Service Visits &amp; Stays ({bookingsList.length})</span>
				</button>
				<button class={activeTab === 'orders' ? 'active' : ''} onclick={() => activeTab = 'orders'}>
					<ShoppingBag size={14} />
					<span>Retail Shop Orders ({retailOrders.length})</span>
				</button>
				<button class={activeTab === 'tanks' ? 'active' : ''} onclick={() => activeTab = 'tanks'}>
					<Fish size={14} />
					<span>Aquariums &amp; Tanks ({customerTanksList.length})</span>
				</button>
				<button class={activeTab === 'ledger' ? 'active' : ''} onclick={() => activeTab = 'ledger'}>
					<ReceiptText size={14} />
					<span>Points Ledger ({ledgersList.length})</span>
				</button>
			</div>
		</div>
	</div>

	<!-- TAB 1: VISITS & STAYS -->
	{#if activeTab === 'visits'}
		<section class="card">
			<div class="card-head">
				<h2>
					<History size={17} />
					Booking History ({bookingsList.length})
				</h2>
				<a href="/bookings/new?owner={cust.id}" class="btn btn-sm btn-primary">
					<Plus size={13} /> <span>New Booking</span>
				</a>
			</div>

			<div class="table-wrap">
				{#if bookingsList.length === 0}
					<div class="empty-state" style="padding: var(--sp-6);">
						<div class="empty-icon"><CalendarDays /></div>
						<h3>No booking history</h3>
						<p>No appointments or hotel stays recorded for this client yet.</p>
						<a href="/bookings/new?owner={cust.id}" class="btn btn-primary btn-sm">
							<Plus size={13} /> <span>Create First Booking</span>
						</a>
					</div>
				{:else}
					<table>
						<thead>
							<tr>
								<th>Date &amp; Time</th>
								<th>Type</th>
								<th>Pet</th>
								<th>Service / Suite</th>
								<th class="num">Amount</th>
								<th>Status</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{#each bookingsList as b}
								<tr class="row-click" onclick={() => window.location.href = `/bookings/${b.id}`}>
									<td class="small mono">
										<div class="cell-strong">{fmtWhen(b.startsAt)}</div>
									</td>
									<td>
										<span class="badge kind-{b.kind}">{b.kind}</span>
									</td>
									<td>
										<span class="cell-strong">{b.petName ?? '—'}</span>
									</td>
									<td class="small muted">{b.serviceName ?? b.roomName ?? '—'}</td>
									<td class="num mono cell-strong">{money(b.priceCents)}</td>
									<td>
										<span class="badge status-{b.status}">{b.status.replace('_', ' ')}</span>
									</td>
									<td class="num">
										<a href="/bookings/{b.id}" class="btn btn-ghost btn-sm" onclick={(e) => e.stopPropagation()}>
											<ExternalLink size={13} />
											<span>Open</span>
										</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>
		</section>
	{/if}

	<!-- TAB 2: RETAIL ORDERS -->
	{#if activeTab === 'orders'}
		<section class="card">
			<div class="card-head">
				<h2>
					<ShoppingBag size={17} />
					Retail Shop Purchase History ({retailOrders.length})
				</h2>
				<a href="/pos" class="btn btn-sm btn-primary">
					<CreditCard size={13} /> <span>Open POS Cashier</span>
				</a>
			</div>

			<div class="table-wrap">
				{#if retailOrders.length === 0}
					<div class="empty-state" style="padding: var(--sp-6);">
						<div class="empty-icon"><ShoppingBag /></div>
						<h3>No retail purchases yet</h3>
						<p>Products purchased at the POS counter attached to this account will appear here.</p>
					</div>
				{:else}
					<table>
						<thead>
							<tr>
								<th>Order Number</th>
								<th>Date &amp; Time</th>
								<th>Purchased Items</th>
								<th>Payment</th>
								<th class="num">Total Amount</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{#each retailOrders as o}
								<tr>
									<td class="mono font-bold text-primary">#{o.orderNumber}</td>
									<td class="small muted mono">{fmtWhen(o.createdAt)}</td>
									<td>
										{#if o.items && o.items.length > 0}
											<div class="stack-sm">
												{#each o.items as it}
													<div class="small">
														<span class="cell-strong">{it.quantity}x</span> {it.productName}
														<span class="muted mono">({money(it.unitPriceCents)})</span>
													</div>
												{/each}
											</div>
										{:else}
											<span class="muted small">Retail items</span>
										{/if}
									</td>
									<td>
										<span class="badge badge-neutral uppercase font-bold">{o.paymentMethod}</span>
									</td>
									<td class="num mono cell-strong text-success">{money(o.totalCents)}</td>
									<td>
										<span class="badge badge-success">{o.paymentStatus}</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>
		</section>
	{/if}

	<!-- TAB 3: CUSTOMER TANKS -->
	{#if activeTab === 'tanks'}
		<section class="card">
			<div class="card-head">
				<h2>
					<Fish size={17} />
					Registered Customer Aquariums &amp; Tanks ({customerTanksList.length})
				</h2>
				<a href="/aquarium" class="btn btn-sm btn-primary">
					<Plus size={13} /> <span>Aquarium Hub</span>
				</a>
			</div>

			<div class="table-wrap">
				{#if customerTanksList.length === 0}
					<div class="empty-state" style="padding: var(--sp-6);">
						<div class="empty-icon"><Fish /></div>
						<h3>No aquariums registered</h3>
						<p>Customer tanks managed for water tests and maintenance will appear here.</p>
					</div>
				{:else}
					<div class="grid cols-2 pad gap-4">
						{#each customerTanksList as t}
							<div class="card pad" style="background: var(--surface-2);">
								<div class="spread mb-2">
									<div class="row gap-2">
										<span style="font-size: 20px;">🐠</span>
										<div class="cell-strong">{t.name}</div>
									</div>
									<span class="badge kind-aquarium">{t.ecosystem.toUpperCase()}</span>
								</div>
								<div class="small muted stack-sm">
									<div>Volume: <strong class="mono">{t.volumeLiters ?? '—'} Liters</strong></div>
									{#if t.dimensions}<div>Dimensions: {t.dimensions}</div>{/if}
									{#if t.filtrationType}<div>Filtration: {t.filtrationType}</div>{/if}
									{#if t.notes}<div class="tiny faint">{t.notes}</div>{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</section>
	{/if}

	<!-- TAB 4: POINTS LEDGER -->
	{#if activeTab === 'ledger'}
		<section class="card">
			<div class="card-head">
				<h2>
					<ReceiptText size={17} />
					Ledger &amp; Transaction Log ({ledgersList.length})
				</h2>
			</div>
			<div class="table-wrap">
				{#if ledgersList.length === 0}
					<div class="empty-state" style="padding: var(--sp-6);">
						<p class="small muted">No points or credit transactions recorded.</p>
					</div>
				{:else}
					<table>
						<thead>
							<tr>
								<th>Date</th>
								<th>Type</th>
								<th>Action</th>
								<th>Description</th>
								<th class="num">Amount</th>
								<th class="num">Balance After</th>
							</tr>
						</thead>
						<tbody>
							{#each ledgersList as l}
								<tr>
									<td class="small muted mono">{fmtWhen(l.createdAt)}</td>
									<td><span class="badge badge-neutral">{l.type}</span></td>
									<td class="cell-strong">{l.kind}</td>
									<td class="small">{l.description ?? '—'}</td>
									<td class="num mono cell-strong {l.amount >= 0 ? 'text-success' : 'text-danger'}">
										{l.amount >= 0 ? `+${l.amount}` : l.amount}
									</td>
									<td class="num mono small muted">{l.balanceAfter}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>
		</section>
	{/if}
{/if}

<!-- MODAL: EDIT CUSTOMER PROFILE -->
<Modal bind:open={editCustomerOpen} title="Edit Client Profile" subtitle="Update owner contact information and address" maxWidth="600px">
	{#if cust}
		<form method="POST" action="?/editCustomer" class="stack gap-4">
			{#if editCustomerError}
				<div class="alert alert-error"><AlertCircle size={14} /> <span>{editCustomerError}</span></div>
			{/if}

			<div class="grid cols-2">
				<div class="field">
					<label for="edit-fn">First Name <span class="req">*</span></label>
					<input id="edit-fn" name="firstName" value={cust.firstName} required />
				</div>
				<div class="field">
					<label for="edit-ln">Last Name <span class="req">*</span></label>
					<input id="edit-ln" name="lastName" value={cust.lastName} required />
				</div>
			</div>

			<div class="grid cols-2">
				<div class="field">
					<label for="edit-phone">Phone Number <span class="req">*</span></label>
					<input id="edit-phone" name="phone" value={cust.phone} required />
				</div>
				<div class="field">
					<label for="edit-email">Email Address</label>
					<input id="edit-email" name="email" type="email" value={cust.email ?? ''} />
				</div>
			</div>

			<div class="field">
				<label for="edit-address">Street Address</label>
				<textarea id="edit-address" name="address" rows="2" value={cust.address ?? ''}></textarea>
			</div>

			<div class="row spread" style="margin-top: var(--sp-2);">
				<button class="btn btn-ghost" type="button" onclick={() => editCustomerOpen = false}>
					<X size={14} /> <span>Cancel</span>
				</button>
				<button class="btn btn-primary" type="submit">
					<Save size={15} /> <span>Save Profile Changes</span>
				</button>
			</div>
		</form>
	{/if}
</Modal>

<!-- MODAL: ADD PET -->
<Modal bind:open={addPetOpen} title="Register New Pet for {cust?.firstName}" subtitle="Add medical, temperament, and species dossier" maxWidth="640px">
	<form method="POST" action="?/addPet" class="stack gap-4">
		{#if addPetError}
			<div class="alert alert-error"><AlertCircle size={14} /> <span>{addPetError}</span></div>
		{/if}

		<div class="grid cols-3">
			<div class="field">
				<label for="petName">Pet Name <span class="req">*</span></label>
				<input id="petName" name="name" required placeholder="e.g. Bailey" />
			</div>
			<div class="field">
				<label for="species">Species <span class="req">*</span></label>
				<select id="species" name="species">
					<option value="dog">Dog</option>
					<option value="cat">Cat</option>
					<option value="bird">Bird</option>
					<option value="fish">Fish</option>
					<option value="reptile">Reptile</option>
					<option value="other">Other</option>
				</select>
			</div>
			<div class="field">
				<label for="breed">Breed</label>
				<input id="breed" name="breed" placeholder="e.g. Golden Retriever" />
			</div>
		</div>

		<div class="grid cols-3">
			<div class="field">
				<label for="weightKg">Weight (kg)</label>
				<input id="weightKg" name="weightKg" type="number" step="0.1" placeholder="e.g. 14.5" />
			</div>
			<div class="field">
				<DatePicker
					id="birthDate"
					name="birthDate"
					label="Date of Birth"
					placeholder="Select birth date..."
				/>
			</div>
			<div class="field">
				<DatePicker
					id="vaccinationDueDate"
					name="vaccinationDueDate"
					label="Vaccination Due / Expiry"
					placeholder="Select vaccine due date..."
				/>
			</div>
		</div>

		<div class="grid cols-2">
			<div class="field">
				<label for="allergies">Allergies / Dietary</label>
				<input id="allergies" name="allergies" placeholder="e.g. Chicken protein allergy, sensitive skin" />
			</div>
			<div class="field">
				<label for="behaviorNotes">Behavior &amp; Temperament</label>
				<input id="behaviorNotes" name="behaviorNotes" placeholder="e.g. Calm, anxious during blow dry" />
			</div>
		</div>

		<div class="row spread" style="margin-top: var(--sp-2);">
			<button class="btn btn-ghost" type="button" onclick={() => addPetOpen = false}>
				<X size={14} /> <span>Cancel</span>
			</button>
			<button class="btn btn-primary" type="submit">
				<Plus size={14} /> <span>Save Pet Record</span>
			</button>
		</div>
	</form>
</Modal>

<!-- MODAL: EDIT PET -->
{#if editingPet}
	<Modal bind:open={editPetOpen} title="Edit Pet · {editingPet.name}" subtitle="Update health notes, weight, and vaccination due date" maxWidth="640px">
		<form method="POST" action="?/editPet" class="stack gap-4">
			<input type="hidden" name="petId" value={editingPet.id} />
			{#if editPetError}
				<div class="alert alert-error"><AlertCircle size={14} /> <span>{editPetError}</span></div>
			{/if}

			<div class="grid cols-3">
				<div class="field">
					<label for="edit-pet-name">Pet Name <span class="req">*</span></label>
					<input id="edit-pet-name" name="name" value={editingPet.name} required />
				</div>
				<div class="field">
					<label for="edit-pet-species">Species</label>
					<select id="edit-pet-species" name="species">
						<option value="dog" selected={editingPet.species === 'dog'}>Dog</option>
						<option value="cat" selected={editingPet.species === 'cat'}>Cat</option>
						<option value="bird" selected={editingPet.species === 'bird'}>Bird</option>
						<option value="fish" selected={editingPet.species === 'fish'}>Fish</option>
						<option value="reptile" selected={editingPet.species === 'reptile'}>Reptile</option>
						<option value="other" selected={editingPet.species === 'other'}>Other</option>
					</select>
				</div>
				<div class="field">
					<label for="edit-pet-breed">Breed</label>
					<input id="edit-pet-breed" name="breed" value={editingPet.breed ?? ''} />
				</div>
			</div>

			<div class="grid cols-3">
				<div class="field">
					<label for="edit-pet-weight">Weight (kg)</label>
					<input id="edit-pet-weight" name="weightKg" type="number" step="0.1" value={editingPet.weightKg ?? ''} />
				</div>
				<div class="field">
					<DatePicker
						id="edit-birthDate"
						name="birthDate"
						label="Date of Birth"
						bind:value={editingPet.birthDate}
						placeholder="Select birth date..."
					/>
				</div>
				<div class="field">
					<DatePicker
						id="edit-vaccinationDueDate"
						name="vaccinationDueDate"
						label="Vaccine Due Date"
						bind:value={editingPet.vaccinationDueDate}
						placeholder="Select vaccine due date..."
					/>
				</div>
			</div>

			<div class="grid cols-2">
				<div class="field">
					<label for="edit-allergies">Allergies / Medical</label>
					<input id="edit-allergies" name="allergies" value={editingPet.allergies ?? ''} />
				</div>
				<div class="field">
					<label for="edit-behavior">Behavior &amp; Temperament</label>
					<input id="edit-behavior" name="behaviorNotes" value={editingPet.behaviorNotes ?? ''} />
				</div>
			</div>

			<div class="row spread" style="margin-top: var(--sp-2);">
				<button class="btn btn-ghost" type="button" onclick={() => editPetOpen = false}>
					<X size={14} /> <span>Cancel</span>
				</button>
				<button class="btn btn-primary" type="submit">
					<Save size={15} /> <span>Save Pet Updates</span>
				</button>
			</div>
		</form>
	</Modal>
{/if}

<!-- MODAL: SELL PACKAGE -->
<Modal bind:open={buyPackageOpen} title="Sell Prepaid Package to {cust?.firstName}" subtitle="Issue service credits to customer account" maxWidth="520px">
	<form method="POST" action="?/buyPackage" class="stack gap-4">
		{#if packageError}
			<div class="alert alert-error"><AlertCircle size={14} /> <span>{packageError}</span></div>
		{/if}

		<div class="field">
			<label for="pkgSelect">Select Package from Catalog <span class="req">*</span></label>
			<select id="pkgSelect" name="packageId" required>
				{#each data.catalog as pkg}
					<option value={pkg.id}>{pkg.name} — {pkg.credits} credits ({money(pkg.priceCents)})</option>
				{/each}
			</select>
		</div>

		<div class="row spread" style="margin-top: var(--sp-2);">
			<button class="btn btn-ghost" type="button" onclick={() => buyPackageOpen = false}>
				<X size={14} /> <span>Cancel</span>
			</button>
			<button class="btn btn-primary" type="submit">
				<PackageCheck size={14} /> <span>Confirm Purchase &amp; Issue Credits</span>
			</button>
		</div>
	</form>
</Modal>

<style>
	.profile-hero-card {
		background: var(--surface);
	}

	.pet-dossier-grid {
		gap: var(--sp-4);
	}

	.pet-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-lg);
		overflow: hidden;
		box-shadow: var(--shadow-xs);
		transition: all 140ms ease;
	}

	.pet-card:hover {
		box-shadow: var(--shadow-sm);
		border-color: var(--border-strong);
	}

	.pet-card-head {
		padding: 12px 14px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid var(--border);
		background: var(--surface-2);
	}

	.pet-emoji-avatar {
		font-size: 24px;
		line-height: 1;
	}

	.pet-card-name {
		font-size: 14.5px;
		font-weight: 700;
		color: var(--ink);
	}

	.pet-card-sub {
		font-size: 12px;
		color: var(--muted);
	}

	.pet-card-body {
		padding: 12px 14px;
	}

	.pet-meta-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px 12px;
	}

	.pet-meta-label {
		font-size: 10.5px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-weight: 700;
		color: var(--muted);
		display: block;
	}

	.pet-meta-val {
		font-size: 12.5px;
		font-weight: 600;
		color: var(--ink);
		margin-top: 1px;
	}

	.text-danger { color: var(--danger); }

	.pet-card-foot {
		padding: 8px 14px;
		border-top: 1px solid var(--border);
		background: var(--surface-2);
		display: flex;
		justify-content: flex-end;
		gap: 6px;
	}

	.progress-bar-wrap {
		width: 100%;
		height: 8px;
		border-radius: var(--r-full);
		background: var(--surface-3);
		overflow: hidden;
	}

	.progress-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #4f46e5, #818cf8);
		border-radius: var(--r-full);
		transition: width 240ms ease;
	}

	.pkg-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 10px;
		border-radius: var(--r-md);
		background: var(--surface-2);
		border: 1px solid var(--border);
	}
</style>
