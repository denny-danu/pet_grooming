import { db } from "$lib/server/db";
import { staff } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { encodeBase64 } from "$lib/util";

export type SessionUser = {
	id: number;
	email: string;
	name: string;
	role: string;
};

export function getSessionUser(id: number) {
	return db.query.staff.findFirst({ where: eq(staff.id, id) });
}

export async function getSession(token: string): Promise<SessionUser | null> {
	if (!token) return null;
	let payload: { id: number; iat: number } | null = null;
	try {
		payload = JSON.parse(decodeURIComponent(escape(atob(token))));
	} catch {
		return null;
	}
	if (!payload?.id) return null;
	const age = Date.now() - (payload.iat ?? 0);
	if (age > 1000 * 60 * 60 * 24 * 14) return null; // 14d
	const row = await getSessionUser(payload.id);
	if (!row || !row.active) return null;
	return { id: row.id, email: row.email, name: row.name, role: row.role };
}

export function makeToken(user: { id: number }): string {
	return encodeBase64(JSON.stringify({ id: user.id, iat: Date.now() }));
}

export const SESSION_COOKIE = "petco_session";
