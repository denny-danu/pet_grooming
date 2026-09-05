import { db } from "./db";
import { pets } from "./db/schema";
import { eq } from "drizzle-orm";

export class VaccineGateError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "VaccineGateError";
	}
}

export async function vaccineGate(petId: number, at: Date): Promise<void> {
	const pet = await db.query.pets.findFirst({ where: eq(pets.id, petId) });
	if (!pet) throw new VaccineGateError("Pet not found");
	if (!pet.lastVaccinationDate) {
		throw new VaccineGateError(`${pet.name} has no vaccination record on file.`);
	}
	const due = pet.vaccinationDueDate ? new Date(pet.vaccinationDueDate) : null;
	if (due && due < at) {
		throw new VaccineGateError(`${pet.name}'s vaccination expired on ${due.toISOString().slice(0, 10)}.`);
	}
}

export function vaccineStatus(pet: { vaccinationDueDate: string | Date | null }) {
	if (!pet.vaccinationDueDate) return "missing";
	const due = new Date(pet.vaccinationDueDate);
	if (due < new Date()) return "expired";
	const days = Math.round((due.getTime() - Date.now()) / 86_400_000);
	return days <= 30 ? "expiring" : "valid";
}
