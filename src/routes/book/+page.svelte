<script lang="ts">
	import { page } from "$app/state";
	import { formatRupiah as money } from "$lib/util";
	import { makeT } from "$lib/i18n/t";
	import LanguageSwitcher from "$lib/components/LanguageSwitcher.svelte";
	import DatePicker from "$lib/components/DatePicker.svelte";
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
		ArrowUpRight,
		Sparkles,
		ShieldCheck,
		User,
		Receipt,
		Building2,
		HeartHandshake,
		ChevronRight,
		Check,
		ExternalLink
	} from "@lucide/svelte";

	let { data } = $props();
	const form = $derived(page.form);
	const t = $derived(makeT(page.data.locale ?? "en"));
	const isId = $derived(page.data.locale === "id");

	// Active tab: 'book' (Online Booking Wizard) or 'lookup' (Booking Database & Status Tracker)
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
		if (data.initialTab === "lookup") {
			activeTab = "lookup";
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
	<title>{isId ? "Reservasi & Database Booking · PetCo Semarang" : "Client Booking & Reservation Database · PetCo Semarang"}</title>
</svelte:head>

<div class="neobrutalist-booking-root overflow-x-hidden w-full max-w-full">
	<!-- ==================== TOP NAVIGATION BAR ==================== -->
	<header class="neo-header">
		<div class="neo-header-inner">
			<a href="/" class="neo-brand">
				<span class="brand-box"><PawPrint size={19} strokeWidth={2.6} /></span>
				<div class="brand-text-block">
					<span class="brand-title">PETCO</span>
					<span class="brand-city-tag">SEMARANG // BOOKING</span>
				</div>
			</a>

			<!-- Tab Mode Navigation -->
			<div class="neo-tab-toggle" role="tablist">
				<button
					class="tab-toggle-btn"
					class:active={activeTab === "book"}
					onclick={() => (activeTab = "book")}
					role="tab"
					aria-selected={activeTab === "book"}
				>
					<Calendar size={15} />
					<span>{isId ? "[ RESERVASI BARU ]" : "[ NEW BOOKING ]"}</span>
				</button>

				<button
					class="tab-toggle-btn"
					class:active={activeTab === "lookup"}
					onclick={() => (activeTab = "lookup")}
					role="tab"
					aria-selected={activeTab === "lookup"}
				>
					<Search size={15} />
					<span>{isId ? "[ DATABASE STATUS ]" : "[ TRACK STATUS ]"}</span>
				</button>
			</div>

			<!-- Right Actions -->
			<div class="neo-nav-actions">
				<a href="/" class="neo-home-btn">
					<ArrowLeft size={14} />
					<span>{isId ? "BERANDA" : "HOME"}</span>
				</a>
				<LanguageSwitcher value={page.data.locale ?? "en"} currentPath="/book" />
				<a href="/dashboard" class="neo-staff-btn" title="Staff Management Console">
					<User size={13} />
					<span class="staff-label">{isId ? "STAF" : "STAFF"}</span>
				</a>
			</div>
		</div>
	</header>

	<!-- ==================== HERO HEADER STRIP ==================== -->
	<section class="neo-booking-hero">
		<div class="neo-container">
			<div class="hero-tag-strip">
				<span class="status-indicator"></span>
				<span class="tag-label">{isId ? "KOTA SEMARANG // PORTAL RESERVASI RESMI" : "SEMARANG CITY // OFFICIAL RESERVATION PORTAL"}</span>
			</div>

			<h1 class="hero-page-title">
				{activeTab === "book"
					? (isId ? "RESERVASI SALON GROOMING & HOTEL HEWAN SEMARANG." : "BOOK YOUR PET APPOINTMENT IN SEMARANG.")
					: (isId ? "DATABASE & PELACAK STATUS BOOKING KLIEN." : "CLIENT BOOKING DATABASE & TRACKER.")}
			</h1>

			<p class="hero-page-sub">
				{activeTab === "book"
					? (isId ? "Pilih cabang terdekat di Kota Semarang (Simpang Lima, Candi Baru, Banyumanik, Puri Anjasmoro, Ngaliyan) dan lengkapi data anabul untuk reservasi instan." : "Select your preferred Semarang facility and configure your pet's appointment in 5 simple steps.")
					: (isId ? "Ketik Nomor WhatsApp atau Kode Booking (e.g. PET-00012) untuk melihat riwayat perawatan dan status konfirmasi anabul Anda." : "Lookup your booking history and live confirmation status using your phone number or reference code.")}
			</p>
		</div>
	</section>

	<!-- ==================== MAIN BOOKING / LOOKUP CONTAINER ==================== -->
	<main class="neo-main-content">
		<div class="neo-container">
			{#if form?.success && form.booking}
				<!-- ==================== NEOBRUTALIST CONFIRMATION TICKET ==================== -->
				<div class="neo-ticket-wrapper">
					<div class="neo-ticket-card">
						<div class="ticket-badge-banner">
							<span class="t-check-icon"><CheckCircle2 size={32} strokeWidth={2.5} /></span>
							<h2>{isId ? "RESERVASI BERHASIL DIDAFTARKAN!" : "RESERVATION SUCCESSFULLY REGISTERED!"}</h2>
							<p>{isId ? "Terima kasih! Jadwal Anda telah tercatat di sistem PetCo Semarang." : "Thank you! Your appointment has been recorded in the PetCo Semarang system."}</p>
						</div>

						<div class="ticket-body-content">
							<div class="ticket-top-meta">
								<div class="ticket-code-group">
									<span class="t-label">{isId ? "[ KODE BOOKING RESMI ]" : "[ OFFICIAL BOOKING CODE ]"}</span>
									<strong class="t-huge-code">{form.booking.bookingCode}</strong>
								</div>
								<div class="t-status-badge yellow">
									<span class="status-pulse"></span>
									<span>{isId ? "MENUNGGU KONFIRMASI" : "PENDING CONFIRMATION"}</span>
								</div>
							</div>

							<div class="ticket-perforated-line"></div>

							<div class="ticket-data-grid">
								<div class="t-data-cell">
									<span class="t-label">{isId ? "Layanan" : "Service"}</span>
									<strong class="t-val">{form.booking.serviceName}</strong>
								</div>
								<div class="t-data-cell">
									<span class="t-label">{isId ? "Cabang Semarang" : "Semarang Facility"}</span>
									<strong class="t-val">{form.booking.branchName}</strong>
									<small class="t-sub">{form.booking.branchAddress}</small>
								</div>
								<div class="t-data-cell">
									<span class="t-label">{isId ? "Data Anabul" : "Pet Details"}</span>
									<strong class="t-val">{form.booking.petName} ({form.booking.petSpecies.toUpperCase()})</strong>
								</div>
								<div class="t-data-cell">
									<span class="t-label">{isId ? "Waktu Jadwal" : "Scheduled Time"}</span>
									<strong class="t-val">
										{new Date(form.booking.startsAt).toLocaleDateString(isId ? "id-ID" : "en-US", {
											weekday: "long",
											year: "numeric",
											month: "long",
											day: "numeric"
										})}
									</strong>
								</div>
								<div class="t-data-cell">
									<span class="t-label">{isId ? "Kontak Pemilik" : "Client Contact"}</span>
									<strong class="t-val">{form.booking.ownerName}</strong>
									<small class="t-sub">{form.booking.ownerPhone}</small>
								</div>
								<div class="t-data-cell highlight-cell">
									<span class="t-label">{isId ? "Total Biaya Estimasi" : "Total Price Estimate"}</span>
									<strong class="t-val price-large">{money(form.booking.priceCents)}</strong>
									<small class="t-sub">{isId ? "Deposit DP 20%:" : "Estimated 20% Deposit:"} {money(form.booking.depositCents)}</small>
								</div>
							</div>

							<div class="ticket-actions-bar">
								<a href="/book?lookup={form.booking.bookingCode}" class="neo-btn neo-btn-primary">
									<Search size={16} />
									<span>{isId ? "LIHAT DI DATABASE BOOKING" : "VIEW IN DATABASE"}</span>
								</a>
								<a href="/book" class="neo-btn neo-btn-subtle">
									<Plus size={16} />
									<span>{isId ? "BUAT RESERVASI LAIN" : "MAKE ANOTHER BOOKING"}</span>
								</a>
							</div>
						</div>
					</div>
				</div>
			{:else if activeTab === "book"}
				<!-- ==================== 5-STEP NEOBRUTALIST BOOKING WIZARD ==================== -->
				<form method="POST" action="?/book" class="booking-wizard-form" onsubmit={() => (isSubmitting = true)}>
					{#if form?.error}
						<div class="neo-alert-error">
							<AlertCircle size={18} />
							<span>{form.error}</span>
						</div>
					{/if}

					<div class="wizard-two-column-layout">
						<!-- LEFT COLUMN: INTERACTIVE FORM STEPS -->
						<div class="wizard-steps-container">
							<!-- STEP 1: SERVICE CATEGORY -->
							<div class="neo-step-box">
								<div class="step-head-strip">
									<span class="step-num-box">01</span>
									<div class="step-text-wrap">
										<h3>{isId ? "PILIH KATEGORI LAYANAN" : "SELECT SERVICE DISCIPLINE"}</h3>
										<p>{isId ? "Pilih spesialisasi perawatan yang Anda butuhkan di Semarang" : "Choose the type of pet care required"}</p>
									</div>
								</div>

								<div class="neo-kind-grid">
									<button
										type="button"
										class="kind-btn-neo"
										class:selected={selectedKind === "grooming"}
										onclick={() => (selectedKind = "grooming")}
									>
										<span class="kind-icon-square pink"><Scissors size={24} /></span>
										<span class="kind-title">{isId ? "Grooming & Spa" : "Grooming & Spa"}</span>
										<span class="kind-subtitle">{isId ? "Mandi, potong bulu & spa" : "Styling & hygiene"}</span>
									</button>

									<button
										type="button"
										class="kind-btn-neo"
										class:selected={selectedKind === "hotel"}
										onclick={() => (selectedKind = "hotel")}
									>
										<span class="kind-icon-square purple"><Hotel size={24} /></span>
										<span class="kind-title">{isId ? "Pet Hotel 24 Jam" : "24/7 Pet Hotel"}</span>
										<span class="kind-subtitle">{isId ? "Kamar AC & jalan harian" : "Luxury boarding"}</span>
									</button>

									<button
										type="button"
										class="kind-btn-neo"
										class:selected={selectedKind === "aquarium"}
										onclick={() => (selectedKind = "aquarium")}
									>
										<span class="kind-icon-square blue"><Fish size={24} /></span>
										<span class="kind-title">{isId ? "Layanan Akuarium" : "Aquatic Care"}</span>
										<span class="kind-subtitle">{isId ? "Aquascape & tes air" : "Biotope maintenance"}</span>
									</button>
								</div>
								<input type="hidden" name="kind" value={selectedKind} />
							</div>

							<!-- STEP 2: SEMARANG BRANCH SELECTION -->
							<div class="neo-step-box">
								<div class="step-head-strip">
									<span class="step-num-box">02</span>
									<div class="step-text-wrap">
										<h3>{isId ? "PILIH CABANG KOTA SEMARANG" : "SELECT SEMARANG FACILITY"}</h3>
										<p>{isId ? "Pilih lokasi cabang PetCo terdekat dengan domisili Anda" : "Choose your preferred Semarang facility"}</p>
									</div>
								</div>

								<div class="neo-branch-grid">
									{#each data.branches as branch}
										<button
											type="button"
											class="branch-btn-neo"
											class:selected={selectedBranchId === branch.id}
											onclick={() => (selectedBranchId = branch.id)}
										>
											<div class="b-card-top">
												<Building2 size={16} class="b-icon" />
												<strong>{branch.name}</strong>
												{#if branch.isHeadOffice}
													<span class="b-tag-flag">HQ</span>
												{/if}
											</div>
											<div class="b-card-loc"><MapPin size={12} /> {branch.city || "Semarang"}</div>
											{#if branch.address}
												<div class="b-card-detail">{branch.address}</div>
											{/if}
										</button>
									{/each}
								</div>
								<input type="hidden" name="branchId" value={selectedBranchId} />
							</div>

							<!-- STEP 3: PACKAGE / ROOM SELECTION -->
							<div class="neo-step-box">
								<div class="step-head-strip">
									<span class="step-num-box">03</span>
									<div class="step-text-wrap">
										<h3>
											{#if selectedKind === "grooming"}
												{isId ? "PILIH PAKET GROOMING" : "SELECT GROOMING PACKAGE"}
											{:else if selectedKind === "hotel"}
												{isId ? "PILIH TIPE KAMAR HOTEL" : "SELECT HOTEL SUITE"}
											{:else}
												{isId ? "PILIH LAYANAN AKUARIUM" : "SELECT AQUATIC SERVICE"}
											{/if}
										</h3>
										<p>{isId ? "Tarif resmi terdaftar dengan standar kualitas PetCo" : "Certified service tier with itemized transparent rates"}</p>
									</div>
								</div>

								{#if selectedKind === "grooming"}
									<div class="neo-items-stack">
										{#each branchServices as svc}
											<button
												type="button"
												class="item-select-btn"
												class:selected={selectedServiceId === svc.id}
												onclick={() => (selectedServiceId = svc.id)}
											>
												<div class="item-meta">
													<strong>{svc.name}</strong>
													<span><Clock size={12} /> {svc.durationMinutes || 60} mins</span>
												</div>
												<div class="item-price">{money(svc.priceCents)}</div>
											</button>
										{/each}
									</div>
									<input type="hidden" name="serviceId" value={selectedServiceId} />

									<!-- Grooming Add-ons -->
									<div class="neo-addons-compartment">
										<span class="addons-tag">{isId ? "[ LAYANAN TAMBAHAN OPSIONAL ]" : "[ OPTIONAL ADD-ONS ]"}</span>
										<div class="addons-chips-wrap">
											{#each data.services.filter((s) => s.name.toLowerCase().includes("flea") || s.name.toLowerCase().includes("teeth") || s.name.toLowerCase().includes("nail") || s.name.toLowerCase().includes("spa") || s.name.toLowerCase().includes("ear")) as addon}
												<label class="addon-toggle-neo" class:checked={selectedAddonIds.includes(addon.id)}>
													<input
														type="checkbox"
														name="addonIds"
														value={addon.id}
														checked={selectedAddonIds.includes(addon.id)}
														onchange={() => toggleAddon(addon.id)}
													/>
													<div class="addon-info-block">
														<span class="a-title">{addon.name}</span>
														<strong class="a-price">+{money(addon.priceCents)}</strong>
													</div>
												</label>
											{/each}
										</div>
									</div>
								{:else if selectedKind === "hotel"}
									<div class="neo-items-stack">
										{#each branchRooms as rm}
											<button
												type="button"
												class="item-select-btn"
												class:selected={selectedRoomId === rm.id}
												onclick={() => (selectedRoomId = rm.id)}
											>
												<div class="item-meta">
													<strong>{rm.name}</strong>
													<span>{rm.sizeLabel || "Private Suite"} · Max {rm.maxPetWeightKg || 20}kg</span>
												</div>
												<div class="item-price">
													<strong>{money(rm.pricePerNightCents)}</strong>
													<small>/{isId ? "malam" : "night"}</small>
												</div>
											</button>
										{/each}
									</div>
									<input type="hidden" name="roomId" value={selectedRoomId} />
								{:else}
									<div class="neo-items-stack">
										{#each branchServices as svc}
											<button
												type="button"
												class="item-select-btn"
												class:selected={selectedServiceId === svc.id}
												onclick={() => (selectedServiceId = svc.id)}
											>
												<div class="item-meta">
													<strong>{svc.name}</strong>
													<span><Clock size={12} /> {svc.durationMinutes || 60} mins</span>
												</div>
												<div class="item-price">{money(svc.priceCents)}</div>
											</button>
										{/each}
									</div>
									<input type="hidden" name="serviceId" value={selectedServiceId} />
								{/if}
							</div>

							<!-- STEP 4: SCHEDULE & DATES -->
							<div class="neo-step-box">
								<div class="step-head-strip">
									<span class="step-num-box">04</span>
									<div class="step-text-wrap">
										<h3>{isId ? "JADWAL & WAKTU KEDATANGAN" : "SCHEDULE & TIME SELECTION"}</h3>
										<p>{isId ? "Tentukan waktu janji temu di cabang Semarang" : "Choose your appointment arrival window"}</p>
									</div>
								</div>

								{#if selectedKind === "hotel"}
									<div class="neo-form-row">
										<div class="neo-form-group">
											<DatePicker
												id="checkInDate"
												name="checkInDate"
												label={isId ? "Tanggal Check-in" : "Check-in Date"}
												bind:value={checkInDate}
												required
											/>
										</div>
										<div class="neo-form-group">
											<DatePicker
												id="checkOutDate"
												name="checkOutDate"
												label={isId ? "Tanggal Check-out" : "Check-out Date"}
												bind:value={checkOutDate}
												required
											/>
										</div>
									</div>
									<div class="hotel-stay-pill">
										<span>{isId ? "Total Durasi Menginap:" : "Stay Duration:"}</span>
										<strong>{calculatedNights} {isId ? "Malam" : "Nights"}</strong>
									</div>
								{:else}
									<div class="neo-form-row">
										<div class="neo-form-group">
											<DatePicker
												id="bookingDate"
												name="date"
												label={isId ? "Tanggal Layanan" : "Appointment Date"}
												bind:value={bookingDate}
												required
											/>
										</div>
										<div class="neo-form-group">
											<label for="timeSlotContainer">{isId ? "Pilih Jam Kedatangan" : "Select Arrival Slot"}</label>
											<div id="timeSlotContainer" class="time-slots-deck">
												{#each timeSlots as slot}
													<button
														type="button"
														class="slot-btn-neo"
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

							<!-- STEP 5: PET & OWNER DOSSIER -->
							<div class="neo-step-box">
								<div class="step-head-strip">
									<span class="step-num-box">05</span>
									<div class="step-text-wrap">
										<h3>{isId ? "DATA HEWAN & KONTAK PEMILIK" : "PET & CLIENT DOSSIER"}</h3>
										<p>{isId ? "Lengkapi rekam medis digital dan nomor WhatsApp untuk laporan berkala" : "Details for digital records and WhatsApp photo updates"}</p>
									</div>
								</div>

								<!-- Pet Section -->
								<div class="neo-sub-compartment">
									<div class="sub-head"><PawPrint size={15} /> <span>{isId ? "[ DATA ANABUL ]" : "[ COMPANION PET ]"}</span></div>

									<div class="neo-form-row">
										<div class="neo-form-group">
											<label for="petName">{isId ? "Nama Hewan *" : "Pet Name *"}</label>
											<input id="petName" name="petName" type="text" placeholder="e.g. Milo, Luna, Bobby" bind:value={petName} required />
										</div>
										<div class="neo-form-group">
											<label for="speciesContainer">{isId ? "Spesies" : "Species"}</label>
											<div id="speciesContainer" class="species-chips-grid">
												{#each ["dog", "cat", "bird", "reptile", "fish", "other"] as sp}
													<button
														type="button"
														class="species-chip-neo"
														class:active={species === sp}
														onclick={() => (species = sp as any)}
													>
														<span>{speciesIcons[sp]}</span>
														<strong>{sp.toUpperCase()}</strong>
													</button>
												{/each}
											</div>
											<input type="hidden" name="species" value={species} />
										</div>
									</div>

									<div class="neo-form-row">
										<div class="neo-form-group">
											<label for="breed">{isId ? "Ras / Breed (Opsional)" : "Breed (Optional)"}</label>
											<input id="breed" name="breed" type="text" placeholder="e.g. Toy Poodle, Golden, Persian" bind:value={breed} />
										</div>
										<div class="neo-form-group">
											<label for="weightKg">{isId ? "Berat Badan (kg)" : "Weight (kg)"}</label>
											<input id="weightKg" name="weightKg" type="number" step="0.1" min="0.1" max="100" placeholder="e.g. 4.5" bind:value={weightKg} />
										</div>
									</div>

									<div class="neo-form-group">
										<label for="healthNotes">{isId ? "Catatan Kesehatan / Alergi / Pantangan" : "Allergies & Medical Notes"}</label>
										<textarea id="healthNotes" name="healthNotes" rows="2" placeholder="e.g. Sensitive skin, dislikes ear touch, special diet" bind:value={healthNotes}></textarea>
									</div>
								</div>

								<!-- Owner Section -->
								<div class="neo-sub-compartment">
									<div class="sub-head"><User size={15} /> <span>{isId ? "[ KONTAK KLIEN ]" : "[ CLIENT CONTACT ]"}</span></div>

									<div class="neo-form-row">
										<div class="neo-form-group">
											<label for="firstName">{isId ? "Nama Depan *" : "First Name *"}</label>
											<input id="firstName" name="firstName" type="text" placeholder="e.g. Budi" bind:value={firstName} required />
										</div>
										<div class="neo-form-group">
											<label for="lastName">{isId ? "Nama Belakang" : "Last Name"}</label>
											<input id="lastName" name="lastName" type="text" placeholder="e.g. Santoso" bind:value={lastName} />
										</div>
									</div>

									<div class="neo-form-row">
										<div class="neo-form-group">
											<label for="phone">{isId ? "Nomor WhatsApp / HP *" : "WhatsApp Phone Number *"}</label>
											<input id="phone" name="phone" type="tel" placeholder="e.g. 081234567890" bind:value={phone} required />
										</div>
										<div class="neo-form-group">
											<label for="email">{isId ? "Email" : "Email Address"}</label>
											<input id="email" name="email" type="email" placeholder="e.g. client@gmail.com" bind:value={email} />
										</div>
									</div>

									<div class="neo-form-group">
										<label for="notes">{isId ? "Instruksi / Permintaan Khusus" : "Special Instructions"}</label>
										<textarea id="notes" name="notes" rows="2" placeholder="e.g. Pick up at 5pm, extra towel dry" bind:value={bookingNotes}></textarea>
									</div>
								</div>
							</div>
						</div>

						<!-- RIGHT COLUMN: STICKY NEOBRUTALIST SUMMARY CARD -->
						<div class="wizard-summary-col">
							<div class="neo-summary-card">
								<div class="sum-card-header">
									<Receipt size={17} />
									<h3>{isId ? "RINGKASAN RESERVASI" : "RESERVATION SUMMARY"}</h3>
								</div>

								<div class="sum-items-list">
									<div class="sum-data-row">
										<span>{isId ? "Layanan" : "Service"}</span>
										<strong>{selectedKind.toUpperCase()}</strong>
									</div>
									<div class="sum-data-row">
										<span>{isId ? "Cabang Semarang" : "Facility"}</span>
										<strong>{selectedBranch?.name ?? "PetCo Semarang"}</strong>
									</div>
									{#if selectedKind === "grooming"}
										<div class="sum-data-row">
											<span>{isId ? "Paket" : "Package"}</span>
											<strong>{selectedService?.name ?? "-"}</strong>
										</div>
										<div class="sum-data-row">
											<span>{isId ? "Jadwal" : "Schedule"}</span>
											<strong>{bookingDate} @ {timeSlot}</strong>
										</div>
										{#if selectedAddonIds.length > 0}
											<div class="sum-data-row addon-row">
												<span>Add-ons ({selectedAddonIds.length})</span>
												<strong>+{money(estimatedTotal - (selectedService?.priceCents || 0))}</strong>
											</div>
										{/if}
									{:else if selectedKind === "hotel"}
										<div class="sum-data-row">
											<span>{isId ? "Tipe Suite" : "Room Suite"}</span>
											<strong>{selectedRoom?.name ?? "-"}</strong>
										</div>
										<div class="sum-data-row">
											<span>{isId ? "Durasi" : "Duration"}</span>
											<strong>{calculatedNights} {isId ? "Malam" : "Nights"}</strong>
										</div>
										<div class="sum-data-row">
											<span>{isId ? "Tanggal Inap" : "Dates"}</span>
											<small>{checkInDate} → {checkOutDate}</small>
										</div>
									{:else}
										<div class="sum-data-row">
											<span>{isId ? "Layanan" : "Service"}</span>
											<strong>{selectedService?.name ?? "-"}</strong>
										</div>
										<div class="sum-data-row">
											<span>{isId ? "Jadwal" : "Date"}</span>
											<strong>{bookingDate} @ {timeSlot}</strong>
										</div>
									{/if}

									{#if petName}
										<div class="sum-data-row pet-row">
											<span>{isId ? "Anabul" : "Pet"}</span>
											<strong>{petName} ({species.toUpperCase()})</strong>
										</div>
									{/if}
								</div>

								<div class="sum-divider"></div>

								<div class="sum-total-box">
									<div class="t-line">
										<span>{isId ? "ESTIMASI TOTAL" : "ESTIMATED TOTAL"}</span>
										<strong class="t-amount">{money(estimatedTotal)}</strong>
									</div>
									<div class="d-line">
										<span>{isId ? "Deposit DP 20%:" : "Estimated 20% Deposit:"}</span>
										<span>{money(estimatedDeposit)}</span>
									</div>
								</div>

								<button type="submit" class="neo-btn neo-btn-lg neo-btn-primary w-full submit-cta" disabled={isSubmitting}>
									{#if isSubmitting}
										<span>{isId ? "MEMPROSES..." : "PROCESSING..."}</span>
									{:else}
										<CheckCircle2 size={18} />
										<span>{isId ? "KONFIRMASI BOOKING" : "CONFIRM RESERVATION"}</span>
									{/if}
								</button>

								<p class="sum-foot-note">
									{isId
										? "Pembayaran dapat diselesaikan saat check-in di cabang Semarang atau via transfer saat konfirmasi WhatsApp tim kami."
										: "No immediate charge required. Settle on arrival or via confirmation transfer."}
								</p>
							</div>
						</div>
					</div>
				</form>
			{:else}
				<!-- ==================== CLIENT BOOKING DATABASE TRACKER ==================== -->
				<div class="neo-lookup-container">
					<div class="neo-search-card">
						<span class="sec-index">[ SEARCH_TELEMETRY ]</span>
						<h2>{isId ? "PELACAK STATUS & DATABASE BOOKING KLIEN" : "CLIENT BOOKING DATABASE & TRACKER"}</h2>
						<p>{isId ? "Ketik Nomor WhatsApp / HP atau Kode Booking (e.g. PET-00012) untuk melihat riwayat reservasi anabul Anda di Semarang." : "Enter your WhatsApp phone number or booking reference code (e.g. PET-00012) to view your appointments."}</p>

						<form method="GET" action="/book" class="neo-search-bar">
							<input type="hidden" name="lookup_tab" value="lookup" />
							<div class="search-input-wrap">
								<Search size={18} class="search-ico" />
								<input
									type="text"
									name="lookup"
									placeholder={isId ? "Ketik Nomor HP WhatsApp atau Kode Booking..." : "Type Phone Number or Booking Code..."}
									bind:value={lookupInput}
									required
								/>
							</div>
							<button type="submit" class="neo-btn neo-btn-primary">
								<Search size={15} />
								<span>{isId ? "CARI" : "SEARCH"}</span>
							</button>
						</form>
					</div>

					<!-- RESULTS -->
					{#if data.lookupParam}
						<div class="lookup-results-deck">
							<div class="results-meta-bar">
								<h3>{isId ? "HASIL PENCARIAN:" : "SEARCH RESULTS FOR"} “{data.lookupParam}”</h3>
								<span class="results-badge">{data.lookupResults.length} {isId ? "RECORD DITEMUKAN" : "RECORDS FOUND"}</span>
							</div>

							{#if data.lookupResults.length === 0}
								<div class="neo-empty-box">
									<AlertCircle size={36} class="empty-icon" />
									<h4>{isId ? "Tidak Ada Data Booking Ditemukan" : "No Booking Records Found"}</h4>
									<p>{isId ? "Periksa kembali nomor telepon atau kode booking yang Anda masukkan." : "Please double-check your phone number or booking code."}</p>
									<button class="neo-btn neo-btn-primary" onclick={() => (activeTab = "book")}>
										<Plus size={16} />
										<span>{isId ? "BUAT RESERVASI BARU" : "MAKE NEW BOOKING"}</span>
									</button>
								</div>
							{:else}
								<div class="neo-records-grid">
									{#each data.lookupResults as item}
										<div class="neo-record-card">
											<div class="r-card-top">
												<div class="r-code-group">
													<span class="r-code-box">{item.bookingCode}</span>
													<span class="r-kind-tag">{item.kind.toUpperCase()}</span>
												</div>
												<span class="r-status-badge {item.status}">
													{item.status.replace("_", " ").toUpperCase()}
												</span>
											</div>

											<div class="r-card-main">
												<h4>{item.serviceName || item.roomName || "Pet Care Service"}</h4>
												<div class="r-pet-name"><PawPrint size={14} /> {item.petName ?? "Pet"} ({item.petSpecies ?? "dog"})</div>
											</div>

											<div class="r-data-grid">
												<div class="r-cell">
													<span class="rc-label">{isId ? "Cabang Semarang" : "Facility"}</span>
													<strong class="rc-val">{item.branchName ?? "PetCo"} ({item.branchCity ?? "Semarang"})</strong>
												</div>
												<div class="r-cell">
													<span class="rc-label">{isId ? "Waktu Jadwal" : "Scheduled Time"}</span>
													<strong class="rc-val">
														{new Date(item.startsAt).toLocaleDateString(isId ? "id-ID" : "en-US", {
															weekday: "short",
															month: "short",
															day: "numeric",
															hour: "2-digit",
															minute: "2-digit"
														})}
													</strong>
												</div>
												<div class="r-cell">
													<span class="rc-label">{isId ? "Pemilik / Klien" : "Client"}</span>
													<strong class="rc-val">{item.ownerName}</strong>
												</div>
												<div class="r-cell">
													<span class="rc-label">{isId ? "Total Biaya" : "Total Price"}</span>
													<strong class="rc-val price">{money(item.priceCents)}</strong>
												</div>
											</div>

											{#if item.notes}
												<p class="r-notes"><em>{item.notes}</em></p>
											{/if}
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</main>

	<!-- ==================== SWISS INDUSTRIAL FOOTER ==================== -->
	<footer class="neo-footer">
		<div class="neo-container">
			<div class="footer-grid-neo">
				<div class="footer-brand-col">
					<div class="f-brand">
						<span class="f-box"><PawPrint size={18} strokeWidth={2.6} /></span>
						<span class="f-title">PETCO SEMARANG</span>
					</div>
					<p class="f-tagline">
						{isId
							? "Pusat ekosistem perawatan hewan peliharaan, salon grooming berstandar ras, hotel 24 jam ber-AC, dan rekayasa aquascape profesional di Kota Semarang."
							: "Integrated companion animal wellness, certified styling salons, 24/7 climate-controlled boarding suites, and aquatic biotope engineering in Semarang City."}
					</p>
					<div class="f-cert-row">
						<span>[ SEMARANG ONLY ]</span>
						<span>[ VET-GATED ]</span>
						<span>[ HEPA-FILTERED ]</span>
					</div>
				</div>

				<div class="footer-nav-col">
					<h5>{isId ? "LAYANAN" : "SERVICES"}</h5>
					<a href="/book?kind=grooming">{isId ? "Grooming & Spa" : "Styling & Spa"}</a>
					<a href="/book?kind=hotel">{isId ? "Hotel Penitipan 24 Jam" : "24/7 Hotel Boarding"}</a>
					<a href="/book?kind=aquarium">{isId ? "Layanan Akuarium" : "Aquatic Ecosystems"}</a>
					<a href="/#pricing">{isId ? "Katalog Tarif" : "Pricing Catalog"}</a>
				</div>

				<div class="footer-nav-col">
					<h5>{isId ? "CABANG SEMARANG" : "SEMARANG FACILITIES"}</h5>
					<a href="/book?branch=1">Kantor Pusat (Simpang Lima)</a>
					<a href="/book?branch=2">Cabang Candi Hills (Gajahmungkur)</a>
					<a href="/book?branch=3">Cabang Banyumanik (Semarang Atas)</a>
					<a href="/book?branch=4">Cabang Puri Anjasmoro (Semarang Barat)</a>
					<a href="/book?branch=5">Cabang Ngaliyan (Semarang Barat)</a>
				</div>

				<div class="footer-nav-col">
					<h5>{isId ? "SISTEM" : "SYSTEM"}</h5>
					<a href="/book">{isId ? "Portal Reservasi Klien" : "Client Booking Portal"}</a>
					<a href="/book?lookup=1">{isId ? "Cek Database Booking" : "Track Booking Database"}</a>
					<a href="/dashboard" class="f-staff-tag">{isId ? "Portal Staf →" : "Staff Console →"}</a>
				</div>
			</div>

			<div class="footer-bottom-neo">
				<span>© {new Date().getFullYear()} PETCO SEMARANG. ALL RIGHTS RESERVED.</span>
				<div class="f-meta-links">
					<span>KOTA SEMARANG, JAWA TENGAH</span>
					<span>·</span>
					<span>BILINGUAL SYSTEM (EN / ID)</span>
				</div>
			</div>
		</div>
	</footer>
</div>

<style>
	/* ============ BASE NEOBRUTALIST TOKENS ============ */
	.neobrutalist-booking-root {
		background: #faf8f5;
		color: #0f172a;
		font-family: "Satoshi", "Plus Jakarta Sans", -apple-system, sans-serif;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	h1, h2, h3, h4, h5, .brand-title, .f-title {
		font-family: "Cabinet Grotesk", "Outfit", "Satoshi", sans-serif;
		letter-spacing: -0.02em;
	}

	.neo-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 24px;
		width: 100%;
	}

	/* Buttons */
	.neo-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		font-family: "Cabinet Grotesk", "Outfit", sans-serif;
		font-weight: 850;
		text-decoration: none;
		border: 2px solid #0f172a;
		border-radius: 8px;
		cursor: pointer;
		transition: transform 100ms ease, box-shadow 100ms ease;
		user-select: none;
	}

	.neo-btn-sm {
		padding: 7px 14px;
		font-size: 12px;
		box-shadow: 3px 3px 0px #0f172a;
	}

	.neo-btn-lg {
		padding: 14px 28px;
		font-size: 14.5px;
		box-shadow: 4px 4px 0px #0f172a;
	}

	.neo-btn-primary {
		background: #4f46e5;
		color: #ffffff;
	}

	.neo-btn-primary:hover {
		background: #4338ca;
		transform: translate(-1px, -1px);
		box-shadow: 5px 5px 0px #0f172a;
	}

	.neo-btn-primary:active {
		transform: translate(2px, 2px);
		box-shadow: 1px 1px 0px #0f172a;
	}

	.neo-btn-secondary {
		background: #ffffff;
		color: #0f172a;
	}

	.neo-btn-secondary:hover {
		background: #f8fafc;
		transform: translate(-1px, -1px);
		box-shadow: 5px 5px 0px #0f172a;
	}

	.neo-btn-secondary:active {
		transform: translate(2px, 2px);
		box-shadow: 1px 1px 0px #0f172a;
	}

	.neo-btn-subtle {
		background: #ffffff;
		color: #0f172a;
		padding: 9px 14px;
		font-size: 12.5px;
		box-shadow: 3px 3px 0px #0f172a;
	}

	.neo-btn-subtle:hover {
		background: #fef08a;
		transform: translate(-1px, -1px);
		box-shadow: 4px 4px 0px #0f172a;
	}

	.w-full {
		width: 100%;
	}

	/* ============ HEADER ============ */
	.neo-header {
		position: sticky;
		top: 0;
		z-index: 500;
		background: #ffffff;
		border-bottom: 2.5px solid #0f172a;
	}

	.neo-header-inner {
		max-width: 1240px;
		margin: 0 auto;
		padding: 12px 24px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}

	.neo-brand {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		color: #0f172a;
	}

	.brand-box {
		width: 34px;
		height: 34px;
		border: 2px solid #0f172a;
		background: #facc15;
		display: grid;
		place-items: center;
		border-radius: 6px;
		box-shadow: 2px 2px 0px #0f172a;
	}

	.brand-text-block {
		display: flex;
		flex-direction: column;
		line-height: 1.1;
	}

	.brand-title {
		font-size: 19px;
		font-weight: 950;
		letter-spacing: -0.03em;
	}

	.brand-city-tag {
		font-family: "JetBrains Mono", monospace;
		font-size: 9.5px;
		font-weight: 850;
		color: #4f46e5;
		letter-spacing: 0.06em;
	}

	/* Tab Toggle */
	.neo-tab-toggle {
		display: flex;
		align-items: center;
		gap: 6px;
		background: #f1f5f9;
		padding: 4px;
		border: 2px solid #0f172a;
		border-radius: 8px;
		box-shadow: 2px 2px 0px #0f172a;
	}

	.tab-toggle-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		border-radius: 5px;
		border: 1.5px solid transparent;
		background: transparent;
		font-family: "JetBrains Mono", monospace;
		font-size: 11.5px;
		font-weight: 850;
		color: #475569;
		cursor: pointer;
		transition: all 100ms ease;
	}

	.tab-toggle-btn.active {
		background: #ffffff;
		color: #0f172a;
		border-color: #0f172a;
		box-shadow: 2px 2px 0px #0f172a;
	}

	.neo-nav-actions {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.neo-home-btn {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-family: "JetBrains Mono", monospace;
		font-size: 11.5px;
		font-weight: 850;
		color: #0f172a;
		text-decoration: none;
		padding: 6px 10px;
		border: 2px solid #0f172a;
		border-radius: 6px;
		background: #ffffff;
		box-shadow: 2px 2px 0px #0f172a;
	}

	.neo-home-btn:hover {
		background: #fef08a;
		transform: translate(-1px, -1px);
	}

	.neo-staff-btn {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 7px 11px;
		border: 2px solid #0f172a;
		border-radius: 6px;
		background: #f1f5f9;
		color: #0f172a;
		font-size: 11px;
		font-weight: 850;
		text-decoration: none;
		box-shadow: 2px 2px 0px #0f172a;
	}

	/* ============ HERO STRIP ============ */
	.neo-booking-hero {
		padding: 44px 0 36px;
		background: #f4f1ea;
		border-bottom: 2.5px solid #0f172a;
	}

	.hero-tag-strip {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: #ffffff;
		border: 2px solid #0f172a;
		padding: 4px 10px;
		border-radius: 6px;
		box-shadow: 2px 2px 0px #0f172a;
		margin-bottom: 14px;
	}

	.status-indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #10b981;
		border: 1.5px solid #0f172a;
	}

	.tag-label {
		font-family: "JetBrains Mono", monospace;
		font-size: 10.5px;
		font-weight: 850;
		color: #0f172a;
	}

	.hero-page-title {
		font-size: clamp(24px, 3.6vw, 38px);
		font-weight: 950;
		letter-spacing: -0.03em;
		color: #0f172a;
		margin: 0 0 10px;
	}

	.hero-page-sub {
		font-size: 14px;
		color: #475569;
		max-width: 720px;
		line-height: 1.5;
		margin: 0;
	}

	/* ============ MAIN CONTENT ============ */
	.neo-main-content {
		padding: 44px 0 72px;
		flex: 1;
	}

	.wizard-two-column-layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 380px;
		gap: 28px;
		align-items: start;
	}

	.wizard-steps-container {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.neo-step-box {
		background: #ffffff;
		border: 2px solid #0f172a;
		border-radius: 10px;
		padding: 24px;
		box-shadow: 4px 4px 0px #0f172a;
	}

	.step-head-strip {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 20px;
	}

	.step-num-box {
		width: 32px;
		height: 32px;
		background: #facc15;
		border: 2px solid #0f172a;
		border-radius: 6px;
		display: grid;
		place-items: center;
		font-family: "JetBrains Mono", monospace;
		font-size: 13px;
		font-weight: 950;
		box-shadow: 2px 2px 0px #0f172a;
		flex-shrink: 0;
	}

	.step-text-wrap h3 {
		font-size: 16px;
		font-weight: 900;
		margin: 0 0 2px;
		color: #0f172a;
	}

	.step-text-wrap p {
		font-size: 12px;
		color: #64748b;
		margin: 0;
	}

	/* Kind Selection */
	.neo-kind-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 14px;
	}

	.kind-btn-neo {
		background: #faf8f5;
		border: 2px solid #0f172a;
		border-radius: 8px;
		padding: 16px 12px;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		cursor: pointer;
		box-shadow: 3px 3px 0px #0f172a;
		transition: all 100ms ease;
	}

	.kind-btn-neo:hover {
		background: #fef08a;
		transform: translate(-1px, -1px);
	}

	.kind-btn-neo.selected {
		background: #fef08a;
		border-width: 2.5px;
		box-shadow: 4px 4px 0px #0f172a;
	}

	.kind-icon-square {
		width: 44px;
		height: 44px;
		border: 2px solid #0f172a;
		border-radius: 8px;
		display: grid;
		place-items: center;
		margin-bottom: 10px;
		box-shadow: 2px 2px 0px #0f172a;
	}

	.kind-icon-square.pink { background: #fbcfe8; color: #db2777; }
	.kind-icon-square.purple { background: #e9d5ff; color: #7c3aed; }
	.kind-icon-square.blue { background: #bae6fd; color: #0284c7; }

	.kind-title {
		font-size: 14px;
		font-weight: 900;
		color: #0f172a;
		margin-bottom: 2px;
	}

	.kind-subtitle {
		font-size: 11.5px;
		color: #64748b;
	}

	/* Branch Selection */
	.neo-branch-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 12px;
	}

	.branch-btn-neo {
		background: #faf8f5;
		border: 2px solid #0f172a;
		border-radius: 8px;
		padding: 14px;
		text-align: left;
		cursor: pointer;
		box-shadow: 3px 3px 0px #0f172a;
		transition: all 100ms ease;
	}

	.branch-btn-neo:hover {
		background: #eff6ff;
		transform: translate(-1px, -1px);
	}

	.branch-btn-neo.selected {
		background: #eff6ff;
		border-color: #4f46e5;
		box-shadow: 4px 4px 0px #4f46e5;
	}

	.b-card-top {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 6px;
	}

	.b-card-top strong {
		font-size: 13px;
		color: #0f172a;
		flex: 1;
	}

	.b-tag-flag {
		font-family: "JetBrains Mono", monospace;
		font-size: 9px;
		font-weight: 900;
		background: #0f172a;
		color: #facc15;
		padding: 1px 5px;
		border-radius: 3px;
	}

	.b-card-loc {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 11px;
		font-weight: 800;
		color: #4f46e5;
		margin-bottom: 4px;
	}

	.b-card-detail {
		font-size: 11px;
		color: #64748b;
		line-height: 1.35;
	}

	/* Items Selection */
	.neo-items-stack {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.item-select-btn {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14px;
		background: #faf8f5;
		border: 2px solid #0f172a;
		border-radius: 8px;
		padding: 14px 16px;
		cursor: pointer;
		text-align: left;
		box-shadow: 3px 3px 0px #0f172a;
		transition: all 100ms ease;
	}

	.item-select-btn:hover {
		background: #fefce8;
		transform: translate(-1px, -1px);
	}

	.item-select-btn.selected {
		background: #fefce8;
		border-color: #0f172a;
		box-shadow: 4px 4px 0px #0f172a;
	}

	.item-meta strong {
		font-size: 14px;
		font-weight: 850;
		color: #0f172a;
		display: block;
	}

	.item-meta span {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 11.5px;
		color: #64748b;
		margin-top: 2px;
	}

	.item-price {
		font-size: 15px;
		font-weight: 950;
		color: #0f172a;
		text-align: right;
	}

	/* Add-ons Compartment */
	.neo-addons-compartment {
		margin-top: 18px;
		padding-top: 16px;
		border-top: 2px dashed #cbd5e1;
	}

	.addons-tag {
		font-family: "JetBrains Mono", monospace;
		font-size: 11px;
		font-weight: 850;
		color: #4f46e5;
		display: block;
		margin-bottom: 10px;
	}

	.addons-chips-wrap {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 8px;
	}

	.addon-toggle-neo {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		border: 1.5px solid #0f172a;
		border-radius: 6px;
		background: #faf8f5;
		cursor: pointer;
		box-shadow: 2px 2px 0px #0f172a;
	}

	.addon-toggle-neo.checked {
		background: #fef08a;
	}

	.addon-info-block {
		display: flex;
		flex-direction: column;
	}

	.a-title { font-size: 11.5px; font-weight: 750; color: #0f172a; }
	.a-price { font-size: 11px; font-weight: 900; color: #4f46e5; }

	/* Form Elements */
	.neo-form-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 12px;
	}

	.neo-form-group {
		display: flex;
		flex-direction: column;
		gap: 5px;
		margin-bottom: 12px;
	}

	.neo-form-group:last-child {
		margin-bottom: 0;
	}

	.neo-form-group label {
		font-size: 12px;
		font-weight: 850;
		color: #0f172a;
	}

	.neo-form-group input,
	.neo-form-group textarea {
		padding: 9px 12px;
		border: 2px solid #0f172a;
		border-radius: 6px;
		font-size: 13px;
		color: #0f172a;
		background: #ffffff;
		outline: none;
		box-shadow: 2px 2px 0px #0f172a;
	}

	.neo-form-group input:focus,
	.neo-form-group textarea:focus {
		border-color: #4f46e5;
		box-shadow: 3px 3px 0px #4f46e5;
	}

	/* Time Slots */
	.time-slots-deck {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.slot-btn-neo {
		padding: 6px 12px;
		border: 1.5px solid #0f172a;
		border-radius: 6px;
		background: #ffffff;
		color: #0f172a;
		font-family: "JetBrains Mono", monospace;
		font-size: 11.5px;
		font-weight: 850;
		cursor: pointer;
		box-shadow: 2px 2px 0px #0f172a;
	}

	.slot-btn-neo.active {
		background: #0f172a;
		color: #facc15;
	}

	.hotel-stay-pill {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 8px 14px;
		background: #fef08a;
		border: 2px solid #0f172a;
		border-radius: 6px;
		box-shadow: 2px 2px 0px #0f172a;
		font-size: 12.5px;
		color: #0f172a;
		margin-top: 8px;
	}

	/* Sub Compartment */
	.neo-sub-compartment {
		background: #faf8f5;
		border: 2px solid #0f172a;
		border-radius: 8px;
		padding: 18px;
		margin-bottom: 16px;
	}

	.sub-head {
		display: flex;
		align-items: center;
		gap: 6px;
		font-family: "JetBrains Mono", monospace;
		font-size: 11px;
		font-weight: 900;
		color: #4f46e5;
		margin-bottom: 14px;
	}

	/* Species Chips */
	.species-chips-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 6px;
	}

	.species-chip-neo {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		padding: 6px 4px;
		border: 1.5px solid #0f172a;
		border-radius: 6px;
		background: #ffffff;
		cursor: pointer;
		font-size: 11px;
		font-weight: 850;
		color: #0f172a;
	}

	.species-chip-neo.active {
		background: #facc15;
		box-shadow: 2px 2px 0px #0f172a;
	}

	/* Sticky Summary Card */
	.neo-summary-card {
		position: sticky;
		top: 80px;
		background: #ffffff;
		border: 2.5px solid #0f172a;
		border-radius: 12px;
		padding: 24px;
		box-shadow: 5px 5px 0px #0f172a;
	}

	.sum-card-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding-bottom: 12px;
		border-bottom: 2px solid #0f172a;
		margin-bottom: 16px;
	}

	.sum-card-header h3 {
		font-size: 15px;
		font-weight: 950;
		margin: 0;
		color: #0f172a;
	}

	.sum-items-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.sum-data-row {
		display: flex;
		justify-content: space-between;
		font-size: 12px;
		color: #64748b;
	}

	.sum-data-row strong {
		color: #0f172a;
		font-weight: 800;
	}

	.sum-data-row.pet-row {
		padding: 6px 8px;
		background: #fef08a;
		border: 1.5px solid #0f172a;
		border-radius: 6px;
	}

	.sum-divider {
		height: 2px;
		border-top: 2px dashed #cbd5e1;
		margin: 16px 0;
	}

	.sum-total-box {
		background: #faf8f5;
		border: 2px solid #0f172a;
		border-radius: 8px;
		padding: 14px;
		margin-bottom: 18px;
	}

	.t-line {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		font-size: 12px;
		font-weight: 900;
	}

	.t-amount {
		font-size: 20px;
		color: #4f46e5;
	}

	.d-line {
		display: flex;
		justify-content: space-between;
		font-size: 11px;
		color: #64748b;
		margin-top: 4px;
	}

	.submit-cta {
		padding: 13px;
	}

	.sum-foot-note {
		font-size: 10.5px;
		color: #64748b;
		text-align: center;
		margin: 10px 0 0;
		line-height: 1.35;
	}

	/* ============ TICKET SCREEN ============ */
	.neo-ticket-wrapper {
		max-width: 680px;
		margin: 0 auto;
	}

	.neo-ticket-card {
		background: #ffffff;
		border: 3px solid #0f172a;
		border-radius: 14px;
		overflow: hidden;
		box-shadow: 6px 6px 0px #0f172a;
	}

	.ticket-badge-banner {
		background: #facc15;
		border-bottom: 2.5px solid #0f172a;
		padding: 24px 20px;
		text-align: center;
		color: #0f172a;
	}

	.ticket-badge-banner h2 {
		font-size: 20px;
		font-weight: 950;
		margin: 6px 0 2px;
	}

	.ticket-badge-banner p {
		font-size: 12.5px;
		font-weight: 600;
		margin: 0;
	}

	.ticket-body-content {
		padding: 28px;
	}

	.ticket-top-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 18px;
	}

	.ticket-code-group {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.t-label {
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		font-weight: 850;
		color: #64748b;
	}

	.t-huge-code {
		font-size: 24px;
		font-weight: 950;
		color: #4f46e5;
		letter-spacing: 0.05em;
	}

	.t-status-badge {
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		font-weight: 900;
		padding: 4px 10px;
		border: 1.5px solid #0f172a;
		border-radius: 6px;
		background: #fef08a;
		color: #0f172a;
		box-shadow: 2px 2px 0px #0f172a;
	}

	.ticket-perforated-line {
		height: 2px;
		border-top: 2px dashed #0f172a;
		margin-bottom: 20px;
	}

	.ticket-data-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 14px;
		margin-bottom: 24px;
	}

	.t-data-cell {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.t-val {
		font-size: 13.5px;
		font-weight: 800;
		color: #0f172a;
	}

	.t-val.price-large {
		font-size: 16px;
		color: #4f46e5;
	}

	.t-sub {
		font-size: 11px;
		color: #64748b;
	}

	.ticket-actions-bar {
		display: flex;
		gap: 12px;
	}

	.ticket-actions-bar a {
		flex: 1;
	}

	/* ============ LOOKUP ============ */
	.neo-lookup-container {
		max-width: 900px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 28px;
	}

	.neo-search-card {
		background: #ffffff;
		border: 2.5px solid #0f172a;
		border-radius: 12px;
		padding: 32px 24px;
		text-align: center;
		box-shadow: 5px 5px 0px #0f172a;
	}

	.neo-search-card h2 {
		font-size: 22px;
		font-weight: 950;
		margin: 4px 0 8px;
		color: #0f172a;
	}

	.neo-search-card p {
		font-size: 13.5px;
		color: #475569;
		max-width: 600px;
		margin: 0 auto 20px;
	}

	.neo-search-bar {
		display: flex;
		gap: 10px;
		max-width: 520px;
		margin: 0 auto;
	}

	.search-input-wrap {
		flex: 1;
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-ico {
		position: absolute;
		left: 14px;
		color: #64748b;
	}

	.search-input-wrap input {
		width: 100%;
		padding: 10px 14px 10px 40px;
		border: 2px solid #0f172a;
		border-radius: 6px;
		font-size: 13px;
		color: #0f172a;
		outline: none;
		box-shadow: 2px 2px 0px #0f172a;
	}

	.lookup-results-deck {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.results-meta-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.results-meta-bar h3 {
		font-size: 14px;
		font-weight: 900;
		margin: 0;
	}

	.results-badge {
		font-family: "JetBrains Mono", monospace;
		font-size: 11px;
		font-weight: 850;
		background: #facc15;
		border: 1.5px solid #0f172a;
		padding: 2px 7px;
		border-radius: 4px;
	}

	.neo-empty-box {
		background: #ffffff;
		border: 2px dashed #0f172a;
		border-radius: 10px;
		padding: 40px 20px;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.neo-records-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
		gap: 16px;
	}

	.neo-record-card {
		background: #ffffff;
		border: 2px solid #0f172a;
		border-radius: 10px;
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		box-shadow: 4px 4px 0px #0f172a;
	}

	.r-card-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.r-code-group {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.r-code-box {
		font-family: "JetBrains Mono", monospace;
		font-size: 12.5px;
		font-weight: 950;
		color: #4f46e5;
	}

	.r-kind-tag {
		font-size: 9.5px;
		font-weight: 900;
		background: #f1f5f9;
		border: 1.5px solid #0f172a;
		padding: 1px 6px;
		border-radius: 3px;
	}

	.r-status-badge {
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		font-weight: 900;
		padding: 3px 8px;
		border: 1.5px solid #0f172a;
		border-radius: 4px;
	}

	.r-status-badge.pending { background: #fef08a; }
	.r-status-badge.confirmed { background: #a7f3d0; }
	.r-status-badge.checked_in { background: #bae6fd; }
	.r-status-badge.completed { background: #e9d5ff; }
	.r-status-badge.cancelled { background: #fecaca; }

	.r-card-main h4 {
		font-size: 15px;
		font-weight: 900;
		margin: 0 0 2px;
		color: #0f172a;
	}

	.r-pet-name {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 12px;
		color: #64748b;
		font-weight: 600;
	}

	.r-data-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
		padding-top: 10px;
		border-top: 1.5px dashed #cbd5e1;
	}

	.r-cell {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.rc-label {
		font-size: 9.5px;
		font-weight: 850;
		color: #64748b;
		text-transform: uppercase;
	}

	.rc-val {
		font-size: 11.5px;
		font-weight: 800;
		color: #0f172a;
	}

	.rc-val.price {
		color: #4f46e5;
	}

	.r-notes {
		font-size: 11px;
		color: #64748b;
		background: #f8fafc;
		border: 1px solid #cbd5e1;
		padding: 5px 8px;
		border-radius: 4px;
		margin: 0;
	}

	.neo-alert-error {
		background: #fecaca;
		border: 2px solid #0f172a;
		border-radius: 8px;
		padding: 12px 16px;
		display: flex;
		align-items: center;
		gap: 10px;
		color: #991b1b;
		font-weight: 750;
		font-size: 13px;
		margin-bottom: 20px;
		box-shadow: 3px 3px 0px #0f172a;
	}

	/* ============ FOOTER ============ */
	.neo-footer {
		background: #0f172a;
		color: #ffffff;
		border-top: 3px solid #0f172a;
		padding: 60px 0 28px;
		margin-top: auto;
	}

	.footer-grid-neo {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr 1.2fr;
		gap: 36px;
		padding-bottom: 40px;
		border-bottom: 1px solid #334155;
	}

	.footer-brand-col {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.f-brand {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.f-box {
		width: 30px;
		height: 30px;
		background: #facc15;
		color: #0f172a;
		border: 1.5px solid #ffffff;
		display: grid;
		place-items: center;
		border-radius: 4px;
	}

	.f-title {
		font-size: 18px;
		font-weight: 950;
		color: #ffffff;
	}

	.f-tagline {
		font-size: 12.5px;
		color: #94a3b8;
		line-height: 1.55;
		margin: 0;
		max-width: 340px;
	}

	.f-cert-row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		font-weight: 850;
		color: #facc15;
	}

	.footer-nav-col h5 {
		font-family: "JetBrains Mono", monospace;
		font-size: 12px;
		font-weight: 900;
		letter-spacing: 0.08em;
		color: #facc15;
		margin: 0 0 14px;
	}

	.footer-nav-col a {
		display: block;
		font-size: 13px;
		color: #cbd5e1;
		text-decoration: none;
		margin-bottom: 8px;
		transition: color 100ms ease;
	}

	.footer-nav-col a:hover {
		color: #facc15;
	}

	.f-staff-tag {
		display: inline-block;
		margin-top: 6px;
		background: #1e293b;
		border: 1.5px solid #475569;
		color: #facc15 !important;
		padding: 4px 9px;
		border-radius: 4px;
		font-size: 11px;
		font-weight: 850;
	}

	.footer-bottom-neo {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		padding-top: 22px;
		font-family: "JetBrains Mono", monospace;
		font-size: 11px;
		color: #64748b;
		gap: 10px;
	}

	.f-meta-links {
		display: flex;
		gap: 8px;
	}

	/* ============ RESPONSIVE BREAKPOINTS ============ */
	@media (max-width: 960px) {
		.wizard-two-column-layout {
			grid-template-columns: 1fr;
		}

		.footer-grid-neo {
			grid-template-columns: 1fr 1fr;
		}
	}

	@media (max-width: 640px) {
		.neo-header-inner {
			flex-wrap: wrap;
		}

		.neo-tab-toggle {
			order: 3;
			width: 100%;
			justify-content: center;
		}

		.ticket-data-grid {
			grid-template-columns: 1fr;
		}

		.ticket-actions-bar {
			flex-direction: column;
		}

		.neo-search-bar {
			flex-direction: column;
		}

		.staff-label {
			display: none;
		}

		.footer-grid-neo {
			grid-template-columns: 1fr;
		}
	}
</style>
