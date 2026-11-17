import type { ChangelogEntry } from '#lib/data/index.js';

export const VISIBLE_UPDATES = 5;

/** Newest first; copies the input so the data index stays untouched. */
export function splitUpdates(entries: readonly ChangelogEntry[]) {
	const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
	return { visible: sorted.slice(0, VISIBLE_UPDATES), older: sorted.slice(VISIBLE_UPDATES) };
}
