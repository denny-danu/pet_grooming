<script lang="ts">
	import { page } from "$app/state";
	import {
		ArrowLeft, Phone, Mail, MapPin, Plus, CalendarPlus, Award, Wallet,
		PawPrint, Syringe, ShieldAlert, ShieldCheck, TriangleAlert,
		Tag, History, ReceiptText, ChevronDown, Star, Sparkles
	} from "@lucide/svelte";
	let { data } = $props();
	const form = $derived(page.form);
	const addPetError = $derived(form?.addPetError);
	const money = (c: number) => `$${(c / 100).toFixed(2)}`;
	const fmtWhen = (d: Date | string) => new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	const fmtDay = (d: Date | string) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
	const cust = $derived(data.customer);
	const vaxInfo = (s: string) =>
		s === 'valid' ? { label: 'Vaccinated', cls: 'status-valid', Icon: ShieldCheck }
			: s === 'expiring' ? { label: 'Due soon', cls: 'status-expiring', Icon: TriangleAlert }
			: s === 'expired' ? { label: 'Expired', cls: 'status-expired', Icon: ShieldAlert }
			: { label: 'No record', cls: 'status-missing', Icon: Syringe };
	const fmtWhenShort = (d: Date | string | null) => (d ? fmtDay(d) : '—');
	let addPetOpen = $state(false);

	function initials(name: string) {
		return name.split(/\s+/).map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";
	}
	function specLabel(s: string) {
		return s.charAt(0).toUpperCase() + s.slice(1);
	}
	function tierClass(t: string | undefined) {
		return t === 'gold' ? 'badge-warning' : t === 'platinum' ? 'badge-purple' : 'badge-neutral';
	}
	function pointsProgress(pts: number) {
		return Math.min(100, (pts / 5000) * 100);
	}
</script>

<svelte:head><title>{cust?.firstName ?? 'Customer'} · PetCo</title></svelte:head>

{#if data.notFound}
	<div class="empty-state" style="margin-top: 60px">
		<div class="empty-icon"><PawPrint /></div>
		<h3>Customer not found</h3>
		<p>This record may have been removed.</p>
		<a href="/customers"><button class="btn">Back to customers</button></a>
	</div>
{:else if cust}
<a href="/customers" class="back-link"><ArrowLeft size={15} /> Customers</a>

<div class="page-header">
	<div class="title-block person-title">
		<div class="person">
			<span class="avatar big">{initials(`${cust.firstName} ${cust.lastName}`)}</span>
			<div>
				<h1>{cust.firstName} {cust.lastName}</h1>
				<p>{cust.pets.length} pet(s) on file · member since {fmtDay(cust.createdAt)}</p>
			</div>
		</div>
	</div>
	<div class="actions">
		<a href="/bookings/new?owner={cust.id}"><button class="btn btn-primary"><CalendarPlus size={15} /> New booking</button></a>
	</div>
</div>

<div class="grid cols-3 profile-grid" style="align-items: start">
	<!-- contact + membership -->
	<div class="stack" style="gap: var(--sp-4)">
		<section class="card pad">
			<h2 style="margin-bottom: var(--sp-3)">Contact</h2>
			<ul class="kv">
				<li><span class="kv-ic"><Phone size={14} /></span><span>{cust.phone}</span></li>
				{#if cust.email}<li><span class="kv-ic"><Mail size={14} /></span><a href="mailto:{cust.email}">{cust.email}</a></li>{/if}
				{#if cust.address}<li><span class="kv-ic"><MapPin size={14} /></span><span>{cust.address}</span></li>{/if}
			</ul>
		</section>

		<section class="card pad">
			<div class="section-title" style="margin-bottom: var(--sp-3)">
				<h2><Award size={15} /> Membership</h2>
				<span class="badge {tierClass(data.account?.tier)}">{data.account?.tier ?? 'silver'}</span>
			</div>
			<div class="points-row">
				<div class="points">
					<div class="points-num mono">{data.account?.pointsBalance ?? 0}</div>
					<div class="points-label">points</div>
				</div>
				<div class="points-progress" title="Progress to next tier">
					<div class="points-progress-fill" style="width: {pointsProgress(data.account?.pointsBalance ?? 0)}%"></div>
				</div>
			</div>
			<p class="tiny faint" style="margin: 10px 0 0">Earn points on bookings, spend them on future visits.</p>
		</section>

		<section class="card pad">
			<div class="section-title" style="margin-bottom: var(--sp-3)">
				<h2><Wallet size={15} /> Packages</h2>
			</div>
			{#if (data.packages ?? []).length === 0}
				<p class="small muted">No prepaid packages yet.</p>
			{:else}
			<div class="pkg-list">
				{#each data.packages ?? [] as p}
					<div class="pkg">
						<div class="pkg-head">
							<span class="badge kind-{p.kind}">{p.kind}</span>
							<span class="badge {p.creditsRemaining > 0 ? 'status-valid' : 'status-expired'}">{p.creditsRemaining} left</span>
						</div>
						<div class="pkg-name">{p.packageName}</div>
						<div class="pkg-meta">of {p.creditsIssued} credits · purchased {fmtDay(p.purchasedAt)}</div>
					</div>
				{/each}
			</div>
			{/if}
			<hr class="divider" />
			<form method="POST" action="?/buyPackage" class="row" style="align-items: end">
				<div class="field" style="flex: 1; margin: 0">
					<label for="packageId">Sell a package</label>
					<select id="packageId" name="packageId">
						{#each data.catalog ?? [] as pkg}
							<option value={pkg.id}>{pkg.name} · {pkg.credits} cr · {money(pkg.priceCents)}</option>
						{/each}
					</select>
				</div>
				<button class="btn btn-sm" type="submit"><Plus size={14} /> Sell</button>
			</form>
		</section>
	</div>

	<!-- pets + history -->
	<div style="min-width: 0">
		<section class="card mb">
			<div class="card-head">
				<h2><PawPrint size={15} /> Pets</h2>
				<button class="btn btn-sm" onclick={() => addPetOpen = !addPetOpen}>{addPetOpen ? 'Cancel' : '+ Add pet'}</button>
			</div>
			<div class="card-body">
				{#if cust.pets.length === 0}
					<div class="empty-state" style="padding: var(--sp-5)">
						<h3>No pets yet</h3>
						<p>Add a pet to unlock grooming and hotel bookings.</p>
						<button class="btn btn-primary" onclick={() => addPetOpen = true}><Plus size={14} /> Add pet</button>
					</div>
				{:else}
				<div class="pet-grid">
					{#each cust.pets as pet}
						<div class="pet-card">
							<div class="pet-top">
								<span class="pet-avatar"><PawPrint size={18} /></span>
								<div class="pet-name-block">
									<div class="pet-name">{pet.name}</div>
									<div class="pet-breed">{specLabel(pet.species)}{pet.breed ? ` · ${pet.breed}` : ''}{pet.weightKg ? ` · ${pet.weightKg} kg` : ''}</div>
								</div>
							</div>
							<div class="pet-flags">
								{#if pet.aggressive}<span class="flag flag-danger"><ShieldAlert size={12} /> Aggressive</span>{/if}
								{#if pet.allergies}<span class="flag flag-warn"><TriangleAlert size={12} /> {pet.allergies}</span>{/if}
								{#if pet.healthNotes}<span class="flag flag-info"><Star size={12} /> Needs care</span>{/if}
							</div>
							{#if pet.lastVaccinationDate || pet.vaccinationDueDate}
								{@const vi = vaxInfo(pet.vaccineStatus)}
								<div class="vax">
									<span class="badge {vi.cls}"><svelte:component this={vi.Icon} size={12} /> {vi.label}</span>
									<span class="vax-date tiny muted">last {pet.lastVaccinationDate ? fmtDay(pet.lastVaccinationDate) : '—'}{pet.vaccinationDueDate ? ` · due ${fmtDay(pet.vaccinationDueDate)}` : ''}</span>
								</div>
							{/if}
						</div>
					{/each}
				</div>
				{/if}
			</div>
		</section>

		{#if addPetOpen}
		<section class="card mb" style="border-color: var(--primary-soft-2)">
			<div class="card-head"><h2>Add a pet</h2></div>
			<div class="card-body">
				<form method="POST" action="?/addPet">
					{#if addPetError}<div class="alert alert-error">{addPetError}</div>{/if}
					<div class="grid cols-2">
						<div class="field"><label for="name">Name <span class="req">*</span></label><input id="name" name="name" required /></div>
						<div class="field"><label for="species">Species</label>
							<select id="species" name="species">
								<option value="dog">Dog</option><option value="cat">Cat</option><option value="bird">Bird</option>
								<option value="fish">Fish</option><option value="reptile">Reptile</option><option value="other">Other</option>
							</select>
						</div>
						<div class="field"><label for="breed">Breed</label><input id="breed" name="breed" /></div>
						<div class="field"><label for="weightKg">Weight (kg)</label><input id="weightKg" name="weightKg" type="number" step="0.1" min="0" /></div>
						<div class="field"><label for="lastVaccinationDate">Last vaccination</label><input id="lastVaccinationDate" name="lastVaccinationDate" type="date" /></div>
						<div class="field"><label for="vaccinationDueDate">Vaccination due</label><input id="vaccinationDueDate" name="vaccinationDueDate" type="date" /></div>
					</div>
					<div class="field" style="margin-top: var(--sp-1)">
						<label class="check"><input type="checkbox" name="aggressive" style="width:auto" /> Mark as aggressive / needs caution</label>
					</div>
					<div class="field"><label for="allergies">Allergies / health notes</label><textarea id="allergies" name="allergies" rows="2" placeholder="e.g. chicken allergy, skin condition"></textarea></div>
					<div class="row" style="justify-content: flex-end; margin-top: var(--sp-2)">
						<button class="btn" type="button" onclick={() => addPetOpen = false}>Cancel</button>
						<button class="btn btn-primary" type="submit"><Plus size={15} /> Add pet</button>
					</div>
				</form>
			</div>
		</section>
		{/if}

		<section class="card">
			<div class="card-head">
				<h2><History size={15} /> Booking history</h2>
				<a href="/bookings/new?owner={cust.id}" class="btn btn-ghost btn-sm">Book again</a>
			</div>
			<div class="table-wrap">
				{#if (data.history ?? []).length === 0}
					<div class="empty-state">
						<div class="empty-icon"><ReceiptText /></div>
						<h3>No visits yet</h3>
						<p>Grooming, hotel stays, and services will appear here.</p>
					</div>
				{:else}
				<table>
					<thead><tr><th>When</th><th>Type</th><th>Pet</th><th>Service</th><th class="num">Amount</th><th>Status</th></tr></thead>
					<tbody>
					{#each data.history ?? [] as b}
						<tr>
							<td><a class="cell-link" href="/bookings/{b.id}">{fmtWhen(b.startsAt)}</a></td>
							<td><span class="badge kind-{b.kind}">{b.kind}</span></td>
							<td>{b.pet?.name ?? '—'}</td>
							<td class="small">{b.service?.name ?? '—'}</td>
							<td class="num mono">{money(b.priceCents)}</td>
							<td><span class="badge status-{b.status}">{b.status.replace('_', ' ')}</span></td>
						</tr>
					{/each}
					</tbody>
				</table>
				{/if}
			</div>
		</section>
	</div>
</div>

{#if (data.ledgers ?? []).length > 0}
<section class="card" style="margin-top: var(--sp-4)">
	<div class="card-head"><h2><Sparkles size={15} /> Points activity</h2></div>
	<div class="table-wrap">
		<table>
			<thead><tr><th>When</th><th>Type</th><th class="num">Amount</th><th>Note</th></tr></thead>
			<tbody>
			{#each data.ledgers as l}
				<tr>
					<td class="small muted">{fmtWhen(l.createdAt)}</td>
					<td><span class="badge {l.kind === 'earn' ? 'status-valid' : l.kind === 'redeem' ? 'status-checked_in' : 'badge-neutral'}">{l.type} · {l.kind}</span></td>
					<td class="num mono" class:neg={l.amount < 0}>{l.amount > 0 ? `+${l.amount}` : l.amount}</td>
					<td class="small muted">{l.description ?? ''}</td>
				</tr>
			{/each}
			</tbody>
		</table>
	</div>
</section>
{/if}
{/if}

<style>
	.back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; margin-bottom: var(--sp-4); color: var(--muted); }
	.back-link:hover { color: var(--primary); }
	.person-title .person { display: flex; align-items: center; gap: 12px; }
	.avatar.big { width: 46px; height: 46px; font-size: 16px; }
	.avatar.big { background: var(--primary); color: #fff; }
	.profile-grid { grid-template-columns: 320px 1fr; }
	.kv { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 9px; }
	.kv li { display: flex; align-items: center; gap: 9px; font-size: 13.5px; }
	.kv-ic { width: 26px; height: 26px; border-radius: 7px; background: var(--surface-2); color: var(--muted); display: grid; place-items: center; flex-shrink: 0; }
	.points-row { display: flex; align-items: center; gap: 12px; }
	.points-num { font-size: 24px; font-weight: 700; letter-spacing: -0.02em; line-height: 1; }
	.points-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--faint); font-weight: 600; }
	.points-progress { flex: 1; height: 6px; border-radius: 999px; background: var(--surface-3); overflow: hidden; }
	.points-progress-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--primary), #7c6cf4); }
	.pkg-list { display: flex; flex-direction: column; gap: 10px; }
	.pkg { border: 1px solid var(--border); border-radius: var(--r-md); padding: 10px 12px; }
	.pkg-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
	.pkg-name { font-size: 13px; font-weight: 600; }
	.pkg-meta { font-size: 11.5px; color: var(--faint); }
	.pet-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: var(--sp-3); }
	.pet-card { border: 1px solid var(--border); border-radius: var(--r-md); padding: 12px 14px; }
	.pet-top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
	.pet-avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--primary-soft); color: var(--primary); display: grid; place-items: center; flex-shrink: 0; }
	.pet-name { font-size: 14.5px; font-weight: 600; }
	.pet-breed { font-size: 12px; color: var(--muted); }
	.pet-flags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
	.flag { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 6px; }
	.flag-danger { background: var(--danger-bg); color: var(--danger); }
	.flag-warn { background: var(--warning-bg); color: var(--warning); }
	.flag-info { background: var(--info-bg); color: var(--info); }
	.vax { display: flex; align-items: center; justify-content: space-between; gap: 6px; border-top: 1px dashed var(--border); padding-top: 8px; }
	.vax-date { text-align: right; }
</style>
