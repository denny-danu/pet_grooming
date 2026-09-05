<script lang="ts">
	let { data, form } = $props();
	const money = (c: number) => `$${(c / 100).toFixed(2)}`;
	const fmtDate = (d: Date | string | null) => (d ? new Date(d).toLocaleDateString() : '—');
	const fmtWhen = (d: Date | string) => new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	const cust = $derived(data.customer);
</script>

<svelte:head><title>{cust?.firstName ?? 'Customer'} · PetCo</title></svelte:head>

{#if data.notFound}
	<div class="empty">Customer not found</div>
{:else if cust}
<div class="spread">
	<h1>{cust.firstName} {cust.lastName}</h1>
	<a href="/bookings/new?owner={cust.id}"><button class="primary">+ New booking</button></a>
</div>

<div class="grid cols-3">
	<section class="card">
		<h2>Contact</h2>
		<p>{cust.phone}{cust.email ? ` · ${cust.email}` : ''}</p>
		<p class="small muted">{cust.address ?? ''}</p>
		<p class="small">Tier: <span class="badge">{data.account?.tier ?? 'silver'}</span></p>
		<p class="small">Points: <strong>{data.account?.pointsBalance ?? 0}</strong></p>
	</section>

	<section class="card">
		<h2>Pets</h2>
		{#each cust.pets as pet}
			<div class="row pet-row">
				<div>
					<strong>{pet.name}</strong>
					<span class="small muted"> · {pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</span>
					<div class="small muted">
						<span class="badge {pet.vaccineStatus}">{pet.vaccineStatus}</span>
						{#if pet.aggressive}<span class="badge expired">aggressive</span>{/if}
						{#if pet.allergies}<span class="badge pending">allergy: {pet.allergies}</span>{/if}
					</div>
				</div>
			</div>
		{/each}
		<hr />
		<form method="POST" action="?/addPet">
			<p class="small muted">Add pet</p>
			{#if form?.addPetError}<div class="error">{form.addPetError}</div>{/if}
			<div class="form-row">
				<label>Name<input name="name" /></label>
				<label>Species
					<select name="species"><option value="dog">Dog</option><option value="cat">Cat</option><option value="bird">Bird</option><option value="fish">Fish</option><option value="reptile">Reptile</option><option value="other">Other</option></select>
				</label>
			</div>
			<div class="form-row">
				<label>Breed<input name="breed" /></label>
				<label>Weight kg<input name="weightKg" type="number" step="0.1" /></label>
			</div>
			<label>Vaccination due date<input name="vaccinationDueDate" type="date" /></label>
			<div class="row">
				<label class="check"><input type="checkbox" name="aggressive" /> Aggressive</label>
			</div>
			<button class="primary" type="submit">Add pet</button>
		</form>
	</section>

	<section class="card">
		<h2>Packages</h2>
		{#if !data.packages || data.packages.length === 0}<div class="empty small">No packages</div>{/if}
		{#each data.packages ?? [] as p}
			<div class="row">
				<div>
					<strong>{p.packageName}</strong>
					<div class="small muted">{p.creditsRemaining}/{p.creditsIssued} credits left</div>
				</div>
				<span class="badge {p.creditsRemaining > 0 ? 'valid' : 'cancelled'}">{p.kind}</span>
			</div>
		{/each}
		<hr />
		<form method="POST" action="?/buyPackage">
			<p class="small muted">Sell a package</p>
			<select name="packageId">
				{#each data.catalog ?? [] as pkg}
					<option value={pkg.id}>{pkg.name} · {pkg.credits} credits · ${(pkg.priceCents/100).toFixed(2)}</option>
				{/each}
			</select>
			<button class="primary" type="submit" style="margin-top:8px">Sell package</button>
		</form>
	</section>
</div>

<section class="card">
	<h2>Booking history</h2>
	{#if !data.history || data.history.length === 0}<div class="empty">No bookings yet</div>{/if}
	<table>
		<thead><tr><th>When</th><th>Kind</th><th>Pet</th><th>Service</th><th>Amount</th><th>Status</th></tr></thead>
		<tbody>
		{#each data.history ?? [] as b}
			<tr>
				<td><a href="/bookings/{b.id}">{fmtWhen(b.startsAt)}</a></td>
				<td><span class="badge {b.kind}">{b.kind}</span></td>
				<td>{b.pet?.name ?? '—'}</td>
				<td>{b.service?.name ?? '—'}</td>
				<td>{money(b.priceCents)}</td>
				<td><span class="badge {b.status}">{b.status}</span></td>
			</tr>
		{/each}
		</tbody>
	</table>
</section>

{#if data.ledgers && data.ledgers.length > 0}
<section class="card">
	<h2>Ledger activity</h2>
	<table>
		<thead><tr><th>When</th><th>Type</th><th>Kind</th><th>Amount</th><th>Description</th></tr></thead>
		<tbody>
		{#each data.ledgers as l}
			<tr>
				<td>{fmtWhen(l.createdAt)}</td>
				<td><span class="badge">{l.type}</span></td>
				<td>{l.kind}</td>
				<td class={l.amount < 0 ? 'neg' : ''}>{l.amount}</td>
				<td class="small muted">{l.description ?? ''}</td>
			</tr>
		{/each}
		</tbody>
	</table>
</section>
{/if}

<style>
	.neg { color: var(--red); }
	.pet-row { margin: 6px 0; }
</style>
{/if}
