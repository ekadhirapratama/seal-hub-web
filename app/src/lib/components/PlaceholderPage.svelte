<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';

	let { title }: { title: string } = $props();
</script>

<svelte:head>
	<title>{m.page_title({ page: title, app: m.app_name() })}</title>
</svelte:head>

<h1>{title}</h1>

<div class="empty">
	<h2>{m.under_construction_title()}</h2>
	<p>{m.under_construction_text()}</p>
</div>
