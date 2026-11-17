import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Measures every token pair used by the UI (features.md §5.3-5.4).
// Reads :root from app.css, so a token edit that breaks contrast fails here.
const css = readFileSync(new URL('../app.css', import.meta.url), 'utf8');
const root = css.match(/:root\s*{([^}]*)}/)![1];
const tokens = Object.fromEntries(
	[...root.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map((m) => [m[1], m[2]])
);

const lum = (hex: string) => {
	const [r, g, b] = [1, 3, 5].map((i) => {
		const c = parseInt(hex.slice(i, i + 2), 16) / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const ratio = (a: string, b: string) => {
	const [hi, lo] = [lum(tokens[a]), lum(tokens[b])].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
};

// [foreground, background]; text pairs need 4.5, UI boundary pairs need 3.
const text: [string, string][] = [
	['ink', 'bg'],
	['ink', 'card'],
	['ink-soft', 'bg'],
	['ink-soft', 'card'],
	['green', 'green-soft'],
	['green', 'card'],
	['green', 'bg'],
	['danger', 'card'],
	['danger', 'warn-soft'],
	['ink', 'gold'],
	['ink', 'gold-soft'],
	['ink', 'coral'],
	['ink', 'coral-strong'],
	['ink', 'warn-soft'],
	['ink', 'pastel-pink'],
	['ink', 'pastel-blue'],
	['ink-soft', 'pastel-pink'],
	['ink-soft', 'pastel-blue'],
	['ink', 'green-soft'],
	['violet', 'bg'],
	['violet', 'violet-soft'],
	['ink', 'violet-soft'],
	...Object.keys(tokens)
		.filter((k) => k.startsWith('el-'))
		.map((k): [string, string] => ['ink', k])
];
const ui: [string, string][] = [
	['ink', 'card'],
	['ink', 'bg'],
	['danger', 'card']
];

describe('token contrast', () => {
	it.each(text)('text %s on %s >= 4.5', (fg, bg) =>
		expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5)
	);
	it.each(ui)('boundary %s on %s >= 3', (fg, bg) =>
		expect(ratio(fg, bg)).toBeGreaterThanOrEqual(3)
	);
	it('table', () => {
		const rows = [...text, ...ui].map(([f, b]) => `${f} / ${b}: ${ratio(f, b).toFixed(2)}`);
		console.log(rows.join('\n'));
		expect(rows.length).toBeGreaterThan(0);
	});
});
