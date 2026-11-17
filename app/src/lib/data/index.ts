import * as v from 'valibot';
import rawChangelog from './changelog.json';
import { ChangelogSchema, type Changelog, type ChangelogEntry } from './schema.js';

export type { Changelog, ChangelogEntry };

export const changelog: Changelog = v.parse(ChangelogSchema, rawChangelog);
