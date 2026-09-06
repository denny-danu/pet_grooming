<script lang="ts">
	import { page } from "$app/state";
	import { formatRupiah as money } from "$lib/util";
	import { makeT } from "$lib/i18n/t";
	import LanguageSwitcher from "$lib/components/LanguageSwitcher.svelte";
	import {
		PawPrint,
		Scissors,
		Hotel,
		Fish,
		Calendar,
		Clock,
		MapPin,
		Phone,
		Mail,
		CheckCircle2,
		AlertCircle,
		Search,
		Plus,
		ArrowRight,
		ArrowLeft,
		Sparkles,
		ShieldCheck,
		User,
		Receipt,
		Building2,
		HeartHandshake,
		ChevronRight,
		ExternalLink
	} from "@lucide/svelte";

	let { data } = $props();
	const form = $derived(page.form);
	const t = $derived(makeT(page.data.locale ?? "en"));

	// Navigation tab: 'book' (Online Booking Wizard) or 'lookup' (Booking Database & Status Tracker)
	let activeTab = $state<"book" | "lookup">("book");

	// Booking Wizard States
	let selectedKind = $state<"grooming" | "hotel" | "aquarium">("grooming");
	let selectedBranchId = $state<number>(1);
	let selectedServiceId = $state<number | null>(null);
	let selectedRoomId = $state<number | null>(null);
	let selectedAddonIds = $state<number[]>([]);

	// Schedule States
	let bookingDate = $state(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
	let timeSlot = $state("10:00");
	let checkInDate = $state(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
	let checkOutDate = $state(new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10));

	// Client / Pet Inputs
	let firstName = $state("");
	let lastName = $state("");
	let phone = $state("");
	let email = $state("");
	let address = $state("");

	let petName = $state("");
	let species = $state<"dog" | "cat" | "bird" | "reptile" | "fish" | "other">("dog");
	let breed = $state("");
	let weightKg = $state<number | null>(null);
	let healthNotes = $state("");
	let bookingNotes = $state("");

	let isSubmitting = $state(false);

	// Search Query for Booking Database Lookup
	let lookupInput = $state("");

	// Filter catalog based on selected kind & branch
	const branchServices = $derived(data.services.filter((s) => s.kind === selectedKind));
	const branchRooms = $derived(data.rooms.filter((r) => !r.branchId || r.branchId === selectedBranchId));
	const selectedBranch = $derived(data.branches.find((b) => b.id === selectedBranchId) ?? data.branches[0]);

	// Auto-select first service or room when kind changes
	$effect(() => {
		if (selectedKind === "grooming" || selectedKind === "aquarium") {
			if (!selectedServiceId && branchServices.length > 0) {
				selectedServiceId = branchServices[0].id;
			}
		} else if (selectedKind === "hotel") {
			if (!selectedRoomId && branchRooms.length > 0) {
				selectedRoomId = branchRooms[0].id;
			}
		}
	});
	$effect(() => {
		if (data.lookupParam) {
			activeTab = "lookup";
			lookupInput = data.lookupParam;
		}
		if (data.initialKind) {
			selectedKind = data.initialKind;
		}
		if (data.initialBranchId) {
			selectedBranchId = data.initialBranchId;
		} else if (data.branches[0]?.id) {
			selectedBranchId = data.branches[0].id;
		}
	});

	// Price Calculations
	const calculatedNights = $derived.by(() => {
		if (selectedKind !== "hotel" || !checkInDate || !checkOutDate) return 1;
		const start = new Date(checkInDate).getTime();
		const end = new Date(checkOutDate).getTime();
		return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
	});

	const selectedService = $derived(data.services.find((s) => s.id === selectedServiceId));
	const selectedRoom = $derived(data.rooms.find((r) => r.id === selectedRoomId));

	const estimatedTotal = $derived.by(() => {
		if (selectedKind === "grooming") {
			let total = selectedService?.priceCents ?? 120000;
			for (const addonId of selectedAddonIds) {
				const addon = data.services.find((s) => s.id === addonId);
				if (addon) total += addon.priceCents;
			}
			return total;
		} else if (selectedKind === "hotel") {
			const perNight = selectedRoom?.pricePerNightCents ?? 180000;
			return perNight * calculatedNights;
		} else {
			return selectedService?.priceCents ?? 150000;
		}
	});

	const estimatedDeposit = $derived(Math.round(estimatedTotal * 0.2));

	function toggleAddon(addonId: number) {
		if (selectedAddonIds.includes(addonId)) {
			selectedAddonIds = selectedAddonIds.filter((id) => id !== addonId);
		} else {
			selectedAddonIds = [...selectedAddonIds, addonId];
		}
	}

	const timeSlots = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00"];

	const speciesIcons: Record<string, string> = {
		dog: "🐕",
		cat: "🐈",
		bird: "🦜",
		reptile: "🦎",
		fish: "🐠",
		other: "🐾"
	};
</script>

<svelte:head>
	<title>PetCo · Online Pet Booking &amp; Client Portal</title>
</svelte:head>

<div class="client-portal-root">
	<!-- ==================== HEADER BAR ==================== -->
	<header class="portal-header">
		<div class="portal-header-container">
			<div class="portal-brand">
				<a href="/" class="brand-link">
					<span class="brand-emblem"><PawPrint size={20} /></span>
					<div class="brand-copy">
						<span class="brand-title">PetCo</span>
						<span class="brand-subtitle">Online Pet Care Portal</span>
					</div>
				</a>
			</div>

			<!-- Tab Navigation -->
			<div class="portal-nav" role="tablist">
				<button
					class="portal-nav-btn"
					class:active={activeTab === "book"}
					onclick={() => (activeTab = "book")}
					role="tab"
					aria-selected={activeTab === "book"}
				>
					<Calendar size={16} />
					<span>{page.data.locale === "id" ? "Reservasi Baru" : "Book Service"}</span>
				</button>

				<button
					class="portal-nav-btn"
					class:active={activeTab === "lookup"}
					onclick={() => (activeTab = "lookup")}
					role="tab"
					aria-selected={activeTab === "lookup"}
				>
					<Search size={16} />
					<span>{page.data.locale === "id" ? "Cek Status Booking" : "My Bookings"}</span>
				</button>
			</div>

			<!-- Header Right Controls -->
			<div class="portal-header-right">
				<LanguageSwitcher value={page.data.locale ?? "en"} currentPath="/" />
				<a href="/dashboard" class="staff-console-link" title="Staff Management Console">
					<User size={14} />
					<span>{page.data.locale === "id" ? "Portal Staf" : "Staff Console"}</span>
				</a>
			</div>
		</div>
	</header>

	<!-- ==================== HERO SECTION ==================== -->
	<section class="portal-hero">
		<div class="hero-container">
			<div class="hero-badge">
				<Sparkles size={14} class="sparkle-icon" />
				<span>{page.data.locale === "id" ? "Pusat Perawatan & Reservasi Resmi" : "Official Pet Care & Reservation Center"}</span>
			</div>
			<h1 class="hero-heading">
				{page.data.locale === "id"
					? "Perawatan Terbaik untuk Sahabat Setia Anda"
					: "Premium Care for Your Beloved Companions"}
			</h1>
			<p class="hero-description">
				{page.data.locale === "id"
					? "Pesan layanan grooming profesional, penginapan hotel ber-AC 24/7, atau perawatan akuarium langsung dari situs kami."
					: "Book certified grooming sessions, climate-controlled luxury boarding, or professional aquarium maintenance directly online."}
			</p>

			<div class="hero-guarantees">
				<div class="guarantee-item">
					<ShieldCheck size={16} />
					<span>{page.data.locale === "id" ? "Sertifikasi Medis & Groomer Profesional" : "Certified Stylists & Vet Health Gate"}</span>
				</div>
				<div class="guarantee-item">
					<HeartHandshake size={16} />
					<span>{page.data.locale === "id" ? "Pemantauan 24/7 & Laporan Harian" : "24/7 Caretaker & Daily Photo Reports"}</span>
				</div>
				<div class="guarantee-item">
					<CheckCircle2 size={16} />
					<span>{page.data.locale === "id" ? "Konfirmasi Cepat & Transparan" : "Instant Transparent Pricing"}</span>
				</div>
			</div>
		</div>
	</section>

	<!-- ==================== MAIN CONTENT AREA ==================== -->
	<main class="portal-main">
		{#if form?.success && form.booking}
			<!-- ==================== BOOKING CONFIRMATION TICKET ==================== -->
			<div class="confirmation-wrap">
				<div class="confirmation-card">
					<div class="confirm-badge-banner">
						<CheckCircle2 size={32} class="success-icon" />
						<h2>{page.data.locale === "id" ? "Booking Berhasil Dibuat!" : "Booking Request Submitted!"}</h2>
						<p>{page.data.locale === "id" ? "Terima kasih! Tim kami telah menerima reservasi Anda." : "Thank you! We have received your reservation request."}</p>
					</div>

					<div class="ticket-body">
						<div class="ticket-header">
							<div class="ticket-id-block">
								<span class="ticket-label">{page.data.locale === "id" ? "KODE BOOKING" : "BOOKING REFERENCE"}</span>
								<strong class="ticket-code">{form.booking.bookingCode}</strong>
							</div>
							<div class="ticket-status-pill">
								<span class="status-dot"></span>
								<span>{page.data.locale === "id" ? "Menunggu Konfirmasi" : "Pending Confirmation"}</span>
							</div>
						</div>

						<div class="ticket-grid">
							<div class="ticket-item">
								<span class="ticket-label">{page.data.locale === "id" ? "Layanan" : "Service"}</span>
								<strong class="ticket-val">{form.booking.serviceName}</strong>
							</div>
							<div class="ticket-item">
								<span class="ticket-label">{page.data.locale === "id" ? "Cabang" : "Branch"}</span>
								<strong class="ticket-val">{form.booking.branchName}</strong>
								<small class="ticket-sub">{form.booking.branchAddress}</small>
							</div>
							<div class="ticket-item">
								<span class="ticket-label">{page.data.locale === "id" ? "Nama Hewan" : "Pet Details"}</span>
								<strong class="ticket-val">{form.booking.petName} ({form.booking.petSpecies})</strong>
							</div>
							<div class="ticket-item">
								<span class="ticket-label">{page.data.locale === "id" ? "Waktu Jadwal" : "Scheduled Date"}</span>
								<strong class="ticket-val">
									{new Date(form.booking.startsAt).toLocaleDateString(page.data.locale === "id" ? "id-ID" : "en-US", {
										weekday: "long",
										year: "numeric",
										month: "long",
										day: "numeric"
									})}
								</strong>
							</div>
							<div class="ticket-item">
								<span class="ticket-label">{page.data.locale === "id" ? "Pemilik / Klien" : "Client Contact"}</span>
								<strong class="ticket-val">{form.booking.ownerName}</strong>
								<small class="ticket-sub">{form.booking.ownerPhone}</small>
							</div>
							<div class="ticket-item">
								<span class="ticket-label">{page.data.locale === "id" ? "Total Biaya Estimasi" : "Estimated Total"}</span>
								<strong class="ticket-val price-highlight">{money(form.booking.priceCents)}</strong>
								<small class="ticket-sub">{page.data.locale === "id" ? "Deposit 20%:" : "Estimated 20% Deposit:"} {money(form.booking.depositCents)}</small>
							</div>
						</div>

						<div class="ticket-actions">
							<a href="/?lookup={form.booking.bookingCode}" class="btn btn-primary">
								<Search size={16} />
								<span>{page.data.locale === "id" ? "Lihat di Database Booking" : "View in Booking Database"}</span>
							</a>
							<a href="/" class="btn btn-subtle">
								<Plus size={16} />
								<span>{page.data.locale === "id" ? "Buat Reservasi Lain" : "Make Another Booking"}</span>
							</a>
						</div>
					</div>
				</div>
			</div>
		{:else if activeTab === "book"}
			<!-- ==================== BOOKING WIZARD FORM ==================== -->
			<form method="POST" action="?/book" class="booking-form" onsubmit={() => (isSubmitting = true)}>
				{#if form?.error}
					<div class="alert alert-error">
						<AlertCircle size={18} />
						<span>{form.error}</span>
					</div>
				{/if}

				<div class="wizard-grid">
					<!-- LEFT COLUMN: INTERACTIVE FORM STEPS -->
					<div class="wizard-steps-pane">
						<!-- STEP 1: SERVICE CATEGORY -->
						<div class="step-card">
							<div class="step-header">
								<span class="step-number">1</span>
								<div class="step-title-wrap">
									<h3>{page.data.locale === "id" ? "Pilih Kategori Layanan" : "Choose Service Category"}</h3>
									<p>{page.data.locale === "id" ? "Pilih spesialisasi perawatan yang Anda butuhkan" : "Select the type of pet care required"}</p>
								</div>
							</div>

							<div class="kind-selection-grid">
								<button
									type="button"
									class="kind-card"
									class:selected={selectedKind === "grooming"}
									onclick={() => (selectedKind = "grooming")}
								>
									<span class="kind-icon grooming-icon"><Scissors size={24} /></span>
									<span class="kind-name">{page.data.locale === "id" ? "Grooming & Spa" : "Grooming & Spa"}</span>
									<span class="kind-desc">{page.data.locale === "id" ? "Mandi, potong bulu, kutu & spa" : "Styling, wash, bath & hygiene"}</span>
								</button>

								<button
									type="button"
									class="kind-card"
									class:selected={selectedKind === "hotel"}
									onclick={() => (selectedKind = "hotel")}
								>
									<span class="kind-icon hotel-icon"><Hotel size={24} /></span>
									<span class="kind-name">{page.data.locale === "id" ? "Pet Hotel & Penitipan" : "Pet Hotel & Boarding"}</span>
									<span class="kind-desc">{page.data.locale === "id" ? "Kamar AC, makan & jalan harian" : "Luxury suites & 24/7 care"}</span>
								</button>

								<button
									type="button"
									class="kind-card"
									class:selected={selectedKind === "aquarium"}
									onclick={() => (selectedKind = "aquarium")}
								>
									<span class="kind-icon aquarium-icon"><Fish size={24} /></span>
									<span class="kind-name">{page.data.locale === "id" ? "Perawatan Akuarium" : "Aquarium Service"}</span>
									<span class="kind-desc">{page.data.locale === "id" ? "Aquascape, tes air & filter" : "Biotope care & maintenance"}</span>
								</button>
							</div>
							<input type="hidden" name="kind" value={selectedKind} />
						</div>

						<!-- STEP 2: BRANCH SELECTION -->
						<div class="step-card">
							<div class="step-header">
								<span class="step-number">2</span>
								<div class="step-title-wrap">
									<h3>{page.data.locale === "id" ? "Pilih Cabang PetCo" : "Select Branch Location"}</h3>
									<p>{page.data.locale === "id" ? "Pilih lokasi cabang terdekat dengan Anda" : "Choose the nearest PetCo facility"}</p>
								</div>
							</div>

							<div class="branches-grid">
								{#each data.branches as branch}
									<button
										type="button"
										class="branch-select-card"
										class:selected={selectedBranchId === branch.id}
										onclick={() => (selectedBranchId = branch.id)}
									>
										<div class="branch-card-head">
											<Building2 size={18} class="branch-icon" />
											<strong>{branch.name}</strong>
											{#if branch.isHeadOffice}
												<span class="hq-badge">HQ</span>
											{/if}
										</div>
										<p class="branch-card-city"><MapPin size={13} /> {branch.city || "Jakarta"}</p>
										{#if branch.address}
											<p class="branch-card-address">{branch.address}</p>
										{/if}
									</button>
								{/each}
							</div>
							<input type="hidden" name="branchId" value={selectedBranchId} />
						</div>

						<!-- STEP 3: PACKAGE / ROOM SELECTION -->
						<div class="step-card">
							<div class="step-header">
								<span class="step-number">3</span>
								<div class="step-title-wrap">
									<h3>
										{#if selectedKind === "grooming"}
											{page.data.locale === "id" ? "Pilih Paket Grooming" : "Select Grooming Package"}
										{:else if selectedKind === "hotel"}
											{page.data.locale === "id" ? "Pilih Tipe Kamar Hotel" : "Select Hotel Suite"}
										{:else}
											{page.data.locale === "id" ? "Pilih Paket Layanan Akuarium" : "Select Aquarium Service Plan"}
										{/if}
									</h3>
									<p>{page.data.locale === "id" ? "Pilihan layanan resmi dengan standar kualitas PetCo" : "Certified packages with transparent rates"}</p>
								</div>
							</div>

							{#if selectedKind === "grooming"}
								<div class="packages-list">
									{#each branchServices as svc}
										<button
											type="button"
											class="package-item"
											class:selected={selectedServiceId === svc.id}
											onclick={() => (selectedServiceId = svc.id)}
										>
											<div class="package-info">
												<strong>{svc.name}</strong>
												<span class="package-meta"><Clock size={13} /> {svc.durationMinutes || 60} mins</span>
											</div>
											<div class="package-price">{money(svc.priceCents)}</div>
										</button>
									{/each}
								</div>
								<input type="hidden" name="serviceId" value={selectedServiceId} />

								<!-- Grooming Optional Add-ons -->
								<div class="addons-section">
									<h4 class="addons-heading">{page.data.locale === "id" ? "Layanan Tambahan (Opsional)" : "Optional Add-ons"}</h4>
									<div class="addons-grid">
										{#each data.services.filter((s) => s.name.toLowerCase().includes("flea") || s.name.toLowerCase().includes("teeth") || s.name.toLowerCase().includes("nail") || s.name.toLowerCase().includes("spa") || s.name.toLowerCase().includes("ear")) as addon}
											<label class="addon-chip" class:checked={selectedAddonIds.includes(addon.id)}>
												<input
													type="checkbox"
													name="addonIds"
													value={addon.id}
													checked={selectedAddonIds.includes(addon.id)}
													onchange={() => toggleAddon(addon.id)}
												/>
												<div class="addon-chip-info">
													<span class="addon-name">{addon.name}</span>
													<span class="addon-price">+{money(addon.priceCents)}</span>
												</div>
											</label>
										{/each}
									</div>
								</div>
							{:else if selectedKind === "hotel"}
								<div class="rooms-list">
									{#each branchRooms as rm}
										<button
											type="button"
											class="room-item"
											class:selected={selectedRoomId === rm.id}
											onclick={() => (selectedRoomId = rm.id)}
										>
											<div class="room-info">
												<strong>{rm.name}</strong>
												<span class="room-meta">
													{rm.sizeLabel || "Spacious Suite"} · Max {rm.maxPetWeightKg || 20}kg
												</span>
											</div>
											<div class="room-price">
												<strong>{money(rm.pricePerNightCents)}</strong>
												<small>/{page.data.locale === "id" ? "malam" : "night"}</small>
											</div>
										</button>
									{/each}
								</div>
								<input type="hidden" name="roomId" value={selectedRoomId} />
							{:else}
								<div class="packages-list">
									{#each branchServices as svc}
										<button
											type="button"
											class="package-item"
											class:selected={selectedServiceId === svc.id}
											onclick={() => (selectedServiceId = svc.id)}
										>
											<div class="package-info">
												<strong>{svc.name}</strong>
												<span class="package-meta"><Clock size={13} /> {svc.durationMinutes || 60} mins</span>
											</div>
											<div class="package-price">{money(svc.priceCents)}</div>
										</button>
									{/each}
								</div>
								<input type="hidden" name="serviceId" value={selectedServiceId} />
							{/if}
						</div>

						<!-- STEP 4: SCHEDULE / DATES -->
						<div class="step-card">
							<div class="step-header">
								<span class="step-number">4</span>
								<div class="step-title-wrap">
									<h3>{page.data.locale === "id" ? "Jadwal & Tanggal Kunjungan" : "Schedule & Date Selection"}</h3>
									<p>{page.data.locale === "id" ? "Tentukan waktu kedatangan Anda" : "Choose your preferred appointment time"}</p>
								</div>
							</div>

							{#if selectedKind === "hotel"}
								<div class="dates-row">
									<div class="form-group">
										<label for="checkInDate">{page.data.locale === "id" ? "Tanggal Check-in" : "Check-in Date"}</label>
										<input type="date" id="checkInDate" name="checkInDate" bind:value={checkInDate} required />
									</div>
									<div class="form-group">
										<label for="checkOutDate">{page.data.locale === "id" ? "Tanggal Check-out" : "Check-out Date"}</label>
										<input type="date" id="checkOutDate" name="checkOutDate" bind:value={checkOutDate} required />
									</div>
								</div>
								<div class="hotel-duration-info">
									<span>{page.data.locale === "id" ? "Durasi Menginap:" : "Stay Duration:"}</span>
									<strong>{calculatedNights} {page.data.locale === "id" ? "Malam" : "Nights"}</strong>
								</div>
							{:else}
								<div class="dates-row">
									<div class="form-group">
										<label for="bookingDate">{page.data.locale === "id" ? "Tanggal Layanan" : "Appointment Date"}</label>
										<input type="date" id="bookingDate" name="date" bind:value={bookingDate} required />
									</div>
									<div class="form-group">
										<label for="timeSlotGroup">{page.data.locale === "id" ? "Pilih Jam" : "Select Time Slot"}</label>
										<div id="timeSlotGroup" class="slots-pill-group">
											{#each timeSlots as slot}
												<button
													type="button"
													class="slot-pill"
													class:active={timeSlot === slot}
													onclick={() => (timeSlot = slot)}
												>
													{slot}
												</button>
											{/each}
										</div>
										<input type="hidden" name="timeSlot" value={timeSlot} />
									</div>
								</div>
							{/if}
						</div>

						<!-- STEP 5: PET & OWNER INFORMATION -->
						<div class="step-card">
							<div class="step-header">
								<span class="step-number">5</span>
								<div class="step-title-wrap">
									<h3>{page.data.locale === "id" ? "Informasi Hewan & Kontak Pemilik" : "Pet & Owner Information"}</h3>
									<p>{page.data.locale === "id" ? "Lengkapi data untuk rekam medis dan konfirmasi WhatsApp/Email" : "Details for health dossier and booking confirmation"}</p>
								</div>
							</div>

							<!-- Pet Dossier Section -->
							<div class="sub-form-section">
								<h4 class="sub-form-title"><PawPrint size={16} /> {page.data.locale === "id" ? "Data Hewan Peliharaan" : "Pet Information"}</h4>

								<div class="form-row">
									<div class="form-group">
										<label for="petName">{page.data.locale === "id" ? "Nama Hewan *" : "Pet Name *"}</label>
										<input id="petName" name="petName" type="text" placeholder="e.g. Milo, Luna, Bobby" bind:value={petName} required />
									</div>
									<div class="form-group">
										<label for="speciesSelectGroup">{page.data.locale === "id" ? "Jenis / Spesies" : "Species"}</label>
										<div id="speciesSelectGroup" class="species-select-grid">
											{#each ["dog", "cat", "bird", "reptile", "fish", "other"] as sp}
												<button
													type="button"
													class="species-btn"
													class:active={species === sp}
													onclick={() => (species = sp as any)}
												>
													<span class="species-emoji">{speciesIcons[sp]}</span>
													<span class="species-label">{sp.toUpperCase()}</span>
												</button>
											{/each}
										</div>
										<input type="hidden" name="species" value={species} />
									</div>
								</div>

								<div class="form-row">
									<div class="form-group">
										<label for="breed">{page.data.locale === "id" ? "Ras / Breed (Opsional)" : "Breed (Optional)"}</label>
										<input id="breed" name="breed" type="text" placeholder="e.g. Golden Retriever, Poodle, Persian" bind:value={breed} />
									</div>
									<div class="form-group">
										<label for="weightKg">{page.data.locale === "id" ? "Berat Badan (kg)" : "Weight (kg)"}</label>
										<input id="weightKg" name="weightKg" type="number" step="0.1" min="0.1" max="100" placeholder="e.g. 5.5" bind:value={weightKg} />
									</div>
								</div>

								<div class="form-group">
									<label for="healthNotes">{page.data.locale === "id" ? "Catatan Kesehatan / Alergi / Kebiasaan" : "Health Notes / Allergies / Habits"}</label>
									<textarea id="healthNotes" name="healthNotes" rows="2" placeholder="e.g. Sensitive skin, dislikes nail clipper, special diet" bind:value={healthNotes}></textarea>
								</div>
							</div>

							<!-- Owner Contact Section -->
							<div class="sub-form-section">
								<h4 class="sub-form-title"><User size={16} /> {page.data.locale === "id" ? "Kontak Pemilik" : "Owner Contact Details"}</h4>

								<div class="form-row">
									<div class="form-group">
										<label for="firstName">{page.data.locale === "id" ? "Nama Depan *" : "First Name *"}</label>
										<input id="firstName" name="firstName" type="text" placeholder="e.g. Budi" bind:value={firstName} required />
									</div>
									<div class="form-group">
										<label for="lastName">{page.data.locale === "id" ? "Nama Belakang" : "Last Name"}</label>
										<input id="lastName" name="lastName" type="text" placeholder="e.g. Santoso" bind:value={lastName} />
									</div>
								</div>

								<div class="form-row">
									<div class="form-group">
										<label for="phone">{page.data.locale === "id" ? "Nomor WhatsApp / HP *" : "WhatsApp / Phone Number *"}</label>
										<input id="phone" name="phone" type="tel" placeholder="e.g. 081234567890" bind:value={phone} required />
									</div>
									<div class="form-group">
										<label for="email">{page.data.locale === "id" ? "Email" : "Email Address"}</label>
										<input id="email" name="email" type="email" placeholder="e.g. customer@gmail.com" bind:value={email} />
									</div>
								</div>

								<div class="form-group">
									<label for="notes">{page.data.locale === "id" ? "Permintaan Khusus Tambahan" : "Special Requests or Instructions"}</label>
									<textarea id="notes" name="notes" rows="2" placeholder="e.g. Please pick up around 5pm, extra towel dry" bind:value={bookingNotes}></textarea>
								</div>
							</div>
						</div>
					</div>

					<!-- RIGHT COLUMN: LIVE SUMMARY & SUBMIT -->
					<div class="wizard-summary-pane">
						<div class="summary-card">
							<h3 class="summary-title"><Receipt size={18} /> {page.data.locale === "id" ? "Ringkasan Reservasi" : "Reservation Summary"}</h3>

							<div class="summary-items">
								<div class="sum-row">
									<span>{page.data.locale === "id" ? "Kategori" : "Category"}</span>
									<strong>{selectedKind.toUpperCase()}</strong>
								</div>
								<div class="sum-row">
									<span>{page.data.locale === "id" ? "Cabang" : "Branch"}</span>
									<strong>{selectedBranch?.name ?? "PetCo Branch"}</strong>
								</div>
								{#if selectedKind === "grooming"}
									<div class="sum-row">
										<span>{page.data.locale === "id" ? "Paket" : "Package"}</span>
										<strong>{selectedService?.name ?? "-"}</strong>
									</div>
									<div class="sum-row">
										<span>{page.data.locale === "id" ? "Jadwal" : "Date & Time"}</span>
										<strong>{bookingDate} @ {timeSlot}</strong>
									</div>
									{#if selectedAddonIds.length > 0}
										<div class="sum-row addons-sum">
											<span>{page.data.locale === "id" ? "Add-ons" : "Add-ons"} ({selectedAddonIds.length})</span>
											<strong>+{money(estimatedTotal - (selectedService?.priceCents || 0))}</strong>
										</div>
									{/if}
								{:else if selectedKind === "hotel"}
									<div class="sum-row">
										<span>{page.data.locale === "id" ? "Tipe Kamar" : "Room Suite"}</span>
										<strong>{selectedRoom?.name ?? "-"}</strong>
									</div>
									<div class="sum-row">
										<span>{page.data.locale === "id" ? "Durasi" : "Duration"}</span>
										<strong>{calculatedNights} {page.data.locale === "id" ? "Malam" : "Nights"}</strong>
									</div>
									<div class="sum-row">
										<span>{page.data.locale === "id" ? "Check-in / Out" : "Dates"}</span>
										<small>{checkInDate} → {checkOutDate}</small>
									</div>
								{:else}
									<div class="sum-row">
										<span>{page.data.locale === "id" ? "Layanan" : "Service"}</span>
										<strong>{selectedService?.name ?? "-"}</strong>
									</div>
									<div class="sum-row">
										<span>{page.data.locale === "id" ? "Jadwal" : "Date"}</span>
										<strong>{bookingDate} @ {timeSlot}</strong>
									</div>
								{/if}

								{#if petName}
									<div class="sum-row pet-sum">
										<span>{page.data.locale === "id" ? "Hewan" : "Pet"}</span>
										<strong>{petName} ({species})</strong>
									</div>
								{/if}
							</div>

							<div class="summary-divider"></div>

							<div class="summary-total-block">
								<div class="total-line">
									<span>{page.data.locale === "id" ? "Total Estimasi" : "Total Estimate"}</span>
									<span class="total-amount">{money(estimatedTotal)}</span>
								</div>
								<div class="deposit-line">
									<span>{page.data.locale === "id" ? "Deposit DP 20%:" : "Estimated 20% Deposit:"}</span>
									<span>{money(estimatedDeposit)}</span>
								</div>
							</div>

							<button type="submit" class="btn btn-primary submit-booking-btn" disabled={isSubmitting}>
								{#if isSubmitting}
									<span>{page.data.locale === "id" ? "Memproses Reservasi..." : "Processing..."}</span>
								{:else}
									<CheckCircle2 size={18} />
									<span>{page.data.locale === "id" ? "Konfirmasi & Buat Booking" : "Confirm & Submit Booking"}</span>
								{/if}
							</button>

							<p class="summary-note">
								{page.data.locale === "id"
									? "Pembayaran dapat dilakukan saat check-in di cabang atau melalui transfer saat konfirmasi WhatsApp."
									: "No upfront payment required now. You can settle on arrival or via confirmation transfer."}
							</p>
						</div>
					</div>
				</div>
			</form>
		{:else}
			<!-- ==================== BOOKING DATABASE / LOOKUP TRACKER ==================== -->
			<div class="lookup-wrap">
				<div class="lookup-search-card">
					<h2>{page.data.locale === "id" ? "Database & Pelacak Status Booking" : "Client Booking Database & Tracker"}</h2>
					<p>{page.data.locale === "id" ? "Masukkan Nomor WhatsApp / HP atau Kode Booking (e.g. PET-00012) untuk melihat riwayat reservasi Anda." : "Enter your Phone Number or Booking Reference ID (e.g. PET-00012) to view your reservations."}</p>

					<form method="GET" action="/" class="lookup-form">
						<input type="hidden" name="lookup_tab" value="lookup" />
						<div class="lookup-input-wrap">
							<Search size={18} class="lookup-icon" />
							<input
								type="text"
								name="lookup"
								placeholder={page.data.locale === "id" ? "Ketik Nomor HP atau Kode Booking..." : "Type Phone Number or Booking Code..."}
								bind:value={lookupInput}
								required
							/>
						</div>
						<button type="submit" class="btn btn-primary">
							<Search size={16} />
							<span>{page.data.locale === "id" ? "Cari Booking" : "Search"}</span>
						</button>
					</form>
				</div>

				<!-- RESULTS LIST -->
				{#if data.lookupParam}
					<div class="lookup-results-section">
						<div class="results-header">
							<h3>{page.data.locale === "id" ? "Hasil Pencarian:" : "Search Results for"} “{data.lookupParam}”</h3>
							<span class="results-count">{data.lookupResults.length} {page.data.locale === "id" ? "ditemukan" : "found"}</span>
						</div>

						{#if data.lookupResults.length === 0}
							<div class="empty-lookup-state">
								<AlertCircle size={36} class="empty-icon" />
								<h4>{page.data.locale === "id" ? "Tidak Ada Booking Ditemukan" : "No Bookings Found"}</h4>
								<p>{page.data.locale === "id" ? "Periksa kembali nomor telepon atau kode booking yang Anda masukkan." : "Please check your phone number or booking code and try again."}</p>
								<button class="btn btn-primary" onclick={() => (activeTab = "book")}>
									<Plus size={16} />
									<span>{page.data.locale === "id" ? "Buat Reservasi Baru" : "Make a New Booking"}</span>
								</button>
							</div>
						{:else}
							<div class="booking-cards-grid">
								{#each data.lookupResults as item}
									<div class="client-booking-card">
										<div class="card-top-row">
											<div class="code-and-kind">
												<span class="booking-code-pill">{item.bookingCode}</span>
												<span class="booking-kind-tag {item.kind}">{item.kind.toUpperCase()}</span>
											</div>
											<span class="status-badge {item.status}">
												{item.status.replace("_", " ").toUpperCase()}
											</span>
										</div>

										<div class="card-main-info">
											<h4 class="card-service-name">{item.serviceName || item.roomName || "Pet Care Service"}</h4>
											<div class="card-pet-name"><PawPrint size={14} /> {item.petName ?? "Pet"} ({item.petSpecies ?? "dog"})</div>
										</div>

										<div class="card-details-grid">
											<div class="detail-cell">
												<span class="d-label">{page.data.locale === "id" ? "Cabang" : "Branch"}</span>
												<strong class="d-val">{item.branchName ?? "PetCo"} ({item.branchCity ?? "City"})</strong>
											</div>
											<div class="detail-cell">
												<span class="d-label">{page.data.locale === "id" ? "Jadwal" : "Scheduled"}</span>
												<strong class="d-val">
													{new Date(item.startsAt).toLocaleDateString(page.data.locale === "id" ? "id-ID" : "en-US", {
														weekday: "short",
														month: "short",
														day: "numeric",
														hour: "2-digit",
														minute: "2-digit"
													})}
												</strong>
											</div>
											<div class="detail-cell">
												<span class="d-label">{page.data.locale === "id" ? "Pemilik" : "Client"}</span>
												<strong class="d-val">{item.ownerName}</strong>
											</div>
											<div class="detail-cell">
												<span class="d-label">{page.data.locale === "id" ? "Total Biaya" : "Total Price"}</span>
												<strong class="d-val price">{money(item.priceCents)}</strong>
											</div>
										</div>

										{#if item.notes}
											<p class="card-notes"><em>{item.notes}</em></p>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{/if}
	</main>

	<!-- ==================== FOOTER ==================== -->
	<footer class="portal-footer">
		<div class="footer-container">
			<div class="footer-brand">
				<span class="footer-logo"><PawPrint size={16} /> PetCo</span>
				<p>{page.data.locale === "id" ? "Sistem Layanan Hewan Peliharaan Terpadu · Grooming, Hotel & Akuarium" : "Integrated Pet Care, Grooming & Hotel System"}</p>
			</div>
			<div class="footer-links">
				<a href="/">{page.data.locale === "id" ? "Reservasi Online" : "Online Booking"}</a>
				<a href="/login">{page.data.locale === "id" ? "Masuk Portal Staf" : "Staff Console Login"}</a>
			</div>
		</div>
	</footer>
</div>

<style>
	/* ============ ROOT STYLES ============ */
	.client-portal-root {
		min-height: 100vh;
		background: #f8fafc;
		color: var(--ink);
		font-family: var(--font-sans);
		display: flex;
		flex-direction: column;
	}

	/* ============ PORTAL HEADER ============ */
	.portal-header {
		position: sticky;
		top: 0;
		z-index: 200;
		background: #ffffff;
		border-bottom: 1px solid var(--border);
		box-shadow: 0 1px 4px rgba(15, 23, 42, 0.05);
	}

	.portal-header-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 10px 20px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}

	.brand-link {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		color: var(--ink);
	}

	.brand-emblem {
		width: 36px;
		height: 36px;
		border-radius: 10px;
		background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
		color: #ffffff;
		display: grid;
		place-items: center;
		box-shadow: 0 3px 8px rgba(79, 70, 229, 0.3);
	}

	.brand-copy {
		display: flex;
		flex-direction: column;
		line-height: 1.15;
	}

	.brand-title {
		font-size: 16px;
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	.brand-subtitle {
		font-size: 11px;
		color: var(--muted);
		font-weight: 600;
	}

	.portal-nav {
		display: flex;
		align-items: center;
		gap: 6px;
		background: var(--surface-2);
		padding: 4px;
		border-radius: var(--r-full);
		border: 1px solid var(--border);
	}

	.portal-nav-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 14px;
		border-radius: var(--r-full);
		border: 1px solid transparent;
		background: transparent;
		color: var(--muted);
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		transition: all 140ms ease;
	}

	.portal-nav-btn:hover:not(.active) {
		color: var(--ink);
	}

	.portal-nav-btn.active {
		background: #ffffff;
		color: var(--primary);
		border-color: var(--primary-border);
		box-shadow: 0 1px 4px rgba(79, 70, 229, 0.1);
	}

	.portal-header-right {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.staff-console-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		border-radius: var(--r-md);
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--ink-2);
		font-size: 12px;
		font-weight: 700;
		text-decoration: none;
		transition: all 120ms ease;
	}

	.staff-console-link:hover {
		background: var(--surface-3);
		color: var(--ink);
		border-color: var(--border-strong);
	}

	/* ============ HERO BANNER ============ */
	.portal-hero {
		background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
		color: #ffffff;
		padding: 44px 20px 36px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.hero-container {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.hero-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: rgba(99, 102, 241, 0.2);
		border: 1px solid rgba(129, 140, 248, 0.35);
		color: #c7d2fe;
		padding: 5px 14px;
		border-radius: var(--r-full);
		font-size: 12px;
		font-weight: 700;
		margin-bottom: 16px;
	}

	.sparkle-icon {
		color: #fbbf24;
	}

	.hero-heading {
		font-size: clamp(26px, 4vw, 36px);
		font-weight: 800;
		letter-spacing: -0.03em;
		margin: 0 0 12px;
		color: #ffffff;
		max-width: 760px;
	}

	.hero-description {
		font-size: clamp(14px, 1.8vw, 16px);
		color: #94a3b8;
		max-width: 680px;
		margin: 0 0 24px;
		line-height: 1.5;
	}

	.hero-guarantees {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 16px 24px;
		font-size: 13px;
		color: #cbd5e1;
	}

	.guarantee-item {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}

	.guarantee-item :global(svg) {
		color: #38bdf8;
	}

	/* ============ MAIN CONTAINER ============ */
	.portal-main {
		max-width: 1200px;
		width: 100%;
		margin: 0 auto;
		padding: 32px 20px 64px;
		flex: 1;
	}

	/* ============ WIZARD GRID ============ */
	.wizard-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 380px;
		gap: 28px;
		align-items: start;
	}

	.wizard-steps-pane {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.step-card {
		background: #ffffff;
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 24px;
		box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
	}

	.step-header {
		display: flex;
		align-items: center;
		gap: 14px;
		margin-bottom: 20px;
	}

	.step-number {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--primary-soft);
		color: var(--primary);
		border: 1px solid var(--primary-border);
		display: grid;
		place-items: center;
		font-weight: 800;
		font-size: 14px;
		flex-shrink: 0;
	}

	.step-title-wrap h3 {
		font-size: 16px;
		font-weight: 800;
		margin: 0 0 3px;
		color: var(--ink);
	}

	.step-title-wrap p {
		font-size: 12.5px;
		color: var(--muted);
		margin: 0;
	}

	/* ============ KIND SELECTION GRID ============ */
	.kind-selection-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 14px;
	}

	.kind-card {
		background: var(--surface);
		border: 1.5px solid var(--border);
		border-radius: 14px;
		padding: 18px 14px;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		cursor: pointer;
		transition: all 140ms ease;
	}

	.kind-card:hover {
		border-color: var(--primary-border);
		background: var(--primary-soft);
		transform: translateY(-2px);
	}

	.kind-card.selected {
		border-color: var(--primary);
		background: var(--primary-soft);
		box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
	}

	.kind-icon {
		width: 48px;
		height: 48px;
		border-radius: 12px;
		display: grid;
		place-items: center;
		margin-bottom: 12px;
	}

	.grooming-icon {
		background: #fdf2f8;
		color: #ec4899;
	}

	.hotel-icon {
		background: #ede9fe;
		color: #8b5cf6;
	}

	.aquarium-icon {
		background: #e0f2fe;
		color: #0284c7;
	}

	.kind-name {
		font-size: 14px;
		font-weight: 800;
		color: var(--ink);
		margin-bottom: 4px;
	}

	.kind-desc {
		font-size: 11.5px;
		color: var(--muted);
		line-height: 1.3;
	}

	/* ============ BRANCHES GRID ============ */
	.branches-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 12px;
	}

	.branch-select-card {
		background: var(--surface);
		border: 1.5px solid var(--border);
		border-radius: 12px;
		padding: 14px;
		text-align: left;
		cursor: pointer;
		transition: all 130ms ease;
	}

	.branch-select-card:hover {
		border-color: var(--primary-border);
		background: var(--primary-soft);
	}

	.branch-select-card.selected {
		border-color: var(--primary);
		background: var(--primary-soft);
		box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
	}

	.branch-card-head {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 6px;
	}

	.branch-card-head strong {
		font-size: 13px;
		color: var(--ink);
		flex: 1;
	}

	.branch-icon {
		color: var(--primary);
		flex-shrink: 0;
	}

	.hq-badge {
		font-size: 9px;
		font-weight: 800;
		background: var(--primary);
		color: #ffffff;
		padding: 2px 6px;
		border-radius: var(--r-full);
	}

	.branch-card-city {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 11.5px;
		font-weight: 700;
		color: var(--primary);
		margin: 0 0 4px;
	}

	.branch-card-address {
		font-size: 11px;
		color: var(--muted);
		margin: 0;
		line-height: 1.3;
	}

	/* ============ PACKAGES / ROOMS LIST ============ */
	.packages-list,
	.rooms-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.package-item,
	.room-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14px;
		background: var(--surface);
		border: 1.5px solid var(--border);
		border-radius: 12px;
		padding: 14px 16px;
		cursor: pointer;
		text-align: left;
		transition: all 130ms ease;
	}

	.package-item:hover,
	.room-item:hover {
		border-color: var(--primary-border);
		background: var(--primary-soft);
	}

	.package-item.selected,
	.room-item.selected {
		border-color: var(--primary);
		background: var(--primary-soft);
		box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
	}

	.package-info,
	.room-info {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.package-info strong,
	.room-info strong {
		font-size: 14px;
		font-weight: 750;
		color: var(--ink);
	}

	.package-meta,
	.room-meta {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 12px;
		color: var(--muted);
	}

	.package-price,
	.room-price {
		font-size: 14px;
		font-weight: 800;
		color: var(--primary);
		white-space: nowrap;
		text-align: right;
	}

	.room-price small {
		font-size: 10px;
		color: var(--muted);
		display: block;
	}

	/* Add-ons */
	.addons-section {
		margin-top: 18px;
		padding-top: 16px;
		border-top: 1px solid var(--border);
	}

	.addons-heading {
		font-size: 13px;
		font-weight: 800;
		color: var(--ink);
		margin: 0 0 10px;
	}

	.addons-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 8px;
	}

	.addon-chip {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface-2);
		cursor: pointer;
		font-size: 12px;
		transition: all 120ms ease;
	}

	.addon-chip:hover {
		background: var(--surface-3);
	}

	.addon-chip.checked {
		background: var(--primary-soft);
		border-color: var(--primary-border);
		color: var(--primary);
	}

	.addon-chip-info {
		display: flex;
		flex-direction: column;
	}

	.addon-name {
		font-weight: 700;
	}

	.addon-price {
		font-size: 11px;
		color: var(--primary);
		font-weight: 800;
	}

	/* ============ DATES & TIME SLOTS ============ */
	.dates-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
	}

	.hotel-duration-info {
		margin-top: 12px;
		padding: 8px 14px;
		background: var(--primary-soft);
		border: 1px solid var(--primary-border);
		border-radius: 10px;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		color: var(--primary);
	}

	.slots-pill-group {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 4px;
	}

	.slot-pill {
		padding: 6px 12px;
		border-radius: var(--r-md);
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--ink);
		font-size: 12px;
		font-weight: 700;
		cursor: pointer;
		transition: all 120ms ease;
	}

	.slot-pill:hover {
		border-color: var(--primary-border);
		background: var(--primary-soft);
	}

	.slot-pill.active {
		background: var(--primary);
		color: #ffffff;
		border-color: var(--primary);
	}

	/* ============ FORM FIELDS & SUBSECTIONS ============ */
	.sub-form-section {
		padding: 16px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: 12px;
		margin-bottom: 16px;
	}

	.sub-form-section:last-child {
		margin-bottom: 0;
	}

	.sub-form-title {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13.5px;
		font-weight: 800;
		color: var(--ink);
		margin: 0 0 14px;
	}

	.form-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 12px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 5px;
		margin-bottom: 12px;
	}

	.form-group:last-child {
		margin-bottom: 0;
	}

	.form-group label {
		font-size: 12px;
		font-weight: 750;
		color: var(--ink-2);
	}

	.form-group input,
	.form-group textarea {
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: var(--r-md);
		font-size: 13px;
		color: var(--ink);
		background: #ffffff;
		outline: none;
		transition: border-color 130ms ease;
	}

	.form-group input:focus,
	.form-group textarea:focus {
		border-color: var(--primary);
	}

	/* Species Selector */
	.species-select-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 6px;
	}

	.species-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 6px 8px;
		border: 1px solid var(--border);
		border-radius: var(--r-md);
		background: #ffffff;
		cursor: pointer;
		font-size: 11px;
		font-weight: 750;
		color: var(--ink-2);
		transition: all 120ms ease;
	}

	.species-btn:hover {
		background: var(--surface-3);
	}

	.species-btn.active {
		border-color: var(--primary);
		background: var(--primary-soft);
		color: var(--primary);
	}

	/* ============ RIGHT SUMMARY CARD ============ */
	.summary-card {
		position: sticky;
		top: 80px;
		background: #ffffff;
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 22px;
		box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
	}

	.summary-title {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 16px;
		font-weight: 800;
		color: var(--ink);
		margin: 0 0 16px;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--border);
	}

	.summary-items {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.sum-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 12.5px;
		color: var(--muted);
	}

	.sum-row strong {
		color: var(--ink);
		font-weight: 750;
		text-align: right;
	}

	.sum-row.pet-sum {
		padding: 6px 10px;
		background: var(--surface-2);
		border-radius: var(--r-md);
		border: 1px solid var(--border-subtle);
	}

	.summary-divider {
		height: 1px;
		background: var(--border);
		margin: 16px 0;
	}

	.summary-total-block {
		background: var(--primary-soft);
		border: 1px solid var(--primary-border);
		border-radius: 12px;
		padding: 14px;
		margin-bottom: 18px;
	}

	.total-line {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 13.5px;
		font-weight: 750;
		color: var(--primary);
	}

	.total-amount {
		font-size: 18px;
		font-weight: 800;
	}

	.deposit-line {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 11px;
		color: var(--muted);
		margin-top: 4px;
	}

	.submit-booking-btn {
		width: 100%;
		padding: 12px;
		font-size: 14px;
		font-weight: 800;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		gap: 8px;
	}

	.summary-note {
		font-size: 11px;
		color: var(--muted);
		text-align: center;
		margin: 12px 0 0;
		line-height: 1.35;
	}

	/* ============ CONFIRMATION SCREEN ============ */
	.confirmation-wrap {
		max-width: 680px;
		margin: 0 auto;
	}

	.confirmation-card {
		background: #ffffff;
		border: 1px solid var(--border);
		border-radius: 20px;
		overflow: hidden;
		box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
	}

	.confirm-badge-banner {
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
		color: #ffffff;
		padding: 28px 20px;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.success-icon {
		margin-bottom: 8px;
	}

	.confirm-badge-banner h2 {
		font-size: 22px;
		font-weight: 800;
		margin: 0 0 6px;
	}

	.confirm-badge-banner p {
		font-size: 13.5px;
		color: #d1fae5;
		margin: 0;
	}

	.ticket-body {
		padding: 28px;
	}

	.ticket-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 20px;
		border-bottom: 1.5px dashed var(--border);
		margin-bottom: 20px;
	}

	.ticket-id-block {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.ticket-code {
		font-size: 22px;
		font-weight: 900;
		color: var(--primary);
		letter-spacing: 0.04em;
	}

	.ticket-status-pill {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 5px 12px;
		border-radius: var(--r-full);
		background: #fef3c7;
		color: #b45309;
		font-size: 12px;
		font-weight: 750;
	}

	.status-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #f59e0b;
	}

	.ticket-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 16px;
		margin-bottom: 24px;
	}

	.ticket-item {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.ticket-label {
		font-size: 10.5px;
		font-weight: 800;
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.ticket-val {
		font-size: 14px;
		font-weight: 750;
		color: var(--ink);
	}

	.ticket-val.price-highlight {
		font-size: 16px;
		color: var(--primary);
	}

	.ticket-sub {
		font-size: 11px;
		color: var(--muted);
	}

	.ticket-actions {
		display: flex;
		gap: 12px;
	}

	.ticket-actions a {
		flex: 1;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		gap: 6px;
		padding: 10px;
		font-size: 13px;
		font-weight: 750;
		text-decoration: none;
	}

	/* ============ LOOKUP / BOOKING DATABASE ============ */
	.lookup-wrap {
		max-width: 900px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 28px;
	}

	.lookup-search-card {
		background: #ffffff;
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 28px;
		text-align: center;
		box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
	}

	.lookup-search-card h2 {
		font-size: 22px;
		font-weight: 800;
		margin: 0 0 8px;
		color: var(--ink);
	}

	.lookup-search-card p {
		font-size: 13.5px;
		color: var(--muted);
		max-width: 600px;
		margin: 0 auto 20px;
		line-height: 1.45;
	}

	.lookup-form {
		display: flex;
		gap: 10px;
		max-width: 520px;
		margin: 0 auto;
	}

	.lookup-input-wrap {
		flex: 1;
		position: relative;
		display: flex;
		align-items: center;
	}

	.lookup-icon {
		position: absolute;
		left: 14px;
		color: var(--muted);
		pointer-events: none;
	}

	.lookup-input-wrap input {
		width: 100%;
		padding: 10px 14px 10px 40px;
		border: 1.5px solid var(--border);
		border-radius: var(--r-md);
		font-size: 13.5px;
		outline: none;
		transition: border-color 130ms ease;
	}

	.lookup-input-wrap input:focus {
		border-color: var(--primary);
	}

	.results-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16px;
	}

	.results-header h3 {
		font-size: 16px;
		font-weight: 800;
		color: var(--ink);
		margin: 0;
	}

	.results-count {
		font-size: 12px;
		color: var(--muted);
		font-weight: 700;
	}

	.empty-lookup-state {
		background: #ffffff;
		border: 1px dashed var(--border-strong);
		border-radius: 16px;
		padding: 40px 20px;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.empty-icon {
		color: var(--muted);
	}

	.empty-lookup-state h4 {
		font-size: 16px;
		font-weight: 800;
		margin: 0;
	}

	.empty-lookup-state p {
		font-size: 13px;
		color: var(--muted);
		margin: 0 0 8px;
	}

	.booking-cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
		gap: 16px;
	}

	.client-booking-card {
		background: #ffffff;
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 14px;
		box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
	}

	.card-top-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.code-and-kind {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.booking-code-pill {
		font-size: 13px;
		font-weight: 850;
		color: var(--primary);
		letter-spacing: 0.03em;
	}

	.booking-kind-tag {
		font-size: 10px;
		font-weight: 800;
		padding: 2px 7px;
		border-radius: var(--r-full);
		text-transform: uppercase;
	}

	.booking-kind-tag.grooming {
		background: #fdf2f8;
		color: #db2777;
	}

	.booking-kind-tag.hotel {
		background: #ede9fe;
		color: #7c3aed;
	}

	.booking-kind-tag.aquarium {
		background: #e0f2fe;
		color: #0284c7;
	}

	.status-badge {
		font-size: 11px;
		font-weight: 800;
		padding: 3px 9px;
		border-radius: var(--r-full);
	}

	.status-badge.pending {
		background: #fef3c7;
		color: #b45309;
	}

	.status-badge.confirmed {
		background: #d1fae5;
		color: #047857;
	}

	.status-badge.checked_in {
		background: #dbeafe;
		color: #1d4ed8;
	}

	.status-badge.completed {
		background: #f3e8ff;
		color: #6b21a8;
	}

	.status-badge.cancelled {
		background: #fee2e2;
		color: #b91c1c;
	}

	.card-service-name {
		font-size: 15px;
		font-weight: 800;
		color: var(--ink);
		margin: 0 0 3px;
	}

	.card-pet-name {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 12.5px;
		color: var(--muted);
		font-weight: 600;
	}

	.card-details-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
		padding-top: 10px;
		border-top: 1px solid var(--border);
	}

	.detail-cell {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.d-label {
		font-size: 10.5px;
		font-weight: 750;
		color: var(--muted);
		text-transform: uppercase;
	}

	.d-val {
		font-size: 12px;
		font-weight: 700;
		color: var(--ink);
	}

	.d-val.price {
		color: var(--primary);
		font-weight: 800;
	}

	.card-notes {
		font-size: 11px;
		color: var(--muted);
		margin: 0;
		padding: 6px 10px;
		background: var(--surface-2);
		border-radius: var(--r-sm);
	}

	/* ============ FOOTER ============ */
	.portal-footer {
		background: #ffffff;
		border-top: 1px solid var(--border);
		padding: 24px 20px;
		margin-top: auto;
	}

	.footer-container {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}

	.footer-logo {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-weight: 800;
		color: var(--primary);
		font-size: 14px;
	}

	.footer-brand p {
		font-size: 11.5px;
		color: var(--muted);
		margin: 3px 0 0;
	}

	.footer-links {
		display: flex;
		gap: 18px;
	}

	.footer-links a {
		color: var(--muted);
		font-size: 12px;
		font-weight: 600;
		text-decoration: none;
		transition: color 120ms ease;
	}

	.footer-links a:hover {
		color: var(--primary);
	}

	/* ============ RESPONSIVE BREAKPOINTS ============ */
	@media (max-width: 960px) {
		.wizard-grid {
			grid-template-columns: 1fr;
		}

		.portal-nav span {
			font-size: 12px;
		}

		.booking-cards-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 640px) {
		.portal-header-container {
			flex-wrap: wrap;
		}

		.portal-nav {
			order: 3;
			width: 100%;
			justify-content: center;
		}

		.ticket-grid {
			grid-template-columns: 1fr;
		}

		.ticket-actions {
			flex-direction: column;
		}

		.lookup-form {
			flex-direction: column;
		}
	}
</style>
