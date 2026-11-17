import * as v from 'valibot';
import rawChangelog from './changelog.json';
import rawElements from './elements.json';
import { ChangelogSchema, type Changelog, type ChangelogEntry } from './schema.js';
import { ElementsSchema, type ElementsData } from './elements-schema.js';

export type { Changelog, ChangelogEntry, ElementsData };

export const changelog: Changelog = v.parse(ChangelogSchema, rawChangelog);
export const elementsData: ElementsData = v.parse(ElementsSchema, rawElements);
