import { db } from "$lib/server/db";
import { staff, bookings } from "$lib/server/db/schema";
import { eq, asc, sql, count } from "drizzle-orm";
import { requireUser, bcryptHash } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);

	const staffList = await db
		.select({
			id: staff.id,
			name: staff.name,
			email: staff.email,
			role: staff.role,
			active: staff.active,
			specialty: staff.specialty,
			createdAt: staff.createdAt,
			bookingCount: sql<number>`cast((select count(*) from bookings b where b.staff_id = ${staff.id}) as integer)`
		})
		.from(staff)
		.orderBy(asc(staff.name));

	const totalActive = staffList.filter((s) => s.active).length;
	const groomersCount = staffList.filter((s) => s.role === "groomer" && s.active).length;
	const managersCount = staffList.filter((s) => (s.role === "manager" || s.role === "admin") && s.active).length;

	return {
		user,
		staff: staffList,
		totalCount: staffList.length,
		totalActive,
		groomersCount,
		managersCount
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		requireUser(locals);
		const form = await request.formData();
		const name = String(form.get("name") ?? "").trim();
		const email = String(form.get("email") ?? "").toLowerCase().trim();
		const role = String(form.get("role") ?? "receptionist") as "admin" | "manager" | "receptionist" | "groomer" | "caretaker" | "specialist";
		const specialty = String(form.get("specialty") ?? "").trim() || null;
		const password = String(form.get("password") ?? "").trim();

		if (!name || !email || !password) {
			return fail(400, { createError: "Name, email, and password are required.", name, email, role, specialty });
		}

		if (password.length < 6) {
			return fail(400, { createError: "Password must be at least 6 characters.", name, email, role, specialty });
		}

		const existing = await db.query.staff.findFirst({ where: eq(staff.email, email) });
		if (existing) {
			return fail(400, { createError: "A staff member with this email already exists.", name, email, role, specialty });
		}

		const passwordHash = await bcryptHash(password);

		await db.insert(staff).values({
			name,
			email,
			role,
			specialty,
			passwordHash,
			active: true
		});

		return { created: true };
	},

	toggleStatus: async ({ request, locals }) => {
		const currentUser = requireUser(locals);
		const form = await request.formData();
		const staffId = Number(form.get("staffId"));

		if (staffId === currentUser.id) {
			return fail(400, { actionError: "You cannot deactivate your own account." });
		}

		const target = await db.query.staff.findFirst({ where: eq(staff.id, staffId) });
		if (!target) return fail(404, { actionError: "Staff member not found." });

		await db.update(staff).set({ active: !target.active }).where(eq(staff.id, staffId));
		return { ok: true };
	},

	update: async ({ request, locals }) => {
		requireUser(locals);
		const form = await request.formData();
		const staffId = Number(form.get("staffId"));
		const name = String(form.get("name") ?? "").trim();
		const role = String(form.get("role") ?? "receptionist") as "admin" | "manager" | "receptionist" | "groomer" | "caretaker" | "specialist";
		const specialty = String(form.get("specialty") ?? "").trim() || null;

		if (!staffId || !name) {
			return fail(400, { updateError: "Name is required." });
		}

		await db.update(staff).set({ name, role, specialty }).where(eq(staff.id, staffId));
		return { updated: true };
	}
};
