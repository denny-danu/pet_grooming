<script lang="ts">
	import { page } from "$app/state";
	import { makeT } from "$lib/i18n/t";
	import {
		Scissors,
		Plus,
		Sparkles,
		Star,
		Search,
		UserCheck,
		Pencil,
		Trash2,
		Clock,
		AlertCircle,
		CheckCircle2,
		Tag,
		ShieldCheck,
		Heart,
		Info,
		Calendar,
		Filter,
		Layers,
		X,
		Save,
		User,
		Phone,
		Smile,
		Frown,
		Users,
		CalendarPlus,
		Check
	} from "@lucide/svelte";

	import Modal from "$lib/components/Modal.svelte";
	import StatCard from "$lib/components/StatCard.svelte";
	import Badge from "$lib/components/Badge.svelte";
	import EmptyState from "$lib/components/EmptyState.svelte";
	import PetAvatar from "$lib/components/PetAvatar.svelte";
	import CutCard from "$lib/components/grooming/CutCard.svelte";
	import { formatRupiah as money } from "$lib/util";

	let { data } = $props();
	const t = $derived(makeT(page.data.locale ?? "en"));

	// Modal States
	let cutCardModalOpen = $state(false);
	let addonModalOpen = $state(false);
	let editingCard = $state<any | null>(null);

	// Form values for Cut Card modal
	let formPetId = $state<number | null>(null);
	let formStaffId = $state<number | null>(null);
	let formBladeBody = $state<string>("");
	let formBladeFace = $state<string>("");
	let formScissorNotes = $state<string>("");
	let formCoatCondition = $state<string>("");
	let formBehaviorScore = $state<number>(5);
	let formSkinIssues = $state<string>("");

	// Filter & Search States
	let searchQuery = $state("");
	let filterScore = $state<string>("all");
	let filterSpecies = $state<string>("all");

	// Derived form errors from action
	const formResult = $derived(page.form);
	const saveError = $derived(formResult?.saveCutCardError);
	const addonError = $derived(formResult?.createAddonError);
	const actionSuccess = $derived(formResult?.success);

	// Quick Presets
	const bladeBodyPresets = [
		"#7F (3.2mm) Teddy / Summer Cut",
		"#10 (1.5mm) Sanitary & Short Clip",
		"#5F (6.3mm) Medium Plush Coat",
		"#4F (9.5mm) Fluffy Puppy Length",
		"1/2 in Comb Guard (13mm)",
		"Hand Scissor / Full Fluff Finish"
	];

	const bladeFacePresets = [
		"Round Teddy Bear Face & Muzzle",
		"Asian Fusion Rounded Muzzle & Long Ears",
		"Clean Shaved Poodle Muzzle & Neck",
		"Schnauzer Eyebrows & Full Beard",
		"Lion Cut Mane & Clean Face",
		"Natural Breed Head Trim"
	];

	const coatPresets = [
		"Clean, smooth, mat-free coat",
		"Dense double coat with shedding undercoat",
		"Slight tangles behind ears & tail base",
		"Matted coat (requires dematting / pre-shave)",
		"Dry, brittle coat (requires deep conditioner)"
	];

	function openCreateCutCardModal() {
		editingCard = null;
		formPetId = data.petsList.length > 0 ? data.petsList[0].id : null;
		formStaffId = data.staffList.length > 0 ? data.staffList[0].id : null;
		formBladeBody = "#7F (3.2mm) Teddy / Summer Cut";
		formBladeFace = "Round Teddy Bear Face & Muzzle";
		formScissorNotes = "Scissor legs into straight columns, round paws into neat pom-poms, feather tail.";
		formCoatCondition = "Clean, smooth, mat-free coat";
		formBehaviorScore = 5;
		formSkinIssues = "None observed. Normal healthy skin.";
		cutCardModalOpen = true;
	}

	function openEditCutCardModal(card: any) {
		editingCard = card;
		formPetId = card.petId;
		formStaffId = card.staffId;
		formBladeBody = card.bladeLengthBody || "";
		formBladeFace = card.bladeLengthFace || "";
		formScissorNotes = card.scissorNotes || "";
		formCoatCondition = card.coatCondition || "";
		formBehaviorScore = card.behaviorScore || 5;
		formSkinIssues = card.skinIssues || "";
		cutCardModalOpen = true;
	}

	function getBehaviorLabel(score: number | null | undefined) {
		const s = score ?? 5;
		if (s >= 5) return { text: "Calm & Angelic", variant: "badge-success", desc: "Cooperative throughout bath and styling" };
		if (s === 4) return { text: "Cooperative", variant: "badge-info", desc: "Good tolerance, minor squirming during nails" };
		if (s === 3) return { text: "Fidgety", variant: "badge-warning", desc: "Sensitive to dryer / paws, requires extra patience" };
		if (s === 2) return { text: "High Anxiety", variant: "badge-purple", desc: "Nervous trembling, use gentle soothing touch" };
		return { text: "Reactive / Bite Risk", variant: "badge-danger", desc: "Muzzle recommended, handle with 2 groomers" };
	}

	// Filtered cut cards
	const filteredCutCards = $derived(
		data.cutCards.filter((card) => {
			const q = searchQuery.toLowerCase().trim();
			const matchesSearch =
				!q ||
				card.petName.toLowerCase().includes(q) ||
				(card.petBreed && card.petBreed.toLowerCase().includes(q)) ||
				`${card.ownerFirstName} ${card.ownerLastName}`.toLowerCase().includes(q) ||
				(card.bladeLengthBody && card.bladeLengthBody.toLowerCase().includes(q)) ||
				(card.bladeLengthFace && card.bladeLengthFace.toLowerCase().includes(q)) ||
				(card.scissorNotes && card.scissorNotes.toLowerCase().includes(q)) ||
				(card.staffName && card.staffName.toLowerCase().includes(q));

			const score = card.behaviorScore ?? 5;
			const matchesScore =
				filterScore === "all"
					? true
					: filterScore === "5"
					? score === 5
					: filterScore === "4"
					? score === 4
					: filterScore === "3_below"
					? score <= 3
					: true;

			const matchesSpecies =
				filterSpecies === "all"
					? true
					: card.petSpecies === filterSpecies;

			return matchesSearch && matchesScore && matchesSpecies;
		})
	);
</script>

<svelte:head>
	<title>Grooming Cut Cards &amp; Styling Dossiers · PetCo CRM</title>
</svelte:head>

<div class="page-header">
	<div class="title-block">
		<div class="kicker">
			<Scissors size={13} />
			<span>Styling &amp; Salon Dossiers</span>
		</div>
		<h1>{t['gc.title']()}</h1>
		<p class="subtitle">
			Pet styling records, blade lengths, custom scissor finishing blueprints, temperament ratings, and salon add-on treatments.
		</p>
	</div>
	<div class="actions">
		<button class="btn" type="button" onclick={() => addonModalOpen = true}>
			<Sparkles size={15} />
			<span>Add Treatment Service</span>
		</button>
		<button class="btn btn-primary" type="button" onclick={openCreateCutCardModal}>
			<Plus size={15} />
			<span>Record Styling Specs</span>
		</button>
	</div>
</div>

{#if actionSuccess}
	<div class="alert alert-success mb">
		<CheckCircle2 size={16} />
		<span>Styling dossier updated successfully!</span>
	</div>
{/if}

{#if saveError || addonError}
	<div class="alert alert-error mb">
		<AlertCircle size={16} />
		<span>{saveError || addonError}</span>
	</div>
{/if}

<!-- Metrics Summary Strip -->
<div class="stat-grid mb">
	<StatCard
		title="Cut Cards Recorded"
		value={data.totalCutCards}
		icon={Scissors}
		tint="purple"
		subtitle="Tailored styling profiles on file"
	/>
	<StatCard
		title="Average Behavior Score"
		value="{data.avgBehaviorScore} / 5.0"
		icon={Star}
		tint="amber"
		subtitle="Salon temperament average"
	/>
	<StatCard
		title="Active Stylists &amp; Groomers"
		value={data.activeGroomersCount}
		icon={Users}
		tint="blue"
		subtitle="Certified salon team members"
	/>
	<StatCard
		title="Add-on Spa Services"
		value={data.addonsCount}
		icon={Sparkles}
		tint="green"
		subtitle="Active salon upgrades &amp; treatments"
	/>
</div>

<!-- Search & Filter Controls -->
<div class="card mb">
	<div class="toolbar spread">
		<div class="search-box">
			<Search size={15} class="search-icon" />
			<input
				type="search"
				placeholder="Search by pet name, breed, owner, blade #, stylist..."
				bind:value={searchQuery}
			/>
			{#if searchQuery}
				<button class="search-clear" type="button" onclick={() => searchQuery = ""} aria-label="Clear search">
					<X size={14} />
				</button>
			{/if}
		</div>

		<div class="row gap-3">
			<div class="row gap-1">
				<span class="small faint font-semibold">Species:</span>
				<div class="segmented">
					<button
						class={filterSpecies === 'all' ? 'active' : ''}
						type="button"
						onclick={() => filterSpecies = 'all'}
					>
						All
					</button>
					<button
						class={filterSpecies === 'dog' ? 'active' : ''}
						type="button"
						onclick={() => filterSpecies = 'dog'}
					>
						🐶 Dogs
					</button>
					<button
						class={filterSpecies === 'cat' ? 'active' : ''}
						type="button"
						onclick={() => filterSpecies = 'cat'}
					>
						🐱 Cats
					</button>
				</div>
			</div>

			<div class="row gap-1">
				<span class="small faint font-semibold">Behavior:</span>
				<div class="segmented">
					<button
						class={filterScore === 'all' ? 'active' : ''}
						type="button"
						onclick={() => filterScore = 'all'}
					>
						All
					</button>
					<button
						class={filterScore === '5' ? 'active' : ''}
						type="button"
						onclick={() => filterScore = '5'}
					>
						5★ Angelic
					</button>
					<button
						class={filterScore === '4' ? 'active' : ''}
						type="button"
						onclick={() => filterScore = '4'}
					>
						4★ Good
					</button>
					<button
						class={filterScore === '3_below' ? 'active' : ''}
						type="button"
						onclick={() => filterScore = '3_below'}
					>
						≤3★ Caution
					</button>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Grooming Cut Cards Section -->
<section class="section-block mb">
	<div class="section-title">
		<h2>
			<Scissors size={18} class="primary" />
			<span>Pet Styling Cut Cards ({filteredCutCards.length})</span>
		</h2>
	</div>

	{#if filteredCutCards.length === 0}
		<div class="card pad-lg">
			<EmptyState
				title="No Grooming Cut Cards Found"
				description={searchQuery || filterScore !== 'all' || filterSpecies !== 'all'
					? "No cut cards matched the active filters. Try adjusting your query."
					: "No styling cut cards have been recorded yet. Document your first pet grooming specs."}
				icon={Scissors}
			>
				<button class="btn btn-primary" type="button" onclick={openCreateCutCardModal}>
					<Plus size={15} />
					<span>Record First Styling Specs</span>
				</button>
			</EmptyState>
		</div>
	{:else}
		<div class="cut-cards-grid">
			{#each filteredCutCards as card (card.id)}
				<CutCard {card} onEdit={openEditCutCardModal} />
			{/each}
		</div>
	{/if}
</section>

<!-- Add-ons Catalog Section -->
<section class="section-block">
	<div class="section-header spread" style="margin-bottom: var(--sp-4);">
		<div>
			<h2 class="section-title">
				<Sparkles size={18} class="primary" />
				<span>Grooming Add-ons &amp; Spa Treatments ({data.groomingServices.length})</span>
			</h2>
			<p class="small muted" style="margin: 2px 0 0;">
				Spa upgrades and specialized grooming add-ons available for appointment selection.
			</p>
		</div>
		<button class="btn btn-primary btn-sm" type="button" onclick={() => addonModalOpen = true}>
			<Plus size={14} />
			<span>Add Treatment</span>
		</button>
	</div>

	<div class="addons-grid">
		{#each data.groomingServices as addon (addon.id)}
			<div class="card pad addon-card">
				<div class="spread" style="align-items: flex-start; margin-bottom: 8px;">
					<div class="row gap-2">
						<div class="addon-icon">
							<Sparkles size={16} />
						</div>
						<div>
							<h3 class="addon-name">{addon.name}</h3>
							<div class="row gap-2" style="margin-top: 2px;">
								{#if addon.durationMinutes}
									<span class="small muted mono">
										<Clock size={12} style="display: inline; vertical-align: middle;" />
										{addon.durationMinutes} mins
									</span>
								{/if}
								{#if addon.requiresStaffSkill}
									<span class="badge badge-purple" style="font-size: 10.5px;">
										Skill: {addon.requiresStaffSkill}
									</span>
								{/if}
							</div>
						</div>
					</div>
					<div class="addon-price mono cell-strong text-primary">
						{money(addon.priceCents)}
					</div>
				</div>

				<div class="spread small muted" style="margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border-subtle);">
					<span class="badge {addon.active ? 'badge-success' : 'badge-neutral'}">
						<span class="dot"></span>
						<span>{addon.active ? 'Active in Salon' : 'Archived'}</span>
					</span>
					<span class="tiny faint mono">ID: #{addon.id}</span>
				</div>
			</div>
		{/each}
	</div>
</section>

<!-- Modal 1: Record or Edit Grooming Cut Card -->
<Modal
	bind:open={cutCardModalOpen}
	title={editingCard ? `Edit Cut Card · ${editingCard.petName}` : "Record Pet Styling Cut Card"}
	subtitle="Document exact blade lengths, clipper guard numbers, scissor finish, and behavior score."
	maxWidth="680px"
>
	<form method="POST" action="?/saveCutCard" class="stack gap-4">
		{#if editingCard}
			<input type="hidden" name="id" value={editingCard.id} />
		{/if}

		<div class="grid cols-2">
			<!-- Pet Selector -->
			<div class="field">
				<label for="formPetId">Pet Patient <span class="req">*</span></label>
				<select id="formPetId" name="petId" bind:value={formPetId} required disabled={!!editingCard}>
					{#each data.petsList as p}
						<option value={p.id}>
							{p.name} ({p.species.toUpperCase()}{p.breed ? ` · ${p.breed}` : ''}) — {p.ownerLastName}
						</option>
					{/each}
				</select>
			</div>

			<!-- Stylist Selector -->
			<div class="field">
				<label for="formStaffId">Groomer / Stylist</label>
				<select id="formStaffId" name="staffId" bind:value={formStaffId}>
					<option value="">-- Unassigned (Store Standard) --</option>
					{#each data.staffList as st}
						<option value={st.id}>{st.name} ({st.role})</option>
					{/each}
				</select>
			</div>
		</div>

		<!-- Body Blade Length -->
		<div class="field">
			<label for="formBladeBody">Body Blade / Clipper Length <span class="req">*</span></label>
			<input
				id="formBladeBody"
				name="bladeLengthBody"
				bind:value={formBladeBody}
				placeholder="e.g. #7F (3.2mm) Summer Clip, 1/2 in guard"
				required
			/>
			<div class="quick-presets">
				<span class="tiny faint">Presets:</span>
				{#each bladeBodyPresets.slice(0, 4) as preset}
					<button
						type="button"
						class="preset-chip {formBladeBody === preset ? 'active' : ''}"
						onclick={() => formBladeBody = preset}
					>
						{preset.split(' ')[0]}
					</button>
				{/each}
			</div>
		</div>

		<!-- Face / Head Styling -->
		<div class="field">
			<label for="formBladeFace">Face &amp; Head Blueprint</label>
			<input
				id="formBladeFace"
				name="bladeLengthFace"
				bind:value={formBladeFace}
				placeholder="e.g. Round Teddy Bear Face, Asian Fusion ears"
			/>
			<div class="quick-presets">
				<span class="tiny faint">Presets:</span>
				{#each bladeFacePresets.slice(0, 3) as preset}
					<button
						type="button"
						class="preset-chip {formBladeFace === preset ? 'active' : ''}"
						onclick={() => formBladeFace = preset}
					>
						{preset.split(' ')[0]}
					</button>
				{/each}
			</div>
		</div>

		<!-- Scissor Notes -->
		<div class="field">
			<label for="formScissorNotes">Scissor Finishing &amp; Tail Shape</label>
			<textarea
				id="formScissorNotes"
				name="scissorNotes"
				bind:value={formScissorNotes}
				rows="2"
				placeholder="Scissor straight legs, round paw pads, feather tail..."
			></textarea>
		</div>

		<!-- Coat Condition & Skin Issues -->
		<div class="grid cols-2">
			<div class="field">
				<label for="formCoatCondition">Coat Condition</label>
				<input
					id="formCoatCondition"
					name="coatCondition"
					bind:value={formCoatCondition}
					placeholder="e.g. Clean, mat-free coat"
				/>
			</div>

			<div class="field">
				<label for="formSkinIssues">Skin Care &amp; Allergies</label>
				<input
					id="formSkinIssues"
					name="skinIssues"
					bind:value={formSkinIssues}
					placeholder="e.g. Sensitive belly, use oatmeal shampoo"
				/>
			</div>
		</div>

		<!-- Behavior Score (1-5 Stars) -->
		<div class="field">
			<label for="formBehaviorScore">Salon Temperament Rating</label>
			<div class="behavior-selector-row">
				{#each [5, 4, 3, 2, 1] as score}
					<button
						type="button"
						class="behavior-option-btn {formBehaviorScore === score ? 'active' : ''}"
						onclick={() => formBehaviorScore = score}
					>
						<span class="star-num">{score}★</span>
						<span class="star-desc">{getBehaviorLabel(score).text}</span>
					</button>
				{/each}
			</div>
			<input type="hidden" name="behaviorScore" value={formBehaviorScore} />
		</div>

		<div class="row spread" style="margin-top: var(--sp-2);">
			<button class="btn btn-ghost" type="button" onclick={() => cutCardModalOpen = false}>
				<X size={14} />
				<span>Cancel</span>
			</button>
			<button class="btn btn-primary" type="submit">
				<Save size={15} />
				<span>{editingCard ? "Save Changes" : "Create Cut Card"}</span>
			</button>
		</div>
	</form>
</Modal>

<!-- Modal 2: Add Spa Treatment -->
<Modal
	bind:open={addonModalOpen}
	title="Add Grooming Treatment to Catalog"
	subtitle="Create a bookable add-on spa service or styling upgrade."
	maxWidth="520px"
>
	<form method="POST" action="?/createAddon" class="stack gap-4">
		<div class="field">
			<label for="addonName">Treatment Name <span class="req">*</span></label>
			<input
				id="addonName"
				name="name"
				placeholder="e.g. Medicated Oatmeal Paw Soak"
				required
			/>
		</div>

		<div class="grid cols-2">
			<div class="field">
				<label for="durationMinutes">Duration (Minutes) <span class="req">*</span></label>
				<input
					id="durationMinutes"
					name="durationMinutes"
					type="number"
					value="15"
					min="5"
					step="5"
					required
				/>
			</div>

			<div class="field">
				<label for="priceCents">Price in IDR <span class="req">*</span></label>
				<input
					id="priceCents"
					name="priceCents"
					type="number"
					value="45000"
					step="5000"
					min="0"
					required
				/>
			</div>
		</div>

		<div class="field">
			<label for="requiresStaffSkill">Required Groomer Skill</label>
			<input
				id="requiresStaffSkill"
				name="requiresStaffSkill"
				placeholder="e.g. full-groom, bath, teeth-cleaning"
			/>
		</div>

		<div class="row spread" style="margin-top: var(--sp-2);">
			<button class="btn btn-ghost" type="button" onclick={() => addonModalOpen = false}>
				<X size={14} />
				<span>Cancel</span>
			</button>
			<button class="btn btn-primary" type="submit">
				<Plus size={15} />
				<span>Add to Catalog</span>
			</button>
		</div>
	</form>
</Modal>

<style>
	.cut-cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
		gap: var(--sp-4);
	}

	.addons-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--sp-3);
	}

	.addon-card {
		padding: 14px;
		transition: all 130ms ease;
	}

	.addon-card:hover {
		box-shadow: var(--shadow-sm);
		border-color: var(--border-focus);
	}

	.addon-icon {
		width: 32px;
		height: 32px;
		border-radius: var(--r-md);
		background: var(--purple-bg);
		color: var(--purple);
		display: grid;
		place-items: center;
		flex-shrink: 0;
	}

	.addon-name {
		font-size: 13.5px;
		font-weight: 700;
		color: var(--ink);
		margin: 0;
	}

	.behavior-selector-row {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 6px;
		margin-top: 4px;
	}

	.behavior-option-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		padding: 8px 4px;
		border-radius: var(--r-md);
		border: 1.5px solid var(--border);
		background: var(--surface);
		cursor: pointer;
		transition: all 120ms ease;
	}

	.behavior-option-btn:hover {
		background: var(--surface-2);
		border-color: var(--primary-border);
	}

	.behavior-option-btn.active {
		border-color: var(--primary);
		background: var(--primary-soft);
	}

	.star-num {
		font-size: 13px;
		font-weight: 700;
		color: #f59e0b;
	}

	.star-desc {
		font-size: 10px;
		font-weight: 600;
		color: var(--muted);
		text-align: center;
	}

	.text-danger { color: var(--danger); }
	.text-purple { color: var(--purple); }
	.text-green { color: var(--success); }
	.text-primary { color: var(--primary); }
</style>
