<script lang="ts">
	import { ArrowLeft, UserPlus, PawPrint, User, Phone, Mail, Sparkles, ShieldCheck, AlertCircle, X } from "@lucide/svelte";
	import { page } from "$app/state";
	import DatePicker from "$lib/components/DatePicker.svelte";
	const form = $derived(page.form);
	const error = $derived(form?.error);
	let selectedSpecies = $state('dog');
</script>

<svelte:head>
	<title>New Customer · PetCo</title>
</svelte:head>

<a href="/customers" class="back-link">
	<ArrowLeft size={15} /> Back to Customers
</a>

<div class="page-header">
	<div class="title-block">
		<div class="kicker"><UserPlus size={13} /> Onboarding</div>
		<h1>Register New Customer</h1>
		<p class="subtitle">Create the client profile and optionally register their first pet right away.</p>
	</div>
</div>

<div class="card pad" style="max-width: 720px;">
	<form method="POST" action="?/create" class="stack">
		{#if error}
			<div class="alert alert-error">
				<AlertCircle />
				<span>{error}</span>
			</div>
		{/if}

		<!-- Section 1: Owner Information -->
		<section>
			<div class="row gap-2" style="margin-bottom: var(--sp-4);">
				<div class="step-badge">1</div>
				<h2>Owner / Client Contact Details</h2>
			</div>

			<div class="grid cols-2">
				<div class="field">
					<label for="firstName">First Name <span class="req">*</span></label>
					<input
						id="firstName"
						name="firstName"
						required
						value={form?.firstName ?? ''}
						placeholder="e.g. Sarah"
						autocomplete="given-name"
					/>
				</div>
				<div class="field">
					<label for="lastName">Last Name <span class="req">*</span></label>
					<input
						id="lastName"
						name="lastName"
						required
						value={form?.lastName ?? ''}
						placeholder="e.g. Jenkins"
						autocomplete="family-name"
					/>
				</div>
			</div>

			<div class="grid cols-2">
				<div class="field">
					<label for="phone">Phone Number <span class="req">*</span></label>
					<div class="input-wrap">
						<Phone size={15} class="input-icon" />
						<input
							id="phone"
							name="phone"
							required
							value={form?.phone ?? ''}
							placeholder="+1 555 123 4567"
							autocomplete="tel"
						/>
					</div>
				</div>
				<div class="field">
					<label for="email">Email Address</label>
					<div class="input-wrap">
						<Mail size={15} class="input-icon" />
						<input
							id="email"
							name="email"
							type="email"
							value={form?.email ?? ''}
							placeholder="sarah@example.com"
							autocomplete="email"
						/>
					</div>
				</div>
			</div>
		</section>

		<hr class="divider" />

		<!-- Section 2: First Pet Profile -->
		<section>
			<div class="row gap-2" style="margin-bottom: var(--sp-4);">
				<div class="step-badge">2</div>
				<div>
					<h2>First Pet Profile <span class="tiny faint" style="font-weight: 500;">(Optional)</span></h2>
					<p class="small muted" style="margin: 2px 0 0;">You can also register additional pets anytime from their profile.</p>
				</div>
			</div>

			<div class="grid cols-2">
				<div class="field">
					<label for="petName">Pet Name</label>
					<input id="petName" name="petName" placeholder="e.g. Milo" />
				</div>
				<div class="field">
					<label for="breed">Breed</label>
					<input id="breed" name="breed" placeholder="e.g. French Bulldog" />
				</div>
			</div>

			<div class="field" style="margin-bottom: var(--sp-4);">
				<label for="speciesSelect">Species</label>
				<div class="species-picker-grid">
					<label class="species-card {selectedSpecies === 'dog' ? 'active' : ''}">
						<input type="radio" name="species" value="dog" bind:group={selectedSpecies} class="sr-only" />
						<span class="species-emoji">🐶</span>
						<span class="species-label">Dog</span>
					</label>
					<label class="species-card {selectedSpecies === 'cat' ? 'active' : ''}">
						<input type="radio" name="species" value="cat" bind:group={selectedSpecies} class="sr-only" />
						<span class="species-emoji">🐱</span>
						<span class="species-label">Cat</span>
					</label>
					<label class="species-card {selectedSpecies === 'bird' ? 'active' : ''}">
						<input type="radio" name="species" value="bird" bind:group={selectedSpecies} class="sr-only" />
						<span class="species-emoji">🦜</span>
						<span class="species-label">Bird</span>
					</label>
					<label class="species-card {selectedSpecies === 'fish' ? 'active' : ''}">
						<input type="radio" name="species" value="fish" bind:group={selectedSpecies} class="sr-only" />
						<span class="species-emoji">🐠</span>
						<span class="species-label">Fish</span>
					</label>
					<label class="species-card {selectedSpecies === 'reptile' ? 'active' : ''}">
						<input type="radio" name="species" value="reptile" bind:group={selectedSpecies} class="sr-only" />
						<span class="species-emoji">🦎</span>
						<span class="species-label">Reptile</span>
					</label>
					<label class="species-card {selectedSpecies === 'other' ? 'active' : ''}">
						<input type="radio" name="species" value="other" bind:group={selectedSpecies} class="sr-only" />
						<span class="species-emoji">🐾</span>
						<span class="species-label">Other</span>
					</label>
				</div>
			</div>

			<div class="grid cols-2">
				<div class="field">
					<label for="weightKg">Weight (kg)</label>
					<input id="weightKg" name="weightKg" type="number" step="0.1" placeholder="e.g. 11.2" />
				</div>
				<div class="field">
					<DatePicker
						id="vaccinationDueDate"
						name="vaccinationDueDate"
						label="Vaccination Due Date"
						placeholder="Select vaccination due date..."
					/>
				</div>
			</div>
		</section>

		<div class="card-foot" style="background: none; border: none; padding: var(--sp-2) 0 0; display: flex; align-items: center; justify-content: flex-end; gap: 10px;">
			<a href="/customers" class="btn btn-lg">
				<X size={15} />
				<span>Cancel</span>
			</a>
			<button class="btn btn-primary btn-lg" type="submit">
				<UserPlus size={16} />
				<span>Save Customer &amp; Pet</span>
			</button>
		</div>
	</form>
</div>

<style>
	.step-badge {
		width: 24px;
		height: 24px;
		border-radius: var(--r-full);
		background: var(--primary-soft);
		color: var(--primary);
		font-size: 12px;
		font-weight: 700;
		display: grid;
		place-items: center;
		flex-shrink: 0;
	}

	.species-picker-grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 8px;
		margin-top: 4px;
	}

	.species-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		padding: 10px 6px;
		border-radius: var(--r-md);
		border: 1.5px solid var(--border);
		background: var(--surface);
		cursor: pointer;
		transition: all 130ms ease;
		user-select: none;
	}

	.species-card:hover {
		border-color: var(--primary-border);
		background: var(--surface-2);
	}

	.species-card.active {
		border-color: var(--primary);
		background: var(--primary-soft);
		box-shadow: 0 0 0 1px var(--primary);
	}

	.species-emoji {
		font-size: 20px;
		line-height: 1;
	}

	.species-label {
		font-size: 11.5px;
		font-weight: 600;
		color: var(--ink-2);
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

	@media (max-width: 680px) {
		.species-picker-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
