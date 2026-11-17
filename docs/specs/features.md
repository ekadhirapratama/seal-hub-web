# Seal Hub Web — Feature Plan & Design Direction

Status: draft for owner review · Date: 2026-11-16
Inputs: `initial-brief.md` (binding), `docs/research/styling-reference.md` and `companion-reference.md` (reliable), `docs/research/data-source.md` (draft only; schemas not reused).
Sibling doc: `docs/specs/architecture.md` owns stack, directory structure, JSON shapes, localStorage schema, setup milestones. Where this doc names a field, it states what the feature **needs**; the exact field name and shape are whatever `architecture.md` defines. Mismatches are listed in [§7.3](#73-requirements-handed-to-architecturemd).

Every recommended default that the owner has not confirmed is tagged **(Q-n)** and listed in [§7](#7-open-questions-for-owner).

---

## 1. Product summary

**Seal Hub** is a client-only static web app that helps Seal Online players plan fame progression, read quest guidance, and look up pet evolution paths. Game data ships as static JSON; the player's characters live in the browser's localStorage. No account, no server.

### Target user

| | |
|---|---|
| Who | Seal Online player, usually running several characters, playing on desktop with a phone next to the keyboard |
| Primary job | "How much fame do I still need for the next title, and which quest items should I farm for it?" |
| Secondary jobs | Read how a quest is completed; see what a pet evolves into and what it costs |
| Device | Phone first (second screen while playing), desktop second |
| Language | Indonesian player base (data source is the Indonesian wiki). UI language: Indonesian in v1, multi-language later (§2.3) |

### Non-goals (from Scope Limitation, binding)

| Non-goal | Consequence for this plan |
|---|---|
| No backend, no API requests | All game data is static JSON bundled with the site |
| No login | No accounts, no cloud sync, no sharing between devices |
| User data in localStorage only | Clearing browser data loses characters; say so in the UI once |
| Real data collection is a later milestone | Every feature is specified against **sample data**; a "sample data" banner is shown until real data lands |
| Remote repo is a later milestone | Nothing here depends on CI, hosting, or a deploy pipeline |
| Session focus is project setup + design idea | This doc is a plan; no code is scaffolded from it yet |

### Deliberately not planned (YAGNI)

Dark mode (the reference has none), a second language or language switcher, export/import of user data, progress checklists for quests, "add to todo" lists, drop-rate or time-to-farm estimates, death-penalty simulation, game artwork, multi-server data variants, PWA install/update modal. Each can be added later without reshaping the five features. Those most likely to be wanted are raised in §7.

---

## 2. Navigation & information architecture

### 2.1 Site map

| # | Destination | Proposed route | Content |
|---|---|---|---|
| 1 | Home | `/` | Welcome, feature shortcuts, updates list |
| 2 | Characters | `/characters` | Character list, add / edit / delete |
| 3 | Fame | `/fame` | Fame calculator for one selected character |
| 4 | Quests | `/quests` → `/quests/<questId>` | Sources → quest list → item table or walkthrough |
| 5 | Pets | `/pets` → `/pets/<category>` | Category picker → evolution tree + materials |

Five top-level peers, depth of at most two. Route shapes are proposals; `architecture.md` has the final say (see the static-prerender note in §7.3).

### 2.2 Navigation pattern: sidebar on desktop, drawer on mobile (paimon.moe pattern)

**Decided by owner 2026-11-17 (was Q-2):** follow how paimon.moe handles responsive layout. Source: `docs/research/companion-reference.md` §1 (`src/components/Sidebar/Sidebar.svelte`, `src/components/Header.svelte` in the paimon-moe repo): fixed left sidebar on desktop with the content offset by its width, and on mobile a sticky header whose menu button opens the same nav as an off-canvas drawer with a close button.

```
< 1024px                                  >= 1024px
+--------------------------------+        +------------+---------------------------------------+
| [=]   Seal Hub                 |        | Seal Hub   |                                       |
+--------------------------------+        |            |                                       |
|                                |        | Home       |   page content                        |
|           page content         |        | Characters |   (720px, 960px for tables)           |
|                                |        | Fame       |                                       |
+--------------------------------+        | Quests     |                                       |
                                          | Pets       |                                       |
[=] tapped:                               +------------+---------------------------------------+
+------------------+-------------+
| Seal Hub     [x] |  (dimmed    |
| Home             |   page)     |
| Characters       |             |
| Fame             |             |
| Quests           |             |
| Pets             |             |
+------------------+-------------+
```

Rules:

- One nav list, two presentations. Sidebar: fixed, 16rem wide, always visible at ≥ 1024px (paimon.moe's `lg` breakpoint). Drawer: same list, off-canvas from the left below 1024px.
- Mobile header: sticky, 56px, menu button in the left 44px slot, app name or page title centered. Styled with the reference topbar rules (ink border, cream background). No header at ≥ 1024px unless a page needs one.
- Drawer behaviour: opens from the menu button, closes on close button, backdrop tap, Escape, and on navigation. Focus moves into the drawer on open and returns to the menu button on close; page behind is inert while open. Built on native `<dialog>` so focus trap and Escape come for free.
- Active item: ink fill plus `aria-current="page"`. Nav is a `<nav>` landmark with a label. Every item is icon + text label, min 44px tall.
- Depth-2 pages (`/quests/<id>`, `/pets/<category>`): the `[<]` shown in the wireframes of §3 is a back link at the top of the page content, not a header button (the header's left slot is the menu button on mobile).
- The reference's fixed-bottom action bar (`.aksi-fixed`) stays available for primary form actions on mobile, since nothing else occupies the bottom edge.
- The browser back button must always work: filter changes the user would expect to undo are real navigations, not in-memory state. Opening the drawer is not a navigation.
- Nav labels come from the message file (§2.3), never hard-coded.

### 2.3 Language

**Decided by owner 2026-11-17 (was Q-1):** multi-language is planned; v1 ships Indonesian only, on local i18n (message files in the repo, no translation service; library in `architecture.md` §1).

- Every UI string (labels, buttons, empty states, errors, nav) comes from the message file. No literal UI text in components.
- Game terms (item, title, job, pet names) stay as shown in the game client and are data, not messages.
- No language switcher in v1. `<html lang="id">`.
- Numbers and dates are formatted with `Intl` using the active locale.

---

## 3. Feature specs

Shared conventions for all five features:

- **Sample-data banner**: while the data milestone is pending, every page that renders game data shows one `.banner` line: "Sample data. Numbers are placeholders, not real game values."
- **Storage failure**: if localStorage is unavailable or unreadable, pages that need characters show the reference's read-only banner. The mechanism belongs to `architecture.md`; features only need a "can read / can write" signal.
- Numbers are formatted with `Intl.NumberFormat` (grouping separators) and rendered with tabular figures.

### 3.1 Landing Page

**User stories**

- As a new visitor, I want to understand in one screen what this app does, so I can decide where to start.
- As a returning player, I want to see what changed since my last visit, so I know whether data or features were updated.
- As a player with no character yet, I want an obvious way to add one, because the calculator needs it.

**Screen**

```
+--------------------------------+
|            Seal Hub            |
+--------------------------------+
| Welcome, adventurer            |
| Plan fame, quests and pets     |
| for Seal Online.               |
|                                |
| [ Add your first character ]   |   <- only when 0 characters
| You have 3 characters  Manage >|   <- when >= 1
|                                |
| +------------+ +-------------+ |
| | Fame       | | Quests      | |
| | Calculator | | Guidance    | |
| +------------+ +-------------+ |
| +------------+ +-------------+ |
| | Pet        | | Characters  | |
| | Evolution  | |             | |
| +------------+ +-------------+ |
|                                |
| Updates                        |
| v0.2.0 · 2026-12-01     [data] |
|  - Added quest items 1-30      |
| v0.1.0 · 2026-11-20  [feature] |
|  - First release               |
| ( Show older updates )         |
+--------------------------------+
```

Flow: static page. Feature cards are links (`a.card`). Updates are listed newest first; the first 5 entries are visible and the rest sit in a native `<details>`.

**States**

| State | Behaviour |
|---|---|
| No character | Primary button "Add your first character" → `/characters` add form |
| ≥ 1 character | Text line with count + "Manage" link; no primary button |
| `changelog` empty | `.empty` box: "No updates yet." |
| Storage unavailable | Character line replaced by the read-only banner; cards still work |

**Data entities consumed**: `changelog` (version, date, list of change lines, optional kind tag such as data / feature / fix); `Character` (count only).

**Acceptance criteria**

- [ ] Welcome heading and one-sentence description are visible without scrolling at 375×667.
- [ ] Four feature cards link to Fame, Quests, Pets, Characters.
- [ ] With 0 characters the "Add your first character" button is shown and opens the add form; with ≥ 1 it is replaced by the count line.
- [ ] Updates render from `changelog`, newest first, each with version and date.
- [ ] More than 5 entries: older ones are collapsed and can be expanded with keyboard only.
- [ ] Empty `changelog` shows the empty state, not a blank section.

**Out of scope**: PWA update modal, "new since your last visit" highlighting, visitor counter, news feed.

---

### 3.2 Character Management

**User stories**

- As a player, I want to add several characters with name, job, level and fame, so each can be used in the calculator.
- As a player, I want to update a character's level and fame quickly, because they change every play session.
- As a player, I want to delete a character I no longer play, with a confirmation so I do not lose it by accident.

**Screen**

```
+--------------------------------+      Form (native <dialog>)
|           Characters           |      +----------------------------+
+--------------------------------+      | Add character              |
| 3 characters      [ + Add ]    |      |                            |
|                                |      | Name                       |
| +----------------------------+ |      | [ Kirana                 ] |
| | Kirana          [Knight]   | |      | Job                        |
| | Lv 87 · Fame 12,450        | |      | [ Knight               v ] |
| | Title: Brute               | |      | Level                      |
| | [Calculate] [Edit] [Delete]| |      | [ 87 ]                     |
| +----------------------------+ |      | Fame                       |
| +----------------------------+ |      | [ 12450 ]                  |
| | Bolang          [Jester]   | |      |                            |
| | Lv 15 · Fame 320           | |      | [ Cancel ]   [ Save ]      |
| | ...                        | |      +----------------------------+
+--------------------------------+
```

Flow:

1. List shows one card per character, ordered by creation (oldest first, stable).
2. "+ Add" or "Edit" opens the form dialog. The form state is reflected in the URL (`/characters?form=new`, `/characters?form=<id>`) so other pages can deep-link to it and the back button closes it.
3. Save validates, writes, closes the dialog, and either stays on the list or follows the return target (§4.1).
4. "Delete" opens a confirm dialog naming the character; confirm removes it.
5. "Calculate" goes to `/fame?character=<id>`.

**Validation rules**

| Field | Rule | Error shown |
|---|---|---|
| `name` | Trimmed, 1–24 characters. Duplicates allowed (players reuse names across servers). | "Name is required" / "Max 24 characters" |
| `job` | Must be an id present in `jobs` | "Choose a job" |
| `level` | Integer, 1 ≤ level ≤ max level. Max level comes from data, not hard-coded **(Q-5)** | "Level must be between 1 and N" |
| `fame` | Integer ≥ 0. Thousand separators typed by the user are stripped before parsing | "Fame must be 0 or more" |

Errors render under the field (`.hint.error`), on submit and then on change. Number fields use `inputmode="numeric"`.

**States**

| State | Behaviour |
|---|---|
| No characters | `.empty` box: "No characters yet." + primary "Add character" |
| `jobs` empty or failed | Form cannot be saved; banner "Job list unavailable" (should never happen with bundled data) |
| Character's `job` id no longer in `jobs` | Card shows "Unknown job"; edit form forces a re-pick |
| Storage read-only | List renders; Add / Edit / Delete are disabled with the read-only banner |
| Write fails | Dialog stays open with an alert; nothing is lost silently |

**Data entities consumed**: `jobs` (id, display name; tier or base job for grouping the select); `fame-titles` (to show the current title on the card); `Character {id,name,job,level,fame}` read and write.

**Acceptance criteria**

- [ ] A character can be added with name, job, level, fame and survives a page reload.
- [ ] At least 20 characters can be added; the list stays usable.
- [ ] Each invalid field shows its own message and blocks saving; valid input in other fields is kept.
- [ ] Editing changes only the edited character; `id` never changes.
- [ ] Delete requires confirmation that names the character; cancel leaves data untouched.
- [ ] Each card shows name, job name, level, fame (grouped digits) and current fame title.
- [ ] `/characters?form=new` opens the add form directly; browser back closes it.
- [ ] The dialog traps focus, closes on Escape, and returns focus to the button that opened it.
- [ ] Empty state appears when the last character is deleted.

**Out of scope**: avatars, server/realm field, stats or equipment, reordering, export/import (not in v1, owner decision), a global "active character" switcher in the topbar.

---

### 3.3 Fame Calculator

**User stories**

- As a player, I want to pick one of my characters and see every fame title with its required fame, so I know where I stand.
- As a player, I want to see how much fame is left to the next title, or to a title I choose, so I can set a goal.
- As a player, I want a short list of quest items my character can turn in right now, with how many I need to collect, so I know what to farm.
- As a player without a character, I want to be sent to add one and brought straight back.

**Screen**

```
+--------------------------------+
|        Fame Calculator         |
+--------------------------------+
| Character                      |
| [ Kirana · Lv 87 · Knight   v ]|
|   + Add character     Edit     |
|                                |
| +----------------------------+ |
| | Brute  ->  Fodder          | |
| | [#########.......] 62%     | |
| | 12,450 / 20,000            | |
| | 7,550 fame to go           | |
| +----------------------------+ |
| Target title [ Fodder (next) v]|
|                                |
| Recommended quest items        |
| +----------------------------+ |
| | Sharp Tooth        +170/20 | |
| | 45 turn-ins · 900 items    | |
| | Lv 45-64 · Tarantula Ben   | |
| +----------------------------+ |
| | Devil's Nail       +350/30 | |
| | 22 turn-ins · 660 items    | |
| +----------------------------+ |
| ( Show all 12 eligible )       |
|                                |
| Fame titles                    |
|  ok  Beggar                 0  |
|  ok  Drifter               50  |
|  >>  Brute  (current)     581  |
|  ->  Fodder (target)   20,000  |
|      King             182,178  |
+--------------------------------+
```

(Numbers in the wireframe are illustrative, not game values.)

Flow:

1. Page reads `?character=<id>`. If present and valid, that character is selected. Otherwise the last-used character is selected, otherwise the first one.
2. Changing the select updates the URL (`replaceState`, so the back button is not flooded) and recomputes everything.
3. Target defaults to the next title; the user may choose any higher title.
4. Recommendation cards show the top 5; "Show all" expands the rest. Each card links to that item in Quest Guidance.
5. "+ Add character" and "Edit" go to the character form with a return target (§4.1, §4.2).

**Calculation rules**

Inputs: `c` = selected `Character`; `titles` = `fame-titles` sorted ascending by required fame; `items` = `quest-items`.

Fame remaining:

```
currentTitle = last  t in titles where t.fame <= c.fame
nextTitle    = first t in titles where t.fame >  c.fame        // null at max title
target       = user-chosen title with target.fame > c.fame, default nextTitle

remaining    = target == null ? 0 : target.fame - c.fame        // always > 0 when target exists

tierProgress = nextTitle == null
             ? 1
             : (c.fame - currentTitle.fame) / (nextTitle.fame - currentTitle.fame)   // 0..1, progress bar
```

Guards: `titles` must contain an entry with fame 0, so `currentTitle` always exists. If `c.fame` is at or above the last title, `nextTitle` and `target` are null and the page shows "Highest title reached" with no recommendations.

Item eligibility (can this character turn the item in right now):

```
eligible(item, c) =
      c.level >= item.minLevel
  AND (item.maxLevel == null OR c.level <= item.maxLevel)
  AND (item.maxFame  == null OR c.fame  <  item.maxFame)
```

The wiki expresses the upper limit either as a level ("Below Lv. 64") or as a fame cap ("Below Fame 182178"), so both must be supported. Whether "Below Lv. 64" includes 64 is unverified: **(Q-4)**. The formula above assumes the stored `maxLevel` is already the last allowed level; the data milestone normalises it.

Per-item plan (one turn-in = hand over `item.qty` pieces, receive `item.fame`):

```
turnInsToTarget = ceil(remaining / item.fame)

turnInsAllowed  = item.maxFame == null
                ? infinity
                : ceil((item.maxFame - c.fame) / item.fame)     // turn-ins until the fame cap closes the quest

turnIns         = min(turnInsToTarget, turnInsAllowed)
itemsToCollect  = turnIns * item.qty
fameGained      = turnIns * item.fame
reachesTarget   = turnInsAllowed >= turnInsToTarget
```

When `reachesTarget` is false the card says "Covers N fame, then closes at fame X" instead of promising the full target.

Recommendation ranking:

```
candidates = items.filter(i => eligible(i, c) AND i.fame > 0)

sort candidates by
  1. reachesTarget            true first
  2. i.fame / i.qty           descending   // fame per piece collected = least farming
  3. i.fame                   descending   // fewer trips to the NPC
  4. i.name                   ascending    // stable order

recommended = first 5 of candidates
```

The ranking metric is fame per collected piece because drop rates are not in the data; it is a proxy for effort, not a time estimate, and the UI labels it as such. **(Q-3)**

Worked example (illustrative numbers): fame 12,450, target 20,000 → `remaining = 7,550`. Item "Sharp Tooth" gives 170 fame per 20 pieces → `turnInsToTarget = ceil(7550 / 170) = 45`, `itemsToCollect = 45 × 20 = 900`, `fameGained = 7,650`.

**States**

| State | Behaviour |
|---|---|
| No character | Whole page is one `.empty` box: "Add a character to calculate fame." + primary button → add form with return to `/fame` |
| `?character=` id not found | Fall back to default selection and show a dismissible alert "Character not found" |
| `fame-titles` empty | `.empty`: "Fame title data is not available yet." Nothing else is rendered |
| `quest-items` empty | Title list and remaining fame still work; recommendations show `.empty`: "Quest item data is not available yet." |
| No eligible item | `.empty`: "No quest item matches level L and fame F." + link to Quest Guidance |
| Max title reached | Progress card: "Highest title reached"; target select and recommendations hidden |
| Storage read-only | Calculator works (read only); Add and Edit are disabled |

**Data entities consumed**

| Entity | Needs |
|---|---|
| `Character` | `level`, `fame`, `name`, `job` (display) |
| `fame-titles` | title name, required fame (cumulative), order |
| `quest-items` | name, qty per turn-in, fame per turn-in, min level, max level (nullable), max fame (nullable), dropped-by list, owning quest/source for the deep link |
| `jobs` | display name in the character select |

**Acceptance criteria**

- [ ] With 0 characters the empty state is shown and its button leads to the add form; after saving, the user lands on `/fame` with the new character selected.
- [ ] The select lists every character as name · level · job; changing it recomputes all figures without a reload.
- [ ] `/fame?character=<id>` preselects that character.
- [ ] All `fame-titles` are listed with required fame, in ascending order, with current and target visibly marked (not by colour alone).
- [ ] "Fame to go" equals `target.fame − character.fame`, verified by unit tests for: fame 0, fame exactly on a threshold, fame between thresholds, fame above the last title.
- [ ] Target can be changed to any higher title and "fame to go" follows.
- [ ] Recommendations contain only items that pass `eligible()`; unit tests cover min level, max level, fame cap and null limits.
- [ ] Each recommendation shows fame per turn-in, pieces per turn-in, number of turn-ins, total pieces to collect, level range and drop sources.
- [ ] An item whose fame cap closes before the target is labelled as partial and sorted after full-coverage items.
- [ ] Order matches the ranking rule; identical input always yields identical order.
- [ ] Each recommendation links to the matching entry in Quest Guidance.
- [ ] Every state in the table above renders its message; no blank or broken page.
- [ ] The calculator never writes to `Character`.

**Out of scope**: drop rates and time estimates, combining several items into one optimal plan, fame from walkthrough quests, death-penalty deduction, fame history or charts, saving a target per character, pushing recommendations to a todo list **(Q-8)**.

---

### 3.4 Quest Guidance

**User stories**

- As a player, I want to browse quests by source (quest center, high central quest, highest, main quest, …), so I can find the ones relevant to me.
- As a player, I want item-turn-in quests shown as a table with quantity, fame and level limits, so I can compare them.
- As a player, I want story quests shown as an ordered walkthrough with NPCs and locations, so I can follow along while playing.
- As a player, I want to narrow the item table to what my character can do now.

**Screens**

```
/quests                                  /quests/<id>  (format: items)
+--------------------------------+       +--------------------------------+
|        Quest Guidance          |       | [<]   Quest Center 45-97       |
+--------------------------------+       +--------------------------------+
| (All)(Quest Center)(High Cen-> |       | How it works: bring the items  |
|                                |       | to the Quest Center NPC ...    |
| +----------------------------+ |       |                                |
| | Quest Center 1-30   [items]| |       | [ Search item...            ]  |
| | Lv 1-30 · 30 items         | |       | For [ Kirana Lv 87  v ] [x] on |
| +----------------------------+ |       |                                |
| | Quest Center 45-97  [items]| |       | +----------------------------+ |
| | Lv 45-97 · 42 items        | |       | | Sharp Tooth        +170    | |
| +----------------------------+ |       | | x20 · Lv 45-64             | |
| | 4 Heroes Quest     [story] | |       | | Tarantula Ben, Flying Pig  | |
| | Lv 15+ · 9 steps           | |       | +----------------------------+ |
| +----------------------------+ |       | | Geranium            +20    | |
+--------------------------------+       +--------------------------------+

/quests/<id>  (format: walkthrough)      >= 640px: the item cards become a table
+--------------------------------+       +----------------------------------------------+
| [<]     4 Heroes Quest         |       | Item        | Qty | Fame | Level | Dropped by |
+--------------------------------+       |-------------+-----+------+-------+------------|
| Main Quest · Lv 15+            |       | Sharp Tooth |  20 |  170 | 45-64 | Tarantula..|
| Start: D.End, Elim tower       |       | Geranium    |  30 |   20 |  1-8  | Piya, Bea..|
| Rewards: 500 fame, 1,200 exp   |       +----------------------------------------------+
|                                |
| 1. Talk to D.End               |
|    @ Elim Training Tower       |
| 2. Take the warp behind D.End  |
| 3. Talk to Joan, pick every    |
|    dialogue option             |
+--------------------------------+
```

Flow:

1. `/quests` lists quests. A segmented filter (reference `.filter` pills, horizontally scrollable) selects the source; "All" is the default. The selected source is kept in the URL (`?source=`).
2. Each quest card carries a format tag: `items` or `story`.
3. Opening a quest renders one of two templates chosen by its format:
   - **Items**: intro text, then the quest-item list. Controls: name search (substring, case-insensitive) and a "for character" toggle that applies the same `eligible()` rule as §3.3. Default sort is min level ascending, then name.
   - **Walkthrough**: header block (source, level requirement, start NPC, location, rewards) followed by an ordered list of steps; each step has text and optional NPC / location / note.
4. A deep link from the Fame Calculator opens the items page with the item scrolled into view and highlighted (`#<itemId>`).

Sources are **data, not code**: the filter is built from the distinct sources in `quests`, so adding "highest" or another source later needs no UI change. **(Q-6)**

**States**

| State | Behaviour |
|---|---|
| `quests` empty | `.empty`: "Quest data is not available yet." |
| Source has no quests | `.empty`: "No quests in this source yet." Filter stays usable |
| Unknown quest id | "Quest not found" + link back to `/quests` |
| Items quest with no items | Intro shown; `.empty`: "Item list is not available yet." |
| Search / toggle matches nothing | "No items match." + "Clear filters" button |
| No character | "For character" toggle hidden; replaced by link "Add a character to filter by level" |
| Walkthrough without rewards | Rewards row omitted, not shown as zeros |

**Data entities consumed**

| Entity | Needs |
|---|---|
| `quests` | id, title, source, format (`items` \| `walkthrough`), level requirement, intro text; for walkthroughs: start NPC, location, rewards (all optional), ordered steps (text, optional NPC, location, note) |
| `quest-items` | same fields as §3.3, plus the link to its owning quest |
| `Character` | `level`, `fame` for the optional filter |

**Acceptance criteria**

- [ ] Quest list renders from `quests`; source pills are derived from data and include "All".
- [ ] Selecting a source filters the list, updates the URL, and survives reload and back/forward.
- [ ] Every quest card shows title, source, format tag and level requirement.
- [ ] An `items` quest renders name, qty, fame, level range and dropped-by for each item: stacked cards below 640px, a real `<table>` with header cells at 640px and up.
- [ ] Name search filters as the user types; the result count is announced (`role="status"`).
- [ ] With a character chosen and the toggle on, only items passing `eligible()` remain (same function as the calculator, not a copy).
- [ ] A `walkthrough` quest renders its steps as a numbered `<ol>` in data order, with NPC and location visible where present.
- [ ] Opening `/quests/<id>#<itemId>` scrolls to and highlights that item.
- [ ] Sample data contains at least one quest of each format so both templates are exercised.
- [ ] No horizontal page scroll at 375px in any state.

**Out of scope**: per-step or per-item checkboxes and progress tracking **(Q-8)**, maps and screenshots, monster database pages, global search across the app, user notes, sorting by arbitrary column.

---

### 3.5 Pet Evolution

**User stories**

- As a player, I want to pick a pet category (seed, piya, bird, heaven, mandragora, kitsune, blackdragon), so I only see that family.
- As a player, I want to see the whole evolution tree including branches, so I know every possible outcome before I commit materials.
- As a player, I want to select a target form and see the materials for that step and for the whole path from the egg, so I know what to collect.

**Screens**

```
/pets                               /pets/piya
+--------------------------------+  +--------------------------------+
|         Pet Evolution          |  | [<]         Piya               |
+--------------------------------+  +--------------------------------+
| Choose a category              |  | Piya Egg                 S1    |
| +----------+ +----------+      |  |  |                             |
| |  Seed    | |  Piya    |      |  |  +- Baby Piya            S2    |
| | 12 forms | | 9 forms  |      |  |      |                         |
| +----------+ +----------+      |  |      +- Piya             S3    |
| +----------+ +----------+      |  |      |   |                     |
| |  Bird    | |  Heaven  |      |  |      |   +- [King Piya]  S4  * |  <- selected
| +----------+ +----------+      |  |      |                         |
| +----------+ +----------+      |  |      +- Rare Piya   S3  [rare] |
| |Mandragora| | Kitsune  |      |  |                                |
| +----------+ +----------+      |  | Materials for King Piya        |
| +----------+                   |  | This step (Piya -> King Piya)  |
| |BlackDragon|                  |  |  Chicken Feather         x10   |
| +----------+                   |  |  Vegetable Oil            x5   |
+--------------------------------+  | Full path from egg (3 steps)   |
                                    |  Hatching Stone           x1   |
                                    |  Milk                     x3   |
                                    |  Chicken Feather         x10   |
                                    |  Vegetable Oil            x5   |
                                    +--------------------------------+
```

Flow:

1. `/pets` shows the seven categories as cards (2 columns on mobile, more on wide screens), each with its form count.
2. `/pets/<category>` renders the tree top-down from the root (egg/seed). Branches are siblings under the same parent. Each node shows name, stage number and an optional variant tag (rare, class-specific, …).
3. Selecting a node (tap, click, Enter) marks it, highlights the path from the root, and fills the materials panel. Selection is kept in the URL (`?form=<id>`) so a target can be bookmarked or shared.
4. Layout: one column below 900px (panel under the tree, scrolled into view on selection); at 900px and up the tree is left and the panel is sticky on the right (the reference's two-column pattern).

**Calculation rules**

A category is a tree: every form except the root has exactly one parent, and the edge parent → form carries the materials for that evolution.

```
path(node)      = [root, ..., node]                       // follow parent links upward, then reverse
stepMaterials   = materials on edge (parent(node) -> node) // empty for the root

pathMaterials   = {}
for each edge e on path(node):
    for each m in e.materials:
        pathMaterials[m.item] += m.qty                     // same item on several steps is summed
```

"Recommended materials" = `stepMaterials` (what the next evolution needs) plus `pathMaterials` (the shopping list from the egg). Display order: step materials keep data order, because feeding order may matter in-game **(Q-7)**; the path total is sorted by item name. Edge notes (success rate, ordering rule, level condition) are shown verbatim when present; the app never computes probabilities.

**States**

| State | Behaviour |
|---|---|
| `pets` empty | `.empty`: "Pet data is not available yet." |
| Category has no forms | Card is shown disabled with "Coming soon"; direct URL shows `.empty` |
| Unknown category in URL | "Category not found" + link back to `/pets` |
| Nothing selected | Panel shows the hint "Select a form to see its materials" |
| Root selected | Panel: "Starting form, no materials needed" |
| Edge without materials | "Materials not recorded yet" for that step; path total shows what is known and flags it as incomplete |
| `?form=` id not in this category | Ignored; nothing selected |

**Data entities consumed**: `pets` — categories (id, name, order) and forms (id, name, category, stage, parent form id or null, variant tag, materials for evolving from the parent as item + qty in order, optional note). Branching is expressed by several forms sharing one parent. The draft schema in `data-source.md` (a flat `stages` array) cannot express branches and must not be reused.

No user entity is consumed; the feature is read-only.

**Acceptance criteria**

- [ ] All seven categories appear on `/pets` in a fixed order; an empty category is visibly disabled, not hidden.
- [ ] A category page renders every form exactly once, each under its parent; sample data includes at least one branch (one parent with two children).
- [ ] The tree is real nested list markup (`<ul>`/`<li>`), so screen readers announce depth; every node is a button reachable by Tab and activated by Enter or Space.
- [ ] Selecting a node marks it with `aria-current` and highlights its path with more than colour (heavier border or icon).
- [ ] The panel shows step materials and the summed path total; unit tests cover summing the same item across two steps, the root (empty) and a branch node.
- [ ] `/pets/<category>?form=<id>` restores the selection after reload.
- [ ] A tree 6 levels deep fits at 375px without horizontal page scroll (the tree container may scroll on its own, with a visible cue).
- [ ] Every state in the table renders its message.

**Out of scope**: tracking pets the user owns, pet stats and skills, success-rate maths, images of pets **(Q-10)**, comparing two targets, pan/zoom canvas.

---

## 4. Cross-feature flows

### 4.1 Calculator → add character → back

```
/fame (0 characters, or "+ Add character")
   |
   v
/characters?form=new&return=/fame
   |  save OK                         | cancel / Escape / back
   v                                  v
/fame?character=<newId>            /fame   (unchanged)
```

Rules:

- `return` is honoured only if it starts with a single `/` (not `//`, not a scheme). Anything else is ignored and the user stays on `/characters`. This closes the open-redirect hole a free-form return parameter would create.
- On successful save the app navigates to `return` and appends `character=<id>`, replacing the form entry in history so Back from the calculator does not reopen a submitted form.
- Without `return`, saving leaves the user on the character list.

### 4.2 Calculator → edit character → back

"Edit" beside the select opens `/characters?form=<id>&return=/fame`. Same rules as 4.1. This is the fast path for the most frequent action, updating fame after a play session.

### 4.3 Other links

| From | To | Carries |
|---|---|---|
| Landing "Add your first character" | `/characters?form=new` | no return (list is the natural next step) |
| Character card "Calculate" | `/fame?character=<id>` | character id |
| Fame recommendation card | `/quests/<questId>#<itemId>` | item anchor |
| Quest "no character" hint | `/characters?form=new&return=<current quest URL>` | return |
| Fame "no eligible item" | `/quests` | nothing |

### 4.4 Consistency rules

- A character deleted in one tab disappears from the calculator select in other tabs on the next `storage` event; if it was the selected one, the calculator falls back to its default selection.
- `eligible()` exists once and is used by both the Fame Calculator and Quest Guidance.
- Pets is independent of characters; no flow enters or leaves it except navigation.

---

## 5. Design direction

Method: the `ui-ux-pro-max` skill was queried for this product type. Its generated system (Swiss style, serif pairing, blue palette) does not fit and is **not** adopted, because the brief fixes the reference repo's look. What is taken from the skill is its UX rule set and pre-delivery checklist (SVG icons instead of emoji, 4.5:1 text contrast, visible focus, reduced motion, 375/768/1024/1440 checks, tables become cards or scroll on mobile). Token layering follows the `design-system` skill: primitive → semantic → component.

### 5.1 Identity

"A friendly adventurer's notebook", neobrutalist: nude paper, thick ink outlines, hard offset shadows, chunky pressed buttons, flat fills. Reference: `Landing/templates/layout-3`. It suits Seal Online's cute cel-shaded tone better than the dark-and-gold look of most MMORPG tools, and it stays readable beside a bright game window.

### 5.2 Kept from the reference (colour, surface and depth rows revised)

| Area | Kept |
|---|---|
| Colour base | `--bg #f3e9dc`, `--card #fffaf2`, `--ink #1b2a4a`, `--ink-soft #4d5a77`, `--line #d9cdb4`, `--coral #ff8a73` / `--coral-strong #f4705a`, `--green #276b43` / `--green-soft #dff1e5`, `--warn-soft #fff0c9`, `--danger #9b2c1b`, pastel pink (blush `#f2d4c9`) and blue; nude additions `--tan #e3c9a8`, `--clay #d99a7c`, `--sage #cfd8bd` (ink text on each: 8.93, 6.00, 9.62) |
| Background | Flat `--bg`, no gradient |
| Type | Space Grotesk (headings), DM Sans (body), self-hosted woff2, `font-display: swap`; scale h1 1.75 / h2 1.25 / body 1rem, line-height 1.5 |
| Shape | 8px radius (`--radius`) on cards and buttons, 12px inputs, 999px pills; 3px ink borders on cards and buttons |
| Depth | Hard offset shadow `4px 4px 0 var(--ink)`, no blur; hover and keyboard focus shift the element 2px, press shifts 4px with no shadow |
| Components | card, button set, tag/pill, progress bar, empty state, banner/alert, segmented filter, inputs, native `<dialog>`, sticky topbar |
| Accessibility base | skip link, 3px ink `:focus-visible` outline (`a.card` uses an 8px offset to clear the hard shadow), `.sr-only`, reduced-motion block |

### 5.3 Adapted for a fantasy MMORPG companion

**Accent colours** (new primitives; contrast is measured by `app/src/lib/contrast.test.ts`, which reads `app.css`, so a token edit that breaks a pair fails `npm test`):

| Token | Value | Semantic use |
|---|---|---|
| `--gold` | `#f2b33d` | Fame: progress fill, fame badges, target marker. Used as a fill with ink text, never as text on cream |
| `--gold-soft` | `#fbe7b2` | Fame card and badge backgrounds |
| `--violet` | `#6b4fa3` | Pets and rarity: rare/variant tag border and icon |
| `--violet-soft` | `#e6dcf5` | Pet category cards, rare tag background |

Semantic layer (what components actually reference):

| Semantic token | Maps to | Used by |
|---|---|---|
| `--accent-fame` / `--accent-fame-soft` | gold / gold-soft | Fame calculator, fame figures everywhere. Feature-card top strip uses the non-soft accents |
| `--accent-quest` / `--accent-quest-soft` | coral / pastel-pink | Quest cards, source pills |
| `--accent-pet` / `--accent-pet-soft` | violet / violet-soft | Pet cards, tree highlights |
| `--accent-character` / `--accent-character-soft` | clay / tan | Character cards, selected states |
| `--state-done` | green | Titles already reached, positive status |

One accent per feature gives each tab its own colour identity without adding a second primary: coral stays the only primary-action colour. Text on coral and gold fills is always `--ink` (white on coral fails contrast).

**Iconography**

- Line icons as inline SVG, 24px grid, 2px stroke in `currentColor`, rounded caps, matching the ink-outline style. Source: Lucide (ISC licence). About 15 icons are needed (home, users, trophy, scroll, paw, plus, pencil, trash, chevrons, search, check, arrow, info, alert, x).
- The reference uses emoji glyphs as icons; replace them, because emoji render differently per platform and have no reliable accessible name.
- Decorative icons get `aria-hidden="true"`; icon-only buttons get an `aria-label`.
- No game artwork in v1: characters show a job-coloured initial tile, pets show a stage badge. **(Q-10)**

**Numbers**: fame, level and quantities use Space Grotesk with `font-variant-numeric: tabular-nums`, right-aligned in tables, grouped with `Intl.NumberFormat`.

**Pet tree visualisation**

- Indented vertical tree built from nested lists with CSS connector lines (2px `--line`, 2px `--ink` on the selected path). No canvas, no SVG layout library, no pan/zoom.
- Node = small card: name, stage pill (`S3`), optional variant tag. Selected node: ink border, pressed shadow, `--accent-pet-soft` fill, check icon.
- Indent 20px per level on mobile, 28px from 640px. If depth exceeds the viewport the tree container scrolls horizontally on its own with a fade cue; the page never does.
- Reason for the choice: it reads top to bottom on a phone, is accessible by default, and handles branching with zero dependencies. A horizontal node-link diagram is the classic look but needs layout code and breaks at 375px.

**Table density for quest items**

| Viewport | Presentation |
|---|---|
| < 640px | One stacked card per item: name + fame badge on the first line, `xQty · Lv range` on the second, dropped-by on the third (2 lines max, then truncated with full text available on expand). 12px gap between cards |
| ≥ 640px | Real `<table>`: sticky header, 40px rows, 0.9375rem text, numbers right-aligned, zebra rows using `--bg` on `--card`, 1.5px `--line` rules. Page uses the 960px wide column variant |
| Any | Rows are not clickable as a whole; only explicit links and buttons are, each ≥ 44px tall on touch |

Dense but not cramped: the table is reference material that players scan, so it gets tighter rows than the rest of the app, while every tap target keeps its 44px.

**Motion**: 150–200ms transitions on hover, press and selection only. No page transitions, no decorative animation. Everything is disabled under `prefers-reduced-motion`.

### 5.4 Accessibility rules

- [ ] Text contrast ≥ 4.5:1, large text and UI boundaries ≥ 3:1; every new token pair is measured before merge.
- [ ] State is never conveyed by colour alone: current/target titles, selected tree node, eligible items and rarity all carry text or an icon as well.
- [ ] Touch targets ≥ 44×44px with ≥ 8px between adjacent targets.
- [ ] Everything works by keyboard; focus order follows visual order; focus ring is never removed.
- [ ] Dialogs use native `<dialog>` with `showModal()`: focus trapped, Escape closes, focus returns to the opener.
- [ ] Form fields have visible labels; errors are linked with `aria-describedby` and announced.
- [ ] Results that change without navigation (filter counts, recalculated fame) sit in a `role="status"` region.
- [ ] Landmarks: one `<header>`, one `<nav aria-label="Primary">`, one `<main>`; skip link targets `<main>`. One `<h1>` per page.
- [ ] Page is usable at 200% zoom and at 320px width without horizontal scrolling.
- [ ] `<html lang="id">`; no hard-coded UI strings outside the message file (§2.3).

### 5.5 Responsive rules

| Breakpoint | Layout |
|---|---|
| base (≥ 320px) | Single column, 16px side padding, sticky header with menu button + nav drawer, cards for tabular data, 2-column grids for feature and pet-category cards |
| ≥ 640px | Quest items become a table; character list becomes 2 columns; tree indent widens |
| ≥ 900px | Pet page and fame page become two columns (main + 300px sticky side panel, as in the reference) |
| ≥ 1024px | Header and drawer replaced by the fixed left sidebar (16rem); content offset by its width |
| max width | 720px content column; 960px for quest tables and the pet tree |

Mobile-first CSS (base styles, then `min-width` queries). Verified at 375, 768, 1024 and 1440px. Fixed bars respect `env(safe-area-inset-*)`.

---

## 6. Build order

| # | Slice | Depends on | Size | Why here |
|---|---|---|---|---|
| 0 | App shell: tokens, fonts, message file, header + sidebar/drawer nav, base components (card, button, tag, empty, banner, dialog, inputs) | architecture setup milestone | M | Every feature renders inside it |
| 1 | Landing Page | 0, `changelog` sample | S | Smallest slice; proves the shell and static JSON loading end to end |
| 2 | Character Management | 0, `jobs` sample, storage module | M | Only writer of user data; calculator cannot exist without it |
| 3 | Fame Calculator | 2, `fame-titles` + `quest-items` samples | M | Core value of the product; pure functions, test-first |
| 4 | Quest Guidance | 0, `quests` + `quest-items` samples; reuses `eligible()` from 3 | M | Completes the calculator's deep links; two templates |
| 5 | Pet Evolution | 0, `pets` sample | L | Independent of the rest; tree component is the largest unknown |
| 6 | Polish pass: all states, accessibility checklist, responsive checks | 1–5 | S | Gate before any real data goes in |

```
0 Shell --+--> 1 Landing
          +--> 2 Characters --> 3 Fame --> 4 Quests
          +--> 5 Pets                         (4 needs only 0 for its own pages)
```

Notes:

- Slices 4 and 5 can run in parallel with 3 once the shell exists; only the calculator → quest deep link waits for both 3 and 4.
- The landing page's character line needs slice 2; ship it with the "0 characters" branch first and it lights up when 2 lands.
- Sizes assume sample data. Real data collection is a separate, later milestone and is not counted.

---

## 7. Open questions for owner

### 7.1 Product

| ID | Question | Options | Recommendation |
|---|---|---|---|
| Q-1 | UI language? | — | **DECIDED 2026-11-17:** Indonesian only in v1, built on local i18n so languages can be added later. See §2.3 |
| Q-2 | Navigation pattern | — | **DECIDED 2026-11-17:** paimon.moe pattern, sidebar on desktop and drawer on mobile. See §2.2 |
| Q-3 | How should quest items be ranked in the calculator? | (a) Fame per collected piece · (b) Fewest turn-ins · (c) Highest minimum level first · (d) No ranking, just list eligible items | **(a)** with the label "least farming". Without drop rates no option is a true effort estimate |
| Q-4 | Which fame data is authoritative? Thresholds and quest limits differ by server and version, and the wiki is unverified | (a) Indonesian fandom wiki as-is · (b) Wiki, spot-checked in the game client by the owner · (c) Owner supplies numbers from the game | **(b)**, and record the server + version in the data. Same decision settles whether "Below Lv. 64" includes 64 |
| Q-5 | Maximum character level | (a) Read from data · (b) Hard-code a number | **(a)**. Owner to supply the current cap; needed for form validation |
| Q-6 | Final list of quest sources | The brief names quest center, high central quest, highest, main quest, "etc." | Treat sources as data. Owner to confirm the list and display names before data collection; UI needs no change either way |
| Q-7 | Pet materials: does feeding order or success rate matter enough to show? | (a) Show materials in data order plus a free-text note · (b) Model order and rates as structured data | **(a)**. Structured rates invite maths the app cannot back up |

### 7.2 Scope candidates (not in the brief; default is "no")

| ID | Question | Options | Recommendation |
|---|---|---|---|
| Q-8 | Progress tracking (tick off quest steps or collected items, "add to todo" from the calculator)? | (a) Not in v1 · (b) Checkboxes on walkthrough steps only · (c) Full todo list like paimon.moe | **(a)**. It adds a second user entity and a migration surface. Cheapest later step is (b) |
| Q-9 | Export / import of characters as a JSON file? | — | **DECIDED 2026-11-17:** not in v1 |
| Q-10 | Game artwork (pet and item images)? | (a) None, icons and badges only · (b) Owner-provided screenshots · (c) Images from the wiki | **(a)**. Licence of game and wiki images is unclear and image collection belongs to the data milestone |
| Q-11 | Product name and wordmark | (a) "Seal Hub" · (b) other | **(a)** as working title, text-only wordmark in Space Grotesk. A footer line "Unofficial fan tool, not affiliated with the game publisher" is recommended either way |

### 7.3 Requirements handed to `architecture.md`

Not owner decisions; listed so the two docs can be reconciled.

| Need | Reason |
|---|---|
| `quest-items` carries min level, nullable max level, **nullable max fame**, qty and fame per turn-in, and a link to its owning quest | Eligibility and deep links (§3.3, §3.4). The fame cap is missing from the draft schema |
| `fame-titles` includes a title at fame 0 and is sortable by required fame | Guard in §3.3 |
| `quests` has a `source` and a `format` of `items` or `walkthrough`; walkthrough steps are ordered objects, not bare strings | Two templates, optional NPC/location per step |
| `pets` forms reference a parent form; materials live on the child (edge from parent) with qty and order | Branching tree and path sum (§3.5) |
| `changelog` entries have version, date and a list of lines | Landing page |
| A place to remember the last character used in the calculator | Default selection in §3.3. If not provided, default is the first character |
| Routes with ids taken from static JSON (`/quests/<id>`, `/pets/<category>`) can be prerendered; the character form uses query parameters because character ids exist only in localStorage | Static hosting without a server fallback |
| Storage module exposes "readable / writable" status and change notifications across tabs | States in §3, consistency rule in §4.4 |
