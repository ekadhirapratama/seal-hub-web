# Seal Hub Web — Architecture Plan

Status: PLAN (no code scaffolded yet). Date: 2026-11-16.
Inputs: `initial-brief.md` (binding scope), `docs/research/*.md`.
Sibling doc: `docs/specs/features.md` owns per-feature UX specs. This doc owns stack, structure, data shapes, storage, milestones.

Scope rules carried from the brief: client-only static site, no backend/API, game data as static JSON, user data in `localStorage`, no login. Remote repo and real data collection are later milestones; this plan uses sample data only.

Verification notes:

- Versions below were read from the npm registry on 2026-11-16 (`npm view <pkg> version`).
- Commands and config were checked against svelte.dev docs on 2026-11-16 (`/docs/kit/creating-a-project`, `/docs/cli/sv-create`, `/docs/cli/sv-add`, `/docs/kit/adapter-static`, `/docs/kit/single-page-apps`, `/docs/kit/service-workers`, `/docs/kit/page-options`).
- Anything marked **UNVERIFIED** was not confirmed and must be checked at the milestone that uses it.

---

## 1. Stack decisions

| Area | Decision | Rationale |
|---|---|---|
| Framework | SvelteKit 3.x (`@sveltejs/kit` 3.2.0), Vite 8 | Brief mandates SvelteKit; 3.x is what `sv create` generates today. |
| Component model | Svelte 5 (5.57.x), runes only (`$state`, `$derived`, `$props`); no legacy stores | Current default; one reactivity model for components and the storage module. |
| Rendering | `@sveltejs/adapter-static` 4.x, full prerender: `export const prerender = true` in `src/routes/+layout.ts`. No SPA fallback, `ssr` stays on | Docs: if every page can be prerendered, use static generation; SPA mode has a large performance cost. All 5 features have a finite, known URL set. |
| Dynamic routes | `/quests/[id]` and `/pets/[category]` prerendered via `export function entries()` reading the static JSON | Deep-linkable pages with no fallback page and no host rewrite rules. |
| Config location | `vite.config.ts` → `sveltekit({ adapter: adapter() })` | adapter-static docs: `svelte.config.js` is no longer supported in Kit 3. The `sveltekit-adapter` add-on page still mentions `svelte.config.js` — follow whatever `sv` generates (see Risks R1). |
| TypeScript | Yes (`--types ts`), strict | Data shapes are the core of this app; types catch shape drift between JSON and UI. |
| Schema / validation | Valibot 1.x, one schema file per layer; TS types inferred from schemas | One source of truth for types and validation. Needed at runtime anyway for `localStorage` (trust boundary). Small and tree-shakable. |
| CSS | Plain CSS. One global `src/app.css` (tokens + base elements + utility classes) plus scoped `<style>` in components. No Tailwind, no component library | Matches the reference repo exactly, so its stylesheet ports almost verbatim. See "CSS port" below. |
| Fonts | Self-hosted `dm-sans-latin.woff2`, `space-grotesk-latin.woff2` in `static/fonts/` | Same as reference; no third-party font request, works offline later. |
| PWA / service worker | **Later** (M7). Add `static/manifest.webmanifest` and `src/service-worker.ts` after features work | A cache-first worker hides stale builds during feature development. SvelteKit bundles and auto-registers the worker, so adding it later costs one file. |
| Unit tests | Vitest (`vitest="usages:unit"`): fame math, storage migration, data validation | These three are the only non-trivial logic. No component tests yet. |
| E2E tests | None for now (Playwright deferred) | 5 small pages; manual check plus `npm run build` covers it. Revisit if regressions appear. |
| Lint / format | ESLint + Prettier via `sv add`, `svelte-check` via `npm run check` | Official add-ons, zero custom config. |
| Package manager | npm | Already installed, no extra tooling. (pnpm and bun also present — see Q6.) |
| Node | >= 22.17 (Kit 3 `engines`); local is v26 | Required by `@sveltejs/kit` 3.2.0. |
| i18n | Paraglide JS 2.x (what `sv add paraglide` installs; 2.29.3 in the 2026-11-17 trial) via `sv add paraglide` (official add-on). Local message files only (`messages/id.json`), no translation service. Ships with one locale, `id`, as base locale; UI strings are never hard-coded in components | Owner decision 2026-11-17: multi-language is planned, Indonesian only for now. Messages compile to typed, tree-shaken functions, so adding a language later is one new JSON file plus a locale strategy, with no component edits. |
| Dark mode | None | Reference has none; not in brief. |

### CSS port (reference → SvelteKit)

1. Copy the `:root` token block from `grocery-pwa/app/styles/style.css` into `src/app.css` unchanged (colors, `--font-head`, `--font-body`, `--radius`, `--shadow`).
2. Copy the `@font-face` blocks, the `body` gradient rule, the heading scale, and the accessibility block (skip link, `:focus-visible`, `.sr-only`, reduced-motion) into the same file.
3. Copy style-only classes as global classes (`.btn`, `.card`, `.tag`, `.status`, `.stack`, `.row`, `.empty`, `.banner`, form inputs). Rename the Indonesian class names to English while copying (`.cek` → `.check`, `.pilih-tipe` → `.radio-cards`, `.aksi-fixed` → `.action-bar`, `.lebar` → `.wide`).
4. Anything with behavior or fixed markup becomes a Svelte component with scoped styles (section 6).
5. Import `app.css` once in `src/routes/+layout.svelte`.

No preprocessor, no CSS-in-JS, no token build step.

---

## 2. Directory structure

`app/` is **confirmed** as the SvelteKit project root. It is empty, so `sv create app` passes the directory check. Repo root keeps docs, skills and the brief out of the build. Cost: every npm command runs from `app/`, and a future host needs "root directory = app" (see Q1).

```
seal-hub-web/
├── initial-brief.md
├── skills-lock.json
├── .claude/skills/                # project skills (already installed)
├── docs/
│   ├── research/                  # existing
│   └── specs/
│       ├── architecture.md        # this file
│       └── features.md            # sibling
└── app/                           # SvelteKit root (created in M0)
    ├── package.json
    ├── vite.config.ts             # sveltekit({ adapter: adapter() })
    ├── tsconfig.json
    ├── messages/
    │   └── id.json                # UI strings, base locale (add en.json etc. later)
    ├── static/
    │   ├── fonts/                 # 2 woff2 files
    │   └── favicon.svg
    └── src/
        ├── app.html
        ├── app.css                # tokens + base + global classes
        ├── lib/
        │   ├── data/
        │   │   ├── schema.ts      # Valibot schemas + inferred types (game data)
        │   │   ├── index.ts       # typed exports of the 6 JSON files
        │   │   ├── data.test.ts   # validates every JSON file + cross-references
        │   │   ├── jobs.json
        │   │   ├── fame-titles.json
        │   │   ├── quest-items.json
        │   │   ├── quests.json
        │   │   ├── pets.json
        │   │   └── changelog.json
        │   ├── storage/
        │   │   ├── characters.svelte.ts   # the only module touching localStorage
        │   │   └── characters.test.ts
        │   ├── fame.ts            # pure fame math (current title, next title, fame left, item ranking)
        │   ├── fame.test.ts
        │   ├── paraglide/         # generated by Paraglide; never edited by hand
        │   └── components/        # shared UI (section 6)
        └── routes/
            ├── +layout.ts         # export const prerender = true
            ├── +layout.svelte     # app shell: header, sidebar/drawer nav, storage banner
            ├── +page.svelte       # landing
            ├── characters/+page.svelte
            ├── fame/+page.svelte
            ├── quests/+page.svelte
            ├── quests/[id]/+page.ts       # entries() + load
            ├── quests/[id]/+page.svelte
            ├── pets/+page.svelte
            ├── pets/[category]/+page.ts   # entries() + load
            └── pets/[category]/+page.svelte
```

Deliberately absent: `stores/`, `services/`, `utils/`, `types/` folders, a barrel for components, an API layer. Add a folder when a second file needs it.

---

## 3. Route map

| Feature | Route | Prerender | Reads game data | Reads user data |
|---|---|---|---|---|
| Landing (welcome + updates) | `/` | static | `changelog` | — |
| Character Management | `/characters` | static shell | `jobs` | `Character[]` (read/write) |
| Fame Calculator | `/fame` | static shell | `fame-titles`, `quest-items` | `Character[]` (read), active character id |
| Quest Guidance — index | `/quests` | static | `quests` (sources + list) | — |
| Quest Guidance — detail | `/quests/[id]` | `entries()` = every quest id | `quests`, `quest-items` (for `format: "items"`) | — |
| Pet Evolution — category picker | `/pets` | static | `pets` (names only) | — |
| Pet Evolution — tree | `/pets/[category]` | `entries()` = 7 category ids | `pets` | — |

Rules that follow from full prerender:

- Add/edit character is a dialog on `/characters`, not a separate route.
- Fame Calculator "add character" is a plain link to `/characters`.
- Pages that depend on user data prerender an empty/loading shell and fill in after hydration. `localStorage` is only read in the browser.
- Do not read `url.searchParams` during prerender (docs forbid it): never in `load` or at component top level. The calculator ↔ character-form hand-off in `features.md` §4 (`?form=`, `?return=`, `?character=`) is read in the browser only, after hydration.
- All internal links go through `resolve()` from `$app/paths` so a non-root base path (GitHub Pages project site) works without edits.

---

## 4. Static game-data layer

### 4.0 Provisional by design

Owner decision 2026-11-17: this phase is project setup; real data is the next phase. Every shape in 4.3 is a **placeholder expected to change**. Rules that keep a change cheap:

- Components and routes read game data only through `#lib/data` (`index.ts`). Kit 3 scaffolds the `#lib` alias via `package.json` `imports`; `$lib` is a removed module (`docs/research/scaffold-trial.md` D2). No JSON import anywhere else. A shape change touches `schema.ts`, the JSON file, and the consumers the type-checker then points at.
- Types are inferred from `schema.ts`, never hand-written a second time.
- Game constants that depend on real data (level cap, job tiers, eligibility bounds) live in data or in one constants spot, not scattered in components. `MAX_LEVEL` is a placeholder until the data phase.
- Tests in this phase check shape only (`v.parse`). The stricter cross-reference checks in 4.2 are written in the data phase, once shapes settle; writing them now would be rework.
- Sample files stay tiny (just enough to render each screen state).

### 4.1 Layout and loading

- Six JSON files in `src/lib/data/`, named exactly: `jobs`, `fame-titles`, `quest-items`, `quests`, `pets`, `changelog`.
- `src/lib/data/index.ts` imports each file statically and exports it typed: `export const jobs = jobsJson as Job[]`. No `fetch`, no runtime loader, no cache. Data is bundled and prerendered into HTML.
- Known limit: everything lands in one data chunk. Fine for sample data and expected real size (a few hundred rows). Split per route if the chunk passes ~300 KB.

### 4.2 Type-check and validation

| Step | Where | What |
|---|---|---|
| Schemas | `src/lib/data/schema.ts` | One Valibot schema per file; types via `v.InferOutput`. |
| Shape check | `src/lib/data/data.test.ts` (Vitest) | `v.parse(schema, json)` for all 6 files. |
| Cross-reference check (**data phase, not now**; see 4.0) | same test | Unique ids per file; `jobs.parentId` exists; `fame-titles` strictly ascending by `fame`; `quest-items.questId` points at a quest with `format: "items"`; `quests[].source` exists in `sources`; every pet edge `from`/`to` exists in that family's `nodes`; each pet family has exactly one root and no cycles; all nodes reachable from the root. |
| Gate | `npm run test` | Bad data fails the test run, so it never ships. No validation cost in the browser. |

The `as` cast in `index.ts` is safe only because the test passes. That is the single accepted cast in the data layer.

### 4.3 Shapes

Conventions for all files: `id` is a lowercase kebab-case slug, unique within its file, never reused. Numbers are plain integers (no `"182,178"` strings). Optional fields are omitted, not `null`. All sample values below are illustrative, **not verified game data**.

#### `jobs.json` — `Job[]`

| Field | Type | Notes |
|---|---|---|
| `id` | string | Stored in `Character.job`. |
| `name` | string | Display name. |
| `tier` | integer >= 0 | 0 = Beginner, 1 = first job, 2 = second job. |
| `parentId` | string, optional | Job it promotes from. Absent for Beginner. |

```json
[
  { "id": "beginner", "name": "Beginner", "tier": 0 },
  { "id": "warrior", "name": "Warrior", "tier": 1, "parentId": "beginner" },
  { "id": "blademaster", "name": "Blademaster", "tier": 2, "parentId": "warrior" }
]
```

Dropped from the research draft: `description`, `attackType` (no feature uses them).

#### `fame-titles.json` — `FameTitle[]`, sorted ascending by `fame`

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `title` | string | Wiki column "Title". |
| `altTitle` | string, optional | Wiki column "Alternative Title". Meaning unconfirmed (Q8). |
| `fame` | integer >= 0 | Minimum fame to hold the title. First entry must be 0. |

```json
[
  { "id": "beggar", "title": "Beggar", "altTitle": "Baby", "fame": 0 },
  { "id": "drifter", "title": "Drifter", "altTitle": "Child", "fame": 50 },
  { "id": "brute", "title": "Brute", "altTitle": "Soldier", "fame": 581 }
]
```

Current title = last entry with `fame <= character.fame`. Next title = the entry after it. Dropped: `sleepAvatar`, `deathDeduction`, `rank` (array order is the rank).

#### `quest-items.json` — `QuestItem[]`

One row = one repeatable "hand in N of item X for fame" quest. This is the source for Fame Calculator recommendations and for the table view of `format: "items"` quests.

| Field | Type | Notes |
|---|---|---|
| `id` | string | `<item-slug>-l<minLevel>`; the same item can appear in two level bands. |
| `questId` | string | Quest (board) this row belongs to, e.g. `quest-center`. |
| `name` | string | Item name. |
| `qty` | integer >= 1 | Amount per hand-in. |
| `fame` | integer >= 0 | Fame per hand-in. |
| `exp` | integer >= 0, optional | |
| `cegel` | integer >= 0, optional | |
| `minLevel` | integer >= 1 | Wiki "Above Lv." |
| `maxLevel` | integer, optional | Wiki "Below Lv." Absent = no level cap. |
| `maxFame` | integer, optional | Wiki "Below Fame N". Some high-level rows cap by fame instead of level. |
| `droppedBy` | string[] | Monster names, may be empty. |

```json
[
  {
    "id": "geranium-l1",
    "questId": "quest-center",
    "name": "Geranium",
    "qty": 30,
    "fame": 20,
    "exp": 260,
    "cegel": 100,
    "minLevel": 1,
    "maxLevel": 8,
    "droppedBy": ["Piya", "Beanie"]
  },
  {
    "id": "devils-nail-l135",
    "questId": "high-central",
    "name": "Devil's Nail",
    "qty": 30,
    "fame": 350,
    "exp": 126000,
    "minLevel": 135,
    "maxFame": 182178,
    "droppedBy": ["Soul Collector"]
  }
]
```

Eligibility for a character: `level >= minLevel`, and `level < maxLevel` if present, and `fame < maxFame` if present. Whether the wiki bounds are inclusive is **UNVERIFIED**; fix it in `fame.ts` once data is collected. The research draft had no `maxFame` and a free-text `levelRange`; both are replaced here.

#### `quests.json` — `{ sources: QuestSource[], quests: Quest[] }`

Sources are data, not a hard-coded enum, so adding a source needs no code change.

`QuestSource`: `{ id, name, description? }`.

`Quest` is a union on `format`:

| Field | `format: "items"` | `format: "walkthrough"` | Notes |
|---|---|---|---|
| `id` | yes | yes | URL param of `/quests/[id]`. |
| `source` | yes | yes | A `sources[].id`. |
| `title` | yes | yes | |
| `format` | `"items"` | `"walkthrough"` | Discriminator. |
| `summary` | optional | optional | One or two sentences. |
| `minLevel` | optional | optional | |
| `startNpc`, `location` | optional | optional | Where to take the quest. |
| `requirements` | — | optional `{ name, qty }[]` | Items to prepare before starting. |
| `steps` | — | `string[]`, min 1 | Ordered plain-text steps. No HTML or Markdown. |
| `rewards` | — | optional `{ fame?, exp?, cegel?, items? }` | `items` is `string[]`. |

An `items` quest has no rows of its own: its table is every `QuestItem` with a matching `questId`.

```json
{
  "sources": [
    { "id": "quest-center", "name": "Quest Center" },
    { "id": "high-central", "name": "High Central Quest" },
    { "id": "highest", "name": "Highest Quest" },
    { "id": "main", "name": "Main Quest" }
  ],
  "quests": [
    {
      "id": "quest-center",
      "source": "quest-center",
      "title": "Quest Center Item Quests",
      "format": "items",
      "summary": "Hand in monster drops for fame, exp and cegel.",
      "minLevel": 1
    },
    {
      "id": "four-heroes",
      "source": "main",
      "title": "4 Heroes Quest",
      "format": "walkthrough",
      "minLevel": 15,
      "startNpc": "D.End",
      "location": "Training Tower, Elim",
      "requirements": [{ "name": "Sample Item", "qty": 1 }],
      "steps": [
        "Talk to D.End at the training tower in Elim.",
        "Take the warp portal behind D.End.",
        "Talk to Joan and go through every dialogue option."
      ],
      "rewards": { "fame": 0, "exp": 0, "items": [] }
    }
  ]
}
```

#### `pets.json` — `PetFamily[]` (exactly 7)

Each family is a small directed graph: flat `nodes` plus `edges`. This supports branching (one node, several outgoing edges), merging paths, and per-edge materials. A nested tree could not express a merge and would bury materials inside children.

`PetFamily`:

| Field | Type | Notes |
|---|---|---|
| `id` | string | One of `seed`, `piya`, `bird`, `heaven`, `mandragora`, `kitsune`, `blackdragon`. URL param of `/pets/[category]`. |
| `name` | string | |
| `rootId` | string | Node the tree starts from (the egg/seed). |
| `nodes` | `PetNode[]` | |
| `edges` | `PetEdge[]` | |

`PetNode`: `{ id, name, stage, rarity? }` — `stage` is an integer >= 1 (column in the tree view); `rarity` is `"normal" | "rare" | "very-rare"`, default normal. Node ids are unique within a family.

`PetEdge`:

| Field | Type | Notes |
|---|---|---|
| `from`, `to` | string | Node ids in the same family. `to.stage` must be greater than `from.stage`. |
| `materials` | `{ name, qty? }[]` | Recommended items for this evolution. Array order is meaningful (research says order can matter). `qty` omitted when unknown. |
| `note` | string, optional | Conditions such as job restriction, success chance, timing. Free text until real data shows a pattern. |

```json
[
  {
    "id": "piya",
    "name": "Piya",
    "rootId": "piya-egg",
    "nodes": [
      { "id": "piya-egg", "name": "Piya Egg", "stage": 1 },
      { "id": "baby-piya", "name": "Baby Piya", "stage": 2 },
      { "id": "piya-fighter", "name": "Sample Fighter Piya", "stage": 3 },
      { "id": "piya-rare", "name": "Sample Rare Piya", "stage": 3, "rarity": "rare" }
    ],
    "edges": [
      {
        "from": "piya-egg",
        "to": "baby-piya",
        "materials": [{ "name": "Hatching Stone", "qty": 1 }, { "name": "Milk" }]
      },
      {
        "from": "baby-piya",
        "to": "piya-fighter",
        "materials": [{ "name": "Chicken Feather" }, { "name": "Egg" }]
      },
      {
        "from": "baby-piya",
        "to": "piya-rare",
        "materials": [{ "name": "Lucky Card" }],
        "note": "Sample: low success chance."
      }
    ]
  }
]
```

Material names are plain strings. There is no shared item catalogue: no feature needs to join pet materials with quest items.

#### `changelog.json` — `ChangelogEntry[]`, newest first

| Field | Type | Notes |
|---|---|---|
| `version` | string | Semver. Entry 0 is the version shown in the app. |
| `date` | string | `YYYY-MM-DD`. |
| `title` | string, optional | |
| `changes` | `string[]`, min 1 | Plain text lines. |

```json
[
  {
    "version": "0.1.0",
    "date": "2026-11-16",
    "title": "First preview",
    "changes": ["Project setup", "Sample data for all five features"]
  }
]
```

---

## 5. User-data layer

### 5.1 Storage

| Item | Decision |
|---|---|
| Key | Single key `seal-hub`. |
| Value | `{ "version": 1, "characters": Character[], "activeCharacterId"?: string }` |
| Module | `src/lib/storage/characters.svelte.ts` — the only file allowed to touch `localStorage`. |
| Backup key | `seal-hub:corrupt-<timestamp>` (written only on reset). |

One blob, one key: no per-character key prefixes (the paimon.moe pattern the research says to avoid).

### 5.2 `Character`

| Field | Type | Rule |
|---|---|---|
| `id` | string | `crypto.randomUUID()`, set on create, never edited. |
| `name` | string | Trimmed, 1–24 chars. Duplicates allowed. |
| `job` | string | A `jobs[].id`. Validated as a string only: an unknown id is displayed as-is, never rejected, so a job rename in game data cannot lock a user out. |
| `level` | integer | 1..`MAX_LEVEL` (constant in the storage module; value in Q9). |
| `fame` | integer | >= 0. |

```json
{
  "version": 1,
  "characters": [
    { "id": "3f2b6c1e-8d0a-4c57-9b1e-2a7d5e9f4c10", "name": "Rascal", "job": "warrior", "level": 42, "fame": 1200 }
  ],
  "activeCharacterId": "3f2b6c1e-8d0a-4c57-9b1e-2a7d5e9f4c10"
}
```

`activeCharacterId` remembers the last character picked in the Fame Calculator. A stale id (character deleted) is ignored.

### 5.3 Module contract

| Export | Behavior |
|---|---|
| `store.status` | `"empty" \| "ok" \| "unreadable" \| "unavailable"`. |
| `store.characters`, `store.activeCharacterId` | Reactive (`$state`), read-only to callers. |
| `add(input)`, `update(id, patch)`, `remove(id)`, `setActive(id)` | Return `{ ok: true }` or `{ ok: false, reason }`. Callers must show failures. |
| `reset()` | Backup raw value, then write an empty state. Aborts if the backup write fails. |

Rules ported from the reference `store.js`:

- **Read-modify-write.** Every mutation re-reads the key, applies the change, writes, then refreshes `$state`. A second tab cannot be overwritten by a stale copy.
- **Cross-tab sync.** One `storage` event listener reloads state.
- **Browser only.** Loading happens on first client access; during prerender the state is `empty`.
- **Validated input.** `add`/`update` run the same Valibot `Character` schema as loading.

### 5.4 Migration and corrupt data

Load sequence: read key → `JSON.parse` → read `version` → run migrations → validate with the current schema.

| Case | Result |
|---|---|
| Key missing | `empty`, writable. |
| `version` < current | Run `migrations[n]` (function from version n to n+1) in order, validate, write back once. |
| `version` == current, valid | `ok`. |
| `version` > current (written by a newer build) | `unreadable`, read-only. Never downgrade data. |
| Parse error, or validation fails after migration | `unreadable`, read-only. Raw value left untouched. |
| `localStorage` throws (blocked, private mode, quota) | `unavailable`, read-only. |

Read-only mode: the root layout shows a banner; mutations return `{ ok: false, reason: "readonly" }`. For `unreadable`, the banner offers "Start over", which calls `reset()` (backup first). No silent data loss, no auto-repair of partial data.

`migrations` starts as an empty object. Each future schema change adds exactly one entry and one test.

### 5.5 Export / import

**Not in v1** (owner decision 2026-11-17). Nothing is built for it now. The storage design already allows it later: the state is one versioned JSON blob, and loading goes through one migrate + validate path that an import can reuse.

---

## 6. Shared UI component inventory

Mapped from `styling-reference.md` §4. Style-only pieces stay global CSS classes; pieces with behavior or fixed markup become components in `src/lib/components/`.

| Reference piece | Form in this app | Notes |
|---|---|---|
| Tokens, fonts, body gradient, heading scale | `app.css` | Verbatim port. |
| Skip link, focus ring, `.sr-only`, reduced motion | `app.css` + skip link in root layout | |
| `.btn` `.primary` `.small` `.block` `.danger` | global classes | Works on `<button>` and `<a>`. |
| `.icon-btn` | global class | 44px target. |
| `.card`, `a.card`, `.card-title` | global classes | |
| `.tag`, `.status` | global classes | Variants renamed for this domain (e.g. rarity, quest source). |
| `.stack`, `.row`, `.row.between`, `.section-title`, `.count` | global classes | |
| `.empty` | global class | "No characters yet" and similar. |
| `.banner`, `.alert` | global classes | Used by the storage banner in the root layout. |
| Inputs, `label.field`, `.hint`, `.hint.error` | global classes | Character form. |
| `.topbar` + `.app` column | `AppShell.svelte` (used by root layout) | Sticky header + content column (720px, `wide` variant) + the primary nav. Nav follows the paimon.moe responsive pattern (owner decision 2026-11-17): fixed left sidebar on desktop, off-canvas drawer opened from a header menu button on mobile. One nav list, two presentations. Details in `features.md` §2.2. |
| `.page-head`, `.sub` | `PageHead.svelte` | `title`, `subtitle` props. |
| `dialog` + `modal.js` | `Dialog.svelte` | Native `<dialog>`, `open` bindable, backdrop-click close. Replaces the `data-open` delegation. |
| `.filter` segmented control | `Segmented.svelte` | Radio group; quest source filter, pet rarity filter. |
| `.bar`, `.progress-text` | `Progress.svelte` | `value`, `max`, label. Fame progress to next title. |
| `.pilih-tipe` radio cards | `RadioCards.svelte` | Pet category picker, job picker if wanted. |
| `.cek` custom checkbox | global class `.check` | Port only when a feature needs a checklist. |
| `.aksi-fixed` bottom action bar | global class `.action-bar` | Port only when a feature needs it. |

New, not in the reference:

| Piece | Form | Used by |
|---|---|---|
| Data table | global `.table` class + horizontal scroll wrapper | Quest items, fame titles. |
| `CharacterSelect.svelte` | component | Fame Calculator (and any later feature that picks a character). Shows the "add character" link when the list is empty. |
| Evolution tree | route-local component in `routes/pets/[category]/` | Pets only; not shared, so not in `lib/components`. |

Build components when the first feature needs them, not all up front.

---

## 7. Setup milestones

All commands run from the repo root unless a `cd` is shown. Script names (`check`, `lint`, `test`, `build`) are what `sv` templates generate; confirm them in the generated `package.json` at M0.

### M0 — Scaffold

```sh
npx sv create app --template minimal --types ts --no-add-ons --install npm
cd app
npx sv add eslint prettier vitest="usages:unit" sveltekit-adapter="adapter:static" paraglide="languageTags:id+demo:no" --no-git-check --install npm
npm install valibot
```

`--no-git-check` because the folder is not a git repo yet. If `sv add` rejects several add-ons with options in one call, run them one at a time.

After `sv add paraglide`: confirm the base locale is `id`, and set the locale strategy to base-locale only (no URL prefix, no cookie) so full prerender is unaffected. The exact option name is **UNVERIFIED**; read what the add-on generates. The strategy for a second language (URL prefix vs. stored preference) is decided when that language is added.

Trial result (`docs/research/scaffold-trial.md`): the commands above run unchanged, but the untouched scaffold fails `check` until Paraglide output is generated, fails `lint` after the first vite run (Prettier flags generated `project.inlang` files), and fails `build` until `prerender = true`. The fixes are listed in `docs/plans/2026-11-17-setup-and-landing.md`.

Done-check: `npm run dev` serves the starter page at `http://localhost:5173`; `npm run check` and `npm run lint` exit 0 after those fixes; a string from `messages/id.json` renders on the starter page.

### M1 — Static build and app shell

- `src/routes/+layout.ts` with `export const prerender = true`.
- Confirm adapter-static is wired where `sv` put it (expected `vite.config.ts`).
- `src/app.css` with the ported tokens and base rules; fonts in `static/fonts/`; `AppShell` (header, desktop sidebar, mobile drawer) with links to the 5 feature routes, labels from `messages/id.json`; empty placeholder page per route.

Done-check: `npm run build` exits 0 with no "not prerendered" error; `build/` contains `index.html` plus one HTML file per static route; `npm run preview` shows the cream/pastel look, sidebar at desktop width and drawer at 360px, with both fonts loaded (Network tab: two woff2, no external font host).

### M2 — Game-data layer

- `schema.ts`, the six JSON files with the samples from section 4 (at least: 3 jobs, 3 fame titles, 2 quest items, 1 quest per format, 7 pet families with one branching family, 1 changelog entry), `index.ts`, `data.test.ts` (shape parse only, see 4.0).
- `entries()` for `/quests/[id]` and `/pets/[category]`.

Done-check: `npm run test` passes; breaking one shape on purpose (e.g. removing a required field) makes it fail; `npm run build` emits one HTML file per quest id and per pet category.

### M3 — User-data layer

- `characters.svelte.ts` with status, CRUD, `reset()`, cross-tab listener; `characters.test.ts`.
- Storage banner in the root layout.

Done-check: tests cover empty, valid, corrupt JSON, newer version, failed validation, reset-with-backup, and `localStorage` throwing; all pass. Manually setting `localStorage['seal-hub'] = '{'` in the browser shows the read-only banner and "Start over" leaves a `seal-hub:corrupt-*` key.

### M4 — Features

Built per `docs/specs/features.md`, in dependency order:

| Step | Feature | Needs |
|---|---|---|
| M4.1 | Character Management | M3, `jobs` |
| M4.2 | Fame Calculator (+ `fame.ts` and tests) | M4.1, `fame-titles`, `quest-items` |
| M4.3 | Quest Guidance | `quests`, `quest-items` |
| M4.4 | Pet Evolution | `pets` |
| M4.5 | Landing | `changelog` |

Done-check per step: the feature's acceptance criteria in `features.md` pass on sample data; `npm run check`, `lint`, `test`, `build` all exit 0.

### M5 — Polish pass

Keyboard and focus check on every page, 360px-wide layout check, empty states, reduced-motion check.

Done-check: every interactive control reachable by keyboard with a visible focus ring; no horizontal page scroll at 360px (tables scroll inside their wrapper).

### M6 — (removed)

Was export/import; not in v1 (see 5.5). Number kept so later milestone ids do not shift.

### M7 — PWA

`static/manifest.webmanifest`, icons, `src/service-worker.ts` (cache named by build version, precache built assets and prerendered pages, delete old caches on activate).

Done-check: `npm run build && npm run preview`, then offline mode still loads all routes; a new build replaces the old cache. Note: the worker is not bundled in dev.

### Later milestones (out of this session, per brief)

| ID | Milestone | Blocked on |
|---|---|---|
| M8 | Remote repo (local git is initialised earlier, see `docs/plans/2026-11-17-setup-and-landing.md` T0), CI (`check`, `lint`, `test`, `build`), deploy | Q2 (host decides base path, `trailingSlash`, 404 page) |
| M9 | Real data collection replacing samples | Q9, Q10; wiki URLs in `data-source.md` re-verified one by one |

---

## 8. Risks

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| R1 | SvelteKit 3 is recent; docs disagree on config location (`vite.config` vs `svelte.config.js`) | Scaffold step may not match this plan | Trust what `sv` generates at M0; this plan depends only on adapter-static + prerender, not on the file name. |
| R2 | npm `latest` TypeScript is 7.0.2 but Kit 3.2.0 peers on `^6.0.0` | Peer warning or broken type-check if upgraded by hand | Keep the TypeScript version `sv create` pins. Do not bump manually. |
| R3 | Sample data shapes are guesses about a game wiki not yet read in full | Schema changes when real data arrives (pets most likely: quantities, success rates, job-locked branches) | Schemas live in one file with a validation test; `note` and optional `qty` absorb unknowns. Re-check shapes at the start of M9 before bulk entry. |
| R4 | Quest-item eligibility rules unclear (inclusive bounds, level cap vs fame cap, repeat limits) | Wrong fame recommendations | Rule isolated in `fame.ts` with tests; marked UNVERIFIED until M9. |
| R5 | `localStorage` is the only copy of user data | User loses characters on site-data clear or browser switch | Accepted for v1 (export/import deferred, see 5.5); corrupt data is never overwritten without a backup key. |
| R6 | Prerendered pages hydrate with empty user state | Flash of "no characters" before real data shows | Storage `status` distinguishes not-yet-loaded from empty; pages render a neutral placeholder until loaded. |
| R7 | Host base path unknown | Broken links and assets on a project sub-path | `resolve()` for all internal links from M1; base path set from env at M8. |
| R8 | Wiki content is community-licensed (Fandom, CC BY-SA) | Attribution duty once real data ships | Add a source/attribution line in the footer at M9. Not legal advice; owner to confirm. |
| R9 | Wiki text is Indonesian, item names English | Mixed-language UI | UI strings go through Paraglide (`id` now). Language of game-data text (item names, walkthrough prose) is decided in the data phase. |
| R10 | Two planning docs written in parallel | Naming drift between `features.md` and this file | Entity/file names here are fixed: `jobs`, `fame-titles`, `quest-items`, `quests`, `pets`, `changelog`, `Character`. Reconcile field names before M2. |

---

## 9. Open questions for owner

Each has a default this plan already assumes. Answer only the ones you want changed.

| # | Question | Options | Recommended default |
|---|---|---|---|
| Q1 | Is `app/` the SvelteKit root? | (a) `app/` (b) repo root | **(a)** — keeps docs and skills out of the app; matches the reference repo layout. |
| Q2 | Hosting target (decides base path, `trailingSlash`, 404 page)? | (a) GitHub Pages (b) Cloudflare Pages / Netlify / Vercel static (c) own nginx + Docker like grocery-pwa | **Defer to M8.** Plan is host-neutral until then. If forced now: (c), since that pipeline already exists. |
| Q3 | UI and data language? | (a) Indonesian UI, game terms in English (b) all English (c) both with i18n | **DECIDED 2026-11-17:** Indonesian only for now, built on local i18n (Paraglide) so more languages can be added later. Game terms stay as in the game client. This doc and code stay English. |
| Q4 | Export/import of characters? | (a) yes, minimal JSON file (b) no | **DECIDED 2026-11-17: (b)**, not in v1. |
| Q5 | PWA / offline timing? | (a) after features, M7 (b) from M1 (c) never | **(a)**. |
| Q6 | Package manager? | (a) npm (b) pnpm (c) bun | **(a)** — nothing extra to install or explain. |
| Q7 | E2E tests (Playwright)? | (a) none now (b) one smoke test per route | **(a)**; add (b) at M8 with CI if wanted. |
| Q8 | `fame-titles`: what are the wiki's "Title" vs "Alternative Title" columns, and which should the app show? | (a) show both (b) pick one by a character attribute (needs a new `Character` field) | **(a)** until the meaning is confirmed. (b) would change the `Character` schema. |
| Q9 | Game version / server the data targets, and its level cap (`MAX_LEVEL`) and job tiers? | free answer | Assume Seal Online Indonesia as on the ID wiki, jobs up to tier 2, `MAX_LEVEL` = 300 as a loose guard (**UNVERIFIED**) until told otherwise. |
| Q10 | Pet evolution edges: is "materials" a fixed recipe with quantities, or a list of feed items that raise an evolution stat? | (a) fixed recipe (b) feed list (c) differs per family | Shape supports all three (`qty` optional, `note` free text). Need the answer before M9, not before M2. |
| Q11 | Remember the last selected character in the Fame Calculator (`activeCharacterId`)? | (a) yes (b) no, always pick | **(a)** — one optional field, saves a tap for single-character users. |
| Q12 | Valibot as the one runtime dependency besides SvelteKit? | (a) Valibot (b) Zod (c) hand-written guards | **(a)** — smallest bundle; (c) means duplicating every type by hand. |
