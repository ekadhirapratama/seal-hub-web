<script lang="ts">
	import { resolve } from '$app/paths';

	let {
		href,
		title,
		text
	}: { href: '/fame' | '/quests' | '/pets' | '/characters'; title: string; text: string } =
		$props();
</script>

<a class="card feature" href={resolve(href)}>
	<span class="card-title">{title}</span>
	<span class="text">{text}</span>
</a>

<style>
	.feature {
		min-height: 44px;
		align-content: start;
	}
	.text {
		color: var(--ink-soft);
		font-size: 0.9375rem;
	}
</style>
