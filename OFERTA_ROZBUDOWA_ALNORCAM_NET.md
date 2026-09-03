# OFERTA NA ROZBUDOWĘ I UTRZYMANIE APLIKACJI ALNORCAM .NET

**Wersja dokumentu:** 1.0  
**Data:** 03.09.2026  
**Wykonawca:** [nazwa wykonawcy]  
**Zamawiający:** [nazwa zamawiającego]

---

## 1. Przedmiot oferty

Przedmiotem oferty jest rozbudowa istniejącej aplikacji AlnorCAM wykonanej w technologii .NET oraz dostosowanie jej do aktualnych potrzeb użytkowników i wymagań technologicznych.

Zakres obejmuje w szczególności:

- dodanie obliczania powierzchni dla elementów niewykonanych z blachy,
- zmianę i uporządkowanie istniejących sposobów wyliczania powierzchni,
- analizę oraz poprawę błędów ujawnionych po latach użytkowania,
- zabezpieczenie istniejących funkcji przed regresją,
- przygotowanie i wdrożenie poprawionej wersji aplikacji.

Prace będą prowadzone na podstawie dostępnego kodu źródłowego aplikacji .NET, danych produkcyjnych oraz przykładów wskazanych przez Zamawiającego.

---

## 2. Cel realizacji

Celem projektu jest zapewnienie, aby aplikacja:

- poprawnie wyliczała powierzchnię elementów wykonanych z różnych materiałów,
- rozróżniała elementy z blachy oraz elementy z innych materiałów,
- stosowała właściwe wzory i zasady dla każdego rodzaju elementu,
- dawała powtarzalne i możliwe do zweryfikowania wyniki,
- nie traciła poprawności po zmianie istniejących reguł

---

## 3. Zakres funkcjonalny

### 3.1. Obliczanie powierzchni elementów niewykonanych z blachy

Aplikacja zostanie rozszerzona o obliczanie powierzchni elementów wykonanych z materiałów innych niż blacha, zgodnie z zasadami zaakceptowanymi przez Zamawiającego.

### 3.2. Analiza błędów historycznych

Wykonawca przeanalizuje błędy znalezione podczas dotychczasowego użytkowania aplikacji.

Analiza może obejmować:

- błędne wyniki dla konkretnych typów kształtek,
- błędne wyniki dla wybranych materiałów,
- różnice pomiędzy wartością oczekiwaną a wynikiem aplikacji,
- problemy z wartościami granicznymi,
- problemy z pustymi lub niepełnymi danymi,
- błędy wynikające z jednostek miary,
- błędy zaokrągleń,
- błędy powstające przy zmianie materiału,
- błędy zapisu i odczytu danych,
- błędy występujące tylko dla określonych konfiguracji systemowych,
- problemy związane ze starszą wersją środowiska .NET lub systemu operacyjnego.

Każdy potwierdzony błąd zostanie opisany, odtworzony i poprawiony.

---

## 4. Zakres prac technicznych

### Etap 1. Analiza aplikacji i zebranie wymagań

- przegląd kodu źródłowego aplikacji .NET,
- identyfikacja modułów odpowiedzialnych za obliczenia,
- analiza modelu danych i sposobu zapisu wyników,
- analiza istniejących formularzy i ekranów,
- zebranie przykładów błędnych wyników,
- zebranie oczekiwanych wyników referencyjnych,
- identyfikacja zależności pomiędzy materiałem, typem elementu i wzorem,
- przygotowanie listy wymagań do zatwierdzenia.

**Szacowany czas: 5-8 dni roboczych.**

### Etap 2. Przygotowanie modelu obliczeń

- uporządkowanie istniejących wzorów,
- określenie wspólnego modelu powierzchni,
- rozdzielenie obliczeń dla blachy i materiałów innych niż blacha,
- określenie zasad jednostek i zaokrągleń,
- przygotowanie tabeli parametrów wejściowych,
- przygotowanie obsługi wartości pustych i niepoprawnych,
- zaprojektowanie kompatybilnego sposobu zapisu danych.

**Szacowany czas: 5-10 dni roboczych.**

### Etap 3. Implementacja obliczeń dla materiałów innych niż blacha

- dodanie nowych wzorów,
- obsługa nowych rodzajów materiałów,
- rozszerzenie formularzy i list wyboru,
- dodanie wymaganych parametrów wejściowych,
- prezentacja powierzchni jednostkowej i całkowitej,
- aktualizacja podsumowań,
- obsługa wyjątków i niekompletnych danych,
- zachowanie kompatybilności z istniejącymi elementami.

**Szacowany czas: 8-15 dni roboczych.**

### Etap 4. Modyfikacja istniejących wyliczeń

- implementacja zaakceptowanych zmian,
- korekta wzorów i mapowania parametrów,
- korekta zaokrągleń,
- korekta minimalnych powierzchni,
- korekta liczby sztuk,
- korekta elementów izolowanych,
- aktualizacja raportów i eksportów.

**Szacowany czas: 7-14 dni roboczych.**

### Etap 5. Usunięcie błędów historycznych

- odtworzenie zgłoszonych błędów,
- klasyfikacja błędów według ważności,
- poprawa kodu,
- przygotowanie testu dla każdego błędu,
- sprawdzenie wpływu zmian na pozostałe funkcje,
- aktualizacja listy znanych problemów.

**Szacowany czas: 8-20 dni roboczych.**

### Etap 6. Testy i wdrożenie

- testy jednostkowe obliczeń,
- testy porównawcze z wynikami referencyjnymi,
- testy regresyjne,
- testy danych granicznych,
- testy istniejących funkcji aplikacji,
- testy akceptacyjne z użytkownikiem merytorycznym,
- przygotowanie wersji instalacyjnej,
- wdrożenie poprawionej wersji,
- przygotowanie instrukcji aktualizacji i wycofania wersji.

**Szacowany czas: 7-12 dni roboczych.**

---

## 5. Dokumentacja rezultatów

W ramach prac zostaną przygotowane:

- opis zastosowanych wzorów,
- tabela parametrów wejściowych,
- tabela materiałów i reguł obliczeniowych,
- lista poprawionych błędów,
- lista zmian funkcjonalnych,
- zestaw wyników referencyjnych,
- dokumentacja testów,
- instrukcja aktualizacji aplikacji,
- instrukcja wycofania wersji w przypadku problemów.

---

## 6. Harmonogram

Przewidywany czas realizacji pełnego zakresu wynosi:

**8-14 tygodni pracy jednego programisty.**

| Etap | Zakres | Czas |
|---|---|---:|
| 1 | Analiza aplikacji i wymagań | 1-2 tygodnie |
| 2 | Model obliczeń i reguły materiałowe | 1-2 tygodnie |
| 3 | Obliczenia dla materiałów innych niż blacha | 2-3 tygodnie |
| 4 | Zmiana istniejących wyliczeń | 1-3 tygodnie |
| 5 | Poprawa błędów historycznych | 2-4 tygodnie |
| 6 | Testy, wdrożenie i dokumentacja | 1-2 tygodnie |

Harmonogram zależy od kompletności kodu źródłowego, dostępności osoby merytorycznej oraz liczby błędów możliwych do odtworzenia.

---

## 7. Wycena

### 7.1. Wariant pełny

Wariant obejmuje pełny zakres opisany w niniejszej ofercie:

- analizę aplikacji .NET,
- nowe obliczenia dla materiałów innych niż blacha,
- zmiany istniejących wzorów,
- poprawę błędów historycznych,
- testy regresyjne,
- dokumentację,
- wdrożenie poprawionej wersji.

**Szacunkowy nakład: 40-70 dni roboczych, czyli 320-560 godzin.**

Orientacyjna cena przy stawce 180-250 PLN/h:

# 57 600-140 000 PLN netto

Rekomendowany budżet dla pełnego zakresu:

# 95 000 PLN netto

Cena końcowa zostanie potwierdzona po zakończeniu etapu analizy i otrzymaniu kompletu przykładów referencyjnych.

### 7.2. Wariant etapowy

Wariant etapowy pozwala rozpocząć od analizy oraz najważniejszych zmian.

| Pakiet | Zakres | Cena netto |
|---|---|---:|
| A | Analiza kodu, wymagań i błędów | 12 000 PLN |
| B | Obliczenia materiałów innych niż blacha | 30 000-45 000 PLN |
| C | Zmiany istniejących wyliczeń | 20 000-35 000 PLN |
| D | Poprawa błędów historycznych i testy | 25 000-45 000 PLN |
| E | Wdrożenie i dokumentacja | 8 000-15 000 PLN |

Wariant etapowy umożliwia podjęcie decyzji o dalszych pracach na podstawie wyników analizy.

### 7.3. Wariant awaryjny: szybka korekta najważniejszych błędów

Zakres:

- analiza maksymalnie 5 zgłoszonych błędów,
- poprawa błędów o najwyższym priorytecie,
- podstawowe testy regresyjne,
- przygotowanie poprawionej wersji aplikacji.

**Szacunkowy nakład: 10-18 dni roboczych.**

**Szacunkowa cena: 18 000-35 000 PLN netto.**

Wariant nie obejmuje pełnego wdrożenia obliczeń dla wszystkich materiałów niewykonanych z blachy.

---

## 8. Sposób rozliczenia

Rekomendowany jest podział płatności według etapów:

- 20% - rozpoczęcie i analiza,
- 25% - zatwierdzenie modelu obliczeń,
- 30% - zakończenie implementacji,
- 15% - zakończenie testów,
- 10% - wdrożenie i przekazanie dokumentacji.

W przypadku rozliczenia godzinowego prace będą raportowane w cyklu tygodniowym wraz z opisem wykonanych zadań.

---

## 9. Kryteria odbioru

Prace zostaną uznane za wykonane po spełnieniu następujących warunków:

- aplikacja uruchamia się w uzgodnionym środowisku,
- nowe materiały są dostępne w uzgodnionych miejscach aplikacji,
- obliczenia dla uzgodnionych przypadków zwracają zaakceptowane wyniki,
- zmienione obliczenia działają zgodnie z zaakceptowaną specyfikacją,
- zgłoszone i potwierdzone błędy objęte zakresem zostały poprawione,
- testy regresyjne przechodzą pozytywnie,
- istniejące dane pozostają możliwe do odczytu, o ile nie uzgodniono inaczej,
- Zamawiający otrzymuje kod, wersję instalacyjną i dokumentację zmian.

Wyniki referencyjne muszą zostać zatwierdzone przez osobę posiadającą wiedzę technologiczną dotyczącą produkcji elementów.

---

## 10. Założenia i obowiązki Zamawiającego

Oferta została przygotowana przy założeniu, że Zamawiający:

- udostępni pełny kod źródłowy aplikacji .NET,
- udostępni wymagane biblioteki i pliki konfiguracyjne,
- przekaże listę znanych błędów,
- dostarczy przykłady danych wejściowych i oczekiwanych wyników,
- zapewni dostęp do osoby merytorycznej,
- określi docelowe reguły obliczeniowe,
- określi wspierane wersje systemu Windows i .NET,
- zapewni środowisko do testów i wdrożenia,
- zaakceptuje wyniki etapów w uzgodnionych terminach.

Brak danych referencyjnych może uniemożliwić jednoznaczne potwierdzenie poprawności niektórych obliczeń.

---

## 11. Poza zakresem oferty

Oferta nie obejmuje, chyba że zostanie uzgodnione osobno:

- całkowitego przepisania aplikacji do nowej technologii,
- migracji aplikacji do React lub innego frameworka webowego,
- budowy nowego backendu,
- migracji bazy danych do innego systemu,
- integracji z ERP, CAD lub systemem produkcyjnym,
- zmian sprzętowych i systemowych na stanowiskach użytkowników,
- opracowania nowych wzorów technologicznych bez danych od Zamawiającego,
- certyfikacji aplikacji,
- formalnej certyfikacji wyrobów,
- całodobowego wsparcia użytkowników,
- rozwoju funkcji niezwiązanych z obliczaniem powierzchni i poprawą błędów.

---

## 12. Gwarancja i utrzymanie

W ramach ceny Wykonawca zapewnia 30 dni obsługi błędów dotyczących zakresu zrealizowanych prac, liczonych od dnia odbioru.

Możliwe jest zawarcie osobnej umowy utrzymaniowej obejmującej:

- przyjmowanie zgłoszeń,
- analizę błędów,
- poprawki powdrożeniowe,
- aktualizacje środowiska .NET,
- aktualizacje systemu Windows,
- konsultacje użytkowników,
- rozwój nowych reguł obliczeniowych.

Proponowana stawka prac utrzymaniowych:

**180-250 PLN/h netto**

Minimalny pakiet utrzymaniowy może zostać ustalony odrębnie, na przykład jako 10-20 godzin miesięcznie.

---

## 13. Ryzyka projektowe

Na termin i koszt realizacji mogą wpłynąć:

- brak kompletnego kodu źródłowego,
- brak możliwości uruchomienia starego środowiska .NET,
- nieudokumentowane reguły zapisane wyłącznie w kodzie,
- niejednoznaczne oczekiwane wyniki,
- duża liczba błędów historycznych,
- błędy danych zapisanych w poprzednich wersjach,
- brak osoby merytorycznej do akceptacji wyników,
- konieczność zachowania kompatybilności z wieloma wersjami środowiska,
- dodatkowe wymagania dotyczące bazy danych lub integracji.

W przypadku ujawnienia nowych wymagań lub błędów poza uzgodnionym zakresem Wykonawca przedstawi dodatkową wycenę.

---

## 14. Rekomendacja realizacyjna

Rekomenduje się realizację projektu w dwóch krokach:

1. **Etap analityczny za 12 000 PLN netto** - potwierdzenie zakresu, wzorów, błędów i danych referencyjnych.
2. **Etap implementacyjny** - realizowany na podstawie wyników analizy, z rekomendowanym budżetem całkowitym do **95 000 PLN netto**.

Takie podejście ogranicza ryzyko wyceny, ponieważ w wieloletniej aplikacji .NET część reguł może być zapisana w kodzie bez aktualnej dokumentacji, a część błędów może wynikać z historycznych danych lub niejednoznacznych założeń biznesowych.

---

## 15. Ważność oferty

Oferta jest ważna przez 30 dni od daty jej wystawienia.

Rozpoczęcie prac nastąpi po zaakceptowaniu oferty oraz ustaleniu szczegółowych warunków współpracy.

---

## 16. Podsumowanie cenowe

| Wariant | Zakres | Cena netto |
|---|---|---:|
| Szybka korekta | Najważniejsze błędy, maksymalnie 5 przypadków | 18 000-35 000 PLN |
| Wariant etapowy | Analiza, nowe obliczenia, zmiany i poprawki | 75 000-152 000 PLN |
| Wariant pełny | Kompleksowa rozbudowa i stabilizacja aplikacji .NET | rekomendowane 95 000 PLN |
| Utrzymanie | Prace powdrożeniowe | 180-250 PLN/h |

**Rekomendowany sposób rozpoczęcia:** analiza aplikacji i wymagań za **12 000 PLN netto**, a następnie realizacja pozostałych prac według potwierdzonego zakresu.
