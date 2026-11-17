<script lang="ts">
	import { resolve } from '$app/paths';
	import { m } from '#lib/paraglide/messages.js';
	import { changelog } from '#lib/data/index.js';
	import FeatureCard from '#lib/components/FeatureCard.svelte';
	import UpdatesList from '#lib/components/UpdatesList.svelte';
</script>

<svelte:head><title>{m.page_title({ page: m.nav_home(), app: m.app_name() })}</title></svelte:head>

<div class="stack landing">
	<section class="stack hero">
		<h1>{m.landing_heading()}</h1>
		<p>{m.landing_description()}</p>
		<a class="btn primary" href={resolve('/characters')}>{m.landing_cta()}</a>
	</section>

	<section class="cards">
		<FeatureCard href="/fame" title={m.nav_fame()} text={m.landing_card_fame()} />
		<FeatureCard href="/quests" title={m.nav_quests()} text={m.landing_card_quests()} />
		<FeatureCard href="/pets" title={m.nav_pets()} text={m.landing_card_pets()} />
		<FeatureCard href="/characters" title={m.nav_characters()} text={m.landing_card_characters()} />
	</section>

	<section>
		<h2 class="section-title">{m.updates_heading()}</h2>
		<UpdatesList entries={changelog} />
	</section>
</div>

<style>
	.hero {
		justify-items: start;
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
	}
</style>
