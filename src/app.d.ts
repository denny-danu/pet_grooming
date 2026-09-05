// See https://svelte.dev/docs/kit/types#app.d.ts
import type { SessionUser } from "$lib/server/session";

declare global {
	namespace App {
		interface Locals {
			user: SessionUser | null;
			activeBranchId: number | null;
		}
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
