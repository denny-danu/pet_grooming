<script lang="ts">
	import { Users, Search, Plus, UserPlus, ChevronRight } from "@lucide/svelte";
	let { data } = $props();
	const fmt = (d: Date | string | null) => (d ? new Date(d).toLocaleDateString() : '—');
	const initials = (f: string, l: string) => (f[0] || '') + (l[0] || '');
</script>

<svelte:head><title>Customers · PetCo</title></svelte:head>

<div class="page-header">
	<div class="title-block">
		<div class="kicker"><Users size={13} /> Directory</div>
		<h1>Customers</h1>
		<p>Owners and their pets, history, and memberships.</p>
	</div>
	<div class="actions">
		<a href="/customers/new"><button class="btn btn-primary"><UserPlus size={15} /> New customer</button></a>
	</div>
</div>

<div class="card mb">
	<form method="get" action="/customers" class="toolbar" role="search">
		<div class="search">
			<Search size={15} class="search-icon" />
			<input name="q" value={data.q} placeholder="Search name, phone, email…" aria-label="Search customers" />
			{#if data.q}
				<a href="/customers" class="clear" aria-label="Clear search">×</a>
			{/if}
		</div>
		<button class="btn" type="submit">Search</button>
		{#if data.q}
			<span class="small faint" style="margin-left: 4px">{data.customers.length} result(s) for “{data.q}”</span>
		{/if}
	</form>
</div>

<div class="card">
	<div class="table-wrap">
		{#if data.customers.length === 0}
			<div class="empty-state">
				<div class="empty-icon"><Users /></div>
				{#if data.q}
					<h3>No customers match “{data.q}”</h3>
					<p>Try a different name, phone, or email — or add a new customer.</p>
				{:else}
					<h3>No customers yet</h3>
					<p>Add your first owner to start tracking pets and bookings.</p>
				{/if}
				<a href="/customers/new"><button class="btn btn-primary"><Plus size={15} /> Add customer</button></a>
			</div>
		{:else}
		<table>
			<thead><tr><th>Customer</th><th>Pets</th><th>Phone</th><th>Tier</th><th>Last visit</th><th></th></tr></thead>
			<tbody>
			{#each data.customers as c}
				<tr class="row-click">
					<td>
						<div class="person">
							<span class="avatar lg">{initials(c.firstName, c.lastName)}</span>
							<div>
								<div class="cell-strong"><a class="cell-link" href="/customers/{c.id}">{c.firstName} {c.lastName}</a></div>
								{#if c.email}<div class="cell-sub">{c.email}</div>{/if}
							</div>
						</div>
					</td>
					<td>
						<span class="badge badge-neutral">{c.petCount}</span>
					</td>
					<td class="mono small">{c.phone}</td>
					<td>
						<span class="badge {c.tier === 'gold' ? 'badge-warning' : c.tier === 'platinum' ? 'badge-purple' : 'badge-neutral'}">{c.tier ?? '—'}</span>
					</td>
					<td class="small muted">{fmt(c.lastBooking)}</td>
					<td class="num"><a class="btn btn-ghost btn-sm" href="/customers/{c.id}" aria-label="Open {c.firstName} {c.lastName}"><ChevronRight size={15} /></a></td>
				</tr>
			{/each}
			</tbody>
		</table>
		{/if}
	</div>
</div>

<style>
	.search { position: relative; flex: 0 1 360px; }
	.search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--faint); }
	.search input { padding-left: 34px; padding-right: 30px; }
	.clear { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); color: var(--faint); font-size: 18px; line-height: 1; }
	.clear:hover { color: var(--ink); }
	.person { display: flex; align-items: center; gap: 10px; }
</style>
