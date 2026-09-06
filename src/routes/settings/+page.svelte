<script lang="ts">
	import { page } from "$app/state";
	import { makeT } from "$lib/i18n/t";
	import {
		Building2,
		Store,
		Globe,
		Settings,
		Shield,
		Plus,
		CheckCircle2,
		AlertCircle,
		Phone,
		Mail,
		MapPin,
		Save,
		Receipt,
		MessageSquare,
		Check,
		X,
		Lock,
		Sparkles,
		Power
	} from "@lucide/svelte";
	import StatCard from "$lib/components/StatCard.svelte";
	import Modal from "$lib/components/Modal.svelte";

	let { data } = $props();
	const t = $derived(makeT(page.data.locale ?? "en"));
	const form = $derived(page.form);

	let activeTab = $state<"branches" | "general" | "receipts" | "automation">("branches");
	let addBranchOpen = $state(false);

	const s = $derived(data.settings);
	const hoBranch = $derived(data.branches.find((b) => b.isHeadOffice));
	const childBranches = $derived(data.branches.filter((b) => !b.isHeadOffice));
</script>

<svelte:head>
	<title>Website &amp; Branch Settings · PetCo</title>
</svelte:head>

<div class="page-header">
	<div class="title-block">
		<div class="kicker"><Settings size={13} /> {t['settings.kicker']()}</div>
		<h1>{t['settings.title']()}</h1>
		<p class="subtitle">{t['settings.subtitle']()}</p>
	</div>
	<div class="actions">
		{#if data.isHeadOffice}
			<button class="btn btn-primary" onclick={() => (addBranchOpen = true)}>
				<Plus size={15} />
				<span>Add Branch Office</span>
			</button>
		{/if}
	</div>
</div>

{#if form?.settingsSaved}
	<div class="alert alert-success mb">
		<CheckCircle2 size={16} />
		<span>Store and website settings updated successfully!</span>
	</div>
{/if}

{#if form?.branchCreated}
	<div class="alert alert-success mb">
		<CheckCircle2 size={16} />
		<span>New branch office successfully established and integrated!</span>
	</div>
{/if}

{#if form?.branchError}
	<div class="alert alert-error mb">
		<AlertCircle size={16} />
		<span>{form.branchError}</span>
	</div>
{/if}

<!-- Multi-Branch Architecture Notice Banner -->
<div class="privacy-isolation-banner mb">
	<div class="row gap-2">
		<div class="privacy-icon">
			<Lock size={18} />
		</div>
		<div>
			<div class="privacy-title">Multi-Branch Privacy &amp; Data Isolation Active</div>
			<div class="privacy-desc">
				Child branches operate with strictly private databases (bookings, customers, orders, inventory). Head Office (HO) accounts have consolidated lookup access via the Branch Filter switcher.
			</div>
		</div>
	</div>
</div>

<!-- Tabs Bar -->
<div class="card mb">
	<div class="toolbar spread">
		<div class="segmented">
			<button
				class={activeTab === "branches" ? "active" : ""}
				onclick={() => (activeTab = "branches")}
			>
				<Building2 size={14} />
				<span>Branch Offices ({data.branches.length})</span>
			</button>
			<button
				class={activeTab === "general" ? "active" : ""}
				onclick={() => (activeTab = "general")}
			>
				<Globe size={14} />
				<span>Website &amp; Booking</span>
			</button>
			<button
				class={activeTab === "receipts" ? "active" : ""}
				onclick={() => (activeTab = "receipts")}
			>
				<Receipt size={14} />
				<span>POS Receipts &amp; Tax</span>
			</button>
			<button
				class={activeTab === "automation" ? "active" : ""}
				onclick={() => (activeTab = "automation")}
			>
				<MessageSquare size={14} />
				<span>Automation &amp; WhatsApp</span>
			</button>
		</div>
	</div>
</div>

<!-- TAB 1: BRANCH OFFICES DIRECTORY -->
{#if activeTab === "branches"}
	<div class="stack">
		<!-- Summary metrics -->
		<div class="stat-grid">
			<StatCard
				title="Total Branch Offices"
				value={data.branches.length}
				subtitle="1 Head Office + {childBranches.length} Child Branches"
				tint="blue"
				icon={Building2}
			/>
			<StatCard
				title="Head Office Location"
				value={hoBranch?.city ?? "Jakarta Pusat"}
				subtitle="{hoBranch?.name ?? 'HQ Central'}"
				tint="purple"
				icon={Shield}
			/>
			<StatCard
				title="Active Child Branches"
				value={childBranches.filter((b) => b.active).length}
				subtitle="Private branch telemetry"
				tint="green"
				icon={Store}
			/>
			<StatCard
				title="Data Isolation Policy"
				value="Strict Lock"
				subtitle="Zero cross-branch leak"
				tint="amber"
				icon={Lock}
			/>
		</div>

		<!-- Branches List Table -->
		<section class="card">
			<div class="card-head">
				<h2>
					<Building2 size={16} />
					Branch Offices Roster &amp; Locations
				</h2>
			</div>

			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Branch Office</th>
							<th>Branch Code</th>
							<th>Type / Hierarchy</th>
							<th>Contact Info</th>
							<th>Staff &amp; Activity</th>
							<th>Status</th>
							<th class="num">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each data.branches as b}
							<tr>
								<td>
									<div>
										<div class="cell-strong">{b.name}</div>
										<div class="small muted">{b.address ?? b.city}</div>
									</div>
								</td>
								<td>
									<span class="badge badge-neutral mono font-bold">{b.code}</span>
								</td>
								<td>
									{#if b.isHeadOffice}
										<span class="badge badge-purple">
											<Shield size={11} />
											HEAD OFFICE (HO)
										</span>
									{:else}
										<span class="badge badge-info">
											<Store size={11} />
											CHILD BRANCH
										</span>
									{/if}
								</td>
								<td class="small">
									{#if b.phone}<div class="mono">{b.phone}</div>{/if}
									{#if b.email}<div class="muted">{b.email}</div>{/if}
								</td>
								<td class="small mono">
									<div>{b.staffCount} staff member(s)</div>
									<div class="muted">{b.bookingCount} booking(s)</div>
								</td>
								<td>
									{#if b.active}
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
									{#if !b.isHeadOffice && data.isHeadOffice}
										<form method="POST" action="?/toggleBranch" style="display: inline-block;">
											<input type="hidden" name="branchId" value={b.id} />
											<button
												class="btn btn-sm {b.active ? 'btn-ghost text-danger' : 'btn-subtle'}"
												type="submit"
											>
												<Power size={13} />
												<span>{b.active ? "Deactivate" : "Activate"}</span>
											</button>
										</form>
									{:else if b.isHeadOffice}
										<span class="tiny muted mono">(Central HQ)</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	</div>
{/if}

<!-- TAB 2: GENERAL WEBSITE & ONLINE BOOKING -->
{#if activeTab === "general"}
	<div class="card pad" style="max-width: 800px;">
		<form method="POST" action="?/updateSettings" class="stack gap-4">
			<div class="section-heading-row">
				<Globe size={18} class="primary" />
				<h2>Website &amp; Store Brand Identity</h2>
			</div>

			<div class="grid cols-2">
				<div class="field">
					<label for="storeName">Store &amp; Brand Name <span class="req">*</span></label>
					<input
						id="storeName"
						name="storeName"
						value={s.storeName}
						required
						placeholder="e.g. PetCo Pet Care & Retail"
					/>
				</div>

				<div class="field">
					<label for="tagline">Tagline / Subtitle</label>
					<input
						id="tagline"
						name="tagline"
						value={s.tagline ?? ""}
						placeholder="e.g. Pet CRM, Grooming & Hotel"
					/>
				</div>
			</div>

			<div class="grid cols-2">
				<div class="field">
					<label for="contactPhone">Main Contact Phone</label>
					<input
						id="contactPhone"
						name="contactPhone"
						value={s.contactPhone ?? ""}
						placeholder="+62 21-718-2938"
					/>
				</div>

				<div class="field">
					<label for="contactEmail">Public Contact Email</label>
					<input
						id="contactEmail"
						name="contactEmail"
						type="email"
						value={s.contactEmail ?? ""}
						placeholder="contact@petco.co.id"
					/>
				</div>
			</div>

			<hr class="divider" />

			<div class="section-heading-row">
				<Sparkles size={18} class="primary" />
				<h2>Online Client Booking Rules</h2>
			</div>

			<div class="field">
				<label class="toggle-checkbox-row">
					<input
						type="checkbox"
						name="onlineBookingEnabled"
						checked={s.onlineBookingEnabled ?? true}
					/>
					<div>
						<div class="cell-strong">Enable Online Customer Booking Portal</div>
						<div class="small muted">Allow pet owners to reserve grooming slots and boarding suites from web/mobile.</div>
					</div>
				</label>
			</div>

			<div class="field">
				<label class="toggle-checkbox-row">
					<input
						type="checkbox"
						name="autoConfirmBookings"
						checked={s.autoConfirmBookings ?? true}
					/>
					<div>
						<div class="cell-strong">Auto-Confirm Booking Reservations</div>
						<div class="small muted">Automatically confirm appointments when slots are available without manual review.</div>
					</div>
				</label>
			</div>

			<div class="row spread" style="margin-top: var(--sp-4);">
				<button class="btn btn-primary btn-lg" type="submit">
					<Save size={16} />
					<span>Save General Settings</span>
				</button>
			</div>
		</form>
	</div>
{/if}

<!-- TAB 3: POS RECEIPTS & TAX -->
{#if activeTab === "receipts"}
	<div class="card pad" style="max-width: 800px;">
		<form method="POST" action="?/updateSettings" class="stack gap-4">
			<div class="section-heading-row">
				<Receipt size={18} class="primary" />
				<h2>POS Thermal Receipt &amp; Tax Configuration</h2>
			</div>

			<div class="field" style="max-width: 320px;">
				<label for="taxRatePercent">Standard Value-Added Tax (PPN %)</label>
				<input
					id="taxRatePercent"
					name="taxRatePercent"
					type="number"
					value={s.taxRatePercent ?? 11}
					min="0"
					max="100"
				/>
			</div>

			<div class="field">
				<label for="receiptHeader">Receipt Header Message</label>
				<input
					id="receiptHeader"
					name="receiptHeader"
					value={s.receiptHeader ?? "PetCo Pet Care, Grooming & Hotel"}
				/>
			</div>

			<div class="field">
				<label for="receiptFooter">Receipt Footer Note / Greeting</label>
				<textarea
					id="receiptFooter"
					name="receiptFooter"
					rows="3"
				>{s.receiptFooter ?? "Terima kasih atas kunjungan Anda! Sampai jumpa kembali."}</textarea>
			</div>

			<div class="row spread" style="margin-top: var(--sp-4);">
				<button class="btn btn-primary btn-lg" type="submit">
					<Save size={16} />
					<span>Save Receipt Configuration</span>
				</button>
			</div>
		</form>
	</div>
{/if}

<!-- TAB 4: AUTOMATION & WHATSAPP -->
{#if activeTab === "automation"}
	<div class="card pad" style="max-width: 800px;">
		<form method="POST" action="?/updateSettings" class="stack gap-4">
			<div class="section-heading-row">
				<MessageSquare size={18} class="primary" />
				<h2>Automated Pre-visit Reminders &amp; Outreach</h2>
			</div>

			<div class="field">
				<label class="toggle-checkbox-row">
					<input
						type="checkbox"
						name="reminder24hEnabled"
						checked={s.reminder24hEnabled ?? true}
					/>
					<div>
						<div class="cell-strong">24-Hour Pre-Visit Alert</div>
						<div class="small muted">Automatically send WhatsApp and SMS reminders 24 hours prior to appointment.</div>
					</div>
				</label>
			</div>

			<div class="field">
				<label class="toggle-checkbox-row">
					<input
						type="checkbox"
						name="reminder2hEnabled"
						checked={s.reminder2hEnabled ?? true}
					/>
					<div>
						<div class="cell-strong">2-Hour Arrival Notice</div>
						<div class="small muted">Send prompt arrival reminder 2 hours before scheduled salon/boarding slot.</div>
					</div>
				</label>
			</div>

			<hr class="divider" />

			<div class="field">
				<label for="whatsappApiKey">WhatsApp Business Cloud API Key / Token</label>
				<input
					id="whatsappApiKey"
					name="whatsappApiKey"
					type="password"
					value={s.whatsappApiKey ?? ""}
					placeholder="EAAGm0PX4ZCb... (Enter live token)"
				/>
				<p class="small muted" style="margin-top: 4px;">Used for direct WhatsApp reminder delivery to customer mobile numbers.</p>
			</div>

			<div class="row spread" style="margin-top: var(--sp-4);">
				<button class="btn btn-primary btn-lg" type="submit">
					<Save size={16} />
					<span>Save Automation Settings</span>
				</button>
			</div>
		</form>
	</div>
{/if}

<!-- Modal: Add Branch Office -->
<Modal bind:open={addBranchOpen} title="Establish New Branch Office" subtitle="Create a child branch with isolated private data" maxWidth="640px">
	<form method="POST" action="?/createBranch" class="stack gap-4">
		<div class="grid cols-2">
			<div class="field">
				<label for="branch-name">Branch Name <span class="req">*</span></label>
				<input
					id="branch-name"
					name="name"
					required
					placeholder="e.g. Cabang Bandung Dago"
				/>
			</div>

			<div class="field">
				<label for="branch-code">Branch Code (Unique) <span class="req">*</span></label>
				<input
					id="branch-code"
					name="code"
					required
					placeholder="e.g. BDG-01"
					style="text-transform: uppercase;"
				/>
			</div>
		</div>

		<div class="grid cols-2">
			<div class="field">
				<label for="branch-city">City</label>
				<input id="branch-city" name="city" placeholder="e.g. Bandung" />
			</div>

			<div class="field">
				<label for="branch-phone">Branch Phone Number</label>
				<input id="branch-phone" name="phone" placeholder="+62 22-200-1122" />
			</div>
		</div>

		<div class="field">
			<label for="branch-address">Full Street Address</label>
			<textarea id="branch-address" name="address" rows="2" placeholder="e.g. Jl. Ir. H. Juanda No. 102, Dago"></textarea>
		</div>

		<div class="field">
			<label for="branch-email">Branch Email</label>
			<input id="branch-email" name="email" type="email" placeholder="dago@petco.co.id" />
		</div>

		<div class="row spread" style="margin-top: var(--sp-2);">
			<button type="button" class="btn btn-ghost" onclick={() => (addBranchOpen = false)}>
				<X size={14} />
				<span>Cancel</span>
			</button>
			<button type="submit" class="btn btn-primary">
				<Plus size={15} />
				<span>Create Branch Office</span>
			</button>
		</div>
	</form>
</Modal>

<style>
	.privacy-isolation-banner {
		background: #f0fdf4;
		border: 1px solid #bbf7d0;
		border-radius: var(--r-lg);
		padding: 14px 18px;
	}

	.privacy-icon {
		width: 36px;
		height: 36px;
		border-radius: var(--r-md);
		background: #dcfce7;
		color: #15803d;
		display: grid;
		place-items: center;
		flex-shrink: 0;
	}

	.privacy-title {
		font-size: 13.5px;
		font-weight: 700;
		color: #166534;
	}

	.privacy-desc {
		font-size: 12px;
		color: #15803d;
		margin-top: 2px;
		line-height: 1.4;
	}

	.section-heading-row {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: var(--sp-2);
	}

	.section-heading-row h2 {
		font-size: 15px;
		font-weight: 700;
		color: var(--ink);
	}

	.toggle-checkbox-row {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		cursor: pointer;
		padding: 10px 14px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--r-md);
		transition: all 130ms ease;
	}

	.toggle-checkbox-row:hover {
		border-color: var(--primary-border);
		background: var(--surface-hover);
	}

	.toggle-checkbox-row input {
		margin-top: 3px;
	}

	.text-danger {
		color: var(--danger);
	}
</style>
