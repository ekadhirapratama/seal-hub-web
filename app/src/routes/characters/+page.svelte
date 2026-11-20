<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { browser } from '$app/env';
	import { goto, pushState, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { m } from '#lib/paraglide/messages.js';
	import { safeReturn, type Character, type CharacterInput } from '#lib/characters.js';
	import { jobs } from '#lib/data/index.js';
	import { store, type Result } from '#lib/storage/characters.svelte.js';
	import CharacterForm from '#lib/components/CharacterForm.svelte';

	const number = new Intl.NumberFormat('id-ID');
	let form: ReturnType<typeof CharacterForm>;
	let deleteDialog: HTMLDialogElement;
	let pending: Character | null = $state(null);
	let deleteError = $state('');
	let leaving = false;

	// The query is only read in the browser: prerender has no search params.
	const formParam = $derived(browser ? page.url.searchParams.get('form') : null);

	onMount(() => store.init());

	// URL -> dialog. Character data is read untracked so list changes never reopen the form.
	$effect(() => {
		const param = formParam;
		if (!store.loaded) return;
		untrack(() => {
			if (!param) return form.close();
			if (form.isOpen()) return;
			const target = param === 'new' ? null : store.characters.find((c) => c.id === param);
			if (store.readonly || target === undefined) return closeForm();
			form.open(target);
		});
	});

	function openForm(target: string) {
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve() plus a query string
		pushState(`${resolve('/characters')}?form=${target}`, { formOpen: true });
	}

	function closeForm() {
		if (page.state.formOpen) history.back();
		else replaceState(resolve('/characters'), {});
	}

	// Escape, Cancel and the Save path all end up here once the dialog has closed.
	function onFormClosed() {
		if (leaving) leaving = false;
		else if (formParam) closeForm();
	}

	function save(input: CharacterInput, id: string | null): Result {
		const result = id ? store.update(id, input) : store.add(input);
		if (!result.ok) return result;
		const back = safeReturn(page.url.searchParams.get('return'));
		if (back) {
			leaving = true;
			form.close();
			// eslint-disable-next-line svelte/no-navigation-without-resolve -- safeReturn only passes same-origin paths
			goto(`${back}${back.includes('?') ? '&' : '?'}character=${result.id}`, {
				replaceState: true
			});
		} else form.close();
		return result;
	}

	function askDelete(character: Character) {
		pending = character;
		deleteError = '';
		deleteDialog.showModal();
	}

	function confirmDelete() {
		if (!pending) return;
		const result = store.remove(pending.id);
		// A character already removed elsewhere is as good as deleted.
		if (result.ok || result.reason === 'not-found') deleteDialog.close();
		else deleteError = result.reason === 'readonly' ? m.err_readonly() : m.err_write_failed();
	}

	const jobName = (id: string) => jobs.find((j) => j.id === id)?.name ?? m.character_unknown_job();
</script>

<svelte:head
	><title>{m.page_title({ page: m.nav_characters(), app: m.app_name() })}</title></svelte:head
>

<div class="stack">
	<h1>{m.nav_characters()}</h1>

	{#if store.status === 'unreadable'}
		<div class="banner" role="alert">
			<p>{m.banner_unreadable()}</p>
			<button type="button" class="btn small" onclick={() => store.reset()}>
				{m.banner_unreadable_reset()}
			</button>
		</div>
	{:else if store.status === 'unavailable'}
		<p class="banner" role="alert">{m.banner_unavailable()}</p>
	{/if}
	{#if jobs.length === 0}
		<p class="banner" role="alert">{m.banner_jobs_unavailable()}</p>
	{/if}

	{#if store.loaded}
		{#if store.characters.length === 0}
			<div class="empty">
				<p>{m.characters_empty_title()}</p>
				<button
					type="button"
					class="btn primary"
					disabled={store.readonly}
					onclick={() => openForm('new')}
				>
					{m.characters_empty_add()}
				</button>
			</div>
		{:else}
			<div class="row between">
				<p>{m.characters_count({ count: store.characters.length })}</p>
				<button
					type="button"
					class="btn primary small"
					disabled={store.readonly}
					onclick={() => openForm('new')}
				>
					{m.characters_add()}
				</button>
			</div>

			<ul class="stack list" aria-label={m.characters_list_label()}>
				{#each store.characters as c (c.id)}
					<li class="card stack">
						<div class="row between">
							<h2 class="card-title">{c.name}</h2>
							<span class="tag character">{jobName(c.job)}</span>
						</div>
						<p>{m.character_stats({ level: c.level, fame: number.format(c.fame) })}</p>
						<div class="row">
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve() plus a query string -->
							<a class="btn small" href={`${resolve('/fame')}?character=${c.id}`}>
								{m.character_calculate()}
								<span class="sr-only">{c.name}</span>
							</a>
							<button
								type="button"
								class="btn small"
								disabled={store.readonly}
								onclick={() => openForm(c.id)}
							>
								{m.character_edit()}
								<span class="sr-only">{c.name}</span>
							</button>
							<button
								type="button"
								class="btn small danger"
								disabled={store.readonly}
								onclick={() => askDelete(c)}
							>
								{m.character_delete()}
								<span class="sr-only">{c.name}</span>
							</button>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
</div>

<CharacterForm bind:this={form} {jobs} onsave={save} onclose={onFormClosed} />

<dialog class="card" aria-labelledby="delete-title" bind:this={deleteDialog}>
	<div class="stack">
		<h2 id="delete-title">{m.delete_title()}</h2>
		<p>{m.delete_text({ name: pending?.name ?? '' })}</p>
		{#if deleteError}<p class="banner" role="alert">{deleteError}</p>{/if}
		<div class="row actions">
			<button type="button" class="btn" onclick={() => deleteDialog.close()}>
				{m.delete_cancel()}
			</button>
			<button type="button" class="btn danger" onclick={confirmDelete}>
				{m.delete_confirm()}
			</button>
		</div>
	</div>
</dialog>

<style>
	.list {
		list-style: none;
		padding: 0;
	}
	.card-title {
		overflow-wrap: anywhere;
	}
	dialog {
		width: min(24rem, calc(100vw - 32px));
		margin: auto;
		color: var(--ink);
	}
	dialog::backdrop {
		background: rgb(27 42 74 / 0.5);
	}
	.actions {
		justify-content: flex-end;
	}
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
