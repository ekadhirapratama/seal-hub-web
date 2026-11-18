<script lang="ts">
	import { resolve } from '$app/paths';

	let {
		href,
		title,
		text
	}: { href: '/fame' | '/quests' | '/pets' | '/characters'; title: string; text: string } =
		$props();

	const accents = {
		'/fame': 'var(--accent-fame)',
		'/quests': 'var(--accent-quest)',
		'/pets': 'var(--accent-pet)',
		'/characters': 'var(--accent-character)'
	};
</script>

<a class="card feature" href={resolve(href)} style:--accent={accents[href]}>
	<span class="card-title">{title}</span>
	<span class="text">{text}</span>
	<svg class="arrow" viewBox="0 0 24 24" aria-hidden="true">
		<path d="M5 12h14M13 6l6 6-6 6" />
	</svg>
</a>

<style>
	.feature {
		min-height: 44px;
		align-content: start;
		border-top: 8px solid var(--accent);
		transition:
			transform 150ms ease,
			box-shadow 150ms ease;
	}
	.arrow {
		justify-self: end;
		width: 24px;
		height: 24px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.text {
		color: var(--ink-soft);
		font-size: 0.9375rem;
	}
</style>
