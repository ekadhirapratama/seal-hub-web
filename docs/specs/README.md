# Seal Hub Web — Specs Index

Status: specification, last updated 2026-11-17. No code scaffolded, no git repo yet. The implementation plan is a separate document, not written yet.

| Doc | Owns |
|---|---|
| [architecture.md](architecture.md) | Stack, directory structure, routes, JSON data shapes, localStorage schema, setup milestones |
| [features.md](features.md) | Per-feature specs (stories, wireframes, acceptance checklists), cross-feature flows, design direction, build order |
| [../research/](../research/) | Inputs: styling reference, companion reference, data source draft, skills install log |

Precedence when the two specs disagree: `architecture.md` wins on data shapes, field names, storage and routes; `features.md` wins on UX behaviour and acceptance criteria.

Current phase: architecture and project setup. Game data is the next phase, so every data shape is provisional (`architecture.md` §4.0).

## Owner decisions

| Date | Decision | Where applied |
|---|---|---|
| 2026-11-17 | Language: Indonesian only in v1, on local i18n (Paraglide, message files in repo) so more languages can be added later | architecture §1, M0; features §2.3 |
| 2026-11-17 | Navigation: paimon.moe responsive pattern, fixed sidebar on desktop and drawer on mobile | features §2.2; architecture §6, M1 |
| 2026-11-17 | Export/import: not in v1 | architecture §5.5 (M6 removed); features Q-9 |
| 2026-11-17 | Keep things easy to change; data shapes are placeholders until the data phase | architecture §4.0 |

## Resolved differences between the two specs

| # | Topic | Resolution |
|---|---|---|
| 1 | Export/import | Not in v1 (owner). |
| 2 | Calculator ↔ character form hand-off | Query params as in features §4, read in the browser after hydration only (architecture §3). |
| 3 | Mobile navigation | Sidebar/drawer (owner); the bottom tab bar proposal is dropped. |

## Still open

| # | Topic | Needed by |
|---|---|---|
| 1 | Pets shape: architecture uses `nodes` + `edges`, features describes parent-linked forms. Same model, different field names; architecture's names win, features §3.5 pseudocode not yet rewritten | Data phase |
| 2 | Max level: placeholder constant now; real cap comes with the data | Data phase |
| 3 | Authoritative fame data source, game server/version (features Q-4, architecture Q9) | Data phase |
| 4 | Hosting target (architecture Q2) | Deploy milestone |

Other open questions have a default the specs already assume; see each doc's "Open questions for owner".
