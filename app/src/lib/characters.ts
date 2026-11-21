import * as v from 'valibot';

// Sample value, not verified against the game.
export const MAX_LEVEL = 251;
export const MAX_NAME_LENGTH = 24;

export const CharacterInputSchema = v.object({
	name: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(MAX_NAME_LENGTH)),
	// Id existence is checked in the form, not here: a renamed job must not lock out stored data.
	job: v.pipe(v.string(), v.minLength(1)),
	level: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(MAX_LEVEL)),
	fame: v.pipe(v.number(), v.integer(), v.minValue(0))
});

export const CharacterSchema = v.object({ id: v.string(), ...CharacterInputSchema.entries });

export type CharacterInput = v.InferOutput<typeof CharacterInputSchema>;
export type Character = v.InferOutput<typeof CharacterSchema>;

export type FormValues = { name: string; job: string; level: string; fame: string };
export type FormError = 'name_required' | 'name_max' | 'job_required' | 'level_range' | 'fame_min';
export type FormErrors = Partial<Record<keyof FormValues, FormError>>;

const digits = /^\d+$/;

/** Validates raw form strings; `jobIds` limits which job ids the form accepts. */
export function validateForm(
	values: FormValues,
	jobIds: readonly string[]
): { ok: true; value: CharacterInput } | { ok: false; errors: FormErrors } {
	const errors: FormErrors = {};
	const name = values.name.trim();
	if (name.length === 0) errors.name = 'name_required';
	else if (name.length > MAX_NAME_LENGTH) errors.name = 'name_max';
	if (!jobIds.includes(values.job)) errors.job = 'job_required';
	const level = digits.test(values.level.trim()) ? Number(values.level.trim()) : NaN;
	if (!(level >= 1 && level <= MAX_LEVEL)) errors.level = 'level_range';
	// Thousand separators and spaces typed by the user are stripped before parsing.
	const fameText = values.fame.replace(/[.,\s]/g, '');
	const fame = digits.test(fameText) ? Number(fameText) : NaN;
	if (!Number.isSafeInteger(fame)) errors.fame = 'fame_min';
	if (Object.keys(errors).length > 0) return { ok: false, errors };
	return { ok: true, value: { name, job: values.job, level, fame } };
}

/** Returns `target` only when it is a same-origin path; anything else is ignored. */
export function safeReturn(target: string | null): string | null {
	if (!target || !target.startsWith('/') || target.startsWith('//') || target.includes('\\'))
		return null;
	return target;
}
