<script lang="ts">
	import { X } from "@lucide/svelte";
	import type { Snippet } from "svelte";

	let {
		open = $bindable(false),
		title,
		subtitle,
		maxWidth = "600px",
		children
	}: {
		open: boolean;
		title: string;
		subtitle?: string;
		maxWidth?: string;
		children?: Snippet;
	} = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Escape") {
			open = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div class="modal-backdrop" onclick={() => open = false} role="button" tabindex="0" aria-label="Close modal">
		<div
			class="modal-card"
			style="max-width: {maxWidth};"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			tabindex="-1"
			aria-labelledby="modal-title"
		>
			<div class="modal-header">
				<div>
					<h2 id="modal-title">{title}</h2>
					{#if subtitle}
						<p class="small muted" style="margin: 2px 0 0;">{subtitle}</p>
					{/if}
				</div>
				<button class="btn btn-ghost btn-sm" type="button" onclick={() => open = false} aria-label="Close">
					<X size={16} />
				</button>
			</div>

			<div class="modal-body">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(15, 23, 42, 0.65);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		display: grid;
		place-items: center;
		padding: 20px;
		z-index: 999;
	}

	.modal-card {
		width: 100%;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-xl);
		box-shadow: var(--shadow-xl);
		overflow: hidden;
		animation: modalPop 160ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.modal-header {
		padding: 16px 20px;
		border-bottom: 1px solid var(--border);
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: var(--surface);
	}

	.modal-header h2 {
		font-size: 16px;
		font-weight: 700;
		color: var(--ink);
		margin: 0;
	}

	.modal-body {
		padding: 20px;
		max-height: 80vh;
		overflow-y: auto;
	}

	@keyframes modalPop {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(10px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}
</style>
