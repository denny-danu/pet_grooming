<script lang="ts">
	let {
		name,
		species = "dog",
		breed,
		size = "md"
	}: {
		name?: string;
		species?: string;
		breed?: string | null;
		size?: "sm" | "md" | "lg";
	} = $props();

	function getEmoji(s: string | undefined) {
		if (s === "cat") return "🐱";
		if (s === "bird") return "🦜";
		if (s === "fish") return "🐠";
		if (s === "reptile") return "🦎";
		return "🐶";
	}
</script>

<div class="pet-avatar-wrapper size-{size}">
	<span class="pet-emoji">{getEmoji(species)}</span>
	{#if name}
		<div class="pet-info-col">
			<div class="pet-avatar-name">{name}</div>
			{#if breed}
				<div class="pet-avatar-sub">{breed}</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.pet-avatar-wrapper {
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}

	.pet-emoji {
		display: grid;
		place-items: center;
		border-radius: var(--r-md);
		background: var(--surface-3);
		flex-shrink: 0;
		line-height: 1;
	}

	.size-sm .pet-emoji {
		width: 26px;
		height: 26px;
		font-size: 13px;
	}

	.size-md .pet-emoji {
		width: 32px;
		height: 32px;
		font-size: 16px;
	}

	.size-lg .pet-emoji {
		width: 40px;
		height: 40px;
		font-size: 20px;
	}

	.pet-info-col {
		min-width: 0;
	}

	.pet-avatar-name {
		font-size: 13px;
		font-weight: 700;
		color: var(--ink);
	}

	.pet-avatar-sub {
		font-size: 11.5px;
		color: var(--muted);
	}
</style>
