<script lang="ts">
	import { resolve } from '$app/paths';

	let {
		href,
		title,
		text,
		status,
		featured = false
	}: {
		href: '/fame' | '/quests' | '/pets' | '/characters';
		title: string;
		text: string;
		status?: string;
		featured?: boolean;
	} = $props();

	const accents = {
		'/fame': 'var(--accent-fame)',
		'/quests': 'var(--accent-quest)',
		'/pets': 'var(--accent-pet)',
		'/characters': 'var(--accent-character)'
	};
</script>

<a class="card feature" class:featured href={resolve(href)} style:--accent={accents[href]}>
	<span class="head">
		<span class="card-title">{title}</span>
		{#if status}<span class="tag">{status}</span>{/if}
	</span>
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
	.featured {
		background: var(--accent-character-soft);
	}
	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
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
