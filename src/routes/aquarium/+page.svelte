<script lang="ts">
	import { page } from "$app/state";
	import {
		Fish,
		Waves,
		Droplets,
		FlaskConical,
		Activity,
		CalendarDays,
		CalendarPlus,
		CalendarCheck,
		Repeat,
		ShieldCheck,
		ShieldAlert,
		AlertTriangle,
		CheckCircle2,
		Plus,
		Search,
		Filter,
		Sparkles,
		Clock,
		User,
		Phone,
		Mail,
		Layers,
		Settings2,
		SlidersHorizontal,
		ToggleLeft,
		ToggleRight,
		Play,
		Pause,
		Thermometer,
		Gauge,
		X,
		Check,
		AlertCircle,
		ArrowRight,
		FileText,
		Info,
		Calendar
	} from "@lucide/svelte";
	import { formatRupiah as money } from "$lib/util";
	import Modal from "$lib/components/Modal.svelte";
	import StatCard from "$lib/components/StatCard.svelte";
	import Badge from "$lib/components/Badge.svelte";
	import EmptyState from "$lib/components/EmptyState.svelte";
	import TankCard from "$lib/components/aquarium/TankCard.svelte";
	import { makeT } from "$lib/i18n/t";

	let { data } = $props();
	const t = $derived(makeT(page.data.locale ?? "en"));
	const form = $derived(page.form);

	// Tabs state
	type TabKey = "tanks" | "chemistry" | "plans" | "visits";
	let activeTab = $state<TabKey>("tanks");

	// Search & filter states
	let tankSearch = $state("");
	let ecosystemFilter = $state<string>("all");
	let chemistrySearch = $state("");
	let selectedTankFilter = $state<string>("all");

	// Modals open states
	let registerTankOpen = $state(false);
	let logWaterTestOpen = $state(false);
	let createPlanOpen = $state(false);

	// Preselected values for modals
	let preselectedTankId = $state<number | null>(null);
	let preselectedOwnerId = $state<number | null>(null);

	// Quick opener helpers
	function openLogTest(tankId?: number) {
		if (tankId) {
			preselectedTankId = tankId;
		} else if (data.tanks.length > 0) {
			preselectedTankId = data.tanks[0].id;
		}
		logWaterTestOpen = true;
	}

	function openCreatePlan(tankId?: number, ownerId?: number) {
		if (tankId) preselectedTankId = tankId;
		if (ownerId) preselectedOwnerId = ownerId;
		createPlanOpen = true;
	}

	// Ecosystem helpers
	function getEcosystemBadge(ecosystem: string) {
		const e = ecosystem.toLowerCase();
		if (e === "reef" || e.includes("reef") || e.includes("coral")) {
			return { label: "Reef & Coral", variant: "purple", icon: Waves, color: "#7c3aed" };
		}
		if (e === "planted" || e.includes("planted") || e.includes("aquascape")) {
			return { label: "Planted Aquascape", variant: "success", icon: Sparkles, color: "#059669" };
		}
		if (e === "marine" || e.includes("marine") || e.includes("saltwater")) {
			return { label: "Marine Saltwater", variant: "info", icon: Droplets, color: "#0284c7" };
		}
		if (e === "brackish") {
			return { label: "Brackish Water", variant: "warning", icon: Gauge, color: "#d97706" };
		}
		if (e === "cichlid") {
			return { label: "African Cichlid", variant: "neutral", icon: Fish, color: "#475569" };
		}
		if (e === "paludarium") {
			return { label: "Paludarium", variant: "success", icon: Layers, color: "#0d9488" };
		}
		return { label: "Freshwater", variant: "teal", icon: Fish, color: "#0d9488" };
	}

	function getFrequencyLabel(freq: string) {
		if (freq === "weekly") return "Weekly Visit";
		if (freq === "bi_weekly") return "Bi-Weekly (Every 2 wks)";
		if (freq === "monthly") return "Monthly Comprehensive";
		if (freq === "quarterly") return "Quarterly Overhaul";
		return freq;
	}

	// Parameter status evaluator
	function getParameterStatus(param: string, value: string | null | undefined, ecosystem: string = "freshwater") {
		if (!value || isNaN(parseFloat(value))) return { text: "—", status: "none", class: "text-muted" };
		const num = parseFloat(value);
		const isMarine = ecosystem === "reef" || ecosystem === "marine";

		if (param === "ph") {
			if (isMarine) {
				if (num >= 8.1 && num <= 8.4) return { text: `${num.toFixed(2)}`, status: "ideal", class: "param-good" };
				if (num >= 7.8 && num <= 8.6) return { text: `${num.toFixed(2)}`, status: "warning", class: "param-warn" };
				return { text: `${num.toFixed(2)}`, status: "alert", class: "param-alert" };
			} else {
				if (num >= 6.4 && num <= 7.6) return { text: `${num.toFixed(2)}`, status: "ideal", class: "param-good" };
				if (num >= 6.0 && num <= 8.2) return { text: `${num.toFixed(2)}`, status: "warning", class: "param-warn" };
				return { text: `${num.toFixed(2)}`, status: "alert", class: "param-alert" };
			}
		}

		if (param === "ammonia") {
			if (num === 0) return { text: "0.00 ppm", status: "ideal", class: "param-good" };
			if (num <= 0.25) return { text: `${num.toFixed(2)} ppm`, status: "warning", class: "param-warn" };
			return { text: `${num.toFixed(2)} ppm`, status: "alert", class: "param-alert" };
		}

		if (param === "nitrite") {
			if (num === 0) return { text: "0.00 ppm", status: "ideal", class: "param-good" };
			if (num <= 0.25) return { text: `${num.toFixed(2)} ppm`, status: "warning", class: "param-warn" };
			return { text: `${num.toFixed(2)} ppm`, status: "alert", class: "param-alert" };
		}

		if (param === "nitrate") {
			if (isMarine) {
				if (num <= 10) return { text: `${num} ppm`, status: "ideal", class: "param-good" };
				if (num <= 25) return { text: `${num} ppm`, status: "warning", class: "param-warn" };
				return { text: `${num} ppm`, status: "alert", class: "param-alert" };
			} else {
				if (num <= 20) return { text: `${num} ppm`, status: "ideal", class: "param-good" };
				if (num <= 40) return { text: `${num} ppm`, status: "warning", class: "param-warn" };
				return { text: `${num} ppm`, status: "alert", class: "param-alert" };
			}
		}

		if (param === "salinity") {
			if (num >= 1.023 && num <= 1.026) return { text: `${num} SG`, status: "ideal", class: "param-good" };
			if (num >= 30 && num <= 35) return { text: `${num} ppt`, status: "ideal", class: "param-good" };
			return { text: `${num}`, status: "info", class: "param-info" };
		}

		if (param === "temp") {
			if (num >= 24.0 && num <= 27.5) return { text: `${num}°C`, status: "ideal", class: "param-good" };
			if (num >= 22.0 && num <= 29.0) return { text: `${num}°C`, status: "warning", class: "param-warn" };
			return { text: `${num}°C`, status: "alert", class: "param-alert" };
		}

		if (param === "kh") {
			return { text: `${num} dKH`, status: "info", class: "param-info" };
		}

		return { text: String(value), status: "info", class: "param-info" };
	}

	function formatDate(d: Date | string | null | undefined, includeTime = false) {
		if (!d) return "—";
		const dateObj = typeof d === "string" ? new Date(d) : d;
		if (isNaN(dateObj.getTime())) return "—";
		return dateObj.toLocaleDateString("id-ID", {
			day: "numeric",
			month: "short",
			year: "numeric",
			...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {})
		});
	}

	// Filtered lists
	const filteredTanks = $derived(
		data.tanks.filter((t) => {
			const matchesEco = ecosystemFilter === "all" || t.ecosystem.toLowerCase() === ecosystemFilter.toLowerCase();
			const q = tankSearch.toLowerCase().trim();
			const matchesSearch =
				!q ||
				t.name.toLowerCase().includes(q) ||
				t.ownerFirstName.toLowerCase().includes(q) ||
				t.ownerLastName.toLowerCase().includes(q) ||
				(t.ownerPhone && t.ownerPhone.includes(q)) ||
				(t.filtrationType && t.filtrationType.toLowerCase().includes(q));
			return matchesEco && matchesSearch;
		})
	);

	const filteredWaterLogs = $derived(
		data.waterLogs.filter((log) => {
			const matchesTank = selectedTankFilter === "all" || String(log.tankId) === selectedTankFilter;
			const q = chemistrySearch.toLowerCase().trim();
			const matchesSearch =
				!q ||
				log.tankName.toLowerCase().includes(q) ||
				log.ownerFirstName.toLowerCase().includes(q) ||
				log.ownerLastName.toLowerCase().includes(q) ||
				(log.staffName && log.staffName.toLowerCase().includes(q)) ||
				(log.notes && log.notes.toLowerCase().includes(q));
			return matchesTank && matchesSearch;
		})
	);

	// Find owner for active form pre-fill
	const selectedOwnerTanks = $derived(
		preselectedOwnerId
			? data.tanks.filter((t) => t.ownerId === preselectedOwnerId)
			: data.tanks
	);
</script>

<svelte:head>
	<title>{t['aq.title']()} · PetCo</title>
</svelte:head>

<div class="aquarium-page">
	<!-- Flash Feedback Messages -->
	{#if form?.error}
		<div class="alert alert-danger mb" style="animation: slideDown 200ms ease;">
			<AlertCircle size={18} />
			<span>{form.error}</span>
		</div>
	{:else if form?.success}
		<div class="alert alert-success mb" style="animation: slideDown 200ms ease;">
			<CheckCircle2 size={18} />
			<span>Action completed successfully! Database updated.</span>
		</div>
	{/if}

	<!-- Header with Kicker, Title, and Primary Actions -->
	<header class="page-header spread mb">
		<div>
			<div class="kicker">
				<Waves size={13} class="kicker-icon" />
				<span>{t['aq.kicker']()}</span>
			</div>
			<h1 class="page-title">{t['aq.title']()}</h1>
			<p class="subtle" style="margin-top: 4px; max-width: 650px;">
				{t['aq.subtitle']()}
			</p>
		</div>

		<div class="row gap-2 header-actions">
			<button class="btn btn-subtle" onclick={() => openLogTest()}>
				<FlaskConical size={15} />
				<span>{t['aq.logWaterTest']()}</span>
			</button>
			<button class="btn btn-subtle" onclick={() => { preselectedTankId = null; preselectedOwnerId = null; createPlanOpen = true; }}>
				<CalendarPlus size={15} />
				<span>{t['aq.newServicePlan']()}</span>
			</button>
			<button class="btn btn-primary" onclick={() => { registerTankOpen = true; }}>
				<Plus size={15} />
				<span>{t['aq.registerTank']()}</span>
			</button>
		</div>
	</header>

	<!-- Metrics Strip -->
	<div class="stat-grid mb">
		<StatCard
			title="Total Managed Tanks"
			value={data.metrics.totalTanks}
			icon={Fish}
			tint="blue"
			subtitle="Active residential & commercial setups"
		/>
		<StatCard
			title="Healthy Water Parameters"
			value={`${data.metrics.healthyLogsCount} / ${data.metrics.totalLogsCount}`}
			icon={Activity}
			tint="green"
			trend={data.metrics.totalLogsCount > 0 ? `${Math.round((data.metrics.healthyLogsCount / data.metrics.totalLogsCount) * 100)}% Safe` : "100%"}
			trendUp={true}
			subtitle="Ammonia, Nitrite & pH within target range"
		/>
		<StatCard
			title="Active Service Contracts"
			value={data.metrics.activeContractsCount}
			icon={Repeat}
			tint="purple"
			subtitle="Weekly, Bi-weekly & Monthly routines"
		/>
		<StatCard
			title="Upcoming Specialist Visits"
			value={data.metrics.upcomingVisitsCount}
			icon={CalendarCheck}
			tint="amber"
			subtitle="Scheduled on-site visits & maintenance"
		/>
	</div>

	<!-- Navigation Tabs -->
	<div class="tabs-bar spread mb">
		<div class="segmented">
			<button
				class={activeTab === "tanks" ? "active" : ""}
				onclick={() => (activeTab = "tanks")}
				type="button"
			>
				<Fish size={14} />
				<span>Managed Tanks ({data.tanks.length})</span>
			</button>
			<button
				class={activeTab === "chemistry" ? "active" : ""}
				onclick={() => (activeTab = "chemistry")}
				type="button"
			>
				<FlaskConical size={14} />
				<span>Water Chemistry Logs ({data.waterLogs.length})</span>
			</button>
			<button
				class={activeTab === "plans" ? "active" : ""}
				onclick={() => (activeTab = "plans")}
				type="button"
			>
				<Repeat size={14} />
				<span>Maintenance Plans ({data.servicePlans.length})</span>
			</button>
			<button
				class={activeTab === "visits" ? "active" : ""}
				onclick={() => (activeTab = "visits")}
				type="button"
			>
				<Clock size={14} />
				<span>Specialist Visits ({data.upcomingVisits.length})</span>
			</button>
		</div>
	</div>

	<!-- ==================== TAB 1: MANAGED TANKS DIRECTORY ==================== -->
	{#if activeTab === "tanks"}
		<div class="tab-content stack gap-4">
			<!-- Filter and Search Toolbar -->
			<div class="card pad toolbar-card">
				<div class="spread wrap gap-3">
					<div class="search-input-wrap">
						<Search size={16} class="search-icon" />
						<input
							type="text"
							placeholder="Search by tank name, client, phone, or filter specs..."
							bind:value={tankSearch}
							class="search-input"
						/>
						{#if tankSearch}
							<button class="search-clear" onclick={() => (tankSearch = "")} aria-label="Clear search">
								<X size={14} />
							</button>
						{/if}
					</div>

					<div class="row gap-2 wrap">
						<div class="filter-label">
							<Filter size={13} />
							<span>Ecosystem:</span>
						</div>
						<div class="segmented segmented-sm">
							<button
								class={ecosystemFilter === "all" ? "active" : ""}
								onclick={() => (ecosystemFilter = "all")}
							>
								All ({data.tanks.length})
							</button>
							<button
								class={ecosystemFilter === "reef" ? "active" : ""}
								onclick={() => (ecosystemFilter = "reef")}
							>
								Reef / Coral
							</button>
							<button
								class={ecosystemFilter === "planted" ? "active" : ""}
								onclick={() => (ecosystemFilter = "planted")}
							>
								Planted
							</button>
							<button
								class={ecosystemFilter === "marine" ? "active" : ""}
								onclick={() => (ecosystemFilter = "marine")}
							>
								Marine
							</button>
							<button
								class={ecosystemFilter === "freshwater" ? "active" : ""}
								onclick={() => (ecosystemFilter = "freshwater")}
							>
								Freshwater
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Tanks Grid -->
			{#if filteredTanks.length === 0}
				<div class="card pad">
					<EmptyState
						title="No aquarium tanks found"
						description={tankSearch || ecosystemFilter !== "all"
							? "No customer tanks matched your search and filter criteria."
							: "No customer tanks registered yet. Add the first custom setup to begin telemetry tracking."}
						icon={Fish}
					>
						<button class="btn btn-primary btn-sm" onclick={() => (registerTankOpen = true)}>
							<Plus size={14} /> <span>Register First Tank</span>
						</button>
					</EmptyState>
				</div>
			{:else}
				<div class="tanks-grid">
					{#each filteredTanks as tank}
						<TankCard {tank} onLogTest={(id) => openLogTest(id)} onCreatePlan={(id, ownerId) => openCreatePlan(id, ownerId)} />
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- ==================== TAB 2: WATER CHEMISTRY & TEST LOGS ==================== -->
	{#if activeTab === "chemistry"}
		<div class="tab-content stack gap-4">
			<!-- Toolbar & Quick Info -->
			<div class="card pad toolbar-card">
				<div class="spread wrap gap-3">
					<div class="search-input-wrap">
						<Search size={16} class="search-icon" />
						<input
							type="text"
							placeholder="Search by tank, client, specialist, notes..."
							bind:value={chemistrySearch}
							class="search-input"
						/>
						{#if chemistrySearch}
							<button class="search-clear" onclick={() => (chemistrySearch = "")} aria-label="Clear search">
								<X size={14} />
							</button>
						{/if}
					</div>

					<div class="row gap-2 align-center wrap">
						<div class="field mb-0" style="min-width: 220px;">
							<select bind:value={selectedTankFilter} class="form-select-sm">
								<option value="all">All Managed Tanks</option>
								{#each data.tanks as tank}
									<option value={String(tank.id)}>{tank.name} ({tank.ownerFirstName} {tank.ownerLastName})</option>
								{/each}
							</select>
						</div>

						<button class="btn btn-primary btn-sm" onclick={() => openLogTest()}>
							<FlaskConical size={14} />
							<span>Record New Test</span>
						</button>
					</div>
				</div>

				<!-- Target Chemistry Reference Pill Banner -->
				<div class="reference-banner row gap-3 wrap">
					<span class="ref-title"><Sparkles size={12} /> Target Guidelines:</span>
					<span class="ref-item"><strong>Ammonia:</strong> 0.00 ppm</span>
					<span class="ref-item"><strong>Nitrite:</strong> 0.00 ppm</span>
					<span class="ref-item"><strong>Nitrate:</strong> &lt; 20 ppm (Fresh) / &lt; 10 ppm (Reef)</span>
					<span class="ref-item"><strong>pH:</strong> 6.5–7.5 (Fresh) / 8.1–8.4 (Marine/Reef)</span>
					<span class="ref-item"><strong>Salinity:</strong> 1.025 SG (35 ppt)</span>
					<span class="ref-item"><strong>Temp:</strong> 24–26°C</span>
				</div>
			</div>

			<!-- Logs Table -->
			{#if filteredWaterLogs.length === 0}
				<div class="card pad">
					<EmptyState
						title="No chemistry logs found"
						description={chemistrySearch || selectedTankFilter !== "all"
							? "No water parameter logs match your active filter."
							: "No test records found. Test logs maintain water stability and livestock health."}
						icon={FlaskConical}
					>
						<button class="btn btn-primary btn-sm" onclick={() => openLogTest()}>
							<FlaskConical size={14} /> <span>Record First Water Test</span>
						</button>
					</EmptyState>
				</div>
			{:else}
				<div class="table-wrap card">
					<table class="data-table">
						<thead>
							<tr>
								<th>Date &amp; Time</th>
								<th>Tank &amp; Ecosystem</th>
								<th>Client</th>
								<th>pH</th>
								<th>Ammonia (NH₃)</th>
								<th>Nitrite (NO₂)</th>
								<th>Nitrate (NO₃)</th>
								<th>Salinity</th>
								<th>Temp</th>
								<th>KH (dKH)</th>
								<th>Specialist</th>
								<th>Observations / Notes</th>
							</tr>
						</thead>
						<tbody>
							{#each filteredWaterLogs as log}
								{@const eco = getEcosystemBadge(log.tankEcosystem)}
								{@const phStatus = getParameterStatus("ph", log.ph, log.tankEcosystem)}
								{@const ammStatus = getParameterStatus("ammonia", log.ammoniaPpm, log.tankEcosystem)}
								{@const nitStatus = getParameterStatus("nitrite", log.nitritePpm, log.tankEcosystem)}
								{@const ntrStatus = getParameterStatus("nitrate", log.nitratePpm, log.tankEcosystem)}
								{@const tempStatus = getParameterStatus("temp", log.temperatureC, log.tankEcosystem)}
								{@const salStatus = getParameterStatus("salinity", log.salinityPpt, log.tankEcosystem)}
								<tr>
									<td class="cell-nowrap">
										<div class="stack-xs">
											<span class="bold font-mono">{formatDate(log.recordedAt)}</span>
											<span class="faint tiny">
												{new Date(log.recordedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
											</span>
										</div>
									</td>
									<td>
										<div class="stack-xs">
											<span class="bold">{log.tankName}</span>
											<span class="badge badge-{eco.variant} eco-badge-sm">
												{eco.label}
											</span>
										</div>
									</td>
									<td>
										<span class="cell-text">{log.ownerFirstName} {log.ownerLastName}</span>
									</td>
									<td>
										<span class="param-badge {phStatus.class}">{phStatus.text}</span>
									</td>
									<td>
										<span class="param-badge {ammStatus.class}">{ammStatus.text}</span>
									</td>
									<td>
										<span class="param-badge {nitStatus.class}">{nitStatus.text}</span>
									</td>
									<td>
										<span class="param-badge {ntrStatus.class}">{ntrStatus.text}</span>
									</td>
									<td>
										{#if log.salinityPpt}
											<span class="param-badge {salStatus.class}">{salStatus.text}</span>
										{:else}
											<span class="faint">—</span>
										{/if}
									</td>
									<td>
										{#if log.temperatureC}
											<span class="param-badge {tempStatus.class}">{tempStatus.text}</span>
										{:else}
											<span class="faint">—</span>
										{/if}
									</td>
									<td>
										{#if log.khDkh}
											<span class="param-badge param-info">{log.khDkh} dKH</span>
										{:else}
											<span class="faint">—</span>
										{/if}
									</td>
									<td>
										{#if log.staffName}
											<div class="row gap-1 align-center">
												<User size={12} class="faint" />
												<span class="cell-text">{log.staffName}</span>
											</div>
										{:else}
											<span class="faint">Team</span>
										{/if}
									</td>
									<td class="notes-cell">
										{#if log.notes}
											<span class="log-notes-text" title={log.notes}>{log.notes}</span>
										{:else}
											<span class="faint">—</span>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}

	<!-- ==================== TAB 3: RECURRING MAINTENANCE PLANS ==================== -->
	{#if activeTab === "plans"}
		<div class="tab-content stack gap-4">
			<div class="spread align-center">
				<div>
					<h2>Active Service Contracts &amp; Care Subscriptions</h2>
					<p class="subtle tiny" style="margin-top: 2px;">
						Scheduled high-touch maintenance protocols ensuring balanced parameters and pristine aquascapes.
					</p>
				</div>
				<button
					class="btn btn-primary btn-sm"
					onclick={() => { preselectedTankId = null; preselectedOwnerId = null; createPlanOpen = true; }}
				>
					<CalendarPlus size={14} />
					<span>New Maintenance Plan</span>
				</button>
			</div>

			{#if data.servicePlans.length === 0}
				<div class="card pad">
					<EmptyState
						title="No active service contracts"
						description="Create recurring maintenance agreements to generate predictable revenue and keep customer aquariums immaculate."
						icon={Repeat}
					>
						<button class="btn btn-primary btn-sm" onclick={() => (createPlanOpen = true)}>
							<CalendarPlus size={14} /> <span>Create First Plan</span>
						</button>
					</EmptyState>
				</div>
			{:else}
				<div class="plans-list stack gap-3">
					{#each data.servicePlans as plan}
						{@const eco = getEcosystemBadge(plan.tankEcosystem)}
						<div class="card plan-card pad {plan.active ? 'plan-active' : 'plan-paused'}">
							<div class="spread align-start wrap gap-3">
								<!-- Plan Info -->
								<div class="stack-xs" style="max-width: 500px;">
									<div class="row gap-2 align-center">
										<h3 class="plan-heading">{plan.planName}</h3>
										<span class="badge {plan.active ? 'badge-success' : 'badge-neutral'}">
											{plan.active ? "Active Contract" : "Paused"}
										</span>
										<span class="badge badge-purple">
											{getFrequencyLabel(plan.frequency)}
										</span>
									</div>

									<div class="row gap-3 wrap plan-meta-row">
										<div class="row gap-1 align-center">
											<Fish size={13} class="faint" />
											<span class="bold">{plan.tankName}</span>
											<span class="badge badge-{eco.variant} eco-badge-sm">{eco.label}</span>
										</div>
										<span class="divider">·</span>
										<div class="row gap-1 align-center">
											<User size={13} class="faint" />
											<span>{plan.ownerFirstName} {plan.ownerLastName}</span>
										</div>
										{#if plan.ownerPhone}
											<span class="divider">·</span>
											<div class="row gap-1 align-center">
												<Phone size={13} class="faint" />
												<span>{plan.ownerPhone}</span>
											</div>
										{/if}
									</div>

									{#if plan.notes}
										<div class="plan-scope-box">
											<span class="scope-tag">Scope of Work:</span> {plan.notes}
										</div>
									{/if}
								</div>

								<!-- Plan Pricing, Schedule & Toggle Action -->
								<div class="stack align-end plan-pricing-box">
									<div class="plan-price-tag">
										<span class="price-val">{money(plan.pricePerVisitCents)}</span>
										<span class="price-sub">/ on-site visit</span>
									</div>

									{#if plan.nextScheduledDate}
										<div class="next-visit-row">
											<Calendar size={13} class="primary" />
											<span>Next Visit: <strong>{formatDate(plan.nextScheduledDate)}</strong></span>
										</div>
									{/if}

									<form method="POST" action="?/toggleServicePlan" style="margin-top: 8px;">
										<input type="hidden" name="planId" value={plan.id} />
										<button
											class="btn btn-sm {plan.active ? 'btn-ghost' : 'btn-subtle'}"
											type="submit"
										>
											{#if plan.active}
												<Pause size={13} />
												<span>Pause Contract</span>
											{:else}
												<Play size={13} />
												<span>Resume Contract</span>
											{/if}
										</button>
									</form>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- ==================== TAB 4: FIELD VISITS SCHEDULE ==================== -->
	{#if activeTab === "visits"}
		<div class="tab-content stack gap-4">
			<div class="spread align-center">
				<div>
					<h2>Upcoming Specialist Field Visits</h2>
					<p class="subtle tiny" style="margin-top: 2px;">
						On-site bookings for aquarium setup, aquascaping, water parameter overhaul, and regular cleaning.
					</p>
				</div>
				<a href="/bookings/new" class="btn btn-primary btn-sm">
					<Plus size={14} />
					<span>Book Specialist Visit</span>
				</a>
			</div>

			{#if data.upcomingVisits.length === 0}
				<div class="card pad">
					<EmptyState
						title="No specialist visits scheduled"
						description="No upcoming aquarium bookings found. Book a consultation or maintenance session for a client."
						icon={CalendarDays}
					>
						<a href="/bookings/new" class="btn btn-primary btn-sm">
							<Plus size={14} /> <span>Create Booking</span>
						</a>
					</EmptyState>
				</div>
			{:else}
				<div class="table-wrap card">
					<table class="data-table">
						<thead>
							<tr>
								<th>Date &amp; Time</th>
								<th>Service Name</th>
								<th>Client &amp; Contact</th>
								<th>Assigned Specialist</th>
								<th>Status</th>
								<th>Fee</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each data.upcomingVisits as visit}
								<tr>
									<td>
										<div class="stack-xs">
											<span class="bold">{formatDate(visit.startsAt)}</span>
											<span class="faint tiny">
												{new Date(visit.startsAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
												–
												{new Date(visit.endsAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
											</span>
										</div>
									</td>
									<td>
										<span class="bold">{visit.serviceName ?? "Aquarium Specialist Service"}</span>
									</td>
									<td>
										<div class="stack-xs">
											<span>{visit.ownerFirstName} {visit.ownerLastName}</span>
											{#if visit.ownerPhone}
												<span class="faint tiny">{visit.ownerPhone}</span>
											{/if}
										</div>
									</td>
									<td>
										{#if visit.staffName}
											<div class="row gap-1 align-center">
												<User size={13} class="primary" />
												<span>{visit.staffName}</span>
											</div>
										{:else}
											<span class="faint">Unassigned</span>
										{/if}
									</td>
									<td>
										<Badge variant={visit.status} label={visit.status.replace("_", " ")} />
									</td>
									<td>
										<span class="bold font-mono">{money(visit.priceCents)}</span>
									</td>
									<td>
										<a href="/bookings/{visit.id}" class="btn btn-xs btn-ghost">
											<span>View</span>
											<ArrowRight size={12} />
										</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}
</div>

<!-- ==================== MODAL 1: REGISTER AQUARIUM TANK ==================== -->
<Modal bind:open={registerTankOpen} title="Register Customer Aquarium Tank" subtitle="Track custom aquascapes, reef biotopes, and equipment profiles.">
	<form method="POST" action="?/addTank" class="stack gap-3">
		<div class="field">
			<label for="tankOwnerId">Customer / Tank Owner <span class="req">*</span></label>
			<select id="tankOwnerId" name="ownerId" required>
				<option value="">Select customer profile...</option>
				{#each data.owners as o}
					<option value={o.id}>{o.firstName} {o.lastName} {o.phone ? `(${o.phone})` : ''}</option>
				{/each}
			</select>
		</div>

		<div class="grid cols-2">
			<div class="field">
				<label for="tankName">Tank Name / Location <span class="req">*</span></label>
				<input id="tankName" name="name" required placeholder="e.g. Living Room Rimless Reef 300L" />
			</div>

			<div class="field">
				<label for="tankVolume">Water Volume (Liters)</label>
				<input id="tankVolume" name="volumeLiters" type="number" min="1" placeholder="e.g. 250" />
			</div>
		</div>

		<div class="grid cols-2">
			<div class="field">
				<label for="tankEcosystem">Ecosystem Biotope <span class="req">*</span></label>
				<select id="tankEcosystem" name="ecosystem" required>
					<option value="freshwater">Freshwater Community</option>
					<option value="planted">Planted Aquascape (High-Tech / Low-Tech)</option>
					<option value="reef">Reef &amp; Coral Marine System</option>
					<option value="marine">Marine Fish-Only (FOWLR)</option>
					<option value="cichlid">African / Lake Malawi Cichlids</option>
					<option value="brackish">Brackish Water Biotope</option>
					<option value="paludarium">Paludarium / Riparium</option>
				</select>
			</div>

			<div class="field">
				<label for="tankDimensions">Dimensions (L × W × H)</label>
				<input id="tankDimensions" name="dimensions" placeholder="e.g. 120 × 50 × 60 cm" />
			</div>
		</div>

		<div class="grid cols-2">
			<div class="field">
				<label for="filtrationType">Filtration System</label>
				<input id="filtrationType" name="filtrationType" placeholder="e.g. Fluval FX6 Canister + Sump 100L" />
			</div>

			<div class="field">
				<label for="lightingType">Lighting Fixture</label>
				<input id="lightingType" name="lightingType" placeholder="e.g. 2x Chihiros WRGB II 60cm Pro" />
			</div>
		</div>

		<div class="field">
			<label for="tankNotes">Livestock, Flora &amp; Special Requirements</label>
			<textarea
				id="tankNotes"
				name="notes"
				rows="3"
				placeholder="e.g. High-tech CO2 injection with pH controller. SPS/LPS corals, Discus pair, sensitive Cardinal tetras."
			></textarea>
		</div>

		<div class="modal-footer row gap-2 justify-end" style="margin-top: 12px;">
			<button class="btn btn-ghost" type="button" onclick={() => (registerTankOpen = false)}>
				Cancel
			</button>
			<button class="btn btn-primary" type="submit">
				<Plus size={15} />
				<span>Register Tank Profile</span>
			</button>
		</div>
	</form>
</Modal>

<!-- ==================== MODAL 2: LOG WATER CHEMISTRY TEST ==================== -->
<Modal bind:open={logWaterTestOpen} title="Log Water Chemistry Telemetry" subtitle="Record water parameter test results and specialist observations.">
	<form method="POST" action="?/logWaterTest" class="stack gap-3">
		<div class="grid cols-2">
			<div class="field">
				<label for="testTankId">Target Tank <span class="req">*</span></label>
				<select id="testTankId" name="tankId" required bind:value={preselectedTankId}>
					<option value="">Select aquarium tank...</option>
					{#each data.tanks as tank}
						<option value={tank.id}>
							{tank.name} ({tank.ownerFirstName} {tank.ownerLastName} — {tank.ecosystem})
						</option>
					{/each}
				</select>
			</div>

			<div class="field">
				<label for="testStaffId">Testing Specialist / Staff</label>
				<select id="testStaffId" name="staffId">
					<option value="">Select specialist...</option>
					{#each data.staff as st}
						<option value={st.id}>{st.name} ({st.role})</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="field">
			<label for="testRecordedAt">Date &amp; Time of Test</label>
			<input id="testRecordedAt" name="recordedAt" type="datetime-local" />
		</div>

		<div class="chemistry-input-card card pad-sm">
			<div class="card-head-sm row gap-1 align-center mb-2">
				<FlaskConical size={14} class="primary" />
				<span class="bold small">Chemical Telemetry Parameters</span>
			</div>

			<div class="grid cols-3 gap-2">
				<div class="field">
					<label for="paramPh">pH Level</label>
					<input id="paramPh" name="ph" type="number" step="0.01" min="4" max="10" placeholder="e.g. 7.4" />
				</div>

				<div class="field">
					<label for="paramAmm">Ammonia (NH₃ ppm)</label>
					<input id="paramAmm" name="ammoniaPpm" type="number" step="0.01" min="0" placeholder="e.g. 0.00" />
				</div>

				<div class="field">
					<label for="paramNitrite">Nitrite (NO₂ ppm)</label>
					<input id="paramNitrite" name="nitritePpm" type="number" step="0.01" min="0" placeholder="e.g. 0.00" />
				</div>
			</div>

			<div class="grid cols-4 gap-2">
				<div class="field">
					<label for="paramNitrate">Nitrate (NO₃ ppm)</label>
					<input id="paramNitrate" name="nitratePpm" type="number" step="0.1" min="0" placeholder="e.g. 15.0" />
				</div>

				<div class="field">
					<label for="paramSalinity">Salinity (ppt / SG)</label>
					<input id="paramSalinity" name="salinityPpt" type="number" step="0.001" placeholder="e.g. 1.025 or 35" />
				</div>

				<div class="field">
					<label for="paramTemp">Temp (°C)</label>
					<input id="paramTemp" name="temperatureC" type="number" step="0.1" placeholder="e.g. 25.5" />
				</div>

				<div class="field">
					<label for="paramKh">KH (dKH)</label>
					<input id="paramKh" name="khDkh" type="number" step="0.1" placeholder="e.g. 8.5" />
				</div>
			</div>
		</div>

		<div class="field">
			<label for="testNotes">Specialist Observations &amp; Actions Taken</label>
			<textarea
				id="testNotes"
				name="notes"
				rows="3"
				placeholder="e.g. 25% RO water change performed. Dosed micro-nutrients &amp; potassium. Cleaned canister pre-filter sponge."
			></textarea>
		</div>

		<div class="modal-footer row gap-2 justify-end" style="margin-top: 12px;">
			<button class="btn btn-ghost" type="button" onclick={() => (logWaterTestOpen = false)}>
				Cancel
			</button>
			<button class="btn btn-primary" type="submit">
				<FlaskConical size={15} />
				<span>Save Water Test Log</span>
			</button>
		</div>
	</form>
</Modal>

<!-- ==================== MODAL 3: CREATE RECURRING SERVICE PLAN ==================== -->
<Modal bind:open={createPlanOpen} title="Create Aquarium Maintenance Plan" subtitle="Set up recurring on-site care contracts and scheduled visits.">
	<form method="POST" action="?/createServicePlan" class="stack gap-3">
		<div class="grid cols-2">
			<div class="field">
				<label for="planOwnerId">Customer <span class="req">*</span></label>
				<select
					id="planOwnerId"
					name="ownerId"
					required
					bind:value={preselectedOwnerId}
				>
					<option value="">Select customer profile...</option>
					{#each data.owners as o}
						<option value={o.id}>{o.firstName} {o.lastName} {o.phone ? `(${o.phone})` : ''}</option>
					{/each}
				</select>
			</div>

			<div class="field">
				<label for="planTankId">Target Tank <span class="req">*</span></label>
				<select id="planTankId" name="tankId" required bind:value={preselectedTankId}>
					<option value="">Select target tank...</option>
					{#each selectedOwnerTanks as t}
						<option value={t.id}>{t.name} ({t.volumeLiters ? `${t.volumeLiters}L` : t.ecosystem})</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="grid cols-2">
			<div class="field">
				<label for="planName">Plan Title <span class="req">*</span></label>
				<input
					id="planName"
					name="planName"
					required
					placeholder="e.g. Bi-Weekly High-Tech Scape Care &amp; Water Balance"
				/>
			</div>

			<div class="field">
				<label for="planFrequency">Maintenance Frequency <span class="req">*</span></label>
				<select id="planFrequency" name="frequency" required>
					<option value="weekly">Weekly Routine Visit</option>
					<option value="bi_weekly">Bi-Weekly (Every 2 Weeks)</option>
					<option value="monthly" selected>Monthly Comprehensive Care</option>
					<option value="quarterly">Quarterly System Overhaul</option>
				</select>
			</div>
		</div>

		<div class="grid cols-2">
			<div class="field">
				<label for="planPrice">Price per Visit (IDR) <span class="req">*</span></label>
				<input
					id="planPrice"
					name="pricePerVisitCents"
					type="number"
					min="10000"
					step="5000"
					required
					placeholder="e.g. 350000"
				/>
			</div>

			<div class="field">
				<label for="planNextDate">First Scheduled Visit Date</label>
				<input id="planNextDate" name="nextScheduledDate" type="date" />
			</div>
		</div>

		<div class="field">
			<label for="planNotes">Scope of Routine Maintenance &amp; Tasks</label>
			<textarea
				id="planNotes"
				name="notes"
				rows="3"
				placeholder="e.g. 30% RO/DI water change, glass polishing, plant pruning, CO2 tank refill check, filter media rinse."
			></textarea>
		</div>

		<div class="modal-footer row gap-2 justify-end" style="margin-top: 12px;">
			<button class="btn btn-ghost" type="button" onclick={() => (createPlanOpen = false)}>
				Cancel
			</button>
			<button class="btn btn-primary" type="submit">
				<Repeat size={15} />
				<span>Activate Service Contract</span>
			</button>
		</div>
	</form>
</Modal>

<style>
	.aquarium-page {
		display: flex;
		flex-direction: column;
		gap: var(--sp-4);
	}

	.kicker {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--teal);
		margin-bottom: 4px;
	}

	.page-title {
		font-size: 26px;
		font-weight: 800;
		color: var(--ink);
		letter-spacing: -0.02em;
		margin: 0;
	}

	.header-actions {
		flex-shrink: 0;
	}

	/* Toolbar & Search */
	.toolbar-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-lg);
	}

	.search-input-wrap {
		position: relative;
		display: flex;
		align-items: center;
		flex: 1;
		min-width: 280px;
	}

	.search-icon {
		position: absolute;
		left: 12px;
		color: var(--muted);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: 8px 32px 8px 36px;
		border: 1px solid var(--border);
		border-radius: var(--r-md);
		font-size: 13.5px;
		background: var(--surface-2);
		transition: all 150ms ease;
	}

	.search-input:focus {
		background: var(--surface);
		border-color: var(--border-focus);
		outline: none;
		box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
	}

	.btn-clear {
		position: absolute;
		right: 8px;
		background: transparent;
		border: none;
		color: var(--muted);
		cursor: pointer;
		padding: 4px;
		display: grid;
		place-items: center;
		border-radius: var(--r-xs);
	}

	.filter-label {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 12px;
		font-weight: 600;
		color: var(--muted);
	}

	.segmented-sm button {
		padding: 4px 10px;
		font-size: 12px;
	}

	.form-select-sm {
		padding: 6px 10px;
		font-size: 13px;
		border: 1px solid var(--border);
		border-radius: var(--r-md);
		background: var(--surface);
		color: var(--ink);
	}

	/* Tanks Grid */
	.tanks-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
		gap: var(--sp-4);
	}

/* Reference Banner */
	.reference-banner {
		padding: 8px 12px;
		background: #f8fafc;
		border: 1px solid var(--border-subtle);
		border-radius: var(--r-md);
		font-size: 11.5px;
		color: var(--muted);
		align-items: center;
	}

	.ref-title {
		font-weight: 700;
		color: var(--ink-2);
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	.ref-item strong {
		color: var(--ink-2);
	}

	/* Chemistry Table */
	.param-badge {
		display: inline-block;
		padding: 2px 7px;
		border-radius: var(--r-xs);
		font-size: 12px;
		font-weight: 700;
		font-family: var(--font-mono);
	}

	.notes-cell {
		max-width: 260px;
	}

	.log-notes-text {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		font-size: 12px;
		color: var(--ink-2);
		line-height: 1.35;
	}

	/* Service Plans */
	.plan-card {
		border-left: 4px solid var(--primary);
		transition: all 140ms ease;
	}

	.plan-card.plan-paused {
		border-left-color: var(--faint);
		opacity: 0.8;
	}

	.plan-heading {
		font-size: 16px;
		font-weight: 700;
		color: var(--ink);
		margin: 0;
	}

	.plan-meta-row {
		font-size: 13px;
		color: var(--ink-2);
	}

	.plan-scope-box {
		margin-top: 8px;
		padding: 8px 12px;
		background: var(--surface-2);
		border-radius: var(--r-md);
		font-size: 12.5px;
		color: var(--ink-3);
		line-height: 1.4;
	}

	.scope-tag {
		font-weight: 700;
		color: var(--ink-2);
	}

	.plan-pricing-box {
		min-width: 180px;
	}

	.plan-price-tag {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.price-val {
		font-size: 20px;
		font-weight: 800;
		color: var(--primary);
		line-height: 1.1;
		font-family: var(--font-sans);
	}

	.price-sub {
		font-size: 11px;
		font-weight: 600;
		color: var(--muted);
	}

	.next-visit-row {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 12px;
		color: var(--ink-2);
		margin-top: 4px;
	}

	/* Modal Styling */
	.chemistry-input-card {
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--r-md);
	}

	.card-head-sm {
		color: var(--ink-2);
	}

	@media (max-width: 768px) {
		.tanks-grid {
			grid-template-columns: 1fr;
		}

		.page-header {
			flex-direction: column;
			align-items: stretch;
			gap: 12px;
		}

		.header-actions {
			display: flex;
			flex-wrap: wrap;
		}
	}
</style>
