<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import type { ChangelogEntry } from '#lib/data/index.js';
	import { splitUpdates } from '#lib/updates.js';

	let { entries }: { entries: readonly ChangelogEntry[] } = $props();

	const fmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
	const parts = $derived(splitUpdates(entries));
	const formatDate = (d: string) => {
		const date = new Date(d);
		return Number.isNaN(date.getTime()) ? d : fmt.format(date);
	};
</script>

{#snippet entry(e: ChangelogEntry)}
	<article class="card entry">
		<div class="row between">
			<strong
				>{m.updates_version({ version: e.version })} ·
				<time datetime={e.date}>{formatDate(e.date)}</time></strong
			>
			{#if e.kind}<span class="tag">{e.kind}</span>{/if}
		</div>
		{#if e.title}<p class="card-title">{e.title}</p>{/if}
		<ul>
			{#each e.changes as change (change)}<li>{change}</li>{/each}
		</ul>
	</article>
{/snippet}

{#if parts.visible.length === 0}
	<div class="empty"><p>{m.updates_empty()}</p></div>
{:else}
	<div class="stack">
		{#each parts.visible as e (e.version)}{@render entry(e)}{/each}
		{#if parts.older.length > 0}
			<details class="stack">
				<summary class="btn">{m.updates_more()}</summary>
				{#each parts.older as e (e.version)}{@render entry(e)}{/each}
			</details>
		{/if}
	</div>
{/if}

<style>
	.entry {
		display: grid;
		gap: 8px;
	}
	ul {
		margin: 0;
		padding-left: 1.25rem;
	}
	summary {
		cursor: pointer;
		margin-bottom: 12px;
	}
</style>
