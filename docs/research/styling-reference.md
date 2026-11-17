# Styling Reference: grocery-pwa

Source: https://github.com/ekadhirapratama/grocery-pwa (shallow clone of `main`, read 2026-11-16 at `/tmp/grocery-pwa`). All paths below are relative to that repo root.

**TL;DR:** No framework, no build step. One hand-written plain CSS file with custom-property design tokens, self-hosted variable fonts, a hand-rolled service worker, and `localStorage` access isolated in one store module. Everything reusable lives in `app/styles/style.css`.

## 1. Framework / CSS Approach

- **No framework, no CSS library, no component library, no build process.** README: "Tanpa framework, tanpa proses build, tanpa backend dan akun" (`README.md`).
- **Plain CSS**, single file `app/styles/style.css`, loaded via `<link rel="stylesheet" href="/styles/style.css">` (`app/index.html:23`).
- Design tokens are native **CSS custom properties** on `:root` (`app/styles/style.css`, `:root` block); no preprocessor, no utility classes.
- DOM is built with a small `el(tag, props, ...children)` helper (`app/scripts/ui.js:4-17`); no templating engine, no virtual DOM.

## 2. Design Tokens

All values from the `:root` block of `app/styles/style.css`.

### Colors

| Token | Value | Used for |
|---|---|---|
| `--bg` | `#fbf3e4` | Page background (cream) |
| `--pastel-pink` | `#fde1dc` | bg gradient blob; `.tag.daily` background |
| `--pastel-blue` | `#dce8f7` | bg gradient blob; `.tag.groceries`; selected radio-card background |
| `--card` | `#fffbf2` | Card / surface (ivory) |
| `--ink` | `#1b2a4a` | Text, primary borders, `box-shadow` color |
| `--ink-soft` | `#4d5a77` | Secondary text (`.sub`, `.hint`, `.count`) |
| `--line` | `#d9cdb4` | Hairline borders on cards/inputs |
| `--coral` | `#ff8a73` | Primary action (`btn.primary`) |
| `--coral-strong` | `#f4705a` | Primary hover |
| `--green` | `#2e7d4f` | Checked checkbox fill, progress bar fill |
| `--green-soft` | `#dff1e5` | "done" status pill background |
| `--warn-soft` | `#fff0c9` | Banner / "not yet" status pill background |
| `--danger` | `#9b2c1b` | Destructive button text/border, error text |

### Typography

| Token | Value |
|---|---|
| `--font-head` | `"Space Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif` |
| `--font-body` | `"DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif` |

- Both fonts **self-hosted** as single `woff2` (latin subset) in `app/fonts/`: `dm-sans-latin.woff2`, `space-grotesk-latin.woff2`, declared with `@font-face` + `font-display: swap` and variable weight ranges (`font-weight: 400 700` for DM Sans, `500 700` for Space Grotesk) — `app/styles/style.css`, `@font-face` blocks.
- Scale (same file): `h1` 1.75rem, `h2` 1.25rem (1.75rem in `.page-head`), `h3` 1rem; body 1rem / line-height 1.5; `.topbar-title` 1.125rem bold; small text 0.8125rem–0.9375rem. Headings use `--font-head`, line-height 1.2.

### Spacing / Radius / Shadow

| Token | Value |
|---|---|
| `--radius` | `16px` (cards); component radii: 14px buttons/icon-btn/radio-cards, 12px inputs, 10px skip-link, 20px dialog, `999px` pills |
| `--shadow` | `0 2px 0 rgb(27 42 74 / 0.06), 0 6px 16px rgb(27 42 74 / 0.06)` |
| Buttons | extra "pressed" 3D: `box-shadow: 0 3px 0 var(--ink)` + `:active` translateY(2px) |
| Dialog | `box-shadow: 0 8px 0 rgb(27 42 74 / 0.15)` |
| Spacing | no spacing scale; layout gaps 8/12/20px inline, page padding `8px 16px 48px` |

### Dark mode

- **None.** No `prefers-color-scheme` query anywhere in `app/styles/style.css`. The `@media (prefers-reduced-motion: reduce)` block (disable all transitions) is the only media-query aside from width breakpoints.

### Background treatment

- Body background is layered fixed radial gradients (pastel pink top-left, pastel blue top-right) over `--bg` (`app/styles/style.css`, `body` rule) — the signature "krem + pastel" look, stated in the file's header comment.

## 3. Layout / Navigation Patterns

- **Mobile-first, single column.** Content column `max-width: 720px` (`.app`), centered, `padding: 8px 16px 48px`, `display: grid; gap: 20px`. A `.lebar` variant widens to 960px (`app/styles/style.css`, `.app` / `.app.lebar`).
- **Sticky top bar, no bottom nav.** `.topbar` is `position: sticky; top: 0`, 56px min-height, centered title with 44px spacer slots for left/right icon buttons (`app/styles/style.css`, `.topbar` rules; `app/index.html:15-19`). Full-bleed background trick: `box-shadow: 0 0 0 100vmax var(--bg)` + `clip-path: inset(0 -100vmax)`.
- Primary action can be **fixed to the bottom** of the viewport (`.aksi-fixed` + `.aksi-fixed-isi`, with `.app.ada-aksi` adding 104px bottom padding) — `app/styles/style.css`, "Banner & pesan" section; used on the create page (`app/pages/buat-catatan.html`).
- Icons: plain emoji/text glyphs in 44px `.icon-btn` squares (44×44 touch targets throughout: `.btn` min-height 48px, `.small` 44px, checkboxes 28px inside 44px-min labels).
- Breakpoints: `min-width: 900px` switches detail pages to two columns (`1fr + 300px`, sticky summary right, `app/styles/style.css`, last `@media` block); `max-width: 440px` / `max-width: 380px` stack radio-cards and filters.
- Accessibility patterns: skip link (`.skip`), `:focus-visible` outline `3px solid var(--ink)` offset 3px, `.sr-only`, `aria-label`s on generated buttons (`app/scripts/buat-catatan.js`), `role="alert"`/`role="status"` slots (`app/scripts/ui.js`).

## 4. Reusable Component Inventory

All class names from `app/styles/style.css`; HTML usage examples in `app/index.html` and `app/pages/*.html`.

| Component | Classes / selectors | Notes |
|---|---|---|
| Card | `.card`, `a.card`, `.card-title` | 1.5px `--line` border, `--radius`, `--shadow`, 16px padding; as link: grid + hover border `--ink` |
| Button | `.btn`, `.primary`, `.small`, `.block`, `.danger` | 2px `--ink` border, 14px radius, pressed-shadow effect; primary = coral |
| Icon button | `.icon-btn` | 44px square, card bg, 14px radius |
| Tag / pill | `.tag`, `.tag.groceries`, `.tag.daily`; `.status.ya`, `.status.belum` | 999px radius, 1.5px `--ink` border; pastel-blue / pastel-pink fills |
| Progress | `.bar > span`, `.progress-text` | 10px track `#ece3cd`, green fill, width set inline by JS |
| Empty state | `.empty` | 2px dashed `--line` border, translucent card bg |
| Banner / alert | `.banner`, `.alert`, `#alert:empty` | warn-soft bg; alert slot hidden when empty |
| Filter segmented control | `.filter`, `.filter input:checked + label` | radio-based pill group, checked = ink bg + white text |
| Radio card picker | `.pilih-tipe`, `input:checked + label` | 2-col grid; checked = pastel-blue + shadow + `●` prefix |
| Custom checkbox | `.cek` | 28px, appearance-none, `✓` via `::after` scale transition, checked = green; strikethrough name via `:has(.cek:checked)` |
| Inputs | `input[type=text/search/number]`, `label.field`, `.hint`, `.hint.error` | 48px min-height, 12px radius, white bg |
| Dialog | `dialog`, `dialog::backdrop`, `.dialog-body`, `.dialog-actions` | native `<dialog>`, width `min(92vw, 440px)`, ink border, 20px radius; backdrop `rgb(27 42 74 / 0.5)` |
| Topbar | `.topbar`, `.topbar-title`, `.topbar-spacer` | sticky, 56px |
| Page head | `.page-head`, `.sub` | h2 1.75rem + muted subtitle |
| Layout helpers | `.stack`, `.row`, `.row.between`, `.section-title`, `.count` | grid gap 12px / flex wrap gap 12px |

Shared behavior: dialog open/close via `data-open="<id>"` / `data-close` attributes + backdrop-click close (`app/scripts/modal.js`).

## 5. PWA Setup

- **Manifest** `app/app.webmanifest`: `name`/`short_name`, `lang: "id"`, `start_url: "/index.html"`, `scope: "/"`, `display: "standalone"`, `background_color`/`theme_color` `#fbf3e4` (matches `--bg`), two icons 192/512 PNG with `"purpose": "any maskable"`. Linked in `app/index.html:18`; matching `<meta name="theme-color" content="#fbf3e4">` at `app/index.html:6`.
- **Service worker** `app/sw.js` (at `app/` root so its scope covers the whole site):
  - Hand-written, no Workbox. `CACHE_VERSION = "v1.4.0"`, prefix `catatan-belanja-`; bump version on every asset change (README "Rilis manual" step 1).
  - Explicit `PRECACHE` array (~22 URLs: all pages, scripts, CSS, fonts, manifest, icons, reference JSON), installed with `cache: "reload"` requests to bypass the HTTP cache, then `skipWaiting()`.
  - `activate` deletes old prefix caches, `clients.claim()`.
  - Fetch handler: **cache-first** (`caches.match(request, { ignoreSearch: true })` → fallback network), GET + same-origin only. `ignoreSearch` lets `detail.html?id=…` resolve to the cached `detail.html`.
- **Hosting**: static nginx image (`Dockerfile`: `nginx:1.27-alpine`, copies `app/` + `data/`), `nginx.conf` sends `Cache-Control: no-cache` for `/sw.js` and `/app.webmanifest`, `try_files $uri $uri/ =404` (multi-page, no SPA fallback), gzip on. Deploy = Docker Compose behind Traefik with TLS labels (`compose.yaml`).
- **No SvelteKit/adapter** — the reference is framework-less; for seal-hub-web the equivalent is SvelteKit's `@sveltejs/adapter-static` (UNVERIFIED against this repo; inferred from seal-hub-web being a client-only SvelteKit app).

## 6. localStorage / State Patterns

Everything below from `app/scripts/store.js` (sole module touching `localStorage`) and `app/scripts/ui.js`.

- **Single fixed key** `catatan-belanja`; value is versioned JSON: `{"version": 1, "notes": [...]}`. `STORAGE_KEY` + `SCHEMA_VERSION` constants exported; future migrations live in this file (README "Data lokal", `store.js` header comment).
- **Status enum** `STATUS = { EMPTY, OK, UNREADABLE, UNAVAILABLE }`; `loadState()` returns `{status, state}` and always yields a safe empty state; `isWritable()` gates writes.
- **Read-modify-write, no in-memory cache**: `updateState(mutator)` re-reads from `localStorage` immediately before every mutation, applies the mutator, writes back — two tabs can't clobber each other with a stale copy (`updateState` doc comment). Returns `{ok, reason: "readonly"|"write-failed"|"mutator-failed"}`; callers surface failures via `showAlert(describeFailure(result))` (`app/scripts/ui.js`), never silently.
- **Corrupt-data recovery**: unreadable value → read-only mode with banner + "Mulai dari awal" dialog; reset first backs up raw value to `catatan-belanja:rusak-<timestamp>` before writing an empty state, and aborts if the backup write fails (`store.js` `resetState()`; README "Data rusak").
- **Cross-tab sync**: `storage` event listener `onExternalChange(callback)` (`app/scripts/ui.js`); detail pages reload, list pages re-render.
- **Save the requested value, not a toggle**: checkbox handler sets `target.checked = checked` from the event, then re-reads state for progress — avoids acting on a stale copy (`app/scripts/detail.js` `itemRow`).
- **Reference data** fetched from static JSON (`/data/borma.json`, `/data/warung-sayur.json`) with in-memory `Map` cache, validated shape, `{ok}` result pattern (`app/scripts/reference.js`); user data always copies item names so later JSON edits don't mutate saved notes (README "Data lokal").
- Draft state (unsaved picks) is deliberately memory-only, lost on navigation (`app/scripts/buat-catatan.js` comment).

## 7. Project Structure

```
grocery-pwa/
├── app/                      # everything served to the browser
│   ├── index.html            # Beranda (root)
│   ├── app.webmanifest       # manifest (root, for SW scope)
│   ├── sw.js                 # service worker (root, for SW scope)
│   ├── styles/style.css      # ALL styling, one file
│   ├── fonts/                # self-hosted woff2 (dm-sans, space-grotesk)
│   ├── icons/                # icon-192.png, icon-512.png
│   ├── pages/                # 4 subpages, one HTML each
│   │   ├── buat-catatan.html # create note (+ ?catatan=<id> add-items mode)
│   │   ├── detail.html       # active note detail (?id=…)
│   │   ├── riwayat.html      # history list
│   │   └── riwayat-detail.html
│   └── scripts/              # ES modules, one per page + shared
│       ├── index.js, buat-catatan.js, detail.js, riwayat.js, riwayat-detail.js
│       ├── store.js          # localStorage (only module)
│       ├── reference.js      # static JSON loader
│       ├── ui.js             # el() helper, alert/banner, SW registration
│       └── modal.js          # <dialog> open/close delegation
├── data/                     # read-only reference JSON (borma.json, warung-sayur.json)
├── Dockerfile, nginx.conf, compose.yaml
└── README.md
```

Structure facts from `README.md` "Struktur" section. Multi-page app (5 HTML pages), native ES modules, detail pages take `?id=` query params. No `package.json` — zero npm dependencies.

## 8. Dependency Versions

- **Runtime dependencies: none.** No `package.json`, no node_modules, no bundler (README: "Tidak ada langkah build dan tidak ada dependensi").
- Only pinned image: `nginx:1.27-alpine` (`Dockerfile:1`).
- Browser-native only: ES modules, `<dialog>`, `crypto.randomUUID()`, `Intl.NumberFormat`, Cache Storage API.

## What to Port to seal-hub-web

seal-hub-web is a client-only SvelteKit app, so port the design language and state discipline, not the vanilla-JS plumbing. Exact source paths in the reference repo:

1. **Full token block** — `:root` custom properties from `app/styles/style.css` (colors table in §2, both font stacks, `--radius`, `--shadow`). Copy verbatim as the base of a global stylesheet; all component styles below derive from these tokens.
2. **Color palette** — same `:root` block. Signature combos to keep: cream `#fbf3e4` bg + pastel radial-gradient body treatment (`body` rule in `app/styles/style.css`), ivory `#fffbf2` cards, ink `#1b2a4a` borders/shadows, coral `#ff8a73` primary actions, green `#2e7d4f` for done states.
3. **Typography** — `@font-face` declarations + `dm-sans-latin.woff2` / `space-grotesk-latin.woff2` from `app/fonts/` (keep `font-display: swap` and variable weight ranges); heading scale h1 1.75rem / h2 1.25rem / body 1rem lh 1.5 from `app/styles/style.css`.
4. **Button system** — `.btn` + `.primary` + `.small` + `.danger` + pressed-shadow active state from `app/styles/style.css` ("Tombol & form" section).
5. **Card + tag + pill system** — `.card`, `a.card`, `.tag`, `.status` rules from `app/styles/style.css` ("Kartu" section).
6. **Custom checkbox** — `.cek` rules (appearance-none, ✓ scale transition, green fill, `:has()` strikethrough) from `app/styles/style.css` ("Daftar item" section).
7. **Progress bar** — `.bar` + `.progress-text` from `app/styles/style.css`.
8. **Empty state + banner/alert** — `.empty`, `.banner`, `.alert` from `app/styles/style.css` (matches seal-hub-web's offline data situations).
9. **Native `<dialog>` styling + modal.js delegation** — `dialog`/`::backdrop` rules from `app/styles/style.css` ("Dialog" section); open/close logic pattern from `app/scripts/modal.js` (port to a Svelte action if dialogs are used).
10. **Sticky topbar layout** — `.topbar`, `.topbar-title`, `.topbar-spacer`, full-bleed shadow/clip trick, and `.app` 720px column from `app/styles/style.css` ("Layout" section). No bottom nav exists in the reference; the fixed-bottom action bar (`.aksi-fixed`) is the mobile CTA pattern to consider.
11. **Accessibility defaults** — skip link, `:focus-visible` outline, `.sr-only`, reduced-motion block from `app/styles/style.css`.
12. **SW discipline** — versioned cache (`CACHE_VERSION` bump), explicit precache list, `cache: "reload"`, old-cache cleanup, `no-cache` headers for sw/manifest from `app/sw.js` + `nginx.conf`. In SvelteKit, map this intent onto `@sveltejs/adapter-static` + a service worker (UNVERIFIED: exact SvelteKit PWA wiring not demonstrated in this repo).
13. **State discipline** — single storage module with versioned schema, status enum, read-modify-write `updateState`, read-only mode + backup-before-reset, `storage`-event cross-tab sync from `app/scripts/store.js` + `app/scripts/ui.js` (port as a Svelte store/module wrapping `localStorage`).

Not worth porting: the `el()` DOM helper and per-page script structure (replaced by Svelte components), the nginx/Docker layer (seal-hub-web has its own adapter), reference-JSON loading (`app/scripts/reference.js`) unless seal-hub-web needs static data files.
