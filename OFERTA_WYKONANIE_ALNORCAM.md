# OFERTA NA WYKONANIE APLIKACJI ALNORCAM 4.0

**Wersja dokumentu:** 1.0  
**Data:** 03.09.2026  
**Wykonawca:** [nazwa wykonawcy]  
**Zamawiający:** [nazwa zamawiającego]

---

## 1. Przedmiot oferty

Przedmiotem oferty jest wykonanie i przygotowanie do użytkowania aplikacji webowej **AlnorCAM**, przeznaczonej do definiowania kształtek wentylacyjnych, obliczania ich powierzchni, generowania symboli technologicznych oraz przygotowywania list elementów do produkcji lub zamówienia.

Aplikacja zostanie wykonana na podstawie obecnej wersji demonstracyjnej React/TypeScript oraz istniejącej logiki domenowej odwzorowanej z aplikacji C#.

Oferta obejmuje doprowadzenie obecnej aplikacji do stabilnej, uporządkowanej i przetestowanej wersji produkcyjnej działającej w przeglądarce internetowej.

---

## 2. Zakres funkcjonalny

### 2.1. Obsługa kształtek

Aplikacja będzie obsługiwała 28 typów kształtek wentylacyjnych, w tym:

- kanały prostokątne,
- łuki symetryczne i redukcyjne,
- redukcje symetryczne i asymetryczne,
- redukcje kwadrat-koło,
- kolana,
- zaślepki,
- trójniki,
- czwórniki,
- elementy skośne,
- elementy współosiowe,
- elementy użytkownika.

Każdy typ kształtki będzie posiadał własny zestaw wymiarów i parametrów.

### 2.2. Parametry elementów

Aplikacja będzie umożliwiała określenie:

- wymiarów elementu,
- liczby sztuk,
- oznaczenia elementu,
- materiału,
- grubości blachy,
- rodzaju wykonania,
- klasy szczelności,
- rodzaju wzmocnienia,
- ramek połączeniowych,
- uwag użytkownika.

Dodatkowo obsługiwane będą:

- materiały chemoodporne PVC, PP, PPs i PE,
- wykonanie na mufy lub kołnierze,
- elementy izolowane,
- płaszcz zewnętrzny,
- grubość izolacji.

### 2.3. Obliczenia

Aplikacja będzie wykonywała:

- obliczenie powierzchni rozwinięcia elementu,
- zastosowanie minimalnej powierzchni m²,
- obliczenie powierzchni całkowitej dla zadanej liczby sztuk,
- generowanie symbolu elementu,
- generowanie przekroju,
- kontrolę zakresów wymiarowych,
- kontrolę zgodności z regułami KOT,
- sumowanie powierzchni blachy,
- rozdzielenie materiałów, grubości oraz elementów izolowanych i nieizolowanych.

Wzory i reguły obliczeniowe zostaną zweryfikowane na podstawie istniejącego programu C# oraz uzgodnionych danych referencyjnych.

### 2.4. Lista elementów

Użytkownik będzie mógł:

- dodawać elementy do listy,
- edytować elementy,
- usuwać elementy,
- wstawiać element za wybraną pozycją,
- filtrować listę,
- odświeżać obliczenia,
- przeglądać sumę powierzchni,
- rozpoczynać nowy projekt.

### 2.5. Wizualizacja

Aplikacja będzie posiadała:

- wizualizację 2D elementu,
- wizualizację 3D elementu,
- obracanie modelu 3D,
- powiększanie modelu,
- automatyczny obrót,
- wyświetlanie wymiarów,
- widok powiększony,

### 2.6. Projekty i pliki

W ramach wersji frontendowej użytkownik będzie mógł:

- zapisać projekt do pliku JSON,
- wczytać projekt z pliku JSON,
- kontynuować pracę po ponownym otwarciu aplikacji,
- korzystać z lokalnego zapisu danych w przeglądarce.

Format pliku projektu zostanie zabezpieczony przed niepoprawnymi danymi i przygotowany do przyszłego wersjonowania.

### 2.7. Wielojęzyczność

Aplikacja będzie obsługiwała następujące języki:

- polski,
- angielski,
- niemiecki,
- węgierski,
- chiński,
- afrikaans,
- tajski,
- japoński
- inne (do ustalenia)

---

## 3. Zakres prac programistycznych

Wykonawca zrealizuje:

1. Analizę obecnej implementacji i zgodności z aplikacją C#.
2. Uporządkowanie architektury aplikacji React.
3. Wydzielenie logiki formularza, projektu, walidacji i obliczeń.
4. Weryfikację wzorów dla wszystkich obsługiwanych kształtek.
5. Uzupełnienie walidacji wymiarów i zależności pomiędzy parametrami.
6. Uporządkowanie modelu danych projektu.
7. Obsługę błędnych i niekompletnych danych.
8. Weryfikację importu i eksportu plików JSON.
9. Refaktoryzację i stabilizację wizualizacji 2D/3D.

---

## 4. Rezultaty prac

Po zakończeniu prac Zamawiający otrzyma:

- działającą aplikację AlnorCAM,
- obsługę 28 typów kształtek,
- działające obliczenia powierzchni,
- działającą walidację parametrów,
- wizualizację 2D i 3D,
- obsługę projektów JSON,
- obsługę wielojęzyczności,


---

## 5. Harmonogram

Przewidywany czas realizacji wynosi:

**16-20 tygodni pracy**

| Etap | Zakres | Czas |
|---|---|---:|
| 1 | Analiza, wymagania i dane referencyjne | 2 tygodnie |
| 2 | Uporządkowanie architektury aplikacji | 1-2 tygodnie |
| 3 | Weryfikacja obliczeń i walidacji | 2-3 tygodnie |
| 4 | Obsługa projektu i formularzy | 1-2 tygodnie |
| 5 | Stabilizacja wizualizacji 2D/3D | 2-3 tygodnie |
| 6 | Testy i poprawki | 2 tygodnie |
| 7 | Przygotowanie wydania | 2 tygodnie |

Harmonogram może ulec zmianie w przypadku rozszerzenia zakresu, braku danych referencyjnych lub konieczności odtworzenia dodatkowych reguł z aplikacji C#.

---

## 6. Wynagrodzenie

### 6.1. Wersja frontendowa produkcyjna

Cena za wykonanie zakresu określonego w niniejszej ofercie:

# 89 000 PLN netto

Cena obejmuje pracę jednego programisty oraz przygotowanie opisanych funkcji frontendowych.

Cena nie obejmuje podatku VAT.

### 6.2. Wariant podstawowy

---

## 7. Płatności

Proponowany harmonogram płatności:

- 20% - rozpoczęcie prac,
- 30% - zakończenie architektury i podstawowych funkcji,
- 30% - zakończenie implementacji i testów,
- 20% - odbiór końcowy i przekazanie wersji produkcyjnej.

Szczegółowy harmonogram płatności może zostać ustalony w umowie.

---

## 8. Odbiór prac

Podstawą odbioru będzie:

- możliwość uruchomienia aplikacji,
- działanie głównych procesów użytkownika,
- obsługa uzgodnionych typów kształtek,
- poprawne wykonywanie uzgodnionych obliczeń,
- poprawne generowanie symboli,
- działający import i eksport projektu,
- brak błędów blokujących pracę aplikacji,
- pozytywne przejście uzgodnionych scenariuszy testowych.


---

## 9. Gwarancja i poprawki

Wynagrodzenie obejmuje 30 dni poprawiania błędów ujawnionych po odbiorze końcowym, pod warunkiem że:

- błąd dotyczy zakresu objętego ofertą,
- błąd można odtworzyć,
- nie wynika on ze zmiany wymagań,
- nie wynika on ze zmiany środowiska zewnętrznego lub przeglądarki.

Rozbudowa funkcjonalności po odbiorze będzie wyceniana osobno.

---

## 10. Założenia oferty

Oferta została przygotowana przy założeniu, że:

- Zamawiający dostarczy przykładowe poprawne projekty i wyniki obliczeń,
- reguły technologiczne zostaną zaakceptowane przez osobę merytoryczną,
- aplikacja będzie działała jako aplikacja webowa,
- projekty w wersji podstawowej będą przechowywane lokalnie lub w plikach JSON,
- w zakres podstawowej oferty nie wchodzi backend ani baza danych.

---

## 11. Prace poza zakresem podstawowej oferty

Poniższe funkcje wymagają osobnej wyceny:

- backend i baza danych,
- logowanie użytkowników,
- role i uprawnienia,
- centralne przechowywanie projektów,
- współdzielenie projektów,
- historia zmian i audyt,
- integracja z ERP,
- integracja z CAD,
- integracja z systemem produkcyjnym,
- eksport do PDF, XLSX lub CSV,
- panel administracyjny,
- zarządzanie katalogiem kształtek,
- automatyczne wdrożenie chmurowe,
- monitoring produkcyjny,
- aplikacja mobilna.

Szacunkowy koszt rozbudowy o backend, użytkowników i bazę danych:

**od 70 000 do 150 000 PLN netto**, zależnie od zakresu integracji i wymagań dotyczących bezpieczeństwa.

---

## 12. Ważne ryzyka projektowe

Największy wpływ na termin i koszt mogą mieć:

- brak kompletnych danych referencyjnych,
- różnice pomiędzy działaniem aplikacji C# a oczekiwaniami użytkowników,
- konieczność zmiany wzorów obliczeniowych,
- dodatkowe wymagania dotyczące dokładności modeli 3D,
- konieczność obsługi nowych typów kształtek,
- wymagania integracyjne z innymi systemami,
- zmiana założeń dotyczących zapisu danych.

W przypadku pojawienia się nowych wymagań Wykonawca przedstawi odrębną wycenę i wpływ na harmonogram.

---

## 13. Ważność oferty

Oferta jest ważna przez 30 dni od daty jej wystawienia.

Rozpoczęcie prac nastąpi po zaakceptowaniu oferty oraz ustaleniu warunków współpracy.

---

## 14. Podsumowanie cenowe

| Wariant | Zakres | Cena netto |
|---|---|---:|
| Wariant rekomendowany | Produkcyjna wersja frontendowa | 89 000 PLN |
| Rozbudowa opcjonalna | Backend, użytkownicy, baza danych i integracje | od 70 000 PLN |

## Rekomendowany wariant

Rekomendowany jest **Wariant produkcyjny frontendowy** w cenie:

# 89 000 PLN netto

Pozwoli on uporządkować istniejący kod, potwierdzić poprawność obliczeń, zapewnić obsługę wszystkich uzgodnionych typów kształtek oraz przygotować aplikację do dalszej rozbudowy o backend i integracje.
