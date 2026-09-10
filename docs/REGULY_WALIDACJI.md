# Reguły walidacji wymiarów kształtek

## 1. Wprowadzenie

Dokument opisuje reguły walidacji wymiarów wprowadzanych dla każdej kształtki
w aplikacji AlnorCAM (React).

### Skąd pochodzą reguły

Reguły są portem sprawdzeń z aplikacji „legacy” (.NET WinForms,
`AlnorIzoChemoUpdate_repo/AlnorCAM/projekto/Form1.cs`). W oryginale walidacja
jest rozproszona w blokach `if (symbol == "<SYMBOL>")` oraz w metodach
pomocniczych:

| Metoda .NET | Zakres | Odpowiednik w module |
|---|---|---|
| `CheckComboBox3` | zakres boku wg materiału | `sideRange()` |
| `sprawdz_Pormien` | reguła promienia formowanego | `radiusRule()` |
| `SprawdzEiF` | minimalne `e` / `f` | `efMin()` |
| `sprawdz_standard_ramek1..3` | minimalna szerokość ramki | `checkFrames()` |
| `sprawdz_standard_blachy` | zalecana grubość blachy | `checkThickness()` |
| bloki `if (symbol == ...)` | ograniczenia relacyjne, zakres `L`, „zle dane!” | `RULES[symbol]` |

### Gdzie w kodzie

Cała logika znajduje się w osobnym module `src/validation/`:

```
src/validation/
  types.ts        typy publiczne (RuleViolation, ValidationContext, FieldBound, …)
  constants.ts    limity liczbowe (zakresy boków, długości, promienia, tabela blach)
  factories.ts    fabryki reguł wspólnych (required, sideRange, lengthRange, radiusRule, efMin, alfaRange, relation) — każda wystawia też bounds()
  properties.ts   sprawdzenia „property” (ramka, grubość blachy)
  registry.ts     lista reguł dla każdego z 28 symboli (RULES)
  constraints.ts  fieldConstraints(symbol, values, ctx) — efektywne min/max na pole
  index.ts        validateShape(symbol, values, ctx) — publiczne wejście
  __tests__/      testy jednostkowe (Vitest)
```

### Ograniczenie zakresu w polach wejściowych

`fieldConstraints()` zbiera z reguł (`Rule.bounds`) efektywne `{ min, max }` dla
każdego pola przy bieżących wartościach pozostałych pól. `App.tsx` przekazuje to
do `DimensionInputs` jako `ranges`:

- pole pokazuje zakres jako szary podpis (`.dimension-range-hint`),
- wartość spoza zakresu jest przycinana do granicy w `onBlur`
  (`handleBlur` czyta żywą wartość z DOM, nie z propsów),
- strzałki i kółko myszy również respektują `min`/`max`.

Reguły bez sensownego zakresu liczbowego (`radiusRule` „0 lub ≥ 100”, relacje bez
`suggest`) nie wystawiają `bounds` — pozostają wyłącznie jako komunikat przy
„Dodaj”. Boundy relacyjne pojawiają się dopiero, gdy pola-argumenty są wypełnione
(`> 0`); nonsensowne `max` (poniżej `min` lub ujemne) są odrzucane.

Wywołanie:

```ts
import { validateShape } from './validation';

const wynik = validateShape('QDa', [50, 200, 500], {
  material: 'Ocynk',
  materialType: 'blacha',
  wykonanie: 'Niskociśnieniowe',
  blacha: '0,8',
  ramki: { wl: 'P20', wyl: 'P20', od: '' },
});
// wynik.dimensionErrors → [{ index: 0, message: 'Wartość a poza zakresem (100–4000 mm)', suggest: { min: 100, max: 4000 } }]
// wynik.valid → false
```

### Podpowiedzi w interfejsie („kliknij, aby wstawić”)

Każda reguła zakresowa zwraca pole `suggest: { min?, max? }`. Pod niepoprawnym
polem wymiaru pojawia się komunikat błędu oraz przyciski **`min <wartość>`** /
**`max <wartość>`**. Kliknięcie przycisku wstawia daną wartość graniczną do pola.
Zakres jest wyliczany dynamicznie — np. dla reguły `w ≤ L − 60` przycisk `max`
podpowie `L − 60` na podstawie aktualnie wpisanego `L`.

### Blokowanie przycisku „Dodaj”

Dodanie kształtki do zestawienia jest blokowane, gdy występuje dowolny błąd
wymiaru (`dimensionErrors`) lub błąd ramki. Uwaga o zalecanej grubości blachy
(`blacha.standard`) ma charakter **informacyjny** i nie blokuje dodania.

### Testy

- **Jednostkowe (Vitest):** `npm run test` — dla każdej kształtki zestaw
  wymiarów „poprawnych” nie generuje błędów, a każda reguła ma przypadek
  łamiący ją (z weryfikacją `ruleId` i podpowiadanego zakresu).
- **E2E (Playwright):** `npm run test:e2e` — sprawdza integrację z aplikacją:
  błąd pojawia się po „Dodaj”, dodanie jest zablokowane, a kliknięcie
  przycisku podpowiedzi wstawia poprawną wartość.

---

## 2. Reguły wspólne

W poniższej tabeli `bok` oznacza `a` lub `b` (dla niektórych kształtek również
`c`, `d`, `d1`, o ile są bokami kanału prostokątnego).

| Reguła (`ruleId`) | Warunek poprawności | Komunikat | Podpowiedź |
|---|---|---|---|
| `required.<i>` | każde pole wymiaru wypełnione | „Pole wymagane” | — |
| `nonZero.<i>` | kluczowe wymiary `> 0` (odpowiednik „zle dane!”) | „Wartość `x` musi być większa od 0” | `min 1` |
| `<bok>.side.range` | `100 ≤ bok ≤` **4000** (Ocynk) / **2501** (Kwasówka, Aluminium) | „Wartość `x` poza zakresem (100–4000 mm)” | `min` / `max` |
| `<L>.range` | `L` w oknie właściwym dla kształtki (patrz sekcja 3); w trybie „chemo” dla QDa `L ≤ 1500` | „Wartość `L` poza zakresem (…–… mm)” | `min` / `max` |
| `r.range` | promień `r = 0` **lub** `r ≥ 100` | „Promień musi być równy 0 lub co najmniej 100 mm” | `min 100` |
| `<e/f>.efMinNoRadius` | przy `r = 0` wartości `e` i `f` `≥ 50` | „Przy promieniu 0 wartość `e` musi być ≥ 50 mm” | `min 50` |
| `<e/f>.efMin` | `e`, `f` `≥ 30` (bez promienia) albo `≥ r + 30` (z promieniem) | „Zbyt mała wartość `e` (min. 30 mm)” | `min` |
| `<alfa>.alfa.range` | `15 ≤ alfa ≤ 90` (dot. QBNa, QBRa, QBR1a) | „Kąt `alfa` musi mieścić się w zakresie 15–90°” | `min 15` / `max 90` |
| `ramkiWL/WYL/Od.frame.min` | ramka nie węższa niż: `≤1000 → P20`, `1001–2500 → P30`, `≥2501 → P40` (wg największego boku) | „Za wąska ramka — minimum P30 …” | przycisk `Ustaw P30` pod polem (`PropertiesPanel`, `renderRamka`) |
| `blacha.standard` *(informacyjnie)* | grubość blachy zgodna z tabelą KOT dla pasma boku / materiału / wykonania | „Zalecana grubość blachy dla boku 300 mm to 0,6 mm” | — |

### Tabela zalecanych grubości blachy (`sprawdz_standard_blachy`)

| Materiał | Wykonanie | Bok 100–500 | 501–1000 | 1001–2000 | 2001–4000 |
|---|---|---|---|---|---|
| Ocynk | Niskociśnieniowe | 0,6 | 0,8 | 1,0 | 1,1 |
| Ocynk | Średniociśnieniowe | 0,7 | 0,9 | 1,1 | 1,2 |
| Kwasówka | — | 0,6 (100–1000) | 0,8 (1001–2501) | — | — |
| Aluminium | — | 0,8 (100–2501) | — | — | — |

---

## 3. Reguły dla poszczególnych kształtek

Każda sekcja podaje kolejność wymiarów (zgodną z polami w aplikacji), listę
reguł oraz przykładowy poprawny zestaw wymiarów.

> Nazewnictwo `a`/`b` w kodzie .NET bywa zamienione względem etykiet na ekranie —
> reguły relacyjne poniżej są zapisane w kategoriach **etykiet widocznych dla
> użytkownika** i każda ma test jednostkowy z przypadkiem łamiącym.

### QDa — Kanał prostokątny
Wymiary: `a, b, L`
- `a`, `b`: zakres boku (100–4000 / 2501)
- `L`: zakres **100–20000** mm (chemo: **≤ 1500**)
- `a, b, L > 0`
- Przykład poprawny: `a=300, b=200, L=500`

### QBa — Łuk symetryczny
Wymiary: `a, b, e, f, r`
- `a`, `b`: zakres boku
- `r`: reguła promienia (0 lub ≥ 100)
- `e`, `f`: `≥ 30`; przy `r = 0` dodatkowo `≥ 50`
- `a, b, e, f > 0`
- Przykład poprawny: `a=300, b=200, e=50, f=50, r=0`

### QBNa — Łuk symetryczny (z kątem)
Wymiary: `a, b, e, f, r, alfa`
- jak QBa, oraz
- `alfa`: zakres 15–90°
- Przykład poprawny: `a=300, b=200, e=50, f=50, r=0, alfa=60`

### QPR6a — Redukcja sym.
Wymiary: `a, b, c, d, L, h, m`
- `a`, `b`: zakres boku
- `L`: zakres **100–5000** mm
- `a, b, c, d, L > 0`
- Przykład poprawny: `a=300, b=200, c=250, d=180, L=500, h=30, m=30`

### PR1a — Redukcja kwadrat‑koło sym.
Wymiary: `a, b, d, L, h, m`
- `a`, `b`: zakres boku
- `L`: zakres **250–5000** mm
- `a, b, d, L > 0`
- Przykład poprawny: `a=300, b=200, d=150, L=500, h=30, m=30`

### PR7a — Redukcja kwadrat‑koło asym.
Wymiary: `a, b, d, L, e, f, h, m`
- `a`, `b`: zakres boku
- `L`: zakres **250–5000** mm
- `a, b, d, L > 0` (`e`, `f` to mimośrody — mogą być ujemne)
- Przykład poprawny: `a=300, b=200, d=150, L=500, e=50, f=50, h=30, m=30`

### QPR2a — Redukcja asym.
Wymiary: `a, b, c, d, L, h, m, e, f`
- `a`, `b`: zakres boku
- `L`: zakres **100–5000** mm
- `a, b, c, d, L > 0`
- Przykład poprawny: `a=300, b=200, c=250, d=180, L=500, h=30, m=30, e=50, f=50`

### QBRa — Łuk redukcyjny
Wymiary: `a, d, b, e, f, r, alfa`
- `a`, `b`: zakres boku
- `r`: reguła promienia; `e`, `f`: `≥ 30` / `≥ 50` przy `r = 0`
- `alfa`: 15–90°
- **`b ≤ d`** — „«b» nie może być większe od «d»” (podpowiedź `max = d`)
- `a, b, e, f > 0`
- Przykład poprawny: `a=300, d=200, b=180, e=50, f=50, r=0, alfa=60`

### QBR1a — Łuk dyfuzorowany
Wymiary: `a, d, c, b, e, f, r, g, alfa`
- `a`, `b`: zakres boku
- `r`: reguła promienia; `e`, `f`: `≥ 30`
- `alfa`: 15–90°
- **`b ≤ d`** — „Wymiar d musi być większy niż b” (podpowiedź `max = d`)
- `a, b, e, f > 0`
- Przykład poprawny: `a=300, d=250, c=200, b=180, e=50, f=50, r=0, g=100, alfa=60`

### QBFRa — Kolano redukcyjne
Wymiary: `a, b, d, e, f, r`
- `a`, `b`: zakres boku
- `r`: reguła promienia; `e`, `f`: `≥ 30` / `≥ r + 30`
- **`d ≥ b`** — „«b» nie może być większe od «d»” (podpowiedź `max = d`)
- `a, b, e, f > 0`
- Przykład poprawny: `a=300, b=200, d=250, e=50, f=50, r=0`

### QBFa — Kolano symetryczne
Wymiary: `a, b, e, f, r`
- jak QBa
- Przykład poprawny: `a=300, b=200, e=50, f=50, r=0`

### QESa — Zaślepka prostokątna
Wymiary: `a, b, e`
- `a`, `b`: zakres boku
- `a, b, e > 0`
- Przykład poprawny: `a=300, b=200, e=50`

### TR1a — Trójnik z odej. prostokątnym
Wymiary: `a, b, d, w, L, e, f, l3`
- `a`, `b`: zakres boku
- `L`: zakres 100–20000 mm
- **`d ≤ b`** — „Wymiar b musi być większy lub równy d” (podpowiedź `max = b`)
- **`w ≤ L − 60`** — „Zbyt duży wymiar w (max …)” (podpowiedź `max = L − 60`)
- `a, b, L > 0`
- Przykład poprawny: `a=250, b=300, d=140, w=180, L=500, e=50, f=50, l3=80`

### TR2a — Trójnik z odej. okrągłymi
Wymiary: `a, b, d, L, l3, e, f`
- `a`, `b`: zakres boku
- `L`: zakres 100–20000 mm
- **`d ≤ b` oraz `d ≤ L − 60`** — „Zbyt duże d (max …)”
- `a, b, L > 0`
- Przykład poprawny: `a=300, b=250, d=140, L=500, l3=80, e=50, f=50`

### TRa — Trójnik symetryczny
Wymiary: `a, b, d, h, L, q, r, i, p`
- `a`, `b`: zakres boku
- `L`: zakres 100–20000 mm
- `r`, `q`: reguła promienia (0 lub ≥ 100)
- **`d ≤ b`** — „b musi być większe lub równe d”
- **`L ≥ h + q + r + i + 30`** — „Zbyt małe L (min. …)” (podpowiedź `min`)
- `a, b, L > 0`
- Przykład poprawny: `a=300, b=250, d=200, h=100, L=800, q=100, r=100, i=100, p=100`

### QPR3a — Odsadzka sym.
Wymiary: `a, b, e, L, m, h`
- `a`, `b`: zakres boku; `L`: 100–20000 mm; `a, b, L > 0`
- Przykład poprawny: `a=300, b=200, e=100, L=500, m=30, h=30`

### QPR4a — Odsadzka asym.
Wymiary: `a, b, d, e, L, m, h`
- `a`, `b`: zakres boku; `L`: 100–20000 mm; `a, b, d, L > 0`
- Przykład poprawny: `a=300, b=200, d=150, e=100, L=500, m=30, h=30`

### TR6a — Nakładka na rurę
Wymiary: `a, e, f, L, g`
- `a`: zakres boku
- `L`: zakres 100–20000 mm
- **`f ≤ a`** — „Zbyt duże f (max …)” (podpowiedź `max = a`)
- **`L ≥ e + 100`** — „Zbyt małe L (min. …)” (podpowiedź `min = e + 100`)
- `a, L > 0`
- Przykład poprawny: `a=400, e=100, f=200, L=500, g=100`

### CZ1a — Czwórnik z odej. prostokątnym
Wymiary: `a, b, d, w, L, d1, w1, e1, f1, e, f, l3, l4`
- `a`, `b`: zakres boku; `L`: 100–20000 mm
- **`b ≥ d` oraz `b ≥ d1`** — „Wymiar b musi być większy lub równy d / d1”
- **`L ≥ max(w, w1) + 60`** — „Zbyt małe L (min. …)”
- `a, b, L > 0`
- Przykład poprawny: `a=200, b=250, d=140, w=90, L=500, d1=140, w1=90, e1=250, f1=110, e=250, f=110, l3=80, l4=80`

### CZ2a — Czwórnik z odej. okrągłymi
Wymiary: `a, b, d, L, d1, e1, f1, e, f, l3, l4`
- `a`, `b`: zakres boku; `L`: 100–20000 mm
- **`b ≥ d` oraz `b ≥ d1`**
- **`L ≥ max(d, d1) + 60`** — „Zbyt małe L (min. …)”
- `a, b, L > 0`
- Przykład poprawny: `a=200, b=250, d=140, L=500, d1=140, e1=250, f1=110, e=250, f=110, l3=80, l4=80`

### TR3a — Trójnik orłowy
Wymiary: `a, b, c, d, m, k, i, j, g, f`
- `a`, `b`: zakres boku
- `g`, `f`: reguła promienia (0 lub ≥ 100)
- `a, b, g, f > 0`
- Przykład poprawny: `a=500, b=300, c=300, d=200, m=100, k=100, i=100, j=100, g=150, f=150`

### TR4a — Trójnik z od. łukowym
Wymiary: `a, b, c, d, L, g, i, j`
- `a`, `b`: zakres boku
- `g`: reguła promienia; `i`, `j`: `≥ 30`
- **`a ≥ c`** — „a musi być większe lub równe c” (podpowiedź `max = a`)
- **`L ≥ d + g + 60 + i`** (chyba że `L = 100`) — „Zbyt małe L (min. …)”
- `a, b, i, j > 0`
- Przykład poprawny: `a=300, b=300, c=250, d=200, L=800, g=150, i=50, j=50`

### TR5a — Trójnik portkowy
Wymiary: `a, b, c, d, e, L, h, g, i, j, k`
- `a`, `b`: zakres boku; `L`: 100–20000 mm; `a, b, L > 0`
- Przykład poprawny: `a=300, b=250, c=200, d=200, e=100, L=600, h=100, g=100, i=50, j=50, k=50`

### QD1a — Kanał prost. skośny
Wymiary: `a, b, L, alfa, e, f`
- `a`, `b`: zakres boku
- `e`, `f`: `≥ 30`
- `a, b, e, f, L > 0`
- Przykład poprawny: `a=300, b=200, L=500, alfa=60, e=50, f=50`

### QD2a — Kanał prostopadły
Wymiary: `a, b, L, e, f`
- `a`, `b`: zakres boku; `L`: 100–20000 mm; `a, b, L > 0`
- Przykład poprawny: `a=300, b=200, L=500, e=50, f=50`

### TR7a — Trójnik skośny
Wymiary: `a, b, d, h, e, r, q, i, j, p`
- `a`, `b`: zakres boku
- `r`, `q`: reguła promienia (0 lub ≥ 100)
- `i`, `j`: `≥ 30`
- **`b < d`** — „«d» musi być większe od «b»” (podpowiedź `max = d − 1`)
- `a, b, i, j > 0`
- Przykład poprawny: `a=300, b=180, d=250, h=100, e=100, r=100, q=100, i=50, j=50, p=100`

### TR8a — Trójnik sk. współosiowy (odej. prostokątne)
Wymiary: `a, b, c, d, w, g, l, l3, m, n, e, f, i=j`
- `a`, `b`: zakres boku; `l`: zakres 100–20000 mm
- **`w ≤ l − 60`** — „Zbyt duży wymiar w (max …)”
- **`g < d`** — „g musi być mniejsze niż d” (podpowiedź `max = d − 1`)
- `a, b, l > 0`
- Przykład poprawny: `a=300, b=250, c=300, d=250, w=150, g=100, l=500, l3=100, m=100, n=100, e=100, f=100, i=j=100`

### TR9a — Trójnik sk. współosiowy (odej. okrągłe)
Wymiary: `a, b, c, d, d1, l, l3, m, n, e, f, i, j`
- `a`, `b`: zakres boku; `l`: zakres 100–20000 mm
- **`d1 ≤ l − 60`** — „Wartość d1 poza zakresem (max …)”
- **`d1 < d`** — „d1 musi być mniejsze niż d”
- **`d1 < b`** — „d1 musi być mniejsze niż b”
- `a, b, l > 0`
- Przykład poprawny: `a=300, b=250, c=300, d=250, d1=150, l=500, l3=100, m=100, n=100, e=100, f=100, i=100, j=100`

---

## 4. Rozszerzanie modułu

Nowa reguła wspólna → fabryka w `src/validation/factories.ts`.
Nowa reguła kształtki → dopisanie do listy w `BUILDERS` w
`src/validation/registry.ts` + test w `src/validation/__tests__/rules.test.ts`
(przypadek poprawny i łamiący). Zmiana limitu → `src/validation/constants.ts`.
Po zmianie: `npm run test && npm run build && npm run test:e2e`.
