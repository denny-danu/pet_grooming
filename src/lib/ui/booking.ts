import { Scissors, Hotel, Fish, type LucideIcon } from "@lucide/svelte";

/**
 * Shared booking presentation helpers: booking-kind icon resolution
 * and raw status pretty-printing. Locale-aware labels live in i18n.
 */

export function getKindIcon(kind: string | null | undefined): LucideIcon {
	if (kind === "hotel") return Hotel;
	if (kind === "aquarium") return Fish;
	return Scissors;
}

export function getKindLabel(kind: string | null | undefined): string {
	switch (kind) {
		case "grooming":
			return "Grooming";
		case "hotel":
			return "Pet Hotel";
		case "aquarium":
			return "Aquarium";
		default:
			return kind ?? "Booking";
	}
}

/** `confirmed` → `Confirmed`; `checked_in` → `Checked in`. */
export function prettyStatus(status: string | null | undefined): string {
	if (!status) return "—";
	return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
