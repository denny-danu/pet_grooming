<script lang="ts">
	import {
		Users,
		PawPrint,
		CalendarDays,
		LogIn,
		Wallet,
		TrendingUp,
		Plus,
		ArrowRight,
		Scissors,
		Hotel,
		Fish,
		Clock,
		Sparkles,
		ShieldCheck,
		CheckCircle2,
		AlertCircle,
		ChevronRight,
		UserPlus,
		CalendarPlus,
		BellRing,
		ExternalLink,
		Check
	} from "@lucide/svelte";
	import { formatRupiah as money } from "$lib/util";

	let { data } = $props();

	const fmtWhen = (d: Date | string) =>
		new Date(d).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	const fmtTime = (d: Date | string) =>
		new Date(d).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
	const fmtDay = (d: Date | string) =>
		new Date(d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
	const todayDateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

	function getKindIcon(kind: string) {
		if (kind === 'hotel') return Hotel;
		if (kind === 'aquarium') return Fish;
		return Scissors;
	}

	function getSpeciesEmoji(species: string | null | undefined) {
		if (species === 'cat') return '🐱';
		if (species === 'bird') return '🦜';
		if (species === 'fish') return '🐠';
		if (species === 'reptile') return '🦎';
		return '🐶';
	}
</script>

<svelte:head>
	<title>Dashboard · PetCo</title>
</svelte:head>

<div class="page-header">
	<div class="title-block">
		<div class="kicker"><Sparkles size={13} /> Command Center</div>
		<h1>Good day, {data.user.name}</h1>
		<p class="subtitle">{todayDateLabel} · Main Branch</p>
	</div>
	<div class="actions">
		<a href="/customers/new" class="btn">
			<UserPlus size={15} />
			<span>New Customer</span>
		</a>
		<a href="/bookings/new" class="btn btn-primary">
			<Plus size={15} />
			<span>New Booking</span>
		</a>
	</div>
</div>

<!-- Stat Cards Row -->
<div class="stat-grid">
	<div class="stat-card">
		<div class="stat-top">
			<div class="stat-icon purple">
				<CalendarDays size={18} />
			</div>
			{#if data.checkinsDue > 0}
				<span class="stat-trend up">{data.checkinsDue} due in</span>
			{:else}
				<span class="stat-trend neutral">All clear</span>
			{/if}
		</div>
		<div class="stat-value">{data.todayBookings.length}</div>
		<div class="stat-label">Today's Appointments</div>
	</div>

	<div class="stat-card">
		<div class="stat-top">
			<div class="stat-icon green">
				<Wallet size={18} />
			</div>
			<span class="stat-trend up">Live</span>
		</div>
		<div class="stat-value">{money(data.todayRevenueCents)}</div>
		<div class="stat-label">Booked Revenue Today</div>
	</div>

	<div class="stat-card">
		<div class="stat-top">
			<div class="stat-icon amber">
				<PawPrint size={18} />
			</div>
			<span class="stat-trend neutral">Active</span>
		</div>
		<div class="stat-value">{data.petCount}</div>
		<div class="stat-label">Registered Pets</div>
	</div>

	<div class="stat-card">
		<div class="stat-top">
			<div class="stat-icon blue">
				<Users size={18} />
			</div>
			<span class="stat-trend up">{data.ownerCount} total</span>
		</div>
		<div class="stat-value">{data.ownerCount}</div>
		<div class="stat-label">Client Directory</div>
	</div>
</div>

<!-- Stacked Full-Width Workspaces -->
<div class="stack" style="margin-top: var(--sp-6);">
	<!-- Section 1: Today's Live Queue (Full Width) -->
	<section class="card">
		<div class="card-head">
			<h2>
				<LogIn size={17} class="primary" />
				Today's Live Queue &amp; Arrivals ({data.todayBookings.length})
			</h2>
			<div class="row gap-2">
				<a href="/check-in" class="btn btn-sm btn-subtle">
					<LogIn size={13} />
					<span>Front Desk Console</span>
				</a>
			</div>
		</div>

		<div class="table-wrap">
			{#if data.todayBookings.length === 0}
				<div class="empty-state" style="padding: var(--sp-8) var(--sp-4);">
					<div class="empty-icon">
						<CalendarDays />
					</div>
					<h3>No appointments today</h3>
					<p>Today's schedule is currently clear. Book walk-ins or reserve upcoming slots.</p>
					<a href="/bookings/new" class="btn btn-primary btn-sm">
						<Plus size={14} /> Create Booking
					</a>
				</div>
			{:else}
				<table>
					<thead>
						<tr>
							<th>Time Slot</th>
							<th>Service Type</th>
							<th>Pet</th>
							<th>Customer / Client</th>
							<th>Assigned Resource</th>
							<th class="num">Amount</th>
							<th>Status</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each data.todayBookings as b}
							{@const KindIcon = getKindIcon(b.kind)}
							<tr class="row-click" onclick={() => window.location.href = `/bookings/${b.id}`}>
								<td class="mono small">
									<div class="cell-strong">{fmtTime(b.startsAt)}</div>
									{#if b.endsAt}<div class="cell-sub">{fmtTime(b.endsAt)}</div>{/if}
								</td>
								<td>
									<span class="badge kind-{b.kind}">
										<KindIcon size={12} />
										{b.serviceName ?? b.roomName ?? b.kind}
									</span>
								</td>
								<td>
									<div class="row row-nowrap">
										<span class="avatar-pet-sm">{getSpeciesEmoji(b.petSpecies)}</span>
										<div>
											<div class="cell-strong">{b.petName ?? 'Pet'}</div>
											{#if b.petBreed}<div class="cell-sub">{b.petBreed}</div>{/if}
										</div>
									</div>
								</td>
								<td>
									<a class="cell-link" href="/customers/{b.ownerId}" onclick={(e) => e.stopPropagation()}>
										{b.ownerName} {b.ownerLast}
									</a>
									{#if b.ownerPhone}
										<div class="cell-sub mono">{b.ownerPhone}</div>
									{/if}
								</td>
								<td class="small muted">
									{b.serviceName ?? b.roomName ?? '—'}
								</td>
								<td class="num mono cell-strong">{money(b.priceCents)}</td>
								<td>
									<span class="badge status-{b.status}">{b.status.replace('_', ' ')}</span>
								</td>
								<td class="num">
									<a href="/bookings/{b.id}" class="btn btn-ghost btn-sm" onclick={(e) => e.stopPropagation()}>
										<ExternalLink size={13} />
										<span>Open</span>
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	</section>

	<!-- Section 2: Upcoming Schedule (Full Width) -->
	<section class="card">
		<div class="card-head">
			<h2>
				<CalendarDays size={17} />
				Upcoming Schedule (Next 7 Days)
			</h2>
			<a href="/bookings" class="btn btn-sm btn-ghost">
				<span>View All Schedule ({data.totalBookingsCount})</span>
				<ArrowRight size={13} />
			</a>
		</div>

		<div class="table-wrap">
			{#if data.upcoming.length === 0}
				<div class="empty-state" style="padding: var(--sp-6);">
					<div class="empty-icon"><CalendarDays /></div>
					<h3>No upcoming visits</h3>
					<p>Upcoming bookings will appear here.</p>
				</div>
			{:else}
				<table>
					<thead>
						<tr>
							<th>Scheduled Date</th>
							<th>Service</th>
							<th>Pet &amp; Species</th>
							<th>Customer Contact</th>
							<th class="num">Amount</th>
							<th>Status</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each data.upcoming as b}
							{@const KindIcon = getKindIcon(b.kind)}
							<tr class="row-click" onclick={() => window.location.href = `/bookings/${b.id}`}>
								<td class="small">
									<div class="cell-strong">{fmtDay(b.startsAt)}</div>
									<div class="cell-sub mono">{fmtTime(b.startsAt)}</div>
								</td>
								<td>
									<span class="badge kind-{b.kind}">
										<KindIcon size={11} />
										{b.serviceName ?? b.roomName ?? b.kind}
									</span>
								</td>
								<td>
									<div class="row row-nowrap">
										<span class="avatar-pet-sm">{getSpeciesEmoji(b.petSpecies)}</span>
										<div>
											<div class="cell-strong">{b.petName ?? 'Pet'}</div>
											{#if b.petBreed}<div class="cell-sub">{b.petBreed}</div>{/if}
										</div>
									</div>
								</td>
								<td>
									<a class="cell-link" href="/customers/{b.ownerId}" onclick={(e) => e.stopPropagation()}>
										{b.ownerName} {b.ownerLast}
									</a>
									{#if b.ownerPhone}
										<div class="cell-sub mono">{b.ownerPhone}</div>
									{/if}
								</td>
								<td class="num mono small cell-strong">{money(b.priceCents)}</td>
								<td>
									<span class="badge status-{b.status}">{b.status.replace('_', ' ')}</span>
								</td>
								<td class="num">
									<a href="/bookings/{b.id}" class="btn btn-ghost btn-sm" onclick={(e) => e.stopPropagation()}>
										<ExternalLink size={13} />
										<span>Open</span>
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	</section>

	<!-- Section 3: Quick Action Launchpad (Full Width 4-Column Grid) -->
	<div class="grid cols-4 quick-launch-grid">
		<a href="/bookings/new" class="quick-card">
			<div class="quick-icon primary-tint">
				<CalendarPlus size={20} />
			</div>
			<div class="quick-text">
				<div class="quick-title">Schedule Booking</div>
				<div class="quick-desc">Grooming slot or hotel suite</div>
			</div>
			<ChevronRight size={16} class="quick-arrow" />
		</a>

		<a href="/customers/new" class="quick-card">
			<div class="quick-icon green-tint">
				<UserPlus size={20} />
			</div>
			<div class="quick-text">
				<div class="quick-title">Add Customer &amp; Pet</div>
				<div class="quick-desc">Create dossier &amp; vaccines</div>
			</div>
			<ChevronRight size={16} class="quick-arrow" />
		</a>

		<a href="/check-in" class="quick-card">
			<div class="quick-icon blue-tint">
				<LogIn size={20} />
			</div>
			<div class="quick-text">
				<div class="quick-title">Front Desk Check-in</div>
				<div class="quick-desc">Vaccine compliance gate</div>
			</div>
			<ChevronRight size={16} class="quick-arrow" />
		</a>

		<a href="/reminders" class="quick-card">
			<div class="quick-icon purple-tint">
				<BellRing size={20} />
			</div>
			<div class="quick-text">
				<div class="quick-title">Outreach &amp; Reminders</div>
				<div class="quick-desc">24h &amp; 2h pre-visit alerts</div>
			</div>
			<ChevronRight size={16} class="quick-arrow" />
		</a>
	</div>
</div>

<style>
	.avatar-pet-sm {
		width: 28px;
		height: 28px;
		border-radius: var(--r-sm);
		background: var(--surface-3);
		display: grid;
		place-items: center;
		font-size: 14px;
		flex-shrink: 0;
	}

	.quick-launch-grid {
		gap: var(--sp-4);
	}

	.quick-card {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-lg);
		text-decoration: none;
		box-shadow: var(--shadow-xs);
		transition: all 140ms ease;
	}

	.quick-card:hover {
		border-color: var(--border-focus);
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}

	.quick-icon {
		width: 40px;
		height: 40px;
		border-radius: var(--r-md);
		display: grid;
		place-items: center;
		flex-shrink: 0;
	}

	.primary-tint { background: var(--primary-soft); color: var(--primary); }
	.green-tint { background: var(--success-bg); color: var(--success); }
	.blue-tint { background: var(--info-bg); color: var(--info); }
	.purple-tint { background: var(--purple-bg); color: var(--purple); }

	.quick-text {
		flex: 1;
		min-width: 0;
	}

	.quick-title {
		font-size: 13.5px;
		font-weight: 700;
		color: var(--ink);
	}

	.quick-desc {
		font-size: 11.5px;
		color: var(--muted);
		margin-top: 1px;
	}

	:global(.quick-card:hover .quick-arrow) {
		color: var(--primary);
		transform: translateX(2px);
	}

	@media (max-width: 1024px) {
		.cols-4 {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 640px) {
		.cols-4 {
			grid-template-columns: 1fr;
		}
	}
</style>
