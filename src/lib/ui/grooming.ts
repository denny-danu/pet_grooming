/**
 * Grooming cut-card helpers: date + behavior-score labels.
 * Pure functions shared between the grooming pages and card components.
 */

export function formatDate(d: Date | string | null | undefined, locale = "id-ID"): string {
	if (!d) return "—";
	const dateObj = new Date(d);
	if (isNaN(dateObj.getTime())) return "—";
	return dateObj.toLocaleDateString(locale, {
		day: "numeric",
		month: "short",
		year: "numeric"
	});
}

export type BehaviorMeta = {
	text: string;
	variant: string;
	desc: string;
};

export function getBehaviorLabel(score: number | null | undefined): BehaviorMeta {
	const s = score ?? 5;
	if (s >= 5) return { text: "Calm & Angelic", variant: "badge-success", desc: "Cooperative throughout bath and styling" };
	if (s === 4) return { text: "Cooperative", variant: "badge-info", desc: "Good tolerance, minor squirming during nails" };
	if (s === 3) return { text: "Fidgety", variant: "badge-warning", desc: "Sensitive to dryer / paws, requires extra patience" };
	if (s === 2) return { text: "High Anxiety", variant: "badge-purple", desc: "Nervous trembling, use gentle soothing touch" };
	return { text: "Reactive / Bite Risk", variant: "badge-danger", desc: "Muzzle recommended, handle with 2 groomers" };
}
