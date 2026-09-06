<script lang="ts">
	import { page } from "$app/state";
	import { PawPrint, KeyRound, Mail, Sparkles, ShieldCheck, ArrowRight, AlertCircle } from "@lucide/svelte";
	import { makeT } from "$lib/i18n/t";
	import LanguageSwitcher from "$lib/components/LanguageSwitcher.svelte";

	const form = $derived(page.form);
	const error = $derived(form?.error);
	const t = $derived(makeT(page.data.locale ?? "en"));

	let email = $state('admin@petco.local');
	let password = $state('admin123');
	let isSubmitting = $state(false);

	function fillDemo() {
		email = 'admin@petco.local';
		password = 'admin123';
	}
</script>

<svelte:head>
	<title>{t['auth.loginTitle']()}</title>
</svelte:head>

<div class="login-wrapper">
	<div class="ambient-glow glow-1"></div>
	<div class="ambient-glow glow-2"></div>
	<div class="ambient-glow glow-3"></div>

	<div class="login-container">
		<div class="login-lang">
			<LanguageSwitcher value={page.data.locale ?? "en"} currentPath="/login" />
		</div>
		<div class="login-card">
			<div class="card-brand-head">
				<div class="brand-emblem">
					<PawPrint size={24} strokeWidth={2.5} />
				</div>
				<div class="brand-text">
					<h1>{t['app.name']()} CRM</h1>
					<p>{t['auth.staffPortal']()}</p>
				</div>
			</div>

			<div class="status-strip">
				<span class="status-pulse"></span>
				<span>{t['auth.operational']()}</span>
			</div>

			{#if error}
				<div class="alert alert-error" style="margin: var(--sp-3) 0;">
					<AlertCircle />
					<span>{t['auth.invalidMsg']()}</span>
				</div>
			{/if}

			<form method="POST" action="?/login" onsubmit={() => isSubmitting = true}>
				<div class="field">
					<label for="email">{t['auth.staffEmail']()}</label>
					<div class="input-wrap">
						<Mail size={16} class="input-icon" />
						<input
							id="email"
							name="email"
							type="email"
							placeholder="staff@petco.local"
							autocomplete="username"
							bind:value={email}
							required
						/>
					</div>
				</div>

				<div class="field">
					<label for="password">{t['auth.password']()}</label>
					<div class="input-wrap">
						<KeyRound size={16} class="input-icon" />
						<input
							id="password"
							name="password"
							type="password"
							placeholder="••••••••"
							autocomplete="current-password"
							bind:value={password}
							required
						/>
					</div>
				</div>

				<button class="btn btn-primary submit-btn" type="submit" disabled={isSubmitting}>
					<span>{isSubmitting ? t['auth.signingIn']() : t['auth.signInToConsole']()}</span>
					<ArrowRight size={16} />
				</button>

				<button class="btn demo-btn" type="button" onclick={fillDemo}>
					<Sparkles size={14} />
					<span>{t['auth.fillDemoCreds']()}</span>
				</button>
			</form>

			<div class="login-footer">
				<div class="security-badge">
					<ShieldCheck size={13} />
					<span>{t['auth.securityNote']()}</span>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.login-wrapper {
		min-height: 100vh;
		display: grid;
		place-items: center;
		background: #090d16;
		position: relative;
		overflow: hidden;
		padding: 24px;
		font-family: var(--font-sans);
	}

	.ambient-glow {
		position: absolute;
		border-radius: 50%;
		filter: blur(100px);
		pointer-events: none;
	}

	.glow-1 {
		width: 500px;
		height: 500px;
		background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%);
		top: -100px;
		left: -100px;
	}

	.glow-2 {
		width: 600px;
		height: 600px;
		background: radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%);
		bottom: -150px;
		right: -100px;
	}

	.glow-3 {
		width: 350px;
		height: 350px;
		background: radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%);
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.login-container {
		position: relative;
		width: 100%;
		max-width: 420px;
		z-index: 10;
	}

	.login-lang {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 10px;
		color: #cbd5e1;
	}
	.login-lang :global(.lang select) { color: #cbd5e1; }
	.login-lang :global(.lang-icon) { color: #64748b; }

	.login-card {
		background: rgba(15, 23, 42, 0.85);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: var(--r-2xl);
		padding: 32px 28px;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);
	}

	.card-brand-head {
		display: flex;
		align-items: center;
		gap: 14px;
		margin-bottom: 16px;
	}

	.brand-emblem {
		width: 48px;
		height: 48px;
		border-radius: var(--r-xl);
		background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
		display: grid;
		place-items: center;
		color: #ffffff;
		box-shadow: 0 8px 20px rgba(79, 70, 229, 0.4);
		flex-shrink: 0;
	}

	.brand-text h1 {
		font-size: 22px;
		font-weight: 800;
		letter-spacing: -0.025em;
		color: #ffffff;
		margin: 0;
	}

	.brand-text p {
		font-size: 12px;
		color: #94a3b8;
		margin: 2px 0 0;
	}

	.status-strip {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		padding: 4px 10px;
		border-radius: var(--r-full);
		background: rgba(16, 185, 129, 0.1);
		border: 1px solid rgba(16, 185, 129, 0.2);
		color: #34d399;
		font-size: 11.5px;
		font-weight: 600;
		margin-bottom: 20px;
	}

	.status-pulse {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #10b981;
		box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-bottom: 16px;
	}

	.field label {
		font-size: 12.5px;
		font-weight: 600;
		color: #cbd5e1;
	}

	.input-wrap {
		position: relative;
		width: 100%;
	}

	.input-wrap input {
		width: 100%;
		padding: 10px 14px 10px 38px;
		background: rgba(30, 41, 59, 0.7);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: var(--r-md);
		color: #ffffff;
		font-size: 13.5px;
		transition: all 140ms ease;
	}

	.input-wrap input:focus {
		border-color: #6366f1;
		background: rgba(30, 41, 59, 0.95);
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
		outline: none;
	}

	.input-wrap input::placeholder {
		color: #64748b;
	}

	:global(.input-wrap .input-icon) {
		position: absolute;
		left: 12px;
		top: 50%;
		transform: translateY(-50%);
		color: #64748b;
		pointer-events: none;
	}

	.submit-btn {
		width: 100%;
		padding: 11px 18px;
		font-size: 14px;
		font-weight: 700;
		border-radius: var(--r-md);
		margin-top: 6px;
		background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
		border: none;
		box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);
		transition: all 140ms ease;
	}

	.submit-btn:hover {
		box-shadow: 0 6px 20px rgba(79, 70, 229, 0.55);
		transform: translateY(-1px);
	}

	.demo-btn {
		width: 100%;
		margin-top: 10px;
		padding: 9px 14px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px dashed rgba(255, 255, 255, 0.15);
		color: #cbd5e1;
		font-size: 12.5px;
		border-radius: var(--r-md);
	}

	.demo-btn:hover {
		background: rgba(255, 255, 255, 0.09);
		border-color: rgba(255, 255, 255, 0.25);
		color: #ffffff;
	}

	.login-footer {
		margin-top: 24px;
		padding-top: 16px;
		border-top: 1px solid rgba(255, 255, 255, 0.07);
		display: flex;
		justify-content: center;
	}

	.security-badge {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		font-weight: 500;
		color: #64748b;
	}
</style>
