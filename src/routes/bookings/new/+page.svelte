<script lang="ts">
	import { page } from "$app/state";
	let { data, form } = $props();
	const fmtSlot = (s: Date) => new Date(s).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
	const error = $derived(form?.createError);
	let kind = $state(data.kind);
	let ownerId = $state(data.preselectOwnerId ?? 0);
	let petId = $state(0);
	let serviceId = $state(data.preselectServiceId ?? 0);
	let staffId = $state(data.preselectStaffId ?? 0);
	let roomId = $state(data.preselectRoomId ?? 0);
	let date = $state(data.preselectDate ?? '');
	let slot = $state('');
	let checkin = $state('');
	let checkout = $state('');

	function switchKind(k: 'grooming' | 'hotel') {
		kind = k;
		date = '';
		slot = '';
		checkin = '';
		checkout = '';
	}

	const availableSlots = $derived(data.availableSlots ?? []);
</script>

<svelte:head><title>New booking · PetCo</title></svelte:head>

<h1>New booking</h1>

<div class="card" style="max-width: 640px">
	{#if error}<div class="error">{error}</div>{/if}
	<form method="POST" action="?/create">
		<input type="hidden" name="kind" value={kind} />
		<input type="hidden" name="ownerId" value={ownerId} />
		<input type="hidden" name="petId" value={petId} />
		<input type="hidden" name="serviceId" value={serviceId} />
		<input type="hidden" name="staffId" value={staffId} />
		<input type="hidden" name="roomId" value={roomId} />
		<input type="hidden" name="start" value={kind === 'hotel' ? checkin : slot} />
		<input type="hidden" name="end" value={kind === 'hotel' ? checkout : slot} />

		<label>Booking type
			<select value={kind} onchange={(e) => switchKind((e.currentTarget as HTMLSelectElement).value as 'grooming' | 'hotel')}>
				<option value="grooming">Grooming</option>
				<option value="hotel">Pet Hotel</option>
			</select>
		</label>

		<label>Customer
			<select value={ownerId} onchange={(e) => { ownerId = Number((e.currentTarget as HTMLSelectElement).value); petId = 0; }}>
				<option value={0}>Select customer…</option>
				{#each data.owners as o}
					<option value={o.id} selected={o.id === ownerId}>{o.firstName} {o.lastName} ({o.phone})</option>
				{/each}
			</select>
		</label>
		<p class="small muted"><a href="/customers/new">+ New customer</a></p>

		{#if ownerId}
		<label>Pet
			<select value={petId} onchange={(e) => petId = Number((e.currentTarget as HTMLSelectElement).value)}>
				<option value={0}>Select pet…</option>
				{#each data.pets as p}
					{#if p.ownerId === ownerId}
						<option value={p.id} selected={p.id === petId}>{p.name}</option>
					{/if}
				{/each}
			</select>
		</label>
		{/if}

		{#if kind === 'grooming'}
		<div class="form-row">
			<label>Service
				<select value={serviceId} onchange={(e) => serviceId = Number((e.currentTarget as HTMLSelectElement).value)}>
					<option value={0}>Pick…</option>
					{#each data.services as s}
						{#if s.kind === 'grooming'}
							<option value={s.id} selected={s.id === serviceId}>{s.name} · {(s.priceCents/100).toFixed(2)} ({s.durationMinutes}min)</option>
						{/if}
					{/each}
				</select>
			</label>
			<label>Groomer
				<select value={staffId} onchange={(e) => staffId = Number((e.currentTarget as HTMLSelectElement).value)}>
					<option value={0}>Pick…</option>
					{#each data.staff as s}
						{#if s.role === 'groomer'}
							<option value={s.id} selected={s.id === staffId}>{s.name}</option>
						{/if}
					{/each}
				</select>
			</label>
		</div>
		{#if serviceId && staffId}
			<label>Date
				<input type="date" value={date} onchange={(e) => date = (e.currentTarget as HTMLInputElement).value} min={new Date().toISOString().slice(0,10)} />
			</label>
			{#if date}
			<a class="btn-link" href="/bookings/new?kind=grooming&owner={ownerId}&service={serviceId}&staff={staffId}&date={date}"><button type="button">Show free slots</button></a>
			<p class="small muted">Pick an exact time below.</p>
			<div class="slots">
				{#if availableSlots.length === 0}
					<span class="small muted">Select a date and press “Show free slots”.</span>
				{:else}
					{#each availableSlots as slot}
						<label class="slot" onchange={() => { date = slot.start.toISOString(); checkin = date; }}>
							<input type="radio" name="timepick" value={slot.start.toISOString()} checked={date === slot.start.toISOString()} />
							{fmtSlot(slot.start)}
						</label>
					{/each}
				{/if}
			</div>
			{/if}
		{/if}
		{/if}

		{#if kind === 'hotel'}
		<div class="form-row">
			<label>Room
				<select value={roomId} onchange={(e) => roomId = Number((e.currentTarget as HTMLSelectElement).value)}>
					<option value={0}>Pick…</option>
					{#each data.rooms as r}
						<option value={r.id} selected={r.id === roomId}>{r.name} · ${(r.pricePerNightCents/100).toFixed(2)}/night</option>
					{/each}
				</select>
			</label>
		</div>
		<div class="form-row">
			<label>Check-in<input type="date" value={checkin} onchange={(e) => checkin = (e.currentTarget as HTMLInputElement).value} /></label>
			<label>Check-out<input type="date" value={checkout} onchange={(e) => checkout = (e.currentTarget as HTMLInputElement).value} /></label>
		</div>
		{/if}

		<div class="row" style="margin-top: 18px">
			<button class="primary" type="submit"
				disabled={!ownerId || (kind==='grooming' && (!serviceId || !staffId || !date)) || (kind==='hotel' && (!roomId || !checkin || !checkout))}>Save booking</button>
			<a href="/bookings"><button type="button">Cancel</button></a>
		</div>
	</form>
</div>

<style>
	.slots { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
	.slot { border: 1px solid var(--border); border-radius: 8px; padding: 6px 10px; cursor: pointer; margin: 0; }
	.slot:has(input:checked) { background: var(--primary); color: #fff; border-color: var(--primary); }
	.slot input { display: none; }
	.btn-link button { margin-top: 4px; }
</style>
