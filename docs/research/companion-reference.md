# Companion Reference: paimon.moe

Research for seal-hub-web (Seal Online companion, client-only SvelteKit). Sources: live site https://paimon.moe and repo https://github.com/MadeBaruna/paimon-moe (verified: SvelteKit + Svelte 3, `@sveltejs/adapter-static` with `prerender: { default: true }` — `svelte.config.js`, `package.json` in repo root, MIT license per `README.md`). File paths below are relative to repo root. Claims cite repo paths; anything not verified in repo or live site is marked UNVERIFIED.

## 1. Feature inventory & information architecture

Sidebar navigation (`src/components/Sidebar/Sidebar.svelte`, labels in `src/locales/en.json` under `sidebar`):

| Feature | Route | Notes |
|---|---|---|
| Home | `/` (`src/routes/index.svelte`) | Welcome text, visitor count, current event, wish stats teaser, ads |
| Characters | `/characters` (`src/routes/characters/index.svelte`, detail `src/routes/characters/[id].svelte`) | Static DB + per-character build pages (`src/routes/characters/build/` JSON fetch in `src/routes/index.svelte` `load()`) |
| Wish Counter | `/wish` (`src/routes/wish/`) | Import history, pity counter, stats |
| Calculator | `/calculator` (`src/routes/calculator/index.svelte`) | Weapon/Character/Resin/Friendship/Fates sub-calculators as one long page with anchor jump buttons (`findPos()` smooth-scroll, same file) |
| Todo List | `/todo` (`src/routes/todo.svelte`) | Items + mora tracker, resin estimate |
| Database (more menu) | `/items`, `/weapons`, `/artifacts`, `/fishing`, `/furnishing`, `/radiant-spincrystal`, `/timeline`, `/calendar`, `/banners`, `/tcg`, `/achievement`, `/reminder`, `/domains` | Static DB pages under `src/routes/` |
| Settings | `/settings` (`src/routes/settings/index.svelte`) | Server, AR/WL, accounts, export/import, delete/reset |

Site chrome: fixed left sidebar (desktop, `lg:ml-64` content offset in `src/routes/calculator/index.svelte`), mobile drawer with close button (`src/components/Sidebar/Sidebar.svelte` `close()`), sticky header (`src/components/Header.svelte`), global modal host (`svelte-simple-modal` in `src/routes/__layout.svelte`), PWA with service worker (`src/service-worker.js`, registered in `src/components/ServiceWorker.svelte`).

## 2. Static game data structure

- All game data is plain JS modules exporting plain objects under `src/data/`: `itemList.js` (flat `{id: {id, name, rarity, day, parent}}` — `day` array powers "farmable today"), `characters.js` (per-character stats/ascension, grouping `src/data/characterData/`), `weaponList.js` (~20k lines), `weaponExp.js`, `characterExp.js`, `dropRates.js`, `talent.js`, `banners.js`/`bannersDual.js`, `events.js`, `timeline.js`, `domain.js`, `fishing/`, `furnishing/`, `achievement/` (per-locale JSON: `src/data/achievement/en.json` etc.).
- Localized UI strings are separate per-locale JSON: `src/locales/{en,id,ru,...}.json` plus item names in `src/locales/items/{en,...}.json`. Wired via `svelte-i18n` in `src/i18n.js` (lazy `register()` per locale, dayjs locale lazy import, saved locale in `localStorage['locale']`).
- Repo localization workflow: PRs to `src/locales/` (per README/translate docs — UNVERIFIED, did not find docs file in repo).

## 3. Persistence (localforage, not raw localStorage)

Despite the common belief that paimon.moe uses localStorage, it migrated to **localforage** (IndexedDB, localStorage fallback) — `src/stores/saveManager.js` configures `localforage.config({ driver: [INDEXEDDB, LOCALSTORAGE], name: 'paimonmoe', version: 1.0 })` in `src/routes/__layout.svelte` `onMount`.

- **Key naming**: flat keys, account-prefixed. `src/stores/account.js` `getAccountPrefix()` returns `''` for `main`, else `` `${value}-` `` (e.g. `account2-`). Keys seen in `src/routes/settings/index.svelte` `deleteAccount()`: `server`, `ar`, `wl`, `todos`, `wish-counter-character-event`, `wish-counter-weapon-event`, `wish-counter-standard`, `wish-counter-beginners`, `wish-uid`, `characters`, `weapons`, `achievement`, `collectables-updated`, `furnishing*`, `fishing`, `spincrystals`, `accounts`.
- **Schema versioning/migration**: no version number per key. Migration is a one-time localforage ↔ localStorage conversion keyed by suffix (`convertSave()` in `src/stores/saveManager.js`, `saveManager.js:74-126`): keys ending `ar`/`wl` → Number, `collectables-updated` → bool, wish-counter-* → JSON with time reformat, everything else JSON.parse-fallback-string; conversion timestamp stored under `localStorage['converted']` (`CONVERTED_KEY`).
- **Write path**: `updateSave(key, data, isFromRemote)` in `src/stores/saveManager.js:146-169` sets localforage, stamps `update-time` ISO timestamp, debounced (5 s, `lodash.debounce`) push to Google Drive if signed in.
- **Import/export**: `src/routes/settings/_importExportModal.svelte` — export = `getLocalSaveJson()` (`saveManager.js:138-144`: iterate all localforage keys into one JSON object) downloaded as `paimon-moe-local-data.json`; import = FileReader → JSON.parse → `localforage.clear()` → replay each key through `updateSave(key, data, true)` → reload. Same modal reachable via `?download=json` URL param (`src/routes/settings/index.svelte` `onMount`).
- **Multi-account**: `src/stores/account.js` `accounts` writable list (`[{label:'Main', value:'main'}]` + added `account2`, `account3`… in `src/routes/settings/index.svelte` `addAccount()`), `selectedAccount` store, `getAccountPrefix()` prefixes every key. Account switch swaps a whole prefixed key namespace; `deleteAccount()`/`resetAccount()` iterate explicit key lists (`src/routes/settings/index.svelte` `deleteAccount()`/`resetAccount()`); "set main account" moves all keys between prefixes (`_setMainAccount.svelte` import in `src/routes/settings/index.svelte`).

## 4. Calculator & todo UX patterns

- Calculator page = one long page, six sub-calculators stacked with anchor jump buttons (`findPos()` smooth scroll, `src/routes/calculator/index.svelte`); "How to use" modal (`src/components/CalculatorHowToModal.svelte` via `svelte-simple-modal`).
- Character calculator computes level/ascension/talent material needs, offers **"Add to todo"** button that pushes `{type:'character', level:{from,to}, resources:{...}}` into the todo store (`src/routes/calculator/_character.svelte` `addToTodo()`, `src/stores/todo.js` `addTodo()`).
- Todo store (`src/stores/todo.js`): array of `{type, resources:{itemId: amount}, original}`; item entries merge amounts by item id (`addTodo()`). `src/routes/todo.svelte` `updateSummary()` aggregates resources across todos, computes resin cost from `src/data/dropRates.js`, and `decrease()` decrements collected amounts across multiple todo entries.
- Todo persists via `updateSave(`${prefix}todos`, val)` subscription in `src/components/TodoData.svelte`.

## 5. Changelog / update-notes presentation

- Dated plain-text list in `src/routes/changelog.svelte` (hardcoded `<pre>` block, newest first, grouped by date).
- PWA update flow: service worker build version in cache name (`src/service-worker.js` `const CACHE = cache${version}`); on new SW version, BroadcastChannel 'paimonmoe-sw' posts `{type:'update', changelog}` (`src/service-worker.js` activate handler), `src/components/ServiceWorker.svelte` opens an `UpdateModal` (`src/components/UpdateModal.svelte`) listing the changelog array with "Later"/"Refresh" buttons; changelog array lives in `src/service-worker.js` (`const changelog = ['Update v7.2 phase 1']`).

## 6. Multi-character / account handling

- `src/stores/account.js`: `accounts` (writable list, `Main` + `account2`, `account3`… created in `src/routes/settings/index.svelte` `addAccount()`), `selectedAccount` store, `getAccountPrefix()` prefixes every persisted key.
- `src/routes/settings/index.svelte` `deleteAccount()` deletes the whole prefixed key list; `resetAccount()` clears the account's data keys; "set main account" moves keys between prefixes (`_setMainAccount.svelte`).
- Wish counters/todos/characters are all stored under `${prefix}` keys; switching account swaps the whole namespace (`src/routes/settings/index.svelte` `selectAccount()`).

## 7. Patterns to adopt

- **Prefix every localStorage key by account/character id** (`getAccountPrefix()` pattern, `src/stores/account.js`) — Seal players run multiple characters; prefixing gives multi-character support for free. Store list of characters under one key (`accounts` pattern).
- **One static-DB file per domain, flat id-keyed objects** (`src/data/itemList.js` style) — Seal pet trees, quest items, fame titles map cleanly to `{id: {name, parent, day, rarity}}`.
- **"Add to todo" from calculators** (calculator → todo push, `src/routes/calculator/_character.svelte` `addToTodo()`) — fame calculator should push recommended quest items into quest guidance checklist.
- **Explicit service-worker changelog + "Later/Refresh" update modal** (`src/components/UpdateModal.svelte`, `src/service-worker.js`) — matches the landing page's "list updates/versioning" requirement.
- **Debounced remote-free persistence with `update-time` stamp** (`src/stores/saveManager.js` `updateSave()`) — cheap, no backend needed.
- **Anchor-jump single-page calculators** (`src/routes/calculator/index.svelte` `findPos()`) — keeps fame calculator + quest guidance on one screen.
- **Per-feature more-menu grouping** in sidebar (`src/components/Sidebar/Sidebar.svelte` `SidebarMoreItem`) — keeps 5-feature Seal app nav flat.

## 8. Patterns to avoid

- **localforage/IndexedDB for a small client-only app**: Seal data is tiny (character list, fame totals, pet picks); raw `localStorage` with JSON is simpler, sync, and inspectable. localforage's async API (`readSave`/`updateSave` everywhere, `src/stores/saveManager.js`) adds friction for no benefit at this data size.
- **Hardcoded changelog in a route file** (`src/routes/changelog.svelte` plaintext `<pre>`) — Seal's landing page owns the changelog; keep it in a JSON/JS data file so the landing page and any update modal share one source.
- **Account-prefix proliferation with explicit key lists to delete** (`src/routes/settings/index.svelte` `deleteAccount()`/`resetAccount()` iterate hardcoded key arrays) — brittle; a single prefixed namespace JSON blob per character avoids growing key lists.
- **Ads in a game companion** (`src/components/Ad.svelte` throughout `src/routes/__layout.svelte`, `src/routes/calculator/index.svelte`) — Seal companion is personal; skip.
- **No schema versioning** (`src/stores/saveManager.js` uses a one-time `converted` flag, not per-key schema version) — add a schema version number per namespace so future migrations are possible.
