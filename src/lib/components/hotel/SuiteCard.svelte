<script lang="ts">
	import { enhance } from "$app/forms";
	import { formatRupiah as money } from "$lib/util";
	import { fmtDateStr, hasMedication, getMedicationText } from "$lib/ui/hotel";
	import PetAvatar from "$lib/components/PetAvatar.svelte";
	import {
		BedDouble,
		Circle,
		Check,
		Plus,
		MessageSquare,
		Phone,
		Calendar,
		Utensils,
		Footprints,
		Pill,
		Info,
		CheckCheck,
		CheckCircle2,
		FileText,
		Smile,
		AlertTriangle
	} from "@lucide/svelte";

	type Suite = {
		room: { id: number; name: string; sizeLabel?: string | null; capacity?: number | null; maxPetWeightKg?: string | null; pricePerNightCents: number };
		occupied: boolean;
		pet?: {
			name?: string | null;
			species?: string | null;
			breed?: string | null;
			weightKg?: string | null;
			aggressive?: boolean | null;
			allergies?: string | null;
			healthNotes?: string | null;
			behaviorNotes?: string | null;
			id?: number | null;
		} | null;
		owner?: { firstName?: string | null; lastName?: string | null; phone?: string | null } | null;
		stay?: {
			checkInDate?: string | null;
			checkOutDate?: string | null;
			nightCount?: number | null;
			petCareJson?: Record<string, unknown> | null;
		} | null;
		booking?: { id?: number | null; status?: string | null; notes?: string | null } | null;
		careLog?: {
			updatedAt?: Date | string | null;
			staffName?: string | null;
			feedingAmDone?: boolean | null;
			feedingPmDone?: boolean | null;
			walkAmDone?: boolean | null;
			walkPmDone?: boolean | null;
			medicationDone?: boolean | null;
			moodNotes?: string | null;
		} | null;
	};

	let {
		suite,
		selectedDate,
		onOpenNote
	}: {
		suite: Suite;
		selectedDate: string;
		onOpenNote: (suite: Suite) => void;
	} = $props();

	const careToggles = [
		{
			field: "feedingAmDone",
			icon: "🥣",
			label: "Makan Pagi (AM)",
			doneLabel: "Sudah Diberi",
			pendingLabel: "Belum Makan",
			stateClass: "state-am-feed",
			done: (s: Suite) => !!s.careLog?.feedingAmDone
		},
		{
			field: "feedingPmDone",
			icon: "🍲",
			label: "Makan Malam (PM)",
			doneLabel: "Sudah Diberi",
			pendingLabel: "Belum Makan",
			stateClass: "state-pm-feed",
			done: (s: Suite) => !!s.careLog?.feedingPmDone
		},
		{
			field: "walkAmDone",
			icon: "🦮",
			label: "Jalan Pagi (AM)",
			doneLabel: "Taman / Selesai",
			pendingLabel: "Belum Jalan",
			stateClass: "state-walk",
			done: (s: Suite) => !!s.careLog?.walkAmDone
		},
		{
			field: "walkPmDone",
			icon: "🌙",
			label: "Jalan Sore (PM)",
			doneLabel: "Taman / Selesai",
			pendingLabel: "Belum Jalan",
			stateClass: "state-walk",
			done: (s: Suite) => !!s.careLog?.walkPmDone
		},
		{
			field: "medicationDone",
			icon: "💊",
			label: "Pemberian Obat",
			doneLabel: "Obat Selesai",
			pendingLabel: "Belum Diminum",
			stateClass: "state-meds",
			done: (s: Suite) => !!s.careLog?.medicationDone
		}
	];
</script>

<div class="suite-card card {suite.occupied ? 'occupied-suite' : 'vacant-suite'}">
	<div class="suite-card-head">
		<div class="suite-head-left">
			<div class="suite-name-row">
				<span class="suite-title">{suite.room.name}</span>
				{#if suite.room.sizeLabel}
					<span class="badge badge-neutral size-badge">Size {suite.room.sizeLabel}</span>
				{/if}
			</div>
			<div class="suite-rate">
				{money(suite.room.pricePerNightCents)} <span class="rate-sub">/ malam</span>
			</div>
		</div>

		<div class="suite-head-right">
			{#if suite.occupied}
				<span class="badge badge-success occupancy-status-badge">
					<span class="pulse-dot-green"></span>
					<span>Terisi ({suite.pet?.name})</span>
				</span>
			{:else}
				<span class="badge badge-neutral vacant-status-badge">
					<Circle size={10} />
					<span>Kosong</span>
				</span>
			{/if}
		</div>
	</div>

	<div class="suite-card-body">
		{#if !suite.occupied}
			<div class="vacant-card-content">
				<div class="vacant-illustration"><BedDouble size={32} strokeWidth={1.4} /></div>
				<div class="vacant-title">Kamar Siap Digunakan</div>
				<div class="vacant-specs muted">
					Kapasitas: {suite.room.capacity} hewan · Maksimal:{' '}
					{suite.room.maxPetWeightKg ? `${suite.room.maxPetWeightKg} kg` : 'Semua Ukuran'}
				</div>
				<p class="vacant-desc">Suite sudah disterilkan dan siap untuk penitipan hewan baru.</p>
				<a href="/bookings/new?roomId={suite.room.id}&kind=hotel" class="btn btn-sm btn-subtle vacant-book-btn">
					<Plus size={14} />
					<span>Buat Reservasi Suite</span>
				</a>
			</div>
		{:else}
			<div class="pet-profile-section">
				<div class="pet-profile-top spread">
					<div class="row gap-3">
						<PetAvatar name={suite.pet?.name ?? undefined} species={suite.pet?.species ?? undefined} breed={suite.pet?.breed ?? undefined} size="lg" />
						<div class="pet-details-col">
							<div class="row gap-2" style="flex-wrap: wrap;">
								<span class="pet-name-lg">{suite.pet?.name}</span>
								{#if suite.pet?.weightKg}
									<span class="badge badge-neutral text-xs">{suite.pet.weightKg} kg</span>
								{/if}
								{#if suite.pet?.aggressive}
									<span class="badge badge-danger text-xs">
										<AlertTriangle size={11} />
										<span>Agresif / Perlu Perhatian</span>
									</span>
								{/if}
								{#if suite.pet?.allergies}
									<span class="badge badge-warning text-xs">🌾 Alergi: {suite.pet.allergies}</span>
								{/if}
							</div>
							<div class="pet-sub-meta muted">
								{suite.pet?.breed ?? suite.pet?.species ?? 'Hewan'} · Pemilik:{' '}
								<span class="ink-strong">{suite.owner?.firstName} {suite.owner?.lastName}</span>
							</div>
						</div>
					</div>

					{#if suite.owner?.phone}
						<div class="owner-contact-actions">
							<a
								href="https://wa.me/{suite.owner.phone.replace(/[^0-9]/g, '')}"
								target="_blank"
								rel="noreferrer"
								class="btn btn-sm btn-ghost contact-chip-wa"
								title="WhatsApp Pemilik ({suite.owner.phone})"
							>
								<MessageSquare size={13} />
								<span>WhatsApp</span>
							</a>
							<a href="tel:{suite.owner.phone}" class="btn btn-sm btn-ghost contact-chip-phone" title="Telepon Pemilik">
								<Phone size={13} />
							</a>
						</div>
					{/if}
				</div>

				<div class="stay-info-bar spread">
					<div class="stay-dates-text">
						<Calendar size={13} class="stay-icon" />
						<span>{fmtDateStr(suite.stay?.checkInDate)} → {fmtDateStr(suite.stay?.checkOutDate)}</span>
						<span class="stay-nights-badge">({suite.stay?.nightCount ?? 1} malam)</span>
					</div>
					<div class="booking-status-chip">
						{#if suite.booking?.status === 'checked_in'}
							<span class="badge badge-info"><Check size={11} /><span>Checked-In</span></span>
						{:else}
							<span class="badge badge-success"><span>{suite.booking?.status ?? 'Confirmed'}</span></span>
						{/if}
					</div>
				</div>
			</div>

			<div class="care-protocol-box">
				<div class="protocol-grid">
					<div class="protocol-item">
						<span class="protocol-lbl"><Utensils size={13} /><span>Porsi &amp; Jadwal Makan</span></span>
						<span class="protocol-val">
							{(suite.stay?.petCareJson as { feeding?: string } | null | undefined)?.feeding ||
								'Standar 2x sehari (08:00 & 18:00)'}
						</span>
					</div>
					<div class="protocol-item">
						<span class="protocol-lbl"><Footprints size={13} /><span>Jadwal Jalan / Lari</span></span>
						<span class="protocol-val">
							{(suite.stay?.petCareJson as { walksPerDay?: number } | null | undefined)?.walksPerDay ?? 2}x
							sehari di taman bermain
						</span>
					</div>
					<div class="protocol-item {hasMedication(suite) ? 'med-alert-item' : ''}">
						<span class="protocol-lbl"><Pill size={13} /><span>Instruksi Obat</span></span>
						<span class="protocol-val">{getMedicationText(suite)}</span>
					</div>
					{#if suite.pet?.behaviorNotes || suite.booking?.notes}
						<div class="protocol-item full-width">
							<span class="protocol-lbl"><Info size={13} /><span>Catatan Karakter / Perilaku</span></span>
							<span class="protocol-val">{suite.pet?.behaviorNotes || suite.booking?.notes}</span>
						</div>
					{/if}
				</div>
			</div>

			<div class="care-checklist-section">
				<div class="checklist-header spread">
					<div class="checklist-title">
						<CheckCheck size={14} />
						<span>Checklist Harian Perawatan ({selectedDate})</span>
					</div>
					{#if suite.careLog?.updatedAt}
						<div class="last-log-time tiny muted">
							Diupdate:{' '}
							{new Date(suite.careLog.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}{' '}
							WIB{#if suite.careLog.staffName} oleh {suite.careLog.staffName}{/if}
						</div>
					{/if}
				</div>

				<div class="checklist-buttons-grid">
					{#each careToggles as toggle}
						<form method="POST" action="?/toggleCare" use:enhance class="checklist-form">
							<input type="hidden" name="bookingId" value={suite.booking?.id} />
							<input type="hidden" name="petId" value={suite.pet?.id} />
							<input type="hidden" name="careDate" value={selectedDate} />
							<input type="hidden" name="field" value={toggle.field} />
							<input
								type="hidden"
								name="currentValue"
								value={toggle.done(suite) ? 'true' : 'false'}
							/>
							<button
								type="submit"
								class="care-toggle-btn {toggle.done(suite) ? 'done ' + toggle.stateClass : 'pending'}"
							>
								<div class="toggle-icon-wrap">
									{#if toggle.done(suite)}
										<CheckCircle2 size={16} strokeWidth={2.4} />
									{:else}
										<Circle size={16} strokeWidth={1.8} />
									{/if}
								</div>
								<div class="toggle-text-wrap">
									<div class="toggle-main-label">{toggle.icon} {toggle.label}</div>
									<div class="toggle-status-label">{toggle.done(suite) ? toggle.doneLabel : toggle.pendingLabel}</div>
								</div>
							</button>
						</form>
					{/each}
				</div>
			</div>

			<div class="caretaker-notes-card">
				<div class="caretaker-notes-head spread">
					<div class="notes-head-title"><FileText size={14} /><span>Catatan Observasi Caretaker</span></div>
					<button type="button" class="btn btn-sm btn-subtle edit-note-btn" onclick={() => onOpenNote(suite)}>
						<Smile size={13} />
						<span>{suite.careLog?.moodNotes ? 'Ubah Catatan' : 'Tulis Catatan Harian'}</span>
					</button>
				</div>
				{#if suite.careLog?.moodNotes}
					<div class="mood-notes-body">
						<p class="notes-quote">“{suite.careLog.moodNotes}”</p>
						{#if suite.careLog.staffName}
							<div class="notes-author-meta">
								— Dicatat oleh <strong>{suite.careLog.staffName}</strong> (Caretaker)
							</div>
						{/if}
					</div>
				{:else}
					<div class="notes-empty-prompt">
						<Smile size={18} class="faint" />
						<span>Belum ada catatan mood &amp; observasi fisik untuk hari ini. Klik "Tulis Catatan Harian" untuk menambahkan.</span>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>



<style>
	.suite-card { display: flex; flex-direction: column; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); overflow: hidden; transition: box-shadow 140ms ease, border-color 140ms ease; }
	.suite-card:hover { box-shadow: var(--shadow-md); }
	.suite-card.occupied-suite { border-top: 3px solid var(--success); }
	.suite-card.vacant-suite { border-top: 3px solid var(--border-strong); }
	.suite-card-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; padding: 14px 18px; border-bottom: 1px solid var(--border); background: var(--surface-2); }
	.suite-name-row { display: flex; align-items: center; gap: 8px; min-width: 0; }
	.suite-title { font-size: 15px; font-weight: 700; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.size-badge { text-transform: uppercase; }
	.suite-rate { margin-top: 3px; font-size: 13px; font-weight: 700; color: var(--primary); }
	.rate-sub { font-size: 11px; color: var(--muted); font-weight: 500; }
	.pulse-dot-green { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.18); }
	.suite-card-body { padding: 18px; }
	.vacant-card-content { text-align: center; padding: 12px 8px; }
	.vacant-illustration { width: 52px; height: 52px; margin: 0 auto 12px; border-radius: var(--r-lg); background: var(--surface-3); display: grid; place-items: center; color: var(--muted); }
	.vacant-title { font-size: 14px; font-weight: 700; }
	.vacant-specs { font-size: 12px; margin-top: 4px; }
	.vacant-desc { font-size: 12.5px; color: var(--muted); max-width: 360px; margin: 8px auto 0; }
	.vacant-book-btn { margin-top: 12px; }
	.pet-profile-section { margin-bottom: 14px; }
	.pet-profile-top { gap: 12px; }
	.pet-details-col { min-width: 0; }
	.pet-name-lg { font-size: 17px; font-weight: 800; }
	.pet-sub-meta { font-size: 12.5px; margin-top: 4px; }
	.owner-contact-actions { display: flex; gap: 6px; flex-shrink: 0; }
	.contact-chip-wa { color: #128c7e; }
	.contact-chip-phone { color: var(--muted); }
	.stay-info-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 10px 12px; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--r-md); margin-top: 12px; }
	.stay-dates-text { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; }
	.stay-icon { color: var(--primary); }
	.stay-nights-badge { font-size: 11px; color: var(--muted); font-weight: 500; }
	.care-protocol-box { margin-top: 14px; }
	.protocol-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; }
	.protocol-item { display: flex; flex-direction: column; gap: 4px; padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--r-md); background: var(--surface); }
	.protocol-item.full-width { grid-column: 1 / -1; }
	.protocol-item.med-alert-item { border-color: var(--danger-border); background: var(--danger-bg); }
	.protocol-lbl { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted); }
	.med-alert-item .protocol-lbl { color: var(--danger); }
	.protocol-val { font-size: 13px; color: var(--ink-2); line-height: 1.4; }
	.care-checklist-section { margin-top: 16px; }
	.checklist-header { margin-bottom: 10px; }
	.checklist-title { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 700; }
	.checklist-buttons-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px; }
	.checklist-form { margin: 0; }
	.care-toggle-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border-radius: var(--r-md); border: 1px solid var(--border); background: var(--surface-2); text-align: left; cursor: pointer; transition: all 130ms ease; }
	.care-toggle-btn:hover { border-color: var(--border-strong); }
	.care-toggle-btn.pending .toggle-icon-wrap { color: var(--muted); }
	.care-toggle-btn.done { background: var(--success-bg); border-color: var(--success-border); }
	.care-toggle-btn.state-am-feed.done .toggle-icon-wrap { color: #f59e0b; }
	.care-toggle-btn.state-pm-feed.done .toggle-icon-wrap { color: #6366f1; }
	.care-toggle-btn.state-walk.done .toggle-icon-wrap { color: #0ea5e9; }
	.care-toggle-btn.state-meds.done .toggle-icon-wrap { color: #ec4899; }
	.toggle-icon-wrap { display: grid; place-items: center; flex-shrink: 0; }
	.toggle-text-wrap { display: flex; flex-direction: column; min-width: 0; }
	.toggle-main-label { font-size: 12.5px; font-weight: 700; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.toggle-status-label { font-size: 11px; color: var(--muted); }
	.caretaker-notes-card { margin-top: 14px; border: 1px dashed var(--border-strong); border-radius: var(--r-md); padding: 12px; background: var(--surface-2); }
	.caretaker-notes-head { margin-bottom: 10px; }
	.notes-head-title { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 700; }
	.mood-notes-body { background: var(--surface); border-radius: var(--r-md); padding: 12px 14px; }
	.notes-quote { margin: 0; font-size: 13.5px; font-style: italic; color: var(--ink-2); line-height: 1.5; }
	.notes-author-meta { margin-top: 8px; font-size: 12px; color: var(--muted); }
	.notes-empty-prompt { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--muted); }
</style>
