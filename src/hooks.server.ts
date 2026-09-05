import type { Handle, RequestEvent } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

import { getSession, SESSION_COOKIE, type SessionUser } from "$lib/server/session";

export const handleSession: Handle = async ({ event, resolve }) => {
	event.locals.user = null;
	const token = event.cookies.get(SESSION_COOKIE);
	if (token) {
		const user = await getSession(token);
		if (user) event.locals.user = user;
	}
	return resolve(event);
};

export const handle = sequence(handleSession);

export function requireUser(locals: RequestEvent["locals"]): SessionUser {
	if (!locals.user) throw redirect(303, "/login");
	return locals.user;
}

export { SESSION_COOKIE };
