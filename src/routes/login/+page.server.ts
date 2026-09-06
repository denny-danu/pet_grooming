import { fail, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { staff } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { bcryptVerify } from "$lib/server/auth";
import {
	createAuthTokens,
	ACCESS_TOKEN_COOKIE,
	REFRESH_TOKEN_COOKIE,
	SESSION_COOKIE
} from "$lib/server/session";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(303, "/dashboard");
	}
	return {};
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = String(data.get("email") ?? "").toLowerCase().trim();
		const password = String(data.get("password") ?? "");
		if (!email || !password) return fail(400, { error: "Email and password required" });

		const row = await db.query.staff.findFirst({ where: eq(staff.email, email) });
		if (!row || !row.active) return fail(401, { error: "Invalid credentials" });
		const ok = await bcryptVerify(password, row.passwordHash);
		if (!ok) return fail(401, { error: "Invalid credentials" });

		const { accessToken, refreshToken } = createAuthTokens(row);

		cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
			path: "/",
			httpOnly: true,
			sameSite: "lax",
			secure: false,
			maxAge: 15 * 60 // 15 mins
		});

		cookies.set(SESSION_COOKIE, accessToken, {
			path: "/",
			httpOnly: true,
			sameSite: "lax",
			secure: false,
			maxAge: 15 * 60
		});

		cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
			path: "/",
			httpOnly: true,
			sameSite: "lax",
			secure: false,
			maxAge: 14 * 24 * 60 * 60 // 14 days
		});

		throw redirect(303, "/dashboard");
	}
};
