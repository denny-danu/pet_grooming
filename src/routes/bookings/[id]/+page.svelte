<script lang="ts">
	import { page } from "$app/state";
	import {
		ArrowLeft,
		CalendarCheck,
		Scissors,
		Hotel,
		Fish,
		BellRing,
		PackageCheck,
		Sparkles,
		CheckCircle2,
		XCircle,
		RefreshCcw,
		UserCheck,
		CircleSlash,
		CalendarDays,
		User,
		PawPrint,
		ShieldCheck,
		ShieldAlert,
		TriangleAlert,
		Syringe,
		Clock,
		Phone,
		Mail,
		DollarSign,
		Receipt,
		FileText,
		ChevronRight,
		ExternalLink,
		Check,
		Plus,
		X
	} from "@lucide/svelte";
	import { formatRupiah as money } from "$lib/util";
	let { data } = $props();
	const b = $derived(data.booking);
	const form = $derived(page.form);
	const actionError = $derived(form?.actionError);


	const fmtWhen = (d: Date | string) =>
		new Date(d).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	const fmtDay = (d: Date | string) =>
		new Date(d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
	const fmtTime = (d: Date | string) =>
		new Date(d).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
	const fmt = (s: string) => s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

	const statusTone = $derived((s: string) =>
		s === 'pending' ? 'status-pending'
			: s === 'checked_in' ? 'status-checked_in'
			: s === 'cancelled' || s === 'no_show' ? 'status-cancelled'
			: s === 'completed' ? 'status-valid'
			: 'status-confirmed'
	);

	const KindIcon = $derived(
		b?.kind === 'hotel' ? Hotel : b?.kind === 'aquarium' ? Fish : Scissors
	);

	const canAct = $derived(['pending', 'confirmed', 'checked_in'].includes(b?.status ?? ''));

	let reschedOpen = $state(false);
	let cancelOpen = $state(false);
	let reason = $state('');

	function initials(name: string | undefined | null) {
		return (name || '?').split(/\s+/).map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";
	}

	function vaxMeta(s: string | null | undefined) {
		if (s === 'valid') return { cls: 'badge-success', label: 'Vaccinated', Icon: ShieldCheck };
		if (s === 'expiring') return { cls: 'badge-warning', label: 'Vaccine due soon', Icon: TriangleAlert };
		if (s === 'expired') return { cls: 'badge-danger', label: 'Vaccine expired', Icon: ShieldAlert };
		return { cls: 'badge-neutral', label: 'No vax record', Icon: Syringe };
	}

	function getSpeciesEmoji(species: string | null | undefined) {
		if (species === 'cat') return '🐱';
		if (species === 'bird') return '🦜';
		if (species === 'fish') return '🐠';
		if (species === 'reptile') return '🦎';
		return '🐶';
	}

	const confirmDate = $derived(b?.confirmedAt ? fmtDay(b.confirmedAt) : '');
	const checkinDate = $derived(b?.checkedInAt ? fmtDay(b.checkedInAt) : '');
	const noShow = $derived(b?.status === 'no_show');
	const cancelled = $derived(b?.status === 'cancelled');
	const cancelledReason = $derived(b?.cancelReason ?? '');
</script>

<svelte:head>
	<title>Booking #{data.booking?.id ?? ''} · PetCo</title>
</svelte:head>

{#if data.notFound}
	<div class="empty-state" style="margin-top: 60px">
		<div class="empty-icon"><CalendarDays /></div>
		<h3>Booking not found</h3>
		<p>The requested booking ID could not be found or has been removed.</p>
		<a href="/bookings" class="btn btn-primary">Back to Schedule</a>
	</div>
{:else if b}
	<a href="/bookings" class="back-link">
		<ArrowLeft size={15} /> Back to Schedule
	</a>

	<div class="page-header">
		<div class="title-block">
			<div class="row gap-2" style="margin-bottom: 4px;">
				<span class="badge kind-{b.kind}">
					<KindIcon size={12} />
					{fmt(b.kind)}
				</span>
				<span class="badge {statusTone(b.status)}">
					<span class="dot"></span>
					{fmt(b.status)}
				</span>
			</div>
			<h1>Reservation #{b.id}</h1>
			<p class="subtitle">
				{b.pet ? `${b.pet.name} (${b.pet.breed ?? b.pet.species})` : 'Pet'} · {b.owner ? `${b.owner.firstName} ${b.owner.lastName}` : 'Client'}
			</p>
		</div>

		<div class="actions">
			{#if canAct}
				<form method="POST" action="?/sendReminder">
					<button class="btn" type="submit">
						<BellRing size={14} />
						<span>Send Reminder Alert</span>
					</button>
				</form>
			{/if}
			{#if b.owner}
				<a href="/customers/{b.owner.id}" class="btn btn-subtle">
					<User size={14} />
					<span>Customer Profile</span>
				</a>
			{/if}
		</div>
	</div>

	{#if actionError}
		<div class="alert alert-error" style="margin: 0 0 var(--sp-4)">
			<ShieldAlert />
			<span>{actionError}</span>
		</div>
	{/if}

	<!-- Visual Lifecycle Stepper -->
	<section class="card mb" style="padding: var(--sp-4) var(--sp-6);">
		<div class="flow-container">
			<div class="flow-step" class:on={['confirmed', 'checked_in', 'completed'].includes(b.status)}>
				<div class="flow-circle">
					<CheckCircle2 size={16} />
				</div>
				<div class="flow-meta">
					<div class="flow-title">Confirmed</div>
					<div class="flow-time">{confirmDate ? confirmDate : 'Created'}</div>
				</div>
			</div>

			<div class="flow-line" class:on={['checked_in', 'completed'].includes(b.status)}></div>

			<div class="flow-step" class:on={['checked_in', 'completed'].includes(b.status)}>
				<div class="flow-circle">
					<UserCheck size={16} />
				</div>
				<div class="flow-meta">
					<div class="flow-title">Checked In</div>
					<div class="flow-time">{checkinDate ? checkinDate : (b.status === 'checked_in' ? 'In progress' : 'Awaiting arrival')}</div>
				</div>
			</div>

			<div class="flow-line" class:on={b.status === 'completed'}></div>

			<div class="flow-step" class:on={b.status === 'completed'}>
				<div class="flow-circle">
					<Sparkles size={16} />
				</div>
				<div class="flow-meta">
					<div class="flow-title">Completed</div>
					<div class="flow-time">{b.status === 'completed' ? 'Done' : 'Pending completion'}</div>
				</div>
			</div>
		</div>

		{#if noShow}
			<div class="alert alert-error" style="margin: var(--sp-3) 0 0;">
				<CircleSlash />
				<span>Customer marked as No-Show. No-show fee policy applied.</span>
			</div>
		{/if}

		{#if cancelled}
			<div class="alert alert-error" style="margin: var(--sp-3) 0 0;">
				<XCircle />
				<span>Reservation cancelled.{#if cancelledReason} Reason: “{cancelledReason}”{/if}</span>
			</div>
		{/if}
	</section>

	<div class="grid cols-3 booking-grid" style="align-items: start">
		<!-- 1. Appointment Details Card -->
		<section class="card">
			<div class="card-head">
				<h2>
					<CalendarCheck size={16} />
					Appointment Details
				</h2>
			</div>
			<div class="card-body">
				<div class="time-hero-box">
					<div class="time-hero-label">Scheduled Time</div>
					<div class="time-hero-val mono">{fmtWhen(b.startsAt)}</div>
					<div class="time-hero-sub mono">End: {fmtWhen(b.endsAt)}</div>
				</div>

				<div class="kv-list">
					{#if b.service}
						<div class="kv-item">
							<span class="kv-label">Service</span>
							<span class="kv-val cell-strong">{b.service.name} ({b.service.durationMinutes}m)</span>
						</div>
					{/if}

					{#if b.room}
						<div class="kv-item">
							<span class="kv-label">Room / Suite</span>
							<span class="kv-val cell-strong">{b.room.name} ({b.room.sizeLabel ?? 'Suite'})</span>
						</div>
					{/if}

					{#if b.staff}
						<div class="kv-item">
							<span class="kv-label">Assigned Groomer</span>
							<span class="kv-val">{b.staff.name}</span>
						</div>
					{/if}

					{#if b.stay}
						<div class="kv-item">
							<span class="kv-label">Stay Duration</span>
							<span class="kv-val mono">{fmtDay(b.stay.checkInDate)} → {fmtDay(b.stay.checkOutDate)} ({b.stay.nightCount} nights)</span>
						</div>
					{/if}
					<!-- Addons breakdown if present -->
					{#if data.addons && data.addons.length > 0}
						<div class="addons-breakdown-box">
							<div class="tiny faint font-semibold" style="margin-bottom: 4px;">SELECTED ADD-ONS:</div>
							{#each data.addons as a}
								<div class="kv-item small">
									<span class="muted">+ {a.name} ({a.durationMinutes}m)</span>
									<span class="mono cell-strong">{money(a.priceCents)}</span>
								</div>
							{/each}
						</div>
					{/if}

					<div class="kv-item" style="padding-top: 6px; border-top: 1px solid var(--border-subtle);">
						<span class="kv-label font-bold">Total Price</span>
						<span class="kv-val mono cell-strong text-primary" style="font-size: 15px;">{money(b.priceCents)}</span>
					</div>
					{#if b.depositCents > 0}
						<div class="kv-item">
							<span class="kv-label">Deposit Paid</span>
							<span class="kv-val mono text-success">{money(b.depositCents)}</span>
						</div>
					{/if}

					{#if b.notes}
						<div class="notes-callout">
							<div class="notes-header"><FileText size={12} /> Special Instructions:</div>
							<p class="notes-text">{b.notes}</p>
						</div>
					{/if}
				</div>
			</div>
		</section>

		<!-- 2. Customer & Pet Dossier Card -->
		<section class="card">
			<div class="card-head">
				<h2>
					<User size={16} />
					Customer &amp; Pet
				</h2>
			</div>
			<div class="card-body">
				{#if b.owner}
					<div class="client-box">
						<span class="avatar lg">{initials(`${b.owner.firstName} ${b.owner.lastName}`)}</span>
						<div class="client-meta">
							<a href="/customers/{b.owner.id}" class="client-name cell-link">
								{b.owner.firstName} {b.owner.lastName}
							</a>
							<div class="client-contact mono small">
								<Phone size={12} /> {b.owner.phone}
							</div>
							{#if b.owner.email}
								<div class="client-contact small">
									<Mail size={12} /> {b.owner.email}
								</div>
							{/if}
						</div>
					</div>
				{/if}

				{#if b.pet}
					{@const vi = vaxMeta(data.petVax)}
					{@const VaxIcon = vi.Icon}
					<div class="pet-dossier-box">
						<div class="pet-dossier-top">
							<span class="pet-dossier-emoji">{getSpeciesEmoji(b.pet.species)}</span>
							<div class="pet-dossier-title">
								<div class="cell-strong">{b.pet.name}</div>
								<div class="small muted">{b.pet.breed ?? b.pet.species}{b.pet.weightKg ? ` · ${b.pet.weightKg}kg` : ''}</div>
							</div>
						</div>

						<div class="vax-status-bar">
							<span class="badge {vi.cls}">
								<VaxIcon size={12} />
								{vi.label}
							</span>
							{#if b.pet.vaccinationDueDate}
								<span class="tiny muted mono">Due: {fmtDay(b.pet.vaccinationDueDate)}</span>
							{/if}
						</div>
						<!-- Grooming Cut Card / Styling Blueprint Preview -->
						{#if b.kind === 'grooming'}
							<div class="cut-card-preview-box" style="margin-top: 10px; padding: 10px; background: var(--purple-bg); border: 1px solid var(--purple-border); border-radius: var(--r-md);">
								<div class="spread" style="margin-bottom: 4px;">
									<div class="row gap-1" style="font-size: 11.5px; font-weight: 700; color: var(--purple);">
										<Scissors size={12} />
										<span>Styling Cut Blueprint</span>
									</div>
									<a href="/grooming-cuts" class="tiny cell-link font-semibold">View All</a>
								</div>
								{#if data.cutCard}
									<div class="small" style="color: var(--ink);">
										<span class="cell-strong">{data.cutCard.bladeLengthBody || 'Standard Cut'}</span>
										{#if data.cutCard.bladeLengthFace}<div class="tiny muted">{data.cutCard.bladeLengthFace}</div>{/if}
									</div>
								{:else}
									<div class="tiny muted" style="margin-bottom: 6px;">No cut card recorded yet for this pet.</div>
									<a href="/grooming-cuts" class="btn btn-sm btn-subtle" style="width: 100%; font-size: 11px;">
										<Plus size={12} /> <span>Record Styling Specs</span>
									</a>
								{/if}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</section>

		<!-- 3. Membership & Package Rewards Card -->
		<section class="card">
			<div class="card-head">
				<h2>
					<Sparkles size={16} />
					Loyalty &amp; Packages
				</h2>
			</div>
			<div class="card-body">
				<div class="loyalty-badge-card">
					<div class="spread">
						<span class="badge tier-{data.membership?.tier ?? 'silver'}">
							{data.membership?.tier ? data.membership.tier.toUpperCase() : 'SILVER TIER'}
						</span>
						<span class="mono cell-strong" style="font-size: 16px;">
							{data.membership?.pointsBalance ?? 0} <span class="tiny muted" style="font-weight: 500;">pts</span>
						</span>
					</div>
				</div>

				<form method="POST" action="?/earnPoints" style="margin-top: var(--sp-4);">
					<button class="btn btn-subtle" style="width: 100%;" type="submit">
						<Sparkles size={14} />
						<span>Award {b.priceCents ? Math.floor(b.priceCents / 1000) : 0} Points</span>
					</button>
				</form>

				{#if b.status === 'confirmed' && b.kind !== 'aquarium'}
					<form method="POST" action="?/redeemPackage" style="margin-top: 8px;">
						<button class="btn btn-ghost" style="width: 100%; border: 1px dashed var(--border-strong);" type="submit">
							<PackageCheck size={14} />
							<span>Apply Prepaid Package Credit</span>
						</button>
					</form>
				{/if}
			</div>
		</section>
	</div>

	<!-- Operational Actions Panel -->
	<section class="card" style="margin-top: var(--sp-5);">
		<div class="card-head">
			<h2>Front Desk Actions</h2>
		</div>
		<div class="card-body">
			{#if !canAct}
				<div class="empty-state" style="padding: var(--sp-4);">
					<p class="small muted">This booking is closed ({b.status}). No further actions are available.</p>
				</div>
			{:else}
				<div class="grid cols-3 action-cards-grid">
					{#if b.status === 'confirmed' || b.status === 'pending'}
						<form method="POST" action="?/checkin" class="action-card primary-action">
							<button class="btn btn-primary btn-lg" style="width: 100%;" type="submit">
								<UserCheck size={16} />
								<span>Check In Pet</span>
							</button>
							<p class="tiny muted" style="margin: 8px 0 0; text-align: center;">
								Confirms arrival &amp; verifies vaccine compliance gate.
							</p>
						</form>

						<form method="POST" action="?/complete" class="action-card">
							<button class="btn" style="width: 100%;" type="submit">
								<CheckCircle2 size={15} />
								<span>Mark Completed</span>
							</button>
							<p class="tiny muted" style="margin: 8px 0 0; text-align: center;">
								Complete visit &amp; finalize bill.
							</p>
						</form>

						<form method="POST" action="?/noshow" class="action-card">
							<button class="btn btn-danger" style="width: 100%;" type="submit">
								<CircleSlash size={15} />
								<span>Report No-Show</span>
							</button>
							<p class="tiny muted" style="margin: 8px 0 0; text-align: center;">
								Customer failed to arrive ({money(50000)} fee).
							</p>
						</form>
					{/if}

					{#if b.status === 'checked_in'}
						<form method="POST" action="?/checkout" class="action-card primary-action" style="grid-column: span 3;">
							<button class="btn btn-primary btn-lg" style="width: 100%;" type="submit">
								<CheckCircle2 size={16} />
								<span>Check Out &amp; Complete Visit</span>
							</button>
							<p class="tiny muted" style="margin: 8px 0 0; text-align: center;">
								Releases suite / salon station and registers checkout.
							</p>
						</form>
					{/if}
				</div>

				<hr class="divider" />

				<!-- Secondary Actions -->
				<div class="spread">
					<div class="row gap-2">
						<button class="btn" type="button" onclick={() => { reschedOpen = !reschedOpen; cancelOpen = false; }}>
							<RefreshCcw size={14} />
							<span>Reschedule Appointment</span>
						</button>
						<button class="btn btn-danger" type="button" onclick={() => { cancelOpen = !cancelOpen; reschedOpen = false; }}>
							<XCircle size={14} />
							<span>Cancel Booking</span>
						</button>
					</div>
				</div>

				<!-- Reschedule Drawer -->
				{#if reschedOpen}
					<form method="POST" action="?/reschedule" class="reveal-panel">
						<h3 style="margin-bottom: var(--sp-2);">Reschedule Appointment</h3>
						<p class="small muted" style="margin: 0 0 var(--sp-3);">Choose new start and finish dates/times for this booking.</p>
						<div class="grid cols-2" style="max-width: 540px;">
							<div class="field">
								<label for="rs1">New Start Time <span class="req">*</span></label>
								<input id="rs1" name="start" type="datetime-local" required />
							</div>
							<div class="field">
								<label for="rs2">New End Time <span class="req">*</span></label>
								<input id="rs2" name="end" type="datetime-local" required />
							</div>
						</div>
						<div class="row gap-2" style="margin-top: var(--sp-2);">
							<button class="btn btn-primary" type="submit">
								<RefreshCcw size={14} />
								<span>Save New Schedule</span>
							</button>
							<button class="btn" type="button" onclick={() => reschedOpen = false}>
								<X size={14} />
								<span>Cancel</span>
							</button>
						</div>
					</form>
				{/if}

				<!-- Cancel Drawer -->
				{#if cancelOpen}
					<form method="POST" action="?/cancel" class="reveal-panel danger-panel">
						<h3 style="margin-bottom: var(--sp-2); color: var(--danger);">Confirm Cancellation</h3>
						<div class="field" style="max-width: 520px;">
							<label for="reason">Reason for Cancellation</label>
							<input id="reason" name="reason" bind:value={reason} placeholder="e.g. Owner requested date change" />
						</div>
						<div class="row gap-2" style="margin-top: var(--sp-2);">
							<button class="btn btn-danger" type="submit">
								<XCircle size={14} />
								<span>Yes, Cancel Reservation</span>
							</button>
							<button class="btn" type="button" onclick={() => cancelOpen = false}>
								<Check size={14} />
								<span>Keep Active</span>
							</button>
						</div>
					</form>
				{/if}
			{/if}
		</div>
	</section>
{/if}

<style>
	.booking-grid {
		grid-template-columns: 1.35fr 1fr 1fr;
		gap: var(--sp-4);
	}

	.flow-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: relative;
	}

	.flow-step {
		display: flex;
		align-items: center;
		gap: 10px;
		color: var(--muted);
	}

	.flow-step.on {
		color: var(--ink);
	}

	.flow-circle {
		width: 34px;
		height: 34px;
		border-radius: var(--r-full);
		background: var(--surface-3);
		border: 1.5px solid var(--border);
		display: grid;
		place-items: center;
		color: var(--muted);
		flex-shrink: 0;
		transition: all 140ms ease;
	}

	.flow-step.on .flow-circle {
		background: var(--success-bg);
		border-color: var(--success-border);
		color: var(--success);
		box-shadow: 0 0 0 4px #ecfdf5;
	}

	.flow-meta {
		display: flex;
		flex-direction: column;
	}

	.flow-title {
		font-size: 13.5px;
		font-weight: 700;
	}

	.flow-time {
		font-size: 11.5px;
		color: var(--muted);
	}

	.flow-line {
		flex: 1;
		height: 2px;
		background: var(--border);
		margin: 0 14px;
		transition: background 140ms ease;
	}

	.flow-line.on {
		background: var(--success);
	}

	.time-hero-box {
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--r-md);
		padding: 12px 14px;
		margin-bottom: var(--sp-3);
	}

	.time-hero-label {
		font-size: 10.5px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 700;
		color: var(--muted);
		margin-bottom: 2px;
	}

	.time-hero-val {
		font-size: 15px;
		font-weight: 700;
		color: var(--ink);
	}

	.time-hero-sub {
		font-size: 12px;
		color: var(--muted);
		margin-top: 2px;
	}

	.kv-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.kv-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 13px;
	}

	.kv-label {
		color: var(--muted);
	}

	.kv-val {
		text-align: right;
	}

	.text-primary { color: var(--primary); }
	.text-success { color: var(--success); }

	.notes-callout {
		background: var(--amber-bg);
		border: 1px solid var(--amber-border);
		border-radius: var(--r-md);
		padding: 10px 12px;
		margin-top: var(--sp-2);
	}

	.notes-header {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 11.5px;
		font-weight: 700;
		color: var(--amber);
		margin-bottom: 3px;
	}

	.notes-text {
		margin: 0;
		font-size: 12.5px;
		color: var(--ink-2);
		line-height: 1.4;
	}

	.client-box {
		display: flex;
		align-items: center;
		gap: 12px;
		padding-bottom: var(--sp-3);
		border-bottom: 1px solid var(--border);
		margin-bottom: var(--sp-3);
	}

	.client-name {
		font-size: 14.5px;
		font-weight: 700;
	}

	.client-contact {
		display: flex;
		align-items: center;
		gap: 5px;
		color: var(--muted);
		margin-top: 2px;
	}

	.pet-dossier-box {
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--r-md);
		padding: 12px;
	}

	.pet-dossier-top {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.pet-dossier-emoji {
		font-size: 26px;
		line-height: 1;
	}

	.vax-status-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 10px;
		padding-top: 8px;
		border-top: 1px dashed var(--border);
	}

	.loyalty-badge-card {
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--r-md);
		padding: 12px 14px;
	}

	.action-cards-grid {
		gap: var(--sp-3);
	}

	.action-card {
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--r-lg);
		padding: var(--sp-4);
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.reveal-panel {
		margin-top: var(--sp-4);
		padding: var(--sp-4);
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--r-lg);
	}

	.danger-panel {
		background: var(--danger-bg);
		border-color: var(--danger-border);
	}

	@media (max-width: 1024px) {
		.booking-grid {
			grid-template-columns: 1fr;
		}
		.flow-container {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--sp-3);
		}
		.flow-line {
			display: none;
		}
	}
</style>
