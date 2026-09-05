<script lang="ts">
	import type { Component } from "svelte";

	let {
		title,
		value,
		trend,
		trendUp = true,
		icon: IconComponent,
		tint = "purple",
		subtitle
	}: {
		title: string;
		value: string | number;
		trend?: string;
		trendUp?: boolean;
		icon?: Component<{ size?: number }>;
		tint?: "purple" | "green" | "blue" | "amber";
		subtitle?: string;
	} = $props();
</script>

<div class="stat-card">
	<div class="stat-top">
		<div class="stat-icon {tint}">
			{#if IconComponent}
				<IconComponent size={18} />
			{/if}
		</div>
		{#if trend}
			<span class="stat-trend {trendUp ? 'up' : 'neutral'}">{trend}</span>
		{/if}
	</div>
	<div class="stat-value">{value}</div>
	<div class="stat-label">{title}</div>
	{#if subtitle}
		<div class="tiny faint" style="margin-top: 2px;">{subtitle}</div>
	{/if}
</div>
