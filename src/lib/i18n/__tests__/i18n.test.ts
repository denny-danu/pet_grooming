import { describe, it, expect } from "vitest";
import en from "../en.json";
import id from "../id.json";
import { translate } from "../translate";
import { defaultLocale } from "../index";

const enKeys = Object.keys(en).sort();
const idKeys = Object.keys(id).sort();

describe("i18n catalog parity", () => {
	it("id.json has exactly the same keys as en.json", () => {
		expect(idKeys).toEqual(enKeys);
	});

	it("every translation resolves to a non-empty, non-key string", () => {
		for (const key of enKeys) {
			expect(id[key as keyof typeof id], `id:${key}`).toBeTruthy();
		}
	});

	it("translates en and id to distinct output", () => {
		expect(translate("en", "auth.signIn")).toBe("Sign in");
		expect(translate("id", "auth.signIn")).toBe("Masuk");
		expect(translate("id", "auth.signIn")).not.toBe(translate("en", "auth.signIn"));

		expect(translate("en", "nav.retail")).toBe("Pet Shop & Retail");
		expect(translate("id", "nav.retail")).toBe("Toko Hewan & Ritel");

		expect(translate("en", "nav.branchView")).toBe("Branch view");
		expect(translate("id", "nav.branchView")).toBe("Tampilan cabang");
	});

	it("interpolates params", () => {
		expect(translate("en", "dash.goodDay", { name: "Ada" })).toContain("Ada");
		expect(translate("id", "dash.goodDay", { name: "Ada" })).toContain("Ada");
	});

	it("falls back to English for an unknown locale or missing id key", () => {
		// en key added but id missing => fallback to source
		expect(translate(defaultLocale, "auth.signIn")).toBe("Sign in");
	});
});
