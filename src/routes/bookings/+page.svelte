<script lang="ts">
	let { data } = $props();
	const money = (c: number) => `$${(c / 100).toFixed(2)}`;
	const fmtDay = (d: Date) => d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
	const fmtTime = (d: Date) => new Date(d).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
	const isToday = (d: Date) => new Date(d).toDateString() === new Date().toDateString();
</script>

<svelte:head><title>Bookings · PetCo</title></svelte:head>

<div class="spread">
	<h1>Bookings</h1>
	<div class="row">
		<a href="/bookings?day={new Date(new Date(data.days[0].date).getTime() - 7*864e5).toISOString().slice(0,10)}"><button>‹ Prev wk</button></a>
		<a href="/bookings"><button>Today</button></a>
		<a href="/bookings?day={new Date(new Date(data.days[0].date).getTime() + 7*864e5).toISOString().slice(0,10)}"><button>Next wk ›</button></a>
		<a href="/bookings/new"><button class="primary">+ New booking</button></a>
	</div>
</div>

{#each data.days as day}
	<section class="card">
		<div class="spread">
			<h2 style="margin:0">{fmtDay(day.date)} {isToday(day.date) ? '· today' : ''}</h2>
			<span class="small muted">{day.items.length} booking(s)</span>
		</div>
		{#if day.items.length === 0}
			<div class="empty small">No bookings</div>
		{:else}
		<table>
			<thead><tr><th>Time</th><th>Type</th><th>Customer</th><th>Pet</th><th>Resource</th><th>Amount</th><th>Status</th></tr></thead>
			<tbody>
			{#each day.items as b}
				<tr>
					<td>{fmtTime(b.startsAt)}–{fmtTime(b.endsAt)}</td>
					<td><span class="badge {b.kind}">{b.kind}</span></td>
					<td><a href="/customers/{b.ownerId ?? ''}">{b.ownerName} {b.ownerLast}</a></td>
					<td>{b.petName ?? '—'}</td>
					<td class="small">{b.serviceName ?? b.roomName ?? ''}{b.staffName ? ` · ${b.staffName}` : ''}</td>
					<td>{money(b.priceCents)}</td>
					<td><span class="badge {b.status}">{b.status}</span></td>
					<td><a href="/bookings/{b.id}" class="small">open</a></td>
				</tr>
			{/each}
			</tbody>
		</table>
		{/if}
	</section>
{/each}
