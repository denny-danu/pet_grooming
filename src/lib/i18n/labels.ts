import { translate, type MessageKey } from "./translate";
import type { Locale } from "./index";

/**
 * Localized labels for domain enums (booking kinds/statuses) and pet species.
 * Falls back to the pretty-printed English token when no message exists.
 */
export function statusLabel(locale: Locale, status: string): string {
	const key = `booking.status.${status}` as MessageKey;
	const translated = translate(locale, key);
	return translated === key ? status.replace(/_/g, " ") : translated;
}

export function kindLabel(locale: Locale, kind: string): string {
	const key = `booking.kind.${kind}` as MessageKey;
	const translated = translate(locale, key);
	return translated === key ? kind : translated;
}
