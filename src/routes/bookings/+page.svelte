<script lang="ts">
	import { page } from "$app/state";
	import { CalendarDays, ChevronLeft, ChevronRight, Plus, Scissors, Hotel, Fish } from "@lucide/svelte";
	let { data } = $props();
	const money = (c: number) => `$${(c / 100).toFixed(2)}`;
	const fmtDay = (d: Date) => d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
	const fmtDayFull = (d: Date) => d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
	const fmtTime = (d: Date) => new Date(d).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
	const isToday = (d: Date) => new Date(d).toDateString() === new Date().toDateString();
	const kindIcon = (k: string) => k === 'grooming' ? Scissors : k === 'hotel' ? Hotel : Fish;
	const fmt = (s: string) => s.replace('_', ' ');
	const dayKey = (d: Date) => new Date(d).toISOString().slice(0, 10);
	const shift = (days: number) => {
		const base = new Date(data.days[0].date);
		base.setDate(base.getDate() + days);
		return `/bookings?day=${dayKey(base)}`;
	};
	const firstDay = $derived(data.days[0]);
	const lastDay = $derived(data.days[data.days.length - 1]);
	const weekLabel = $derived(`${fmtDayFull(firstDay.date)} – ${fmtDayFull(lastDay.date)}`);
	const weekTotal = $derived(data.days.reduce((s, d) => s + d.items.reduce((x, b) => x + b.priceCents, 0), 0));
</script>

<svelte:head><title>Bookings · PetCo</title></svelte:head>

<div class="page-header">
	<div class="title-block">
		<div class="kicker"><CalendarDays size={13} /> Schedule</div>
		<h1>Bookings</h1>
		<p>{weekLabel}</p>
	</div>
	<div class="actions">
		<div class="segmented" role="group" aria-label="Week navigation">
			<a href={shift(-7)} aria-label="Previous week"><ChevronLeft size={15} /></a>
			<a href="/bookings" class={isToday(firstDay.date) ? 'active' : ''}>Today</a>
			<a href={shift(7)} aria-label="Next week"><ChevronRight size={15} /></a>
		</div>
		<a href="/bookings/new"><button class="btn btn-primary"><Plus size={15} /> New booking</button></a>
	</div>
</div>

{#each data.days as day}
	{#if day.items.length > 0}
	<section class="card mb">
		<div class="day-head">
			<div>
				<div class="day-title">
					{fmtDay(day.date)}
					{#if isToday(day.date)}<span class="badge status-checked_in">today</span>{/if}
				</div>
				{#if day.items.length > 0}<div class="day-sub">{day.items.length} appointment(s)</div>{/if}
			</div>
			<div class="day-total">{money(day.items.reduce((s, b) => s + b.priceCents, 0))} <span class="tiny muted">booked</span></div>
		</div>
		<div class="table-wrap">
			<table>
				<thead><tr><th>Time</th><th>Type</th><th>Customer</th><th>Pet</th><th>Resource</th><th class="num">Amount</th><th>Status</th><th></th></tr></thead>
				<tbody>
				{#each day.items as b}
					<tr class="row-click">
						<td class="mono small"><span class="cell-strong">{fmtTime(b.startsAt)}</span>–{fmtTime(b.endsAt)}</td>
						<td><span class="badge kind-{b.kind}"><svelte:component this={kindIcon(b.kind)} size={12} /> {b.kind}</span></td>
						<td><a class="cell-link" href="/customers/{b.ownerId}">{b.ownerName} {b.ownerLast}</a></td>
						<td>{b.petName ?? '—'}</td>
						<td class="small muted">{b.serviceName ?? b.roomName ?? ''}{b.staffName ? ` · ${b.staffName}` : ''}</td>
						<td class="num mono">{money(b.priceCents)}</td>
						<td><span class="badge status-{b.status}">{fmt(b.status)}</span></td>
						<td class="num"><a href="/bookings/{b.id}" class="btn btn-ghost btn-sm">Open</a></td>
					</tr>
				{/each}
				</tbody>
			</table>
		</div>
	</section>
	{/if}
{/each}

{#if data.days.every((d) => d.items.length === 0)}
	<section class="card">
		<div class="empty-state" style="padding: var(--sp-10)">
			<div class="empty-icon"><CalendarDays /></div>
			<h3>No bookings this week</h3>
			<p>Nothing on the schedule between {fmtDay(data.days[0].date)} and {fmtDay(data.days[6].date)}.</p>
			<a href="/bookings/new"><button class="btn btn-primary"><Plus size={15} /> New booking</button></a>
		</div>
	</section>
{/if}

<div class="tiny muted" style="margin-top: var(--sp-2)">Total booked value this week: <span class="mono">${(weekTotal / 100).toFixed(2)}</span></div>

<style>
	.day-head { display: flex; justify-content: space-between; align-items: center; padding: var(--sp-4) var(--sp-5); border-bottom: 1px solid var(--border); }
	.day-title { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; }
	.day-sub { font-size: 12px; color: var(--faint); margin-top: 1px; }
	.day-total { font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }
</style>
