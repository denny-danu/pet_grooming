import type { Handle, RequestEvent } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import {
	getSession,
	refreshSession,
	ACCESS_TOKEN_COOKIE,
	REFRESH_TOKEN_COOKIE,
	SESSION_COOKIE,
	ACTIVE_BRANCH_COOKIE,
	type SessionUser
} from "$lib/server/session";

export const handleSession: Handle = async ({ event, resolve }) => {
	event.locals.user = null;
	event.locals.activeBranchId = null;

	const accessToken = event.cookies.get(ACCESS_TOKEN_COOKIE) || event.cookies.get(SESSION_COOKIE);
	if (accessToken) {
		const user = await getSession(accessToken);
		if (user) {
			event.locals.user = user;
		}
	}

	// If access token is missing or expired, attempt seamless refresh via petco_refresh_token
	if (!event.locals.user) {
		const refreshToken = event.cookies.get(REFRESH_TOKEN_COOKIE);
		if (refreshToken) {
			const refreshed = await refreshSession(refreshToken);
			if (refreshed) {
				event.locals.user = refreshed.user;

				event.cookies.set(ACCESS_TOKEN_COOKIE, refreshed.accessToken, {
					path: "/",
					httpOnly: true,
					sameSite: "lax",
					secure: false,
					maxAge: 15 * 60
				});
				event.cookies.set(SESSION_COOKIE, refreshed.accessToken, {
					path: "/",
					httpOnly: true,
					sameSite: "lax",
					secure: false,
					maxAge: 15 * 60
				});
				event.cookies.set(REFRESH_TOKEN_COOKIE, refreshed.newRefreshToken, {
					path: "/",
					httpOnly: true,
					sameSite: "lax",
					secure: false,
					maxAge: 14 * 24 * 60 * 60
				});
			}
		}
	}

	// Multi-Branch Context & Privacy Scope Resolution
	if (event.locals.user) {
		const user = event.locals.user;
		if (user.isHeadOffice || user.role === "admin" || user.role === "manager") {
			// Head Office staff: can switch active branch filter via cookie or query param
			const queryBranch = event.url.searchParams.get("branch");
			if (queryBranch !== null) {
				const bId = Number(queryBranch);
				if (bId > 0) {
					event.cookies.set(ACTIVE_BRANCH_COOKIE, String(bId), { path: "/", httpOnly: false, sameSite: "lax" });
					event.locals.activeBranchId = bId;
				} else {
					event.cookies.delete(ACTIVE_BRANCH_COOKIE, { path: "/" });
					event.locals.activeBranchId = null; // All Branches
				}
			} else {
				const cookieBranch = event.cookies.get(ACTIVE_BRANCH_COOKIE);
				if (cookieBranch && Number(cookieBranch) > 0) {
					event.locals.activeBranchId = Number(cookieBranch);
				} else {
					event.locals.activeBranchId = null; // All Branches
				}
			}
		} else {
			// Child Branch staff: Strictly locked to their assigned branchId
			event.locals.activeBranchId = user.branchId ?? null;
		}
	}

	return resolve(event);
};

export const handle = sequence(handleSession);

export function requireUser(locals: RequestEvent["locals"]): SessionUser {
	if (!locals.user) throw redirect(303, "/login");
	return locals.user;
}

/**
 * Returns the branchId to filter by for data privacy.
 * - Child branch users: always returns their branchId (private data).
 * - HO/Admin users: returns selected branchId or null if viewing all branches.
 */
export function getBranchFilter(locals: RequestEvent["locals"]): number | null {
	if (!locals.user) return null;
	if (locals.user.isHeadOffice || locals.user.role === "admin") {
		return locals.activeBranchId ?? null;
	}
	return locals.user.branchId ?? null;
}

export { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, ACTIVE_BRANCH_COOKIE, SESSION_COOKIE };
