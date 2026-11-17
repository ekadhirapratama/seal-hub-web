<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { bestAgainst, elementIds, multiplier, tier, type ElementId } from '#lib/elements.js';

	const names: Record<string, () => string> = {
		fire: m.el_fire,
		steel: m.el_steel,
		wood: m.el_wood,
		earth: m.el_earth,
		water: m.el_water,
		darkness: m.el_darkness,
		light: m.el_light,
		physical: m.el_physical,
		magical: m.el_magical
	};
	const tierLabel = {
		strong: m.element_tier_strong,
		weak: m.element_tier_weak,
		normal: m.element_tier_normal
	};
	const tierGlyph = { strong: '▲', weak: '▼', normal: '=' };

	let target: ElementId = $state(elementIds[0]);
	const ranked = $derived(bestAgainst(target));
</script>

<svelte:head
	><title>{m.page_title({ page: m.nav_element(), app: m.app_name() })}</title></svelte:head
>

<div class="stack">
	<h1>{m.element_heading()}</h1>
	<p class="lead">{m.element_intro()}</p>

	<section class="stack" aria-labelledby="pick">
		<h2 id="pick">{m.element_pick_label()}</h2>
		<div class="picker">
			{#each elementIds as id (id)}
				<button
					type="button"
					class="btn small pick"
					style:--tint="var(--el-{id})"
					aria-pressed={target === id}
					onclick={() => (target = id)}
				>
					{names[id]()}
				</button>
			{/each}
		</div>
	</section>

	<section class="stack" aria-live="polite">
		<h2>{m.element_result_heading({ element: names[target]() })}</h2>
		<ul class="results">
			{#each ranked as r (r.weapon)}
				{@const t = tier(r.value)}
				<li class="card result {t}">
					<span class="tag" style:background="var(--el-{r.weapon})">{names[r.weapon]()}</span>
					<span class="pct">{m.element_percent({ value: r.value })}</span>
					<span class="tier"><span aria-hidden="true">{tierGlyph[t]}</span> {tierLabel[t]()}</span>
				</li>
			{/each}
		</ul>
	</section>

	<ul class="notes">
		<li>{m.element_note_magic()}</li>
		<li>{m.element_note_physical()}</li>
	</ul>

	<details class="card">
		<summary>{m.element_matrix_summary()}</summary>
		<div class="scroll">
			<table>
				<thead>
					<tr>
						<th scope="col">{m.element_matrix_corner()}</th>
						{#each elementIds as col (col)}
							<th scope="col" style:background="var(--el-{col})">{names[col]()}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each elementIds as row (row)}
						<tr>
							<th scope="row" style:background="var(--el-{row})">{names[row]()}</th>
							{#each elementIds as col (col)}
								{@const v = multiplier(row, col)}
								{@const t = tier(v)}
								<td class={t}>
									<span aria-hidden="true">{tierGlyph[t]}</span>
									{m.element_percent({ value: v })}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</details>

	<p class="source">{m.element_source()}</p>
</div>

<style>
	.lead,
	.source {
		color: var(--ink-soft);
	}
	.picker {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 8px;
	}
	@media (min-width: 48rem) {
		.picker {
			grid-template-columns: repeat(9, minmax(0, 1fr));
		}
	}
	.pick {
		background: var(--tint);
	}
	.pick[aria-pressed='true'] {
		background: var(--ink);
		color: #fff;
	}
	.results,
	.notes {
		display: grid;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.result {
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: center;
		gap: 12px;
		padding: 10px 14px;
	}
	.result.strong,
	td.strong {
		background: var(--green-soft);
	}
	.result.weak,
	td.weak {
		background: var(--accent-quest-soft);
	}
	.tag {
		justify-self: start;
	}
	.pct {
		font-family: var(--font-head);
		font-weight: 700;
		font-size: 1.125rem;
	}
	.tier {
		min-width: 6.5rem;
		font-weight: 600;
	}
	.notes {
		color: var(--ink-soft);
		font-size: 0.9375rem;
	}
	summary {
		cursor: pointer;
		min-height: 44px;
		display: flex;
		align-items: center;
		font-weight: 700;
	}
	.scroll {
		overflow-x: auto;
		margin-top: 8px;
	}
	table {
		border-collapse: collapse;
		min-width: 40rem;
		width: 100%;
		font-size: 0.875rem;
	}
	th,
	td {
		border: 1px solid var(--line);
		padding: 6px 8px;
		text-align: center;
		white-space: nowrap;
	}
	tbody th {
		position: sticky;
		left: 0;
		text-align: left;
	}
</style>
