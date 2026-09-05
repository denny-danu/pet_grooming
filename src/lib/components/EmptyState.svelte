<script lang="ts">
	import type { Component, Snippet } from "svelte";
	import { Inbox } from "@lucide/svelte";

	let {
		title = "No data found",
		description = "Nothing to display at this moment.",
		icon: IconComponent = Inbox,
		children
	}: {
		title?: string;
		description?: string;
		icon?: Component<{ size?: number }>;
		children?: Snippet;
	} = $props();
</script>

<div class="empty-state">
	<div class="empty-icon">
		<IconComponent size={24} />
	</div>
	<h3>{title}</h3>
	<p>{description}</p>
	{#if children}
		<div class="row gap-2" style="margin-top: 4px;">
			{@render children()}
		</div>
	{/if}
</div>
