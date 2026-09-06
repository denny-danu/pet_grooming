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

	import { page } from "$app/state";
	import { makeT } from "$lib/i18n/t";
	import { getSpeciesEmoji } from "$lib/ui/species";

	let { data } = $props();
	const t = $derived(makeT(page.data.locale ?? "en"));

	let selectedTier = $state<string>('all');
	let selectedSpecies = $state<string>('all');

	const fmt = (d: Date | string | null) =>
		d ? new Date(d).toLocaleDateString(page.data.locale === "id" ? "id-ID" : "en-US", { month: "short", day: "numeric", year: "numeric" }) : t['cust.never']();

	const initials = (f: string, l: string) => ((f?.[0] || '') + (l?.[0] || '')).toUpperCase() || '?';

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
		<div class="kicker"><Users size={13} /> {t['cust.kicker']()}</div>
		<h1>{t['cust.title']()}</h1>
		<p class="subtitle">{t['cust.subtitle']()}</p>
	</div>
	<div class="actions">
		<a href="/customers/new" class="btn btn-primary">
			<UserPlus size={15} />
			<span>{t['cust.newCustomer']()}</span>
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
			<span class="stat-trend up">{data.totalOwners} {t['cust.total']()}</span>
		</div>
		<div class="stat-value">{data.totalOwners}</div>
		<div class="stat-label">{t['cust.registeredClients']()}</div>
	</div>

	<div class="stat-card">
		<div class="stat-top">
			<div class="stat-icon amber">
				<PawPrint size={18} />
			</div>
			<span class="stat-trend neutral">{t['cust.profiles']()}</span>
		</div>
		<div class="stat-value">{data.totalPets}</div>
		<div class="stat-label">{t['cust.registeredPets']()}</div>
	</div>

	<div class="stat-card">
		<div class="stat-top">
			<div class="stat-icon purple">
				<Award size={18} />
			</div>
			<span class="stat-trend up">{data.vipCount} {t['cust.vipActive']()}</span>
		</div>
		<div class="stat-value">{data.vipCount}</div>
		<div class="stat-label">{t['cust.vipMembers']()}</div>
	</div>

	<div class="stat-card">
		<div class="stat-top">
			<div class="stat-icon green">
				<Sparkles size={18} />
			</div>
			<span class="stat-trend neutral">{t['cust.avgRatio']()}</span>
		</div>
		<div class="stat-value">{data.totalOwners > 0 ? (data.totalPets / data.totalOwners).toFixed(1) : '1.0'}</div>
		<div class="stat-label">{t['cust.petsPerHousehold']()}</div>
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
					placeholder={t['cust.searchPlaceholder']()}
					aria-label={t['cust.search']()}
				/>
				{#if data.q}
					<a href="/customers" class="search-clear" aria-label={t['cust.clearSearch']()}>
						<X size={14} />
					</a>
				{/if}
			</div>
			<button class="btn" type="submit">
				<Search size={14} />
				<span>{t['cust.search']()}</span>
			</button>
		</form>

		<div class="row gap-2">
			<span class="small faint font-semibold">{t['cust.tierFilter']()}</span>
			<div class="segmented">
				<button class={selectedTier === 'all' ? 'active' : ''} onclick={() => selectedTier = 'all'}>
					<Sparkles size={13} />
					<span>{t['cust.all']()}</span>
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
					<h3>{t['cust.noMatchTitle']({q: data.q})}</h3>
					<p>{t['cust.noMatchBody']()}</p>
					<div class="row gap-2">
						<a href="/customers" class="btn">
							<RotateCcw size={14} />
							<span>{t['cust.clearSearch']()}</span>
						</a>
						<a href="/customers/new" class="btn btn-primary">
							<Plus size={14} />
							<span>{t['cust.addNewCustomer']()}</span>
						</a>
					</div>
				{:else}
					<h3>{t['cust.noResultsTitle']()}</h3>
					<p>{t['cust.noResultsBody']()}</p>
					<a href="/customers/new" class="btn btn-primary"><UserPlus size={15} /> {t['cust.addCustomer']()}</a>
				{/if}
			</div>
		{:else}
			<table>
				<thead>
					<tr>
						<th>{t['cust.col.customer']()}</th>
						<th>{t['cust.col.pets']()}</th>
						<th>{t['cust.col.phone']()}</th>
						<th>{t['cust.col.tier']()}</th>
						<th>{t['cust.col.lastVisit']()}</th>
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
										<span class="faint tiny">{t['cust.noPets']()}</span>
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
										<span class="tiny mono muted">({c.pointsBalance} {t['cust.pts']()})</span>
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
									aria-label={t['cust.openCustomer']({name: `${c.firstName} ${c.lastName}`})}
									onclick={(e) => e.stopPropagation()}
								>
									<span>{t['cust.view']()}</span>
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
