import { describe, expect, it } from 'vitest';
import * as v from 'valibot';
import rawChangelog from './changelog.json';
import { ChangelogSchema } from './schema.js';

describe('changelog data shape', () => {
	it('changelog.json parses through the schema', () => {
		const result = v.safeParse(ChangelogSchema, rawChangelog);
		expect(result.success).toBe(true);
	});

	it('fails when a required field is removed', () => {
		const [first] = structuredClone(rawChangelog);
		delete (first as Record<string, unknown>).version;
		const result = v.safeParse(ChangelogSchema, [first]);
		expect(result.success).toBe(false);
	});
});
