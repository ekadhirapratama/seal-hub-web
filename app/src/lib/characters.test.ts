import { describe, expect, it } from 'vitest';
import * as v from 'valibot';
import { CharacterInputSchema, MAX_LEVEL, safeReturn, validateForm } from './characters.js';

const ok = { name: 'Rascal', job: 'warrior', level: 42, fame: 1200 };
const parse = (patch: object) => v.safeParse(CharacterInputSchema, { ...ok, ...patch }).success;

describe('Character schema', () => {
	it('accepts a valid character', () => expect(parse({})).toBe(true));

	it('bounds the name to 1-24 trimmed characters', () => {
		expect(parse({ name: '' })).toBe(false);
		expect(parse({ name: '   ' })).toBe(false);
		expect(parse({ name: 'a'.repeat(24) })).toBe(true);
		expect(parse({ name: 'a'.repeat(25) })).toBe(false);
	});

	it('requires a job id string', () => {
		expect(parse({ job: '' })).toBe(false);
		expect(parse({ job: 'unknown-but-stored' })).toBe(true);
	});

	it('bounds level to 1..MAX_LEVEL integers', () => {
		expect(MAX_LEVEL).toBe(251);
		expect(parse({ level: 0 })).toBe(false);
		expect(parse({ level: 1 })).toBe(true);
		expect(parse({ level: 251 })).toBe(true);
		expect(parse({ level: 252 })).toBe(false);
		expect(parse({ level: 1.5 })).toBe(false);
	});

	it('requires fame >= 0 integer', () => {
		expect(parse({ fame: 0 })).toBe(true);
		expect(parse({ fame: -1 })).toBe(false);
		expect(parse({ fame: 1.5 })).toBe(false);
	});
});

describe('validateForm', () => {
	const jobs = ['warrior', 'mage'];
	const values = { name: ' Rascal ', job: 'warrior', level: '42', fame: '1200' };

	it('parses and trims valid input', () => {
		expect(validateForm(values, jobs)).toEqual({
			ok: true,
			value: { name: 'Rascal', job: 'warrior', level: 42, fame: 1200 }
		});
	});

	it('strips typed thousand separators from fame', () => {
		for (const fame of ['12.450', '12,450', '12 450']) {
			const r = validateForm({ ...values, fame }, jobs);
			expect(r.ok && r.value.fame).toBe(12450);
		}
	});

	it('does not cross-check level against fame', () => {
		expect(validateForm({ ...values, level: '1', fame: '50000' }, jobs).ok).toBe(true);
	});

	it('reports each invalid field on its own', () => {
		const r = validateForm({ name: '', job: 'nope', level: '252', fame: '-5' }, jobs);
		expect(r).toEqual({
			ok: false,
			errors: {
				name: 'name_required',
				job: 'job_required',
				level: 'level_range',
				fame: 'fame_min'
			}
		});
	});

	it('flags a too-long name and a non-numeric level', () => {
		const r = validateForm({ ...values, name: 'a'.repeat(25), level: 'abc' }, jobs);
		expect(r.ok === false && r.errors).toEqual({ name: 'name_max', level: 'level_range' });
	});
});

describe('safeReturn', () => {
	it('accepts same-origin paths', () => expect(safeReturn('/fame')).toBe('/fame'));

	it('rejects everything else', () => {
		for (const bad of ['//evil.com', 'https://x', '', null, '/\\evil.com', 'fame'])
			expect(safeReturn(bad)).toBeNull();
	});
});
