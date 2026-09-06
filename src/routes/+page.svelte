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
		Sparkles,
		ShieldCheck,
		User,
		Receipt,
		Building2,
		HeartHandshake,
		ChevronRight,
		Star,
		ShoppingBag,
		HelpCircle,
		Award,
		Zap,
		Check
	} from "@lucide/svelte";

	let { data } = $props();
	const t = $derived(makeT(page.data.locale ?? "en"));
	const isId = $derived(page.data.locale === "id");

	function scrollToSection(id: string) {
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({ behavior: "smooth" });
		}
	}
</script>

<svelte:head>
	<title>{isId ? "PetCo · Pusat Perawatan Hewan, Grooming, Hotel & Akuarium" : "PetCo · Premier Pet Care, Luxury Hotel & Aquarium Center"}</title>
	<meta
		name="description"
		content={isId
			? "Pusat layanan hewan peliharaan terpadu di Indonesia. Grooming profesional, pet hotel 24 jam ber-AC, aquascape & toko kebutuhan hewan di Jakarta, Tangerang & Surabaya."
			: "Indonesia's leading pet care destination. Professional styling, 24/7 climate-controlled boarding, aquarium maintenance & premium pet retail across Jakarta & Java."}
	/>
</svelte:head>

<div class="landing-page-root">
	<!-- ==================== TOP NAVBAR ==================== -->
	<header class="top-nav">
		<div class="nav-container">
			<div class="nav-brand">
				<a href="/" class="brand-link">
					<span class="brand-emblem"><PawPrint size={20} /></span>
					<div class="brand-copy">
						<span class="brand-title">PetCo</span>
						<span class="brand-tagline">Care · Hotel · Aquarium</span>
					</div>
				</a>
			</div>

			<!-- Main Navigation Links -->
			<nav class="nav-links-center" aria-label="Main Navigation">
				<a href="#about" onclick={(e) => { e.preventDefault(); scrollToSection('about'); }}>{isId ? "Tentang Kami" : "About"}</a>
				<a href="#services" onclick={(e) => { e.preventDefault(); scrollToSection('services'); }}>{isId ? "Layanan" : "Services"}</a>
				<a href="#why-petco" onclick={(e) => { e.preventDefault(); scrollToSection('why-petco'); }}>{isId ? "Keunggulan" : "Why PetCo"}</a>
				<a href="#branches" onclick={(e) => { e.preventDefault(); scrollToSection('branches'); }}>{isId ? "Cabang" : "Locations"}</a>
				<a href="#pricing" onclick={(e) => { e.preventDefault(); scrollToSection('pricing'); }}>{isId ? "Tarif" : "Pricing"}</a>
				<a href="#reviews" onclick={(e) => { e.preventDefault(); scrollToSection('reviews'); }}>{isId ? "Ulasan" : "Reviews"}</a>
				<a href="#faq" onclick={(e) => { e.preventDefault(); scrollToSection('faq'); }}>FAQ</a>
			</nav>

			<!-- Header Right Controls -->
			<div class="nav-right-actions">
				<LanguageSwitcher value={page.data.locale ?? "en"} currentPath="/" />
				<a href="/book" class="btn btn-primary btn-sm header-book-btn">
					<Calendar size={14} />
					<span>{isId ? "Reservasi Online" : "Book Online"}</span>
				</a>
				<a href="/dashboard" class="staff-link" title={isId ? "Masuk Portal Staf" : "Staff Console"}>
					<User size={14} />
					<span class="staff-text">{isId ? "Staf" : "Staff"}</span>
				</a>
			</div>
		</div>
	</header>

	<!-- ==================== HERO SECTION ==================== -->
	<section class="hero-section">
		<div class="hero-backdrop-glow"></div>
		<div class="hero-container">
			<div class="hero-pill-badge">
				<Sparkles size={14} class="badge-sparkle" />
				<span>{isId ? "Pusat Layanan Hewan Peliharaan & Akuarium Terpadu" : "Indonesia's Premier Pet Care & Aquatic Ecosystem"}</span>
			</div>

			<h1 class="hero-title">
				{#if isId}
					Perawatan Mewah, Hotel 24 Jam &amp; <span class="gradient-text">Spesialis Hewan Terpercaya</span>
				{:else}
					Luxury Pet Care, 24/7 Boarding &amp; <span class="gradient-text">Trusted Veterinary Standards</span>
				{/if}
			</h1>

			<p class="hero-lead">
				{#if isId}
					PetCo menghadirkan layanan grooming dengan sertifikasi internasional, hotel ber-AC dengan pemantauan CCTV 24/7, perawatan aquascape profesional, dan rekam medis digital terpusat di seluruh jaringan cabang kami.
				{:else}
					PetCo provides certified breed-specific styling, climate-controlled luxury boarding suites with 24/7 live updates, custom aquascape biotope engineering, and centralized health dossiers across all branch facilities.
				{/if}
			</p>

			<div class="hero-cta-group">
				<a href="/book" class="btn btn-primary hero-btn-main">
					<Calendar size={18} />
					<span>{isId ? "Reservasi Layanan Sekarang" : "Book an Appointment"}</span>
					<ArrowRight size={16} />
				</a>

				<a href="/book?lookup=1" class="btn hero-btn-subtle">
					<Search size={16} />
					<span>{isId ? "Lacak Status Booking Anda" : "Check Booking Status"}</span>
				</a>
			</div>

			<!-- Live Trust Metrics Strip -->
			<div class="trust-metrics-strip">
				<div class="metric-card">
					<div class="metric-num">5+</div>
					<div class="metric-lbl">{isId ? "Cabang Resmi di Jabodetabek & Jatim" : "Facilities in Jakarta, Tangerang & Java"}</div>
				</div>
				<div class="metric-divider"></div>
				<div class="metric-card">
					<div class="metric-num">15,000+</div>
					<div class="metric-lbl">{isId ? "Hewan Peliharaan Terlayani Bahagia" : "Happy Pets Styled & Cared For"}</div>
				</div>
				<div class="metric-divider"></div>
				<div class="metric-card">
					<div class="metric-num">24 / 7</div>
					<div class="metric-lbl">{isId ? "Caretaker Hotel & Pemantauan Medis" : "On-Duty Caretaker & Vet Triage"}</div>
				</div>
				<div class="metric-divider"></div>
				<div class="metric-card">
					<div class="metric-num">4.9 ★</div>
					<div class="metric-lbl">{isId ? "Kepuasan Pemilik Hewan (2,400+ Ulasan)" : "Pet Parent Rating (2,400+ Reviews)"}</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ==================== ABOUT PETCO / WHAT WE DO ==================== -->
	<section id="about" class="section-about">
		<div class="section-container">
			<div class="section-heading-block text-center">
				<span class="section-kicker"><Building2 size={14} /> {isId ? "Mengenal PetCo" : "About PetCo"}</span>
				<h2 class="section-title">{isId ? "Ekosistem Perawatan Hewan Modern Terlengkap" : "A Modern, Comprehensive Pet Wellness Ecosystem"}</h2>
				<p class="section-subtitle">
					{isId
						? "PetCo didirikan untuk memberikan standar perawatan premium tanpa kompromi. Kami menggabungkan kenyamanan hewan, protokol higienis tinggi, dan teknologi pemantauan digital real-time."
						: "PetCo was built to eliminate compromise in pet care. We fuse animal comfort, clinical-grade sanitization, and real-time digital transparency for discerning pet parents."}
				</p>
			</div>

			<div class="about-grid">
				<div class="about-feature-box">
					<div class="about-icon-circle blue"><Award size={22} /></div>
					<h3>{isId ? "Groomer & Stylist Bersertifikasi" : "Certified Master Stylists"}</h3>
					<p>{isId ? "Setiap staf telah melalui pelatihan teknik handling bebas stres, standar pemotongan ras, dan penanganan kulit sensitif." : "Trained in low-stress handling, breed-specific symmetry, dermatological coat therapy, and behavioral soothing."}</p>
				</div>
				<div class="about-feature-box">
					<div class="about-icon-circle purple"><ShieldCheck size={22} /></div>
					<h3>{isId ? "Gerbang Kepatuhan Vaksin" : "Clinical Vaccine Gate"}</h3>
					<p>{isId ? "Sistem rekam medis otomatis memverifikasi vaksin rabies & parvo sebelum check-in hotel demi mencegah penularan penyakit." : "Automated digital health gates verify core inoculations (DHPP, Rabies, FPV) before boarding to guarantee zero contagion."}</p>
				</div>
				<div class="about-feature-box">
					<div class="about-icon-circle emerald"><HeartHandshake size={22} /></div>
					<h3>{isId ? "Laporan Harian WhatsApp & CCTV" : "Live Photo & WhatsApp Updates"}</h3>
					<p>{isId ? "Pantau aktivitas makan, minum obat, jalan sore, dan mood anabul Anda setiap hari langsung dari ponsel." : "Receive mealtime logs, medication verifications, play session snapshots, and mood notes directly to your WhatsApp."}</p>
				</div>
			</div>
		</div>
	</section>

	<!-- ==================== CORE SERVICES SHOWCASE ==================== -->
	<section id="services" class="section-services">
		<div class="section-container">
			<div class="section-heading-block text-center">
				<span class="section-kicker"><Sparkles size={14} /> {isId ? "Layanan Unggulan" : "Core Services"}</span>
				<h2 class="section-title">{isId ? "Pilihan Layanan Khusus untuk Hewan Kesayangan" : "Specialized Care for Dogs, Cats & Aquatics"}</h2>
				<p class="section-subtitle">{isId ? "Dari spa relaksasi hingga suite hotel VIP dan perawatan tangki terumbu karang." : "From therapeutic grooming to climate-controlled boarding suites and reef biotope maintenance."}</p>
			</div>

			<div class="services-pillars-grid">
				<!-- Pillar 1: Grooming -->
				<div class="pillar-card">
					<div class="pillar-badge grooming">{isId ? "Grooming & Spa" : "Grooming & Styling"}</div>
					<div class="pillar-icon-wrap grooming-bg">
						<Scissors size={32} />
					</div>
					<h3>{isId ? "Spa & Grooming Profesional" : "Professional Styling & Spa"}</h3>
					<p class="pillar-desc">
						{isId
							? "Mandi higienis, blow-dry lembut, pembersihan telinga, pemotongan kuku, sikat gigi, terapi kutu medicated, dan styling potongan bulu sesuai standar ras."
							: "Hydrotherapy bath, high-velocity blow dry, ear canal cleansing, nail dremel shaping, teeth brushing, medicated flea baths, and breed styling."}
					</p>
					<ul class="pillar-bullet-list">
						<li><Check size={14} /> {isId ? "Shampoo hypoallergenic & bebas paraben" : "Hypoallergenic, tearless & paraben-free shampoos"}</li>
						<li><Check size={14} /> {isId ? "Teknik penanganan lembut tanpa kekerasan" : "Fear-free gentle handling protocols"}</li>
						<li><Check size={14} /> {isId ? "Kartu spesifikasi potongan bulu digital" : "Digital grooming cut specification cards"}</li>
					</ul>
					<a href="/book?kind=grooming" class="btn btn-primary btn-sm pillar-cta">
						<span>{isId ? "Pesan Grooming" : "Book Grooming"}</span>
						<ChevronRight size={14} />
					</a>
				</div>

				<!-- Pillar 2: Pet Hotel -->
				<div class="pillar-card featured">
					<div class="featured-ribbon">{isId ? "Terpopuler" : "Most Popular"}</div>
					<div class="pillar-badge hotel">{isId ? "Hotel & Boarding" : "Luxury Boarding"}</div>
					<div class="pillar-icon-wrap hotel-bg">
						<Hotel size={32} />
					</div>
					<h3>{isId ? "Hotel Penitipan Hewan 24 Jam" : "24/7 Climate-Controlled Hotel"}</h3>
					<p class="pillar-desc">
						{isId
							? "Kamar ber-AC bersih dengan sirkulasi udara HEPA, area bermain outdoor/indoor terpisah, rutinitas makan terjadwal, dan laporan foto/video berkala."
							: "Private air-conditioned suites with HEPA filtration, separate dog and cat wings, daily exercise schedules, and real-time photo logs."}
					</p>
					<ul class="pillar-bullet-list">
						<li><Check size={14} /> {isId ? "Ruang Kucing & Anjing 100% terpisah" : "100% sound & scent-isolated feline/canine wings"}</li>
						<li><Check size={14} /> {isId ? "Pemberian obat & diet sesuai instruksi pemilik" : "Custom dietary & prescription medication management"}</li>
						<li><Check size={14} /> {isId ? "Jalan pagi dan sore setiap hari" : "Morning & evening daily walk & playtime"}</li>
					</ul>
					<a href="/book?kind=hotel" class="btn btn-primary btn-sm pillar-cta">
						<span>{isId ? "Pesan Kamar Hotel" : "Reserve Hotel Suite"}</span>
						<ChevronRight size={14} />
					</a>
				</div>

				<!-- Pillar 3: Aquarium -->
				<div class="pillar-card">
					<div class="pillar-badge aquarium">{isId ? "Aquarium Hub" : "Aquatic Care"}</div>
					<div class="pillar-icon-wrap aquarium-bg">
						<Fish size={32} />
					</div>
					<h3>{isId ? "Layanan Aquascape & Akuarium" : "Custom Aquascaping & Service"}</h3>
					<p class="pillar-desc">
						{isId
							? "Desain aquascape air tawar & laut, tes kimia air (pH, Ammonia, Salinitas, Nitrat), perawatan filter berkala, dan penanganan karang terumbu."
							: "Custom freshwater biotope & marine reef installations, chemical telemetry logging (pH, NH3, Salinity), and recurring maintenance visits."}
					</p>
					<ul class="pillar-bullet-list">
						<li><Check size={14} /> {isId ? "Teknisi aquarist berpengalaman" : "Certified aquatic biologists & reef technicians"}</li>
						<li><Check size={14} /> {isId ? "Kalibrasi parameter air digital" : "Digital water chemistry logs on your dossier"}</li>
						<li><Check size={14} /> {isId ? "Paket langganan kunjungan berkala" : "Weekly & monthly recurring service contracts"}</li>
					</ul>
					<a href="/book?kind=aquarium" class="btn btn-primary btn-sm pillar-cta">
						<span>{isId ? "Pesan Layanan Akuarium" : "Book Aquarium Service"}</span>
						<ChevronRight size={14} />
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- ==================== WHY CHOOSE PETCO / TRUST & SAFETY ==================== -->
	<section id="why-petco" class="section-why">
		<div class="section-container">
			<div class="why-split-layout">
				<div class="why-text-col">
					<span class="section-kicker"><ShieldCheck size={14} /> {isId ? "Standar Keamanan" : "Safety Standards"}</span>
					<h2 class="section-title">{isId ? "Standar Keamanan Medis & Higienis Tertinggi" : "Clinical Sanitation & Transparent Care"}</h2>
					<p class="why-lead-desc">
						{isId
							? "Kesehatan dan kenyamanan hewan peliharaan Anda adalah prioritas utama kami. PetCo menerapkan SOP ketat yang setara dengan fasilitas klinik modern."
							: "Your pet's well-being is our non-negotiable responsibility. Every PetCo facility adheres to veterinary-grade sanitation and digital transparency."}
					</p>

					<div class="why-points-list">
						<div class="why-point-row">
							<div class="why-icon-badge"><ShieldCheck size={18} /></div>
							<div class="why-point-text">
								<strong>{isId ? "Sterilisasi Alat UV & Sanitasi Menyeluruh" : "UV Tool Sterilization & Antimicrobial Suites"}</strong>
								<p>{isId ? "Semua sisir, pisau clipper, meja grooming, dan kandang dibersihkan dan disterilkan dengan sinar UV sebelum digunakan untuk hewan berikutnya." : "Every blade, shear, table, and suite is sanitized and UV-sterilized between appointments."}</p>
							</div>
						</div>

						<div class="why-point-row">
							<div class="why-icon-badge"><Zap size={18} /></div>
							<div class="why-point-text">
								<strong>{isId ? "Notifikasi & Pengingat Otomatis" : "24h & 2h Automated Pre-Visit Reminders"}</strong>
								<p>{isId ? "Sistem kami mengirimkan pengingat jadwal melalui WhatsApp dan SMS sehingga Anda tidak pernah melewatkan sesi perawatan atau check-in." : "Automated WhatsApp and SMS alerts keep you informed 24h and 2h prior to arrival."}</p>
							</div>
						</div>

						<div class="why-point-row">
							<div class="why-icon-badge"><MapPin size={18} /></div>
							<div class="why-point-text">
								<strong>{isId ? "Rekam Medis & Riwayat Terpusat Multi-Cabang" : "Centralized Multi-Branch Dossiers"}</strong>
								<p>{isId ? "Data alergi, preferensi potongan, dan riwayat menginap dapat diakses di semua cabang PetCo di mana pun Anda berkunjung." : "Your pet's preferences, allergies, and cut cards seamlessly follow them across any PetCo facility."}</p>
							</div>
						</div>
					</div>
				</div>

				<div class="why-visual-col">
					<div class="trust-card-mockup">
						<div class="mockup-header">
							<div class="mockup-avatar"><PawPrint size={18} /></div>
							<div>
								<div class="mockup-name">Milo · Golden Retriever</div>
								<div class="mockup-sub">PetCo Health Dossier #PET-00124</div>
							</div>
							<span class="mockup-status-tag">VACCINE VERIFIED</span>
						</div>

						<div class="mockup-body">
							<div class="mockup-metric-row">
								<span>Rabies &amp; Parvo Status</span>
								<strong class="text-green">✓ Valid until Dec 2026</strong>
							</div>
							<div class="mockup-metric-row">
								<span>Skin &amp; Coat Protocol</span>
								<strong>Hypoallergenic Oatmeal Wash</strong>
							</div>
							<div class="mockup-metric-row">
								<span>Hotel Boarding Suite</span>
								<strong>Deluxe Room #304 (AC + Balcony)</strong>
							</div>
							<div class="mockup-metric-row">
								<span>Special Diet</span>
								<strong>Salmon Grain-Free · 2x / day</strong>
							</div>
						</div>

						<div class="mockup-footer">
							<span class="mockup-timestamp"><Clock size={12} /> Last sanitized today 08:30 WIB</span>
							<span class="mockup-cert">ISO-Certified Facility</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ==================== LOCATIONS & BRANCHES ==================== -->
	<section id="branches" class="section-branches">
		<div class="section-container">
			<div class="section-heading-block text-center">
				<span class="section-kicker"><MapPin size={14} /> {isId ? "Jaringan Cabang" : "Branch Network"}</span>
				<h2 class="section-title">{isId ? "Temukan Cabang PetCo Terdekat" : "Find Your Nearest PetCo Location"}</h2>
				<p class="section-subtitle">{isId ? "Fasilitas lengkap kami tersebar di lokasi strategis untuk melayani Anda." : "State-of-the-art facilities located across major metropolitan hubs."}</p>
			</div>

			<div class="branches-display-grid">
				{#each data.branches as branch}
					<div class="branch-detail-box" class:is-hq={branch.isHeadOffice}>
						<div class="branch-top-bar">
							<div class="branch-city-tag"><MapPin size={12} /> {branch.city || "Jakarta"}</div>
							{#if branch.isHeadOffice}
								<span class="hq-label">HEAD OFFICE &amp; SPA</span>
							{/if}
						</div>

						<h3 class="branch-name">{branch.name}</h3>
						<p class="branch-address">{branch.address || "Jl. Sudirman No. 128, Jakarta Pusat"}</p>

						<div class="branch-meta-row">
							<div class="branch-meta-item">
								<Phone size={13} />
								<span>{branch.phone || "+62 21 555-0199"}</span>
							</div>
							<div class="branch-meta-item">
								<Clock size={13} />
								<span>08:00 - 20:00 WIB</span>
							</div>
						</div>

						<a href="/book?branch={branch.id}" class="btn btn-subtle btn-sm branch-book-action">
							<span>{isId ? "Pilih Cabang Ini" : "Book at this Branch"}</span>
							<ArrowRight size={14} />
						</a>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- ==================== PRICING & PACKAGES ==================== -->
	<section id="pricing" class="section-pricing">
		<div class="section-container">
			<div class="section-heading-block text-center">
				<span class="section-kicker"><Receipt size={14} /> {isId ? "Transparansi Biaya" : "Transparent Pricing"}</span>
				<h2 class="section-title">{isId ? "Daftar Harga Layanan PetCo" : "Certified Service Rates & Packages"}</h2>
				<p class="section-subtitle">{isId ? "Semua harga transparan tanpa biaya tersembunyi." : "Transparent pricing with no surprise add-on charges."}</p>
			</div>

			<div class="pricing-cards-grid">
				<!-- Grooming Pricing Card -->
				<div class="pricing-tier-card">
					<div class="tier-head">
						<span class="tier-type grooming"><Scissors size={14} /> {isId ? "Grooming & Styling" : "Grooming & Styling"}</span>
						<div class="tier-price-row">
							<span class="from-text">{isId ? "Mulai" : "From"}</span>
							<strong class="tier-price">Rp 60.000</strong>
						</div>
						<p class="tier-summary">{isId ? "Perawatan higienis menyeluruh & styling bulu profesional." : "Complete hygiene wash, ear cleaning & breed styling."}</p>
					</div>
					<ul class="tier-features">
						<li><Check size={14} /> Bath &amp; Brush (Mandi &amp; Sisir): <strong>Rp 60.000</strong></li>
						<li><Check size={14} /> Full Groom (Potong Bulu Lengkap): <strong>Rp 150.000</strong></li>
						<li><Check size={14} /> Flea &amp; Tick Medicated Bath: <strong>Rp 90.000</strong></li>
						<li><Check size={14} /> Nail Trim &amp; Teeth Clean: <strong>Rp 30.000</strong></li>
					</ul>
					<a href="/book?kind=grooming" class="btn btn-subtle tier-btn">
						<span>{isId ? "Reservasi Grooming" : "Book Grooming"}</span>
					</a>
				</div>

				<!-- Hotel Pricing Card -->
				<div class="pricing-tier-card featured-tier">
					<div class="tier-popular-tag">{isId ? "Paling Diminati" : "Best Value"}</div>
					<div class="tier-head">
						<span class="tier-type hotel"><Hotel size={14} /> {isId ? "Hotel & Boarding" : "Luxury Hotel Boarding"}</span>
						<div class="tier-price-row">
							<span class="from-text">{isId ? "Mulai" : "From"}</span>
							<strong class="tier-price">Rp 120.000</strong>
							<span class="per-night">/{isId ? "malam" : "night"}</span>
						</div>
						<p class="tier-summary">{isId ? "Kamar ber-AC privat, pemantauan CCTV & jalan sore harian." : "Air-conditioned private suites, daily walk & photo updates."}</p>
					</div>
					<ul class="tier-features">
						<li><Check size={14} /> Standard Suite (AC, Makan 2x): <strong>Rp 120.000/mlm</strong></li>
						<li><Check size={14} /> Deluxe Room (Balcony, Playtime): <strong>Rp 180.000/mlm</strong></li>
						<li><Check size={14} /> VIP Penthouse Suite (CCTV Live): <strong>Rp 300.000/mlm</strong></li>
						<li><Check size={14} /> Free daily WhatsApp photo reports</li>
					</ul>
					<a href="/book?kind=hotel" class="btn btn-primary tier-btn">
						<span>{isId ? "Reservasi Kamar Hotel" : "Book Hotel Suite"}</span>
					</a>
				</div>

				<!-- Aquarium Pricing Card -->
				<div class="pricing-tier-card">
					<div class="tier-head">
						<span class="tier-type aquarium"><Fish size={14} /> {isId ? "Perawatan Akuarium" : "Aquarium Service"}</span>
						<div class="tier-price-row">
							<span class="from-text">{isId ? "Mulai" : "From"}</span>
							<strong class="tier-price">Rp 150.000</strong>
						</div>
						<p class="tier-summary">{isId ? "Kunjungan aquarist ke lokasi untuk tes air & perawatan sistem." : "On-site aquarist visit, water testing & filter maintenance."}</p>
					</div>
					<ul class="tier-features">
						<li><Check size={14} /> Water Parameter Testing &amp; Tune: <strong>Rp 150.000</strong></li>
						<li><Check size={14} /> Biotope Algae &amp; Filter Scrape: <strong>Rp 250.000</strong></li>
						<li><Check size={14} /> Full Reef Ecosystem Overhaul: <strong>Rp 500.000</strong></li>
						<li><Check size={14} /> Custom tank design consultation</li>
					</ul>
					<a href="/book?kind=aquarium" class="btn btn-subtle tier-btn">
						<span>{isId ? "Reservasi Akuarium" : "Book Aquarium Service"}</span>
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- ==================== CALL TO ACTION BANNER ==================== -->
	<section class="section-cta-banner">
		<div class="section-container">
			<div class="cta-banner-box">
				<div class="cta-banner-content">
					<h2>{isId ? "Siap Memberikan Perawatan Terbaik untuk Anabul Anda?" : "Ready to Experience Premium Pet Care?"}</h2>
					<p>{isId ? "Pesan jadwal secara online dalam hitungan menit atau lacak status reservasi aktif Anda di portal klien." : "Book your appointment online in under 2 minutes or track your existing reservations instantly."}</p>
					<div class="cta-banner-actions">
						<a href="/book" class="btn btn-primary btn-lg">
							<Calendar size={18} />
							<span>{isId ? "Reservasi Online Sekarang" : "Book an Appointment Now"}</span>
							<ArrowRight size={16} />
						</a>
						<a href="/book?lookup=1" class="btn btn-subtle btn-lg">
							<Search size={16} />
							<span>{isId ? "Cek Database Booking" : "Track My Booking"}</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ==================== CUSTOMER TESTIMONIALS & REVIEWS ==================== -->
	<section id="reviews" class="section-reviews">
		<div class="section-container">
			<div class="section-heading-block text-center">
				<span class="section-kicker"><Star size={14} /> {isId ? "Ulasan Pelanggan" : "Client Testimonials"}</span>
				<h2 class="section-title">{isId ? "Apa Kata Para Pemilik Hewan?" : "Loved by 2,400+ Pet Parents"}</h2>
				<p class="section-subtitle">{isId ? "Pengalaman nyata dari pelanggan setia di seluruh cabang PetCo." : "Real experiences from satisfied pet owners across our facilities."}</p>
			</div>

			<div class="reviews-grid">
				<div class="review-card">
					<div class="review-stars">★★★★★</div>
					<p class="review-text">
						{isId
							? "“Grooming di PetCo Kemang benar-benar memuaskan! Anjing Poodle saya biasanya penakut kalau potong kuku, tapi groomer PetCo sangat sabar dan hasilnya rapi sekali. Rekam medisnya juga tercatat rapi.”"
							: "“Grooming at PetCo Kemang was exceptional! My anxious Poodle usually hates nail trimming, but the groomer was so gentle. The digital dossier is super convenient.”"}
					</p>
					<div class="reviewer-meta">
						<div class="reviewer-avatar">🐕</div>
						<div>
							<strong>Amanda S.</strong>
							<span>Owner of Milo (Toy Poodle) · PetCo Kemang</span>
						</div>
					</div>
				</div>

				<div class="review-card">
					<div class="review-stars">★★★★★</div>
					<p class="review-text">
						{isId
							? "“Nitip kucing 5 hari saat dinas luar kota di PetCo Senopati. Setiap pagi dan sore dikirimi video WhatsApp pas makan dan main. Kamarnya bersih ber-AC, kucing saya pulang dalam kondisi sehat & wangi.”"
							: "“Boarded my cat for 5 days during a business trip. Received morning & evening WhatsApp videos of his feeding and playtime. Clean suites, returned happy and healthy.”"}
					</p>
					<div class="reviewer-meta">
						<div class="reviewer-avatar">🐈</div>
						<div>
							<strong>Dimas Prasetyo</strong>
							<span>Owner of Simba (British Shorthair) · PetCo Senopati</span>
						</div>
					</div>
				</div>

				<div class="review-card">
					<div class="review-stars">★★★★★</div>
					<p class="review-text">
						{isId
							? "“Layanan aquascape PetCo BSD sangat profesional. Tim datang tepat waktu, parameter air dites lengkap, dan tanaman karang dibersihkan dengan teliti. Sangat recommended untuk aquarist!”"
							: "“PetCo BSD's aquascape maintenance is top-notch. The team arrived on time, tested water chemistry thoroughly, and pruned the plants expertly.”"}
					</p>
					<div class="reviewer-meta">
						<div class="reviewer-avatar">🐠</div>
						<div>
							<strong>Hendrawan K.</strong>
							<span>Marine Reef Enthusiast · PetCo BSD City</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ==================== FAQ SECTION ==================== -->
	<section id="faq" class="section-faq">
		<div class="section-container">
			<div class="section-heading-block text-center">
				<span class="section-kicker"><HelpCircle size={14} /> FAQ</span>
				<h2 class="section-title">{isId ? "Pertanyaan yang Sering Diajukan" : "Frequently Asked Questions"}</h2>
				<p class="section-subtitle">{isId ? "Informasi penting mengenai persyaratan vaksin, sistem pembayaran, dan penitipan." : "Everything you need to know before booking your appointment."}</p>
			</div>

			<div class="faq-grid">
				<div class="faq-item">
					<h4>{isId ? "Apakah hewan harus sudah divaksin sebelum menginap?" : "Are vaccinations required before hotel boarding?"}</h4>
					<p>{isId ? "Ya. Demi keselamatan semua tamu anabul, kami mewajibkan vaksin inti (Rabies & Parvo/DHPP untuk anjing, FPV/FVRCP untuk kucing) yang masih berlaku." : "Yes. To ensure a 100% safe environment, all dogs and cats must have up-to-date core vaccinations before boarding."}</p>
				</div>

				<div class="faq-item">
					<h4>{isId ? "Apakah saya perlu membayar langsung saat reservasi online?" : "Is upfront payment required when booking online?"}</h4>
					<p>{isId ? "Tidak. Reservasi online tidak memotong kartu Anda seketika. Anda dapat membayar saat tiba di cabang atau mentransfer DP saat konfirmasi WhatsApp tim kami." : "No immediate payment is charged online. You can settle on arrival or via confirmation bank transfer."}</p>
				</div>

				<div class="faq-item">
					<h4>{isId ? "Bagaimana jika hewan saya memiliki alergi atau resep obat?" : "Can you handle special diets or medication?"}</h4>
					<p>{isId ? "Tentu saja. Anda dapat mencantumkan catatan alergi pada form booking. Staf caretaker kami terlatih memberikan obat sesuai dosis dan jadwal pemilik." : "Absolutely. You can provide dosage instructions and dietary requirements during booking, and our caretakers administer them rigorously."}</p>
				</div>

				<div class="faq-item">
					<h4>{isId ? "Apakah saya bisa membatalkan atau mengubah jadwal booking?" : "Can I reschedule or cancel my booking?"}</h4>
					<p>{isId ? "Bisa. Anda dapat menghubungi cabang yang bersangkutan melalui WhatsApp atau menelepon langsung minimal 6 jam sebelum waktu jadwal." : "Yes. Contact the branch directly via WhatsApp or phone at least 6 hours in advance to adjust your booking without penalty."}</p>
				</div>
			</div>
		</div>
	</section>

	<!-- ==================== FOOTER ==================== -->
	<footer class="landing-footer">
		<div class="footer-inner">
			<div class="footer-top-grid">
				<div class="footer-brand-col">
					<div class="footer-logo">
						<span class="footer-emblem"><PawPrint size={18} /></span>
						<span class="footer-name">PetCo</span>
					</div>
					<p class="footer-tagline">
						{isId
							? "Pusat ekosistem perawatan hewan peliharaan, grooming profesional, pet hotel bintang lima, dan spesialis akuarium terdepan di Indonesia."
							: "Indonesia's premier integrated pet wellness ecosystem, certified grooming salon, luxury pet hotel, and aquarium biotope specialists."}
					</p>
					<div class="footer-certs">
						<span class="cert-pill">✓ Certified Groomers</span>
						<span class="cert-pill">✓ Vet-Monitored</span>
					</div>
				</div>

				<div class="footer-links-col">
					<h4>{isId ? "Layanan" : "Services"}</h4>
					<a href="/book?kind=grooming">{isId ? "Grooming & Spa" : "Grooming & Styling"}</a>
					<a href="/book?kind=hotel">{isId ? "Pet Hotel 24 Jam" : "24/7 Hotel Boarding"}</a>
					<a href="/book?kind=aquarium">{isId ? "Layanan Akuarium" : "Aquatic Care"}</a>
					<a href="#pricing" onclick={(e) => { e.preventDefault(); scrollToSection('pricing'); }}>{isId ? "Daftar Harga" : "Pricing Catalog"}</a>
				</div>

				<div class="footer-links-col">
					<h4>{isId ? "Cabang Resmi" : "Locations"}</h4>
					<a href="/book?branch=1">Kantor Pusat (Jakarta Pusat)</a>
					<a href="/book?branch=2">Cabang Kemang (Jakarta Selatan)</a>
					<a href="/book?branch=3">Cabang Senopati (Jakarta Selatan)</a>
					<a href="/book?branch=4">Cabang BSD City (Tangerang)</a>
					<a href="/book?branch=5">Cabang Surabaya (Jawa Timur)</a>
				</div>

				<div class="footer-links-col">
					<h4>{isId ? "Akses Portal" : "Portal Access"}</h4>
					<a href="/book" class="footer-nav-link">{isId ? "Reservasi Online" : "Online Booking"}</a>
					<a href="/book?lookup=1" class="footer-nav-link">{isId ? "Cek Status Booking" : "Track My Booking"}</a>
					<a href="/login" class="footer-staff-link">{isId ? "Masuk Portal Staf" : "Staff Console Login"}</a>
				</div>
			</div>

			<div class="footer-bottom-bar">
				<p>© {new Date().getFullYear()} PetCo Indonesia. All rights reserved.</p>
				<div class="footer-bottom-meta">
					<span>Bilingual System (EN / ID)</span>
					<span>•</span>
					<span>Multi-Branch Operating System</span>
				</div>
			</div>
		</div>
	</footer>
</div>

<style>
	/* ============ BASE LANDING STYLES ============ */
	.landing-page-root {
		min-height: 100vh;
		background: #ffffff;
		color: var(--ink);
		font-family: var(--font-sans);
		display: flex;
		flex-direction: column;
		overflow-x: hidden;
	}

	.section-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 24px;
	}

	.text-center {
		text-align: center;
	}

	.section-heading-block {
		margin-bottom: 48px;
	}

	.section-kicker {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--primary);
		background: var(--primary-soft);
		border: 1px solid var(--primary-border);
		padding: 4px 12px;
		border-radius: var(--r-full);
		margin-bottom: 12px;
	}

	.section-title {
		font-size: clamp(24px, 3.2vw, 36px);
		font-weight: 850;
		letter-spacing: -0.03em;
		color: var(--ink);
		margin: 0 0 12px;
	}

	.section-subtitle {
		font-size: clamp(14px, 1.6vw, 16px);
		color: var(--muted);
		max-width: 680px;
		margin: 0 auto;
		line-height: 1.5;
	}

	/* ============ TOP NAVBAR ============ */
	.top-nav {
		position: sticky;
		top: 0;
		z-index: 500;
		background: rgba(255, 255, 255, 0.94);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--border);
		box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);
	}

	.nav-container {
		max-width: 1240px;
		margin: 0 auto;
		padding: 10px 24px;
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
		width: 38px;
		height: 38px;
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
		font-size: 17px;
		font-weight: 850;
		letter-spacing: -0.02em;
	}

	.brand-tagline {
		font-size: 10.5px;
		color: var(--muted);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.nav-links-center {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.nav-links-center a {
		font-size: 13.5px;
		font-weight: 650;
		color: var(--ink-2);
		text-decoration: none;
		transition: color 130ms ease;
	}

	.nav-links-center a:hover {
		color: var(--primary);
	}

	.nav-right-actions {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.header-book-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 7px 14px;
		font-size: 12.5px;
		font-weight: 750;
		text-decoration: none;
	}

	.staff-link {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 6px 11px;
		border-radius: var(--r-md);
		border: 1px solid var(--border);
		background: var(--surface-2);
		color: var(--muted);
		font-size: 11.5px;
		font-weight: 700;
		text-decoration: none;
		transition: all 130ms ease;
	}

	.staff-link:hover {
		color: var(--ink);
		background: var(--surface-3);
		border-color: var(--border-strong);
	}

	/* ============ HERO SECTION ============ */
	.hero-section {
		position: relative;
		background: linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%);
		color: #ffffff;
		padding: 72px 24px 84px;
		overflow: hidden;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.hero-backdrop-glow {
		position: absolute;
		top: -120px;
		left: 50%;
		transform: translateX(-50%);
		width: 700px;
		height: 400px;
		background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%);
		filter: blur(80px);
		pointer-events: none;
	}

	.hero-container {
		position: relative;
		max-width: 960px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.hero-pill-badge {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: rgba(99, 102, 241, 0.2);
		border: 1px solid rgba(129, 140, 248, 0.35);
		color: #c7d2fe;
		padding: 6px 16px;
		border-radius: var(--r-full);
		font-size: 12.5px;
		font-weight: 750;
		margin-bottom: 22px;
	}

	.badge-sparkle {
		color: #fbbf24;
	}

	.hero-title {
		font-size: clamp(32px, 5vw, 54px);
		font-weight: 900;
		letter-spacing: -0.04em;
		line-height: 1.15;
		margin: 0 0 18px;
		color: #ffffff;
	}

	.gradient-text {
		background: linear-gradient(135deg, #a5b4fc 0%, #818cf8 50%, #38bdf8 100%);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.hero-lead {
		font-size: clamp(15px, 2vw, 17.5px);
		color: #94a3b8;
		max-width: 780px;
		margin: 0 auto 32px;
		line-height: 1.55;
	}

	.hero-cta-group {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 14px;
		margin-bottom: 56px;
	}

	.hero-btn-main {
		padding: 13px 26px;
		font-size: 14.5px;
		font-weight: 800;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		text-decoration: none;
		box-shadow: 0 4px 18px rgba(99, 102, 241, 0.4);
	}

	.hero-btn-subtle {
		padding: 13px 22px;
		font-size: 14px;
		font-weight: 750;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: #ffffff;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		border-radius: var(--r-md);
		text-decoration: none;
		transition: all 140ms ease;
	}

	.hero-btn-subtle:hover {
		background: rgba(255, 255, 255, 0.16);
		border-color: rgba(255, 255, 255, 0.4);
	}

	/* Trust Metrics */
	.trust-metrics-strip {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		background: rgba(15, 23, 42, 0.75);
		border: 1px solid rgba(255, 255, 255, 0.12);
		backdrop-filter: blur(8px);
		border-radius: 20px;
		padding: 18px 28px;
		gap: 20px;
		width: 100%;
		max-width: 900px;
	}

	.metric-card {
		flex: 1;
		min-width: 140px;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.metric-num {
		font-size: 24px;
		font-weight: 900;
		color: #38bdf8;
		letter-spacing: -0.02em;
	}

	.metric-lbl {
		font-size: 11.5px;
		color: #94a3b8;
		font-weight: 600;
		margin-top: 2px;
	}

	.metric-divider {
		width: 1px;
		height: 36px;
		background: rgba(255, 255, 255, 0.12);
	}

	/* ============ SECTION ABOUT ============ */
	.section-about {
		padding: 84px 0;
		background: #ffffff;
	}

	.about-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 24px;
	}

	.about-feature-box {
		background: #f8fafc;
		border: 1px solid var(--border);
		border-radius: 18px;
		padding: 30px 24px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		transition: transform 140ms ease, box-shadow 140ms ease;
	}

	.about-feature-box:hover {
		transform: translateY(-3px);
		box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
	}

	.about-icon-circle {
		width: 48px;
		height: 48px;
		border-radius: 14px;
		display: grid;
		place-items: center;
	}

	.about-icon-circle.blue { background: #e0f2fe; color: #0284c7; }
	.about-icon-circle.purple { background: #ede9fe; color: #7c3aed; }
	.about-icon-circle.emerald { background: #d1fae5; color: #059669; }

	.about-feature-box h3 {
		font-size: 17px;
		font-weight: 800;
		margin: 0;
		color: var(--ink);
	}

	.about-feature-box p {
		font-size: 13.5px;
		color: var(--muted);
		margin: 0;
		line-height: 1.5;
	}

	/* ============ SERVICES PILLARS ============ */
	.section-services {
		padding: 84px 0;
		background: #f8fafc;
		border-top: 1px solid var(--border);
		border-bottom: 1px solid var(--border);
	}

	.services-pillars-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 28px;
	}

	.pillar-card {
		position: relative;
		background: #ffffff;
		border: 1.5px solid var(--border);
		border-radius: 20px;
		padding: 32px 26px;
		display: flex;
		flex-direction: column;
		box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
		transition: all 140ms ease;
	}

	.pillar-card:hover {
		border-color: var(--primary-border);
		box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
	}

	.pillar-card.featured {
		border-color: var(--primary);
		box-shadow: 0 8px 24px rgba(99, 102, 241, 0.12);
	}

	.featured-ribbon {
		position: absolute;
		top: 16px;
		right: 18px;
		background: var(--primary);
		color: #ffffff;
		font-size: 10px;
		font-weight: 850;
		letter-spacing: 0.06em;
		padding: 3px 9px;
		border-radius: var(--r-full);
		text-transform: uppercase;
	}

	.pillar-badge {
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		margin-bottom: 16px;
	}

	.pillar-badge.grooming { color: #db2777; }
	.pillar-badge.hotel { color: #7c3aed; }
	.pillar-badge.aquarium { color: #0284c7; }

	.pillar-icon-wrap {
		width: 60px;
		height: 60px;
		border-radius: 16px;
		display: grid;
		place-items: center;
		margin-bottom: 20px;
	}

	.grooming-bg { background: #fdf2f8; color: #ec4899; }
	.hotel-bg { background: #ede9fe; color: #8b5cf6; }
	.aquarium-bg { background: #e0f2fe; color: #0284c7; }

	.pillar-card h3 {
		font-size: 20px;
		font-weight: 850;
		color: var(--ink);
		margin: 0 0 10px;
	}

	.pillar-desc {
		font-size: 13.5px;
		color: var(--muted);
		line-height: 1.5;
		margin: 0 0 20px;
	}

	.pillar-bullet-list {
		list-style: none;
		padding: 0;
		margin: 0 0 26px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.pillar-bullet-list li {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12.5px;
		color: var(--ink-2);
	}

	.pillar-bullet-list li :global(svg) {
		color: #10b981;
		flex-shrink: 0;
	}

	.pillar-cta {
		margin-top: auto;
		width: 100%;
		padding: 10px;
		font-size: 13.5px;
		font-weight: 750;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		gap: 6px;
		text-decoration: none;
	}

	/* ============ SECTION WHY ============ */
	.section-why {
		padding: 84px 0;
		background: #ffffff;
	}

	.why-split-layout {
		display: grid;
		grid-template-columns: 1.1fr 0.9fr;
		gap: 48px;
		align-items: center;
	}

	.why-lead-desc {
		font-size: 15.5px;
		color: var(--muted);
		line-height: 1.55;
		margin: 0 0 32px;
	}

	.why-points-list {
		display: flex;
		flex-direction: column;
		gap: 22px;
	}

	.why-point-row {
		display: flex;
		gap: 14px;
	}

	.why-icon-badge {
		width: 38px;
		height: 38px;
		border-radius: 10px;
		background: var(--primary-soft);
		color: var(--primary);
		display: grid;
		place-items: center;
		flex-shrink: 0;
	}

	.why-point-text strong {
		font-size: 14.5px;
		color: var(--ink);
		display: block;
		margin-bottom: 4px;
	}

	.why-point-text p {
		font-size: 13px;
		color: var(--muted);
		margin: 0;
		line-height: 1.45;
	}

	/* Mockup Card */
	.trust-card-mockup {
		background: #0f172a;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 20px;
		padding: 24px;
		color: #ffffff;
		box-shadow: 0 16px 40px rgba(15, 23, 42, 0.15);
	}

	.mockup-header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding-bottom: 16px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		margin-bottom: 18px;
	}

	.mockup-avatar {
		width: 40px;
		height: 40px;
		border-radius: 10px;
		background: var(--primary);
		display: grid;
		place-items: center;
	}

	.mockup-name {
		font-size: 14.5px;
		font-weight: 800;
	}

	.mockup-sub {
		font-size: 11px;
		color: #94a3b8;
	}

	.mockup-status-tag {
		margin-left: auto;
		font-size: 9.5px;
		font-weight: 850;
		background: #065f46;
		color: #34d399;
		padding: 3px 8px;
		border-radius: var(--r-full);
	}

	.mockup-body {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 18px;
	}

	.mockup-metric-row {
		display: flex;
		justify-content: space-between;
		font-size: 12.5px;
		color: #94a3b8;
	}

	.mockup-metric-row strong {
		color: #ffffff;
		font-weight: 700;
	}

	.text-green {
		color: #34d399 !important;
	}

	.mockup-footer {
		display: flex;
		justify-content: space-between;
		font-size: 10.5px;
		color: #64748b;
		padding-top: 14px;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	.mockup-timestamp {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	/* ============ SECTION BRANCHES ============ */
	.section-branches {
		padding: 84px 0;
		background: #f8fafc;
		border-top: 1px solid var(--border);
	}

	.branches-display-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 20px;
	}

	.branch-detail-box {
		background: #ffffff;
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 22px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		transition: all 130ms ease;
	}

	.branch-detail-box:hover {
		border-color: var(--primary-border);
		box-shadow: 0 6px 20px rgba(15, 23, 42, 0.06);
	}

	.branch-detail-box.is-hq {
		border-color: var(--primary-border);
		background: linear-gradient(180deg, var(--primary-soft) 0%, #ffffff 40%);
	}

	.branch-top-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.branch-city-tag {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 11px;
		font-weight: 750;
		color: var(--primary);
	}

	.hq-label {
		font-size: 9px;
		font-weight: 850;
		color: #ffffff;
		background: var(--primary);
		padding: 2px 6px;
		border-radius: var(--r-full);
	}

	.branch-name {
		font-size: 15.5px;
		font-weight: 800;
		color: var(--ink);
		margin: 0;
	}

	.branch-address {
		font-size: 12px;
		color: var(--muted);
		line-height: 1.4;
		margin: 0 0 8px;
	}

	.branch-meta-row {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-bottom: 14px;
	}

	.branch-meta-item {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11.5px;
		color: var(--ink-2);
	}

	.branch-book-action {
		margin-top: auto;
		width: 100%;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		gap: 6px;
		font-size: 12.5px;
		font-weight: 700;
		text-decoration: none;
	}

	/* ============ SECTION PRICING ============ */
	.section-pricing {
		padding: 84px 0;
		background: #ffffff;
		border-top: 1px solid var(--border);
	}

	.pricing-cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 24px;
	}

	.pricing-tier-card {
		position: relative;
		background: #f8fafc;
		border: 1.5px solid var(--border);
		border-radius: 20px;
		padding: 30px 24px;
		display: flex;
		flex-direction: column;
	}

	.pricing-tier-card.featured-tier {
		background: #ffffff;
		border-color: var(--primary);
		box-shadow: 0 10px 30px rgba(99, 102, 241, 0.12);
	}

	.tier-popular-tag {
		position: absolute;
		top: 16px;
		right: 18px;
		background: var(--primary);
		color: #ffffff;
		font-size: 10px;
		font-weight: 850;
		padding: 3px 9px;
		border-radius: var(--r-full);
		text-transform: uppercase;
	}

	.tier-type {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		font-weight: 800;
		text-transform: uppercase;
		margin-bottom: 12px;
	}

	.tier-type.grooming { color: #ec4899; }
	.tier-type.hotel { color: #8b5cf6; }
	.tier-type.aquarium { color: #0284c7; }

	.tier-price-row {
		display: flex;
		align-items: baseline;
		gap: 6px;
		margin-bottom: 10px;
	}

	.from-text {
		font-size: 12px;
		color: var(--muted);
	}

	.tier-price {
		font-size: 28px;
		font-weight: 900;
		color: var(--ink);
	}

	.per-night {
		font-size: 12px;
		color: var(--muted);
	}

	.tier-summary {
		font-size: 13px;
		color: var(--muted);
		line-height: 1.45;
		margin: 0 0 20px;
		min-height: 38px;
	}

	.tier-features {
		list-style: none;
		padding: 0;
		margin: 0 0 26px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.tier-features li {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12.5px;
		color: var(--ink-2);
	}

	.tier-features li :global(svg) {
		color: #10b981;
		flex-shrink: 0;
	}

	.tier-btn {
		margin-top: auto;
		width: 100%;
		padding: 10px;
		font-weight: 750;
		text-decoration: none;
		text-align: center;
	}

	/* ============ CTA BANNER ============ */
	.section-cta-banner {
		padding: 40px 0 84px;
		background: #ffffff;
	}

	.cta-banner-box {
		background: linear-gradient(135deg, #090d16 0%, #1e1b4b 100%);
		border-radius: 24px;
		padding: 56px 36px;
		text-align: center;
		color: #ffffff;
		box-shadow: 0 20px 45px rgba(15, 23, 42, 0.15);
	}

	.cta-banner-content {
		max-width: 720px;
		margin: 0 auto;
	}

	.cta-banner-content h2 {
		font-size: clamp(24px, 3.2vw, 36px);
		font-weight: 900;
		letter-spacing: -0.03em;
		margin: 0 0 14px;
		color: #ffffff;
	}

	.cta-banner-content p {
		font-size: 15px;
		color: #cbd5e1;
		line-height: 1.55;
		margin: 0 0 32px;
	}

	.cta-banner-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 14px;
	}

	.btn-lg {
		padding: 12px 24px;
		font-size: 14.5px;
		font-weight: 800;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		text-decoration: none;
	}

	/* ============ SECTION REVIEWS ============ */
	.section-reviews {
		padding: 84px 0;
		background: #f8fafc;
		border-top: 1px solid var(--border);
	}

	.reviews-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 24px;
	}

	.review-card {
		background: #ffffff;
		border: 1px solid var(--border);
		border-radius: 18px;
		padding: 26px;
		display: flex;
		flex-direction: column;
		gap: 14px;
		box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
	}

	.review-stars {
		color: #f59e0b;
		font-size: 15px;
		letter-spacing: 2px;
	}

	.review-text {
		font-size: 13.5px;
		color: var(--ink-2);
		line-height: 1.55;
		margin: 0;
		flex: 1;
	}

	.reviewer-meta {
		display: flex;
		align-items: center;
		gap: 10px;
		padding-top: 12px;
		border-top: 1px solid var(--border);
	}

	.reviewer-avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: var(--surface-2);
		display: grid;
		place-items: center;
		font-size: 16px;
	}

	.reviewer-meta strong {
		font-size: 13px;
		color: var(--ink);
		display: block;
	}

	.reviewer-meta span {
		font-size: 11px;
		color: var(--muted);
	}

	/* ============ SECTION FAQ ============ */
	.section-faq {
		padding: 84px 0;
		background: #ffffff;
		border-top: 1px solid var(--border);
	}

	.faq-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 24px;
	}

	.faq-item {
		background: #f8fafc;
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 24px;
	}

	.faq-item h4 {
		font-size: 15.5px;
		font-weight: 800;
		color: var(--ink);
		margin: 0 0 10px;
	}

	.faq-item p {
		font-size: 13.5px;
		color: var(--muted);
		margin: 0;
		line-height: 1.5;
	}

	/* ============ FOOTER ============ */
	.landing-footer {
		background: #090d16;
		color: #ffffff;
		padding: 64px 24px 32px;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	.footer-inner {
		max-width: 1240px;
		margin: 0 auto;
	}

	.footer-top-grid {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr 1.2fr;
		gap: 40px;
		padding-bottom: 48px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.footer-brand-col {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.footer-logo {
		display: inline-flex;
		align-items: center;
		gap: 10px;
	}

	.footer-emblem {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		background: var(--primary);
		display: grid;
		place-items: center;
		color: #ffffff;
	}

	.footer-name {
		font-size: 18px;
		font-weight: 900;
		letter-spacing: -0.02em;
	}

	.footer-tagline {
		font-size: 13px;
		color: #94a3b8;
		line-height: 1.5;
		margin: 0;
		max-width: 360px;
	}

	.footer-certs {
		display: flex;
		gap: 8px;
		margin-top: 6px;
	}

	.cert-pill {
		font-size: 10.5px;
		font-weight: 750;
		background: rgba(255, 255, 255, 0.08);
		color: #34d399;
		padding: 3px 8px;
		border-radius: var(--r-full);
	}

	.footer-links-col h4 {
		font-size: 14px;
		font-weight: 800;
		color: #ffffff;
		margin: 0 0 16px;
	}

	.footer-links-col a,
	.footer-nav-link {
		display: block;
		font-size: 13px;
		color: #94a3b8;
		text-decoration: none;
		margin-bottom: 10px;
		transition: color 130ms ease;
	}

	.footer-links-col a:hover,
	.footer-nav-link:hover {
		color: var(--primary);
	}

	.footer-staff-link {
		display: inline-block;
		margin-top: 8px;
		padding: 6px 12px;
		background: rgba(99, 102, 241, 0.2);
		border: 1px solid rgba(129, 140, 248, 0.35);
		border-radius: var(--r-md);
		color: #c7d2fe !important;
		font-size: 12px;
		font-weight: 750;
		text-decoration: none;
	}

	.footer-bottom-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		padding-top: 28px;
		font-size: 12px;
		color: #64748b;
		gap: 12px;
	}

	.footer-bottom-bar p {
		margin: 0;
	}

	.footer-bottom-meta {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	/* ============ RESPONSIVE BREAKPOINTS ============ */
	@media (max-width: 1024px) {
		.nav-links-center {
			display: none;
		}

		.why-split-layout {
			grid-template-columns: 1fr;
		}

		.footer-top-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	@media (max-width: 768px) {
		.hero-section {
			padding: 48px 20px 60px;
		}

		.footer-top-grid {
			grid-template-columns: 1fr;
		}

		.trust-metrics-strip {
			flex-direction: column;
			gap: 14px;
		}

		.metric-divider {
			width: 60px;
			height: 1px;
		}

		.cta-banner-box {
			padding: 40px 20px;
		}
	}

	@media (max-width: 540px) {
		.staff-text {
			display: none;
		}
	}
</style>
