<script lang="ts">
	import { page } from "$app/state";
	import { makeT } from "$lib/i18n/t";
	import {
		ArrowLeft,
		CalendarPlus,
		Check,
		Search,
		Scissors,
		Hotel,
		Fish,
		Clock,
		Sparkles,
		ShieldCheck,
		ShieldAlert,
		TriangleAlert,
		User,
		PawPrint,
		Info,
		CheckCircle2,
		Receipt,
		Sun,
		Sunset,
		Sunrise,
		X,
		Plus,
		Waves,
		Heart
	} from "@lucide/svelte";
	import { formatRupiah as money } from "$lib/util";
	import { getSpeciesEmoji } from "$lib/ui/species";
	import DatePicker from "$lib/components/DatePicker.svelte";

	let { data } = $props();
	const t = $derived(makeT(page.data.locale ?? "en"));
	const form = $derived(page.form);
	const error = $derived(form?.createError);

	const fmtSlot = (s: Date | string) =>
		new Date(s).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

	let kind = $state<'grooming' | 'hotel' | 'aquarium'>((data.kind ?? 'grooming') as 'grooming' | 'hotel' | 'aquarium');
	let ownerId = $state<number>(data.preselectOwnerId ?? 0);
	let petId = $state<number>(0);
	let tankId = $state<number>(0);
	let serviceId = $state<number>(data.preselectServiceId ?? 0);
	let staffId = $state<number>(data.preselectStaffId ?? 0);
	let roomId = $state<number>(data.preselectRoomId ?? 0);
	let date = $state<string>(data.preselectDate ?? '');
	let slotISO = $state<string>('');
	let checkin = $state<string>('');
	let checkout = $state<string>('');
	let aquaDate = $state<string>(new Date().toISOString().slice(0, 10));
	let aquaTime = $state<string>("09:00");
	let notes = $state<string>('');

	// Add-ons & Extras States
	let selectedAddonIds = $state<number[]>([]);
	let hotelExtraWalk = $state(false);
	let hotelExtraPlay = $state(false);
	let hotelExtraBath = $state(false);

	const availableSlots = $derived(data.availableSlots ?? []);
	const petsForOwner = $derived(data.pets.filter((p) => p.ownerId === ownerId));
	const tanksForOwner = $derived(data.tanks.filter((t) => t.ownerId === ownerId));

	// Auto-select first pet/tank when owner changes
	$effect(() => {
		if (ownerId) {
			if (petsForOwner.length > 0 && !petsForOwner.some((p) => p.id === petId)) {
				petId = petsForOwner[0].id;
			}
			if (tanksForOwner.length > 0 && !tanksForOwner.some((t) => t.id === tankId)) {
				tankId = tanksForOwner[0].id;
			}
		} else {
			petId = 0;
			tankId = 0;
		}
	});

	const selectedPet = $derived(petsForOwner.find((p) => p.id === petId));
	const selectedTank = $derived(tanksForOwner.find((t) => t.id === tankId));
	const selectedOwner = $derived(data.owners.find((o) => o.id === ownerId));
	const selectedService = $derived(data.services.find((s) => s.id === serviceId));
	const selectedStaff = $derived(data.staff.find((st) => st.id === staffId));
	const selectedRoom = $derived(data.rooms.find((r) => r.id === roomId));

	// Grooming add-on services list (treatments)
	const groomingAddonServices = $derived(
		data.services.filter((s) => s.kind === "grooming" && s.id !== serviceId && (s.durationMinutes <= 30 || s.priceCents <= 60000))
	);

	const selectedAddonsList = $derived(
		data.services.filter((s) => selectedAddonIds.includes(s.id))
	);

	const addonsTotalPrice = $derived(
		selectedAddonsList.reduce((sum, a) => sum + a.priceCents, 0)
	);

	const nights = $derived(
		checkin && checkout && checkout > checkin
			? Math.max(1, Math.round((Number(new Date(checkout)) - Number(new Date(checkin))) / 864e5))
			: 0
	);

	const hotelExtrasTotal = $derived(
		(hotelExtraWalk ? 35000 * (nights || 1) : 0) +
		(hotelExtraPlay ? 40000 * (nights || 1) : 0) +
		(hotelExtraBath ? 95000 : 0)
	);

	const estTotal = $derived(
		kind === 'grooming'
			? ((selectedService?.priceCents ?? 0) + addonsTotalPrice)
			: kind === 'hotel'
			? (selectedRoom ? (nights * selectedRoom.pricePerNightCents + hotelExtrasTotal) : 0)
			: kind === 'aquarium'
			? (selectedService?.priceCents ?? 0)
			: 0
	);

	const estPoints = $derived(Math.floor(estTotal / 1000));

	const canSubmit = $derived(
		ownerId > 0 &&
		(
			(kind === 'grooming' && petId > 0 && serviceId > 0 && staffId > 0 && !!slotISO) ||
			(kind === 'hotel' && petId > 0 && roomId > 0 && nights > 0) ||
			(kind === 'aquarium' && serviceId > 0 && !!aquaDate)
		)
	);

	function switchKind(k: 'grooming' | 'hotel' | 'aquarium') {
		kind = k;
		slotISO = '';
		checkin = '';
		checkout = '';
		serviceId = 0;
	}

	function toggleAddon(id: number) {
		if (selectedAddonIds.includes(id)) {
			selectedAddonIds = selectedAddonIds.filter((x) => x !== id);
		} else {
			selectedAddonIds = [...selectedAddonIds, id];
		}
	}

	function checkVaccineStatus(pet: typeof selectedPet) {
		if (!pet || !pet.vaccinationDueDate) return { status: 'missing', label: 'No Vaccine Record', Icon: TriangleAlert, cls: 'status-pending' };
		const exp = new Date(pet.vaccinationDueDate);
		const now = new Date();
		const diffDays = Math.round((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));
		if (diffDays < 0) return { status: 'expired', label: 'Vaccine Expired', Icon: ShieldAlert, cls: 'status-cancelled' };
		if (diffDays <= 30) return { status: 'expiring', label: `Expires in ${diffDays}d`, Icon: TriangleAlert, cls: 'status-pending' };
		return { status: 'valid', label: 'Vaccinated', Icon: ShieldCheck, cls: 'status-valid' };
	}

	function reloadGroomingSlots() {
		if (ownerId && serviceId && staffId && date) {
			window.location.href = `/bookings/new?kind=grooming&owner=${ownerId}&service=${serviceId}&staff=${staffId}&date=${date}`;
		}
	}
</script>

<svelte:head>
	<title>New Booking · PetCo</title>
</svelte:head>

<a href="/bookings" class="back-link">
	<ArrowLeft size={15} /> Back to Schedule
</a>

<div class="page-header">
	<div class="title-block">
		<div class="kicker"><CalendarPlus size={13} /> {t['newbook.kicker']()}</div>
		<h1>{t['newbook.title']()}</h1>
		<p class="subtitle">{t['newbook.subtitle']()}</p>
	</div>
</div>

{#if error}
	<div class="alert alert-error mb">
		<ShieldAlert />
		<span>{error}</span>
	</div>
{/if}

<div class="grid cols-2-1 wizard-layout" style="align-items: start;">
	<!-- Left: Form inputs -->
	<form method="POST" action="?/create" class="stack">
		<input type="hidden" name="kind" value={kind} />
		<input type="hidden" name="ownerId" value={ownerId} />
		<input type="hidden" name="petId" value={petId} />

		<!-- 1. Service Type Selector (3 Pillars) -->
		<section class="card pad">
			<h2 style="margin-bottom: var(--sp-3)">1. Select Business Line &amp; Service Type</h2>
			<div class="grid cols-3 service-type-cards">
				<button
					type="button"
					class="type-card {kind === 'grooming' ? 'active' : ''}"
					onclick={() => switchKind('grooming')}
				>
					<div class="type-icon purple-tint">
						<Scissors size={20} />
					</div>
					<div class="type-text">
						<div class="type-title">Pet Grooming</div>
						<div class="type-desc">Styling &amp; bath spa</div>
					</div>
					{#if kind === 'grooming'}
						<div class="check-pill"><Check size={12} /></div>
					{/if}
				</button>

				<button
					type="button"
					class="type-card {kind === 'hotel' ? 'active' : ''}"
					onclick={() => switchKind('hotel')}
				>
					<div class="type-icon blue-tint">
						<Hotel size={20} />
					</div>
					<div class="type-text">
						<div class="type-title">Pet Hotel</div>
						<div class="type-desc">Overnight boarding</div>
					</div>
					{#if kind === 'hotel'}
						<div class="check-pill"><Check size={12} /></div>
					{/if}
				</button>

				<button
					type="button"
					class="type-card {kind === 'aquarium' ? 'active' : ''}"
					onclick={() => switchKind('aquarium')}
				>
					<div class="type-icon green-tint">
						<Fish size={20} />
					</div>
					<div class="type-text">
						<div class="type-title">Aquarium</div>
						<div class="type-desc">Tank maintenance</div>
					</div>
					{#if kind === 'aquarium'}
						<div class="check-pill"><Check size={12} /></div>
					{/if}
				</button>
			</div>
		</section>

		<!-- 2. Customer & Subject Selection -->
		<section class="card pad">
			<h2 style="margin-bottom: var(--sp-3)">2. Customer / Client Selection</h2>

			<div class="field">
				<label for="ownerSelect">
					<span>Client Account <span class="req">*</span></span>
					<a href="/customers/new" class="small cell-link">+ New customer</a>
				</label>
				<select id="ownerSelect" bind:value={ownerId}>
					<option value={0}>-- Select an owner / client --</option>
					{#each data.owners as o}
						<option value={o.id}>{o.lastName}, {o.firstName} · {o.phone}</option>
					{/each}
				</select>
			</div>

			{#if ownerId > 0}
				{#if kind === 'grooming' || kind === 'hotel'}
					<!-- Pet Selector -->
					<div class="pets-selection-block">
						<div class="small font-semibold ink-2" style="margin-bottom: 6px;">
							Select Pet for Visit <span class="req">*</span>
						</div>

						{#if petsForOwner.length === 0}
							<div class="alert alert-warning" style="margin: 0;">
								<Info />
								<span>This customer has no pets on file. <a href="/customers/{ownerId}" class="cell-link font-semibold">Add a pet to this profile first</a>.</span>
							</div>
						{:else}
							<div class="grid cols-2 pet-cards-grid">
								{#each petsForOwner as p}
									{@const vax = checkVaccineStatus(p)}
									{@const VaxIcon = vax.Icon}
									<button
										type="button"
										class="pet-select-card {petId === p.id ? 'active' : ''}"
										onclick={() => petId = p.id}
									>
										<span class="pet-select-emoji">{getSpeciesEmoji(p.species)}</span>
										<div class="pet-select-info">
											<div class="pet-select-name">{p.name}</div>
											<div class="pet-select-sub">{p.breed ?? p.species}{p.weightKg ? ` · ${p.weightKg}kg` : ''}</div>
											<div class="badge {vax.cls}" style="margin-top: 4px; font-size: 10.5px;">
												<VaxIcon size={10} />
												{vax.label}
											</div>
										</div>
										{#if petId === p.id}
											<div class="check-pill-sm"><Check size={11} /></div>
										{/if}
									</button>
								{/each}
							</div>
						{/if}
					</div>
				{:else if kind === 'aquarium'}
					<!-- Tank Selector -->
					<div class="pets-selection-block">
						<div class="small font-semibold ink-2" style="margin-bottom: 6px;">
							Select Customer Aquarium Tank
						</div>

						{#if tanksForOwner.length === 0}
							<div class="alert alert-info" style="margin: 0;">
								<Waves />
								<span>Client has no registered tanks. General on-site visit will be booked.</span>
							</div>
						{:else}
							<div class="grid cols-2 pet-cards-grid">
								{#each tanksForOwner as t}
									<button
										type="button"
										class="pet-select-card {tankId === t.id ? 'active' : ''}"
										onclick={() => tankId = t.id}
									>
										<span class="pet-select-emoji">🐠</span>
										<div class="pet-select-info">
											<div class="pet-select-name">{t.name}</div>
											<div class="pet-select-sub">{t.volumeLiters ? `${t.volumeLiters}L` : ''} · {t.ecosystem.toUpperCase()}</div>
										</div>
										{#if tankId === t.id}
											<div class="check-pill-sm"><Check size={11} /></div>
										{/if}
									</button>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			{/if}
		</section>

		<!-- 3. Service Configuration & Add-ons -->
		{#if kind === 'grooming'}
			<section class="card pad">
				<h2 style="margin-bottom: var(--sp-3)">3. Grooming Service, Stylist &amp; Add-ons</h2>

				<div class="grid cols-2">
					<div class="field">
						<label for="serviceId">Base Grooming Service <span class="req">*</span></label>
						<select id="serviceId" name="serviceId" bind:value={serviceId} onchange={reloadGroomingSlots}>
							<option value={0}>-- Select Service --</option>
							{#each data.services.filter((s) => s.kind === 'grooming') as s}
								<option value={s.id}>{s.name} ({s.durationMinutes}m) - {money(s.priceCents)}</option>
							{/each}
						</select>
					</div>

					<div class="field">
						<label for="staffId">Groomer / Stylist <span class="req">*</span></label>
						<select id="staffId" name="staffId" bind:value={staffId} onchange={reloadGroomingSlots}>
							<option value={0}>-- Select Groomer --</option>
							{#each data.staff as st}
								<option value={st.id}>{st.name} ({st.role})</option>
							{/each}
						</select>
					</div>
				</div>

				<!-- Grooming Add-ons Multi-Select -->
				{#if groomingAddonServices.length > 0}
					<div class="addons-select-block" style="margin-bottom: var(--sp-4);">
						<div class="small font-semibold ink-2" style="margin-bottom: 6px;">
							Spa &amp; Grooming Add-on Treatments (Optional)
						</div>
						<div class="grid cols-2 gap-2">
							{#each groomingAddonServices as addon}
								<label class="addon-checkbox-card {selectedAddonIds.includes(addon.id) ? 'active' : ''}">
									<input
										type="checkbox"
										name="addonIds"
										value={addon.id}
										checked={selectedAddonIds.includes(addon.id)}
										onchange={() => toggleAddon(addon.id)}
									/>
									<div class="addon-check-text">
										<div class="cell-strong">{addon.name}</div>
										<div class="small muted mono">+{money(addon.priceCents)} ({addon.durationMinutes}m)</div>
									</div>
								</label>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Appointment Datepicker -->
				<div class="field">
					<DatePicker
						id="groomingDate"
						label="Appointment Date"
						bind:value={date}
						min={new Date().toISOString().slice(0, 10)}
						required
						placeholder="Select appointment date..."
						onchange={reloadGroomingSlots}
					/>
				</div>

				<!-- Available Time Slots -->
				{#if serviceId && staffId && date}
					<div class="slots-section" style="margin-top: var(--sp-4);">
						<div class="spread" style="margin-bottom: 8px;">
							<div class="small font-semibold ink-2">
								Select Available Time Slot <span class="req">*</span>
							</div>
							<span class="tiny muted mono">{availableSlots.length} slot(s) open</span>
						</div>

						{#if availableSlots.length === 0}
							<div class="alert alert-warning">
								<Clock />
								<span>No free time slots available on this date for {selectedStaff?.name ?? 'this groomer'}. Please pick another date or staff member.</span>
							</div>
						{:else}
							<div class="slots-grid">
								{#each availableSlots as slot}
									{@const slotVal = slot.start instanceof Date ? slot.start.toISOString() : new Date(slot.start).toISOString()}
									{@const slotDate = slot.start instanceof Date ? slot.start : new Date(slot.start)}
									<button
										type="button"
										class="slot-btn {slotISO === slotVal ? 'active' : ''}"
										onclick={() => slotISO = slotVal}
									>
										<Clock size={12} />
										<span>{fmtSlot(slotDate)}</span>
									</button>
								{/each}
							</div>
							<input type="hidden" name="slotISO" value={slotISO} />
						{/if}
					</div>
				{/if}
			</section>
		{:else if kind === 'hotel'}
			<section class="card pad">
				<h2 style="margin-bottom: var(--sp-3)">3. Boarding Suite &amp; Dates</h2>

				<div class="field">
					<label for="roomId">Room / Suite Category <span class="req">*</span></label>
					<select id="roomId" name="roomId" bind:value={roomId}>
						<option value={0}>-- Select Room / Suite --</option>
						{#each data.rooms as r}
							<option value={r.id}>{r.name} ({r.sizeLabel ?? 'Suite'}) - {money(r.pricePerNightCents)} / night</option>
						{/each}
					</select>
				</div>

				<div class="grid cols-2">
					<div class="field">
						<DatePicker
							id="checkInDate"
							name="checkInDate"
							label="Check-in Date"
							bind:value={checkin}
							min={new Date().toISOString().slice(0, 10)}
							required
							placeholder="Select check-in..."
						/>
					</div>
					<div class="field">
						<DatePicker
							id="checkOutDate"
							name="checkOutDate"
							label="Check-out Date"
							bind:value={checkout}
							min={checkin || new Date().toISOString().slice(0, 10)}
							required
							placeholder="Select check-out..."
						/>
					</div>
				</div>

				<!-- Boarding Extras Upgrades -->
				<div class="hotel-extras-block" style="margin-top: var(--sp-3);">
					<div class="small font-semibold ink-2" style="margin-bottom: 6px;">
						Boarding Extras &amp; Daily Upgrades
					</div>
					<div class="stack-sm">
						<label class="addon-checkbox-card {hotelExtraWalk ? 'active' : ''}">
							<input type="checkbox" name="extraWalk" bind:checked={hotelExtraWalk} />
							<div class="addon-check-text">
								<div class="cell-strong">Extra Daily Exercise Walk (+Rp 35.000/night)</div>
								<div class="small muted">30-minute individual park walking session per day</div>
							</div>
						</label>

						<label class="addon-checkbox-card {hotelExtraPlay ? 'active' : ''}">
							<input type="checkbox" name="playtime" bind:checked={hotelExtraPlay} />
							<div class="addon-check-text">
								<div class="cell-strong">Supervised Agility Playtime (+Rp 40.000/night)</div>
								<div class="small muted">Interactive garden play session with caretakers</div>
							</div>
						</label>

						<label class="addon-checkbox-card {hotelExtraBath ? 'active' : ''}">
							<input type="checkbox" name="bathPickup" bind:checked={hotelExtraBath} />
							<div class="addon-check-text">
								<div class="cell-strong">Bath &amp; Fluff Before Pickup (+Rp 95.000)</div>
								<div class="small muted">Pet goes home fresh, washed, and brushed on checkout morning</div>
							</div>
						</label>
					</div>
				</div>

				{#if nights > 0}
					<div class="stay-calc-pill" style="margin-top: var(--sp-4);">
						<Sparkles size={14} class="primary" />
						<span>Stay: <strong>{nights} Night{nights > 1 ? 's' : ''}</strong> ({money(selectedRoom?.pricePerNightCents ?? 0)}/night) + {money(hotelExtrasTotal)} extras</span>
					</div>
				{/if}
			</section>
		{:else if kind === 'aquarium'}
			<section class="card pad">
				<h2 style="margin-bottom: var(--sp-3)">3. Aquarium Service &amp; Specialist Dispatch</h2>

				<div class="grid cols-2">
					<div class="field">
						<label for="aquaServiceId">Aquarium Service Type <span class="req">*</span></label>
						<select id="aquaServiceId" name="serviceId" bind:value={serviceId} required>
							<option value={0}>-- Select Aquarium Service --</option>
							{#each data.services.filter((s) => s.kind === 'aquarium') as s}
								<option value={s.id}>{s.name} ({s.durationMinutes}m) - {money(s.priceCents)}</option>
							{/each}
						</select>
					</div>

					<div class="field">
						<label for="aquaStaffId">Aquarium Specialist</label>
						<select id="aquaStaffId" name="staffId" bind:value={staffId}>
							<option value={0}>-- Any Available Specialist --</option>
							{#each data.staff.filter((st) => st.role === 'specialist' || st.specialty?.toLowerCase().includes('aqua')) as st}
								<option value={st.id}>{st.name} ({st.specialty ?? 'Specialist'})</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="grid cols-2">
					<div class="field">
						<DatePicker
							id="aquaDate"
							name="appointmentDate"
							label="Visit Date"
							bind:value={aquaDate}
							min={new Date().toISOString().slice(0, 10)}
							required
							placeholder="Select visit date..."
						/>
					</div>

					<div class="field">
						<label for="aquaTime">Preferred Arrival Time</label>
						<select id="aquaTime" name="appointmentTime" bind:value={aquaTime}>
							<option value="09:00">09:00 AM (Morning Visit)</option>
							<option value="11:00">11:00 AM (Late Morning)</option>
							<option value="14:00">02:00 PM (Afternoon Visit)</option>
							<option value="16:00">04:00 PM (Late Afternoon)</option>
						</select>
					</div>
				</div>
			</section>
		{/if}

		<!-- 4. Special Notes & Handling Instructions -->
		<section class="card pad">
			<h2 style="margin-bottom: var(--sp-2)">4. Special Notes &amp; Instructions</h2>
			<p class="small muted" style="margin: 0 0 var(--sp-3);">Allergies, temperament, feeding instructions, or technician notes.</p>
			<textarea
				name="notes"
				bind:value={notes}
				rows="3"
				placeholder="e.g. Sensitive paws, tank has delicate LPS corals, very friendly dog..."
			></textarea>
		</section>

		<div class="card-foot" style="background: none; border: none; padding: 0; display: flex; align-items: center; justify-content: flex-end; gap: 10px;">
			<a href="/bookings" class="btn btn-lg">
				<X size={15} />
				<span>Cancel</span>
			</a>
			<button class="btn btn-primary btn-lg" type="submit" disabled={!canSubmit}>
				<CheckCircle2 size={16} />
				<span>Confirm &amp; Create Booking</span>
			</button>
		</div>
	</form>

	<!-- Right: Live Order Summary Card -->
	<aside class="card pad order-summary-card">
		<div class="card-head" style="padding: 0 0 var(--sp-3); border-bottom: 1px solid var(--border); margin-bottom: var(--sp-3);">
			<h2>
				<Receipt size={17} />
				Reservation Summary
			</h2>
			<span class="badge {kind === 'grooming' ? 'kind-grooming' : kind === 'hotel' ? 'kind-hotel' : 'kind-aquarium'}">
				{kind === 'grooming' ? 'Grooming' : kind === 'hotel' ? 'Hotel Stay' : 'Aquarium Visit'}
			</span>
		</div>

		<div class="summary-list">
			<div class="summary-item">
				<span class="summary-label">Customer</span>
				<span class="summary-value cell-strong">
					{selectedOwner ? `${selectedOwner.firstName} ${selectedOwner.lastName}` : '—'}
				</span>
			</div>

			{#if kind !== 'aquarium'}
				<div class="summary-item">
					<span class="summary-label">Pet</span>
					<span class="summary-value">
						{#if selectedPet}
							<span class="row gap-1">
								<span>{getSpeciesEmoji(selectedPet.species)}</span>
								<span class="cell-strong">{selectedPet.name}</span>
							</span>
						{:else}
							—
						{/if}
					</span>
				</div>
			{:else}
				<div class="summary-item">
					<span class="summary-label">Aquarium Tank</span>
					<span class="summary-value">
						{#if selectedTank}
							<strong>{selectedTank.name}</strong> ({selectedTank.volumeLiters}L)
						{:else}
							General On-site Tank
						{/if}
					</span>
				</div>
			{/if}

			<div class="summary-item">
				<span class="summary-label">Service / Suite</span>
				<span class="summary-value">
					{kind === 'grooming' ? (selectedService?.name ?? '—') : kind === 'hotel' ? (selectedRoom?.name ?? '—') : (selectedService?.name ?? '—')}
				</span>
			</div>

			<!-- Add-ons in Summary -->
			{#if kind === 'grooming' && selectedAddonsList.length > 0}
				<div class="summary-item" style="flex-direction: column; align-items: flex-start; gap: 4px;">
					<span class="summary-label">Selected Add-ons ({selectedAddonsList.length}):</span>
					{#each selectedAddonsList as addon}
						<div class="spread small muted" style="width: 100%; padding-left: 8px;">
							<span>+ {addon.name}</span>
							<span class="mono">{money(addon.priceCents)}</span>
						</div>
					{/each}
				</div>
			{/if}

			{#if kind === 'hotel' && (hotelExtraWalk || hotelExtraPlay || hotelExtraBath)}
				<div class="summary-item" style="flex-direction: column; align-items: flex-start; gap: 4px;">
					<span class="summary-label">Boarding Extras:</span>
					{#if hotelExtraWalk}<div class="spread small muted" style="width: 100%; padding-left: 8px;"><span>+ Extra Walk</span><span class="mono">{money(35000 * (nights || 1))}</span></div>{/if}
					{#if hotelExtraPlay}<div class="spread small muted" style="width: 100%; padding-left: 8px;"><span>+ Agility Play</span><span class="mono">{money(40000 * (nights || 1))}</span></div>{/if}
					{#if hotelExtraBath}<div class="spread small muted" style="width: 100%; padding-left: 8px;"><span>+ Pickup Bath</span><span class="mono">{money(95000)}</span></div>{/if}
				</div>
			{/if}

			<hr class="divider" style="margin: var(--sp-2) 0;" />

			<div class="summary-total-row">
				<span class="total-label">Estimated Total:</span>
				<span class="total-amount mono">{money(estTotal)}</span>
			</div>

			<div class="points-accrual-pill">
				<Sparkles size={13} />
				<span>Will earn <strong>+{estPoints}</strong> loyalty points</span>
			</div>
		</div>
	</aside>
</div>

<style>
	.wizard-layout {
		grid-template-columns: 1.8fr 1fr;
	}

	.service-type-cards {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--sp-3);
	}

	.type-card {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 14px;
		border-radius: var(--r-lg);
		border: 2px solid var(--border);
		background: var(--surface);
		cursor: pointer;
		text-align: left;
		position: relative;
		transition: all 140ms ease;
	}

	.type-card:hover {
		border-color: var(--primary-border);
		background: var(--surface-2);
	}

	.type-card.active {
		border-color: var(--primary);
		background: var(--primary-soft);
	}

	.type-icon {
		width: 40px;
		height: 40px;
		border-radius: var(--r-md);
		display: grid;
		place-items: center;
		flex-shrink: 0;
	}

	.purple-tint { background: var(--purple-bg); color: var(--purple); }
	.blue-tint { background: var(--info-bg); color: var(--info); }
	.green-tint { background: var(--teal-bg); color: var(--teal); }

	.type-text {
		flex: 1;
		min-width: 0;
	}

	.type-title {
		font-size: 13.5px;
		font-weight: 700;
		color: var(--ink);
	}

	.type-desc {
		font-size: 11px;
		color: var(--muted);
		margin-top: 1px;
	}

	.check-pill {
		width: 20px;
		height: 20px;
		border-radius: var(--r-full);
		background: var(--primary);
		color: #ffffff;
		display: grid;
		place-items: center;
		position: absolute;
		right: 8px;
		top: 8px;
	}

	.check-pill-sm {
		width: 18px;
		height: 18px;
		border-radius: var(--r-full);
		background: var(--primary);
		color: #ffffff;
		display: grid;
		place-items: center;
		position: absolute;
		right: 10px;
		top: 10px;
	}

	.pet-cards-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--sp-2);
		margin-top: 6px;
	}

	.pet-select-card {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		border-radius: var(--r-md);
		border: 1.5px solid var(--border);
		background: var(--surface);
		cursor: pointer;
		text-align: left;
		position: relative;
		transition: all 130ms ease;
	}

	.pet-select-card:hover {
		border-color: var(--border-strong);
		background: var(--surface-2);
	}

	.pet-select-card.active {
		border-color: var(--primary);
		background: var(--primary-soft);
	}

	.pet-select-emoji {
		font-size: 24px;
		line-height: 1;
	}

	.pet-select-info {
		min-width: 0;
		flex: 1;
	}

	.pet-select-name {
		font-size: 13.5px;
		font-weight: 700;
		color: var(--ink);
	}

	.pet-select-sub {
		font-size: 11.5px;
		color: var(--muted);
	}

	.addon-checkbox-card {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 10px 12px;
		border-radius: var(--r-md);
		border: 1px solid var(--border);
		background: var(--surface-2);
		cursor: pointer;
		transition: all 130ms ease;
	}

	.addon-checkbox-card:hover {
		background: var(--surface);
		border-color: var(--primary-border);
	}

	.addon-checkbox-card.active {
		border-color: var(--primary);
		background: var(--primary-soft);
	}

	.addon-checkbox-card input {
		margin-top: 3px;
	}

	.slots-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(105px, 1fr));
		gap: 8px;
	}

	.slot-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 5px;
		padding: 7px 10px;
		border-radius: var(--r-md);
		border: 1.5px solid var(--border);
		background: var(--surface);
		color: var(--ink-2);
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		font-family: var(--font-mono);
		transition: all 120ms ease;
	}

	.slot-btn:hover {
		border-color: var(--primary-border);
		background: var(--primary-soft);
		color: var(--primary);
	}

	.slot-btn.active {
		border-color: var(--primary);
		background: var(--primary);
		color: #ffffff;
		box-shadow: 0 2px 8px rgba(79, 70, 229, 0.35);
	}

	.stay-calc-pill {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 14px;
		border-radius: var(--r-md);
		background: var(--info-bg);
		border: 1px solid var(--info-border);
		font-size: 13px;
		color: var(--info);
	}

	.order-summary-card {
		position: sticky;
		top: 24px;
	}

	.summary-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.summary-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 13px;
	}

	.summary-label {
		color: var(--muted);
	}

	.summary-value {
		color: var(--ink);
		text-align: right;
	}

	.summary-total-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		padding-top: 4px;
	}

	.total-label {
		font-size: 14px;
		font-weight: 700;
		color: var(--ink);
	}

	.total-amount {
		font-size: 22px;
		font-weight: 800;
		color: var(--primary);
	}

	.points-accrual-pill {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 10px;
		border-radius: var(--r-md);
		background: var(--amber-bg);
		border: 1px solid var(--amber-border);
		color: var(--amber);
		font-size: 11.5px;
		font-weight: 600;
	}

	@media (max-width: 960px) {
		.wizard-layout {
			grid-template-columns: 1fr;
		}
		.service-type-cards {
			grid-template-columns: 1fr;
		}
	}
</style>
