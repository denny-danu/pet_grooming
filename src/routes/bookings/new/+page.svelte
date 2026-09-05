<script lang="ts">
	import { page } from "$app/state";
	import { ArrowLeft, CalendarPlus, Check, Search, Scissors, Hotel } from "@lucide/svelte";
	let { data } = $props();
	const form = $derived(page.form);
	const error = $derived(form?.createError);
	const fmtSlot = (s: Date) => new Date(s).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

	let kind = $state(data.kind);
	let ownerId = $state(data.preselectOwnerId ?? 0);
	let petId = $state(0);
	let serviceId = $state(data.preselectServiceId ?? 0);
	let staffId = $state(data.preselectStaffId ?? 0);
	let roomId = $state(data.preselectRoomId ?? 0);
	let date = $state(data.preselectDate ?? '');
	let slotISO = $state('');
	let checkin = $state('');
	let checkout = $state('');

	const availableSlots = $derived(data.availableSlots ?? []);
	const petsFor = $derived(data.pets.filter((p) => p.ownerId === ownerId));
	const pet = $derived(petsFor.find((p) => p.id === petId));
	const selectedService = $derived(data.services.find((s) => s.id === serviceId));
	const selectedRoom = $derived(data.rooms.find((r) => r.id === roomId));
	const nights = $derived(checkin && checkout && checkout > checkin ? Math.max(1, Math.round((Number(new Date(checkout)) - Number(new Date(checkin))) / 864e5)) : 0);
	const estTotal = $derived(
		kind === 'grooming' ? (selectedService?.priceCents ?? 0)
			: kind === 'hotel' ? (selectedRoom ? nights * selectedRoom.pricePerNightCents : 0) : 0
	);
	const canSubmit = $derived(
		ownerId > 0 && petId > 0 && (
			(kind === 'grooming' && serviceId > 0 && staffId > 0 && !!slotISO) ||
			(kind === 'hotel' && roomId > 0 && nights > 0)
		)
	);
	const money = (c: number) => `$${(c / 100).toFixed(2)}`;

	function switchKind(k: 'grooming' | 'hotel') {
		kind = k; date = ''; slotISO = ''; checkin = ''; checkout = '';
	}
	const slotsQuery = () =>
		`/bookings/new?kind=grooming&owner=${ownerId}&service=${serviceId}&staff=${staffId}&date=${date}`;
	const todayStr = () => new Date().toISOString().slice(0, 10);
</script>

<svelte:head><title>New booking · PetCo</title></svelte:head>

<a href="/bookings" class="back-link"><ArrowLeft size={15} /> Bookings</a>

<div class="page-header">
	<div class="title-block">
		<h1>New booking</h1>
		<p>Book a grooming slot or a pet hotel stay.</p>
	</div>
</div>

<div class="card pad" style="max-width: 720px">
	{#if error}<div class="alert alert-error">{error}</div>{/if}

	<div class="segmented" style="margin-bottom: var(--sp-5)" role="tablist">
		<button class:active={kind === 'grooming'} role="tab" onclick={() => switchKind('grooming')}><Scissors size={15} /> Grooming</button>
		<button class:active={kind === 'hotel'} role="tab" onclick={() => switchKind('hotel')}><Hotel size={15} /> Pet hotel</button>
	</div>

	<form method="POST" action="?/create">
		<input type="hidden" name="kind" value={kind} />
		<input type="hidden" name="ownerId" value={ownerId} />
		<input type="hidden" name="petId" value={petId} />
		<input type="hidden" name="serviceId" value={serviceId} />
		<input type="hidden" name="staffId" value={staffId} />
		<input type="hidden" name="roomId" value={roomId} />
		<input type="hidden" name="start" value={kind === 'hotel' ? checkin : slotISO} />
		<input type="hidden" name="end" value={kind === 'hotel' ? checkout : slotISO} />

		<div class="steps">
			<!-- step 1: customer + pet -->
			<div class="step">
				<div class="step-label">1 · Customer</div>
				<div class="grid cols-2">
					<div class="field">
						<label for="ownerId">Owner</label>
						<select id="ownerId" value={ownerId} onchange={(e) => { ownerId = Number((e.currentTarget as HTMLSelectElement).value); petId = 0; }}>
							<option value={0}>Select customer…</option>
							{#each data.owners as o}
								<option value={o.id}>{o.firstName} {o.lastName} · {o.phone}</option>
							{/each}
						</select>
					</div>
					<div class="field">
						<label for="petId">Pet</label>
						{#if ownerId === 0}
							<select disabled><option>Pick an owner first</option></select>
						{:else if petsFor.length === 0}
							<select disabled><option>No pets on file</option></select>
						{:else}
							<select id="petId" value={petId} onchange={(e) => petId = Number((e.currentTarget as HTMLSelectElement).value)}>
								<option value={0}>Select pet…</option>
								{#each petsFor as p}
									<option value={p.id}>{p.name} · {p.species}</option>
								{/each}
							</select>
						{/if}
					</div>
				</div>
				{#if ownerId === 0}
					<p class="tiny"><a href="/customers/new">Customer not on file? Add one →</a></p>
				{/if}
			</div>

			{#if ownerId > 0}
			<!-- step 2: service / room -->
			<div class="step">
				<div class="step-label">2 · {kind === 'grooming' ? 'Service & groomer' : 'Room & dates'}</div>
				{#if kind === 'grooming'}
					<div class="grid cols-2">
						<div class="field">
							<label for="serviceId">Service</label>
							<select id="serviceId" value={serviceId} onchange={(e) => { serviceId = Number((e.currentTarget as HTMLSelectElement).value); date = ''; slotISO = ''; }}>
								<option value={0}>Select…</option>
								{#each data.services as s}
									{#if s.kind === 'grooming'}
										<option value={s.id}>{s.name} · {money(s.priceCents)} · {s.durationMinutes} min</option>
									{/if}
								{/each}
							</select>
						</div>
						<div class="field">
							<label for="staffId">Groomer</label>
							<select id="staffId" value={staffId} onchange={(e) => { staffId = Number((e.currentTarget as HTMLSelectElement).value); date = ''; slotISO = ''; }}>
								<option value={0}>Select…</option>
								{#each data.staff as s}
									{#if s.role === 'groomer'}
										<option value={s.id}>{s.name}{s.specialty ? ` · ${s.specialty}` : ''}</option>
									{/if}
								{/each}
							</select>
						</div>
					</div>

					{#if selectedService && staffId}
						<div class="field" style="max-width: 260px; margin-top: var(--sp-2)">
							<label for="date">Day</label>
							<input id="date" type="date" value={date} min={todayStr()} onchange={(e) => { date = (e.currentTarget as HTMLInputElement).value; slotISO = ''; }} />
						</div>
						{#if date && serviceId > 0 && staffId > 0}
							<div class="slotbox">
								<div class="slotbox-head">
									<span class="small muted">Available times for {selectedService.name} with {data.staff.find((s) => s.id === staffId)?.name} on {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
									<a href={slotsQuery()}><button class="btn btn-sm" type="button"><Search size={13} /> {availableSlots.length > 0 ? 'Refresh' : 'Show slots'}</button></a>
								</div>
								{#if availableSlots.length === 0}
									<p class="small faint">Press “Show slots” to see open times for this day.</p>
								{:else}
									<div class="slot-grid">
										{#each availableSlots as s}
											<label class="slot" class:sel={slotISO === s.start.toISOString()}>
												<input type="radio" name="slot" value={s.start.toISOString()} checked={slotISO === s.start.toISOString()} onchange={() => slotISO = s.start.toISOString()} />
												<span class="slot-time">{fmtSlot(s.start)}</span>
												<span class="slot-dur">{selectedService?.durationMinutes} min</span>
											</label>
										{/each}
									</div>
								{/if}
							</div>
						{/if}
					{/if}
				{:else}
					<div class="grid cols-2">
						<div class="field">
							<label for="roomId">Suite / room</label>
							<select id="roomId" value={roomId} onchange={(e) => roomId = Number((e.currentTarget as HTMLSelectElement).value)}>
								<option value={0}>Select…</option>
								{#each data.rooms as r}
									<option value={r.id}>{r.name} · {money(r.pricePerNightCents)}/night{r.maxPetWeightKg ? ` · up to ${r.maxPetWeightKg} kg` : ''}</option>
								{/each}
							</select>
						</div>
						<div class="field">
							<label class="check" style="margin-top: 26px"><input type="checkbox" checked /> Requires current vaccination</label>
						</div>
						<div class="field">
							<label for="checkin">Check-in</label>
							<input id="checkin" type="date" value={checkin} min={todayStr()} onchange={(e) => checkin = (e.currentTarget as HTMLInputElement).value} />
						</div>
						<div class="field">
							<label for="checkout">Check-out</label>
							<input id="checkout" type="date" value={checkout} min={checkin || todayStr()} onchange={(e) => checkout = (e.currentTarget as HTMLInputElement).value} />
						</div>
					</div>
					{#if selectedRoom}
						<p class="tiny muted">Pets without a valid vaccination record cannot be checked into the hotel.</p>
					{/if}
				{/if}
			</div>
			{/if}
		</div>

		<hr class="divider" />

		<div class="summary-row">
			<div class="summary">
				{#if ownerId > 0}
					<span class="sum-line"><span class="tiny faint">For</span> <strong>{data.owners.find((o) => o.id === ownerId)?.firstName} {pet?.name ?? ''}</strong></span>
					{#if kind === 'grooming' && selectedService}
						<span class="sum-line"><span class="tiny faint">Service</span> <strong>{selectedService.name}</strong></span>
					{/if}
					{#if kind === 'hotel' && selectedRoom}
						<span class="sum-line"><span class="tiny faint">Stay</span> <strong>{nights} night(s) · {selectedRoom.name}</strong></span>
					{/if}
				{:else}
					<span class="tiny faint">Choose a customer to continue</span>
				{/if}
			</div>
			<div class="total">
				{#if estTotal > 0}
					<div class="total-num mono">{money(estTotal)}</div>
					<div class="total-label">{kind === 'hotel' ? (nights > 1 ? `${nights} nights` : '1 night') : 'total'}</div>
				{/if}
			</div>
		</div>

		<div class="card-foot" style="margin-top: var(--sp-4); padding-left: 0; padding-right: 0; background: none; border-top: none">
			<a href="/bookings"><button class="btn" type="button">Cancel</button></a>
			<button class="btn btn-primary" type="submit" disabled={!canSubmit}><CalendarPlus size={15} /> Confirm booking</button>
		</div>
	</form>
</div>

<style>
	.back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; margin-bottom: var(--sp-4); color: var(--muted); }
	.steps { display: flex; flex-direction: column; gap: var(--sp-5); }
	.step-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--faint); margin-bottom: 10px; }
	.slotbox { margin-top: var(--sp-3); border: 1px solid var(--border); border-radius: var(--r-md); padding: var(--sp-3); background: var(--surface-2); }
	.slotbox-head { display: flex; justify-content: space-between; align-items: center; gap: var(--sp-3); margin-bottom: 10px; }
	.slot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(88px, 1fr)); gap: 8px; }
	.slot {
		position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 1px;
		border: 1px solid var(--border-strong); border-radius: var(--r-sm); background: var(--surface);
		padding: 7px 10px; cursor: pointer; margin: 0;
		transition: border-color 120ms ease, box-shadow 120ms ease;
	}
	.slot:hover { border-color: var(--primary); }
	.slot.sel { border-color: var(--primary); background: var(--primary-soft); box-shadow: var(--focus); }
	.slot input { position: absolute; opacity: 0; pointer-events: none; }
	.slot-time { font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
	.slot-dur { font-size: 10.5px; color: var(--faint); }
	.summary-row { display: flex; justify-content: space-between; align-items: center; gap: var(--sp-3); }
	.summary { display: flex; gap: 16px; flex-wrap: wrap; }
	.sum-line { font-size: 13px; }
	.sum-line .tiny { display: block; }
	.total { text-align: right; }
	.total-num { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
	.total-label { font-size: 11px; color: var(--faint); text-transform: uppercase; letter-spacing: 0.05em; }
</style>
