/**
 * Aquarium UI helpers: ecosystem labels, water-chemistry parameter
 * evaluation, and date formatting. Pure functions so they are trivially
 * unit-testable and shared across the aquarium hub components.
 */

export type ParamVerdict = {
	text: string;
	status: "none" | "ideal" | "warning" | "alert" | "info";
	class: string;
};

import type { Component } from "svelte";

export type EcosystemMeta = {
	label: string;
	variant: string;
	color: string;
	icon?: Component;
};

const ECOLOGIES: Record<string, { label: string; variant: string; color: string }> = {
	reef: { label: "Reef & Coral", variant: "purple", color: "#7c3aed" },
	planted: { label: "Planted Aquascape", variant: "success", color: "#059669" },
	marine: { label: "Marine Saltwater", variant: "info", color: "#0284c7" },
	brackish: { label: "Brackish Water", variant: "warning", color: "#d97706" },
	cichlid: { label: "African Cichlid", variant: "neutral", color: "#475569" },
	paludarium: { label: "Paludarium", variant: "success", color: "#0d9488" }
};

export function getEcosystemBadge(ecosystem: string, iconResolver?: (kind: string) => Component): EcosystemMeta {
	const e = ecosystem.toLowerCase();
	if (e === "reef" || e.includes("reef") || e.includes("coral")) {
		return { ...ECOLOGIES.reef, icon: iconResolver?.("waves") };
	}
	if (e === "planted" || e.includes("planted") || e.includes("aquascape")) {
		return { ...ECOLOGIES.planted, icon: iconResolver?.("sparkles") };
	}
	if (e === "marine" || e.includes("marine") || e.includes("saltwater")) {
		return { ...ECOLOGIES.marine, icon: iconResolver?.("droplets") };
	}
	if (e === "brackish") return { ...ECOLOGIES.brackish, icon: iconResolver?.("gauge") };
	if (e === "cichlid") return { ...ECOLOGIES.cichlid, icon: iconResolver?.("fish") };
	if (e === "paludarium") return { ...ECOLOGIES.paludarium, icon: iconResolver?.("layers") };
	return { label: "Freshwater", variant: "teal", color: "#0d9488", icon: iconResolver?.("fish") };
}

export function getFrequencyLabel(freq: string): string {
	switch (freq) {
		case "weekly":
			return "Weekly Visit";
		case "bi_weekly":
			return "Bi-Weekly (Every 2 wks)";
		case "monthly":
			return "Monthly Comprehensive";
		case "quarterly":
			return "Quarterly Overhaul";
		default:
			return freq;
	}
}

function verdict(text: string, status: ParamVerdict["status"], class_: string): ParamVerdict {
	return { text, status, class: class_ };
}

export function getParameterStatus(
	param: string,
	value: string | null | undefined,
	ecosystem = "freshwater"
): ParamVerdict {
	if (!value || isNaN(parseFloat(value))) return verdict("—", "none", "text-muted");
	const num = parseFloat(value);
	const isMarine = ecosystem === "reef" || ecosystem === "marine";

	switch (param) {
		case "ph": {
			if (isMarine) {
				if (num >= 8.1 && num <= 8.4) return verdict(num.toFixed(2), "ideal", "param-good");
				if (num >= 7.8 && num <= 8.6) return verdict(num.toFixed(2), "warning", "param-warn");
				return verdict(num.toFixed(2), "alert", "param-alert");
			}
			if (num >= 6.4 && num <= 7.6) return verdict(num.toFixed(2), "ideal", "param-good");
			if (num >= 6.0 && num <= 8.2) return verdict(num.toFixed(2), "warning", "param-warn");
			return verdict(num.toFixed(2), "alert", "param-alert");
		}
		case "ammonia":
		case "nitrite": {
			if (num === 0) return verdict("0.00 ppm", "ideal", "param-good");
			if (num <= 0.25) return verdict(`${num.toFixed(2)} ppm`, "warning", "param-warn");
			return verdict(`${num.toFixed(2)} ppm`, "alert", "param-alert");
		}
		case "nitrate": {
			const limit = isMarine ? [10, 25] : [20, 40];
			if (num <= limit[0]) return verdict(`${num} ppm`, "ideal", "param-good");
			if (num <= limit[1]) return verdict(`${num} ppm`, "warning", "param-warn");
			return verdict(`${num} ppm`, "alert", "param-alert");
		}
		case "salinity": {
			if (num >= 1.023 && num <= 1.026) return verdict(`${num} SG`, "ideal", "param-good");
			if (num >= 30 && num <= 35) return verdict(`${num} ppt`, "ideal", "param-good");
			return verdict(String(num), "info", "param-info");
		}
		case "temp": {
			if (num >= 24.0 && num <= 27.5) return verdict(`${num}°C`, "ideal", "param-good");
			if (num >= 22.0 && num <= 29.0) return verdict(`${num}°C`, "warning", "param-warn");
			return verdict(`${num}°C`, "alert", "param-alert");
		}
		case "kh":
			return verdict(`${num} dKH`, "info", "param-info");
		default:
			return verdict(String(value), "info", "param-info");
	}
}

/** Format a date for the aquarium hub; falls back to locale `id-ID`. */
export function formatDate(d: Date | string | null | undefined, includeTime = false, locale = "id-ID"): string {
	if (!d) return "—";
	const dateObj = typeof d === "string" ? new Date(d) : d;
	if (isNaN(dateObj.getTime())) return "—";
	return dateObj.toLocaleDateString(locale, {
		day: "numeric",
		month: "short",
		year: "numeric",
		...(includeTime ? { hour: "2-digit", minute: "2-digit" as const } : {})
	});
}
