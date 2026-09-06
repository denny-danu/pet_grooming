/** Species → emoji / label helpers shared across booking + customer UIs. */

const SPECIES_EMOJI: Record<string, string> = {
	dog: "🐶",
	cat: "🐱",
	bird: "🦜",
	fish: "🐠",
	reptile: "🦎",
	other: "🐾"
};

export function getSpeciesEmoji(species: string | null | undefined): string {
	if (!species) return SPECIES_EMOJI.dog;
	return SPECIES_EMOJI[species] ?? SPECIES_EMOJI.other;
}

export function getSpeciesLabel(species: string | null | undefined): string {
	const labels: Record<string, string> = {
		dog: "Dog",
		cat: "Cat",
		bird: "Bird",
		fish: "Fish",
		reptile: "Reptile",
		other: "Other"
	};
	if (!species) return "Pet";
	return labels[species] ?? species;
}
