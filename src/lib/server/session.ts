import { db } from "$lib/server/db";
import { staff, branches } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

export type SessionUser = {
	id: number;
	email: string;
	name: string;
	role: string;
	branchId?: number | null;
	branchName?: string | null;
	branchCode?: string | null;
	isHeadOffice?: boolean;
};

export type JwtPayload = {
	sub: number; // staff id
	email?: string;
	name?: string;
	role?: string;
	branchId?: number | null;
	type: "access" | "refresh";
	iat: number;
	exp: number;
};

const JWT_SECRET = process.env.JWT_SECRET ?? "petco-super-secret-jwt-signing-key-2026";
const ACCESS_TOKEN_EXP_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TOKEN_EXP_SECONDS = 14 * 24 * 60 * 60; // 14 days

export const ACCESS_TOKEN_COOKIE = "petco_access_token";
export const REFRESH_TOKEN_COOKIE = "petco_refresh_token";
export const ACTIVE_BRANCH_COOKIE = "petco_active_branch";
export const SESSION_COOKIE = ACCESS_TOKEN_COOKIE; // Backwards-compatible alias

function base64UrlEncode(str: string): string {
	return Buffer.from(str)
		.toString("base64")
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
	let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
	while (base64.length % 4) {
		base64 += "=";
	}
	return Buffer.from(base64, "base64").toString("utf-8");
}

export function signJwt(payload: Omit<JwtPayload, "iat">, secret = JWT_SECRET): string {
	const header = { alg: "HS256", typ: "JWT" };
	const iat = Math.floor(Date.now() / 1000);
	const fullPayload: JwtPayload = { ...payload, iat };

	const encodedHeader = base64UrlEncode(JSON.stringify(header));
	const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
	const signature = crypto
		.createHmac("sha256", secret)
		.update(`${encodedHeader}.${encodedPayload}`)
		.digest("base64")
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");

	return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyJwt(token: string, secret = JWT_SECRET): JwtPayload | null {
	if (!token || typeof token !== "string") return null;
	const parts = token.split(".");
	if (parts.length !== 3) return null;

	const [encodedHeader, encodedPayload, signature] = parts;
	const expectedSignature = crypto
		.createHmac("sha256", secret)
		.update(`${encodedHeader}.${encodedPayload}`)
		.digest("base64")
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");

	try {
		const sigBuf = Buffer.from(signature);
		const expBuf = Buffer.from(expectedSignature);
		if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
			return null;
		}
	} catch {
		return null;
	}

	try {
		const payload: JwtPayload = JSON.parse(base64UrlDecode(encodedPayload));
		const now = Math.floor(Date.now() / 1000);
		if (payload.exp && payload.exp < now) {
			return null;
		}
		return payload;
	} catch {
		return null;
	}
}

export function createAccessToken(user: SessionUser): string {
	const now = Math.floor(Date.now() / 1000);
	return signJwt({
		sub: user.id,
		email: user.email,
		name: user.name,
		role: user.role,
		branchId: user.branchId ?? null,
		type: "access",
		exp: now + ACCESS_TOKEN_EXP_SECONDS
	});
}

export function createRefreshToken(user: { id: number }): string {
	const now = Math.floor(Date.now() / 1000);
	return signJwt({
		sub: user.id,
		type: "refresh",
		exp: now + REFRESH_TOKEN_EXP_SECONDS
	});
}

export function createAuthTokens(user: SessionUser) {
	return {
		accessToken: createAccessToken(user),
		refreshToken: createRefreshToken(user)
	};
}

export async function getSessionUser(id: number) {
	const staffRow = await db.query.staff.findFirst({
		where: eq(staff.id, id)
	});
	if (!staffRow) return null;

	let branch = null;
	if (staffRow.branchId) {
		branch = await db.query.branches.findFirst({
			where: eq(branches.id, staffRow.branchId)
		});
	}

	return {
		...staffRow,
		branchName: branch?.name ?? (staffRow.role === "admin" ? "Head Office" : null),
		branchCode: branch?.code ?? (staffRow.role === "admin" ? "HO" : null),
		isHeadOffice: branch?.isHeadOffice ?? (staffRow.role === "admin" || staffRow.role === "manager")
	};
}

export async function getSession(token: string): Promise<SessionUser | null> {
	if (!token) return null;
	const payload = verifyJwt(token);
	if (!payload || !payload.sub || payload.type !== "access") return null;

	const row = await getSessionUser(payload.sub);
	if (!row || !row.active) return null;
	return {
		id: row.id,
		email: row.email,
		name: row.name,
		role: row.role,
		branchId: row.branchId,
		branchName: row.branchName,
		branchCode: row.branchCode,
		isHeadOffice: row.isHeadOffice
	};
}

export async function refreshSession(refreshToken: string): Promise<{ user: SessionUser; accessToken: string; newRefreshToken: string } | null> {
	if (!refreshToken) return null;
	const payload = verifyJwt(refreshToken);
	if (!payload || !payload.sub || payload.type !== "refresh") return null;

	const row = await getSessionUser(payload.sub);
	if (!row || !row.active) return null;

	const user: SessionUser = {
		id: row.id,
		email: row.email,
		name: row.name,
		role: row.role,
		branchId: row.branchId,
		branchName: row.branchName,
		branchCode: row.branchCode,
		isHeadOffice: row.isHeadOffice
	};
	const accessToken = createAccessToken(user);
	const newRefreshToken = createRefreshToken(user);

	return { user, accessToken, newRefreshToken };
}
