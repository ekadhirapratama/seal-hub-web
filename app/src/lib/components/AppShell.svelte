<script lang="ts">
	import type { Snippet } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { afterNavigate } from '$app/navigation';
	import { m } from '#lib/paraglide/messages.js';
	import NavList from './NavList.svelte';

	let { children }: { children: Snippet } = $props();

	let drawer: HTMLDialogElement;
	let menuButton: HTMLButtonElement;
	let open = $state(false);

	// Must match the 1024px breakpoint in the styles below.
	const desktop = new MediaQuery('min-width: 64rem');

	// A modal dialog hidden by CSS stays modal (page inert, scroll locked), so close it.
	$effect(() => {
		if (desktop.current) drawer.close();
	});

	afterNavigate(() => {
		if (!drawer.open) return;
		drawer.close();
		// Kit moves focus to <body> as navigation settles; take it back for the menu button.
		requestAnimationFrame(() => menuButton.focus());
	});

	function onDrawerClick(event: MouseEvent) {
		// Backdrop clicks target the dialog itself; links close it via afterNavigate.
		if (event.target === drawer) drawer.close();
	}

	function onDrawerClose() {
		open = false;
		menuButton.focus();
	}
</script>

<a class="skip-link" href="#main">{m.skip_link()}</a>

<aside class="sidebar">
	<p class="brand">{m.app_name()}</p>
	<nav aria-label={m.nav_label()}>
		<NavList />
	</nav>
</aside>

<div class="content">
	<header class="topbar">
		<button
			type="button"
			class="icon-btn"
			aria-label={m.menu_open()}
			aria-haspopup="dialog"
			aria-expanded={open}
			bind:this={menuButton}
			onclick={() => {
				open = true;
				drawer.showModal();
			}}
		>
			<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
		</button>
		<p class="topbar-title">{m.app_name()}</p>
		<span class="topbar-spacer"></span>
	</header>

	<main id="main" tabindex="-1">
		{@render children()}
	</main>
</div>

<dialog
	class="drawer"
	aria-labelledby="drawer-title"
	bind:this={drawer}
	onclick={onDrawerClick}
	onclose={onDrawerClose}
>
	<div class="drawer-head">
		<p class="brand" id="drawer-title">{m.app_name()}</p>
		<button
			type="button"
			class="icon-btn"
			aria-label={m.menu_close()}
			onclick={() => drawer.close()}
		>
			<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
		</button>
	</div>
	<nav aria-label={m.nav_label()}>
		<NavList />
	</nav>
</dialog>

<style>
	.brand {
		margin: 0;
		font-family: var(--font-head);
		font-size: 1.375rem;
		font-weight: 700;
	}

	/* sidebar: desktop only */
	.sidebar {
		display: none;
	}

	/* content column (reference .app: 720px, centred) */
	main {
		max-width: 720px;
		margin: 0 auto;
		padding: 8px 16px 48px;
		display: grid;
		gap: 20px;
	}

	main:focus-visible {
		outline: none;
	}

	/* mobile header (reference topbar rules) */
	.topbar {
		position: sticky;
		top: 0;
		z-index: 5;
		display: flex;
		align-items: center;
		gap: 8px;
		height: var(--header-height);
		padding: 0 8px;
		background: var(--bg);
		border-bottom: 2px solid var(--ink);
	}

	.topbar-title {
		flex: 1;
		min-width: 0;
		margin: 0;
		font-family: var(--font-head);
		font-size: 1.125rem;
		font-weight: 700;
		text-align: center;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.topbar-spacer {
		flex: none;
		width: 44px;
	}

	.icon-btn {
		flex: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		padding: 0;
		color: var(--ink);
		background: var(--card);
		border: 2px solid var(--ink);
		border-radius: 12px;
		cursor: pointer;
	}

	.icon-btn svg {
		width: 24px;
		height: 24px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
	}

	/* drawer: UA dialog rules (centred, capped size) reset to a left panel */
	.drawer {
		inset: 0 auto 0 0;
		width: var(--sidebar-width);
		max-width: 85vw;
		height: 100dvh;
		max-height: none;
		margin: 0;
		padding: 16px 12px;
		overflow-y: auto;
		color: var(--ink);
		background: var(--card);
		border: 0;
		border-right: 2px solid var(--ink);
	}

	/* [open] keeps the UA display:none for a closed dialog */
	.drawer[open] {
		display: block;
	}

	.drawer::backdrop {
		background: rgb(27 42 74 / 0.5);
	}

	.drawer-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		margin-bottom: 16px;
		padding-left: 12px;
	}

	/* scroll lock while a modal dialog is open */
	:global(html:has(dialog:modal)) {
		overflow: hidden;
	}

	/* desktop: fixed sidebar, content offset, no header, no drawer */
	@media (min-width: 64rem) {
		.sidebar {
			position: fixed;
			inset: 0 auto 0 0;
			display: block;
			width: var(--sidebar-width);
			padding: 16px 12px;
			overflow-y: auto;
			background: var(--card);
			border-right: 2px solid var(--ink);
		}

		.sidebar .brand {
			margin: 0 0 16px 12px;
		}

		.content {
			margin-left: var(--sidebar-width);
		}

		.topbar,
		.drawer[open] {
			display: none;
		}
	}
</style>
