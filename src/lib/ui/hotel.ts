/**
 * Pet Hotel roster helpers: date formatting and medication detection.
 * Pure functions, shared between the roster page and its suite cards.
 */

export type PetCareJson = {
	feeding?: string;
	walksPerDay?: number;
	medication?: string;
	meds?: string;
} | null;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Format `YYYY-MM-DD` as `D Mon YYYY` (e.g. `12 Mar 2026`). */
export function fmtDateStr(d: string | null | undefined): string {
	if (!d) return "-";
	try {
		const parts = d.split("-");
		if (parts.length === 3) {
			const monthIndex = parseInt(parts[1], 10) - 1;
			return `${parseInt(parts[2], 10)} ${MONTHS[monthIndex]} ${parts[0]}`;
		}
		return d;
	} catch {
		return d;
	}
}

/** Format a roster date for the display heading in a given locale. */
export function fmtDisplayHeadingDate(d: string, locale = "id-ID"): string {
	try {
		const date = new Date(`${d}T12:00:00`);
		return date.toLocaleDateString(locale, {
			weekday: "long",
			day: "numeric",
			month: "long",
			year: "numeric"
		});
	} catch {
		return d;
	}
}

export type SuiteLike = {
	stay?: { petCareJson?: PetCareJson } | null;
	pet?: { healthNotes?: string | null } | null;
};

/** Whether this pet/stay has any medication instructions on file. */
export function hasMedication(suite: SuiteLike): boolean {
	const petCare = suite.stay?.petCareJson;
	if (petCare?.medication && petCare.medication.trim() !== "") return true;
	if (petCare?.meds && petCare.meds.trim() !== "") return true;
	if (suite.pet?.healthNotes && suite.pet.healthNotes.toLowerCase().includes("med")) return true;
	return false;
}

/** Human-readable medication instruction, falling back to health notes. */
export function getMedicationText(suite: SuiteLike, noneLabel = "Tidak ada resep obat khusus"): string {
	const petCare = suite.stay?.petCareJson;
	if (petCare?.medication && petCare.medication.trim() !== "") return petCare.medication;
	if (petCare?.meds && petCare.meds.trim() !== "") return petCare.meds;
	if (suite.pet?.healthNotes) return suite.pet.healthNotes;
	return noneLabel;
}
