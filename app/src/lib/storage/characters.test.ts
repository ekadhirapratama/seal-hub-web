import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CharacterStore } from './characters.svelte.js';

const input = { name: 'Rascal', job: 'warrior', level: 42, fame: 1200 };
let backing: Map<string, string>;
let failWrites = false;

beforeEach(() => {
	backing = new Map();
	failWrites = false;
	vi.stubGlobal('localStorage', {
		getItem: (k: string) => backing.get(k) ?? null,
		setItem: (k: string, val: string) => {
			if (failWrites) throw new Error('quota');
			backing.set(k, val);
		}
	});
});

const fresh = () => {
	const s = new CharacterStore();
	s.reload();
	return s;
};

describe('character store', () => {
	it('adds characters in creation order and persists them', () => {
		const s = fresh();
		const a = s.add(input);
		s.add({ ...input, name: 'Second' });
		expect(a.ok).toBe(true);
		expect(fresh().characters.map((c) => c.name)).toEqual(['Rascal', 'Second']);
	});

	it('handles 20+ characters', () => {
		const s = fresh();
		for (let i = 0; i < 25; i++) s.add({ ...input, name: `c${i}` });
		expect(fresh().characters).toHaveLength(25);
	});

	it('updates only the target and keeps its id', () => {
		const s = fresh();
		const a = s.add(input);
		const b = s.add({ ...input, name: 'Other' });
		const id = a.ok ? a.id! : '';
		expect(s.update(id, { level: 50 })).toEqual({ ok: true, id });
		expect(s.characters[0]).toMatchObject({ id, level: 50, name: 'Rascal' });
		expect(s.characters[1].id).toBe(b.ok ? b.id : '');
		expect(s.characters[1].level).toBe(42);
	});

	it('refuses to update a missing id and does not resurrect it', () => {
		const s = fresh();
		const a = s.add(input);
		const id = a.ok ? a.id! : '';
		s.remove(id);
		expect(s.update(id, { level: 50 })).toEqual({ ok: false, reason: 'not-found' });
		expect(fresh().characters).toEqual([]);
	});

	it('rejects invalid input', () => {
		const s = fresh();
		expect(s.add({ ...input, level: 252 })).toEqual({ ok: false, reason: 'invalid' });
		expect(s.characters).toEqual([]);
	});

	it('removes a character and drops the stale active id', () => {
		const s = fresh();
		const a = s.add(input);
		const id = a.ok ? a.id! : '';
		s.setActive(id);
		expect(s.activeCharacterId).toBe(id);
		s.remove(id);
		expect(s.activeCharacterId).toBeUndefined();
		expect(JSON.parse(backing.get('seal-hub')!).activeCharacterId).toBeUndefined();
	});

	it('ignores an active id that points at a missing character', () => {
		backing.set('seal-hub', JSON.stringify({ version: 1, characters: [], activeCharacterId: 'x' }));
		expect(fresh().activeCharacterId).toBeUndefined();
	});

	it('re-reads before writing so another tab is not overwritten', () => {
		const tabA = fresh();
		const tabB = fresh();
		tabA.add(input);
		tabB.add({ ...input, name: 'FromB' });
		expect(fresh().characters.map((c) => c.name)).toEqual(['Rascal', 'FromB']);
	});

	it('reports a failed write and keeps old data', () => {
		const s = fresh();
		s.add(input);
		failWrites = true;
		expect(s.add({ ...input, name: 'Lost' })).toEqual({ ok: false, reason: 'write-failed' });
		expect(s.characters).toHaveLength(1);
	});

	it.each([
		['not json', '{'],
		['newer version', JSON.stringify({ version: 2, characters: [] })],
		['bad shape', JSON.stringify({ version: 1, characters: [{ id: 1 }] })]
	])('goes read-only on %s and leaves the raw value untouched', (_n, raw) => {
		backing.set('seal-hub', raw);
		const s = fresh();
		expect(s.status).toBe('unreadable');
		expect(s.add(input)).toEqual({ ok: false, reason: 'readonly' });
		expect(backing.get('seal-hub')).toBe(raw);
	});

	it('goes read-only when storage throws', () => {
		vi.stubGlobal('localStorage', {
			getItem: () => {
				throw new Error('blocked');
			},
			setItem: () => {}
		});
		const s = fresh();
		expect(s.status).toBe('unavailable');
		expect(s.add(input)).toEqual({ ok: false, reason: 'readonly' });
	});

	it('reset backs up the unreadable value before starting over', () => {
		backing.set('seal-hub', '{');
		const s = fresh();
		expect(s.reset()).toEqual({ ok: true });
		expect(s.status).toBe('ok');
		const backup = [...backing.keys()].find((k) => k.startsWith('seal-hub:corrupt-'));
		expect(backing.get(backup!)).toBe('{');
	});
});
