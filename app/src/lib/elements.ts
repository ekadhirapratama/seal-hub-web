import { elementsData } from '#lib/data/index.js';

export type ElementId = string;

export const elementIds: readonly ElementId[] = elementsData.elements;

/** Damage percent of `weapon` element against a `target` monster element. */
export function multiplier(weapon: ElementId, target: ElementId): number {
	return elementsData.damage[weapon][elementIds.indexOf(target)];
}

/** Weapon elements ranked best-first against `target` (ties keep canonical order). */
export function bestAgainst(target: ElementId): { weapon: ElementId; value: number }[] {
	return elementIds
		.map((weapon) => ({ weapon, value: multiplier(weapon, target) }))
		.sort((a, b) => b.value - a.value);
}

export type Tier = 'strong' | 'weak' | 'normal';

export function tier(value: number): Tier {
	return value > 100 ? 'strong' : value < 100 ? 'weak' : 'normal';
}
