<script lang="ts">
	import {
		Scissors,
		Hotel,
		Fish,
		CheckCircle2,
		AlertCircle,
		Clock,
		XCircle,
		ShieldCheck,
		ShieldAlert,
		TriangleAlert,
		Sparkles,
		Award,
		Star,
		ShoppingBag,
		Package
	} from "@lucide/svelte";

	type BadgeVariant =
		| "success"
		| "warning"
		| "danger"
		| "info"
		| "neutral"
		| "purple"
		| "cyan"
		| "grooming"
		| "hotel"
		| "aquarium"
		| "shop"
		| "silver"
		| "gold"
		| "platinum";

	let {
		variant = "neutral",
		label,
		dot = false,
		class: customClass = ""
	}: {
		variant?: BadgeVariant | string;
		label?: string;
		dot?: boolean;
		class?: string;
	} = $props();

	function getVariantClass(v: string) {
		if (v === "grooming" || v === "kind-grooming") return "kind-grooming";
		if (v === "hotel" || v === "kind-hotel") return "kind-hotel";
		if (v === "aquarium" || v === "kind-aquarium") return "kind-aquarium";
		if (v === "shop") return "badge-purple";
		if (v === "silver" || v === "tier-silver") return "tier-silver";
		if (v === "gold" || v === "tier-gold") return "tier-gold";
		if (v === "platinum" || v === "tier-platinum") return "tier-platinum";
		if (v === "confirmed" || v === "completed" || v === "valid" || v === "active" || v === "delivered") return "badge-success";
		if (v === "pending" || v === "expiring" || v === "due") return "badge-warning";
		if (v === "checked_in" || v === "sent" || v === "in_progress") return "badge-info";
		if (v === "cancelled" || v === "expired" || v === "failed" || v === "no_show" || v === "inactive") return "badge-danger";
		return `badge-${v}`;
	}
</script>

<span class="badge {getVariantClass(variant)} {customClass}">
	{#if dot}
		<span class="dot"></span>
	{/if}
	{#if variant === "grooming" || variant === "kind-grooming"}
		<Scissors size={11} />
	{:else if variant === "hotel" || variant === "kind-hotel"}
		<Hotel size={11} />
	{:else if variant === "aquarium" || variant === "kind-aquarium"}
		<Fish size={11} />
	{:else if variant === "shop"}
		<ShoppingBag size={11} />
	{:else if variant === "gold" || variant === "tier-gold"}
		<Star size={11} />
	{:else if variant === "platinum" || variant === "tier-platinum"}
		<Award size={11} />
	{/if}
	<span>{label}</span>
</span>
