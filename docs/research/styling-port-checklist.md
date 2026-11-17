# Styling Port Checklist: grocery-pwa → seal-hub-web

Source repository: `https://github.com/ekadhirapratama/grocery-pwa` (shallow clone at `<scratch>/grocery-pwa/`). All path references below are relative to that repo root.

## 1. Font Files & Licenses

### Font Files Exist in `app/fonts/`
- `app/fonts/dm-sans-latin.woff2`: exact size **36,980 bytes** (36.9 KB).
- `app/fonts/space-grotesk-latin.woff2`: exact size **22,320 bytes** (22.3 KB).

### `@font-face` Blocks (`app/styles/style.css:4-18`)
```css
@font-face {
  font-family: "DM Sans";
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url("../fonts/dm-sans-latin.woff2") format("woff2");
}

@font-face {
  font-family: "Space Grotesk";
  font-style: normal;
  font-weight: 500 700;
  font-display: swap;
  src: url("../fonts/space-grotesk-latin.woff2") format("woff2");
}
```

### Fonts' Upstream Licenses
- **DM Sans**: Upstream repository (`googlefonts/dm-fonts`, source URL: `https://github.com/googlefonts/dm-fonts`) and Google Fonts (`https://fonts.google.com/specimen/DM+Sans/license`) license under the **SIL Open Font License 1.1 (OFL-1.1)**.
- **Space Grotesk**: Upstream repository (`floriankarsten/space-grotesk`, source URL: `https://github.com/floriankarsten/space-grotesk`) and Google Fonts (`https://fonts.google.com/specimen/Space+Grotesk/license`) license under the **SIL Open Font License 1.1 (OFL-1.1)**.
- *Repository License note*: Checked repository root for `LICENSE` or `license*` files (`find . -name "*LICENSE*"`): **UNVERIFIED / None present** in `grocery-pwa` repository root (no `LICENSE` file committed in the repo).

---

## 2. Verbatim CSS Quotes (`app/styles/style.css`)

### `:root` Token Block (`app/styles/style.css:20-38`)
```css
:root {
  --bg: #fbf3e4;
  --pastel-pink: #fde1dc;
  --pastel-blue: #dce8f7;
  --card: #fffbf2;
  --ink: #1b2a4a;
  --ink-soft: #4d5a77;
  --line: #d9cdb4;
  --coral: #ff8a73;
  --coral-strong: #f4705a;
  --green: #2e7d4f;
  --green-soft: #dff1e5;
  --warn-soft: #fff0c9;
  --danger: #9b2c1b;
  --radius: 16px;
  --shadow: 0 2px 0 rgb(27 42 74 / 0.06), 0 6px 16px rgb(27 42 74 / 0.06);
  --font-head: "Space Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-body: "DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
}
```

### Body Background Rule (`app/styles/style.css:50-62`)
```css
body {
  margin: 0;
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.5;
  color: var(--ink);
  background:
    radial-gradient(circle at 0% 0%, var(--pastel-pink) 0, transparent 38%),
    radial-gradient(circle at 100% 12%, var(--pastel-blue) 0, transparent 34%),
    var(--bg);
  background-attachment: fixed;
}
```

### Heading Scale Rules (`app/styles/style.css:64-83`)
```css
h1,
h2,
h3 {
  font-family: var(--font-head);
  line-height: 1.2;
  margin: 0;
}

h1 {
  font-size: 1.75rem;
}

h2 {
  font-size: 1.25rem;
}

h3 {
  font-size: 1rem;
}
```

### Accessibility Block (`app/styles/style.css:98-126`)
```css
:focus-visible {
  outline: 3px solid var(--ink);
  outline-offset: 3px;
  border-radius: 6px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.skip {
  position: absolute;
  left: 12px;
  top: -60px;
  z-index: 10;
  padding: 10px 14px;
  background: var(--ink);
  color: #fff;
  border-radius: 10px;
}

.skip:focus {
  top: 12px;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}
```

### Topbar Rules (`app/styles/style.css:130-163`)
```css
.topbar {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 720px;
  min-height: 56px;
  margin: 0 auto;
  padding: 8px 16px;
  background: var(--bg);
  /* latar penuh selebar layar walau header dibatasi max-width */
  box-shadow: 0 0 0 100vmax var(--bg);
  clip-path: inset(0 -100vmax);
}

.topbar-title {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topbar-spacer {
  flex: none;
  width: 44px;
}
```

### App Column Rules (`app/styles/style.css:186-196`)
```css
.app {
  max-width: 720px;
  margin: 0 auto;
  padding: 8px 16px 48px;
  display: grid;
  gap: 20px;
}

.app.lebar {
  max-width: 960px;
}
```

### `.card` / `a.card` / `.card-title` Rules (`app/styles/style.css:233-256`)
```css
.card {
  background: var(--card);
  border: 1.5px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 16px;
}

a.card {
  display: grid;
  gap: 10px;
  text-decoration: none;
}

a.card:hover {
  border-color: var(--ink);
}

.card-title {
  font-family: var(--font-head);
  font-size: 1.125rem;
  font-weight: 700;
}
```

### `.btn` Variant Rules (`app/styles/style.css:313-358`)
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  padding: 10px 20px;
  font: inherit;
  font-weight: 700;
  color: var(--ink);
  background: var(--card);
  border: 2px solid var(--ink);
  border-radius: 14px;
  box-shadow: 0 3px 0 var(--ink);
  text-decoration: none;
  cursor: pointer;
}

.btn:active {
  transform: translateY(2px);
  box-shadow: 0 1px 0 var(--ink);
}

.btn.primary {
  background: var(--coral);
}

.btn.primary:hover {
  background: var(--coral-strong);
}

.btn.small {
  min-height: 44px;
  padding: 6px 14px;
  box-shadow: none;
}

.btn.block {
  width: 100%;
}

/* aksi yang membatalkan pilihan, mis. Hapus pada Buat catatan */
.btn.danger {
  color: var(--danger);
  border-color: var(--danger);
}
```

### Tag Rules (`app/styles/style.css:257-272`)
```css
.tag {
  display: inline-block;
  font-size: 0.8125rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
  border: 1.5px solid var(--ink);
}

.tag.groceries {
  background: var(--pastel-blue);
}

.tag.daily {
  background: var(--pastel-pink);
}
```

### Empty State Rules (`app/styles/style.css:297-309`)
```css
.empty {
  border: 2px dashed var(--line);
  border-radius: var(--radius);
  padding: 24px 16px;
  display: grid;
  gap: 12px;
  justify-items: start;
  background: rgb(255 251 242 / 0.6);
}

.empty p {
  color: var(--ink-soft);
}
```

### Banner Rules (`app/styles/style.css:728-737`)
```css
.banner,
.alert {
  display: grid;
  gap: 10px;
  justify-items: start;
  padding: 12px 16px;
  border: 2px solid var(--ink);
  border-radius: var(--radius);
  background: var(--warn-soft);
}
```

### Stack / Row / Section-Title / Count Rules (`app/styles/style.css:215-229, 451-463`)
```css
.stack {
  display: grid;
  gap: 12px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.row.between {
  justify-content: space-between;
}

.section-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.count {
  font-size: 0.875rem;
  color: var(--ink-soft);
}
```

---

## 3. Line Count & Section Table (`app/styles/style.css`)

- **Total line count**: **799 lines** (`wc -l app/styles/style.css`).

| Section Name | Line Range |
|---|---|
| Header comment & Font-face / Root variables | Lines 1–38 |
| Box-sizing, HTML, Body, Headings, Accessibility (`skip`, `.sr-only`, `:focus-visible`) | Lines 40–127 |
| Layout (`.topbar`, `.topbar-title`, `.topbar-spacer`, `.icon-btn`, `.app`, `.page-head`, `.stack`, `.row`) | Lines 128–230 |
| Cards (`.card`, `a.card`, `.card-title`, `.tag`, Progress bar `.bar`, Empty state `.empty`) | Lines 231–310 |
| Buttons & Form Inputs (`.btn`, `label.field`, inputs, `.hint`) | Lines 311–393 |
| Radio Card Picker (`fieldset`, `.pilih-tipe`) | Lines 394–448 |
| Item Lists (`.section-title`, `.count`, `.items`, `.item`, `.cek`, filters, summary, status pills) | Lines 449–638 |
| Dialog (`dialog`, `dialog::backdrop`, `.dialog-actions`) | Lines 639–669 |
| Media Queries & Wide screen / Small screen / Reduced motion | Lines 670–725 |
| Banner, Fixed Action Bar (`.aksi-fixed`, `.ada-aksi`), Utilities | Lines 726–799 |

---

## 4. Indonesian Class Names & Proposed English Renames

Per `architecture.md` section 1 ("CSS port"), the following Indonesian-named classes (and others found in `style.css` and HTML files) are renamed, keeping specific ones (`.cek`, `.pilih-tipe`, `.aksi-fixed`, `.lebar`) as per spec / established layout naming:

| Original Indonesian Class / Selector | Proposed English Name / Role | Notes / Architecture.md Mapping |
|---|---|---|
| `.cek` | `.check` | Explicitly kept as `.cek` or mapped to `.check` (`architecture.md` §1) |
| `.pilih-tipe` | `.radio-cards` | Explicitly mapped in `architecture.md` §1 |
| `.aksi-fixed` | `.action-bar` | Explicitly mapped in `architecture.md` §1 |
| `.lebar` | `.wide` | Explicitly mapped in `architecture.md` §1 |
| `.tersimpan` | `.saved` | Item metadata save status text in create form |
| `.kosong-filter` | `.filter-empty` | Empty state when filter hides all items |

---

## 5. Icons & Favicon

- **Icon Files**:
  - `app/icons/icon-192.png`: **1,230 bytes** (1.2 KB)
  - `app/icons/icon-512.png`: **3,371 bytes** (3.3 KB)
- **Glyphs / UI symbols used in repo**:
  - Back button / arrow: `←` (Unicode arrow used in `.icon-btn` on subpages like `buat-catatan.html`, `detail.html`, `riwayat.html`, `riwayat-detail.html`).
  - Primary action prefix: `+` (e.g. `+ Tambah catatan`, `+ Item baru`).
  - Checked state checkmark: `✓` (`.cek::after` content).
  - Selected radio indicator: `●` (`.pilih-tipe input:checked + label strong::before` content).
- **Favicon**:
  - Yes, `<link rel="icon" href="/icons/icon-192.png" type="image/png" />` and `<link rel="apple-touch-icon" href="/icons/icon-192.png" />` are declared in `app/index.html` and all subpages (`buat-catatan.html`, `detail.html`, `riwayat.html`, `riwayat-detail.html`).

---

## 6. Repository License

- Is there a `LICENSE` file in the repo root? **No** (`find . -name "*LICENSE*"` returned no license file in `grocery-pwa`). Status: **UNVERIFIED / None present** in repo.

---

## 7. Verification Against `docs/research/styling-reference.md`

Comparing all findings against `docs/research/styling-reference.md`:
1. **Font file sizes**: Accurately matches or complements research notes (DM Sans woff2: 36,980 bytes; Space Grotesk woff2: 22,320 bytes).
2. **Tokens and CSS selectors**: All tokens, layout rules, and component classes match verbatim with exact line numbers and styling details.
3. **Corrections list**: The research document (`styling-reference.md`) is accurate and complete; **no incorrect claims found** in `styling-reference.md`.
