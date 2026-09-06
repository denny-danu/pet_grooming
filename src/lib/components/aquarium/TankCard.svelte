<script lang="ts">
	import {
		User,
		Phone,
		Activity,
		FlaskConical,
		Repeat,
		Info,
		Waves,
		Sparkles,
		Droplets,
		Gauge,
		Fish,
		Layers
	} from "@lucide/svelte";
	import { formatRupiah as money } from "$lib/util";
	import { getEcosystemBadge, getParameterStatus, formatDate } from "$lib/ui/aquarium";

	type Tank = {
		id: number;
		name: string;
		volumeLiters: number | null;
		dimensions: string | null;
		filtrationType: string | null;
		lightingType: string | null;
		notes: string | null;
		ecosystem: string;
		ownerId: number;
		ownerFirstName: string;
		ownerLastName: string;
		ownerPhone: string | null;
		latestLog?: {
			recordedAt: Date | string;
			ph: string | null;
			ammoniaPpm: string | null;
			nitritePpm: string | null;
			nitratePpm: string | null;
			salinityPpt: string | null;
			temperatureC: string | null;
			khDkh: string | null;
		} | null;
		activePlan?: {
			planName: string;
			pricePerVisitCents: number;
		} | null;
	};

	let {
		tank,
		onLogTest,
		onCreatePlan
	}: {
		tank: Tank;
		onLogTest: (tankId: number) => void;
		onCreatePlan: (tankId: number, ownerId: number) => void;
	} = $props();

	function resolveIcon(kind: string) {
		switch (kind) {
			case "waves":
				return Waves;
			case "sparkles":
				return Sparkles;
			case "droplets":
				return Droplets;
			case "gauge":
				return Gauge;
			case "layers":
				return Layers;
			case "fish":
			default:
				return Fish;
		}
	}

	const eco = $derived(getEcosystemBadge(tank.ecosystem, resolveIcon));
	const log = $derived(tank.latestLog);
</script>

<div class="card tank-card">
	<div class="tank-card-head">
		<div class="stack-xs min-w-0">
			<div class="row gap-2 align-center">
				<h3 class="tank-title" title={tank.name}>{tank.name}</h3>
				<span class="badge badge-{eco.variant} eco-badge">
					{#if eco.icon}
						<svelte:component this={eco.icon} size={11} />
					{/if}
					<span>{eco.label}</span>
				</span>
			</div>
			<div class="owner-line">
				<User size={12} class="faint" />
				<span class="owner-name">{tank.ownerFirstName} {tank.ownerLastName}</span>
				{#if tank.ownerPhone}
					<span class="divider">·</span>
					<a href="tel:{tank.ownerPhone}" class="owner-contact">
						<Phone size={11} />
						<span>{tank.ownerPhone}</span>
					</a>
				{/if}
			</div>
		</div>
		<div class="volume-badge" title="Water Volume">
			<span class="vol-num">{tank.volumeLiters ?? "—"}</span>
			<span class="vol-unit">Liters</span>
		</div>
	</div>

	<div class="tank-specs-box">
		<div class="specs-grid">
			{#if tank.dimensions}
				<div class="spec-item"><span class="spec-k">Dimensions</span><span class="spec-v">{tank.dimensions}</span></div>
			{/if}
			{#if tank.filtrationType}
				<div class="spec-item"><span class="spec-k">Filtration</span><span class="spec-v" title={tank.filtrationType}>{tank.filtrationType}</span></div>
			{/if}
			{#if tank.lightingType}
				<div class="spec-item"><span class="spec-k">Lighting</span><span class="spec-v" title={tank.lightingType}>{tank.lightingType}</span></div>
			{/if}
		</div>
		{#if tank.notes}
			<p class="tank-notes"><span class="notes-tag">Notes:</span> {tank.notes}</p>
		{/if}
	</div>

	<div class="telemetry-box">
		<div class="spread align-center telemetry-head">
			<span class="telemetry-title"><Activity size={13} class="primary" /> Latest Chemistry Telemetry</span>
			{#if log}
				<span class="telemetry-time" title={formatDate(log.recordedAt, true)}>{formatDate(log.recordedAt)}</span>
			{/if}
		</div>

		{#if log}
			{@const phStatus = getParameterStatus("ph", log.ph, tank.ecosystem)}
			{@const ammStatus = getParameterStatus("ammonia", log.ammoniaPpm, tank.ecosystem)}
			{@const nitStatus = getParameterStatus("nitrite", log.nitritePpm, tank.ecosystem)}
			{@const ntrStatus = getParameterStatus("nitrate", log.nitratePpm, tank.ecosystem)}
			{@const tempStatus = getParameterStatus("temp", log.temperatureC, tank.ecosystem)}
			{@const salStatus = getParameterStatus("salinity", log.salinityPpt, tank.ecosystem)}
			<div class="params-pill-grid">
				<div class="param-cell {phStatus.class}"><span class="p-label">pH</span><span class="p-val">{phStatus.text}</span></div>
				<div class="param-cell {ammStatus.class}"><span class="p-label">NH₃/NH₄</span><span class="p-val">{ammStatus.text}</span></div>
				<div class="param-cell {nitStatus.class}"><span class="p-label">NO₂</span><span class="p-val">{nitStatus.text}</span></div>
				<div class="param-cell {ntrStatus.class}"><span class="p-label">NO₃</span><span class="p-val">{ntrStatus.text}</span></div>
				{#if tank.ecosystem === "reef" || tank.ecosystem === "marine"}
					<div class="param-cell {salStatus.class}"><span class="p-label">Salinity</span><span class="p-val">{salStatus.text}</span></div>
				{/if}
				{#if log.temperatureC}
					<div class="param-cell {tempStatus.class}"><span class="p-label">Temp</span><span class="p-val">{tempStatus.text}</span></div>
				{/if}
				{#if log.khDkh}
					<div class="param-cell param-info"><span class="p-label">KH</span><span class="p-val">{log.khDkh} dKH</span></div>
				{/if}
			</div>
		{:else}
			<div class="no-telemetry-notice"><Info size={13} /> <span>No water test recorded yet for this setup.</span></div>
		{/if}
	</div>

	<div class="tank-card-foot spread">
		<div class="plan-status">
			{#if tank.activePlan}
				<span class="badge badge-purple plan-badge">
					<Repeat size={10} />
					<span>{tank.activePlan.planName}</span>
					<span class="plan-price">({money(tank.activePlan.pricePerVisitCents)} / visit)</span>
				</span>
			{:else}
				<span class="faint tiny">No recurring plan</span>
			{/if}
		</div>
		<div class="row gap-1">
			<button class="btn btn-sm btn-subtle" onclick={() => onLogTest(tank.id)} title="Log water parameter chemistry">
				<FlaskConical size={13} />
				<span>Log Test</span>
			</button>
			{#if !tank.activePlan}
				<button class="btn btn-sm btn-ghost" onclick={() => onCreatePlan(tank.id, tank.ownerId)} title="Set up recurring service plan">
					<Repeat size={13} />
					<span>+ Plan</span>
				</button>
			{/if}
		</div>
	</div>
</div>

<style>
	.tank-card {
		display: flex;
		flex-direction: column;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-xl);
		overflow: hidden;
		box-shadow: var(--shadow-sm);
		transition: transform 140ms ease, box-shadow 140ms ease;
	}
	.tank-card:hover { box-shadow: var(--shadow-md); border-color: var(--border-strong); }
	.tank-card-head {
		padding: 16px 18px;
		border-bottom: 1px solid var(--border-subtle);
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 12px;
		background: linear-gradient(180deg, var(--surface-2) 0%, var(--surface) 100%);
	}
	.tank-title {
		font-size: 16px; font-weight: 700; color: var(--ink); margin: 0;
		white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
	}
	.owner-line { display: flex; align-items: center; gap: 5px; font-size: 12.5px; color: var(--ink-2); }
	.owner-name { font-weight: 600; }
	.owner-contact { display: inline-flex; align-items: center; gap: 4px; color: var(--muted); text-decoration: none; font-size: 12px; }
	.owner-contact:hover { color: var(--primary); }
	.volume-badge {
		display: flex; flex-direction: column; align-items: center; justify-content: center;
		background: #f0fdfa; border: 1px solid #99f6e4; color: #0d9488;
		padding: 4px 10px; border-radius: var(--r-md); flex-shrink: 0; min-width: 54px;
	}
	.vol-num { font-size: 15px; font-weight: 800; line-height: 1; }
	.vol-unit { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
	.tank-specs-box { padding: 12px 18px; border-bottom: 1px solid var(--border-subtle); background: var(--surface); }
	.specs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; }
	.spec-item { display: flex; flex-direction: column; }
	.spec-k { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted); }
	.spec-v { font-size: 12.5px; font-weight: 600; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.tank-notes { font-size: 12px; color: var(--muted); margin: 8px 0 0 0; line-height: 1.4; }
	.notes-tag { font-weight: 600; color: var(--ink-2); }
	.telemetry-box { padding: 14px 18px; flex: 1; background: var(--surface-2); border-bottom: 1px solid var(--border-subtle); }
	.telemetry-head { margin-bottom: 10px; }
	.telemetry-title { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: var(--ink-2); text-transform: uppercase; letter-spacing: 0.03em; }
	.telemetry-time { font-size: 11px; font-weight: 600; color: var(--muted); }
	.params-pill-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(75px, 1fr)); gap: 6px; }
	.param-cell { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 6px 4px; border-radius: var(--r-md); border: 1px solid var(--border); background: var(--surface); text-align: center; }
	.p-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; color: var(--muted); line-height: 1; margin-bottom: 2px; }
	.p-val { font-size: 12.5px; font-weight: 800; font-family: var(--font-mono); line-height: 1.1; }
	.param-good { background: #ecfdf5; border-color: #a7f3d0; color: #059669; }
	.param-warn { background: #fffbeb; border-color: #fde68a; color: #d97706; }
	.param-alert { background: #fff1f2; border-color: #fecdd3; color: #e11d48; }
	.param-info { background: #f0f9ff; border-color: #bae6fd; color: #0284c7; }
	.no-telemetry-notice { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); padding: 10px; background: var(--surface); border: 1px dashed var(--border); border-radius: var(--r-md); }
	.tank-card-foot { padding: 12px 18px; background: var(--surface); align-items: center; }
	.plan-badge { font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }
	.plan-price { font-weight: 400; opacity: 0.85; }
	.eco-badge { font-size: 11px; font-weight: 600; }
</style>
