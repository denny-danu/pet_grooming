<script lang="ts">
	import { page } from "$app/state";
	import { PawPrint, KeyRound, Mail, Sparkles } from "@lucide/svelte";
	const form = $derived(page.form);
	const error = $derived(form?.error);
	let email = $state('admin@petco.local');
	let password = $state('admin123');
</script>

<div class="login-wrap">
	<div class="backdrop"></div>
	<div class="login-card">
		<div class="head">
			<span class="brand-mark"><PawPrint size={20} strokeWidth={2.2} /></span>
			<div>
				<h1>PetCo</h1>
				<p>Staff sign-in · CRM, bookings &amp; membership</p>
			</div>
		</div>

		<form method="POST" action="?/login">
			{#if error}
				<div class="alert alert-error">Error signing in — check your email and password.</div>
			{/if}

			<div class="field">
				<label for="email">Email</label>
				<div class="input-wrap">
					<Mail size={15} class="input-icon" />
					<input id="email" name="email" type="email" placeholder="you@petco.local" autocomplete="username" bind:value={email} />
				</div>
			</div>

			<div class="field">
				<label for="password">Password</label>
				<div class="input-wrap">
					<KeyRound size={15} class="input-icon" />
					<input id="password" name="password" type="password" placeholder="••••••••" autocomplete="current-password" bind:value={password} />
				</div>
			</div>

			<button class="btn btn-primary btn-lg submit" type="submit">Sign in</button>

			<button class="btn demo" type="button" onclick={() => { email = 'admin@petco.local'; password = 'admin123'; }}>
				<Sparkles size={14} /> Fill demo credentials
			</button>
		</form>

		<p class="foot-note">
			Demo access is prefilled — just press <strong>Sign in</strong>.
		</p>
	</div>
</div>

<style>
	.login-wrap {
		position: relative;
		display: grid; place-items: center;
		min-height: 100vh;
		background: #0f1220;
		overflow: hidden;
		padding: 24px;
	}
	.backdrop {
		position: absolute; inset: 0;
		background:
			radial-gradient(700px 480px at 15% -10%, rgba(109, 94, 242, 0.35), transparent 60%),
			radial-gradient(640px 420px at 105% 110%, rgba(79, 70, 229, 0.28), transparent 55%);
	}
	.login-card {
		position: relative;
		width: 100%; max-width: 372px;
		background: var(--surface);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: var(--r-xl);
		box-shadow: var(--shadow-lg);
		padding: var(--sp-6);
	}
	.head { display: flex; align-items: center; gap: 12px; margin-bottom: var(--sp-6); }
	.brand-mark {
		width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
		background: linear-gradient(135deg, #6d5ef2, #4f46e5);
		color: #fff; display: grid; place-items: center;
		box-shadow: var(--shadow-md);
	}
	.head h1 { font-size: 19px; margin: 0; }
	.head p { margin: 2px 0 0; font-size: 12.5px; color: var(--muted); }
	.input-wrap { position: relative; }
	.input-wrap input { padding-left: 34px; }
	.input-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--faint); pointer-events: none; }
	.submit { width: 100%; margin-top: 6px; }
	.demo { width: 100%; margin-top: 8px; background: var(--surface-2); border-style: dashed; }
	.demo:hover { background: var(--surface-3); }
	.foot-note { text-align: center; font-size: 12px; color: var(--faint); margin: 16px 0 0; }
</style>
