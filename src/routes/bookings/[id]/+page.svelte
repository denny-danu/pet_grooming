<script lang="ts">
	import { page } from "$app/state";
	import {
		ArrowLeft, CalendarCheck, Scissors, Hotel, BellRing, PackageCheck,
		Sparkles, CheckCircle2, XCircle, RefreshCcw, UserCheck, CircleSlash,
		CalendarDays, User, PawPrint, ShieldCheck, ShieldAlert, TriangleAlert,
		Syringe
	} from "@lucide/svelte";
	let { data } = $props();
	const b = $derived(data.booking);
	const form = $derived(page.form);
	const actionError = $derived(form?.actionError);
	const money = (c: number | null) => `$${((c ?? 0) / 100).toFixed(2)}`;
	const fmtWhen = (d: Date) => new Date(d).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	const fmtDay = (d: Date | string) => new Date(d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
	const fmt = (s: string) => s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	const statusTone = (s: string) => (s === 'pending' ? 'status-pending' : s === 'checked_in' ? 'status-checked_in' : s === 'cancelled' || s === 'no_show' ? 'status-cancelled' : s === 'completed' ? 'status-valid' : 'status-confirmed');
	const KindIcon = b?.kind === 'hotel' ? Hotel : b?.kind === 'aquarium' ? CalendarCheck : Scissors;
	const canAct = $derived(['pending', 'confirmed', 'checked_in'].includes(b?.status ?? ''));
	let reschedOpen = $state(false);
	let cancelOpen = $state(false);
	let reason = $state('');
	const init = (name: string, last = false) => (name || '?').charAt(0).toUpperCase();
	function vaxMeta(s: string | null | undefined) {
		if (s === 'valid') return { cls: 'status-valid', label: 'Vaccinated', Icon: ShieldCheck };
		if (s === 'expiring') return { cls: 'status-pending', label: 'Vaccine due soon', Icon: TriangleAlert };
		if (s === 'expired') return { cls: 'status-cancelled', label: 'Vaccine expired', Icon: ShieldAlert };
		return { cls: 'badge-neutral', label: 'No vax record', Icon: Syringe };
	}
	const confirmDate = $derived(b?.confirmedAt ? fmtDay(b.confirmedAt) : '');
	const checkinDate = $derived(b?.checkedInAt ? fmtDay(b.checkedInAt) : '');
	const noShow = $derived(b?.status === 'no_show');
	const cancelled = $derived(b?.status === 'cancelled');
	const cancelledReason = $derived(b?.cancelReason ?? '');
</script>

<svelte:head><title>Booking #{data.booking?.id ?? ''} · PetCo</title></svelte:head>

{#if data.notFound}
	<div class="empty-state" style="margin-top: 60px">
		<div class="empty-icon"><CalendarDays /></div>
		<h3>Booking not found</h3>
		<p>It may have been removed.</p>
		<a href="/bookings"><button class="btn">Back to bookings</button></a>
	</div>
{:else if b}
<a href="/bookings" class="back-link"><ArrowLeft size={15} /> Bookings</a>

<div class="page-header">
	<div class="title-block">
		<div class="kicker">
			<span class="badge kind-{b.kind}"><svelte:component this={KindIcon} size={12} /> {fmt(b.kind)}</span>
		</div>
		<h1>Booking #{b.id}</h1>
		<p><span class="badge {statusTone(b.status)}"><span class="dot"></span> {fmt(b.status)}</span></p>
	</div>
	<div class="actions">
		<a href="/customers/{b.ownerId}"><button class="btn">View customer</button></a>
	</div>
</div>

{#if actionError}<div class="alert alert-error" style="margin: 0 0 var(--sp-4)">{actionError}</div>{/if}

<div class="grid cols-3 booking-grid" style="align-items: start">
	<!-- main detail -->
	<section class="card">
		<div class="card-head"><h2>Appointment</h2></div>
		<div class="card-body">
			<div class="time-block">
				<div class="time-label">When</div>
				<div class="time-range mono">{fmtWhen(b.startsAt)} – {fmtWhen(b.endsAt)}</div>
			</div>
			<div class="kv">
				{#if b.service}<div class="kv-r"><span class="kv-l">Service</span><span>{b.service.name}</span></div>{/if}
				{#if b.room}<div class="kv-r"><span class="kv-l">Suite</span><span>{b.room.name}{b.room.maxPetWeightKg ? ` · up to ${b.room.maxPetWeightKg} kg` : ''}</span></div>{/if}
				{#if b.staff}<div class="kv-r"><span class="kv-l">Groomer</span><span>{b.staff.name}</span></div>{/if}
				{#if b.stay}<div class="kv-r"><span class="kv-l">Stay</span><span>{fmtDay(b.stay.checkInDate)} → {fmtDay(b.stay.checkOutDate)} · {b.stay.nightCount} night(s)</span></div>{/if}
				<div class="kv-r"><span class="kv-l">Amount</span><span class="mono">{money(b.priceCents)}</span></div>
				{#if b.depositCents > 0}<div class="kv-r"><span class="kv-l">Deposit</span><span class="tiny muted">{money(b.depositCents)} paid</span></div>{/if}
				{#if b.notes}<div class="kv-r"><span class="kv-l">Notes</span><span>{b.notes}</span></div>{/if}
			</div>
		</div>
	</section>

	<!-- customer + pet -->
	<section class="card">
		<div class="card-head"><h2><User size={15} /> Customer &amp; pet</h2></div>
		<div class="card-body">
			<div class="person"><span class="avatar lg">{b.owner ? init(b.owner.firstName) + init(b.owner.lastName, true) : '?'}</span>
				<div>
					<div class="cell-strong">{b.owner ? `${b.owner.firstName} ${b.owner.lastName}` : '—'}</div>
					{#if b.owner}<div class="cell-sub">{b.owner.phone}</div>{/if}
				</div>
			</div>
			{#if b.pet}
				{@const vi = vaxMeta(data.petVax)}
				<div class="pet-block">
					<div class="pet-row2"><PawPrint size={15} /> {b.pet.name} <span class="tiny muted">{b.pet.species}{b.pet.breed ? ` · ${b.pet.breed}` : ''}</span></div>
					<div class="vax-badge"><span class="badge {vi.cls}"><svelte:component this={vi.Icon} size={12} /> {vi.label}</span>
						{#if b.pet.vaccinationDueDate}<span class="tiny muted">due {fmtDay(b.pet.vaccinationDueDate)}</span>{/if}
					</div>
				</div>
			{/if}
		</div>
	</section>

	<!-- membership + package -->
	<section class="card">
		<div class="card-head"><h2><Sparkles size={15} /> Membership</h2></div>
		<div class="card-body">
			<div class="member">
				<span class="badge {data.membership?.tier === 'gold' ? 'badge-warning' : data.membership?.tier === 'platinum' ? 'badge-purple' : 'badge-neutral'}">{data.membership?.tier ?? 'silver'}</span>
				<span class="points mono">{data.membership?.pointsBalance ?? 0}</span>
				<span class="tiny faint">points</span>
			</div>
			<form method="POST" action="?/earnPoints" style="margin-top: var(--sp-3)">
				<button class="btn btn-sm btn-primary" type="submit"><Sparkles size={13} /> Earn {b.priceCents ? Math.floor(b.priceCents / 100) : 0} points</button>
			</form>
			{#if b.status === 'confirmed' && b.kind !== 'aquarium'}
				<form method="POST" action="?/redeemPackage" style="margin-top: 8px">
					<button class="btn btn-sm" type="submit"><PackageCheck size={13} /> Redeem package credit</button>
				</form>
			{/if}
		</div>
	</section>
</div>

<!-- state flow -->
<section class="card" style="margin-top: var(--sp-4)">
	<div class="card-head"><h2><CalendarCheck size={15} /> Flow</h2></div>
	<div class="card-body">
		<div class="flow">
			<div class="flow-step" class:on={['confirmed', 'checked_in', 'completed', 'no_show'].includes(b.status)}><CheckCircle2 size={14} /> Confirmed{#if confirmDate}<span class="tiny faint"> · {confirmDate}</span>{/if}</div>
			<div class="flow-line" class:on={['checked_in', 'completed'].includes(b.status)}></div>
			<div class="flow-step" class:on={['checked_in', 'completed'].includes(b.status)}><UserCheck size={14} /> Checked in{#if checkinDate}<span class="tiny faint"> · {checkinDate}</span>{/if}</div>
			<div class="flow-line" class:on={b.status === 'completed'}></div>
			<div class="flow-step" class:on={b.status === 'completed'}><CheckCircle2 size={14} /> Completed</div>
		</div>
		{#if noShow}
			<div style="margin-top: var(--sp-2)"><span class="badge status-cancelled"><CircleSlash size={12} /> Marked no-show</span></div>
		{/if}
		{#if cancelled}
			<div style="margin-top: var(--sp-2)"><span class="badge status-cancelled"><XCircle size={12} /> Cancelled{#if cancelledReason} · {cancelledReason}{/if}</span></div>
		{/if}
	</div>
</section>

<!-- actions -->
<section class="card" style="margin-top: var(--sp-4)">
	<div class="card-head">
		<h2>Actions</h2>
		{#if canAct}
			<div class="row">
				<form method="POST" action="?/sendReminder"><button class="btn btn-sm"><BellRing size={14} /> Send reminder</button></form>
			</div>
		{/if}
	</div>
	<div class="card-body">
		{#if !canAct}
			<p class="small muted">This booking is closed. No further actions are available.</p>
		{:else}
		<div class="action-grid">
			{#if b.status === 'confirmed' || b.status === 'pending'}
				<form method="POST" action="?/checkin">
					<button class="btn btn-primary" type="submit"><UserCheck size={15} /> Check in</button>
					<p class="tiny faint" style="margin: 6px 0 0">Confirms arrival &amp; verifies vaccination.</p>
				</form>
				<form method="POST" action="?/complete">
					<button class="btn" type="submit"><CheckCircle2 size={15} /> Mark completed</button>
					<p class="tiny faint" style="margin: 6px 0 0">When the visit is done without check-in.</p>
				</form>
				<form method="POST" action="?/noshow">
					<button class="btn" type="submit"><CircleSlash size={15} /> No-show</button>
					<p class="tiny faint" style="margin: 6px 0 0">Customer never arrived; fee {money(2500)}.</p>
				</form>
			{/if}
			{#if b.status === 'checked_in'}
				<form method="POST" action="?/checkout">
					<button class="btn btn-primary" type="submit"><CheckCircle2 size={15} /> Check out</button>
					<p class="tiny faint" style="margin: 6px 0 0">Completes the stay / visit.</p>
				</form>
			{/if}
		</div>

		<hr class="divider" />

		<div class="row" style="justify-content: space-between">
			<div class="row">
				<button class="btn" onclick={() => { reschedOpen = !reschedOpen; cancelOpen = false; }}><RefreshCcw size={14} /> Reschedule</button>
				<button class="btn btn-danger" onclick={() => { cancelOpen = !cancelOpen; reschedOpen = false; }}><XCircle size={14} /> Cancel booking</button>
			</div>
		</div>

		{#if reschedOpen}
			<form method="POST" action="?/reschedule" class="reveal">
				<div class="grid cols-2" style="max-width: 520px">
					<div class="field"><label for="rs1">New start</label><input id="rs1" name="start" type="datetime-local" required /></div>
					<div class="field"><label for="rs2">New end</label><input id="rs2" name="end" type="datetime-local" required /></div>
				</div>
				<div class="row">
					<button class="btn btn-primary" type="submit"><RefreshCcw size={14} /> Save new time</button>
					<button class="btn" type="button" onclick={() => reschedOpen = false}>Cancel</button>
				</div>
			</form>
		{/if}

		{#if cancelOpen}
			<form method="POST" action="?/cancel" class="reveal">
				<div class="field" style="max-width: 480px">
					<label for="reason">Reason for cancellation</label>
					<input id="reason" name="reason" bind:value={reason} placeholder="e.g. customer request" />
				</div>
				<div class="row">
					<button class="btn btn-danger" type="submit"><XCircle size={14} /> Cancel booking</button>
					<button class="btn" type="button" onclick={() => cancelOpen = false}>Keep booking</button>
				</div>
			</form>
		{/if}
		{/if}
	</div>
</section>

<style>
	.back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; margin-bottom: var(--sp-4); color: var(--muted); }
	.booking-grid { grid-template-columns: 1.4fr 1fr 1fr; }
	.time-block { background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--r-md); padding: var(--sp-3); margin-bottom: var(--sp-3); }
	.time-label { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--faint); font-weight: 700; margin-bottom: 3px; }
	.time-range { font-size: 14px; font-weight: 600; }
	.kv { display: flex; flex-direction: column; gap: 7px; }
	.kv-r { display: flex; justify-content: space-between; gap: 12px; font-size: 13.5px; }
	.kv-l { color: var(--muted); }
	.person { display: flex; align-items: center; gap: 10px; }
	.pet-block { border-top: 1px dashed var(--border); margin-top: var(--sp-3); padding-top: var(--sp-3); }
	.pet-row2 { display: flex; align-items: center; gap: 7px; font-weight: 600; }
	.vax-badge { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
	.member { display: flex; align-items: center; gap: 8px; }
	.points { font-size: 18px; font-weight: 700; }
	.flow { display: flex; align-items: center; gap: 0; flex-wrap: wrap; }
	.flow-step { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; color: var(--faint); padding: 4px 6px; border-radius: 6px; white-space: nowrap; }
	.flow-step svg { color: var(--faint); }
	.flow-step.on { color: var(--ink); }
	.flow-step.on svg { color: var(--success); }
	.flow-line { width: 34px; height: 2px; background: var(--border); margin: 0 6px; flex-shrink: 0; }
	.flow-line.on { background: var(--success); }
	.action-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--sp-3); }
	.action-grid form { background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--r-md); padding: 12px; }
	.reveal { border: 1px solid var(--border); border-radius: var(--r-md); padding: var(--sp-4); margin-top: var(--sp-4); background: var(--surface-2); }
</style>
{/if}
