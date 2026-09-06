import en from "./en.json";
import id from "./id.json";
import { defaultLocale, type Locale } from "./index";

/** Flat key union derived from the English source catalog. */
export type MessageKey = keyof typeof en;

const catalogs: Record<Locale, Record<MessageKey, string>> = {
	en,
	id: id as Record<MessageKey, string>
};

/**
 * Translate a key for a locale, with optional `{param}` interpolation.
 * Falls back to English (source of truth) when a key is missing in the
 * target locale, so new UI never renders a raw key.
 */
export function translate(locale: Locale, key: MessageKey, params?: Record<string, string | number>): string {
	let template = catalogs[locale]?.[key] ?? catalogs[defaultLocale][key] ?? key;
	if (params) {
		for (const [name, value] of Object.entries(params)) {
			template = template.replaceAll(`{${name}}`, String(value));
		}
	}
	return template;
}
