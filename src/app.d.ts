// See https://svelte.dev/docs/kit/types#app.d.ts
import type { SessionUser } from "$lib/server/session";
import type { Locale } from "$lib/i18n";

declare global {
	namespace App {
		interface Locals {
			user: SessionUser | null;
			activeBranchId: number | null;
			locale: Locale;
		}
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
