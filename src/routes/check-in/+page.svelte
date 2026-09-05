<script lang="ts">
	import { page } from "$app/state";
	let { data } = $props();
	const fmtTime = (d: Date) => new Date(d).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
	const actionError = $derived(page.form?.actionError);
</script>

<svelte:head><title>Check-in · PetCo</title></svelte:head>

<div class="spread">
	<h1>Today's arrivals</h1>
</div>

{#if actionError}<div class="error">{actionError}</div>{/if}

<section class="card">
	{#if data.rows.length === 0}
		<div class="empty">No arrivals scheduled today</div>
	{:else}
	<table>
		<thead><tr><th>Time</th><th>Type</th><th>Customer</th><th>Pet</th><th>Room</th><th>Status</th><th></th></tr></thead>
		<tbody>
		{#each data.rows as r}
			<tr>
				<td>{fmtTime(r.startsAt)}</td>
				<td><span class="badge {r.kind}">{r.kind}</span></td>
				<td>{r.ownerName} {r.ownerLast}</td>
				<td>{r.petName ?? '—'}</td>
				<td>{r.roomName ?? ''}</td>
				<td><span class="badge {r.status}">{r.status}</span></td>
				<td>
					{#if r.status === 'confirmed' || r.status === 'pending'}
						<form method="POST" action="?/checkin">
							<input type="hidden" name="bookingId" value={r.id} />
							<button class="primary" type="submit">Check in</button>
						</form>
					{:else}
						<span class="small muted">checked in</span>
					{/if}
				</td>
			</tr>
		{/each}
		</tbody>
	</table>
	{/if}
</section>
