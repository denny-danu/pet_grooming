<script lang="ts">
	import { Star, Scissors, Smile, Tag, Pencil, Trash2 } from "@lucide/svelte";
	import { formatDate, getBehaviorLabel } from "$lib/ui/grooming";
	import PetAvatar from "$lib/components/PetAvatar.svelte";

	type CutCard = {
		id: number;
		petName: string;
		petSpecies?: string | null;
		petBreed?: string | null;
		ownerId: number;
		ownerFirstName?: string | null;
		ownerLastName?: string | null;
		ownerPhone?: string | null;
		behaviorScore?: number | null;
		bladeLengthBody?: string | null;
		bladeLengthFace?: string | null;
		scissorNotes?: string | null;
		coatCondition?: string | null;
		skinIssues?: string | null;
		staffName?: string | null;
		createdAt: Date | string;
	};

	let {
		card,
		onEdit
	}: { card: CutCard; onEdit: (card: CutCard) => void } = $props();

	const behavior = $derived(getBehaviorLabel(card.behaviorScore));
</script>

<div class="card cut-card">
	<div class="cut-card-top spread">
		<div class="pet-header-info">
			<PetAvatar name={card.petName} species={card.petSpecies ?? undefined} breed={card.petBreed ?? undefined} size="md" />
		</div>
		<div class="behavior-pill {behavior.variant}">
			<div class="stars-row">
				{#each Array(5) as _, i}
					<Star
						size={11}
						fill={i < (card.behaviorScore ?? 5) ? 'currentColor' : 'none'}
						class={i < (card.behaviorScore ?? 5) ? 'star-filled' : 'star-empty'}
					/>
				{/each}
			</div>
			<span class="behavior-text">{behavior.text}</span>
		</div>
	</div>

	<div class="owner-chip">
		<span class="tiny-label">Owner:</span>
		<a href="/customers/{card.ownerId}" class="owner-name cell-link">{card.ownerFirstName} {card.ownerLastName}</a>
		<span class="owner-phone mono">({card.ownerPhone})</span>
	</div>

	<hr class="card-divider" />

	<div class="specs-body stack-sm">
		<div class="spec-block purple-tint">
			<div class="spec-label"><Scissors size={13} class="icon-indigo" /><span>Body Blade / Length:</span></div>
			<div class="spec-value cell-strong">{card.bladeLengthBody || 'Standard Breed Clip'}</div>
		</div>

		{#if card.bladeLengthFace}
			<div class="spec-block blue-tint">
				<div class="spec-label"><Smile size={13} class="icon-blue" /><span>Face &amp; Head Blueprint:</span></div>
				<div class="spec-value">{card.bladeLengthFace}</div>
			</div>
		{/if}

		{#if card.scissorNotes}
			<div class="spec-block neutral-tint">
				<div class="spec-label"><Tag size={13} class="muted" /><span>Scissor Finishing &amp; Shape:</span></div>
				<div class="spec-value small">{card.scissorNotes}</div>
			</div>
		{/if}

		{#if card.coatCondition || card.skinIssues}
			<div class="health-notes-box">
				{#if card.coatCondition}
					<div class="health-line"><span class="health-label">Coat:</span><span class="health-val">{card.coatCondition}</span></div>
				{/if}
				{#if card.skinIssues}
					<div class="health-line">
						<span class="health-label text-danger">Skin Care:</span>
						<span class="health-val text-danger">{card.skinIssues}</span>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<div class="cut-card-footer spread">
		<div class="stylist-stamp small muted">
			{#if card.staffName}
				<span>Stylist: <strong>{card.staffName}</strong></span>
			{:else}
				<span>General Salon Specs</span>
			{/if}
			<span class="date-stamp mono"> · {formatDate(card.createdAt)}</span>
		</div>

		<div class="row gap-1">
			<button class="btn btn-sm btn-ghost" type="button" title="Edit Styling Specs" onclick={() => onEdit(card)}>
				<Pencil size={13} />
				<span>Edit</span>
			</button>
			<form
				method="POST"
				action="?/deleteCutCard"
				onsubmit={(e) => {
					if (!confirm(`Delete grooming cut card for ${card.petName}?`)) e.preventDefault();
				}}
			>
				<input type="hidden" name="id" value={card.id} />
				<button class="btn btn-sm btn-ghost text-danger" type="submit" title="Delete Cut Card">
					<Trash2 size={13} />
				</button>
			</form>
		</div>
	</div>
</div>

<style>
	.cut-card { padding: 16px; display: flex; flex-direction: column; gap: 10px; transition: all 140ms ease; }
	.cut-card:hover { box-shadow: var(--shadow-sm); border-color: var(--border-strong); }
	.cut-card-top { align-items: flex-start; }
	.behavior-pill { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; padding: 4px 8px; border-radius: var(--r-md); font-size: 11px; font-weight: 700; }
	.stars-row { display: flex; align-items: center; gap: 1px; color: #f59e0b; }
	.owner-chip { display: flex; align-items: center; gap: 6px; font-size: 12px; }
	.tiny-label { color: var(--muted); font-size: 11px; }
	.owner-phone { color: var(--faint); font-size: 11px; }
	.card-divider { height: 1px; background: var(--border-subtle); border: none; margin: 2px 0; }
	.spec-block { padding: 8px 10px; border-radius: var(--r-md); border: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 2px; }
	.purple-tint { background: var(--purple-bg); border-color: var(--purple-border); }
	.blue-tint { background: var(--info-bg); border-color: var(--info-border); }
	.neutral-tint { background: var(--surface-2); }
	.spec-label { display: flex; align-items: center; gap: 5px; font-size: 10.5px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
	.spec-value { font-size: 12.5px; color: var(--ink); }
	.health-notes-box { background: var(--surface-2); border: 1px solid var(--border-subtle); border-radius: var(--r-md); padding: 8px 10px; display: flex; flex-direction: column; gap: 4px; }
	.health-line { font-size: 12px; }
	.health-label { font-weight: 700; margin-right: 4px; }
	.cut-card-footer { margin-top: auto; padding-top: 10px; border-top: 1px solid var(--border-subtle); align-items: center; }
	.date-stamp { color: var(--faint); }
</style>
