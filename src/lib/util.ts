export function encodeBase64(input: string): string {
	return Buffer.from(input, "utf8").toString("base64url");
}

export function decodeBase64(input: string): string {
	return Buffer.from(input, "base64url").toString("utf8");
}

export function formatRupiah(amount: number | null | undefined): string {
	if (amount === null || amount === undefined || isNaN(amount)) return "Rp 0";
	return `Rp ${Math.round(amount).toLocaleString("id-ID")}`;
}

export const money = formatRupiah;
