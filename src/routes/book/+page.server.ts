import { redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
	const search = url.search;
	throw redirect(303, `/${search}`);
};

export const actions: Actions = {
	default: async ({ request, url }) => {
		throw redirect(303, `/${url.search}`);
	}
};
