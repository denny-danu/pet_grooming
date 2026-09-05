<script lang="ts">
	import {
		Users,
		PawPrint,
		CalendarDays,
		LogIn,
		Wallet,
		TrendingUp,
		Plus,
		ArrowRight
	} from "@lucide/svelte";
	let { data } = $props();
	const money = (c: number) => `$${(c / 100).toFixed(2)}`;
	const fmtWhen = (d: Date | string) =>
		new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	const dateKey = (d: Date | string) => new Date(d).toDateString();
	const isToday = (d: Date | string) => dateKey(d) === new Date().toDateString();
	const todayGroup = $derived(data.todayBookings.filter((b) => isToday(b.startsAt)));
</script>

<svelte:head><title>Dashboard · PetCo</title></svelte:head>

<div class="page-header">
	<div class="title-block">
		<h1>Good day{data.user?.name ? `, ${data.user.name.split(' ')[0]}` : ''}</h1>
		<p>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
	</div>
	<div class="actions">
		<a href="/customers/new"><button class="btn"><Plus size={15} /> New customer</button></a>
		<a href="/bookings/new"><button class="btn btn-primary"><Plus size={15} /> New booking</button></a>
	</div>
</div>

<div class="stat-grid">
	<div class="stat-card">
		<div class="stat-top"><span class="stat-icon violet"><Users size={17} /></span></div>
		<div class="stat-value">{data.ownerCount}</div>
		<div class="stat-label">Customers</div>
	</div>
	<div class="stat-card">
		<div class="stat-top"><span class="stat-icon green"><PawPrint size={17} /></span></div>
		<div class="stat-value">{data.petCount}</div>
		<div class="stat-label">Pets on file</div>
	</div>
	<div class="stat-card">
		<div class="stat-top"><span class="stat-icon amber"><CalendarDays size={17} /></span></div>
		<div class="stat-value">{todayGroup.length}</div>
		<div class="stat-label">Bookings today · {data.checkinsDue} due in</div>
	</div>
	<div class="stat-card">
		<div class="stat-top"><span class="stat-icon"><Wallet size={17} /></span></div>
		<div class="stat-value">{money(data.todayRevenueCents)}</div>
		<div class="stat-label">Booked revenue today</div>
	</div>
</div>

<div class="grid cols-2 stack-gap" style="margin-top: var(--sp-4)">
	<section class="card">
		<div class="card-head">
			<h2>Today's schedule</h2>
			<a href="/bookings" class="btn btn-ghost btn-sm">All bookings <ArrowRight size={14} /></a>
		</div>
		<div class="table-wrap">
			{#if todayGroup.length === 0}
				<div class="empty-state">
					<div class="empty-icon"><CalendarDays /></div>
					<h3>No appointments today</h3>
					<p>Bookings for today will show up here with check-in status.</p>
					<a href="/bookings/new"><button class="btn btn-primary">New booking</button></a>
				</div>
			{:else}
			<table>
				<thead><tr><th>Time</th><th>Type</th><th>Status</th><th></th></tr></thead>
				<tbody>
				{#each todayGroup as b}
					<tr>
						<td class="cell-strong">{fmtWhen(b.startsAt)}</td>
						<td><span class="badge kind-{b.kind}">{b.kind}</span></td>
						<td><span class="badge status-{b.status}">{b.status.replace('_', ' ')}</span></td>
						<td class="num"><a href="/bookings/{b.id}" class="btn btn-ghost btn-sm">Open</a></td>
					</tr>
				{/each}
				</tbody>
			</table>
			{/if}
		</div>
	</section>

	<section class="card">
		<div class="card-head">
			<h2>Upcoming</h2>
			<span class="badge badge-info">{data.upcoming.length} ahead</span>
		</div>
		<div class="table-wrap">
			{#if data.upcoming.length === 0}
				<div class="empty-state">
					<div class="empty-icon"><CalendarDays /></div>
					<h3>Nothing on the horizon</h3>
					<p>Future bookings and stays will appear here.</p>
				</div>
			{:else}
			<table>
				<thead><tr><th>When</th><th>Type</th><th>Amount</th><th></th></tr></thead>
				<tbody>
				{#each data.upcoming as b}
					<tr>
						<td class="cell-strong">{fmtWhen(b.startsAt)}</td>
						<td><span class="badge kind-{b.kind}">{b.kind}</span></td>
						<td>{money(b.priceCents)}</td>
						<td class="num"><a href="/bookings/{b.id}" class="btn btn-ghost btn-sm">Open</a></td>
					</tr>
				{/each}
				</tbody>
			</table>
			{/if}
		</div>
	</section>
</div>

<style>
	.stack-gap { gap: var(--sp-5); align-items: start; }
	:global(.stat-card) { margin-bottom: 0; }
</style>
