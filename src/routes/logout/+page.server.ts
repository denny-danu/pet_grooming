import { redirect } from "@sveltejs/kit";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, SESSION_COOKIE } from "$lib/server/session";
import type { Actions, PageServerLoad } from "./$types";

function clearAuthCookies(cookies: { delete: (name: string, opts: { path: string }) => void }) {
	cookies.delete(ACCESS_TOKEN_COOKIE, { path: "/" });
	cookies.delete(REFRESH_TOKEN_COOKIE, { path: "/" });
	cookies.delete(SESSION_COOKIE, { path: "/" });
}

export const load: PageServerLoad = async ({ cookies }) => {
	clearAuthCookies(cookies);
	throw redirect(303, "/login");
};

export const actions: Actions = {
	default: async ({ cookies }) => {
		clearAuthCookies(cookies);
		throw redirect(303, "/login");
	},
	logout: async ({ cookies }) => {
		clearAuthCookies(cookies);
		throw redirect(303, "/login");
	}
};
