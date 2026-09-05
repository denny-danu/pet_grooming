<script lang="ts">
	import { ArrowLeft, UserPlus, PawPrint } from "@lucide/svelte";
	import { page } from "$app/state";
	const form = $derived(page.form);
	const error = $derived(form?.error);
</script>

<svelte:head><title>New customer · PetCo</title></svelte:head>

<a href="/customers" class="back-link"><ArrowLeft size={15} /> Customers</a>

<div class="page-header">
	<div class="title-block">
		<h1>New customer</h1>
		<p>Create the owner record — add pets after saving or right here.</p>
	</div>
</div>

<div class="card pad" style="max-width: 640px">
	<form method="POST" action="?/create">
		{#if error}<div class="alert alert-error">Please fill the required fields.</div>{/if}

		<h2 style="margin-bottom: var(--sp-3)">Owner details</h2>
		<div class="grid cols-2">
			<div class="field">
				<label for="firstName">First name <span class="req">*</span></label>
				<input id="firstName" name="firstName" required value={form?.firstName ?? ''} autocomplete="given-name" />
			</div>
			<div class="field">
				<label for="lastName">Last name <span class="req">*</span></label>
				<input id="lastName" name="lastName" required value={form?.lastName ?? ''} autocomplete="family-name" />
			</div>
			<div class="field">
				<label for="phone">Phone <span class="req">*</span></label>
				<input id="phone" name="phone" required value={form?.phone ?? ''} placeholder="+1 555 000 0000" autocomplete="tel" />
			</div>
			<div class="field">
				<label for="email">Email</label>
				<input id="email" name="email" type="email" value={form?.email ?? ''} autocomplete="email" />
			</div>
		</div>

		<hr class="divider" />

		<div class="section-title">
			<h2><PawPrint size={15} /> First pet <span class="tiny faint" style="font-weight: 400">(optional)</span></h2>
		</div>
		<div class="grid cols-3">
			<div class="field">
				<label for="petName">Pet name</label>
				<input id="petName" name="petName" />
			</div>
			<div class="field">
				<label for="species">Species</label>
				<select id="species" name="species">
					<option value="dog">Dog</option>
					<option value="cat">Cat</option>
					<option value="bird">Bird</option>
					<option value="fish">Fish</option>
					<option value="reptile">Reptile</option>
					<option value="other">Other</option>
				</select>
			</div>
			<div class="field">
				<label for="breed">Breed</label>
				<input id="breed" name="breed" />
			</div>
		</div>

		<div class="card-foot" style="margin-top: var(--sp-4); padding-left: 0; padding-right: 0; background: none">
			<a href="/customers"><button class="btn" type="button">Cancel</button></a>
			<button class="btn btn-primary" type="submit"><UserPlus size={15} /> Save customer</button>
		</div>
	</form>
</div>

<style>
	.back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; margin-bottom: var(--sp-4); color: var(--muted); }
	.back-link:hover { color: var(--primary); }
</style>
