import { describe, expect, it } from 'vitest';
import * as v from 'valibot';
import rawChangelog from './changelog.json';
import rawJobs from './jobs.json';
import { ChangelogSchema, JobsSchema } from './schema.js';

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

describe('jobs data shape', () => {
	it('jobs.json parses through the schema', () => {
		expect(v.safeParse(JobsSchema, rawJobs).success).toBe(true);
	});

	it('fails on a duplicate id', () => {
		expect(v.safeParse(JobsSchema, [rawJobs[0], rawJobs[0]]).success).toBe(false);
	});

	it('fails on a dangling parentId', () => {
		const job = { id: 'x', name: 'X', tier: 2, parentId: 'missing' };
		expect(v.safeParse(JobsSchema, [job]).success).toBe(false);
	});
});
