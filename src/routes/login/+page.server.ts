import { fail, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { staff } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { bcryptVerify } from "$lib/server/auth";
import { makeToken, SESSION_COOKIE } from "$lib/server/session";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
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

		const token = makeToken(row);
		cookies.set(SESSION_COOKIE, token, {
			path: "/",
			httpOnly: true,
			sameSite: "lax",
			secure: false,
			maxAge: 60 * 60 * 24 * 14
		});
		throw redirect(303, "/");
	}
};
