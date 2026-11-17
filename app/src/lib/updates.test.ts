import { describe, expect, it } from 'vitest';
import { splitUpdates } from './updates.js';

const make = (n: number) =>
	Array.from({ length: n }, (_, i) => ({
		version: `0.${i}.0`,
		date: `2026-01-${String(i + 1).padStart(2, '0')}`,
		changes: ['x']
	}));

describe('splitUpdates', () => {
	it('shows 5 newest first and folds the rest', () => {
		const input = make(7);
		const { visible, older } = splitUpdates(input);
		expect(visible.map((e) => e.version)).toEqual(['0.6.0', '0.5.0', '0.4.0', '0.3.0', '0.2.0']);
		expect(older.map((e) => e.version)).toEqual(['0.1.0', '0.0.0']);
		expect(input[0].version).toBe('0.0.0');
	});

	it('returns nothing for an empty list', () => {
		expect(splitUpdates([])).toEqual({ visible: [], older: [] });
	});
});
