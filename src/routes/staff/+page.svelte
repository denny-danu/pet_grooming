<script lang="ts">
	import { page } from "$app/state";
	import {
		Users,
		UserPlus,
		Search,
		Shield,
		Scissors,
		UserCheck,
		UserX,
		KeyRound,
		Mail,
		Sparkles,
		CheckCircle2,
		AlertCircle,
		ShieldAlert,
		Building,
		CalendarDays,
		X,
		Plus,
		ChevronRight,
		Check
	} from "@lucide/svelte";

	let { data } = $props();
	const form = $derived(page.form);
	const createError = $derived(form?.createError);
	const actionError = $derived(form?.actionError);

	let addStaffOpen = $state(false);
	let filterRole = $state<string>('all');
	let searchQuery = $state('');

	function initials(name: string) {
		return name
			.split(/\s+/)
			.map((n) => n[0])
			.slice(0, 2)
			.join("")
			.toUpperCase() || "?";
	}

	function roleBadgeClass(role: string) {
		if (role === 'admin') return 'badge-danger';
		if (role === 'manager') return 'badge-purple';
		if (role === 'groomer') return 'kind-grooming';
		if (role === 'receptionist') return 'badge-info';
		if (role === 'caretaker') return 'kind-hotel';
		return 'badge-neutral';
	}

	const filteredStaff = $derived(
		data.staff.filter((s) => {
			const matchRole =
				filterRole === 'all'
					? true
					: filterRole === 'admin_manager'
					? s.role === 'admin' || s.role === 'manager'
					: s.role === filterRole;

			const q = searchQuery.toLowerCase().trim();
			const matchSearch =
				!q ||
				s.name.toLowerCase().includes(q) ||
				s.email.toLowerCase().includes(q) ||
				(s.specialty && s.specialty.toLowerCase().includes(q));

			return matchRole && matchSearch;
		})
	);
</script>

<svelte:head>
	<title>Staff &amp; Team · PetCo</title>
</svelte:head>

<div class="page-header">
	<div class="title-block">
		<div class="kicker"><Shield size={13} /> Team &amp; Access</div>
		<h1>Staff Management</h1>
		<p class="subtitle">Manage stylists, groomers, caretakers, receptionists, and permissions.</p>
	</div>
	<div class="actions">
		<button class="btn btn-primary" type="button" onclick={() => addStaffOpen = true}>
			<UserPlus size={15} />
			<span>Add Staff Member</span>
		</button>
	</div>
</div>

{#if actionError}
	<div class="alert alert-error mb">
		<ShieldAlert />
		<span>{actionError}</span>
	</div>
{/if}

<!-- Add Staff Drawer / Modal -->
{#if addStaffOpen}
	<div class="card pad mb add-staff-drawer">
		<div class="spread" style="margin-bottom: var(--sp-3);">
			<div class="row gap-2">
				<UserPlus size={18} class="primary" />
				<h2>Create Staff Account</h2>
			</div>
			<button class="btn btn-ghost btn-sm" type="button" onclick={() => addStaffOpen = false} aria-label="Close form">
				<X size={16} />
			</button>
		</div>

		{#if createError}
			<div class="alert alert-error" style="margin-bottom: var(--sp-3);">
				<AlertCircle />
				<span>{createError}</span>
			</div>
		{/if}

		<form method="POST" action="?/create">
			<div class="grid cols-3">
				<div class="field">
					<label for="name">Full Name <span class="req">*</span></label>
					<input id="name" name="name" required placeholder="e.g. Emily Watson" />
				</div>
				<div class="field">
					<label for="email">Staff Email <span class="req">*</span></label>
					<input id="email" name="email" type="email" required placeholder="e.g. emily@petco.local" />
				</div>
				<div class="field">
					<label for="role">Role &amp; Permissions <span class="req">*</span></label>
					<select id="role" name="role" required>
						<option value="groomer">Groomer / Stylist</option>
						<option value="receptionist">Front Desk / Receptionist</option>
						<option value="caretaker">Hotel Caretaker</option>
						<option value="specialist">Aquarium Specialist</option>
						<option value="manager">Store Manager</option>
						<option value="admin">System Administrator</option>
					</select>
				</div>
			</div>

			<div class="grid cols-2">
				<div class="field">
					<label for="specialty">Specialty / Notes</label>
					<input id="specialty" name="specialty" placeholder="e.g. Cat styling, breed cuts, behavior handler" />
				</div>
				<div class="field">
					<label for="password">Temporary Password <span class="req">*</span></label>
					<input id="password" name="password" type="password" required minlength="6" placeholder="At least 6 characters" />
				</div>
			</div>

			<div class="row gap-2" style="margin-top: var(--sp-3);">
				<button class="btn btn-primary" type="submit">
					<CheckCircle2 size={14} /> <span>Create Staff Account</span>
				</button>
				<button class="btn" type="button" onclick={() => addStaffOpen = false}>
					<X size={14} /> <span>Cancel</span>
				</button>
			</div>
		</form>
	</div>
{/if}

<!-- Team Metrics Strip -->
<div class="stat-grid" style="margin-bottom: var(--sp-6);">
	<div class="stat-card">
		<div class="stat-top">
			<div class="stat-icon blue">
				<Users size={18} />
			</div>
			<span class="stat-trend up">{data.totalActive} active</span>
		</div>
		<div class="stat-value">{data.totalCount}</div>
		<div class="stat-label">Total Staff Members</div>
	</div>

	<div class="stat-card">
		<div class="stat-top">
			<div class="stat-icon purple">
				<Scissors size={18} />
			</div>
			<span class="stat-trend neutral">Styling</span>
		</div>
		<div class="stat-value">{data.groomersCount}</div>
		<div class="stat-label">Salon Groomers &amp; Stylists</div>
	</div>

	<div class="stat-card">
		<div class="stat-top">
			<div class="stat-icon green">
				<Shield size={18} />
			</div>
			<span class="stat-trend up">Operations</span>
		</div>
		<div class="stat-value">{data.managersCount}</div>
		<div class="stat-label">Managers &amp; Admins</div>
	</div>

	<div class="stat-card">
		<div class="stat-top">
			<div class="stat-icon amber">
				<Sparkles size={18} />
			</div>
			<span class="stat-trend up">Branch #1</span>
		</div>
		<div class="stat-value">100%</div>
		<div class="stat-label">Roster Coverage</div>
	</div>
</div>

<!-- Filter Toolbar -->
<div class="card mb">
	<div class="toolbar spread">
		<div class="search-wrap">
			<Search size={15} class="search-icon" />
			<input
				bind:value={searchQuery}
				placeholder="Search staff by name, email, specialty..."
				aria-label="Filter staff members"
			/>
		</div>

		<div class="row gap-2">
			<span class="small faint font-semibold">Role:</span>
			<div class="segmented">
				<button class={filterRole === 'all' ? 'active' : ''} onclick={() => filterRole = 'all'}>
					<Users size={13} />
					<span>All ({data.staff.length})</span>
				</button>
				<button class={filterRole === 'groomer' ? 'active' : ''} onclick={() => filterRole = 'groomer'}>
					<Scissors size={13} />
					<span>Groomers</span>
				</button>
				<button class={filterRole === 'receptionist' ? 'active' : ''} onclick={() => filterRole = 'receptionist'}>
					<UserCheck size={13} />
					<span>Front Desk</span>
				</button>
				<button class={filterRole === 'caretaker' ? 'active' : ''} onclick={() => filterRole = 'caretaker'}>
					<Building size={13} />
					<span>Caretakers</span>
				</button>
				<button class={filterRole === 'admin_manager' ? 'active' : ''} onclick={() => filterRole = 'admin_manager'}>
					<Shield size={13} />
					<span>Managers</span>
				</button>
			</div>
		</div>
	</div>
</div>

<!-- Staff Roster Table -->
<section class="card">
	<div class="table-wrap">
		{#if filteredStaff.length === 0}
			<div class="empty-state" style="padding: var(--sp-10)">
				<div class="empty-icon"><Users /></div>
				<h3>No staff members found</h3>
				<p>Try clearing your search query or add a new team member.</p>
				<button class="btn btn-primary btn-sm" type="button" onclick={() => addStaffOpen = true}>
					<UserPlus size={14} /> <span>Add Staff Member</span>
				</button>
			</div>
		{:else}
			<table>
				<thead>
					<tr>
						<th>Staff Member</th>
						<th>Role</th>
						<th>Specialty / Focus</th>
						<th class="num">Assigned Bookings</th>
						<th>Status</th>
						<th class="num">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredStaff as s}
						<tr>
							<td>
								<div class="person-cell">
									<span class="avatar lg">{initials(s.name)}</span>
									<div>
										<div class="cell-strong">{s.name}</div>
										<div class="cell-sub">{s.email}</div>
									</div>
								</div>
							</td>
							<td>
								<span class="badge {roleBadgeClass(s.role)}">
									{s.role.toUpperCase()}
								</span>
							</td>
							<td class="small">
								{s.specialty ?? 'General store operations'}
							</td>
							<td class="num mono cell-strong">
								{s.bookingCount}
							</td>
							<td>
								{#if s.active}
									<span class="badge badge-success">
										<span class="dot"></span>
										Active
									</span>
								{:else}
									<span class="badge badge-danger">
										<span class="dot"></span>
										Inactive
									</span>
								{/if}
							</td>
							<td class="num">
								{#if s.id !== data.user.id}
									<form method="POST" action="?/toggleStatus" style="display: inline-block;">
										<input type="hidden" name="staffId" value={s.id} />
										<button
											class="btn btn-sm {s.active ? 'btn-ghost text-danger' : 'btn-subtle'}"
											type="submit"
										>
											{#if s.active}
												<UserX size={13} />
												<span>Deactivate</span>
											{:else}
												<UserCheck size={13} />
												<span>Activate</span>
											{/if}
										</button>
									</form>
								{:else}
									<span class="tiny muted mono">(You)</span>
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
	.add-staff-drawer {
		background: var(--surface-2);
		border-color: var(--primary-border);
		box-shadow: var(--shadow-md);
	}

	.search-wrap {
		flex: 0 1 360px;
	}

	.person-cell {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.text-danger {
		color: var(--danger);
	}
</style>
