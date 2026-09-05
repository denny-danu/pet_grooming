<script lang="ts">
	import { page } from "$app/state";
	let { data, form } = $props();
	const fmt = (d: Date | string | null) => (d ? new Date(d).toLocaleDateString() : '—');
</script>

<svelte:head><title>Customers · PetCo</title></svelte:head>

<div class="spread">
	<h1>Customers</h1>
	<a href="/customers/new"><button class="primary">+ New customer</button></a>
</div>

<form class="card" method="get" action="/customers">
	<div class="row">
		<input name="q" value={data.q} placeholder="Search name, phone, email…" style="max-width: 340px" />
		<button type="submit">Search</button>
	</div>
</form>

<div class="card">
	{#if data.customers.length === 0}
		<div class="empty">No customers found</div>
	{:else}
	<table>
		<thead><tr><th>Name</th><th>Pets</th><th>Phone</th><th>Tier</th><th>Last visit</th></tr></thead>
		<tbody>
		{#each data.customers as c}
			<tr>
				<td><a href="/customers/{c.id}"><strong>{c.firstName} {c.lastName}</strong></a></td>
				<td>{c.petCount}</td>
				<td>{c.phone}</td>
				<td><span class="badge">{c.tier ?? '—'}</span></td>
				<td class="small muted">{fmt(c.lastBooking)}</td>
			</tr>
		{/each}
		</tbody>
	</table>
	{/if}
</div>
