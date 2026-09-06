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
		ShieldCheck,
		User,
		Receipt,
		Building2,
		HeartHandshake,
		ChevronRight,
		ArrowRight,
		ArrowUpRight,
		Sparkles,
		Star,
		Award,
		Zap,
		Check,
		Search,
		HelpCircle,
		ExternalLink
	} from "@lucide/svelte";

	let { data } = $props();
	const t = $derived(makeT(page.data.locale ?? "en"));
	const isId = $derived(page.data.locale === "id");

	function scrollTo(id: string) {
		const el = document.getElementById(id);
		if (el) el.scrollIntoView({ behavior: "smooth" });
	}
</script>

<svelte:head>
	<title>{isId ? "PetCo Semarang · Salon Grooming Profesional & Hotel Hewan 24 Jam" : "PetCo Semarang · Premier Pet Grooming Salon & Luxury Boarding"}</title>
	<meta
		name="description"
		content={isId
			? "Pusat salon grooming profesional dan hotel penitipan hewan ber-AC 24 jam terbaik di Kota Semarang. 5 cabang resmi di Simpang Lima, Candi Baru, Banyumanik, Puri Anjasmoro & Ngaliyan."
			: "Semarang's premier certified pet grooming salon and 24/7 climate-controlled boarding suites. 5 facilities across Semarang (Simpang Lima, Candi Hills, Banyumanik, Puri Anjasmoro & Ngaliyan)."}
	/>
</svelte:head>

<div class="neobrutalist-root overflow-x-hidden w-full max-w-full">
	<!-- ==================== TOP NAVIGATION BAR ==================== -->
	<header class="neo-header">
		<div class="neo-header-inner">
			<a href="/" class="neo-brand">
				<span class="brand-box"><PawPrint size={19} strokeWidth={2.6} /></span>
				<div class="brand-text-block">
					<span class="brand-title">PETCO</span>
					<span class="brand-city-tag">SEMARANG</span>
				</div>
			</a>

			<nav class="neo-nav-links" aria-label="Main Navigation">
				<a href="#about" onclick={(e) => { e.preventDefault(); scrollTo('about'); }}>{isId ? "[ TENTANG ]" : "[ ABOUT ]"}</a>
				<a href="#services" onclick={(e) => { e.preventDefault(); scrollTo('services'); }}>{isId ? "[ LAYANAN ]" : "[ SERVICES ]"}</a>
				<a href="#safety" onclick={(e) => { e.preventDefault(); scrollTo('safety'); }}>{isId ? "[ KEAMANAN ]" : "[ SAFETY ]"}</a>
				<a href="#branches" onclick={(e) => { e.preventDefault(); scrollTo('branches'); }}>{isId ? "[ CABANG SEMARANG ]" : "[ SEMARANG BRANCHES ]"}</a>
				<a href="#pricing" onclick={(e) => { e.preventDefault(); scrollTo('pricing'); }}>{isId ? "[ TARIF ]" : "[ PRICING ]"}</a>
			</nav>

			<div class="neo-nav-actions">
				<LanguageSwitcher value={page.data.locale ?? "en"} currentPath="/" />
				<a href="/book" class="neo-btn neo-btn-sm neo-btn-primary">
					<Calendar size={14} />
					<span>{isId ? "RESERVASI" : "BOOK ONLINE"}</span>
					<ArrowRight size={13} />
				</a>
				<a href="/dashboard" class="neo-staff-btn" title="Staff Management Console">
					<User size={13} />
					<span class="staff-label">{isId ? "STAF" : "STAFF"}</span>
				</a>
			</div>
		</div>
	</header>

	<!-- ==================== HERO SECTION ==================== -->
	<section class="neo-hero-section">
		<div class="neo-container">
			<div class="hero-tag-strip">
				<span class="status-indicator"></span>
				<span class="tag-label">{isId ? "SALON GROOMING & HOTEL HEWAN RESMI // KOTA SEMARANG, JAWA TENGAH" : "OFFICIAL COMPANION SALON & BOARDING // SEMARANG, CENTRAL JAVA"}</span>
			</div>

			<h1 class="hero-huge-title">
				{#if isId}
					SALON GROOMING MEWAH, HOTEL 24 JAM &amp; <span class="highlight-box">PERAWATAN TERBAIK</span> DI KOTA SEMARANG.
				{:else}
					ARTISANAL PET GROOMING, 24/7 LUXURY HOTEL &amp; <span class="highlight-box">PREMIER CARE</span> IN SEMARANG.
				{/if}
			</h1>

			<p class="hero-lead-text">
				{#if isId}
					PetCo menghadirkan standar salon kecantikan hewan berlisensi internasional, hotel ber-AC dengan pemantauan CCTV 24/7 dan laporan foto WhatsApp harian, serta rekam medis terpadu di 5 fasilitas kami di Kota Semarang (Simpang Lima, Candi Baru, Banyumanik, Puri Anjasmoro &amp; Ngaliyan).
				{:else}
					PetCo delivers certified breed-standard scissor styling, 24/7 climate-controlled boarding suites with daily WhatsApp photo logs, and clinical veterinary health monitoring across 5 dedicated facilities in Semarang City.
				{/if}
			</p>

			<div class="hero-actions-row">
				<a href="/book" class="neo-btn neo-btn-lg neo-btn-primary">
					<Calendar size={18} />
					<span>{isId ? "RESERVASI JADWAL DI SEMARANG" : "BOOK APPOINTMENT IN SEMARANG"}</span>
					<ArrowUpRight size={18} />
				</a>

				<a href="/book?lookup=1" class="neo-btn neo-btn-lg neo-btn-secondary">
					<Search size={16} />
					<span>{isId ? "LACAK STATUS BOOKING KLIEN" : "TRACK MY BOOKING STATUS"}</span>
				</a>
			</div>

			<!-- Quick Telemetry Strip -->
			<div class="neo-metrics-grid">
				<div class="metric-box">
					<span class="m-code">[ LOKASI_SEMARANG ]</span>
					<strong class="m-val">5 CABANG</strong>
					<span class="m-sub">{isId ? "Simpang Lima, Candi, Banyumanik, Puri & Ngaliyan" : "Across Central, South & West Semarang"}</span>
				</div>
				<div class="metric-box">
					<span class="m-code">[ ANABUL_TERLAYANI ]</span>
					<strong class="m-val">12,500+</strong>
					<span class="m-sub">{isId ? "Hewan Peliharaan Terdata di Semarang" : "Registered Companion Pets in Semarang"}</span>
				</div>
				<div class="metric-box">
					<span class="m-code">[ PEMANTAUAN_24JAM ]</span>
					<strong class="m-val">24 / 7 CARE</strong>
					<span class="m-sub">{isId ? "Caretaker On-Duty & Laporan WhatsApp" : "On-Duty Attendant & Daily Photo Logs"}</span>
				</div>
				<div class="metric-box">
					<span class="m-code">[ RATING_KLIEN ]</span>
					<strong class="m-val">4.9 ★ RATING</strong>
					<span class="m-sub">{isId ? "2,400+ Ulasan Pemilik Hewan Semarang" : "From 2,400+ Verified Semarang Owners"}</span>
				</div>
			</div>
		</div>
	</section>

	<!-- ==================== TICKER RIBBON ==================== -->
	<section class="neo-ticker-section" aria-hidden="true">
		<div class="ticker-wrapper">
			<div class="ticker-content">
				<span>/// SALON GROOMING SEMARANG</span>
				<span class="sep">■</span>
				<span>PEMBERIAN MAKAN & JALAN SORE TERJADWAL</span>
				<span class="sep">■</span>
				<span>RUANG INAP BER-AC DENGAN HEPA FILTER</span>
				<span class="sep">■</span>
				<span>100% PEMISAHAN RUANG ANJING & KUCING</span>
				<span class="sep">■</span>
				<span>GERBANG VERIFIKASI VAKSIN BEBAS PENYAKIT</span>
				<span class="sep">■</span>
				<span>5 CABANG RESMI DI KOTA SEMARANG</span>
				<span class="sep">■</span>
			</div>
			<div class="ticker-content">
				<span>/// SALON GROOMING SEMARANG</span>
				<span class="sep">■</span>
				<span>PEMBERIAN MAKAN & JALAN SORE TERJADWAL</span>
				<span class="sep">■</span>
				<span>RUANG INAP BER-AC DENGAN HEPA FILTER</span>
				<span class="sep">■</span>
				<span>100% PEMISAHAN RUANG ANJING & KUCING</span>
				<span class="sep">■</span>
				<span>GERBANG VERIFIKASI VAKSIN BEBAS PENYAKIT</span>
				<span class="sep">■</span>
				<span>5 CABANG RESMI DI KOTA SEMARANG</span>
				<span class="sep">■</span>
			</div>
		</div>
	</section>

	<!-- ==================== ABOUT / PHILOSOPHY ==================== -->
	<section id="about" class="neo-section bg-cream">
		<div class="neo-container">
			<div class="section-title-strip">
				<span class="sec-index">[ 01 / PHILOSOPHY ]</span>
				<h2>{isId ? "PERAWATAN HEWAN PROFESIONAL TANPA KOMPROMI" : "SOPHISTICATED PET CARE PRACTICE"}</h2>
				<p class="sec-lead">
					{isId
						? "PetCo hadir di Kota Semarang untuk memberikan standar kenyamanan dan keselamatan hewan peliharaan tertinggi. Kami menerapkan teknik handling tanpa kekerasan, sterilisasi alat menyeluruh, dan transparansi laporan langsung ke ponsel Anda."
						: "PetCo operates exclusively in Semarang City to deliver unparalleled comfort, safety, and transparency. We combine fear-free gentle handling, clinical-grade UV sterilization, and real-time photo logs directly to pet parents."}
				</p>
			</div>

			<div class="pillars-3-grid">
				<div class="pillar-card-neo">
					<div class="pillar-top-meta">
						<span class="p-num">[ 01 ]</span>
						<span class="p-badge blue">CERTIFIED STYLISTS</span>
					</div>
					<h3>{isId ? "Groomer & Stylist Bersertifikasi" : "Certified Master Groomers"}</h3>
					<p>{isId ? "Stylist kami terlatih dalam teknik pemotongan simetris ras, handling lembut tanpa kekerasan, terapi mandi kulit sensitif, dan perawatan cakar higienis." : "Trained in breed-specific scissor styling, fear-free gentle handling, dermatological coat therapy, and low-stress hygiene care."}</p>
					<div class="pillar-foot-tag"><Check size={14} /> <span>100% Fear-Free Gentle Handling</span></div>
				</div>

				<div class="pillar-card-neo">
					<div class="pillar-top-meta">
						<span class="p-num">[ 02 ]</span>
						<span class="p-badge purple">VACCINE SAFETY GATE</span>
					</div>
					<h3>{isId ? "Gerbang Kepatuhan Vaksin Medis" : "Clinical Vaccine Verification"}</h3>
					<p>{isId ? "Sistem digital kami memverifikasi vaksin Rabies & Parvo/DHPP sebelum hotel check-in untuk memastikan lingkungan menginap 100% aman dan bebas penularan." : "Digital health records automatically verify core vaccinations (DHPP, Rabies, FPV) before boarding to guarantee zero disease contagion."}</p>
					<div class="pillar-foot-tag"><Check size={14} /> <span>Zero Contagion Guarantee</span></div>
				</div>

				<div class="pillar-card-neo">
					<div class="pillar-top-meta">
						<span class="p-num">[ 03 ]</span>
						<span class="p-badge green">DAILY TELEMETRY</span>
					</div>
					<h3>{isId ? "Laporan Harian WhatsApp & CCTV" : "Daily WhatsApp Photo Logs"}</h3>
					<p>{isId ? "Pantau aktivitas makan, minum obat, jalan sore, dan keceriaan anabul Anda di Semarang setiap pagi dan sore langsung dari WhatsApp." : "Receive mealtime verifications, play session snapshots, and mood notes sent directly to your WhatsApp twice daily."}</p>
					<div class="pillar-foot-tag"><Check size={14} /> <span>Twice-Daily Real-Time Updates</span></div>
				</div>
			</div>
		</div>
	</section>

	<!-- ==================== CORE SERVICES BREAKDOWN ==================== -->
	<section id="services" class="neo-section bg-white">
		<div class="neo-container">
			<div class="section-title-strip">
				<span class="sec-index">[ 02 / SERVICES ]</span>
				<h2>{isId ? "LAYANAN SPESIALIS PETCO SEMARANG" : "SPECIALIZED SERVICE DISCIPLINES"}</h2>
				<p class="sec-lead">
					{isId
						? "Pilihan paket grooming, hotel penitipan ber-AC, dan perawatan akuarium dengan tarif transparan di seluruh cabang Semarang."
						: "Certified grooming packages, luxury climate-controlled suites, and aquatic maintenance with transparent itemized pricing."}
				</p>
			</div>

			<div class="services-stacked-grid">
				<!-- Service 1: Grooming -->
				<div class="service-box-neo">
					<div class="service-left">
						<span class="svc-code">[ SVC-01 // GROOMING & SPA ]</span>
						<h3>{isId ? "Spa & Grooming Profesional Berstandar Ras" : "Certified Breed Styling & Hydrotherapy Spa"}</h3>
						<p>{isId ? "Mandi busa hypoallergenic, blow-dry lembut, pembersihan kantung telinga, potong kuku dremel, sikat gigi, terapi kutu medicated, dan styling bulu profesional." : "Hydrotherapy bath, gentle blow-drying, ear canal cleansing, nail dremel shaping, teeth brushing, medicated flea treatments, and custom breed styling."}</p>
						<ul class="svc-list">
							<li><Check size={14} /> {isId ? "Formula shampoo organik bebas paraben & hypoallergenic" : "Botanical paraben-free & hypoallergenic shampoos"}</li>
							<li><Check size={14} /> {isId ? "Tercatat di Kartu Spesifikasi Potongan Bulu Digital" : "Recorded in your pet's permanent digital cut dossier"}</li>
						</ul>
					</div>
					<div class="service-right">
						<div class="price-banner">
							<span class="p-from">{isId ? "TARIF MULAI" : "STARTING AT"}</span>
							<strong class="p-amount">Rp 60.000</strong>
						</div>
						<a href="/book?kind=grooming" class="neo-btn neo-btn-primary w-full">
							<span>{isId ? "RESERVASI GROOMING" : "BOOK GROOMING"}</span>
							<ArrowRight size={14} />
						</a>
					</div>
				</div>

				<!-- Service 2: Pet Hotel -->
				<div class="service-box-neo featured-box">
					<div class="featured-tag">{isId ? "★ REKOMENDASI TERBAIK DI SEMARANG" : "★ HIGH-DEMAND FACILITY IN SEMARANG"}</div>
					<div class="service-left">
						<span class="svc-code">[ SVC-02 // 24/7 PET HOTEL ]</span>
						<h3>{isId ? "Hotel Penitipan Hewan 24 Jam Ber-AC & CCTV" : "24/7 Climate-Controlled Luxury Boarding"}</h3>
						<p>{isId ? "Kamar privat bersih dengan sirkulasi udara HEPA, pemisahan 100% area kucing dan anjing, rutinitas makan terjadwal, jalan pagi/sore, dan laporan video berkala." : "Private air-conditioned suites with HEPA air filtration, 100% feline/canine wing isolation, scheduled nutrition routines, and daily exercise."}</p>
						<ul class="svc-list">
							<li><Check size={14} /> {isId ? "Pemberian obat & diet sesuai instruksi pemilik" : "Custom dietary and prescription medication administration"}</li>
							<li><Check size={14} /> {isId ? "Jalan pagi dan sore di area bermain terproteksi" : "Morning and evening daily exercise sessions"}</li>
						</ul>
					</div>
					<div class="service-right">
						<div class="price-banner">
							<span class="p-from">{isId ? "TARIF PER MALAM" : "RATE PER NIGHT"}</span>
							<strong class="p-amount">Rp 120.000</strong>
							<span class="p-unit">/{isId ? "malam" : "night"}</span>
						</div>
						<a href="/book?kind=hotel" class="neo-btn neo-btn-primary w-full">
							<span>{isId ? "RESERVASI KAMAR HOTEL" : "RESERVE SUITE"}</span>
							<ArrowRight size={14} />
						</a>
					</div>
				</div>

				<!-- Service 3: Aquarium -->
				<div class="service-box-neo">
					<div class="service-left">
						<span class="svc-code">[ SVC-03 // AQUATIC ENGINEERING ]</span>
						<h3>{isId ? "Layanan Desain Aquascape & Perawatan Tangki" : "Custom Aquascaping & Ecosystem Maintenance"}</h3>
						<p>{isId ? "Instalasi ekosistem air tawar dan laut di Semarang, uji kimia air digital (pH, Ammonia, Salinitas, Nitrat), pembersihan filter mekanis, dan perawatan terumbu karang." : "Freshwater biotope & marine reef architecture across Semarang, digital water parameter testing (pH, NH3, Salinity), filter overhauls, and coral maintenance."}</p>
						<ul class="svc-list">
							<li><Check size={14} /> {isId ? "Dikerjakan oleh teknisi biologi akuatik berpengalaman" : "Performed by certified aquatic biologists and technicians"}</li>
							<li><Check size={14} /> {isId ? "Tersedia paket langganan kunjungan berkala" : "Weekly and monthly recurring service maintenance plans"}</li>
						</ul>
					</div>
					<div class="service-right">
						<div class="price-banner">
							<span class="p-from">{isId ? "TARIF KUNJUNGAN" : "VISIT RATE"}</span>
							<strong class="p-amount">Rp 150.000</strong>
						</div>
						<a href="/book?kind=aquarium" class="neo-btn neo-btn-primary w-full">
							<span>{isId ? "RESERVASI AKUARIUM" : "BOOK AQUATIC SERVICE"}</span>
							<ArrowRight size={14} />
						</a>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ==================== SAFETY STANDARDS ==================== -->
	<section id="safety" class="neo-section bg-dark">
		<div class="neo-container">
			<div class="section-title-strip dark">
				<span class="sec-index yellow">[ 03 / SAFETY PROTOCOLS ]</span>
				<h2>{isId ? "PROTOKOL KESELAMATAN & HIGIENIS TERTINGGI" : "CLINICAL SANITATION ARCHITECTURE"}</h2>
				<p class="sec-lead">
					{isId
						? "Kesehatan dan keselamatan anabul Anda di Semarang adalah tanggung jawab mutlak kami. Setiap cabang beroperasi dengan SOP klinik modern."
						: "Your pet's safety in Semarang is our non-negotiable responsibility. Every facility operates under strict medical-grade SOPs."}
				</p>
			</div>

			<div class="safety-grid-neo">
				<div class="safety-cell">
					<div class="s-icon"><ShieldCheck size={26} /></div>
					<h4>{isId ? "Sterilisasi Alat UV-C" : "UV-C Tool Sterilization"}</h4>
					<p>{isId ? "Semua pisau clipper, gunting, meja grooming, dan handuk disterilisasi sebelum digunakan pada hewan berikutnya." : "Every blade, shear, grooming table, and towel is sanitized and UV-treated between appointments."}</p>
				</div>
				<div class="safety-cell">
					<div class="s-icon"><Award size={26} /></div>
					<h4>{isId ? "Pemisahan Anjing & Kucing 100%" : "100% Species Sound & Scent Isolation"}</h4>
					<p>{isId ? "Ruang inap dan area salon anjing dan kucing terpisah total untuk meminimalkan kecemasan dan stres pada hewan." : "Dog and cat wings are acoustically and olfactory isolated to eliminate sensory anxiety."}</p>
				</div>
				<div class="safety-cell">
					<div class="s-icon"><Zap size={26} /></div>
					<h4>{isId ? "Rekam Medis Terpusat 5 Cabang" : "Unified 5-Branch Medical Dossier"}</h4>
					<p>{isId ? "Data alergi, preferensi potongan, dan riwayat menginap sinkron di seluruh cabang Semarang (Simpang Lima, Candi, Banyumanik, Puri, Ngaliyan)." : "Your pet's allergies, cut cards, and stay records seamlessly sync across all 5 Semarang facilities."}</p>
				</div>
			</div>
		</div>
	</section>

	<!-- ==================== SEMARANG BRANCHES DIRECTORY ==================== -->
	<section id="branches" class="neo-section bg-cream">
		<div class="neo-container">
			<div class="section-title-strip">
				<span class="sec-index">[ 04 / SEMARANG FACILITIES ]</span>
				<h2>{isId ? "5 CABANG RESMI PETCO DI KOTA SEMARANG" : "5 PETCO FACILITIES IN SEMARANG CITY"}</h2>
				<p class="sec-lead">
					{isId
						? "Fasilitas lengkap kami tersebar di lokasi strategis Semarang untuk memberikan kemudahan akses bagi Anda dan anabul."
						: "State-of-the-art salons and boarding facilities strategically located across Semarang."}
				</p>
			</div>

			<div class="branches-grid-neo">
				{#each data.branches as branch}
					<div class="branch-card-neo" class:hq-border={branch.isHeadOffice}>
						<div class="b-head-row">
							<span class="b-city-tag"><MapPin size={13} /> {branch.city || "Kota Semarang"}</span>
							{#if branch.isHeadOffice}
								<span class="b-hq-badge">FLAGSHIP SALON</span>
							{/if}
						</div>
						<h3>{branch.name}</h3>
						<p class="b-addr">{branch.address || "Semarang, Jawa Tengah"}</p>
						<div class="b-meta-block">
							<div><Clock size={13} /> <span>08:00 - 20:00 WIB</span></div>
							<div><Phone size={13} /> <span>{branch.phone || "+62 24 841-5500"}</span></div>
						</div>
						<a href="/book?branch={branch.id}" class="neo-btn neo-btn-sm neo-btn-subtle w-full">
							<span>{isId ? "RESERVASI DI CABANG INI" : "BOOK AT THIS FACILITY"}</span>
							<ArrowRight size={13} />
						</a>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- ==================== CERTIFIED PRICING ==================== -->
	<section id="pricing" class="neo-section bg-white">
		<div class="neo-container">
			<div class="section-title-strip">
				<span class="sec-index">[ 05 / PRICING ]</span>
				<h2>{isId ? "KATALOG TARIF LAYANAN RESMI SEMARANG" : "CERTIFIED SERVICE RATES IN SEMARANG"}</h2>
				<p class="sec-lead">
					{isId
						? "Semua tarif tertera jelas dan transparan. Tidak ada biaya siluman atau tambahan tanpa persetujuan."
						: "All rates are transparent with no surprise add-on charges."}
				</p>
			</div>

			<div class="pricing-grid-neo">
				<!-- Tier 1: Grooming -->
				<div class="pricing-box-neo">
					<div class="pr-badge pink">GROOMING</div>
					<h3>{isId ? "Grooming & Styling" : "Styling & Spa"}</h3>
					<div class="pr-amount-row">
						<span class="pr-from">{isId ? "Mulai" : "From"}</span>
						<strong class="pr-price">Rp 60.000</strong>
					</div>
					<ul class="pr-features">
						<li><Check size={14} /> Bath &amp; Brush (Mandi &amp; Sisir): <strong>Rp 60.000</strong></li>
						<li><Check size={14} /> Full Groom (Potong Lengkap): <strong>Rp 150.000</strong></li>
						<li><Check size={14} /> Flea Medicated Bath: <strong>Rp 90.000</strong></li>
						<li><Check size={14} /> Sikat Gigi &amp; Gunting Kuku: <strong>Rp 30.000</strong></li>
					</ul>
					<a href="/book?kind=grooming" class="neo-btn neo-btn-subtle w-full">
						<span>{isId ? "RESERVASI GROOMING" : "BOOK GROOMING"}</span>
					</a>
				</div>

				<!-- Tier 2: Hotel -->
				<div class="pricing-box-neo highlight-pricing">
					<div class="pr-pop-tag">{isId ? "POPULER" : "FEATURED"}</div>
					<div class="pr-badge purple">PET HOTEL</div>
					<h3>{isId ? "Hotel & Penitipan 24 Jam" : "Luxury 24/7 Boarding"}</h3>
					<div class="pr-amount-row">
						<span class="pr-from">{isId ? "Mulai" : "From"}</span>
						<strong class="pr-price">Rp 120.000</strong>
						<span class="pr-per">/{isId ? "malam" : "night"}</span>
					</div>
					<ul class="pr-features">
						<li><Check size={14} /> Standard Suite (AC, Makan 2x): <strong>Rp 120.000</strong></li>
						<li><Check size={14} /> Deluxe Suite (Playtime &amp; CCTV): <strong>Rp 180.000</strong></li>
						<li><Check size={14} /> VIP Penthouse Suite: <strong>Rp 300.000</strong></li>
						<li><Check size={14} /> Laporan foto WhatsApp harian gratis</li>
					</ul>
					<a href="/book?kind=hotel" class="neo-btn neo-btn-primary w-full">
						<span>{isId ? "RESERVASI KAMAR HOTEL" : "RESERVE SUITE"}</span>
					</a>
				</div>

				<!-- Tier 3: Aquarium -->
				<div class="pricing-box-neo">
					<div class="pr-badge blue">AQUARIUM</div>
					<h3>{isId ? "Layanan Akuarium" : "Aquatic Care"}</h3>
					<div class="pr-amount-row">
						<span class="pr-from">{isId ? "Mulai" : "From"}</span>
						<strong class="pr-price">Rp 150.000</strong>
					</div>
					<ul class="pr-features">
						<li><Check size={14} /> Tes Kimia Air &amp; Kalibrasi: <strong>Rp 150.000</strong></li>
						<li><Check size={14} /> Pembersihan Filter &amp; Algae: <strong>Rp 250.000</strong></li>
						<li><Check size={14} /> Overhaul Ekosistem Terumbu: <strong>Rp 500.000</strong></li>
						<li><Check size={14} /> Konsultasi desain tangki kustom di Semarang</li>
					</ul>
					<a href="/book?kind=aquarium" class="neo-btn neo-btn-subtle w-full">
						<span>{isId ? "RESERVASI AKUARIUM" : "BOOK AQUATICS"}</span>
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- ==================== REVIEWS / VERIFIED PET PARENTS ==================== -->
	<section class="neo-section bg-cream">
		<div class="neo-container">
			<div class="section-title-strip">
				<span class="sec-index">[ 06 / TESTIMONIALS ]</span>
				<h2>{isId ? "ULASAN PELANGGAN SETIA PETCO SEMARANG" : "VERIFIED SEMARANG PET PARENT STORIES"}</h2>
			</div>

			<div class="reviews-3-grid">
				<div class="review-box-neo">
					<div class="stars-line">★★★★★</div>
					<p>{isId ? "“Grooming di PetCo Simpang Lima hasilnya selalu rapi dan wangi. Anjing Toy Poodle saya biasanya takut potong kuku, tapi groomernya sangat tenang dan sabar. Rekam medis digitalnya sangat praktis saat pindah perawatan ke cabang Candi.”" : "“Grooming at PetCo Simpang Lima is consistently top-notch. My Toy Poodle is handled with total patience, and the digital record synced seamlessly when we booked in Candi.”"}</p>
					<div class="reviewer-line">
						<strong>Amanda Setiawan</strong>
						<span>Owner of Milo (Toy Poodle) · PetCo Simpang Lima Semarang</span>
					</div>
				</div>

				<div class="review-box-neo">
					<div class="stars-line">★★★★★</div>
					<p>{isId ? "“Nitip kucing 5 hari saat liburan di PetCo Candi Hills. Setiap pagi dan sore dikirimi video WhatsApp pas makan dan main. Kamarnya ber-AC bersih dan kucing saya pulang dalam kondisi sangat sehat.”" : "“Boarded my British Shorthair for 5 days at PetCo Candi Hills. Daily WhatsApp videos of meals and play gave total peace of mind. Clean, pristine suites.”"}</p>
					<div class="reviewer-line">
						<strong>Dimas Prasetyo</strong>
						<span>Owner of Simba (British Shorthair) · PetCo Candi Hills Semarang</span>
					</div>
				</div>

				<div class="review-box-neo">
					<div class="stars-line">★★★★★</div>
					<p>{isId ? "“Perawatan aquascape di PetCo Banyumanik sangat profesional. Teknisi datang tepat waktu ke rumah di Tembalang, parameter air dites detail, dan tanaman karang dipruning rapi. Sangat recommended!”" : "“Aquascape maintenance from PetCo Banyumanik is top tier. The technician arrived on time at Tembalang, water chemistry was dialed in, and the tank looks pristine.”"}</p>
					<div class="reviewer-line">
						<strong>Hendrawan Kusuma</strong>
						<span>Marine Reef Enthusiast · PetCo Banyumanik Semarang</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ==================== FAQ SECTION ==================== -->
	<section id="faq" class="neo-section bg-white">
		<div class="neo-container">
			<div class="section-title-strip">
				<span class="sec-index">[ 07 / FAQ ]</span>
				<h2>{isId ? "PERTANYAAN UMUM PELANGGAN SEMARANG" : "FREQUENTLY ASKED QUESTIONS"}</h2>
			</div>

			<div class="faq-2-grid">
				<div class="faq-box-neo">
					<h4>{isId ? "Apakah wajib vaksin sebelum menginap di pet hotel?" : "Are vaccines mandatory before hotel boarding?"}</h4>
					<p>{isId ? "Ya. Demi melindungi seluruh tamu anabul di Semarang, kami mewajibkan vaksin inti (Rabies & Parvo/DHPP untuk anjing, FPV/FVRCP untuk kucing) yang masih berlaku." : "Yes. To ensure a 100% safe environment, all dogs and cats must have active core inoculations before boarding."}</p>
				</div>
				<div class="faq-box-neo">
					<h4>{isId ? "Apakah harus membayar langsung saat booking online?" : "Is upfront payment charged during online booking?"}</h4>
					<p>{isId ? "Tidak. Booking online tidak memotong kartu Anda seketika. Anda dapat membayar saat tiba di cabang Semarang atau mentransfer DP saat konfirmasi WhatsApp tim kami." : "No immediate online charge is required. You can settle on arrival at the Semarang facility or via confirmation transfer."}</p>
				</div>
				<div class="faq-box-neo">
					<h4>{isId ? "Bagaimana jika anabul memiliki alergi atau obat khusus?" : "Can you administer special diets and medication?"}</h4>
					<p>{isId ? "Tentu saja. Anda dapat mencantumkan catatan resep dan pantangan diet pada form booking. Staf caretaker kami di Semarang terlatih memberikan obat sesuai jadwal." : "Absolutely. You can specify medical dosage and dietary needs during reservation, and our caretakers administer them rigorously."}</p>
				</div>
				<div class="faq-box-neo">
					<h4>{isId ? "Bagaimana cara membatalkan atau mengubah jadwal cabang?" : "How do I reschedule or cancel?"}</h4>
					<p>{isId ? "Hubungi cabang Semarang terkait melalui WhatsApp atau telepon langsung minimal 6 jam sebelum jadwal tanpa biaya penalti." : "Contact the Semarang facility directly via WhatsApp or phone at least 6 hours in advance without penalty."}</p>
				</div>
			</div>
		</div>
	</section>

	<!-- ==================== MASSIVE CALL TO ACTION ==================== -->
	<section class="neo-cta-section">
		<div class="neo-container">
			<div class="cta-box-huge">
				<span class="cta-mini-tag">{isId ? "PORTAL RESERVASI & DATABASE RESMI SEMARANG" : "OFFICIAL SEMARANG RESERVATION SYSTEM"}</span>
				<h2>{isId ? "BERIKAN PERAWATAN TERBAIK UNTUK ANABUL ANDA DI SEMARANG." : "ELEVATE YOUR COMPANION'S CARE EXPERIENCE IN SEMARANG."}</h2>
				<p>{isId ? "Reservasi jadwal di 5 cabang Kota Semarang dalam 2 menit atau lacak status booking Anda langsung di portal klien." : "Book your appointment in under 2 minutes or track existing reservations across Semarang in real time."}</p>
				<div class="cta-btns-group">
					<a href="/book" class="neo-btn neo-btn-lg neo-btn-primary">
						<Calendar size={18} />
						<span>{isId ? "BUKA FORM RESERVASI ONLINE" : "LAUNCH ONLINE BOOKING"}</span>
						<ArrowUpRight size={18} />
					</a>
					<a href="/book?lookup=1" class="neo-btn neo-btn-lg neo-btn-secondary">
						<Search size={16} />
						<span>{isId ? "CEK STATUS & DATABASE BOOKING" : "TRACK BOOKING STATUS"}</span>
					</a>
				</div>
			</div>
		</div>
	</section>

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
					<a href="#pricing" onclick={(e) => { e.preventDefault(); scrollTo('pricing'); }}>{isId ? "Katalog Tarif" : "Pricing Catalog"}</a>
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
	/* ============ NEOBRUTALIST BASE TOKENS ============ */
	.neobrutalist-root {
		background: #faf8f5;
		color: #0f172a;
		font-family: "Satoshi", "Plus Jakarta Sans", -apple-system, sans-serif;
		min-height: 100vh;
		overflow-x: hidden;
		width: 100%;
		max-width: 100vw;
	}

	h1, h2, h3, h4, h5, .brand-title, .hero-huge-title, .f-title {
		font-family: "Cabinet Grotesk", "Outfit", "Satoshi", sans-serif;
		letter-spacing: -0.02em;
	}

	.neo-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 24px;
	}

	/* Backgrounds */
	.bg-white { background: #ffffff; }
	.bg-cream { background: #f4f1ea; }
	.bg-dark { background: #0f172a; color: #ffffff; }

	/* Buttons & Hard Tactile Shadows */
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
		letter-spacing: 0.08em;
	}

	.neo-nav-links {
		display: flex;
		align-items: center;
		gap: 18px;
	}

	.neo-nav-links a {
		font-family: "JetBrains Mono", monospace;
		font-size: 12px;
		font-weight: 800;
		color: #0f172a;
		text-decoration: none;
		transition: color 100ms ease;
	}

	.neo-nav-links a:hover {
		color: #4f46e5;
	}

	.neo-nav-actions {
		display: flex;
		align-items: center;
		gap: 10px;
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
		transition: all 100ms ease;
	}

	.neo-staff-btn:hover {
		background: #e2e8f0;
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px #0f172a;
	}

	/* ============ HERO SECTION ============ */
	.neo-hero-section {
		padding: 72px 0 64px;
		background: #faf8f5;
		border-bottom: 2.5px solid #0f172a;
	}

	.hero-tag-strip {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: #ffffff;
		border: 2px solid #0f172a;
		padding: 5px 12px;
		border-radius: 6px;
		box-shadow: 3px 3px 0px #0f172a;
		margin-bottom: 22px;
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
		font-size: 11px;
		font-weight: 850;
		color: #0f172a;
		letter-spacing: 0.04em;
	}

	.hero-huge-title {
		font-size: clamp(34px, 5.2vw, 60px);
		font-weight: 950;
		line-height: 1.08;
		letter-spacing: -0.04em;
		color: #0f172a;
		margin: 0 0 22px;
		max-width: 1060px;
	}

	.highlight-box {
		background: #fef08a;
		border: 2px solid #0f172a;
		padding: 0 8px;
		box-shadow: 3px 3px 0px #0f172a;
		display: inline-block;
	}

	.hero-lead-text {
		font-size: clamp(15px, 1.8vw, 17.5px);
		color: #334155;
		max-width: 800px;
		line-height: 1.55;
		margin: 0 0 36px;
	}

	.hero-actions-row {
		display: flex;
		flex-wrap: wrap;
		gap: 14px;
		margin-bottom: 56px;
	}

	/* Metrics Grid */
	.neo-metrics-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 16px;
	}

	.metric-box {
		background: #ffffff;
		border: 2px solid #0f172a;
		border-radius: 8px;
		padding: 16px 18px;
		box-shadow: 3px 3px 0px #0f172a;
		display: flex;
		flex-direction: column;
		gap: 3px;
		text-align: left;
	}

	.m-code {
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		font-weight: 850;
		color: #64748b;
	}

	.m-val {
		font-size: 20px;
		font-weight: 950;
		color: #0f172a;
	}

	.m-sub {
		font-size: 11.5px;
		color: #475569;
		font-weight: 600;
	}

	/* ============ TICKER ============ */
	.neo-ticker-section {
		background: #0f172a;
		color: #facc15;
		border-bottom: 2.5px solid #0f172a;
		padding: 12px 0;
		overflow: hidden;
		width: 100%;
		max-width: 100vw;
		contain: paint;
	}

	.ticker-wrapper {
		display: flex;
		width: max-content;
		animation: scrollTicker 36s linear infinite;
	}

	.ticker-content {
		display: flex;
		align-items: center;
		gap: 20px;
		padding-right: 20px;
		font-family: "JetBrains Mono", monospace;
		font-size: 12px;
		font-weight: 900;
		letter-spacing: 0.1em;
		white-space: nowrap;
	}

	.ticker-content .sep {
		color: #ef4444;
	}

	@keyframes scrollTicker {
		from { transform: translateX(0); }
		to { transform: translateX(-50%); }
	}

	/* ============ SECTION BASICS ============ */
	.neo-section {
		padding: 72px 0;
		border-bottom: 2.5px solid #0f172a;
	}

	.section-title-strip {
		margin-bottom: 40px;
	}

	.sec-index {
		font-family: "JetBrains Mono", monospace;
		font-size: 11px;
		font-weight: 850;
		letter-spacing: 0.08em;
		color: #4f46e5;
		display: block;
		margin-bottom: 6px;
	}

	.sec-index.yellow {
		color: #facc15;
	}

	.section-title-strip h2 {
		font-size: clamp(26px, 3.8vw, 40px);
		font-weight: 950;
		letter-spacing: -0.03em;
		margin: 0 0 10px;
	}

	.sec-lead {
		font-size: 15px;
		color: #475569;
		max-width: 740px;
		line-height: 1.5;
		margin: 0;
	}

	.section-title-strip.dark h2 { color: #ffffff; }
	.section-title-strip.dark .sec-lead { color: #94a3b8; }

	/* ============ PILLARS GRID ============ */
	.pillars-3-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 20px;
	}

	.pillar-card-neo {
		background: #ffffff;
		border: 2px solid #0f172a;
		border-radius: 10px;
		padding: 24px;
		box-shadow: 4px 4px 0px #0f172a;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.pillar-top-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.p-num {
		font-family: "JetBrains Mono", monospace;
		font-weight: 850;
		font-size: 11px;
	}

	.p-badge {
		font-size: 10px;
		font-weight: 850;
		padding: 2px 7px;
		border: 1.5px solid #0f172a;
		border-radius: 4px;
	}

	.p-badge.blue { background: #bae6fd; }
	.p-badge.purple { background: #e9d5ff; }
	.p-badge.green { background: #a7f3d0; }

	.pillar-card-neo h3 {
		font-size: 18px;
		font-weight: 900;
		margin: 0;
		color: #0f172a;
	}

	.pillar-card-neo p {
		font-size: 13.5px;
		color: #475569;
		line-height: 1.5;
		margin: 0;
		flex: 1;
	}

	.pillar-foot-tag {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11.5px;
		font-weight: 800;
		color: #0f172a;
		padding-top: 12px;
		border-top: 1.5px dashed #0f172a;
	}

	.pillar-foot-tag svg {
		color: #10b981;
	}

	/* ============ SERVICES STACKED ============ */
	.services-stacked-grid {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.service-box-neo {
		position: relative;
		background: #faf8f5;
		border: 2px solid #0f172a;
		border-radius: 10px;
		padding: 28px;
		box-shadow: 4px 4px 0px #0f172a;
		display: grid;
		grid-template-columns: 1fr 280px;
		gap: 28px;
		align-items: center;
	}

	.service-box-neo.featured-box {
		background: #fefce8;
		border-color: #0f172a;
	}

	.featured-tag {
		position: absolute;
		top: -12px;
		left: 24px;
		background: #facc15;
		border: 2px solid #0f172a;
		font-size: 10px;
		font-weight: 900;
		padding: 2px 9px;
		border-radius: 4px;
		box-shadow: 2px 2px 0px #0f172a;
	}

	.svc-code {
		font-family: "JetBrains Mono", monospace;
		font-size: 11px;
		font-weight: 850;
		color: #4f46e5;
		display: block;
		margin-bottom: 6px;
	}

	.service-left h3 {
		font-size: 22px;
		font-weight: 900;
		margin: 0 0 10px;
		color: #0f172a;
	}

	.service-left p {
		font-size: 13.5px;
		color: #475569;
		line-height: 1.5;
		margin: 0 0 14px;
	}

	.svc-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.svc-list li {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12.5px;
		font-weight: 650;
		color: #0f172a;
	}

	.svc-list li svg {
		color: #10b981;
		flex-shrink: 0;
	}

	.service-right {
		background: #ffffff;
		border: 2px solid #0f172a;
		border-radius: 8px;
		padding: 20px;
		box-shadow: 3px 3px 0px #0f172a;
		display: flex;
		flex-direction: column;
		gap: 14px;
		text-align: center;
	}

	.price-banner {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.p-from {
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		font-weight: 850;
		color: #64748b;
	}

	.p-amount {
		font-size: 26px;
		font-weight: 950;
		color: #0f172a;
	}

	.p-unit {
		font-size: 11px;
		color: #64748b;
	}

	/* ============ SAFETY DARK ============ */
	.safety-grid-neo {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 20px;
	}

	.safety-cell {
		background: #1e293b;
		border: 2px solid #ffffff;
		border-radius: 10px;
		padding: 26px;
		box-shadow: 4px 4px 0px #ffffff;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.s-icon {
		color: #facc15;
	}

	.safety-cell h4 {
		font-size: 17px;
		font-weight: 900;
		color: #ffffff;
		margin: 0;
	}

	.safety-cell p {
		font-size: 13px;
		color: #cbd5e1;
		line-height: 1.5;
		margin: 0;
	}

	/* ============ BRANCHES ============ */
	.branches-grid-neo {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 20px;
	}

	.branch-card-neo {
		background: #ffffff;
		border: 2px solid #0f172a;
		border-radius: 10px;
		padding: 22px;
		box-shadow: 4px 4px 0px #0f172a;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.branch-card-neo.hq-border {
		background: #eff6ff;
	}

	.b-head-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.b-city-tag {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 11px;
		font-weight: 850;
		color: #4f46e5;
	}

	.b-hq-badge {
		font-size: 9px;
		font-weight: 900;
		background: #0f172a;
		color: #facc15;
		padding: 2px 6px;
		border-radius: 4px;
	}

	.branch-card-neo h3 {
		font-size: 17px;
		font-weight: 900;
		color: #0f172a;
		margin: 0;
	}

	.b-addr {
		font-size: 12.5px;
		color: #475569;
		line-height: 1.4;
		margin: 0;
	}

	.b-meta-block {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 11.5px;
		color: #0f172a;
		font-weight: 700;
		padding: 10px 0;
		border-top: 1.5px dashed #cbd5e1;
		border-bottom: 1.5px dashed #cbd5e1;
	}

	.b-meta-block div {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	/* ============ PRICING ============ */
	.pricing-grid-neo {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 24px;
	}

	.pricing-box-neo {
		position: relative;
		background: #faf8f5;
		border: 2px solid #0f172a;
		border-radius: 10px;
		padding: 28px;
		box-shadow: 4px 4px 0px #0f172a;
		display: flex;
		flex-direction: column;
	}

	.pricing-box-neo.highlight-pricing {
		background: #fefce8;
		border-width: 2.5px;
		box-shadow: 6px 6px 0px #0f172a;
	}

	.pr-pop-tag {
		position: absolute;
		top: -12px;
		right: 20px;
		background: #0f172a;
		color: #facc15;
		font-size: 10px;
		font-weight: 900;
		padding: 3px 8px;
		border-radius: 4px;
	}

	.pr-badge {
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		font-weight: 900;
		padding: 2px 7px;
		border: 1.5px solid #0f172a;
		border-radius: 4px;
		width: fit-content;
		margin-bottom: 10px;
	}

	.pr-badge.pink { background: #fbcfe8; }
	.pr-badge.purple { background: #e9d5ff; }
	.pr-badge.blue { background: #bae6fd; }

	.pricing-box-neo h3 {
		font-size: 20px;
		font-weight: 900;
		color: #0f172a;
		margin: 0 0 10px;
	}

	.pr-amount-row {
		display: flex;
		align-items: baseline;
		gap: 6px;
		margin-bottom: 16px;
	}

	.pr-from {
		font-size: 12px;
		color: #64748b;
	}

	.pr-price {
		font-size: 28px;
		font-weight: 950;
		color: #0f172a;
	}

	.pr-per {
		font-size: 12px;
		color: #64748b;
	}

	.pr-features {
		list-style: none;
		padding: 0;
		margin: 0 0 24px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		flex: 1;
	}

	.pr-features li {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12.5px;
		color: #334155;
	}

	.pr-features li svg {
		color: #10b981;
		flex-shrink: 0;
	}

	/* ============ REVIEWS ============ */
	.reviews-3-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 20px;
	}

	.review-box-neo {
		background: #ffffff;
		border: 2px solid #0f172a;
		border-radius: 10px;
		padding: 24px;
		box-shadow: 4px 4px 0px #0f172a;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.stars-line {
		color: #f59e0b;
		font-size: 14px;
		letter-spacing: 2px;
	}

	.review-box-neo p {
		font-size: 13.5px;
		color: #334155;
		line-height: 1.5;
		margin: 0;
		flex: 1;
	}

	.reviewer-line {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding-top: 10px;
		border-top: 1.5px dashed #cbd5e1;
	}

	.reviewer-line strong {
		font-size: 13px;
		color: #0f172a;
	}

	.reviewer-line span {
		font-size: 11px;
		color: #64748b;
	}

	/* ============ FAQ ============ */
	.faq-2-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
		gap: 20px;
	}

	.faq-box-neo {
		background: #faf8f5;
		border: 2px solid #0f172a;
		border-radius: 8px;
		padding: 22px;
		box-shadow: 3px 3px 0px #0f172a;
	}

	.faq-box-neo h4 {
		font-size: 15px;
		font-weight: 900;
		color: #0f172a;
		margin: 0 0 8px;
	}

	.faq-box-neo p {
		font-size: 13px;
		color: #475569;
		line-height: 1.5;
		margin: 0;
	}

	/* ============ MASSIVE CTA ============ */
	.neo-cta-section {
		padding: 60px 0 80px;
		background: #faf8f5;
	}

	.cta-box-huge {
		background: #facc15;
		border: 3px solid #0f172a;
		border-radius: 14px;
		padding: 56px 36px;
		text-align: center;
		box-shadow: 6px 6px 0px #0f172a;
	}

	.cta-mini-tag {
		font-family: "JetBrains Mono", monospace;
		font-size: 11px;
		font-weight: 900;
		background: #0f172a;
		color: #facc15;
		padding: 3px 10px;
		border-radius: 4px;
		display: inline-block;
		margin-bottom: 16px;
	}

	.cta-box-huge h2 {
		font-size: clamp(26px, 4.2vw, 44px);
		font-weight: 950;
		line-height: 1.1;
		color: #0f172a;
		margin: 0 0 14px;
	}

	.cta-box-huge p {
		font-size: 15.5px;
		color: #0f172a;
		font-weight: 600;
		max-width: 640px;
		margin: 0 auto 32px;
		line-height: 1.5;
	}

	.cta-btns-group {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 14px;
	}

	/* ============ FOOTER ============ */
	.neo-footer {
		background: #0f172a;
		color: #ffffff;
		border-top: 3px solid #0f172a;
		padding: 60px 0 28px;
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
	@media (max-width: 1024px) {
		.neo-nav-links { display: none; }
		.service-box-neo { grid-template-columns: 1fr; gap: 20px; }
		.footer-grid-neo { grid-template-columns: 1fr 1fr; }
	}

	@media (max-width: 640px) {
		.hero-huge-title { font-size: 28px; }
		.hero-actions-row, .cta-btns-group { flex-direction: column; }
		.neo-btn-lg { width: 100%; justify-content: center; }
		.footer-grid-neo { grid-template-columns: 1fr; }
		.staff-label { display: none; }
		.cta-box-huge { padding: 36px 20px; }
		.metric-box { padding: 14px; }
	}
</style>
