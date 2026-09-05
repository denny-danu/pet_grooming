<script lang="ts">
	import { page } from "$app/state";
	let { data } = $props();
	const b = $derived(data.booking);
	const money = (c: number | null) => `$${((c ?? 0) / 100).toFixed(2)}`;
	const fmtWhen = (d: Date) => new Date(d).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	const fmtDay = (d: Date) => new Date(d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
	const actionError = $derived(page.form?.actionError);
	let reason = $state('');
	let newStart = $state('');
	let newEnd = $state('');
</script>

<svelte:head><title>Booking #{data.booking?.id ?? ''} · PetCo</title></svelte:head>

{#if data.notFound}
	<div class="empty">Booking not found</div>
{:else if b}
<div class="spread">
	<h1>Booking #{b.id} <span class="badge {b.status}">{b.status}</span> <span class="badge {b.kind}">{b.kind}</span></h1>
	<a href="/bookings"><button>← Back</button></a>
</div>

{#if actionError}<div class="error">{actionError}</div>{/if}

<div class="grid cols-2">
	<section class="card">
		<h2>Details</h2>
		<table class="kv">
			<tbody>
			<tr><th>Customer</th><td>{b.owner ? `${b.owner.firstName} ${b.owner.lastName}` : '—'}</td></tr>
			<tr><th>Pet</th><td>{b.pet?.name ?? '—'} {b.pet ? `(${b.pet.species}${b.pet.breed ? ' · ' + b.pet.breed : ''})` : ''}</td></tr>
			{#if b.pet}<tr><th>Vaccine</th><td><span class="badge {data.petVax}">{data.petVax}</span></td></tr>{/if}
			<tr><th>Service / Room</th><td>{b.service?.name ?? b.room?.name ?? '—'}</td></tr>
			<tr><th>Staff</th><td>{b.staff?.name ?? '—'}</td></tr>
			<tr><th>Starts</th><td>{fmtWhen(b.startsAt)}</td></tr>
			<tr><th>Ends</th><td>{fmtWhen(b.endsAt)}</td></tr>
			<tr><th>Price</th><td>{money(b.priceCents)}{b.depositCents ? ` (deposit ${money(b.depositCents)})` : ''}</td></tr>
			{#if b.notes}<tr><th>Notes</th><td>{b.notes}</td></tr>{/if}
			</tbody>
		</table>
	</section>

	<section class="card">
		<h2>Membership</h2>
		<p>Tier: <span class="badge">{data.membership?.tier ?? 'silver'}</span> · Balance: <strong>{data.membership?.pointsBalance ?? 0}</strong> pts</p>
		<form method="POST" action="?/earnPoints">
			<button class="primary" type="submit">Earn points (${b.priceCents ? Math.floor(b.priceCents/100) : 0})</button>
		</form>
	</section>
</div>

<section class="card">
	<h2>Actions</h2>
	<div class="row">
		{#if b.status === 'confirmed' || b.status === 'pending'}
			<form method="POST" action="?/checkin"><button class="primary" type="submit">Check in</button></form>
			<form method="POST" action="?/complete"><button type="submit">Mark completed</button></form>
			<form method="POST" action="?/noshow"><button type="submit">No-show</button></form>
		{/if}
		{#if b.status === 'checked_in'}
			<form method="POST" action="?/checkout"><button class="primary" type="submit">Check out</button></form>
		{/if}
		{#if b.status === 'pending' || b.status === 'confirmed' || b.status === 'checked_in'}
			<form method="POST" action="?/sendReminder"><button type="submit">Send reminder</button></form>
		{/if}
		{#if b.status === 'confirmed' && b.kind !== 'aquarium'}
			<form method="POST" action="?/redeemPackage"><button type="submit">Use package credit</button></form>
		{/if}
		<form method="POST" action="?/cancel">
			<input type="text" name="reason" placeholder="Cancel reason" bind:value={reason} style="width: 180px" />
			<button class="danger" type="submit">Cancel booking</button>
		</form>
	</div>

	{#if b.status === 'pending' || b.status === 'confirmed' || b.status === 'checked_in'}
	<hr />
	<h2>Reschedule</h2>
	<div class="row">
		<form method="POST" action="?/reschedule">
			<label>New start<input type="datetime-local" name="start" bind:value={newStart} required /></label>
			<label>New end<input type="datetime-local" name="end" bind:value={newEnd} required /></label>
			<button type="submit">Reschedule</button>
		</form>
	</div>
	{/if}
</section>

<style>
	.kv th { width: 130px; color: var(--muted); font-weight: 500; text-transform: none; letter-spacing: 0; font-size: 13px; }
	.kv td { font-size: 14px; }
	.row form { display: flex; gap: 8px; align-items: flex-end; }
</style>
{/if}
