<script lang="ts">
	import { resolve } from '$app/paths';

	let {
		href,
		title,
		text
	}: { href: '/fame' | '/quests' | '/pets' | '/characters'; title: string; text: string } =
		$props();

	const accents = {
		'/fame': 'var(--accent-fame-soft)',
		'/quests': 'var(--accent-quest-soft)',
		'/pets': 'var(--accent-pet-soft)',
		'/characters': 'var(--accent-character-soft)'
	};
</script>

<a class="card feature" href={resolve(href)} style:--accent={accents[href]}>
	<span class="card-title">{title}</span>
	<span class="text">{text}</span>
</a>

<style>
	.feature {
		min-height: 44px;
		align-content: start;
		border-top: 8px solid var(--accent);
		transition:
			transform 200ms ease,
			border-color 200ms ease;
	}
	.feature:hover {
		transform: translateY(-2px);
	}
	.text {
		color: var(--ink-soft);
		font-size: 0.9375rem;
	}
</style>
