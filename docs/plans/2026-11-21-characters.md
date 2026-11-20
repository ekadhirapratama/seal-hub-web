# Plan — Character Management /characters (2026-11-21)

Source: GitHub issue #13; specs `docs/specs/features.md` §3.2, `docs/specs/architecture.md` §4.3 (`jobs`), §5
Role: dev
Size: light
Status: active

## Tracker

| ID | Task | Status | Depends | Notes |
|----|------|--------|---------|-------|
| T1 | `jobs` data slice: schema, sample JSON (tier 1: Beginner, Warrior, Knight, Mage; tier 2: Swordmaster, Fire Wizzard, Vagabond), data-index export, shape test | `[x]` | - | Only `jobs`; owner completes the list later; names/tiers unverified, spelling as given |
| T2 | User-data layer per arch §5: `Character` schema (`MAX_LEVEL` 251), storage module (read-only mode, versioning, corrupt data, `storage` event), add/update/delete + unit tests | `[x]` | - | Update on a missing id must not write; stale `activeCharacterId` ignored |
| T3 | Safe `return` target check + tests | `[x]` | - | Single leading `/` only |
| T4 | `/characters` list, empty state, banners (read-only, jobs unavailable), Unknown job | `[x]` | T1, T2 | All strings in `messages/id.json` |
| T5 | Add/edit `<dialog>` form: field validation, `?form=` URL sync, `return` redirect, stale-edit error | `[x]` | T3, T4 | Query read only after hydration; focus trap/restore is the main risk |
| T6 | Delete confirm dialog | `[x]` | T4 | |
| T7 | Verify: acceptance below, 375px check, keyboard pass | `[ ]` | T5, T6 | |

## Acceptance

- [ ] Every acceptance item of issue #13 holds, except "current fame title on card" (dropped).
- [ ] 20+ characters usable, data survives reload, no horizontal scroll at 375px, touch targets >= 44px.
- [ ] Unit tests: `Character` schema bounds, `return` check, add/update/delete/delete-active/update-missing.
- [ ] `npm run check`, `lint`, `test`, `build` exit 0 from `app/`.

## Out of scope

- Fame title on card, `fame-titles` data (#14), Fame Calculator wiring (#15), full jobs list, quick-update dialog, data-loss notice, export/import, avatars, reordering, cross-field validation, character limit.
- Spec follow-ups from issue #13 (docs edits to `architecture.md` / `features.md`): separate docs PR, plus drop the title line from §3.2.

## Decisions

- `jobs` slice built here: jobs are unrelated to fame data; sample values until the full list is sourced.
- `jobs` is only the character-form dropdown for now; `tier`/`parentId` stay in the schema because the later item bank will use job relations (e.g. weapons per Warrior line). Beginner is a tier-1 sibling of Warrior/Knight/Mage (no tier-0 root; differs from arch §4.3 sample), 2nd jobs: Swordmaster (Warrior), Fire Wizzard (Mage), Vagabond (Beginner). Spelling "Warrior" / "Fire Wizzard" (owner, 2026-11-21). Claude writes the JSON, owner extends it.
- Fame is a free integer input; card shows no title (owner, 2026-11-21). Issue #13 should be edited to match.
- One PR per task group on `feat/characters`-style branches; branch naming per CONTRIBUTING.
