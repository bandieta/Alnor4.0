# Legacy (.NET WinForms) → React feature parity

Source of the legacy catalog: `AlnorIzoChemoUpdate/AlnorCAM/projekto/Form1.cs` (+ Form2‑7,
`ksztaltka.cs`, `Blacha.cs`, `DictionariesManager.cs`, `gridclass.cs`, `thicknessCalc.cs`).
Legacy behaviour was reverse-engineered directly from that code (line refs below); the
React side was checked against the current `src/` tree on 2026-09-16.

Status legend: ✅ implemented · ⚠️ partial/behaves differently · ❌ missing · ➖ legacy bug/dead
code/joke feature, intentionally not worth porting.

**Original short answer: no, not everything was implemented.** As of this session, the
top 5 ranked gaps (see "Suggested implementation order" below) have all been closed:
the order-header dialog, insulated-jacket geometry + area, thickness auto-suggestion,
replace-by-designation confirm, and the Kwasówka/Aluminium execution lock. What's left
is the longer tail of lower-priority items (auto-fill of secondary dimensions, keyboard
shortcuts, frame auto-selection, the "Eksportuj" tabular dump, remember-values toggle,
about box, help dialog) — all itemized below, none currently scheduled.

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
| Auto-generated "pełny symbol" (order code) | ⚠️ | `generateSymbol()` (`calculations.ts:238`) covers material/wykonanie/dims; legacy also appends jacket-material letter, `#thickness` (non-standard marker), and non-default frame/class/reinforcement suffixes (`-WL30`, `-Kl.B`, `-Wzm.2`). Those extra suffixes are **not** appended in the React symbol. |

## 2. Dimension input & auto-fill

| Feature | Status | Notes |
|---|---|---|
| Range/relational validation rules | ✅ | Deliberately ported, documented in `docs/REGULY_WALIDACJI.md`. |
| **Auto-fill of secondary dimensions as user types a/b** (`sprawdz()`, ~2100 lines) | ❌ | Not present. React only *suggests* a min/max via `fieldConstraints()`/hint chips — it never silently writes e/f/r/h/... the way legacy does. This is the single biggest UX behavioural difference for a legacy user (arguably an improvement — no silent mutation — but it is a missing capability if faithful parity is the goal). |
| Thickness auto-upgrade with warning (`zmien_blache_komunikat`) | ✅ **(implemented this session)** | `blachaBandStandard()`/`isBlachaThicknessAtLeast()` in `calculations.ts`, wired into `App.tsx` (an effect keyed on side/material/wykonanie, plus the Blacha dropdown's own change handler) with a "Grubość blachy za mała!" toast. Note: the pre-existing `calculateThickness()` in `calculations.ts` is a **different** function — it's the legacy's own *chemo* pipe-thickness calculator (`ThicknessCalc.CalculateThikness`), itself dead/unused in the legacy app too; not the same as the Ocynk/Kwasówka/Aluminium band logic this item ports. Along the way, fixed a related gap: `BLACHA_OPTIONS` (`data.ts`) was missing `'1,2'` (the Ocynk/Średniociśnieniowe top-band thickness), so it's been added. Covered by `src/calculations.test.ts`. |
| Silent clamping of e/f to 30mm | ❌ | Not implemented — out of scope for this pass. |
| "Nie zmieniaj blachy" lock checkbox | ➖ | Moot — no auto-thickness logic exists yet to lock. |
| Automatic frame (Ramki) selection by side size | ❌ | Options exist (`RAMKI_WL_OPTIONS` etc.) and validation flags an undersized frame, but nothing auto-*sets* P20/P30/P40 as legacy does; user must pick correctly themselves. |
| Numeric input filter on keypress | ✅ (better than legacy) | `DimensionInputs.tsx:109` filters non-numeric keys; legacy has **no** filter at all (§2 of the audit — a legacy bug). |
| Enter = Add, ↑/↓ = field navigation, PgUp/PgDn = shape navigation | ❌ | None of these keyboard shortcuts exist in the React app. |
| Mouse wheel over shape list changes selection | ❌ | Not implemented — wheel just scrolls the list normally. |

## 3. Material & thickness system

| Feature | Status | Notes |
|---|---|---|
| 3 sheet materials, dynamic thickness list per material+execution | ✅ | `data.ts` `MATERIAL_OPTIONS`/`BLACHA_OPTIONS`. |
| Execution forced to Niskociśnieniowe + disabled for Kwasówka/Aluminium | ✅ **(implemented this session)** | `handleMaterialChange` in `App.tsx` forces `wykonanie` when material changes; `PropertiesPanel.tsx` disables the Wykonanie select whenever `material !== 'Ocynk'` (blacha mode). |
| Chemo materials/thicknesses/execution | ✅ | `MATERIAL_CHEMO_OPTIONS`, `GRUBOSC_CHEMO_OPTIONS`, `WYKONANIE_CHEMO_OPTIONS` — matches legacy exactly. |
| "Kołnierze" (chemo) forces all frames to P30 | ❌ | Not implemented — chemo frames stay disabled/default regardless of Mufy vs Kołnierze. |

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
| Automatic frame auto-correct (legacy silently overrides too-narrow picks) | ❌ | React only flags via validation; doesn't auto-correct. |
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
| "Eksportuj" (tab-separated clipboard-as-.xls dump) | ❌ | Not implemented at all — no equivalent bulk/tabular export exists in the React app. |
| Real import (CSV/XLS/DXF) | ➖ | Legacy doesn't have this either. |

## 10. 2D / 3D preview

| Feature | Status | Notes |
|---|---|---|
| Live dimensioned 2D drawing | ✅ | `ShapeDiagram.tsx` (5700+ lines) — full custom implementation, not a port of the bitmap drawer but functionally equivalent/better (vector, always in sync). |
| 3D preview | ✅ | `ShapeDiagram3D.tsx`, React-Three-Fiber based (vs. legacy's embedded OpenGL/CsGL). Rotate + zoom via orbit controls. |
| Legacy's exact left-drag vs right-drag-only-XZ distinction | ➖ | Not preserved — React uses standard orbit controls (arguably better UX); not worth matching legacy's quirk. |
| Drawing color customization (Kolory menu) | ❌ | Not implemented — no way to change 2D canvas/pen colors. Low value (legacy didn't persist it either). |

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
| About box | ⚠️ | Not checked in this pass — no `AboutBox`-equivalent component found in `src/components/`. Likely missing; low priority (legacy's was an un-customized template anyway). |
| In-app manual/help text (Form4) | ❌ | No equivalent help dialog in React. |
| "Remember values" vs "reset on shape change" mode | ❌ | Not implemented — React always resets fields on shape change; legacy offers a toggle to carry a/b over. |
| Demo/expiry timer, Form6/Form7 nag screens | ➖ | Dead code in legacy itself (commented out) — nothing to port. |
| Easter egg, hidden version shortcut | ➖ | Joke features, not worth porting. |

## 14. Other

| Feature | Status | Notes |
|---|---|---|
| Keyboard shortcuts (Enter/arrows/PgUp/PgDn) | ❌ | See §2. |
| Logging/error reporting | ➖ | Legacy has none (empty catch blocks) — nothing to port; React's TS build + tests are already stricter than legacy ever was. |

---

## Suggested implementation order

Ranked by (user-visible impact) × (implementation cost):

1. ~~**Wire up the "Dane osobowe i opisowe" dialog**~~ — ✅ done.
2. ~~**Compute insulated-jacket geometry (`powierzniaIz`)**~~ — ✅ done.
3. ~~**Auto-suggest/upgrade sheet thickness as dimensions grow**~~ — ✅ done.
4. ~~**Replace-by-designation confirm**~~ — ✅ done.
5. ~~**Enforce execution lock for Kwasówka/Aluminium**~~ — ✅ done.
6. Remaining, lower priority / judgment calls: auto-fill of secondary dimensions (arguably better left as-is — auto-mutation was a legacy pain point per `Moje uwagi.txt`), keyboard shortcuts, frame auto-selection, "Eksportuj" tabular dump, remember-values toggle, about box, help dialog.

All five items from this list are now implemented.

Items marked ➖ throughout are recommended to stay unported (legacy bugs, dead code, or
jokes) unless you say otherwise.
