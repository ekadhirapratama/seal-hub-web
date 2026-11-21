<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { m } from '#lib/paraglide/messages.js';
	import { changelog } from '#lib/data/index.js';
	import FeatureCard from '#lib/components/FeatureCard.svelte';
	import UpdatesList from '#lib/components/UpdatesList.svelte';
	import { store } from '#lib/storage/characters.svelte.js';

	onMount(() => store.init());
</script>

<svelte:head><title>{m.page_title({ page: m.nav_home(), app: m.app_name() })}</title></svelte:head>

<div class="stack landing">
	<section class="stack hero">
		<h1>{m.landing_heading()}</h1>
		<p>{m.landing_description()}</p>
		<div class="cta">
			{#if !store.loaded}
				<!-- Reserves the row so the layout does not jump once storage is read. -->
			{:else if store.status === 'unavailable'}
				<p class="note">{m.banner_unavailable()}</p>
			{:else if store.status === 'unreadable'}
				<p class="note">{m.banner_unreadable()}</p>
			{:else if store.characters.length === 0}
				<a class="btn primary" href={resolve('/characters')}>{m.landing_cta()}</a>
			{:else}
				<p class="count">{m.landing_characters_count({ count: store.characters.length })}</p>
				<a class="btn small" href={resolve('/characters')}>{m.landing_characters_manage()}</a>
			{/if}
		</div>
	</section>

	<section class="cards">
		<FeatureCard
			href="/characters"
			title={m.nav_characters()}
			text={m.landing_card_characters()}
			featured
		/>
		<FeatureCard
			href="/fame"
			title={m.nav_fame()}
			text={m.landing_card_fame()}
			status={m.status_soon()}
		/>
		<FeatureCard
			href="/quests"
			title={m.nav_quests()}
			text={m.landing_card_quests()}
			status={m.status_soon()}
		/>
		<FeatureCard
			href="/pets"
			title={m.nav_pets()}
			text={m.landing_card_pets()}
			status={m.status_soon()}
		/>
	</section>

	<section>
		<h2 class="section-title">{m.updates_heading()}</h2>
		<UpdatesList entries={changelog} />
	</section>
</div>

<style>
	.hero {
		justify-items: start;
		gap: 12px;
		padding: 20px;
		border: 3px solid var(--ink);
		border-radius: var(--radius);
		background: var(--gold-soft);
		box-shadow: var(--shadow);
	}
	.hero h1 {
		font-size: clamp(1.75rem, 6vw, 2.5rem);
	}
	.hero h1,
	.hero p {
		margin: 0;
	}
	.hero p {
		max-width: 40ch;
		color: var(--ink-soft);
	}
	.cta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
		min-height: 48px;
	}
	.cta .count {
		font-weight: 700;
		color: var(--ink);
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
	}
	@media (min-width: 48rem) {
		.cards {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}
</style>
