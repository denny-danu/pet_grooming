import { redirect, json, type RequestHandler } from "@sveltejs/kit";
import { isLocale, LOCALE_COOKIE } from "$lib/i18n";

export const POST: RequestHandler = async ({ request, cookies }) => {
	const contentType = request.headers.get("content-type") ?? "";
	let locale = "";
	let redirectTo = "/";

	if (contentType.includes("application/json")) {
		const body = (await request.json().catch(() => ({}))) as { locale?: string; redirect?: string };
		locale = String(body.locale ?? "");
		redirectTo = String(body.redirect ?? "/");
	} else {
		const data = await request.formData().catch(() => new FormData());
		locale = String(data.get("locale") ?? "");
		redirectTo = String(data.get("redirect") ?? "/");
	}

	if (!isLocale(locale)) {
		return json({ error: "Unsupported locale" }, { status: 400 });
	}

	cookies.set(LOCALE_COOKIE, locale, {
		path: "/",
		sameSite: "lax",
		maxAge: 60 * 60 * 24 * 365,
		httpOnly: false
	});

	const target = redirectTo.startsWith("/") ? redirectTo : "/";

	if (request.headers.get("accept")?.includes("application/json") && contentType.includes("application/json")) {
		return json({ ok: true, locale, redirect: target });
	}

	throw redirect(303, target);
};

export const GET: RequestHandler = async ({ url, cookies }) => {
	const locale = url.searchParams.get("locale");
	const redirectTo = url.searchParams.get("redirect") ?? "/";

	if (isLocale(locale)) {
		cookies.set(LOCALE_COOKIE, locale, {
			path: "/",
			sameSite: "lax",
			maxAge: 60 * 60 * 24 * 365,
			httpOnly: false
		});
	}

	const target = redirectTo.startsWith("/") ? redirectTo : "/";
	throw redirect(303, target);
};
