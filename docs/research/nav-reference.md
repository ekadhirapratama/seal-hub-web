# Navigation & Layout Reference Analysis (Paimon.moe)

This document provides a factual, code-referenced breakdown of Paimon.moe's responsive navigation and layout architecture, serving as a specification for re-implementation in Svelte 5 with plain CSS.

## 1. Breakpoints & Sidebar Width
- **Breakpoint where sidebar becomes drawer**: `1024px` (`lg` breakpoint in Tailwind config). On screens narrower than `1024px`, the desktop sidebar is hidden (`hidden lg:flex`), and the mobile header and drawer mechanism are active.
- **Sidebar width**: `256px` (`w-64`, equivalent to `16rem` or `256px`) on both desktop and mobile drawer (`w-full lg:w-64`).

## 2. Content Area Offset
- **Desktop content margin**: Offset to the right of the fixed sidebar by `256px` (`lg:ml-64`).
- **Source reference**: `src/routes/__layout.svelte:102` (`<div class="lg:ml-64 px-4 md:px-8 py-8 flex flex-col md:pb-24">`).

## 3. Mobile Header Contents & Height
- **Height**: `64px` (`h-16`, equivalent to `4rem`).
- **Contents**: 
  1. App brand title / logo linking to home (`Paimon.moe`) with `font-display text-3xl font-black text-white`.
  2. Hamburger menu button with icon (`mdiMenu`) dispatching an event to open the sidebar.
- **Source reference**: `src/components/Header.svelte:12-19` (`<div class="flex items-center lg:hidden fixed w-full h-16 header bg-background z-50 shadow-md overflow-hidden">`).

## 4. Drawer Open/Close Mechanism
- **State location**: Managed via a Svelte writable store (`showSidebar`), initialized to `false`.
- **Source reference**: `src/stores/sidebar.js:3` (`export const showSidebar = writable(false);`).
- **Backdrop**: None implemented explicitly; clicking outside relies on internal navigation clicks or the close button.
- **Close button**: A close icon (`mdiCloseCircle`, size 2) rendered at the top of the mobile sidebar. Clicking it calls `close()`, setting `showSidebar` to `false`.
  - **Source reference**: `src/components/Sidebar/Sidebar.svelte:38-40, 58-62`.
- **Close on navigation**: Every sidebar item and nested menu item listens to a `clicked` event which triggers `close()` (setting `showSidebar.set(false)`).
  - **Source reference**: `src/components/Sidebar/Sidebar.svelte:64, 71, 78, 85, 92, 101, 129`.
- **Body scroll lock**: None implemented in `Sidebar.svelte` or `__layout.svelte`.
- **Transitions**: Uses Svelte's built-in `fly` transition (`in:fly={{ x: 100, duration: 100 }} out:fly={{ x: 100, duration: 100 }}`).
  - **Source reference**: `src/components/Sidebar/Sidebar.svelte:47-49`.

## 5. Active-Link Styling & Route Detection
- **Active route detection**: Uses the page URL pathname segment derived from `$page.url.pathname`.
  - **Source reference**: `src/routes/__layout.svelte:79` (`$: segment = $page.url.pathname.substring(1).split('/')[0];`).
- **Active-link styling**: Applies background primary color with opacity (`bg-primary bg-opacity-75`) and full opacity / white text to icons and labels.
  - **Source reference**: `src/components/Sidebar/SidebarItem.svelte:30-41`:
    ```css
    .active {
      @apply bg-primary;
      @apply bg-opacity-75;
      span { @apply text-white; }
      img { @apply opacity-100; }
    }
    ```

## 6. Nav Item Structure & 'More' Menu
- **Item structure**: Each nav item (`SidebarItem.svelte`) consists of an anchor wrapper (`<a>`), an image icon container (`h-8 w-8`), and a text label (`font-body font-semibold text-lg`).
  - **Source reference**: `src/components/Sidebar/SidebarItem.svelte:16-27`.
- **Grouping**: Top-level items are listed sequentially in a vertical flex container (`src/components/Sidebar/Sidebar.svelte:54-149`).
- **'More' menu**: Implemented via `SidebarMoreItem.svelte`, which supports two modes:
  - **Desktop (Hover flyout)**: Uses CSS parent-hover selectors to reveal a side flyout menu (`.parent:hover .child { display: flex; }`) containing sub-items.
    - **Source reference**: `src/components/Sidebar/SidebarMoreItem.svelte:68-90, 148-157`.
  - **Mobile (Accordion expand)**: Clicking the parent item toggles `expandMenu` state, rendering an inline vertical list with `transition:fly`.
    - **Source reference**: `src/components/Sidebar/SidebarMoreItem.svelte:58-60, 102-123`.

## 7. Footer Items in the Sidebar
- **Language Selector**: Located at the bottom of the sidebar (`src/components/Sidebar/Sidebar.svelte:154-173`), displaying the current locale flag and label, with a hover dropdown grid showing available language options (`zh`, `tw`, `en`, `fr`, `de`, `ja`, `ko`, `th`, `vi`, `id`, `es`, `pt`, `ru`, `tr`, `it`).

## 8. Accessibility Attributes
- **ARIA attributes**: None present (`aria-label`, `aria-expanded`, `aria-hidden`, `role="dialog"`, etc., are entirely absent from sidebar, header, and mobile drawer elements).
- **Focus handling**: No focus trapping inside the mobile drawer when open; focus is not returned to the hamburger button upon drawer close.
- **Escape key handling**: No keyboard listener for closing the drawer via the `Escape` key.

---

## Gaps to Fix in Our Version
1. **Missing ARIA attributes**: Add `role="navigation"`, `aria-label`, `aria-expanded` on toggle buttons, and `aria-hidden` on hidden mobile drawers.
2. **Missing Focus Trap & Keyboard Navigation**: Implement focus trapping inside the mobile drawer when open and close on `Escape` key press.
3. **Missing Body Scroll Lock**: Prevent body background scrolling (`overflow: hidden`) when the mobile drawer overlay is open.
4. **Missing Backdrop Overlay**: Add a clickable backdrop overlay behind the mobile drawer to allow closing by clicking outside.
