<script lang="ts">
	import { page } from "$app/state";
	import { makeT } from "$lib/i18n/t";
	import {
		LogIn,
		Scissors,
		Hotel,
		Fish,
		UserCheck,
		Clock,
		Check,
		Search,
		ShieldCheck,
		ShieldAlert,
		AlertCircle,
		PawPrint,
		Phone,
		ChevronRight,
		Sparkles,
		CheckCircle2,
		RotateCcw,
		Plus
	} from "@lucide/svelte";

	let { data } = $props();
	const t = $derived(makeT(page.data.locale ?? "en"));

	let searchQuery = $state('');
	let filterTab = $state<'all' | 'pending' | 'done'>('all');

	const actionError = $derived(page.form?.actionError);

	const fmtTime = (d: Date | string) =>
		new Date(d).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
	const todayLabel = new Date().toLocaleDateString(undefined, {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	});

	function getKindIcon(k: string) {
		if (k === 'hotel') return Hotel;
		if (k === 'aquarium') return Fish;
		return Scissors;
	}

	function getSpeciesEmoji(species: string | null | undefined) {
		if (species === 'cat') return '🐱';
		if (species === 'bird') return '🦜';
		if (species === 'fish') return '🐠';
		if (species === 'reptile') return '🦎';
		return '🐶';
	}

	const pending = $derived(
		data.rows.filter((r) => r.status === 'pending' || r.status === 'confirmed')
	);
	const done = $derived(
		data.rows.filter((r) => r.status === 'checked_in' || r.status === 'completed')
	);

	const filteredRows = $derived(
		data.rows.filter((r) => {
			const matchesTab =
				filterTab === 'all'
					? true
					: filterTab === 'pending'
					? r.status === 'pending' || r.status === 'confirmed'
					: r.status === 'checked_in' || r.status === 'completed';

			const q = searchQuery.toLowerCase().trim();
			const matchesSearch =
				!q ||
				(r.petName && r.petName.toLowerCase().includes(q)) ||
				(r.ownerName && r.ownerName.toLowerCase().includes(q)) ||
				(r.ownerLast && r.ownerLast.toLowerCase().includes(q)) ||
				(r.ownerPhone && r.ownerPhone.includes(q));

			return matchesTab && matchesSearch;
		})
	);
</script>

<svelte:head>
	<title>Today's Check-in · PetCo</title>
</svelte:head>

<div class="page-header">
	<div class="title-block">
		<div class="kicker"><LogIn size={13} /> {t['checkin.kicker']()}</div>
		<h1>{t['checkin.title']()}</h1>
		<p class="subtitle">{todayLabel}</p>
	</div>
	<div class="actions">
		<div class="segmented">
			<span class="badge status-pending" style="padding: 4px 10px;">
				<Clock size={12} />
				{pending.length} to check in
			</span>
			{#if done.length > 0}
				<span class="badge status-valid" style="padding: 4px 10px;">
					<Check size={12} />
					{done.length} checked in
				</span>
			{/if}
		</div>
	</div>
</div>

{#if actionError}
	<div class="alert alert-error mb">
		<ShieldAlert />
		<span>{actionError}</span>
	</div>
{/if}

<!-- Toolbar with search & tabs -->
<div class="card mb">
	<div class="toolbar spread">
		<div class="search-box">
			<Search size={15} class="search-icon" />
			<input
				bind:value={searchQuery}
				placeholder="Search arrival by pet name, owner, or phone..."
				aria-label="Filter arrivals"
			/>
		</div>

		<div class="segmented">
			<button class={filterTab === 'all' ? 'active' : ''} onclick={() => filterTab = 'all'}>
				<Sparkles size={13} />
				<span>All ({data.rows.length})</span>
			</button>
			<button class={filterTab === 'pending' ? 'active' : ''} onclick={() => filterTab = 'pending'}>
				<Clock size={13} />
				<span>Awaiting ({pending.length})</span>
			</button>
			<button class={filterTab === 'done' ? 'active' : ''} onclick={() => filterTab = 'done'}>
				<CheckCircle2 size={13} />
				<span>Completed ({done.length})</span>
			</button>
		</div>
	</div>
</div>

<!-- Arrivals Table -->
<section class="card">
	<div class="table-wrap">
		{#if filteredRows.length === 0}
			<div class="empty-state" style="padding: var(--sp-10)">
				<div class="empty-icon"><Clock /></div>
				{#if searchQuery}
					<h3>No arrivals match “{searchQuery}”</h3>
					<p>Check spelling or clear the filter to view all arrivals.</p>
					<button class="btn" onclick={() => searchQuery = ''}>
						<RotateCcw size={14} />
						<span>Clear search</span>
					</button>
				{:else}
					<h3>No arrivals for today</h3>
					<p>Bookings scheduled for today with check-in required will appear here automatically.</p>
					<a href="/bookings/new" class="btn btn-primary">
						<Plus size={14} />
						<span>Schedule Booking</span>
					</a>
				{/if}
			</div>
		{:else}
			<table>
				<thead>
					<tr>
						<th>Time Slot</th>
						<th>Service Type</th>
						<th>Pet Arrival</th>
						<th>Customer / Client</th>
						<th>Resource</th>
						<th>Status</th>
						<th class="num">Check-in Action</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredRows as r}
						{@const KindIcon = getKindIcon(r.kind)}
						<tr class="row-click" onclick={() => window.location.href = `/bookings/${r.id}`}>
							<td class="mono small">
								<div class="cell-strong">{fmtTime(r.startsAt)}</div>
								{#if r.endsAt}<div class="cell-sub">{fmtTime(r.endsAt)}</div>{/if}
							</td>
							<td>
								<span class="badge kind-{r.kind}">
									<KindIcon size={12} />
									{r.serviceName ?? r.roomName ?? r.kind}
								</span>
							</td>
							<td>
								<div class="row row-nowrap">
									<span class="avatar-pet-sm">{getSpeciesEmoji(r.petSpecies)}</span>
									<div>
										<div class="cell-strong">{r.petName ?? '—'}</div>
										{#if r.petBreed}<div class="cell-sub">{r.petBreed}</div>{/if}
									</div>
								</div>
							</td>
							<td>
								<a class="cell-link" href="/customers/{r.ownerId ?? ''}" onclick={(e) => e.stopPropagation()}>
									{r.ownerName} {r.ownerLast}
								</a>
								{#if r.ownerPhone}
									<div class="cell-sub mono">{r.ownerPhone}</div>
								{/if}
							</td>
							<td class="small muted">
								{r.roomName ?? r.serviceName ?? '—'}
							</td>
							<td>
								<span class="badge status-{r.status}">{r.status.replace('_', ' ')}</span>
							</td>
							<td class="num" onclick={(e) => e.stopPropagation()}>
								{#if r.status === 'confirmed' || r.status === 'pending'}
									<form method="POST" action="?/checkin" style="display: inline-block;">
										<input type="hidden" name="bookingId" value={r.id} />
										<button class="btn btn-primary btn-sm" type="submit">
											<UserCheck size={14} />
											<span>Check in</span>
										</button>
									</form>
								{:else if r.status === 'checked_in'}
									<span class="badge status-valid">
										<Check size={12} />
										Checked In
									</span>
								{:else}
									<span class="badge status-valid">
										<Check size={12} />
										Done
									</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</section>

<style>
	.search-box {
		flex: 0 1 380px;
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
</style>
