import * as v from 'valibot';
import {
	CharacterSchema,
	CharacterInputSchema,
	type Character,
	type CharacterInput
} from '#lib/characters.js';

const KEY = 'seal-hub';
const VERSION = 1;

// Each entry upgrades stored data from version n to n + 1. Empty until the first schema change.
const migrations: Record<number, (data: Record<string, unknown>) => Record<string, unknown>> = {};

const StateSchema = v.object({
	version: v.literal(VERSION),
	characters: v.array(CharacterSchema),
	activeCharacterId: v.optional(v.string())
});
type Data = v.InferOutput<typeof StateSchema>;

export type Status = 'empty' | 'ok' | 'unreadable' | 'unavailable';
export type Reason = 'readonly' | 'invalid' | 'not-found' | 'write-failed';
export type Result = { ok: true; id?: string } | { ok: false; reason: Reason };

const emptyData = (): Data => ({ version: VERSION, characters: [] });

function read(): { status: Status; data: Data; raw?: string } {
	let raw: string | null;
	try {
		raw = localStorage.getItem(KEY);
	} catch {
		return { status: 'unavailable', data: emptyData() };
	}
	if (raw === null) return { status: 'empty', data: emptyData() };
	const bad = { status: 'unreadable', data: emptyData(), raw } as const;
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return bad;
	}
	if (typeof parsed !== 'object' || parsed === null) return bad;
	let data = parsed as Record<string, unknown>;
	if (!Number.isInteger(data.version) || (data.version as number) > VERSION) return bad;
	while ((data.version as number) < VERSION) {
		const migrate = migrations[data.version as number];
		if (!migrate) return bad;
		data = { ...migrate(data), version: (data.version as number) + 1 };
	}
	const result = v.safeParse(StateSchema, data);
	return result.success ? { status: 'ok', data: result.output } : bad;
}

function write(data: Data, key = KEY): boolean {
	try {
		localStorage.setItem(key, JSON.stringify(data));
		return true;
	} catch {
		return false;
	}
}

export class CharacterStore {
	loaded = $state(false);
	status = $state<Status>('empty');
	characters = $state<Character[]>([]);
	#active = $state<string>();
	#listening = false;

	/** Stale ids (deleted character) read as undefined. */
	get activeCharacterId(): string | undefined {
		return this.characters.some((c) => c.id === this.#active) ? this.#active : undefined;
	}

	get readonly(): boolean {
		return this.status === 'unreadable' || this.status === 'unavailable';
	}

	/** Browser only: loads state and follows changes made in other tabs. */
	init() {
		this.reload();
		if (this.#listening) return;
		this.#listening = true;
		window.addEventListener('storage', (e) => {
			if (e.key === KEY || e.key === null) this.reload();
		});
	}

	reload() {
		const { status, data } = read();
		this.status = status;
		this.characters = data.characters;
		this.#active = data.activeCharacterId;
		this.loaded = true;
	}

	// Re-reads storage before every change so a stale tab cannot overwrite a newer one.
	#mutate(change: (data: Data) => Result | void): Result {
		const { status, data } = read();
		if (status === 'unreadable' || status === 'unavailable') {
			this.reload();
			return { ok: false, reason: 'readonly' };
		}
		const result = change(data) ?? { ok: true };
		if (!result.ok) {
			this.reload();
			return result;
		}
		if (!write(data)) {
			this.reload();
			return { ok: false, reason: 'write-failed' };
		}
		this.reload();
		return result;
	}

	add(input: CharacterInput): Result {
		const parsed = v.safeParse(CharacterInputSchema, input);
		if (!parsed.success) return { ok: false, reason: 'invalid' };
		const id = crypto.randomUUID();
		return this.#mutate((data) => {
			data.characters.push({ id, ...parsed.output });
			return { ok: true, id };
		});
	}

	update(id: string, patch: Partial<CharacterInput>): Result {
		return this.#mutate((data) => {
			const index = data.characters.findIndex((c) => c.id === id);
			if (index < 0) return { ok: false, reason: 'not-found' };
			const { id: _id, ...current } = data.characters[index];
			void _id;
			const parsed = v.safeParse(CharacterInputSchema, { ...current, ...patch });
			if (!parsed.success) return { ok: false, reason: 'invalid' };
			data.characters[index] = { id, ...parsed.output };
			return { ok: true, id };
		});
	}

	remove(id: string): Result {
		return this.#mutate((data) => {
			if (!data.characters.some((c) => c.id === id)) return { ok: false, reason: 'not-found' };
			data.characters = data.characters.filter((c) => c.id !== id);
			if (data.activeCharacterId === id) delete data.activeCharacterId;
		});
	}

	setActive(id: string): Result {
		return this.#mutate((data) => {
			if (!data.characters.some((c) => c.id === id)) return { ok: false, reason: 'not-found' };
			data.activeCharacterId = id;
		});
	}

	/** Backs up an unreadable value, then starts empty. Aborts if the backup fails. */
	reset(): Result {
		const { status, raw } = read();
		if (status === 'unavailable') return { ok: false, reason: 'readonly' };
		if (status === 'unreadable' && raw !== undefined) {
			try {
				localStorage.setItem(`${KEY}:corrupt-${Date.now()}`, raw);
			} catch {
				return { ok: false, reason: 'write-failed' };
			}
		}
		const ok = write(emptyData());
		this.reload();
		return ok ? { ok: true } : { ok: false, reason: 'write-failed' };
	}
}

export const store = new CharacterStore();
