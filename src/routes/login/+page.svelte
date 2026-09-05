<script lang="ts">
	import { page } from "$app/state";
	const form = $derived(page.form);
	const error = $derived(form?.error);
</script>

<div class="login-wrap">
	<form method="POST" action="?/login" class="card login">
		<h1>🐾 PetCo</h1>
		<p class="muted">Pet CRM · Booking · Membership</p>
		<label>Email
			<input name="email" type="email" placeholder="you@petco.local" autocomplete="username" />
		</label>
		<label>Password
			<input name="password" type="password" placeholder="••••••" autocomplete="current-password" />
		</label>
		{#if error}
			<div class="error">{error}</div>
		{/if}
		<button class="primary">Sign in</button>
	</form>
</div>

<style>
	.login-wrap {
		display: grid;
		place-items: center;
		min-height: 100vh;
		background: #0f1220;
	}
	.login {
		width: 340px;
		background: #fff;
		border-radius: 12px;
		box-shadow: 0 12px 40px rgba(0,0,0,.3);
	}
	.login h1 { margin: 0 0 4px; }
	.login button { margin-top: 16px; width: 100%; }
	label { display: block; margin: 12px 0; font-size: 14px; }
	label input { width: 100%; margin-top: 4px; }
</style>
