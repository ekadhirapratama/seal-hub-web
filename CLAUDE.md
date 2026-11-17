# CLAUDE.md

Seal Hub: unofficial fan tool for Seal Online. Static, prerendered SvelteKit 5 site with Indonesian UI. Specs and scope: [docs/specs/README.md](docs/specs/README.md). Contributor rules: [CONTRIBUTING.md](CONTRIBUTING.md). Overview: [README.md](README.md).

## Layout

- `app/` — the SvelteKit project. Run every npm command from here.
  - `app/src/routes/` — pages (`+layout.ts` sets `prerender`).
  - `app/src/lib/` — shared code, imported via `#lib`.
  - `app/messages/id.json` — all UI strings (Paraglide).
  - `app/static/` — static assets (fonts, robots.txt).
- `docs/specs/` — binding product and architecture specs.
- `docs/plans/` — dated task plans; the plan names your task and its acceptance.
- `docs/research/` — reference notes; read-only.

## Commands

Run from `app/`. Run `npm install` first on a clean checkout.

```sh
npm run dev        # dev server
npm run check      # paraglide compile + svelte-kit sync + svelte-check
npm run lint       # prettier --check + eslint
npm run format     # prettier --write
npm test           # vitest, single run
npm run build      # static build to app/build/
npm run preview    # serve the build
```

Before declaring done, run `check`, `lint`, `test`, `build` in that order; all exit 0.

## Conventions

- Svelte 5 runes only (`$state`, `$derived`, `$props`, `$effect`). No stores, no `export let`.
- Import through the `#lib` alias with `.js` extensions, e.g. `#lib/foo.js`. `$lib` stays unused.
- UI strings live only in `app/messages/id.json`; components call the Paraglide message functions. No string literals in markup. UI language is Indonesian.
- Read game data only through the data index. No direct imports of raw data files from components.
- Prerender every route. No server endpoints, no runtime fetch of data.
- Code, comments, docs, commit messages: English.

## Git flow

- Work on a branch: `feat/<topic>` for features, `fix/<topic>` for bugfixes. Open a PR.
- `main` receives changes through PRs only.
- Commit short imperative messages.
- Stage tracked, intended files only; ignored files (`node_modules/`, `.svelte-kit/`, `build/`, `.env*`, `.claude/skills/`, `initial-brief.md`) stay out.

## Boundaries

- Install packages only when the plan lists them.
- Leave `initial-brief.md`, `skills-lock.json`, `.claude/skills/`, and `docs/research/` untouched.
- Skip installers that write agent directories (`npx skills` and similar).
- Keep personal data and local absolute paths out of tracked files.
