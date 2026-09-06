import { redirect, fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { isLocale, LOCALE_COOKIE } from "$lib/i18n";

export const actions: Actions = {
	locale: async ({ request, cookies, url }) => {
		const data = await request.formData();
		const locale = String(data.get("locale") ?? "");
		if (!isLocale(locale)) {
			return fail(400, { error: "Unsupported locale" });
		}
		cookies.set(LOCALE_COOKIE, locale, {
			path: "/",
			sameSite: "lax",
			maxAge: 60 * 60 * 24 * 365
		});
		const redirectTo = String(data.get("redirect") ?? "/");
		throw redirect(303, redirectTo.startsWith("/") ? redirectTo : "/");
	}
};
