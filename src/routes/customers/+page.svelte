<script lang="ts">
	import {
		Users,
		Search,
		Plus,
		UserPlus,
		ChevronRight,
		PawPrint,
		Sparkles,
		Phone,
		Mail,
		Award,
		CalendarDays,
		X,
		Star,
		RotateCcw
	} from "@lucide/svelte";

	let { data } = $props();

	let selectedTier = $state<string>('all');
	let selectedSpecies = $state<string>('all');

	const fmt = (d: Date | string | null) =>
		d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never';

	const initials = (f: string, l: string) => ((f?.[0] || '') + (l?.[0] || '')).toUpperCase() || '?';

	function getSpeciesEmoji(species: string | null | undefined) {
		if (species === 'cat') return '🐱';
		if (species === 'bird') return '🦜';
		if (species === 'fish') return '🐠';
		if (species === 'reptile') return '🦎';
		return '🐶';
	}

	const filteredCustomers = $derived(
		data.customers.filter((c) => {
			const matchTier = selectedTier === 'all' || (c.tier ?? 'silver') === selectedTier;
			const matchSpecies =
				selectedSpecies === 'all' ||
				(c.pets && c.pets.some((p) => p.species === selectedSpecies));
			return matchTier && matchSpecies;
		})
	);
</script>

<svelte:head>
	<title>Customers &amp; Pets · PetCo</title>
</svelte:head>

<div class="page-header">
	<div class="title-block">
		<div class="kicker"><Users size={13} /> Directory</div>
		<h1>Customers &amp; Pet Dossiers</h1>
		<p class="subtitle">Complete client directory, registered pets, and loyalty memberships.</p>
	</div>
	<div class="actions">
		<a href="/customers/new" class="btn btn-primary">
			<UserPlus size={15} />
			<span>New Customer</span>
		</a>
	</div>
</div>

<!-- Metrics Strip -->
<div class="stat-grid" style="margin-bottom: var(--sp-6);">
	<div class="stat-card">
		<div class="stat-top">
			<div class="stat-icon blue">
				<Users size={18} />
			</div>
			<span class="stat-trend up">{data.totalOwners} total</span>
		</div>
		<div class="stat-value">{data.totalOwners}</div>
		<div class="stat-label">Registered Clients</div>
	</div>

	<div class="stat-card">
		<div class="stat-top">
			<div class="stat-icon amber">
				<PawPrint size={18} />
			</div>
			<span class="stat-trend neutral">Profiles</span>
		</div>
		<div class="stat-value">{data.totalPets}</div>
		<div class="stat-label">Registered Pets</div>
	</div>

	<div class="stat-card">
		<div class="stat-top">
			<div class="stat-icon purple">
				<Award size={18} />
			</div>
			<span class="stat-trend up">{data.vipCount} active</span>
		</div>
		<div class="stat-value">{data.vipCount}</div>
		<div class="stat-label">VIP Loyalty Members</div>
	</div>

	<div class="stat-card">
		<div class="stat-top">
			<div class="stat-icon green">
				<Sparkles size={18} />
			</div>
			<span class="stat-trend neutral">Avg ratio</span>
		</div>
		<div class="stat-value">{data.totalOwners > 0 ? (data.totalPets / data.totalOwners).toFixed(1) : '1.0'}</div>
		<div class="stat-label">Pets per Household</div>
	</div>
</div>

<!-- Search & Filter Controls -->
<div class="card mb">
	<div class="toolbar spread">
		<form method="get" action="/customers" class="search-form" role="search">
			<div class="search-wrap">
				<Search size={15} class="search-icon" />
				<input
					name="q"
					value={data.q}
					placeholder="Search by owner name, phone, or email..."
					aria-label="Search customers"
				/>
				{#if data.q}
					<a href="/customers" class="search-clear" aria-label="Clear search">
						<X size={14} />
					</a>
				{/if}
			</div>
			<button class="btn" type="submit">
				<Search size={14} />
				<span>Search</span>
			</button>
		</form>

		<div class="row gap-2">
			<span class="small faint font-semibold">Tier:</span>
			<div class="segmented">
				<button class={selectedTier === 'all' ? 'active' : ''} onclick={() => selectedTier = 'all'}>
					<Sparkles size={13} />
					<span>All</span>
				</button>
				<button class={selectedTier === 'silver' ? 'active' : ''} onclick={() => selectedTier = 'silver'}>
					<Award size={13} />
					<span>Silver</span>
				</button>
				<button class={selectedTier === 'gold' ? 'active' : ''} onclick={() => selectedTier = 'gold'}>
					<Star size={13} />
					<span>Gold</span>
				</button>
				<button class={selectedTier === 'platinum' ? 'active' : ''} onclick={() => selectedTier = 'platinum'}>
					<Award size={13} />
					<span>Platinum</span>
				</button>
			</div>
		</div>
	</div>
</div>

<!-- Customers Table -->
<div class="card">
	<div class="table-wrap">
		{#if filteredCustomers.length === 0}
			<div class="empty-state">
				<div class="empty-icon"><Users /></div>
				{#if data.q}
					<h3>No customers match “{data.q}”</h3>
					<p>Try searching for a different name, phone number, or email address.</p>
					<div class="row gap-2">
						<a href="/customers" class="btn">
							<RotateCcw size={14} />
							<span>Clear search</span>
						</a>
						<a href="/customers/new" class="btn btn-primary">
							<Plus size={14} />
							<span>Add new customer</span>
						</a>
					</div>
				{:else}
					<h3>No customer records found</h3>
					<p>Get started by adding your first pet owner and their pets.</p>
					<a href="/customers/new" class="btn btn-primary"><UserPlus size={15} /> Add customer</a>
				{/if}
			</div>
		{:else}
			<table>
				<thead>
					<tr>
						<th>Customer / Client</th>
						<th>Registered Pets</th>
						<th>Phone Number</th>
						<th>Membership Tier</th>
						<th>Last Visit</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each filteredCustomers as c}
						<tr class="row-click" onclick={() => window.location.href = `/customers/${c.id}`}>
							<td>
								<div class="person-cell">
									<span class="avatar lg">{initials(c.firstName, c.lastName)}</span>
									<div>
										<div class="cell-strong">
											<a class="cell-link" href="/customers/{c.id}" onclick={(e) => e.stopPropagation()}>
												{c.firstName} {c.lastName}
											</a>
										</div>
										{#if c.email}
											<div class="cell-sub">{c.email}</div>
										{/if}
									</div>
								</div>
							</td>
							<td>
								<div class="row gap-1">
									{#if c.pets && c.pets.length > 0}
										{#each c.pets as p}
											<span class="pet-chip" title="{p.name} ({p.breed ?? p.species})">
												<span>{getSpeciesEmoji(p.species)}</span>
												<span>{p.name}</span>
											</span>
										{/each}
									{:else}
										<span class="faint tiny">No pets registered</span>
									{/if}
								</div>
							</td>
							<td class="mono small">
								<div class="row gap-1">
									<Phone size={12} class="muted" />
									<span>{c.phone}</span>
								</div>
							</td>
							<td>
								<div class="row gap-1">
									<span class="badge tier-{c.tier ?? 'silver'}">
										{c.tier ? c.tier.toUpperCase() : 'SILVER'}
									</span>
									{#if c.pointsBalance !== undefined && c.pointsBalance !== null}
										<span class="tiny mono muted">({c.pointsBalance} pts)</span>
									{/if}
								</div>
							</td>
							<td class="small muted mono">
								<div class="row gap-1">
									<CalendarDays size={12} class="muted" />
									<span>{fmt(c.lastBooking)}</span>
								</div>
							</td>
							<td class="num">
								<a
									class="btn btn-ghost btn-sm"
									href="/customers/{c.id}"
									aria-label="Open {c.firstName} {c.lastName}"
									onclick={(e) => e.stopPropagation()}
								>
									<span>View</span>
									<ChevronRight size={14} />
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>

<style>
	.search-form {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		flex: 0 1 420px;
	}


	.person-cell {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.pet-chip {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 2px 7px;
		border-radius: var(--r-full);
		background: var(--surface-2);
		border: 1px solid var(--border);
		font-size: 11.5px;
		font-weight: 600;
		color: var(--ink-2);
	}
</style>
