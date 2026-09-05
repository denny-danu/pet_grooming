<script lang="ts">
	import { enhance } from "$app/forms";
	import { goto } from "$app/navigation";
	import { formatRupiah as money } from "$lib/util";
	import PetAvatar from "$lib/components/PetAvatar.svelte";
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
	<title>Hotel Daily Care Roster · PetCo</title>
</svelte:head>

<div class="hotel-roster-page">
	<!-- Page Header -->
	<div class="page-header">
		<div class="title-block">
			<div class="kicker">
				<Hotel size={13} strokeWidth={2.4} />
				<span>Boarding Operations</span>
			</div>
			<h1>Hotel Daily Care Roster</h1>
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
				<div class="suite-card card {suite.occupied ? 'occupied-suite' : 'vacant-suite'}">
					<!-- Card Header -->
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

					<!-- Card Body -->
					<div class="suite-card-body">
						{#if !suite.occupied}
							<!-- Vacant State -->
							<div class="vacant-card-content">
								<div class="vacant-illustration">
									<BedDouble size={32} strokeWidth={1.4} />
								</div>
								<div class="vacant-title">Kamar Siap Digunakan</div>
								<div class="vacant-specs muted">
									Kapasitas: {suite.room.capacity} hewan · Maksimal: {suite.room.maxPetWeightKg
										? `${suite.room.maxPetWeightKg} kg`
										: 'Semua Ukuran'}
								</div>
								<p class="vacant-desc">
									Suite sudah disterilkan dan siap untuk penitipan hewan baru.
								</p>
								<a
									href="/bookings/new?roomId={suite.room.id}&kind=hotel"
									class="btn btn-sm btn-subtle vacant-book-btn"
								>
									<Plus size={14} />
									<span>Buat Reservasi Suite</span>
								</a>
							</div>
						{:else}
							<!-- Occupied Suite State -->
							<!-- Pet Profile Bar -->
							<div class="pet-profile-section">
								<div class="pet-profile-top spread">
									<div class="row gap-3">
										<PetAvatar
											name={suite.pet?.name}
											species={suite.pet?.species}
											breed={suite.pet?.breed}
											size="lg"
										/>
										<div class="pet-details-col">
											<div class="row gap-2" style="flex-wrap: wrap;">
												<span class="pet-name-lg">{suite.pet?.name}</span>
												{#if suite.pet?.weightKg}
													<span class="badge badge-neutral text-xs">
														{suite.pet.weightKg} kg
													</span>
												{/if}
												{#if suite.pet?.aggressive}
													<span class="badge badge-danger text-xs">
														<AlertTriangle size={11} />
														<span>Agresif / Perlu Perhatian</span>
													</span>
												{/if}
												{#if suite.pet?.allergies}
													<span class="badge badge-warning text-xs">
														🌾 Alergi: {suite.pet.allergies}
													</span>
												{/if}
											</div>
											<div class="pet-sub-meta muted">
												{suite.pet?.breed ?? suite.pet?.species ?? 'Hewan'} · Pemilik:
												<span class="ink-strong"
													>{suite.owner?.firstName} {suite.owner?.lastName}</span
												>
											</div>
										</div>
									</div>

									<!-- Contact Quick Link -->
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
											<a
												href="tel:{suite.owner.phone}"
												class="btn btn-sm btn-ghost contact-chip-phone"
												title="Telepon Pemilik"
											>
												<Phone size={13} />
											</a>
										</div>
									{/if}
								</div>

								<!-- Stay Duration Pill -->
								<div class="stay-info-bar spread">
									<div class="stay-dates-text">
										<Calendar size={13} class="stay-icon" />
										<span>
											{fmtDateStr(suite.stay?.checkInDate)} → {fmtDateStr(
												suite.stay?.checkOutDate
											)}
										</span>
										<span class="stay-nights-badge">
											({suite.stay?.nightCount ?? 1} malam)
										</span>
									</div>

									<div class="booking-status-chip">
										{#if suite.booking?.status === 'checked_in'}
											<span class="badge badge-info">
												<Check size={11} />
												<span>Checked-In</span>
											</span>
										{:else}
											<span class="badge badge-success">
												<span>{suite.booking?.status ?? 'Confirmed'}</span>
											</span>
										{/if}
									</div>
								</div>
							</div>

							<!-- Care Instructions & Protocol Box -->
							<div class="care-protocol-box">
								<div class="protocol-grid">
									<div class="protocol-item">
										<span class="protocol-lbl">
											<Utensils size={13} />
											<span>Porsi &amp; Jadwal Makan</span>
										</span>
										<span class="protocol-val">
											{(suite.stay?.petCareJson as { feeding?: string })?.feeding ||
												'Standar 2x sehari (08:00 & 18:00)'}
										</span>
									</div>

									<div class="protocol-item">
										<span class="protocol-lbl">
											<Footprints size={13} />
											<span>Jadwal Jalan / Lari</span>
										</span>
										<span class="protocol-val">
											{(suite.stay?.petCareJson as { walksPerDay?: number })?.walksPerDay ??
												2}x sehari di taman bermain
										</span>
									</div>

									<div class="protocol-item {hasMedication(suite) ? 'med-alert-item' : ''}">
										<span class="protocol-lbl">
											<Pill size={13} />
											<span>Instruksi Obat</span>
										</span>
										<span class="protocol-val">
											{getMedicationText(suite)}
										</span>
									</div>

									{#if suite.pet?.behaviorNotes || suite.booking?.notes}
										<div class="protocol-item full-width">
											<span class="protocol-lbl">
												<Info size={13} />
												<span>Catatan Karakter / Perilaku</span>
											</span>
											<span class="protocol-val">
												{suite.pet?.behaviorNotes || suite.booking?.notes}
											</span>
										</div>
									{/if}
								</div>
							</div>

							<!-- Interactive Care Checklist -->
							<div class="care-checklist-section">
								<div class="checklist-header spread">
									<div class="checklist-title">
										<CheckCheck size={14} />
										<span>Checklist Harian Perawatan ({data.selectedDate})</span>
									</div>
									{#if suite.careLog?.updatedAt}
										<div class="last-log-time tiny muted">
											Diupdate: {new Date(suite.careLog.updatedAt).toLocaleTimeString(
												'id-ID',
												{ hour: '2-digit', minute: '2-digit' }
											)} WIB
											{#if suite.careLog.staffName}
												oleh {suite.careLog.staffName}
											{/if}
										</div>
									{/if}
								</div>

								<div class="checklist-buttons-grid">
									<!-- 1. AM Feeding -->
									<form method="POST" action="?/toggleCare" use:enhance class="checklist-form">
										<input type="hidden" name="bookingId" value={suite.booking?.id} />
										<input type="hidden" name="petId" value={suite.pet?.id} />
										<input type="hidden" name="careDate" value={data.selectedDate} />
										<input type="hidden" name="field" value="feedingAmDone" />
										<input
											type="hidden"
											name="currentValue"
											value={suite.careLog?.feedingAmDone ? 'true' : 'false'}
										/>

										<button
											type="submit"
											class="care-toggle-btn {suite.careLog?.feedingAmDone
												? 'done state-am-feed'
												: 'pending'}"
										>
											<div class="toggle-icon-wrap">
												{#if suite.careLog?.feedingAmDone}
													<CheckCircle2 size={16} strokeWidth={2.4} />
												{:else}
													<Circle size={16} strokeWidth={1.8} />
												{/if}
											</div>
											<div class="toggle-text-wrap">
												<div class="toggle-main-label">🥣 Makan Pagi (AM)</div>
												<div class="toggle-status-label">
													{suite.careLog?.feedingAmDone ? 'Sudah Diberi' : 'Belum Makan'}
												</div>
											</div>
										</button>
									</form>

									<!-- 2. PM Feeding -->
									<form method="POST" action="?/toggleCare" use:enhance class="checklist-form">
										<input type="hidden" name="bookingId" value={suite.booking?.id} />
										<input type="hidden" name="petId" value={suite.pet?.id} />
										<input type="hidden" name="careDate" value={data.selectedDate} />
										<input type="hidden" name="field" value="feedingPmDone" />
										<input
											type="hidden"
											name="currentValue"
											value={suite.careLog?.feedingPmDone ? 'true' : 'false'}
										/>

										<button
											type="submit"
											class="care-toggle-btn {suite.careLog?.feedingPmDone
												? 'done state-pm-feed'
												: 'pending'}"
										>
											<div class="toggle-icon-wrap">
												{#if suite.careLog?.feedingPmDone}
													<CheckCircle2 size={16} strokeWidth={2.4} />
												{:else}
													<Circle size={16} strokeWidth={1.8} />
												{/if}
											</div>
											<div class="toggle-text-wrap">
												<div class="toggle-main-label">🍲 Makan Malam (PM)</div>
												<div class="toggle-status-label">
													{suite.careLog?.feedingPmDone ? 'Sudah Diberi' : 'Belum Makan'}
												</div>
											</div>
										</button>
									</form>

									<!-- 3. AM Walk -->
									<form method="POST" action="?/toggleCare" use:enhance class="checklist-form">
										<input type="hidden" name="bookingId" value={suite.booking?.id} />
										<input type="hidden" name="petId" value={suite.pet?.id} />
										<input type="hidden" name="careDate" value={data.selectedDate} />
										<input type="hidden" name="field" value="walkAmDone" />
										<input
											type="hidden"
											name="currentValue"
											value={suite.careLog?.walkAmDone ? 'true' : 'false'}
										/>

										<button
											type="submit"
											class="care-toggle-btn {suite.careLog?.walkAmDone
												? 'done state-walk'
												: 'pending'}"
										>
											<div class="toggle-icon-wrap">
												{#if suite.careLog?.walkAmDone}
													<CheckCircle2 size={16} strokeWidth={2.4} />
												{:else}
													<Circle size={16} strokeWidth={1.8} />
												{/if}
											</div>
											<div class="toggle-text-wrap">
												<div class="toggle-main-label">🦮 Jalan Pagi (AM)</div>
												<div class="toggle-status-label">
													{suite.careLog?.walkAmDone ? 'Taman / Selesai' : 'Belum Jalan'}
												</div>
											</div>
										</button>
									</form>

									<!-- 4. PM Walk -->
									<form method="POST" action="?/toggleCare" use:enhance class="checklist-form">
										<input type="hidden" name="bookingId" value={suite.booking?.id} />
										<input type="hidden" name="petId" value={suite.pet?.id} />
										<input type="hidden" name="careDate" value={data.selectedDate} />
										<input type="hidden" name="field" value="walkPmDone" />
										<input
											type="hidden"
											name="currentValue"
											value={suite.careLog?.walkPmDone ? 'true' : 'false'}
										/>

										<button
											type="submit"
											class="care-toggle-btn {suite.careLog?.walkPmDone
												? 'done state-walk'
												: 'pending'}"
										>
											<div class="toggle-icon-wrap">
												{#if suite.careLog?.walkPmDone}
													<CheckCircle2 size={16} strokeWidth={2.4} />
												{:else}
													<Circle size={16} strokeWidth={1.8} />
												{/if}
											</div>
											<div class="toggle-text-wrap">
												<div class="toggle-main-label">🌙 Jalan Sore (PM)</div>
												<div class="toggle-status-label">
													{suite.careLog?.walkPmDone ? 'Taman / Selesai' : 'Belum Jalan'}
												</div>
											</div>
										</button>
									</form>

									<!-- 5. Medication -->
									<form method="POST" action="?/toggleCare" use:enhance class="checklist-form">
										<input type="hidden" name="bookingId" value={suite.booking?.id} />
										<input type="hidden" name="petId" value={suite.pet?.id} />
										<input type="hidden" name="careDate" value={data.selectedDate} />
										<input type="hidden" name="field" value="medicationDone" />
										<input
											type="hidden"
											name="currentValue"
											value={suite.careLog?.medicationDone ? 'true' : 'false'}
										/>

										<button
											type="submit"
											class="care-toggle-btn {suite.careLog?.medicationDone
												? 'done state-meds'
												: 'pending'}"
										>
											<div class="toggle-icon-wrap">
												{#if suite.careLog?.medicationDone}
													<CheckCircle2 size={16} strokeWidth={2.4} />
												{:else}
													<Circle size={16} strokeWidth={1.8} />
												{/if}
											</div>
											<div class="toggle-text-wrap">
												<div class="toggle-main-label">💊 Pemberian Obat</div>
												<div class="toggle-status-label">
													{suite.careLog?.medicationDone ? 'Obat Selesai' : 'Belum Diminum'}
												</div>
											</div>
										</button>
									</form>
								</div>
							</div>

							<!-- Caretaker Observation & Daily Mood Notes Card -->
							<div class="caretaker-notes-card">
								<div class="caretaker-notes-head spread">
									<div class="notes-head-title">
										<FileText size={14} />
										<span>Catatan Observasi Caretaker</span>
									</div>
									<button
										type="button"
										class="btn btn-sm btn-subtle edit-note-btn"
										onclick={() => openNoteModal(suite)}
									>
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
										<span
											>Belum ada catatan mood &amp; observasi fisik untuk hari ini. Klik "Tulis
											Catatan Harian" untuk menambahkan.</span
										>
									</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>
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
	.suite-card {
		border-radius: var(--r-xl);
		background: var(--surface);
		border: 1px solid var(--border);
		box-shadow: var(--shadow-sm);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
	}

	.suite-card:hover {
		box-shadow: var(--shadow-md);
		border-color: var(--border-strong);
	}

	.suite-card.occupied-suite {
		border-top: 3px solid var(--primary);
	}

	.suite-card.vacant-suite {
		border-top: 3px dashed var(--border-strong);
		background: #fdfefe;
	}

	/* Suite Card Head */
	.suite-card-head {
		padding: 14px 18px;
		background: var(--surface-2);
		border-bottom: 1px solid var(--border);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.suite-name-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.suite-title {
		font-size: 14.5px;
		font-weight: 700;
		color: var(--ink);
	}

	.size-badge {
		font-size: 11px;
		padding: 1px 7px;
	}

	.suite-rate {
		font-size: 12px;
		font-weight: 600;
		color: var(--primary);
		margin-top: 2px;
	}

	.rate-sub {
		color: var(--muted);
		font-weight: 400;
	}

	.pulse-dot-green {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--success);
		display: inline-block;
		box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.2);
	}

	/* Card Body */
	.suite-card-body {
		padding: 18px;
		display: flex;
		flex-direction: column;
		gap: 16px;
		flex: 1;
	}

	/* Vacant State */
	.vacant-card-content {
		padding: 30px 16px;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 8px;
	}

	.vacant-illustration {
		width: 56px;
		height: 56px;
		border-radius: var(--r-xl);
		background: var(--surface-3);
		color: var(--faint);
		display: grid;
		place-items: center;
		margin-bottom: 4px;
	}

	.vacant-title {
		font-size: 15px;
		font-weight: 700;
		color: var(--ink-2);
	}

	.vacant-specs {
		font-size: 12px;
	}

	.vacant-desc {
		font-size: 12.5px;
		color: var(--muted);
		margin: 4px 0 12px;
		max-width: 280px;
	}

	.vacant-book-btn {
		height: 34px;
		padding: 0 16px;
	}

	/* Pet Profile Section */
	.pet-profile-section {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.pet-name-lg {
		font-size: 15px;
		font-weight: 700;
		color: var(--ink);
	}

	.pet-sub-meta {
		font-size: 12px;
		margin-top: 2px;
	}

	.owner-contact-actions {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.contact-chip-wa {
		color: #059669;
		background: #ecfdf5;
		border: 1px solid #a7f3d0;
		font-size: 11.5px;
		height: 28px;
		padding: 0 9px;
	}

	.contact-chip-wa:hover {
		background: #d1fae5;
	}

	.contact-chip-phone {
		height: 28px;
		width: 28px;
		padding: 0;
		display: grid;
		place-items: center;
	}

	.stay-info-bar {
		padding: 6px 10px;
		background: var(--surface-2);
		border-radius: var(--r-md);
		border: 1px solid var(--border);
		font-size: 12px;
	}

	.stay-dates-text {
		display: flex;
		align-items: center;
		gap: 6px;
		font-weight: 600;
		color: var(--ink-2);
	}

	.stay-icon {
		color: var(--primary);
	}

	.stay-nights-badge {
		color: var(--muted);
		font-weight: 500;
	}

	/* Care Protocol Box */
	.care-protocol-box {
		padding: 12px 14px;
		background: #f8fafc;
		border-radius: var(--r-md);
		border: 1px solid var(--border);
	}

	.protocol-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px 14px;
	}

	@media (max-width: 500px) {
		.protocol-grid {
			grid-template-columns: 1fr;
		}
	}

	.protocol-item {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.protocol-item.full-width {
		grid-column: 1 / -1;
		border-top: 1px dashed var(--border);
		padding-top: 8px;
		margin-top: 2px;
	}

	.protocol-item.med-alert-item {
		background: var(--amber-bg);
		border: 1px solid var(--amber-border);
		padding: 6px 8px;
		border-radius: var(--r-sm);
	}

	.protocol-lbl {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 11px;
		font-weight: 700;
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.med-alert-item .protocol-lbl {
		color: var(--amber);
	}

	.protocol-val {
		font-size: 12.5px;
		font-weight: 600;
		color: var(--ink);
		line-height: 1.35;
	}

	/* Care Checklist Section */
	.care-checklist-section {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.checklist-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.checklist-title {
		font-size: 12.5px;
		font-weight: 700;
		color: var(--ink);
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.checklist-buttons-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
		gap: 8px;
	}

	.checklist-form {
		margin: 0;
	}

	.care-toggle-btn {
		width: 100%;
		height: auto;
		min-height: 52px;
		padding: 8px 10px;
		border-radius: var(--r-md);
		border: 1px solid var(--border-strong);
		background: var(--surface);
		display: flex;
		align-items: flex-start;
		gap: 8px;
		cursor: pointer;
		text-align: left;
		transition: all 140ms ease;
		box-shadow: var(--shadow-xs);
	}

	.care-toggle-btn:hover {
		border-color: var(--faint);
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}

	.care-toggle-btn.pending {
		background: var(--surface);
		color: var(--ink-2);
	}

	.care-toggle-btn.pending .toggle-icon-wrap {
		color: var(--faint);
	}

	.care-toggle-btn.done {
		border-color: transparent;
	}

	.care-toggle-btn.state-am-feed.done {
		background: #ecfdf5;
		border-color: #a7f3d0;
		color: #065f46;
	}

	.care-toggle-btn.state-pm-feed.done {
		background: #f5f3ff;
		border-color: #ddd6fe;
		color: #5b21b6;
	}

	.care-toggle-btn.state-walk.done {
		background: #f0fdfa;
		border-color: #99f6e4;
		color: #0f766e;
	}

	.care-toggle-btn.state-meds.done {
		background: #eff6ff;
		border-color: #bfdbfe;
		color: #1e40af;
	}

	.toggle-icon-wrap {
		margin-top: 1px;
		flex-shrink: 0;
	}

	.toggle-text-wrap {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.toggle-main-label {
		font-size: 11.5px;
		font-weight: 700;
		line-height: 1.2;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.toggle-status-label {
		font-size: 10.5px;
		font-weight: 500;
		opacity: 0.85;
	}

	/* Caretaker Notes Card */
	.caretaker-notes-card {
		padding: 12px 14px;
		background: var(--surface-2);
		border-radius: var(--r-md);
		border: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.caretaker-notes-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.notes-head-title {
		font-size: 12px;
		font-weight: 700;
		color: var(--ink-2);
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.edit-note-btn {
		height: 28px;
		padding: 0 10px;
		font-size: 11.5px;
	}

	.mood-notes-body {
		padding: 8px 12px;
		background: var(--surface);
		border-radius: var(--r-sm);
		border: 1px solid var(--border-subtle);
	}

	.notes-quote {
		margin: 0;
		font-size: 12.5px;
		font-style: italic;
		color: var(--ink);
		line-height: 1.4;
	}

	.notes-author-meta {
		font-size: 11px;
		color: var(--muted);
		margin-top: 6px;
	}

	.notes-empty-prompt {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		color: var(--muted);
		padding: 6px 0;
	}

	/* Empty State */
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
