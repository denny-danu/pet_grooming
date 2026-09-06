/**
 * Supported locales. `default` is used when no cookie / fallback applies.
 * Keys are BCP-47 tags; `id-ID` and `en-US` are the app's two variants,
 * but we treat them as short `en` / `id` for internal use.
 */
export const locales = ["en", "id"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const LOCALE_COOKIE = "petco_locale";

export const localeLabels: Record<Locale, string> = {
	en: "English",
	id: "Bahasa Indonesia"
};

export function isLocale(value: string | null | undefined): value is Locale {
	return !!value && (locales as readonly string[]).includes(value);
}

export function toLocale(value: string | null | undefined): Locale {
	return isLocale(value) ? value : defaultLocale;
}
