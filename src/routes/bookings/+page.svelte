<script lang="ts">
	import { page } from "$app/state";
	import { makeT } from "$lib/i18n/t";
	import { getSpeciesEmoji } from "$lib/ui/species";
	import {
		CalendarDays,
		ChevronLeft,
		ChevronRight,
		Plus,
		Scissors,
		Hotel,
		Fish,
		Clock,
		Sparkles,
		User,
		Phone,
		Filter,
		Calendar,
		ArrowRight,
		CheckCircle2,
		AlertCircle,
		UserCheck,
		RotateCcw,
		ExternalLink
	} from "@lucide/svelte";
	import { formatRupiah as money } from "$lib/util";

	let { data } = $props();
	const t = $derived(makeT(page.data.locale ?? "en"));

	let selectedKind = $state<string>('all');
	let selectedStatus = $state<string>('all');
	const fmtDay = (d: Date) => d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
	const fmtDayFull = (d: Date) => d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
	const fmtTime = (d: Date | string) => new Date(d).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
	const isToday = (d: Date) => d.toDateString() === new Date().toDateString();
	const dayKey = (d: Date) => d.toISOString().slice(0, 10);

	const shift = (days: number) => {
		const base = new Date(data.days[0].date);
		base.setDate(base.getDate() + days);
		return `/bookings?day=${dayKey(base)}`;
	};

	const firstDay = $derived(data.days[0]);
	const lastDay = $derived(data.days[data.days.length - 1]);
	const weekLabel = $derived(`${fmtDay(firstDay.date)} – ${fmtDay(lastDay.date)}, ${lastDay.date.getFullYear()}`);

	const allItems = $derived(data.days.flatMap((d) => d.items));
	const weekTotal = $derived(allItems.reduce((s, b) => s + b.priceCents, 0));
	const groomingCount = $derived(allItems.filter((b) => b.kind === 'grooming').length);
	const hotelCount = $derived(allItems.filter((b) => b.kind === 'hotel').length);

	const filteredDays = $derived(
		data.days.map((day) => ({
			date: day.date,
			items: day.items.filter((b) => {
				const matchKind = selectedKind === 'all' || b.kind === selectedKind;
				const matchStatus = selectedStatus === 'all' || b.status === selectedStatus;
				return matchKind && matchStatus;
			})
		}))
	);

	const totalFilteredItems = $derived(filteredDays.reduce((acc, d) => acc + d.items.length, 0));

	function getKindIcon(k: string) {
		if (k === 'hotel') return Hotel;
		if (k === 'aquarium') return Fish;
		return Scissors;
	}

</script>

<svelte:head>
	<title>Bookings · PetCo</title>
</svelte:head>

<div class="page-header">
	<div class="title-block">
		<div class="kicker"><CalendarDays size={13} /> {t['bookings.kicker']()}</div>
		<h1>{t['bookings.title']()}</h1>
		<p class="subtitle">{weekLabel}</p>
	</div>
	<div class="actions">
		<div class="segmented" role="group" aria-label="Week navigation">
			<a href={shift(-7)} class="nav-arrow" aria-label="Previous week">
				<ChevronLeft size={16} />
			</a>
			<a href="/bookings" class={isToday(firstDay.date) ? 'active' : ''}>Today</a>
			<a href={shift(7)} class="nav-arrow" aria-label="Next week">
				<ChevronRight size={16} />
			</a>
		</div>
		<a href="/bookings/new" class="btn btn-primary">
			<Plus size={15} />
			<span>New Booking</span>
		</a>
	</div>
</div>

<!-- Weekly Metrics Banner -->
<div class="stat-grid" style="margin-bottom: var(--sp-6);">
	<div class="stat-card">
		<div class="stat-top">
			<div class="stat-icon purple">
				<CalendarDays size={18} />
			</div>
			<span class="stat-trend up">{allItems.length} active</span>
		</div>
		<div class="stat-value">{allItems.length}</div>
		<div class="stat-label">Total Bookings This Week</div>
	</div>

	<div class="stat-card">
		<div class="stat-top">
			<div class="stat-icon green">
				<Sparkles size={18} />
			</div>
			<span class="stat-trend up">Weekly</span>
		</div>
		<div class="stat-value">{money(weekTotal)}</div>
		<div class="stat-label">Projected Revenue</div>
	</div>

	<div class="stat-card">
		<div class="stat-top">
			<div class="stat-icon purple">
				<Scissors size={18} />
			</div>
			<span class="stat-trend neutral">Salon</span>
		</div>
		<div class="stat-value">{groomingCount}</div>
		<div class="stat-label">Grooming Sessions</div>
	</div>

	<div class="stat-card">
		<div class="stat-top">
			<div class="stat-icon blue">
				<Hotel size={18} />
			</div>
			<span class="stat-trend neutral">Boarding</span>
		</div>
		<div class="stat-value">{hotelCount}</div>
		<div class="stat-label">Hotel Suites Booked</div>
	</div>
</div>

<!-- Filters Bar -->
<div class="card mb">
	<div class="toolbar spread">
		<div class="row gap-2">
			<span class="small faint font-semibold">Service:</span>
			<div class="segmented">
				<button class={selectedKind === 'all' ? 'active' : ''} onclick={() => selectedKind = 'all'}>
					<Sparkles size={13} />
					<span>All</span>
				</button>
				<button class={selectedKind === 'grooming' ? 'active' : ''} onclick={() => selectedKind = 'grooming'}>
					<Scissors size={13} />
					<span>Grooming</span>
				</button>
				<button class={selectedKind === 'hotel' ? 'active' : ''} onclick={() => selectedKind = 'hotel'}>
					<Hotel size={13} />
					<span>Hotel</span>
				</button>
				<button class={selectedKind === 'aquarium' ? 'active' : ''} onclick={() => selectedKind = 'aquarium'}>
					<Fish size={13} />
					<span>Aquarium</span>
				</button>
			</div>
		</div>

		<div class="row gap-2">
			<span class="small faint font-semibold">Status:</span>
			<div class="segmented">
				<button class={selectedStatus === 'all' ? 'active' : ''} onclick={() => selectedStatus = 'all'}>
					<CalendarDays size={13} />
					<span>All</span>
				</button>
				<button class={selectedStatus === 'confirmed' ? 'active' : ''} onclick={() => selectedStatus = 'confirmed'}>
					<CheckCircle2 size={13} />
					<span>Confirmed</span>
				</button>
				<button class={selectedStatus === 'pending' ? 'active' : ''} onclick={() => selectedStatus = 'pending'}>
					<Clock size={13} />
					<span>Pending</span>
				</button>
				<button class={selectedStatus === 'checked_in' ? 'active' : ''} onclick={() => selectedStatus = 'checked_in'}>
					<UserCheck size={13} />
					<span>Checked in</span>
				</button>
			</div>
		</div>
	</div>
</div>

<!-- Schedule Days List -->
<div class="stack">
	{#each filteredDays as day}
		{#if day.items.length > 0}
			{@const dayTotal = day.items.reduce((s, b) => s + b.priceCents, 0)}
			<section class="card">
				<div class="day-head {isToday(day.date) ? 'is-today-head' : ''}">
					<div class="row gap-2">
						<div class="day-title">
							{fmtDayFull(day.date)}
						</div>
						{#if isToday(day.date)}
							<span class="badge badge-success">
								<span class="dot"></span>
								Today
							</span>
						{/if}
						<span class="badge badge-neutral">{day.items.length} booking(s)</span>
					</div>

					<div class="day-total">
						<span class="tiny muted">Day total:</span>
						<span class="mono cell-strong">{money(dayTotal)}</span>
					</div>
				</div>

				<div class="table-wrap">
					<table>
						<thead>
							<tr>
								<th>Time</th>
								<th>Service</th>
								<th>Pet</th>
								<th>Customer</th>
								<th>Assigned Resource</th>
								<th class="num">Amount</th>
								<th>Status</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{#each day.items as b}
								{@const KindIcon = getKindIcon(b.kind)}
								<tr class="row-click" onclick={() => window.location.href = `/bookings/${b.id}`}>
									<td class="small mono">
										<div class="cell-strong">{fmtTime(b.startsAt)}</div>
										<div class="cell-sub">{b.endsAt ? fmtTime(b.endsAt) : ''}</div>
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
												<div class="cell-strong">{b.petName ?? '—'}</div>
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
									<td class="small">
										{#if b.staffName}
											<div class="row row-nowrap">
												<span class="staff-pill">{b.staffName}</span>
											</div>
										{:else if b.roomName}
											<span class="muted">{b.roomName}</span>
										{:else}
											<span class="faint">—</span>
										{/if}
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
				</div>
			</section>
		{/if}
	{/each}

	{#if totalFilteredItems === 0}
		<section class="card">
			<div class="empty-state" style="padding: var(--sp-12) var(--sp-5)">
				<div class="empty-icon"><CalendarDays /></div>
				<h3>No bookings match your filter</h3>
				<p>There are no appointments found between {fmtDay(data.days[0].date)} and {fmtDay(data.days[6].date)} for this selection.</p>
				<div class="row gap-2" style="margin-top: var(--sp-2);">
					{#if selectedKind !== 'all' || selectedStatus !== 'all'}
						<button class="btn" onclick={() => { selectedKind = 'all'; selectedStatus = 'all'; }}>
							<RotateCcw size={14} />
							<span>Reset Filters</span>
						</button>
					{/if}
					<a href="/bookings/new" class="btn btn-primary">
						<Plus size={15} /> New booking
					</a>
				</div>
			</div>
		</section>
	{/if}
</div>

<style>
	.nav-arrow {
		padding: 5px 8px !important;
	}

	.day-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--sp-4) var(--sp-5);
		border-bottom: 1px solid var(--border);
		background: var(--surface);
	}

	.day-head.is-today-head {
		background: #f0fdf4;
		border-bottom-color: var(--success-border);
	}

	.day-title {
		font-size: 15px;
		font-weight: 700;
		color: var(--ink);
	}

	.day-total {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13.5px;
	}

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

	.staff-pill {
		font-size: 12px;
		color: var(--ink-2);
		font-weight: 500;
		background: var(--surface-3);
		padding: 2px 7px;
		border-radius: var(--r-sm);
	}
</style>
