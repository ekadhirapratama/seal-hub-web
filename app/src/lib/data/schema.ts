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
