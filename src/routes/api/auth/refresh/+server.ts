import { json } from "@sveltejs/kit";
import {
	refreshSession,
	ACCESS_TOKEN_COOKIE,
	REFRESH_TOKEN_COOKIE,
	SESSION_COOKIE
} from "$lib/server/session";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies }) => {
	let refreshToken = cookies.get(REFRESH_TOKEN_COOKIE);

	if (!refreshToken) {
		try {
			const body = await request.json();
			if (body && typeof body === "object" && "refreshToken" in body) {
				refreshToken = String(body.refreshToken);
			}
		} catch {
			// No JSON body
		}
	}

	if (!refreshToken) {
		return json({ error: "Missing refresh token" }, { status: 400 });
	}

	const refreshed = await refreshSession(refreshToken);
	if (!refreshed) {
		return json({ error: "Invalid or expired refresh token" }, { status: 401 });
	}

	// Set updated cookies
	cookies.set(ACCESS_TOKEN_COOKIE, refreshed.accessToken, {
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		secure: false,
		maxAge: 15 * 60
	});
	cookies.set(SESSION_COOKIE, refreshed.accessToken, {
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		secure: false,
		maxAge: 15 * 60
	});
	cookies.set(REFRESH_TOKEN_COOKIE, refreshed.newRefreshToken, {
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		secure: false,
		maxAge: 14 * 24 * 60 * 60
	});

	return json({
		user: refreshed.user,
		accessToken: refreshed.accessToken,
		refreshToken: refreshed.newRefreshToken,
		expiresIn: 15 * 60
	});
};
