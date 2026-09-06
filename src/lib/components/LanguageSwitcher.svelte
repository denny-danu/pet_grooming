<script lang="ts">
	import { locales, type Locale } from "$lib/i18n";
	import { Languages } from "@lucide/svelte";

	let {
		value = "en",
		currentPath = "/",
		labels = {}
	}: {
		value: Locale;
		currentPath?: string;
		labels?: Record<string, string>;
	} = $props();

	function submit(form: HTMLFormElement) {
		form.submit();
	}
</script>

<form method="POST" action="/api/i18n/locale" class="lang" data-testid="lang-switcher">
	<input type="hidden" name="redirect" value={currentPath} />
	<Languages size={15} class="lang-icon" />
	<span class="sr-only">Language / Bahasa</span>
	<select
		name="locale"
		value={value}
		aria-label="Language"
		onchange={(e) => submit((e.currentTarget as HTMLSelectElement).form!)}
	>
		{#each locales as locale}
			<option value={locale}>{labels[locale] ?? locale.toUpperCase()}</option>
		{/each}
	</select>
	<noscript><button class="btn btn-sm" type="submit">Go</button></noscript>
</form>

<style>
	.lang { display: inline-flex; align-items: center; gap: 6px; }
	.lang-icon { color: var(--muted); flex-shrink: 0; }
	.lang select {
		width: auto; font-size: 12.5px; font-weight: 600;
		padding: 4px 8px; border-radius: var(--r-sm);
		background: transparent; border: 1px solid transparent; color: inherit;
		cursor: pointer;
	}
	.lang select:hover { border-color: var(--border-strong); }
	.lang select option { color: var(--ink); }
	.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
</style>
