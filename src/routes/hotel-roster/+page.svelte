<script lang="ts">
	import { page } from "$app/state";
	import { makeT } from "$lib/i18n/t";
	import { enhance } from "$app/forms";
	import { goto } from "$app/navigation";
	import { formatRupiah as money } from "$lib/util";
	import PetAvatar from "$lib/components/PetAvatar.svelte";
	import SuiteCard from "$lib/components/hotel/SuiteCard.svelte";
	import Modal from "$lib/components/Modal.svelte";
	import {
		Hotel,
		Calendar,
		ChevronLeft,
		ChevronRight,
		Utensils,
		Sun,
		Moon,
		Footprints,
		Pill,
		CheckCircle2,
		Circle,
		Check,
		Plus,
		MessageSquare,
		Phone,
		FileText,
		Smile,
		AlertTriangle,
		ShieldCheck,
		BedDouble,
		Search,
		Sparkles,
		Clock,
		HeartPulse,
		X,
		Info,
		CheckCheck
	} from "@lucide/svelte";

	let { data } = $props();
	const t = $derived(makeT(page.data.locale ?? "en"));

	// Reactive filter states
	let searchQuery = $state("");
	let statusFilter = $state<"all" | "occupied" | "vacant" | "pending_tasks">("all");
	let selectedDateInput = $state(data.selectedDate);

	// Care Notes Modal state
	let noteModalOpen = $state(false);
	let activeNoteBookingId = $state<number | null>(null);
	let activeNotePetId = $state<number | null>(null);
	let activeNotePetName = $state("");
	let activeNoteSuiteName = $state("");
	let activeNoteMoodText = $state("");
	let activeNotePhotoUrl = $state("");

	// Sync date input when data changes
	$effect(() => {
		selectedDateInput = data.selectedDate;
	});

	function handleDateChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.value) {
			goto(`?date=${target.value}`);
		}
	}

	function openNoteModal(suite: (typeof data.roster)[0]) {
		if (!suite.booking || !suite.pet) return;
		activeNoteBookingId = suite.booking.id;
		activeNotePetId = suite.pet.id;
		activeNotePetName = suite.pet.name;
		activeNoteSuiteName = suite.room.name;
		activeNoteMoodText = suite.careLog?.moodNotes ?? "";
		activeNotePhotoUrl = suite.careLog?.photoUrl ?? "";
		noteModalOpen = true;
	}

	function appendMoodPreset(text: string) {
		if (activeNoteMoodText) {
			activeNoteMoodText = `${activeNoteMoodText} ${text}`;
		} else {
			activeNoteMoodText = text;
		}
	}

	function fmtDateStr(d: string | null | undefined): string {
		if (!d) return "-";
		try {
			const parts = d.split("-");
			if (parts.length === 3) {
				const months = [
					"Jan",
					"Feb",
					"Mar",
					"Apr",
					"May",
					"Jun",
					"Jul",
					"Aug",
					"Sep",
					"Oct",
					"Nov",
					"Dec"
				];
				const monthIndex = parseInt(parts[1], 10) - 1;
				return `${parseInt(parts[2], 10)} ${months[monthIndex]} ${parts[0]}`;
			}
			return d;
		} catch {
			return d;
		}
	}

	function fmtDisplayHeadingDate(d: string): string {
		try {
			const date = new Date(`${d}T12:00:00`);
			return date.toLocaleDateString("id-ID", {
				weekday: "long",
				day: "numeric",
				month: "long",
				year: "numeric"
			});
		} catch {
			return d;
		}
	}

	const filteredRoster = $derived(
		data.roster.filter((item) => {
			// Status Filter
			if (statusFilter === "occupied" && !item.occupied) return false;
			if (statusFilter === "vacant" && item.occupied) return false;
			if (statusFilter === "pending_tasks") {
				if (!item.occupied) return false;
				const log = item.careLog;
				const allDone =
					log?.feedingAmDone &&
					log?.feedingPmDone &&
					log?.walkAmDone &&
					log?.walkPmDone &&
					(item.stay?.petCareJson?.medication ? log?.medicationDone : true);
				if (allDone) return false;
			}

			// Search query
			if (!searchQuery.trim()) return true;
			const q = searchQuery.toLowerCase().trim();
			const roomName = item.room.name.toLowerCase();
			const petName = item.pet?.name?.toLowerCase() ?? "";
			const breed = item.pet?.breed?.toLowerCase() ?? "";
			const ownerName = `${item.owner?.firstName ?? ""} ${item.owner?.lastName ?? ""}`.toLowerCase();
			const phone = item.owner?.phone?.toLowerCase() ?? "";

			return (
				roomName.includes(q) ||
				petName.includes(q) ||
				breed.includes(q) ||
				ownerName.includes(q) ||
				phone.includes(q)
			);
		})
	);

	function hasMedication(suite: (typeof data.roster)[0]): boolean {
		const petCare = suite.stay?.petCareJson as { medication?: string; meds?: string } | undefined;
		if (petCare?.medication && petCare.medication.trim() !== "") return true;
		if (petCare?.meds && petCare.meds.trim() !== "") return true;
		if (suite.pet?.healthNotes && suite.pet.healthNotes.toLowerCase().includes("med")) return true;
		return false;
	}

	function getMedicationText(suite: (typeof data.roster)[0]): string {
		const petCare = suite.stay?.petCareJson as { medication?: string; meds?: string } | undefined;
		if (petCare?.medication && petCare.medication.trim() !== "") return petCare.medication;
		if (petCare?.meds && petCare.meds.trim() !== "") return petCare.meds;
		if (suite.pet?.healthNotes) return suite.pet.healthNotes;
		return "Tidak ada resep obat khusus";
	}
</script>

<svelte:head>
	<title>{t['hr.title']()} · PetCo</title>
</svelte:head>

<div class="hotel-roster-page">
	<!-- Page Header -->
	<div class="page-header">
		<div class="title-block">
			<div class="kicker">
				<Hotel size={13} strokeWidth={2.4} />
				<span>Boarding Operations</span>
			</div>
			<h1>{t['hr.title']()}</h1>
			<p class="subtitle">
				Manajemen harian kamar hotel, jadwal makan, aktivitas jalan, obat &amp; catatan observasi
				hewan
			</p>
		</div>

		<!-- Actions & Date Navigation -->
		<div class="actions date-nav-actions">
			<div class="date-navigator-wrap">
				<a
					href="?date={data.prevDate}"
					class="btn btn-sm btn-ghost nav-arrow-btn"
					title="Hari Sebelumnya"
				>
					<ChevronLeft size={15} />
				</a>

				<a
					href="?date={data.todayDate}"
					class="btn btn-sm {data.isToday ? 'btn-primary' : 'btn-ghost'} today-btn"
				>
					<Calendar size={14} />
					<span>Hari Ini</span>
				</a>

				<div class="date-input-chip">
					<input
						type="date"
						class="date-picker-native"
						bind:value={selectedDateInput}
						onchange={handleDateChange}
						aria-label="Pilih Tanggal Roster"
					/>
				</div>

				<a
					href="?date={data.nextDate}"
					class="btn btn-sm btn-ghost nav-arrow-btn"
					title="Hari Berikutnya"
				>
					<ChevronRight size={15} />
				</a>
			</div>

			<a href="/bookings/new?kind=hotel" class="btn btn-primary btn-sm">
				<Plus size={15} strokeWidth={2.4} />
				<span>Check-in / Booking Baru</span>
			</a>
		</div>
	</div>

	<!-- Date Banner / Sub-bar -->
	<div class="date-indicator-bar card mb">
		<div class="date-indicator-content spread">
			<div class="row gap-2">
				<div class="calendar-badge">
					<Calendar size={16} />
				</div>
				<div>
					<div class="date-hero-text">
						{fmtDisplayHeadingDate(data.selectedDate)}
					</div>
					<div class="date-hero-sub">
						{#if data.isToday}
							<span class="active-today-tag">🟢 Jadwal Hari Ini</span>
						{:else}
							<span>Arsip / Jadwal Roster Terjadwal</span>
						{/if}
						· {data.metrics.occupiedCount} Suite Terisi dari {data.metrics.totalSuites} Total Kamar
					</div>
				</div>
			</div>

			<div class="row gap-2">
				<div class="occupancy-pill">
					<span class="occupancy-num">{data.metrics.occupancyRate}%</span>
					<span class="occupancy-lbl">Tingkat Okupansi</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Metrics Summary Strip -->
	<section class="stat-grid mb">
		<div class="stat-card">
			<div class="stat-top">
				<div class="stat-icon purple">
					<Hotel size={18} />
				</div>
				<span class="stat-trend neutral">{data.metrics.occupancyRate}%</span>
			</div>
			<div class="stat-value">
				{data.metrics.occupiedCount} <span class="stat-denom">/ {data.metrics.totalSuites}</span>
			</div>
			<div class="stat-label">Suite Terisi</div>
			<div class="tiny faint" style="margin-top: 2px;">
				{data.metrics.totalSuites - data.metrics.occupiedCount} Kamar Kosong Tersedia
			</div>
		</div>

		<div class="stat-card">
			<div class="stat-top">
				<div class="stat-icon amber">
					<Utensils size={18} />
				</div>
				<span
					class="stat-trend {data.metrics.amFeedingsDone === data.metrics.occupiedCount &&
					data.metrics.occupiedCount > 0
						? 'up'
						: 'neutral'}"
				>
					Pagi (AM)
				</span>
			</div>
			<div class="stat-value">
				{data.metrics.amFeedingsDone} <span class="stat-denom">/ {data.metrics.occupiedCount}</span>
			</div>
			<div class="stat-label">Makan Pagi (AM)</div>
			<div class="tiny faint" style="margin-top: 2px;">Jadwal Makan Pagi 08:00 WIB</div>
		</div>

		<div class="stat-card">
			<div class="stat-top">
				<div class="stat-icon purple">
					<Moon size={18} />
				</div>
				<span
					class="stat-trend {data.metrics.pmFeedingsDone === data.metrics.occupiedCount &&
					data.metrics.occupiedCount > 0
						? 'up'
						: 'neutral'}"
				>
					Malam (PM)
				</span>
			</div>
			<div class="stat-value">
				{data.metrics.pmFeedingsDone} <span class="stat-denom">/ {data.metrics.occupiedCount}</span>
			</div>
			<div class="stat-label">Makan Malam (PM)</div>
			<div class="tiny faint" style="margin-top: 2px;">Jadwal Makan Malam 18:00 WIB</div>
		</div>

		<div class="stat-card">
			<div class="stat-top">
				<div class="stat-icon green">
					<Footprints size={18} />
				</div>
				<span class="stat-trend neutral">Taman / Lari</span>
			</div>
			<div class="stat-value">
				{data.metrics.walksCompleted}
				<span class="stat-denom">/ {data.metrics.totalWalksExpected} Sesi</span>
			</div>
			<div class="stat-label">Aktivitas Jalan Selesai</div>
			<div class="tiny faint" style="margin-top: 2px;">Tracking Olahraga &amp; Buang Air</div>
		</div>

		<div class="stat-card">
			<div class="stat-top">
				<div class="stat-icon blue">
					<Pill size={18} />
				</div>
				<span
					class="stat-trend {data.metrics.medsTotal > 0 &&
					data.metrics.medsVerified === data.metrics.medsTotal
						? 'up'
						: 'neutral'}"
				>
					Resep Medis
				</span>
			</div>
			<div class="stat-value">
				{data.metrics.medsVerified} <span class="stat-denom">/ {data.metrics.medsTotal}</span>
			</div>
			<div class="stat-label">Obat Diberikan</div>
			<div class="tiny faint" style="margin-top: 2px;">
				{data.metrics.medsTotal} Hewan Membutuhkan Medis
			</div>
		</div>
	</section>

	<!-- Filter & Search Toolbar -->
	<div class="card mb">
		<div class="toolbar spread pad">
			<div class="filter-pills row gap-2">
				<button
					type="button"
					class="preset-chip {statusFilter === 'all' ? 'active' : ''}"
					onclick={() => (statusFilter = "all")}
				>
					<Hotel size={13} />
					<span>Semua Suite ({data.roster.length})</span>
				</button>

				<button
					type="button"
					class="preset-chip {statusFilter === 'occupied' ? 'active' : ''}"
					onclick={() => (statusFilter = "occupied")}
				>
					<Sparkles size={13} />
					<span>Terisi ({data.metrics.occupiedCount})</span>
				</button>

				<button
					type="button"
					class="preset-chip {statusFilter === 'vacant' ? 'active' : ''}"
					onclick={() => (statusFilter = "vacant")}
				>
					<BedDouble size={13} />
					<span>Kosong ({data.metrics.totalSuites - data.metrics.occupiedCount})</span>
				</button>

				<button
					type="button"
					class="preset-chip {statusFilter === 'pending_tasks' ? 'active' : ''}"
					onclick={() => (statusFilter = "pending_tasks")}
				>
					<Clock size={13} />
					<span>Perlu Tindakan Harian</span>
				</button>
			</div>

			<div class="search-box">
				<Search size={14} class="search-icon" />
				<input
					type="search"
					placeholder="Cari kamar, anjing/kucing, pemilik, nomor HP..."
					bind:value={searchQuery}
				/>
			</div>
		</div>
	</div>

	<!-- Room Suite Visual Matrix / Cards Grid -->
	<div class="suites-matrix-grid">
		{#if filteredRoster.length === 0}
			<div class="empty-roster card pad center">
				<div class="empty-icon-wrap">
					<BedDouble size={36} strokeWidth={1.5} />
				</div>
				<h3>Tidak Ada Suite Sesuai Filter</h3>
				<p class="muted" style="margin-top: 4px; max-width: 420px; text-align: center;">
					Tidak ditemukan kamar yang cocok dengan filter atau kata kunci pencarian pada tanggal ini.
				</p>
				<button
					type="button"
					class="btn btn-sm btn-ghost"
					style="margin-top: 12px;"
					onclick={() => {
						statusFilter = "all";
						searchQuery = "";
					}}
				>
					<X size={14} />
					<span>Reset Filter</span>
				</button>
			</div>
		{:else}
			{#each filteredRoster as suite (suite.room.id)}
				<SuiteCard {suite} selectedDate={data.selectedDate} onOpenNote={(s) => openNoteModal(s as (typeof data.roster)[0])} />
			{/each}
		{/if}
	</div>
</div>

<!-- Modal: Tulis Catatan Harian Caretaker -->
<Modal
	bind:open={noteModalOpen}
	title="Catatan Observasi Harian: {activeNotePetName}"
	subtitle="Kamar: {activeNoteSuiteName} · Tanggal: {fmtDateStr(data.selectedDate)}"
	maxWidth="560px"
>
	<form
		method="POST"
		action="?/saveNotes"
		use:enhance={() => {
			return async ({ result, update }) => {
				await update();
				if (result.type === "success") {
					noteModalOpen = false;
				}
			};
		}}
		class="note-modal-form"
	>
		<input type="hidden" name="bookingId" value={activeNoteBookingId} />
		<input type="hidden" name="petId" value={activeNotePetId} />
		<input type="hidden" name="careDate" value={data.selectedDate} />

		<div class="field">
			<label for="mood-presets">Template Cepat Mood &amp; Perilaku</label>
			<div class="quick-presets">
				<button
					type="button"
					class="preset-chip"
					onclick={() => appendMoodPreset("🌟 Sangat ceria, nafsu makan baik dan lahap.")}
				>
					🌟 Ceria &amp; Lahap
				</button>
				<button
					type="button"
					class="preset-chip"
					onclick={() =>
						appendMoodPreset("😌 Tenang, santai di tempat tidur, buang air lancar normal.")}
				>
					😌 Tenang &amp; Nyaman
				</button>
				<button
					type="button"
					class="preset-chip"
					onclick={() =>
						appendMoodPreset(
							"🥺 Agak pemalu dan waspada, perlu pendekatan lembut saat diajak jalan."
						)}
				>
					🥺 Pemalu / Perlu Dielus
				</button>
				<button
					type="button"
					class="preset-chip"
					onclick={() =>
						appendMoodPreset(
							"🤢 Nafsu makan sedikit berkurang, minum normal, terus dipantau."
						)}
				>
					⚠️ Perlu Pantauan
				</button>
			</div>
		</div>

		<div class="field">
			<label for="moodNotes">
				<span>Catatan Detail Observasi Caretaker</span>
				<span class="req">*</span>
			</label>
			<textarea
				id="moodNotes"
				name="moodNotes"
				rows="4"
				placeholder="Tuliskan nafsu makan, kondisi feses/urin, keaktifan saat diajak jalan, interaksi dengan staf, dsb..."
				bind:value={activeNoteMoodText}
				required
			></textarea>
			<div class="help">
				Catatan ini akan tersimpan dalam arsip log harian dan dapat dibagikan kepada pemilik saat
				checkout.
			</div>
		</div>

		<div class="field">
			<label for="photoUrl">Foto Harian / Link Dokumentasi (Opsional)</label>
			<input
				type="url"
				id="photoUrl"
				name="photoUrl"
				placeholder="https://..."
				bind:value={activeNotePhotoUrl}
			/>
		</div>

		<div class="modal-actions spread" style="margin-top: 24px;">
			<button
				type="button"
				class="btn btn-ghost"
				onclick={() => (noteModalOpen = false)}
			>
				<X size={14} />
				<span>Batal</span>
			</button>

			<button type="submit" class="btn btn-primary">
				<Check size={14} />
				<span>Simpan Catatan Caretaker</span>
			</button>
		</div>
	</form>
</Modal>

<style>
	.hotel-roster-page {
		display: flex;
		flex-direction: column;
		gap: var(--sp-4);
	}

	.date-nav-actions {
		display: flex;
		align-items: center;
		gap: var(--sp-3);
		flex-wrap: wrap;
	}

	.date-navigator-wrap {
		display: inline-flex;
		align-items: center;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-md);
		padding: 2px 4px;
		gap: 2px;
		box-shadow: var(--shadow-xs);
	}

	.nav-arrow-btn {
		width: 32px;
		height: 32px;
		padding: 0;
		display: grid;
		place-items: center;
	}

	.today-btn {
		height: 32px;
		padding: 0 10px;
		font-size: 12px;
	}

	.date-input-chip {
		display: inline-flex;
		align-items: center;
	}

	.date-picker-native {
		height: 32px;
		min-height: 32px;
		padding: 2px 8px;
		border: 1px solid var(--border);
		background: var(--surface-2);
		border-radius: var(--r-sm);
		font-size: 12.5px;
		font-weight: 600;
		color: var(--ink);
	}

	/* Date Indicator Bar */
	.date-indicator-bar {
		padding: 14px 20px;
		background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
		border-left: 4px solid var(--primary);
	}

	.calendar-badge {
		width: 40px;
		height: 40px;
		border-radius: var(--r-md);
		background: var(--primary-soft);
		color: var(--primary);
		display: grid;
		place-items: center;
		flex-shrink: 0;
	}

	.date-hero-text {
		font-size: 16px;
		font-weight: 700;
		color: var(--ink);
		letter-spacing: -0.01em;
	}

	.date-hero-sub {
		font-size: 12.5px;
		color: var(--muted);
		margin-top: 2px;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.active-today-tag {
		color: var(--success);
		font-weight: 600;
	}

	.occupancy-pill {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		justify-content: center;
	}

	.occupancy-num {
		font-size: 20px;
		font-weight: 800;
		color: var(--primary);
		line-height: 1;
	}

	.occupancy-lbl {
		font-size: 11px;
		color: var(--muted);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.stat-denom {
		font-size: 14px;
		color: var(--muted);
		font-weight: 500;
	}

	/* Toolbar & Search */
	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
	}

	.search-box {
		position: relative;
		flex: 0 1 340px;
		width: 100%;
	}

	.search-box .search-icon {
		position: absolute;
		left: 11px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--faint);
		pointer-events: none;
	}

	.search-box input {
		padding-left: 34px;
		height: 38px;
		font-size: 13px;
		width: 100%;
	}

	/* Suites Grid */
	.suites-matrix-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(460px, 1fr));
		gap: var(--sp-5);
	}

	@media (max-width: 640px) {
		.suites-matrix-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Suite Card */
	.empty-roster {
		grid-column: 1 / -1;
		padding: 48px 24px;
	}

	.empty-icon-wrap {
		width: 64px;
		height: 64px;
		border-radius: var(--r-2xl);
		background: var(--surface-3);
		color: var(--faint);
		display: grid;
		place-items: center;
		margin-bottom: 12px;
	}

	.note-modal-form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
</style>
