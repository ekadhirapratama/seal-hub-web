import * as v from 'valibot';

// damage[weapon][i] = damage percent of that weapon element against monster elements[i].
export const ElementsSchema = v.pipe(
	v.object({
		elements: v.pipe(v.array(v.string()), v.minLength(1)),
		damage: v.record(v.string(), v.array(v.number()))
	}),
	v.check(
		({ elements, damage }) => elements.every((id) => damage[id]?.length === elements.length),
		'damage must be a full square matrix over elements'
	)
);

export type ElementsData = v.InferOutput<typeof ElementsSchema>;
