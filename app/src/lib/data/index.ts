import * as v from 'valibot';
import rawChangelog from './changelog.json';
import rawElements from './elements.json';
import rawJobs from './jobs.json';
import {
	ChangelogSchema,
	JobsSchema,
	type Changelog,
	type ChangelogEntry,
	type Job,
	type Jobs
} from './schema.js';
import { ElementsSchema, type ElementsData } from './elements-schema.js';

export type { Changelog, ChangelogEntry, ElementsData, Job, Jobs };

export const changelog: Changelog = v.parse(ChangelogSchema, rawChangelog);
export const elementsData: ElementsData = v.parse(ElementsSchema, rawElements);
export const jobs: Jobs = v.parse(JobsSchema, rawJobs);
