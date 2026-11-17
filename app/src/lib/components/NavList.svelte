<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';

	// 24x24 stroke icons, one path each.
	const items = [
		{
			href: '/',
			label: m.nav_home,
			icon: 'M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z'
		},
		{
			href: '/characters',
			label: m.nav_characters,
			icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0'
		},
		{
			href: '/fame',
			label: m.nav_fame,
			icon: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z'
		},
		{
			href: '/quests',
			label: m.nav_quests,
			icon: 'M5 21V4M5 4h12l-2 4 2 4H5'
		},
		{
			href: '/element',
			label: m.nav_element,
			icon: 'M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z'
		},
		{
			href: '/pets',
			label: m.nav_pets,
			icon: 'M12 13c-3 0-5 2-5 4.5S9 20 12 20s5-.5 5-2.5-2-4.5-5-4.5zM5 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM9 4.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM15 4.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM19 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z'
		}
	] as const;

	// resolve() may return a path relative to the current page (prerender), so absolutize it first.
	function isActive(href: string) {
		const { pathname } = new URL(href, page.url.href);
		const home = new URL(resolve('/'), page.url.href).pathname;
		return (
			page.url.pathname === pathname ||
			(pathname !== home && page.url.pathname.startsWith(pathname + '/'))
		);
	}
</script>

<ul class="nav-list">
	{#each items as item (item.href)}
		{@const href = resolve(item.href)}
		<li>
			<a {href} aria-current={isActive(href) ? 'page' : undefined}>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path d={item.icon} />
				</svg>
				{item.label()}
			</a>
		</li>
	{/each}
</ul>

<style>
	.nav-list {
		display: grid;
		gap: 4px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	a {
		display: flex;
		align-items: center;
		gap: 12px;
		min-height: 44px;
		padding: 8px 12px;
		border-radius: 12px;
		font-weight: 600;
		color: var(--ink);
		text-decoration: none;
	}

	a:hover {
		background: var(--accent-character-soft);
	}

	a[aria-current='page'] {
		background: var(--ink);
		color: #fff;
	}

	svg {
		flex: none;
		width: 24px;
		height: 24px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
</style>
