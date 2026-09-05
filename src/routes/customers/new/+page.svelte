<script lang="ts">
	let { form } = $props();
</script>

<svelte:head><title>New customer · PetCo</title></svelte:head>

<h1>New customer</h1>

<div class="card" style="max-width: 560px">
	<form method="POST" action="?/create">
		{#if form?.error}<div class="error">{form.error}</div>{/if}
		<div class="form-row">
			<label>First name *<input name="firstName" required value={form?.firstName ?? ''} /></label>
			<label>Last name *<input name="lastName" required value={form?.lastName ?? ''} /></label>
		</div>
		<div class="form-row">
			<label>Phone *<input name="phone" required value={form?.phone ?? ''} /></label>
			<label>Email<input name="email" type="email" value={form?.email ?? ''} /></label>
		</div>
		<hr />
		<p class="small muted">First pet (optional)</p>
		<div class="form-row">
			<label>Pet name<input name="petName" /></label>
			<label>Species
				<select name="species">
					<option value="dog">Dog</option>
					<option value="cat">Cat</option>
					<option value="bird">Bird</option>
					<option value="fish">Fish</option>
					<option value="reptile">Reptile</option>
					<option value="other">Other</option>
				</select>
			</label>
			<label>Breed<input name="breed" /></label>
		</div>
		<div class="row" style="margin-top: 16px">
			<button class="primary" type="submit">Save customer</button>
			<a href="/customers"><button type="button">Cancel</button></a>
		</div>
	</form>
</div>
