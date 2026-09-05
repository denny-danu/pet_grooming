import bcrypt from "bcryptjs";
import type { RequestEvent } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import type { SessionUser } from "./session";

export function bcryptHash(plain: string): Promise<string> {
	return bcrypt.hash(plain, 10);
}

export function bcryptVerify(plain: string, hash: string): Promise<boolean> {
	return bcrypt.compare(plain, hash);
}

export function requireUser(locals: RequestEvent["locals"]): SessionUser {
	if (!locals.user) throw redirect(303, "/login");
	return locals.user;
}

export function getBranchFilter(locals: RequestEvent["locals"]): number | null {
	if (!locals.user) return null;
	if (locals.user.isHeadOffice || locals.user.role === "admin") {
		return locals.activeBranchId ?? null;
	}
	return locals.user.branchId ?? null;
}
