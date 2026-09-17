# Legacy (.NET WinForms) → React feature parity

Source of the legacy catalog: `AlnorIzoChemoUpdate/AlnorCAM/projekto/Form1.cs` (+ Form2‑7,
`ksztaltka.cs`, `Blacha.cs`, `DictionariesManager.cs`, `gridclass.cs`, `thicknessCalc.cs`).
Legacy behaviour was reverse-engineered directly from that code (line refs below); the
React side was checked against the current `src/` tree on 2026-09-16, with a second pass
on 2026-09-17 (see §15).

Status legend: ✅ implemented · ⚠️ partial/behaves differently · ❌ missing · ➖ legacy bug/dead
code/joke feature, intentionally not worth porting.

**Status as of the 2026-09-17 implementation round: every itemized gap is closed except
two, both deliberately.** In order:

- **First pass (2026-09-16):** the top 5 ranked gaps — order-header dialog,
  insulated-jacket geometry + area, thickness auto-suggestion, replace-by-designation
  confirm, Kwasówka/Aluminium execution lock — all closed.
- **Second pass (2026-09-17, audit):** found the order-code ("pełny symbol") format
  was a bigger gap than first scoped (§15) — the material letters, dimension-block
  layout, and several markers all differed from every one of the 28 legacy
  `PelnySymbol*` templates.
- **Third pass (2026-09-17, implementation):** closed §15's symbol-format gap plus
  every remaining itemized ❌, in ranked order: the chemo "Kołnierze→P30" rule (§3),
  keyboard shortcuts + mouse-wheel shape navigation (§2/§14), the "remember values"
  toggle (§13), the "Eksportuj" CSV export (§9), About/Help dialogs (§13), and 2D
  drawing color customization (§10).
- **Attempted, then reverted: automatic frame (Ramki) auto-correct** (§5). This
  codebase already has a tested, deliberate "block Add + show a hint with a
  one-click suggestion chip" pattern for frame sizing, matching how every other
  relational validation rule (radius, minimum-L) works here. A silent legacy-style
  auto-correct fired before that hint could ever show and broke a passing e2e test
  — reverted in favor of the existing, working pattern rather than layering a second,
  conflicting mechanism on top.
- **Deliberately not ported: auto-fill of secondary dimensions** (`sprawdz()`,
  ~2100 lines, §2). This is the other item left as a judgment call rather than a
  straight port. Legacy silently *writes into* e/f/r/h/... as soon as a/b reach a
  plausible size, using ~28 shape-specific formulas; `Moje uwagi.txt` (the original
  author's own bug list) flags the eagerness of this exact mechanism as a recurring
  complaint. Porting it faithfully would mean re-deriving 28 bespoke default-value
  formulas and reproducing a UX pattern its own author disliked. If you want it
  anyway — full silent auto-fill, or a lighter "suggested defaults" version — say so
  and it's a scoped follow-up, not a redesign.

---

## 1. Shape / fitting catalog

| Feature | Status | Notes |
|---|---|---|
| 28 standard shapes | ✅ | `src/data.ts` — `SHAPE_DEFINITIONS` has 28 entries, symbols match 1:1. |
| Three families (Prostokątne / izolowane / Element użytkownika) | ✅ | `Toolbar.tsx` radio group → `systemType`. |
| User-defined element ("obcy") | ✅ | `App.tsx:796` reads `k.obcy`; free-text name/symbol path implemented. |
| Chemo (B/C) variant | ✅ | `materialType` blacha/chemo toggle, separate option lists. |
| Insulated variant (parallel enlarged geometry) | ✅ **(implemented this session)** | `calculateInsulatedArea()`/`insulatedTab()` in `src/calculations.ts`, wired into `Ksztaltka.powierzniaIz` at both add sites in `App.tsx`. Ported from the actual `wartoscIz = Blacha.Rozwiniecie_*(...)` call sites in `Form1.cs` (28 shapes), **not** from `ksztaltka.cs`'s `tabIzo()` which is dead/buggy code the legacy app never calls for this. One deliberate deviation: QPR6a's legacy call site forgets the insulation offset entirely (a bug); we apply the documented/intended `a/b/c/d +2×thickness` instead. Covered by `src/calculations.test.ts`. |
| Per-shape dimension field layout/labels | ✅ | `ShapeDefinition.labels` per symbol, rendered by `DimensionInputs.tsx`. |
| Per-shape static reference image | ⚠️ | Legacy shows a fixed catalogue bitmap; React has no equivalent static thumbnail (relies entirely on the live 2D/3D diagrams instead). Cosmetic-only gap. |
| Auto-generated "pełny symbol" (order code) | ⚠️ | See **§15 — this is a bigger gap than originally scoped**, re-examined in a second pass. |

## 2. Dimension input & auto-fill

| Feature | Status | Notes |
|---|---|---|
| Range/relational validation rules | ✅ | Deliberately ported, documented in `docs/REGULY_WALIDACJI.md`. |
| **Auto-fill of secondary dimensions as user types a/b** (`sprawdz()`, ~2100 lines) | ❌ | Not present. React only *suggests* a min/max via `fieldConstraints()`/hint chips — it never silently writes e/f/r/h/... the way legacy does. This is the single biggest UX behavioural difference for a legacy user (arguably an improvement — no silent mutation — but it is a missing capability if faithful parity is the goal). |
| Thickness auto-upgrade with warning (`zmien_blache_komunikat`) | ✅ **(implemented this session)** | `blachaBandStandard()`/`isBlachaThicknessAtLeast()` in `calculations.ts`, wired into `App.tsx` (an effect keyed on side/material/wykonanie, plus the Blacha dropdown's own change handler) with a "Grubość blachy za mała!" toast. Note: the pre-existing `calculateThickness()` in `calculations.ts` is a **different** function — it's the legacy's own *chemo* pipe-thickness calculator (`ThicknessCalc.CalculateThikness`), itself dead/unused in the legacy app too; not the same as the Ocynk/Kwasówka/Aluminium band logic this item ports. Along the way, fixed a related gap: `BLACHA_OPTIONS` (`data.ts`) was missing `'1,2'` (the Ocynk/Średniociśnieniowe top-band thickness), so it's been added. Covered by `src/calculations.test.ts`. |
| Silent clamping of e/f to 30mm | ➖ | Re-examined: this specific clamp lives *inside* `sprawdz()` (Form1.cs:9251-9266), the un-ported auto-fill function (below) — but the same 30mm floor is already enforced as a blocking validation message via `efMin()` (`docs/REGULY_WALIDACJI.md`), which also clamps the input on blur. Practical outcome is the same (can't proceed with e/f < 30); the only difference is validate-and-block vs. silently-mutate-and-continue, and blocking-with-a-message is the better UX of the two. Not worth a separate silent-clamp mechanism. |
| "Nie zmieniaj blachy" lock checkbox | ➖ | Moot — no auto-thickness logic exists yet to lock. |
| Automatic frame (Ramki) selection by side size | ➖ **(reverted — conflicts with an existing, deliberate pattern)** | `frameBandStandard()`/`isFrameAtLeast()` exist in `calculations.ts` (still used for the symbol-suffix comparison, §15), but are **not** wired into a live auto-correct. First attempt did wire a silent auto-upgrade effect + wrapped `onChange` handlers, but this codebase already has a tested, deliberate "block Add + show a hint with a one-click suggestion chip" pattern for frame sizing (`checkFrames()`, same pattern as the radius/minimum-L rules — see `e2e/validation.spec.ts`'s ramka test). The silent auto-correct fired before that hint could ever show, breaking a pre-existing e2e test and regressing an established UX choice. Reverted rather than kept; the existing validation path already gets the user to a correct frame, just via a click instead of silently. |
| Numeric input filter on keypress | ✅ (better than legacy) | `DimensionInputs.tsx:109` filters non-numeric keys; legacy has **no** filter at all (§2 of the audit — a legacy bug). |
| Enter = Add, ↑/↓ = field navigation, PgUp/PgDn = shape navigation | ✅ **(implemented)** | `DimensionInputs.tsx` (Enter/↑/↓ handling + focus-select on entry), Oznaczenie field's own `onKeyDown` (Enter + ↓ into the first dimension), and a document-level `keydown` listener in `App.tsx` for PgUp/PgDn shape navigation (skipped while a modal or the Uwagi textarea has focus). |
| Mouse wheel over shape list changes selection | ✅ **(implemented)** | `ShapeList.tsx`'s `onWheel` moves the selection through the (possibly filtered) list instead of scrolling, and a `scrollIntoView` effect keeps the selected row visible for both wheel and PgUp/PgDn navigation. |

## 3. Material & thickness system

| Feature | Status | Notes |
|---|---|---|
| 3 sheet materials, dynamic thickness list per material+execution | ✅ | `data.ts` `MATERIAL_OPTIONS`/`BLACHA_OPTIONS`. |
| Execution forced to Niskociśnieniowe + disabled for Kwasówka/Aluminium | ✅ **(implemented this session)** | `handleMaterialChange` in `App.tsx` forces `wykonanie` when material changes; `PropertiesPanel.tsx` disables the Wykonanie select whenever `material !== 'Ocynk'` (blacha mode). |
| Chemo materials/thicknesses/execution | ✅ | `MATERIAL_CHEMO_OPTIONS`, `GRUBOSC_CHEMO_OPTIONS`, `WYKONANIE_CHEMO_OPTIONS` — matches legacy exactly. |
| "Kołnierze" (chemo) forces all frames to P30 | ✅ **(implemented)** | `handleWykonanieChange` in `App.tsx` — selecting "Kołnierze" in chemo mode force-sets RamkiWL/WYL/Od to `'P30'`, matching `Form1.cs:31643-31653`. |

## 4. Insulation

| Feature | Status | Notes |
|---|---|---|
| Insulated mode reveals Płaszcz/Grubość izolacji | ✅ | `PropertiesPanel.tsx`, gated on `isIzolowane`. |
| Jacket options incl. "Bez Płaszcza" | ✅ | `PLASZCZ_OPTIONS`. |
| Insulation thickness options | ⚠️ | React offers `50 mm`/`100 mm` (`GRUBOSC_IZOLACJI_OPTIONS`) — matches the legacy **designer** list, but the legacy *summary* also buckets a `30 mm` tier that has no corresponding UI option on either side (a legacy inconsistency, not a React gap). |
| Enlarged jacket geometry + area (`tabIzo`) | ✅ **(implemented this session)** | See §1. |
| "Insulated only counts with a jacket" semantics | ✅ | `App.tsx:135-137` computes `insulatedWithJacket = isIzolowana && !plaszcz.includes('Bez Płaszcza')`, matching legacy exactly. |

## 5. Frames / reinforcement

| Feature | Status | Notes |
|---|---|---|
| Three frame selectors, options | ✅ | `RAMKI_WL_OPTIONS`/`WYL`/`OD`. |
| Band rule validation (not auto-set) | ✅ | Ported per `REGULY_WALIDACJI.md` (`checkFrames()`). |
| Automatic frame auto-correct (legacy silently overrides too-narrow picks) | ➖ **(reverted)** | See §2 — superseded by this codebase's existing block+suggest validation pattern, kept as-is instead. |
| Reinforcement dropdown (`standard/0/1/2/3/krzyżowe`) | ✅ | `WZMOCNIENIE_OPTIONS`. |
| Sealing class A/B, disabled in chemo | ✅ | `KLASA_SZCZELNOSCI_OPTIONS`, `disabled={isChemo}` in `PropertiesPanel.tsx`. |

## 6. KOT compliance

| Feature | Status | Notes |
|---|---|---|
| KOT check scope (QDa only, Ocynk/Średnio/B) | ✅ | Deliberate 1:1 port including the legacy limitation — `calculateKot()`/`KOT_SHAPES` in `calculations.ts`, comments cite `Form1.cs`. |
| KOT indicator (colored, tooltip) | ✅ | `KotInfo.tsx`. |
| KOT report/export | ➖ | Legacy doesn't have one either (audit confirms "NOT FOUND") — nothing to port. |

## 7. Grid / element list management

| Feature | Status | Notes |
|---|---|---|
| Add / Edit / Remove | ✅ | `handleAdd`/edit-in-place/remove in `App.tsx`. |
| Insert after (Wstaw za …) | ✅ | `handleInsertAfter` (`App.tsx:805`). |
| Auto-increment designation | ✅ | `advanceOznaczenie` (`App.tsx:595`). |
| Replace-by-designation with Yes/No confirm on symbol mismatch | ✅ **(implemented this session)** | `addOrReplaceRow()` in `App.tsx`, used by `handleAdd`'s fresh-add path (both the standard and user-element branches). Note: while re-reading the exact legacy source for this (`Form1.cs:29454-29467`), found the audit's claim that "the original quantity is preserved" on replace doesn't hold up — legacy sets `k.sztuk = lista[i].sztuk` inside the loop but then unconditionally overwrites it with the form's current quantity right after (`k.sztuk = textBox19.Text`), so the old quantity is never actually kept. The port matches what the code *does* (uses the new form's quantity), not the incorrect claim. Not wired into `handleInsertAfter` (a rarer compound case: Insert-After + duplicate designation). |
| Computed total area column (`PowierzchniaCalkowita`) | ✅ (different UI) | Shown as the grid's `Suma` (m2 × sztuk) column and the footer `Suma m²` total — legacy only exposed this in the hidden export grid, so React actually surfaces it better. |
| Undo, bulk ops, filtering, sorting | ⚠️ | React adds shape-list filtering (`ShapeList.tsx` filter box) which legacy didn't have; neither side has undo/bulk-ops/grid sorting. |

## 8. Surface area & summary report

| Feature | Status | Notes |
|---|---|---|
| Per-shape area formulas | ✅ | `calculations.ts` — all 28 `rozwiniecie_*` functions ported from `Blacha.cs`. |
| Min.m2 floor per piece | ✅ | `App.tsx` `minM2`, applied via `Math.max(area, minM2)` at every add site. |
| Ocynk/Kwasówka/Aluminium in summary | ✅ | Confirmed symmetric in both legacy and React. |
| Chemo materials (PVC/PP/PPs/PE) in summary | ✅ **(just added this session)** | Legacy never had this either — genuine enhancement, not a port. Verified live in-browser. |
| "Kanały Kwasówka 1500" special counter | ✅ | `App.tsx:165-168`, matches legacy's Kwasówka-only behaviour (including that Ocynk/Aluminium 1500mm channels are never counted — a legacy quirk faithfully preserved). |
| "Izolacja bez płaszcza" 30/50/100mm totals | ✅ **(fixed this session)** | Was dead in practice because `powierzniaIz` was never computed (now is — see §1/§4). While verifying it live, also found and fixed a real bug in the aggregation itself: it summed the per-piece `powierzniaIz` without multiplying by quantity (`src/App.tsx` — the `izArea` calc), undercounting for qty > 1. This bug exists in the legacy app too (`Form1.cs:30149-30157` has the same missing `* sztuk`) — fixed rather than faithfully replicated, consistent with every other total in the same report already scaling by quantity. |
| Panel title | ✅ **(just renamed this session)** | "Suma blachy" → "Powierzchnia". |

## 9. File I/O

| Feature | Status | Notes |
|---|---|---|
| Encrypted save/load, same key/format | ✅ | `src/legacyFormat/crypto.ts` — AES with literal `"dupazbit"` key/IV, byte-for-byte compatible; `xml.ts` mirrors the field list. Tested (`legacyFormat/__tests__/`). |
| "Eksportuj" (tab-separated clipboard-as-.xls dump) | ✅ **(implemented, modernized)** | `handleExport()` in `App.tsx` — a real, openable `.csv` (RFC 4180 quoting) with the grid's key columns, downloaded directly. Deliberately not a faithful port of the clipboard-hack-then-mislabeled-.xls mechanism — same practical capability (bulk tabular dump of the whole grid), delivered properly. |
| Real import (CSV/XLS/DXF) | ➖ | Legacy doesn't have this either. |

## 10. 2D / 3D preview

| Feature | Status | Notes |
|---|---|---|
| Live dimensioned 2D drawing | ✅ **(re-ported 2026-09-17, shape by shape)** | `ShapeDiagram.tsx` — every one of the 28 renderers is now a port of the matching `if (symbol == "…")` GDI block in `Form1.cs` (same views, same layout, same flange lines, same dimension placement), drawn as SVG with the app's dimension style. Before this pass most renderers were independent designs (mirrored bends, plain cross-sections instead of the legacy end views, different L/h/m semantics on the reducers). Deliberate deviations, each noted in the renderer's comment: legacy label/variable swaps are resolved to the on-screen labels (QBRa/QBR1a, TR1a/TR2a/CZ1a/CZ2a, TR4a, QD1a/QD2a, TR3a); TR3a's outer contour uses the exact circle intersection instead of legacy's integer-angle approximation; TR6a adds a dotted pipe outline to the side view (legacy draws only the pipe's a/L dimensions there); the reducers' `b` dimension is drawn full height (legacy's stops 15px short); dimension lines shorter than 20 units drop their arrowheads (they overlapped into a dotted-looking blob). QBNa's end view is aligned to its plan view the way QDa/QBa are (box at the plan's top edge, face foreshortened by sin(alfa), extent down to the outlet flange) instead of legacy's box floated sin(alfa)·f above the baseline. Known legacy quirk kept as-is: QPR6a/QPR2a span the `L` dimension over m+L+h while PR1a/PR7a span L+h. |
| 3D preview | ✅ | `ShapeDiagram3D.tsx`, React-Three-Fiber based (vs. legacy's embedded OpenGL/CsGL). Rotate + zoom via orbit controls. |
| Legacy's exact left-drag vs right-drag-only-XZ distinction | ➖ | Not preserved — React uses standard orbit controls (arguably better UX); not worth matching legacy's quirk. |
| Drawing color customization (Kolory menu) | ✅ **(implemented, improved)** | Two color swatches above the 2D diagram (`App.tsx`) drive new `lineColor`/`backgroundColor` props on `ShapeDiagram.tsx` — all 336 hardcoded `stroke="#004290"` outline colors now read from the `lineColor` prop (default matches the app's brand blue; legacy's own default was plain `Color.Blue`). Unlike legacy, the choice persists across sessions (`localStorage`) — free improvement, no reason not to. |

## 11. Multi-language

| Feature | Status | Notes |
|---|---|---|
| Language coverage | ✅ (superset) | React ships 9 languages vs legacy's 5 (2 of which — RU/HU — were mostly broken duplicates of EN in `slownik.txt` per the audit). |
| Live switch, no restart required | ✅ (better) | Legacy requires an app restart; React switches immediately. |

## 12. Reports / printing

| Feature | Status | Notes |
|---|---|---|
| Surface summary report | ✅ | See §8. |
| Order header dialog (Nazwa/Zamawiający/Data) | ✅ **(implemented this session)** | `src/components/ProjectInfoDialog.tsx`, wired to the Toolbar button, persists to `Qnazwa`/`Qzamawia`/`Qdata` on save/load and to `localStorage` between sessions. |
| Printing / PDF / DXF / labels | ➖ | Legacy has none of these either (audit: zero hits for `PrintDocument`/`Drukuj`/`.pdf`/`.dxf`). |

## 13. Misc dialogs & settings

| Feature | Status | Notes |
|---|---|---|
| About box | ✅ **(implemented)** | `InfoDialog.tsx` (reused for both About and Help), opened via a small "i" button next to the logo. Shows the app name/branding instead of legacy's un-customized assembly metadata ("WindowsApplication1", "1.0.0.0") — more useful, not less faithful, since that metadata was never meaningful. |
| In-app manual/help text (Form4) | ✅ **(implemented)** | Same `InfoDialog.tsx`, opened via a "?" button, with the legacy help text ported from `Form4.resx` verbatim (not translated — matches legacy, which never ran this text through the dictionary either). One paragraph adjusted for accuracy: the 3D-rotation instructions describe this app's actual orbit-drag/scroll-zoom controls rather than legacy's left/right-drag distinction, which this port doesn't have (§10). |
| "Remember values" vs "reset on shape change" mode | ✅ **(implemented)** | A checkbox in `ShapeList.tsx` toggles `rememberValues` state in `App.tsx`; when on, `handleSelectShape` carries `a`/`b` over to the next shape instead of clearing all 17 fields. Scoped to a/b only (matching the literal legacy behavior at `Form1.cs:12157-12162`) — it doesn't also re-run a `sprawdz()`-equivalent auto-fill for the rest, since that function isn't ported (see below). |
| Demo/expiry timer, Form6/Form7 nag screens | ➖ | Dead code in legacy itself (commented out) — nothing to port. |
| Easter egg, hidden version shortcut | ➖ | Joke features, not worth porting. |

## 14. Other

| Feature | Status | Notes |
|---|---|---|
| Keyboard shortcuts (Enter/arrows/PgUp/PgDn) | ✅ **(implemented)** | See §2. |
| Logging/error reporting | ➖ | Legacy has none (empty catch blocks) — nothing to port; React's TS build + tests are already stricter than legacy ever was. |

## 15. Order-code ("pełny symbol") generation — second-pass findings (2026-09-17) — ✅ implemented

**Status: implemented.** `generateFullSymbol()` in `src/calculations.ts` now ports all
28 `PelnySymbol*` templates field-for-field (material letters C/K/A, `-I` insulation
marker, jacket-mismatch letter, `#thickness` non-standard marker, exact per-shape
dimension-block layout, `-WL`/`-WYL`/`-Kl.B`/`-Wzm.` suffixes, and the chemo
no-execution-letter format). Two legacy bugs were fixed rather than replicated
(QPR2a/PR7a's broken negative-number branch from a missing `{}`, and TR8a's harmless
duplicate-field print) — see the code comments for exact citations. One implementation
bug caught by tests along the way: the frame-suffix check initially used the same
"at least" comparison as the auto-upgrade effect, but legacy's `sprawdz_standard_ramek*()`
is an *exact* mismatch check — an oversized frame gets flagged in the symbol too, even
though it's never auto-corrected down. Covered by 20 new tests in `calculations.test.ts`
(QDa, QBNa, QBRa's swapped-index labels, TR3a's hardcoded constant, chemo mode, jacket
mismatch, thickness/frame suffix triggers). Verified live in-browser.

The first pass flagged this as "mostly done, missing a few suffixes." On a closer read of
all 29 `PelnySymbol*` methods (`Form1.cs:26730-27814`) plus their shared helper
`MaterialWSybolu()` (`Form1.cs:26762-26785`) and `Decoder.decodeSymbol()`
(`Class1.cs:9-13`), the gap is bigger: **the React `generateSymbol()` (`calculations.ts`)
is a simplified reimplementation, not a port** — it produces a plausible-looking but
differently-formatted code for every single shape. Since this order code is what a user
is meant to hand off to ALNOR for manufacturing (per the legacy in-app help text in
`Form4.resx`), the exact format is more than cosmetic.

Concretely, comparing `PelnySymbolQDa`/`PelnySymbolQBNa` (representative — the pattern is
consistent across all 29 methods) against `generateSymbol()`:

| Aspect | Legacy | React (`generateSymbol()`) |
|---|---|---|
| Material letter (blacha) | **`C`** (Ocynk), **`K`** (Kwasówka), **`A`** (Aluminium) | `OCY`, `KW`, `A` — Ocynk/Kwasówka codes don't match legacy at all |
| Insulated marker | Appends **`-I`** right after the material letter (e.g. `C-I`) when insulated | Not appended — insulation isn't reflected in the symbol at all |
| Jacket-material mismatch | If the jacket material differs from the core material, appends a **second** letter (`-C`/`-K`/`-A` for the jacket) | Not appended |
| Non-standard thickness | Prefixes the dimension block with **`#{thickness}`** when the selected thickness isn't the size-based standard (ties into the missing auto-thickness-standard comparison, §2) | Not appended |
| Dimension block | A **fixed, shape-specific template** in each shape's natural field order (e.g. QDa: `AxB-L`; QBNa: `AxB-E-F-R-Alfa`) | A **generic** `tab.filter(v > 0).join('-')` — dumps every non-zero stored value in array-storage order, which isn't always the same order or grouping as legacy's template |
| Frame/class/reinforcement suffixes | Appends `-WL{nn}` / `-WYL{nn}` when the current frame differs from the auto-computed standard (`sprawdz_standard_ramek1/2()` — same missing-auto-frame-selection gap as §5), `-Kl.B` when sealing class is B, `-Wzm.{n}` when reinforcement isn't "standard" | None of these are appended |
| RamkiOd (branch frame) suffix | **Dead even in legacy** — the `-OD{nn}` line is commented out (`Form1.cs:27701`) | N/A — correctly not worth porting |
| Chemo format | **No wykonanie letter at all** — just `Decoder.decodeSymbol()` → `"{material}-{grubosc}"` (e.g. `PVC-5`), then the same per-shape dimension template | Includes a `M`/`K` (Mufy/Kołnierze) letter that legacy's chemo symbol never has |

This was implemented — see the status line at the top of §15.

---

## Suggested implementation order — final status

Ranked by (user-visible impact) × (implementation cost). All ✅ as of the 2026-09-17
implementation round, except the one deliberate exclusion at the bottom.

1. ~~**Wire up the "Dane osobowe i opisowe" dialog**~~ — ✅ done.
2. ~~**Compute insulated-jacket geometry (`powierzniaIz`)**~~ — ✅ done.
3. ~~**Auto-suggest/upgrade sheet thickness as dimensions grow**~~ — ✅ done.
4. ~~**Replace-by-designation confirm**~~ — ✅ done.
5. ~~**Enforce execution lock for Kwasówka/Aluminium**~~ — ✅ done.
6. ~~**Fix the order-code ("pełny symbol") format**~~ — ✅ done (§15).
7. ~~**Frame auto-selection**~~ — attempted, then reverted: it conflicted with an existing, deliberate validation pattern and broke a passing e2e test (§5).
8. ~~**"Kołnierze"→P30 frame forcing for chemo**~~ — ✅ done (§3).
9. ~~**Keyboard shortcuts + mouse-wheel shape navigation**~~ — ✅ done (§2/§14).
10. ~~**"Remember values" toggle**~~ — ✅ done (§13).
11. ~~**"Eksportuj" export**~~ — ✅ done, modernized to real CSV (§9).
12. ~~**About box + help dialog**~~ — ✅ done (§13).
13. ~~**2D drawing color customization**~~ — ✅ done, with persistence (§10).
14. **Auto-fill of secondary dimensions (`sprawdz()`)** — deliberately not ported; see
    the status note at the top of this document for the reasoning. The one open item.

Items marked ➖ throughout are recommended to stay unported (legacy bugs, dead code, or
jokes) unless you say otherwise.

---

## Verification (2026-09-17 implementation round)

- `npx tsc --noEmit` — clean.
- `npx vitest run` — 154/154 unit tests passing (35 new, in `src/calculations.test.ts`,
  covering the symbol generator, insulated-area math, and the thickness/frame band
  logic).
- `npx playwright test` — 11/11 e2e tests passing. One (`relational range: TR1a...`)
  is pre-existing, low-frequency flaky test infrastructure unrelated to this round —
  confirmed by running it 20× against the pre-session code (`88dde2a`) and seeing the
  same intermittent failure there too.
- `npx eslint` — no new warnings/errors; a handful of pre-existing ones in
  `ShapeDiagram.tsx`/`calculations.ts` (unused-var / prefer-const) predate this session
  and were left alone as out of scope.
- Every feature in this round was also driven live in a running browser via Playwright
  and visually confirmed, not just unit-tested.
