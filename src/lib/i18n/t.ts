import en from "./en.json";
import { translate, type MessageKey } from "./translate";
import type { Locale } from "./index";

export type MessageFn = (params?: Record<string, string | number>) => string;

export type T = Record<MessageKey, MessageFn>;

const cache = new Map<Locale, T>();

/** Build a typed translation object bound to a locale: `t['common.save']()`. */
export function makeT(locale: Locale): T {
	let t = cache.get(locale);
	if (t) return t;
	const keys = Object.keys(en) as MessageKey[];
	t = Object.fromEntries(keys.map((k) => [k, (params?: Record<string, string | number>) => translate(locale, k, params)])) as T;
	cache.set(locale, t);
	return t;
}
