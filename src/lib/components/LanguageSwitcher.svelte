<script lang="ts">
	import { locales, localeLabels, type Locale } from "$lib/i18n";
	import { Languages } from "@lucide/svelte";

	let {
		value = "en",
		currentPath = "/",
		variant = "segmented"
	}: {
		value: Locale;
		currentPath?: string;
		variant?: "segmented" | "compact";
	} = $props();

	const flags: Record<Locale, string> = {
		en: "🇬🇧",
		id: "🇮🇩"
	};

	const shortLabels: Record<Locale, string> = {
		en: "EN",
		id: "ID"
	};
</script>

<div class="lang-switcher {variant}" data-testid="lang-switcher" role="group" aria-label="Language selection / Pilihan bahasa">
	{#each locales as loc}
		<form method="POST" action="/api/i18n/locale" class="lang-form">
			<input type="hidden" name="redirect" value={currentPath} />
			<input type="hidden" name="locale" value={loc} />
			<button
				type="submit"
				class="lang-pill"
				class:active={value === loc}
				aria-pressed={value === loc}
				title="{localeLabels[loc]} ({shortLabels[loc]})"
				aria-label="Switch to {localeLabels[loc]}"
			>
				<span class="lang-flag" aria-hidden="true">{flags[loc]}</span>
				<span class="lang-code">{shortLabels[loc]}</span>
			</button>
		</form>
	{/each}
</div>

<style>
	.lang-switcher {
		display: inline-flex;
		align-items: center;
		padding: 3px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--r-full);
		gap: 2px;
		box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
	}

	.lang-form {
		margin: 0;
		display: inline-flex;
	}

	.lang-pill {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 4px 9px;
		border: 1px solid transparent;
		border-radius: var(--r-full);
		background: transparent;
		color: var(--muted);
		font-size: 11.5px;
		font-weight: 700;
		letter-spacing: 0.02em;
		cursor: pointer;
		line-height: 1;
		transition: all 130ms cubic-bezier(0.4, 0, 0.2, 1);
		user-select: none;
	}

	.lang-pill:hover:not(.active) {
		color: var(--ink);
		background: var(--surface-3);
	}

	.lang-pill.active {
		background: #ffffff;
		color: var(--primary);
		border-color: var(--primary-border);
		box-shadow: 0 1px 4px rgba(79, 70, 229, 0.12);
	}

	.lang-flag {
		font-size: 12px;
		line-height: 1;
		display: inline-block;
	}

	.lang-code {
		font-size: 11px;
		font-weight: 800;
	}

	@media (max-width: 640px) {
		.lang-pill {
			padding: 4px 7px;
			gap: 4px;
		}
		.lang-flag {
			display: none;
		}
	}
</style>
