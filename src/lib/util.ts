export function encodeBase64(input: string): string {
	return Buffer.from(input, "utf8").toString("base64url");
}

export function decodeBase64(input: string): string {
	return Buffer.from(input, "base64url").toString("utf8");
}
