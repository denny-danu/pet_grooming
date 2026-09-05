import { redirect } from "@sveltejs/kit";

export function load() {
	throw redirect(303, "/");
}

export const actions = {
	logout: ({ cookies }) => {
		cookies.delete("petco_session", { path: "/" });
		throw redirect(303, "/login");
	}
};
