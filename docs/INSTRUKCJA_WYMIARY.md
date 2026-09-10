# Wprowadzanie wymiarów — instrukcja dla użytkownika

Program sprawdza wymiary każdej kształtki podczas jej dodawania do zestawienia.
Jeśli wymiary są niepoprawne, dodanie zostaje wstrzymane, a pole z błędem
podświetla się na czerwono. Ta instrukcja wyjaśnia, co oznaczają poszczególne
komunikaty i jak je szybko poprawić.

---

## 1. Ograniczenie zakresu w polach

Każde pole wymiaru, które ma określony zakres, pilnuje go automatycznie:

- **Wartość spoza zakresu jest korygowana** po opuszczeniu pola (klawisz Tab lub
  kliknięcie w inne miejsce): za mała wartość „podskakuje” do minimum, za duża
  „spada” do maksimum. Nie da się więc zostawić w polu wartości spoza zakresu.
- **Strzałki i przewijanie kółkiem myszy** też zatrzymują się na granicach
  zakresu.
- Po najechaniu kursorem na pole pojawia się dymek **„Dozwolony zakres: …”**.
- Zakresy **zależne od innych wymiarów** (np. `d ≤ b`, `w ≤ L − 60`,
  `L ≥ h + q + r + i + 30`) zaczynają obowiązywać po wpisaniu tych wymiarów
  i są przeliczane na bieżąco.

Reguły, których nie da się zapisać jako prosty zakres (promień „0 lub ≥ 100”,
minimalne `L` liczone z odejść, zależności `b`/`d`), nadal są sprawdzane przy
dodawaniu — patrz niżej.

## 2. Jak wygląda błąd i jak go poprawić

Po kliknięciu **Dodaj** (lub **Zapisz** podczas edycji):

1. Pole z niepoprawną wartością zostaje obramowane na **czerwono**.
2. Pod polem pojawia się **czerwony komunikat** z opisem problemu.
3. Jeśli reguła ma określony zakres, obok komunikatu widać **przyciski
   podpowiedzi**:
   - **`min <wartość>`** — wstawia najmniejszą dopuszczalną wartość,
   - **`max <wartość>`** — wstawia największą dopuszczalną wartość.

   Wystarczy kliknąć przycisk, aby program wpisał tę wartość do pola.
   Zakres jest liczony na bieżąco — np. dla reguły „`w` nie większe niż `L − 60`”
   przycisk `max` podpowie wartość wyliczoną z aktualnie wpisanego `L`.

4. Po poprawieniu wszystkich pól kliknij **Dodaj** ponownie — kształtka trafi do
   zestawienia.

**Pola ramek (RamkiWL / RamkiWYL / RamkiOd)** działają tak samo: pod polem
pojawia się czerwony komunikat z regułą oraz przycisk **`Ustaw P30`**
(z minimalną dopuszczalną ramką dla danego boku). Kliknięcie ustawia tę wartość
na liście rozwijanej. Szerszą ramkę zawsze można wybrać ręcznie.

> **Uwaga o grubości blachy.** Komunikat „Zalecana grubość blachy dla boku …”
> to tylko podpowiedź zgodna ze standardem — **nie blokuje** dodania kształtki.
> Wszystkie pozostałe błędy wymiarów oraz zbyt wąska ramka blokują dodanie.

---

## 3. Komunikaty ogólne

| Komunikat | Co oznacza | Jak poprawić |
|---|---|---|
| **Pole wymagane** | Któreś z pól wymiarów jest puste. | Wypełnij wszystkie pola wymiarów danej kształtki. |
| **Wartość `a` poza zakresem (100–4000 mm)** | Bok kanału (`a`, `b`, a przy niektórych kształtkach też `c`, `d`) jest za mały lub za duży. Górna granica zależy od materiału: **Ocynk — 4000 mm**, **Kwasówka i Aluminium — 2501 mm**. | Kliknij `min 100` lub `max …`, albo wpisz wartość z podanego zakresu. Jeśli potrzebujesz większego boku — zmień materiał na Ocynk. |
| **Wartość `L` poza zakresem (…–… mm)** | Długość kształtki wykracza poza dopuszczalne okno (różne dla różnych kształtek — patrz sekcja 4). W trybie **chemia** długość kanału prostokątnego (QDa) jest ograniczona do **1500 mm**. | Skoryguj długość do podanego zakresu (przyciski `min` / `max`). |
| **Wartość `x` musi być większa od 0** | Wpisano `0` w polu, które musi mieć wartość dodatnią. | Wpisz wartość większą od zera. |
| **Promień musi być równy 0 lub co najmniej 100 mm** | Promień gięcia (`r`, a przy trójnikach formowanych też `q`) ma wartość z przedziału 1–99. | Ustaw `0` (kształtka bez zaokrąglenia) **albo** wartość ≥ 100. |
| **Przy promieniu 0 wartość `e` musi być ≥ 50 mm** | Gdy promień = 0, przedłużenia `e` i `f` muszą mieć co najmniej 50 mm. | Zwiększ `e` / `f` do min. 50 mm lub ustaw promień ≥ 100. |
| **Zbyt mała wartość `e` (min. … mm)** | Przedłużenie `e` / `f` jest za krótkie. Minimum to **30 mm** (przy ramce) lub **`r + 30` mm** (przy zadanym promieniu). | Zwiększ `e` / `f` do podanej wartości minimalnej. |
| **Kąt `alfa` musi mieścić się w zakresie 15–90°** | Kąt łuku / kolana jest poza zakresem. Dotyczy: QBNa, QBRa, QBR1a. | Wpisz kąt od 15 do 90 stopni. |
| **Za wąska ramka — minimum P30 …** | Wybrana ramka (WL / WYL / Odejścia) jest za wąska dla największego boku kanału: do 1000 mm → **P20**, 1001–2500 mm → **P30**, powyżej 2500 mm → **P40**. | Kliknij przycisk **`Ustaw P30`** pod polem albo wybierz z listy ramkę nie węższą niż podana. Szerszą można wybrać zawsze. |
| **Zalecana grubość blachy dla boku … to … mm** | Podpowiedź standardu — dobrana grubość blachy odbiega od zalecanej dla tego pasma boku, materiału i wykonania. | Możesz zmienić grubość na zalecaną. Komunikat **nie blokuje** dodania. |

### Zalecane grubości blachy

| Materiał | Wykonanie | Bok 100–500 | 501–1000 | 1001–2000 | 2001–4000 |
|---|---|---|---|---|---|
| Ocynk | Niskociśnieniowe | 0,6 | 0,8 | 1,0 | 1,1 |
| Ocynk | Średniociśnieniowe | 0,7 | 0,9 | 1,1 | 1,2 |
| Kwasówka | — | 0,6 (bok do 1000) | 0,8 (bok 1001–2501) | — | — |
| Aluminium | — | 0,8 (bok do 2501) | — | — | — |

---

## 4. Ograniczenia dla poszczególnych kształtek

Dla każdej kształtki podano: kolejność wymiarów (tak jak pola w programie),
warunki, które muszą być spełnione, oraz **przykładowy poprawny zestaw wymiarów**.

Skróty w warunkach: „bok w zakresie” = 100–4000 mm dla Ocynku, 100–2501 mm dla
Kwasówki i Aluminium. „Długość w zakresie” = 100–20000 mm, o ile nie podano
inaczej.

### Kanały

**QDa — Kanał prostokątny** · wymiary: `a, b, L`
- `a`, `b` — bok w zakresie; `L` — długość 100–20000 mm (chemia: do 1500 mm)
- `a`, `b`, `L` większe od 0
- Przykład: `a=300, b=200, L=500`

**QD1a — Kanał prostokątny skośny** · wymiary: `a, b, L, alfa, e, f`
- `a`, `b` — bok w zakresie; `e`, `f` ≥ 30 mm
- `a`, `b`, `e`, `f`, `L` większe od 0
- Przykład: `a=300, b=200, L=500, alfa=60, e=50, f=50`

**QD2a — Kanał prostopadły** · wymiary: `a, b, L, e, f`
- `a`, `b` — bok w zakresie; `L` — długość w zakresie
- `a`, `b`, `L` większe od 0
- Przykład: `a=300, b=200, L=500, e=50, f=50`

### Łuki i kolana

**QBa — Łuk symetryczny** · wymiary: `a, b, e, f, r`
- `a`, `b` — bok w zakresie
- `r` = 0 lub ≥ 100 mm
- `e`, `f` ≥ 30 mm; a gdy `r` = 0 — dodatkowo ≥ 50 mm
- `a`, `b`, `e`, `f` większe od 0
- Przykład: `a=300, b=200, e=50, f=50, r=0`

**QBNa — Łuk symetryczny z kątem** · wymiary: `a, b, e, f, r, alfa`
- warunki jak dla QBa, oraz `alfa` w zakresie 15–90°
- Przykład: `a=300, b=200, e=50, f=50, r=0, alfa=60`

**QBFa — Kolano symetryczne** · wymiary: `a, b, e, f, r`
- warunki jak dla QBa
- Przykład: `a=300, b=200, e=50, f=50, r=0`

**QBFRa — Kolano redukcyjne** · wymiary: `a, b, d, e, f, r`
- `a`, `b` — bok w zakresie; `r` = 0 lub ≥ 100 mm; `e`, `f` ≥ 30 mm (lub ≥ `r + 30`)
- **`d` nie mniejsze niż `b`** (komunikat: „«b» nie może być większe od «d»”)
- `a`, `b`, `e`, `f` większe od 0
- Przykład: `a=300, b=200, d=250, e=50, f=50, r=0`

**QBRa — Łuk redukcyjny** · wymiary: `a, d, b, e, f, r, alfa`
- `a`, `b` — bok w zakresie; `r` = 0 lub ≥ 100 mm; `e`, `f` ≥ 30 mm
- `alfa` w zakresie 15–90°
- **`b` nie większe niż `d`**
- `a`, `b`, `e`, `f` większe od 0
- Przykład: `a=300, d=200, b=180, e=50, f=50, r=0, alfa=60`

**QBR1a — Łuk dyfuzorowany** · wymiary: `a, d, c, b, e, f, r, g, alfa`
- `a`, `b` — bok w zakresie; `r` = 0 lub ≥ 100 mm; `e`, `f` ≥ 30 mm
- `alfa` w zakresie 15–90°
- **`b` nie większe niż `d`** (komunikat: „Wymiar d musi być większy niż b”)
- `a`, `b`, `e`, `f` większe od 0
- Przykład: `a=300, d=250, c=200, b=180, e=50, f=50, r=0, g=100, alfa=60`

### Redukcje

**QPR6a — Redukcja symetryczna** · wymiary: `a, b, c, d, L, h, m`
- `a`, `b` — bok w zakresie; `L` — długość **100–5000 mm**
- `a`, `b`, `c`, `d`, `L` większe od 0
- Przykład: `a=300, b=200, c=250, d=180, L=500, h=30, m=30`

**QPR2a — Redukcja asymetryczna** · wymiary: `a, b, c, d, L, h, m, e, f`
- `a`, `b` — bok w zakresie; `L` — długość **100–5000 mm**
- `a`, `b`, `c`, `d`, `L` większe od 0
- Przykład: `a=300, b=200, c=250, d=180, L=500, h=30, m=30, e=50, f=50`

**PR1a — Redukcja kwadrat‑koło symetryczna** · wymiary: `a, b, d, L, h, m`
- `a`, `b` — bok w zakresie; `L` — długość **250–5000 mm**
- `a`, `b`, `d`, `L` większe od 0
- Przykład: `a=300, b=200, d=150, L=500, h=30, m=30`

**PR7a — Redukcja kwadrat‑koło asymetryczna** · wymiary: `a, b, d, L, e, f, h, m`
- `a`, `b` — bok w zakresie; `L` — długość **250–5000 mm**
- `a`, `b`, `d`, `L` większe od 0 (`e`, `f` to mimośrody — mogą być ujemne)
- Przykład: `a=300, b=200, d=150, L=500, e=50, f=50, h=30, m=30`

### Odsadzki

**QPR3a — Odsadzka symetryczna** · wymiary: `a, b, e, L, m, h`
- `a`, `b` — bok w zakresie; `L` — długość w zakresie; `a`, `b`, `L` większe od 0
- Przykład: `a=300, b=200, e=100, L=500, m=30, h=30`

**QPR4a — Odsadzka asymetryczna** · wymiary: `a, b, d, e, L, m, h`
- `a`, `b` — bok w zakresie; `L` — długość w zakresie; `a`, `b`, `d`, `L` większe od 0
- Przykład: `a=300, b=200, d=150, e=100, L=500, m=30, h=30`

### Trójniki

**TR1a — Trójnik z odejściem prostokątnym** · wymiary: `a, b, d, w, L, e, f, l3`
- `a`, `b` — bok w zakresie; `L` — długość w zakresie
- **`d` nie większe niż `b`** (komunikat: „Wymiar b musi być większy lub równy d”)
- **`w` nie większe niż `L − 60`** (komunikat: „Zbyt duży wymiar w”)
- `a`, `b`, `L` większe od 0
- Przykład: `a=250, b=300, d=140, w=180, L=500, e=50, f=50, l3=80`

**TR2a — Trójnik z odejściem okrągłym** · wymiary: `a, b, d, L, l3, e, f`
- `a`, `b` — bok w zakresie; `L` — długość w zakresie
- **`d` nie większe niż `b` oraz nie większe niż `L − 60`** (komunikat: „Zbyt duże d”)
- `a`, `b`, `L` większe od 0
- Przykład: `a=300, b=250, d=140, L=500, l3=80, e=50, f=50`

**TRa — Trójnik symetryczny** · wymiary: `a, b, d, h, L, q, r, i, p`
- `a`, `b` — bok w zakresie; `L` — długość w zakresie
- `r`, `q` = 0 lub ≥ 100 mm
- **`d` nie większe niż `b`** (komunikat: „b musi być większe lub równe d”)
- **`L` nie mniejsze niż `h + q + r + i + 30`** (komunikat: „Zbyt małe L”)
- `a`, `b`, `L` większe od 0
- Przykład: `a=300, b=250, d=200, h=100, L=800, q=100, r=100, i=100, p=100`

**TR3a — Trójnik orłowy** · wymiary: `a, b, c, d, m, k, i, j, g, f`
- `a`, `b` — bok w zakresie
- `g`, `f` = 0 lub ≥ 100 mm
- `a`, `b`, `g`, `f` większe od 0
- Przykład: `a=500, b=300, c=300, d=200, m=100, k=100, i=100, j=100, g=150, f=150`

**TR4a — Trójnik z odejściem łukowym** · wymiary: `a, b, c, d, L, g, i, j`
- `a`, `b` — bok w zakresie; `g` = 0 lub ≥ 100 mm; `i`, `j` ≥ 30 mm
- **`a` nie mniejsze niż `c`** (komunikat: „a musi być większe lub równe c”)
- **`L` nie mniejsze niż `d + g + 60 + i`** (chyba że `L` = 100) — komunikat: „Zbyt małe L”
- `a`, `b`, `i`, `j` większe od 0
- Przykład: `a=300, b=300, c=250, d=200, L=800, g=150, i=50, j=50`

**TR5a — Trójnik portkowy** · wymiary: `a, b, c, d, e, L, h, g, i, j, k`
- `a`, `b` — bok w zakresie; `L` — długość w zakresie; `a`, `b`, `L` większe od 0
- Przykład: `a=300, b=250, c=200, d=200, e=100, L=600, h=100, g=100, i=50, j=50, k=50`

**TR6a — Nakładka na rurę** · wymiary: `a, e, f, L, g`
- `a` — bok w zakresie; `L` — długość w zakresie
- **`f` nie większe niż `a`** (komunikat: „Zbyt duże f”)
- **`L` nie mniejsze niż `e + 100`** (komunikat: „Zbyt małe L”)
- `a`, `L` większe od 0
- Przykład: `a=400, e=100, f=200, L=500, g=100`

**TR7a — Trójnik skośny** · wymiary: `a, b, d, h, e, r, q, i, j, p`
- `a`, `b` — bok w zakresie; `r`, `q` = 0 lub ≥ 100 mm; `i`, `j` ≥ 30 mm
- **`b` mniejsze niż `d`** (komunikat: „«d» musi być większe od «b»”)
- `a`, `b`, `i`, `j` większe od 0
- Przykład: `a=300, b=180, d=250, h=100, e=100, r=100, q=100, i=50, j=50, p=100`

**TR8a — Trójnik skośny współosiowy (odejście prostokątne)**
· wymiary: `a, b, c, d, w, g, l, l3, m, n, e, f, i=j`
- `a`, `b` — bok w zakresie; `l` — długość w zakresie
- **`w` nie większe niż `l − 60`** (komunikat: „Zbyt duży wymiar w”)
- **`g` mniejsze niż `d`** (komunikat: „g musi być mniejsze niż d”)
- `a`, `b`, `l` większe od 0
- Przykład: `a=300, b=250, c=300, d=250, w=150, g=100, l=500, l3=100, m=100, n=100, e=100, f=100, i=j=100`

**TR9a — Trójnik skośny współosiowy (odejście okrągłe)**
· wymiary: `a, b, c, d, d1, l, l3, m, n, e, f, i, j`
- `a`, `b` — bok w zakresie; `l` — długość w zakresie
- **`d1` nie większe niż `l − 60`** (komunikat: „Wartość d1 poza zakresem”)
- **`d1` mniejsze niż `d`** oraz **`d1` mniejsze niż `b`**
- `a`, `b`, `l` większe od 0
- Przykład: `a=300, b=250, c=300, d=250, d1=150, l=500, l3=100, m=100, n=100, e=100, f=100, i=100, j=100`

### Czwórniki

**CZ1a — Czwórnik z odejściami prostokątnymi**
· wymiary: `a, b, d, w, L, d1, w1, e1, f1, e, f, l3, l4`
- `a`, `b` — bok w zakresie; `L` — długość w zakresie
- **`b` nie mniejsze niż `d` oraz nie mniejsze niż `d1`**
- **`L` nie mniejsze niż `max(w, w1) + 60`** (komunikat: „Zbyt małe L”)
- `a`, `b`, `L` większe od 0
- Przykład: `a=200, b=250, d=140, w=90, L=500, d1=140, w1=90, e1=250, f1=110, e=250, f=110, l3=80, l4=80`

**CZ2a — Czwórnik z odejściami okrągłymi**
· wymiary: `a, b, d, L, d1, e1, f1, e, f, l3, l4`
- `a`, `b` — bok w zakresie; `L` — długość w zakresie
- **`b` nie mniejsze niż `d` oraz nie mniejsze niż `d1`**
- **`L` nie mniejsze niż `max(d, d1) + 60`** (komunikat: „Zbyt małe L”)
- `a`, `b`, `L` większe od 0
- Przykład: `a=200, b=250, d=140, L=500, d1=140, e1=250, f1=110, e=250, f=110, l3=80, l4=80`

### Zaślepki

**QESa — Zaślepka prostokątna** · wymiary: `a, b, e`
- `a`, `b` — bok w zakresie; `a`, `b`, `e` większe od 0
- Przykład: `a=300, b=200, e=50`

---

## 5. Przycisk KOT

Kliknięcie przycisku **KOT** (obok „Wstaw za …”) otwiera okienko z informacją,
czy dobrane parametry są zgodne z **Krajową Oceną Techniczną** (prostokątne
przewody i kształtki wentylacyjne z blachy stalowej ocynkowanej).

- **Kanał prostokątny (QDa)** — okno pokazuje:
  - *Warunki wstępne* z zaznaczeniem ✓/✗: Typ = Blacha, Materiał = Ocynk,
    Wykonanie = Średniociśnieniowe, Klasa szczelności = B;
  - *Dobór grubości blachy* — największy bok, długość `L` oraz grubości
    dopuszczone przez KOT dla tego wymiaru (np. `0,6 / 0,7 mm`) i grubość aktualnie
    wybraną;
  - podsumowanie: czy dobór spełnia wymagania KOT (popraw pozycje oznaczone ✗).
- **Pozostałe kształtki** — okno informuje, że walidacja KOT w tej aplikacji
  dotyczy wyłącznie kanału prostokątnego (QDa) i dla danej kształtki nie jest
  przeprowadzana.

Przycisk KOT zmienia kolor na zielony, gdy dobór jest zgodny z KOT. Okno zamyka
się ponownym kliknięciem przycisku, klawiszem Esc lub kliknięciem poza nim.

## 6. Najczęstsze pytania

**Wpisuję poprawny wymiar, a pole dalej jest czerwone.**
Sprawdzenie odświeża się po każdej zmianie. Jeśli błąd nie znika, upewnij się,
że poprawiłeś **wszystkie** czerwone pola — komunikat może dotyczyć zależności
między kilkoma wymiarami (np. `w` zależy od `L`).

**Program nie pozwala mi wpisać dużego kanału.**
Górny limit boku zależy od materiału. Dla Kwasówki i Aluminium to 2501 mm.
Zmień materiał na **Ocynk**, aby uzyskać zakres do 4000 mm.

**Skąd biorą się wartości na przyciskach `min` / `max`?**
To granice dopuszczalnego zakresu dla danego pola, wyliczone z pozostałych
wpisanych wymiarów. Kliknięcie przycisku wstawia tę wartość — możesz ją potem
zmienić na dowolną inną z zakresu.

**Czy podpowiedź o grubości blachy oznacza błąd?**
Nie. To wskazówka zgodna ze standardem. Kształtkę można dodać mimo tego
komunikatu, ale zalecana grubość zapewnia zgodność z KOT.

**Dlaczego promień nie może być „trochę” zaokrąglony (np. 40 mm)?**
Technologia gięcia dopuszcza albo brak zaokrąglenia (`r` = 0), albo promień
co najmniej 100 mm. Wartości pośrednie nie są wykonalne.
