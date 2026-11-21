import * as v from 'valibot';

export const ChangelogEntrySchema = v.object({
	version: v.string(),
	date: v.string(),
	title: v.optional(v.string()),
	kind: v.optional(v.string()),
	changes: v.pipe(v.array(v.string()), v.minLength(1))
});

export const ChangelogSchema = v.array(ChangelogEntrySchema);

export type ChangelogEntry = v.InferOutput<typeof ChangelogEntrySchema>;
export type Changelog = v.InferOutput<typeof ChangelogSchema>;

export const JobSchema = v.object({
	id: v.string(),
	name: v.string(),
	tier: v.pipe(v.number(), v.integer(), v.minValue(1)),
	parentId: v.optional(v.string())
});

export const JobsSchema = v.pipe(
	v.array(JobSchema),
	v.check((jobs) => new Set(jobs.map((j) => j.id)).size === jobs.length, 'job ids must be unique'),
	v.check(
		(jobs) => jobs.every((j) => !j.parentId || jobs.some((p) => p.id === j.parentId)),
		'parentId must reference an existing job'
	)
);

export type Job = v.InferOutput<typeof JobSchema>;
export type Jobs = v.InferOutput<typeof JobsSchema>;
