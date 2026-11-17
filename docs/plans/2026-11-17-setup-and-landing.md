# Plan — Project setup + Landing Page (2026-11-17)

Source: direct request; specs `docs/specs/architecture.md` (§1, §2, §4, §6, §7 M0–M2) and `docs/specs/features.md` (§2.2, §2.3, §3.1, §5)
Role: dev
Size: full
Status: draft

## Tracker

| ID | Task | Status | Depends | Notes |
|----|------|--------|---------|-------|
| T0 | Local `git init`, root `.gitignore`, sanitize local paths in docs, first commit directly on `main` | `[ ]` | - | Owner exception for this one commit only |
| T1 | Scaffold SvelteKit in `app/` with the M0 commands (minimal + TS, eslint, prettier, vitest unit, adapter-static, paraglide `id`, valibot) | `[ ]` | T0 | Commands proven in trial; `app/` must be empty |
| T2 | Make the scaffold green: single-locale Paraglide, full prerender, script fixes, remove scaffold leftovers | `[ ]` | T1 | Untouched scaffold fails `check`, `build`, second `lint`; T1+T2 ship as one PR |
| T3 | Port the visual base: tokens, fonts, base + accessibility rules, global classes needed by shell and landing | `[ ]` | T2 | Port only what T4/T6 use |
| T4 | App shell: mobile header + drawer, desktop sidebar, 5 nav links, placeholder page per route, all labels from messages | `[ ]` | T3 | Drawer a11y is the main risk |
| T5 | Data-layer slice for `changelog` only: schema, sample JSON, typed export, shape test | `[ ]` | T2 | Parallel with T3/T4 |
| T6 | Landing page per features §3.1: welcome, character CTA, 4 feature cards, updates list | `[ ]` | T4, T5 | Character count deferred (see Decisions) |
| T7 | Verify: acceptance list below, 360px and 375×667 checks, keyboard pass, build output listing | `[ ]` | T6, T8, T9, T10 | |
| T8 | Write `CLAUDE.md` (rules for agents) | `[ ]` | T2 | Commands must come from the real scaffold, not the specs |
| T9 | Write `CONTRIBUTING.md` (rules for contributors) | `[ ]` | T2 | Repo will be public |
| T10 | Write `README.md` (short project overview) | `[ ]` | T2 | Overview only; rules live in `CLAUDE.md` / `CONTRIBUTING.md` |

## Acceptance

- [ ] `main` has exactly one commit (T0). Every later change is a branch + PR. `git ls-files` shows none of `initial-brief.md`, `.claude/skills/`, `node_modules/`, `.svelte-kit/`, `build/`, `.env*`; `grep -r '/Users/\|/private/tmp'` over tracked files finds nothing.
- [ ] `README.md`, `CLAUDE.md` and `CONTRIBUTING.md` exist at the repo root; every command they cite runs as written on a clean checkout; none holds personal data or local paths; `README.md` fits one screen and links to the other two and to `docs/specs/README.md`.
- [ ] `npm run check`, `lint`, `test`, `build` all exit 0 from `app/`, on a clean clone order (check first).
- [ ] `build/` contains one HTML file per route (`index`, `characters`, `fame`, `quests`, `pets`); no "not prerendered" error; no fallback page.
- [ ] Built HTML has `<html lang="id">`; no `%paraglide.*%` placeholder; no locale cookie written.
- [ ] No UI string literal in components; every label comes from `messages/id.json`.
- [ ] `npm run preview`: cream/pastel look, both fonts load from `/fonts/` (two woff2, no external font host).
- [ ] ≥ 1024px: fixed 16rem sidebar, content offset, no header. < 1024px: sticky 56px header with menu button; drawer opens, closes on close button, backdrop, Escape and navigation; focus returns to the menu button; page behind does not scroll.
- [ ] Active nav item has `aria-current="page"`; skip link works; visible focus ring on every control.
- [ ] Landing: heading + one-sentence description visible without scrolling at 375×667; four feature cards link to Fame, Quests, Pets, Characters; "add your first character" links to `/characters`.
- [ ] Landing: updates render from `changelog`, newest first, with version and date; more than 5 entries collapse into a keyboard-operable `<details>`; empty `changelog` shows the empty state.
- [ ] Shape test fails when a required `changelog` field is removed. No horizontal page scroll at 360px.

## Out of scope

- Storage layer and character count on the landing page (M3), character form, the other four features beyond a placeholder page.
- The other five data files (`jobs`, `fame-titles`, `quest-items`, `quests`, `pets`) and the cross-reference tests.
- PWA, manifest, service worker; export/import; language switcher or a second locale.
- CI, deploy, base-path handling beyond using `resolve()` for links. Git remote, noreply email and code license: owner decides later, outside this plan.
- Real game data; game artwork; code of conduct, issue/PR templates.

## Decisions

- Landing ships the "0 characters" branch only: the CTA is always shown and links to `/characters`. The count line arrives with the storage layer (features §6 note). Spec criterion 3 is therefore half-met by design.
- Drawer is a native `<dialog>` opened modally: backdrop, Escape, focus trap and inert background come from the platform, which covers every gap found in paimon.moe's nav (`docs/research/nav-reference.md` §8).
- Header 56px (reference topbar); breakpoint 1024px and sidebar 256px follow paimon.moe. Paraglide hooks deleted, `lang="id"` literal in `app.html`; they return with a second locale.
- Git: init before the scaffold. Only the T0 commit goes on `main` (owner exception 2026-11-17, not a standing rule); after it, branch + PR, one PR per task except T1+T2 together. Branch prefixes `feat/` / `fix/` unless T9 sets another convention.
- Until the owner adds a remote, "PR" means a local branch merged by the owner; commits are local-only, so their author email can still be rewritten before the first push.
- Ignored: `initial-brief.md` (owner), `.claude/skills/` (restorable from the committed `skills-lock.json`). Committed: `.claude/settings.json`, `skills-lock.json`, `docs/`, `app/`.
- File name is `CONTRIBUTING.md` (GitHub only surfaces that spelling). Three docs, three audiences: `README.md` overview, `CLAUDE.md` agents, `CONTRIBUTING.md` humans; each links to the others instead of repeating them.
- `changelog` is the only data file built now; it proves the JSON → schema → typed export → test path the other five will copy.

## Analysis

Current: `app/` is empty, no git repo, specs approved, three verification reports in `docs/research/`. Desired: a public-ready repo with a buildable, fully prerendered static app, shell and landing page on sample data, and written rules for agents and contributors.

Facts from the trial that change the work (`scaffold-trial.md`): Kit 3.2.0, Svelte 5.57.3, Vite 8.3.8, TypeScript 6.0.3, adapter-static 4.0.1, Paraglide 2.29.3 (not 3.x), Vitest 4.1.12, Valibot 1.5.0; Node ≥ 22.17 with `engine-strict=true`. Config is in `vite.config.ts` (no `svelte.config.js`). Alias is `#lib` with `.js` extensions; `$lib` is removed. `check` fails until Paraglide output exists; `lint` fails after the first vite run (Prettier flags generated `project.inlang` files); `build` fails until `prerender = true`; deleting the hooks without editing `app.html` ships raw `%paraglide.lang%`.

Risks:

| Risk | Mitigation |
|---|---|
| Dev/preview behaviour and client-side navigation with the hooks deleted were not tested in the trial | First thing checked in T2; fallback is keeping the hooks (trial variant v2 also prerenders) |
| Inlang plugins load from jsdelivr; offline build from cache is unverified | Accept for now; note it for CI at the deploy milestone |
| `<dialog>` does not lock page scroll by itself | One CSS rule on the root while a modal dialog is open; covered by the acceptance check |
| `skills-lock.json` restore (`npx skills experimental_install`) is the installer's own claim, untested; it may recreate the ~50 agent dirs it spread earlier | Test once in a scratch clone during T0; if it fails, commit `.claude/skills/` instead |
| Specs and plan cite `initial-brief.md`, which a fresh clone will not have | Specs restate the binding scope; owner may fold the brief into `docs/specs/README.md` |
| Public history is permanent: the global git email is a personal address and commits made now carry it | Out of this plan by owner decision; before the first push the owner sets the noreply email and rewrites local history (commits are not pushed yet) |
| Two research docs cite local scratch paths | T0 strips them before the first commit; acceptance greps for them |
| Public repo with no license means all rights reserved; wiki data is CC BY-SA and the game is third-party IP | License deferred by the owner; `README.md` says "license: to be decided"; data attribution and the "unofficial fan tool" notice come in the data phase (architecture R8) |

## Notes per area

### Repo root (T0)
- `git init -b main`. Author identity is whatever git is configured with; the owner fixes it before any push (see Risks).
- Replace the local scratch paths in `docs/research/scaffold-trial.md` and `styling-port-checklist.md` with `<scratch>/`.
- Root `.gitignore`: `initial-brief.md`; `.claude/skills/`; `.claude/settings.local.json`; `.DS_Store`; `node_modules/`; `.env`, `.env.*`. Build outputs, `.svelte-kit/`, `src/lib/paraglide/` and `project.inlang/cache/` are already ignored by `app/.gitignore` (generated by `sv`); do not duplicate them. `docs/research/` and `skills-lock.json` stay tracked on purpose.
- Commit 1 on `main`: root files and `docs/` only. Scaffold output starts on a branch (T1+T2 PR).
- Keep `--no-git-check` on the `sv add` command: UNVERIFIED whether `sv` blocks on a dirty tree without it.

### `app/` scaffold and tooling (T1, T2)
- Run the three M0 commands unchanged from the repo root; they are non-interactive.
- Paraglide: strategy base-locale only on the vite plugin; delete both hook files; literal `lang` in `app.html`; remove the hidden locale-links block the add-on puts in the root layout.
- Root layout module sets `prerender = true`. Make `check` self-sufficient on a clean checkout by compiling Paraglide before it runs.
- Add the two `project.inlang` lines to the root `.prettierignore` (keep `settings.json` checked).
- Remove scaffold leftovers: vitest example files, starter page content, unused `src/lib/index.ts` if nothing imports it.

### Styles and assets (T3)
- Source is `grocery-pwa/app/styles/style.css`; line ranges and verbatim blocks in `styling-port-checklist.md` §2–§3. Fonts `dm-sans-latin.woff2` (36,980 B) and `space-grotesk-latin.woff2` (22,320 B), both OFL-1.1, into `static/fonts/`.
- One global stylesheet imported once in the root layout: tokens, `@font-face`, body gradient, heading scale, accessibility block, and only the classes used now (`.btn`, `.card`, `.tag`, `.empty`, `.banner`, `.stack`, `.row`, `.section-title`), renamed to English (checklist §4). Favicon: keep the scaffold's SVG.

### App shell (T4)
- One nav list component rendered in two places (sidebar, drawer); icon + label, min 44px tall; labels and app name from messages; links via `resolve()`; active state from the pathname only.
- Header reuses the reference topbar rules; menu button in the left 44px slot. Four placeholder routes render a page head and an "under construction" empty state, so every link resolves and prerenders.

### Data slice and landing page (T5, T6)
- `changelog` per architecture §4.3 plus the optional kind tag features §3.1 asks for (add it to the spec when it lands). Types inferred from the schema; components import only from the data index; the test checks shape only (architecture §4.0).
- Landing layout and states per features §3.1; feature cards in a 2-column grid; dates via `Intl` for `id`; first 5 updates visible, the rest in `<details>`. No sample-data banner: the page shows no game data.

### Project docs (T8, T9, T10)
- `README.md`: one screen. Name and one-sentence purpose ("unofficial fan tool for Seal Online", no affiliation claim beyond that), the five features with their status (landing done, others placeholder), stack in one line, quick start (`cd app && npm install && npm run dev`, verified in T7), links to `docs/specs/README.md`, `CONTRIBUTING.md`, `CLAUDE.md`, and "License: to be decided". No wireframes, no data details.
- `CLAUDE.md` (use the installed `writing-for-agents` skill): one-paragraph project summary linking `docs/specs/README.md`; directory map; the exact scripts from `app/package.json`, run from `app/`; conventions (runes only, `#lib` alias with `.js`, UI strings only in `messages/id.json`, game data only via the data index); git flow (branch + PR, never commit to `main`); do-nots (don't commit ignored files, don't run installers that spread agent dirs). No personal data, no copy of the owner's global rules.
- `CONTRIBUTING.md`: prerequisites (Node ≥ 22.17, npm), setup, scripts, branch and commit conventions, PR checklist (check, lint, test, build green), language policy (UI Indonesian, code and docs English), note that data PRs are not accepted until the data phase.
