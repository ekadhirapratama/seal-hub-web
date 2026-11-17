# Skills Install — Claude Code (project scope)

Date: 2026-11-16
Scope: project-level `.claude/skills/` in `seal-hub-web` (not `~/.claude`). Global config untouched. `.claude/settings.json` untouched.

## Sources

- https://github.com/mattpocock/skills (README documents the `npx skills add <repo>` CLI; installer is [skills.sh](https://skills.sh) / vercel-labs `skills` CLI)
- https://github.com/nextlevelbuilder/ui-ux-pro-max-skill (README documents the same `npx skills add nextlevelbuilder/ui-ux-pro-max-skill` method)

## Commands run

```sh
npx skills add mattpocock/skills --all -y --copy
npx skills add nextlevelbuilder/ui-ux-pro-max-skill --all -y --copy
```

- `--all` = `--skill '*' --agent '*' -y`: all skills, non-interactive.
- `--copy`: write real files (no symlinks) so `.claude/skills/<name>/` is self-contained.
- Project scope confirmed by output paths (`~/Projects/Personal/seal-hub-web/.claude/skills/...`); the `-g/--global` flag was not used.
- The CLI also copies skills into ~79 other agent dirs it detects (`.cursor/`, `.windsurf/`, `.agents/skills/`, `skills/`, ...). This is documented CLI behavior; it did not touch anything outside `.claude/skills/` manually.
- No install script reviewed required review for sudo/global config: the `skills` CLI writes only into the project (plus optional global `~/.claude` when `-g`, which we avoided). [INFERENCE on internals; outputs verified above]

## Result

45 skills installed, each at `.claude/skills/<name>/SKILL.md` (verified: 45 SKILL.md files).

### From mattpocock/skills (commit 5863806)

| Skill | Purpose |
|---|---|
| ask-matt | Router: asks which skill/flow fits the situation. |
| chief-of-staff | Pursue long-running goal in one session, coordinating subagents. |
| claude-handoff | Hand conversation to a fresh background agent. |
| code-review | Review changes since a fixed point against repo standards. |
| codebase-design | Vocabulary for designing deep modules (interfaces, boundaries). |
| diagnosing-bugs | Diagnosis loop for hard bugs and perf regressions. |
| domain-modeling | Build/sharpen domain model, GLOSSARY.md, ADRs. |
| git-guardrails-claude-code | Claude Code hooks blocking dangerous git commands. |
| grill-me / grilling / grill-with-docs | Relentless interview to sharpen a plan/design (with-docs also writes ADRs/glossary). |
| handoff | Compact conversation into a handoff doc for another agent. |
| implement | Implement work from a spec or tickets. |
| implement-spec | Implement the output of /to-spec and /to-tickets. |
| improve-codebase-architecture | Scan for deepening opportunities, report, grill through pick. |
| loop-me | Grill specs for workflows to build in this workspace. |
| migrate-to-shoehorn | Migrate test `as` assertions to shoehorn. |
| pr | Write PR body. |
| prototype | Throwaway prototype to answer a design question. |
| research | Investigate a question against primary sources, capture as Markdown. |
| retro | Retrospective on a coding session. |
| scaffold-exercises | Scaffold exercise dirs (problems/solutions/explainers). |
| setup-matt-pocock-skills | One-time repo config for the engineering skills. |
| setup-pre-commit | Husky + lint-staged + typecheck + tests pre-commit setup. |
| setup-ts-deep-modules | Wire dependency-cruiser for deep TS modules. |
| tdd | Test-driven development loop (red-green-refactor). |
| teach | Teach a skill or concept. |
| to-questionnaire | Turn an unanswerable decision into a questionnaire. |
| to-spec | Synthesize conversation into a spec. |
| to-tickets | Break a plan into tracer-bullet tickets with blocking edges. |
| triage | Move issues/PRs through triage state machine, write agent-ready briefs. |
| wait-what | Stop and re-pitch a message that did not land. |
| wayfinder | Plan huge work as a map of decision tickets on an issue tracker. |
| wizard | Generate interactive bash wizard for human-only steps. |
| writing-beats / writing-fragments / writing-shape | Writing workflow: mine fragments, shape into article, assemble beats. |
| writing-for-agents | Writing docs for agents (skills, AGENTS.md, CLAUDE.md). |

### From nextlevelbuilder/ui-ux-pro-max-skill (commit e59ff37)

| Skill | Purpose |
|---|---|
| banner-design | Banners for social/ads/heroes, multiple art directions. |
| brand | Brand voice, visual identity, messaging frameworks. |
| design | Full design skill: identity, tokens, UI styling, logo generation. |
| design-system | Three-layer token architecture, component specs, slides. |
| slides | Strategic HTML presentations with Chart.js. |
| ui-styling | Accessible UI with shadcn/ui + Tailwind utilities. |
| ui-ux-pro-max | UI/UX design intelligence for pages, components, flows. |

## Relevant to this project (SvelteKit client-only game companion)

**Planning / workflow:** `to-spec`, `to-tickets`, `implement`, `implement-spec`, `tdd`, `prototype`, `grill-with-docs`, `wayfinder`, `domain-modeling`, `research`.

**UI/UX design:** `ui-ux-pro-max`, `design`, `design-system`, `ui-styling` (note: shadcn/ui + Tailwind oriented; project is SvelteKit — adapt patterns, do not import React components), `brand`, `banner-design`.

**Maintenance:** `code-review`, `diagnosing-bugs`, `retro`, `handoff`, `pr`.

Less relevant here: `setup-ts-deep-modules`, `migrate-to-shoehorn`, `scaffold-exercises`, `slides`, `wizard`, `teach`, writing-* series (unless writing game guides), `chief-of-staff`, `claude-handoff`, `loop-me`, `to-questionnaire`, `wait-what`, `setup-pre-commit`, `git-guardrails-claude-code` (project has no repo yet), `ask-matt`, `setup-matt-pocock-skills`.

## Failures / notes

- One upstream skill skipped by the installer: `skills/in-progress/software-factory` (mattpocock/skills) — YAML frontmatter parse error in its SKILL.md, so it is not installed. Not a local failure.
- Security assessments printed by the CLI: all mattpocock skills Safe/Low (one `code-review` Snyk Med), ui-ux skills Safe/Low except `banner-design` Snyk Med and `slides` Gen Med. Socket: 0 alerts across the board. Details: https://skills.sh/nextlevelbuilder/ui-ux-pro-max-skill
- Installer created `skills-lock.json` at repo root (its own lockfile, supports `npx skills experimental_install` to restore). Kept — deleting it breaks reproducibility.
