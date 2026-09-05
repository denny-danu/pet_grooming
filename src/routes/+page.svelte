<script lang="ts">
	import { page } from "$app/state";
	let { data } = $props();
	const fmtDate = (d: Date | string) =>
		new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	const badge = (s: string) => `badge ${s}`;
</script>

<svelte:head><title>Dashboard · PetCo</title></svelte:head>

<div class="grid cols-4">
	<div class="card"><div class="stat">{data.ownerCount}</div><div class="stat-label">Customers</div></div>
	<div class="card"><div class="stat">{data.petCount}</div><div class="stat-label">Pets</div></div>
	<div class="card"><div class="stat">{data.todayBookings.length}</div><div class="stat-label">Bookings today</div></div>
	<div class="card"><div class="stat">{data.upcoming.length}</div><div class="stat-label">Upcoming</div></div>
</div>

<div class="grid cols-2">
	<section class="card">
		<div class="spread">
			<h2>Today</h2>
			<a href="/bookings" class="small">All bookings →</a>
		</div>
		{#if data.todayBookings.length === 0}
			<div class="empty">Nothing scheduled today</div>
		{:else}
		<table>
			<thead><tr><th>When</th><th>Kind</th><th>Status</th><th></th></tr></thead>
			<tbody>
			{#each data.todayBookings as b}
				<tr>
					<td>{fmtDate(b.startsAt)}</td>
					<td><span class="badge {b.kind}">{b.kind}</span></td>
					<td><span class="badge {b.status}">{b.status}</span></td>
					<td><a href="/bookings/{b.id}" class="small">view</a></td>
				</tr>
			{/each}
			</tbody>
		</table>
		{/if}
	</section>

	<section class="card">
		<h2>Quick actions</h2>
		<div class="row">
			<a href="/customers"><button>New customer</button></a>
			<a href="/bookings/new"><button class="primary">New booking</button></a>
			<a href="/check-in"><button>Check-in</button></a>
		</div>
	</section>
</div>
