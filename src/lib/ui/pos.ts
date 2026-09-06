import { Utensils, Sparkles, Fish, Gift, HeartPulse, Tag } from "@lucide/svelte";
import type { Component } from "svelte";

export type CategoryIconSlug = "food" | "grooming" | "aquarium" | "treats" | "healthcare" | null;

export function getCategoryIcon(slug: string | null): Component {
	switch (slug) {
		case "food":
			return Utensils;
		case "grooming":
			return Sparkles;
		case "aquarium":
			return Fish;
		case "treats":
			return Gift;
		case "healthcare":
			return HeartPulse;
		default:
			return Tag;
	}
}
