<script lang="ts">
	import { page } from "$app/state";
	import { LogIn, Scissors, Hotel, Fish, UserCheck, Clock, Check } from "@lucide/svelte";
	let { data } = $props();
	const fmtTime = (d: Date) => new Date(d).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
	const actionError = $derived(page.form?.actionError);
	const kindIcon = (k: string) => k === 'grooming' ? Scissors : k === 'hotel' ? Hotel : Fish;
	const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
	const pending = $derived(data.rows.filter((r) => r.status === 'pending' || r.status === 'confirmed'));
	const done = $derived(data.rows.length - pending.length);
</script>

<svelte:head><title>Check-in · PetCo</title></svelte:head>

<div class="page-header">
	<div class="title-block">
		<div class="kicker"><LogIn size={13} /> Front desk</div>
		<h1>Today's arrivals</h1>
		<p>{todayLabel}</p>
	</div>
	<div class="segmented">
		<span class="badge status-pending">{pending.length} to check in</span>
		{#if done > 0}<span class="badge status-valid">{done} checked in</span>{/if}
	</div>
</div>

{#if actionError}<div class="alert alert-error">{actionError}</div>{/if}

<section class="card">
	<div class="table-wrap">
		{#if data.rows.length === 0}
			<div class="empty-state" style="padding: var(--sp-10)">
				<div class="empty-icon"><Clock /></div>
				<h3>Nothing scheduled today</h3>
				<p>Bookings with a check-in due will surface here automatically.</p>
				<a href="/bookings/new"><button class="btn btn-primary">New booking</button></a>
			</div>
		{:else}
		<table>
			<thead><tr><th>Time</th><th>Type</th><th>Customer</th><th>Pet</th><th>Room</th><th>Status</th><th></th></tr></thead>
			<tbody>
			{#each data.rows as r}
				<tr>
					<td class="mono small cell-strong">{fmtTime(r.startsAt)}</td>
					<td><span class="badge kind-{r.kind}"><svelte:component this={kindIcon(r.kind)} size={12} /> {r.kind}</span></td>
					<td><a class="cell-link" href="/customers/{r.ownerId ?? ''}">{r.ownerName} {r.ownerLast}</a></td>
					<td>{r.petName ?? '—'}</td>
					<td class="small muted">{r.roomName ?? '—'}</td>
					<td><span class="badge status-{r.status}">{r.status.replace('_', ' ')}</span></td>
					<td class="num">
						{#if r.status === 'confirmed' || r.status === 'pending'}
							<form method="POST" action="?/checkin">
								<input type="hidden" name="bookingId" value={r.id} />
								<button class="btn btn-primary btn-sm" type="submit"><UserCheck size={14} /> Check in</button>
							</form>
						{:else}
							<span class="badge status-valid"><Check size={12} /> Done</span>
						{/if}
					</td>
				</tr>
			{/each}
			</tbody>
		</table>
		{/if}
	</div>
</section>
