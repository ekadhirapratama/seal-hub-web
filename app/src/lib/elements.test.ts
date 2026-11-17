import { describe, expect, it } from 'vitest';
import * as v from 'valibot';
import rawElements from './data/elements.json';
import { ElementsSchema } from './data/elements-schema.js';
import { bestAgainst, elementIds, multiplier, tier } from './elements.js';

describe('elements', () => {
	it('has 9 elements and a square matrix', () => {
		expect(elementIds).toHaveLength(9);
		expect(v.safeParse(ElementsSchema, rawElements).success).toBe(true);
	});

	it('rejects a non-square matrix', () => {
		const bad = structuredClone(rawElements);
		bad.damage.fire.pop();
		expect(v.safeParse(ElementsSchema, bad).success).toBe(false);
	});

	it('looks up row=weapon, column=monster', () => {
		expect(multiplier('fire', 'steel')).toBe(150);
		expect(multiplier('steel', 'fire')).toBe(25);
		expect(multiplier('fire', 'fire')).toBe(50);
		expect(multiplier('physical', 'physical')).toBe(10);
		expect(multiplier('magical', 'physical')).toBe(200);
	});

	it('ranks best weapon first', () => {
		expect(bestAgainst('steel')[0]).toEqual({ weapon: 'fire', value: 150 });
		expect(
			bestAgainst('physical')
				.slice(0, 7)
				.every((r) => r.value === 200)
		).toBe(true);
	});

	it('classifies tiers', () => {
		expect([tier(150), tier(100), tier(25)]).toEqual(['strong', 'normal', 'weak']);
	});
});
