<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { MAX_LEVEL, MAX_NAME_LENGTH, validateForm } from '#lib/characters.js';
	import type { Character, CharacterInput, FormError, FormErrors } from '#lib/characters.js';
	import type { Job } from '#lib/data/index.js';
	import type { Result } from '#lib/storage/characters.svelte.js';

	let {
		jobs,
		onsave,
		onclose
	}: {
		jobs: readonly Job[];
		onsave: (input: CharacterInput, id: string | null) => Result;
		onclose: () => void;
	} = $props();

	let dialog: HTMLDialogElement;
	let editingId: string | null = $state(null);
	let values = $state({ name: '', job: '', level: '', fame: '' });
	let errors: FormErrors = $state({});
	let submitted = false;
	let alert = $state('');

	const jobIds = $derived(jobs.map((j) => j.id));
	const message: Record<FormError, () => string> = {
		name_required: m.err_name_required,
		name_max: () => m.err_name_max({ max: MAX_NAME_LENGTH }),
		job_required: m.err_job_required,
		level_range: () => m.err_level_range({ max: MAX_LEVEL }),
		fame_min: m.err_fame_min
	};
	const failure = {
		'not-found': m.err_not_found,
		readonly: m.err_readonly,
		invalid: m.err_write_failed,
		'write-failed': m.err_write_failed
	};

	/** Opens the dialog for a new character (`character` null) or for editing one. */
	export function open(character: Character | null) {
		editingId = character?.id ?? null;
		// An unknown job id is cleared so the user has to pick a current one.
		values = {
			name: character?.name ?? '',
			job: character && jobIds.includes(character.job) ? character.job : '',
			level: character ? String(character.level) : '',
			fame: character ? String(character.fame) : ''
		};
		errors = {};
		submitted = false;
		alert = '';
		if (!dialog.open) dialog.showModal();
	}

	export function close() {
		if (dialog.open) dialog.close();
	}

	export function isOpen() {
		return dialog.open;
	}

	function check() {
		const result = validateForm(values, jobIds);
		errors = result.ok ? {} : result.errors;
		return result;
	}

	function onchange() {
		if (submitted) check();
	}

	function submit(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		const result = check();
		if (!result.ok) return;
		const saved = onsave(result.value, editingId);
		if (!saved.ok) alert = failure[saved.reason]();
	}
</script>

<dialog class="card" aria-labelledby="form-title" bind:this={dialog} {onclose}>
	<form class="stack" novalidate onsubmit={submit}>
		<h2 id="form-title">{editingId ? m.form_title_edit() : m.form_title_add()}</h2>

		{#if jobs.length === 0}
			<p class="banner" role="alert">{m.banner_jobs_unavailable()}</p>
		{/if}

		<div class="field">
			<label for="f-name">{m.field_name()}</label>
			<input
				id="f-name"
				autocomplete="off"
				bind:value={values.name}
				{onchange}
				aria-invalid={!!errors.name}
				aria-describedby={errors.name ? 'f-name-err' : undefined}
			/>
			{#if errors.name}<p class="hint error" id="f-name-err">{message[errors.name]()}</p>{/if}
		</div>

		<div class="field">
			<label for="f-job">{m.field_job()}</label>
			<select
				id="f-job"
				bind:value={values.job}
				{onchange}
				aria-invalid={!!errors.job}
				aria-describedby={errors.job ? 'f-job-err' : undefined}
			>
				<option value="">{m.field_job_placeholder()}</option>
				{#each jobs as job (job.id)}
					<option value={job.id}>{job.name}</option>
				{/each}
			</select>
			{#if errors.job}<p class="hint error" id="f-job-err">{message[errors.job]()}</p>{/if}
		</div>

		<div class="field">
			<label for="f-level">{m.field_level()}</label>
			<input
				id="f-level"
				inputmode="numeric"
				autocomplete="off"
				bind:value={values.level}
				{onchange}
				aria-invalid={!!errors.level}
				aria-describedby={errors.level ? 'f-level-err' : undefined}
			/>
			{#if errors.level}<p class="hint error" id="f-level-err">{message[errors.level]()}</p>{/if}
		</div>

		<div class="field">
			<label for="f-fame">{m.field_fame()}</label>
			<input
				id="f-fame"
				inputmode="numeric"
				autocomplete="off"
				bind:value={values.fame}
				{onchange}
				aria-invalid={!!errors.fame}
				aria-describedby={errors.fame ? 'f-fame-err' : undefined}
			/>
			{#if errors.fame}<p class="hint error" id="f-fame-err">{message[errors.fame]()}</p>{/if}
		</div>

		{#if alert}<p class="banner" role="alert">{alert}</p>{/if}

		<div class="row actions">
			<button type="button" class="btn" onclick={close}>{m.form_cancel()}</button>
			<button type="submit" class="btn primary" disabled={jobs.length === 0}>
				{m.form_save()}
			</button>
		</div>
	</form>
</dialog>

<style>
	dialog {
		width: min(28rem, calc(100vw - 32px));
		max-height: calc(100dvh - 32px);
		margin: auto;
		overflow-y: auto;
		color: var(--ink);
	}
	dialog::backdrop {
		background: rgb(27 42 74 / 0.5);
	}
	.field {
		display: grid;
		gap: 4px;
	}
	label {
		font-weight: 700;
	}
	input,
	select {
		min-height: 48px;
		padding: 8px 12px;
		font: inherit;
		color: var(--ink);
		background: #fff;
		border: 3px solid var(--ink);
		border-radius: var(--radius);
		width: 100%;
	}
	[aria-invalid='true'] {
		border-color: var(--danger);
	}
	.hint.error {
		color: var(--danger);
		font-size: 0.875rem;
	}
	.actions {
		justify-content: flex-end;
	}
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
