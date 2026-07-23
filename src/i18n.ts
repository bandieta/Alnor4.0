export type AppLanguage = 'pl' | 'en' | 'de' | 'hu';

export type DictionaryMap = Record<string, Partial<Record<AppLanguage, string>>>;

export const LANGUAGE_OPTIONS: Array<{ value: AppLanguage; label: string }> = [
  { value: 'pl', label: '🇵🇱 Polski' },
  { value: 'en', label: '🇬🇧 English' },
  { value: 'de', label: '🇩🇪 Deutsch' },
  { value: 'hu', label: '🇭🇺 Magyar' },
];

const normalize = (value: string) => value.replace(/^\uFEFF/, '').trim();

const columnByLanguage: Record<AppLanguage, number> = {
  pl: 0,
  en: 1,
  de: 3,
  hu: 4,
};

const EN_FALLBACK: Record<string, string> = {
  'Błąd wczytywania pliku': 'Failed to load file',
  'Brak danych do wyliczenia': 'No data to calculate',
  'Brak elementów. Kliknij "Dodaj" aby dodać kształtkę.': 'No elements. Click "Add" to add a fitting.',
  'Element': 'Element',
  'Filtruj': 'Filter',
  'Grubość': 'Thickness',
  'Min.m2': 'Min.m2',
  'Nie dostępne w wersji demo': 'Not available in demo version',
  'Ocynk': 'Galvanized steel',
  'Kwasówka': 'Stainless steel',
  'Aluminium': 'Aluminum',
  'Niskociśnieniowe': 'Low pressure',
  'Średniociśnieniowe': 'Medium pressure',
  'Kanał': 'Duct',
  'Kształtka': 'Fitting',
  'Nieizolowane': 'Non-insulated',
  'Izolowane': 'Insulated',
  'Izolacja bez płaszcza': 'Insulation without jacket',
  'Kanały Kwasówka 1500': 'Stainless ducts 1500',
  'Bez Płaszcza': 'Without jacket',
  'Mufy': 'Socket joints',
  'Kołnierze': 'Flanges',
  'Niezgodne z KOT': 'Not compliant with KOT',
  'Obracaj · Scroll = zoom': 'Rotate · Scroll = zoom',
  'Powiększ': 'Expand',
  'Ruch': 'Motion',
  'Suma': 'Total',
  'Suma blachy': 'Sheet metal total',
  'Dane osobowe i opisowe': 'Personal and descriptive data',
  'Symbol / pełna nazwa...': 'Symbol / full name...',
  'Typ': 'Type',
  'Widok 3D': '3D View',
  'Widok 3D niedostępny dla tego kształtu': '3D view is not available for this shape',
  'Wymagane': 'Required',
  'Wymiary': 'Dimensions',
  'wymiary poza zakresem': 'dimensions out of range',
  'Zamknij': 'Close',
  'Zgodne z KOT': 'KOT compliant',
  'widok z boku': 'side view',
  'widok z przodu': 'front view',
  'przekrój': 'cross-section',
  'izolowany': 'insulated',
  'Kanał prostokątny': 'Rectangular duct',
  'Łuk symetryczny': 'Symmetric bend',
  'Redukcja sym.': 'Symmetric reducer',
  'Redukcja kwadrat-koło sym.': 'Symmetric square-to-round reducer',
  'Redukcja kwadrat-koło asym.': 'Asymmetric square-to-round reducer',
  'Redukcja asym.': 'Asymmetric reducer',
  'Łuk redukcyjny': 'Reduction bend',
  'Łuk dyfuzorowany': 'Diffuser bend',
  'Kolano redukcyjne': 'Reduction elbow',
  'Kolano symetryczne': 'Symmetric elbow',
  'Zaślepka prostokątna': 'Rectangular end cap',
  'Trójnik z odej. prostokątnym': 'T-branch with rectangular outlet',
  'Trójnik z odej. okrągłymi': 'T-branch with round outlets',
  'Trójnik symetryczny': 'Symmetric T-branch',
  'Odsadzka sym.': 'Symmetric offset',
  'Odsadzka asym.': 'Asymmetric offset',
  'Nakładka na rurę': 'Pipe saddle',
  'Czwórnik z odej. prostokątnym': 'Cross with rectangular outlet',
  'Czwórnik z odej. okrągłymi': 'Cross with round outlets',
  'Trójnik orłowy': 'Eagle tee',
  'Trójnik z od. łukowym': 'Tee with bend outlet',
  'Trójnik portkowy': 'Pants tee',
  'Kanał prost. skośny': 'Angled rectangular duct',
  'Kanał prostopadły': 'Perpendicular duct',
  'Trójnik skośny': 'Skew tee',
  'Trójnik sk.współosiowy': 'Skew coaxial tee',
};

const DE_FALLBACK: Record<string, string> = {
  'Nowy': 'Neu',
  'Pobierz': 'Laden',
  'Zapisz': 'Speichern',
  'Dodaj': 'Hinzufugen',
  'Usuń': 'Loschen',
  'Edytuj': 'Bearbeiten',
  'Anuluj': 'Abbrechen',
  'Odśwież': 'Aktualisieren',
  'Wstaw za': 'Einfugen nach',
  'Filtruj': 'Filtern',
  'Elementy': 'Elemente',
  'Element użytkownika': 'Benutzerelement',
  'Nazwa': 'Name',
  'Symbol': 'Symbol',
  'Sztuk': 'Stk.',
  'Materiał': 'Material',
  'Ocynk': 'Verzinkter Stahl',
  'Kwasówka': 'Edelstahl',
  'Aluminium': 'Aluminium',
  'Blacha': 'Blech',
  'Suma': 'Summe',
  'Suma blachy': 'Blechsumme',
  'Dane osobowe i opisowe': 'Personen- und Beschreibungsdaten',
  'Typ': 'Typ',
  'Uwagi': 'Bemerkungen',
  'Oznaczenie': 'Bezeichnung',
  'Przekrój': 'Querschnitt',
  'Wykonanie': 'Ausfuhrung',
  'Niskociśnieniowe': 'Niederdruck',
  'Średniociśnieniowe': 'Mitteldruck',
  'Kanał': 'Kanal',
  'Kształtka': 'Formteil',
  'Nieizolowane': 'Nicht isoliert',
  'Izolowane': 'Isoliert',
  'Izolacja bez płaszcza': 'Dammung ohne Mantel',
  'Kanały Kwasówka 1500': 'Edelstahl-Kanale 1500',
  'Bez Płaszcza': 'Ohne Mantel',
  'Mufy': 'Muffen',
  'Kołnierze': 'Flansche',
  'System kształtek': 'Formteil-System',
  'Prostokątne': 'Rechteckig',
  'Prostokątne izolowane': 'Rechteckig isoliert',
  'Język': 'Sprache',
  'Brak danych do wyliczenia': 'Keine Daten zur Berechnung',
  'Brak elementów. Kliknij "Dodaj" aby dodać kształtkę.': 'Keine Elemente. Klicken Sie auf "Hinzufugen", um ein Formteil hinzuzufugen.',
  'Wymagane': 'Erforderlich',
  'Widok 3D': '3D-Ansicht',
  'Widok 3D niedostępny dla tego kształtu': '3D-Ansicht fur diese Form nicht verfugbar',
  'Wymiary': 'Abmessungen',
  'Ruch': 'Drehung',
  'Powiększ': 'Vergrosern',
  'Zamknij': 'Schliesen',
  'Nie dostępne w wersji demo': 'In der Demo-Version nicht verfugbar',
  'widok z boku': 'Seitenansicht',
  'widok z przodu': 'Vorderansicht',
  'przekrój': 'Querschnitt',
  'izolowany': 'isoliert',
  'Kanał prostokątny': 'Rechteckkanal',
  'Łuk symetryczny': 'Symmetrischer Bogen',
  'Redukcja sym.': 'Symmetrische Reduktion',
  'Redukcja kwadrat-koło sym.': 'Symmetrische Rechteck-Rund-Reduktion',
  'Redukcja kwadrat-koło asym.': 'Asymmetrische Rechteck-Rund-Reduktion',
  'Redukcja asym.': 'Asymmetrische Reduktion',
  'Łuk redukcyjny': 'Reduktionsbogen',
  'Łuk dyfuzorowany': 'Diffusorbogen',
  'Kolano redukcyjne': 'Reduktionsbogen',
  'Kolano symetryczne': 'Symmetrischer Bogen',
  'Zaślepka prostokątna': 'Rechteck-Endkappe',
  'Trójnik z odej. prostokątnym': 'T-Stuck mit rechteckigem Abgang',
  'Trójnik z odej. okrągłymi': 'T-Stuck mit runden Abgangen',
  'Trójnik symetryczny': 'Symmetrisches T-Stuck',
  'Odsadzka sym.': 'Symmetrischer Versatz',
  'Odsadzka asym.': 'Asymmetrischer Versatz',
  'Nakładka na rurę': 'Rohrsattel',
  'Czwórnik z odej. prostokątnym': 'Kreuzstuck mit rechteckigem Abgang',
  'Czwórnik z odej. okrągłymi': 'Kreuzstuck mit runden Abgangen',
  'Trójnik orłowy': 'Doppelbogen-Tee',
  'Trójnik z od. łukowym': 'T-Stuck mit Bogenabgang',
  'Trójnik portkowy': 'Hosenstuck',
  'Kanał prost. skośny': 'Schrager Rechteckkanal',
  'Kanał prostopadły': 'Senkrechter Kanal',
  'Trójnik skośny': 'Schrages T-Stuck',
  'Trójnik sk.współosiowy': 'Schrages koaxiales T-Stuck',
};

const HU_FALLBACK: Record<string, string> = {
  'Nowy': 'Uj',
  'Pobierz': 'Betoltes',
  'Zapisz': 'Mentes',
  'Dodaj': 'Hozzaadas',
  'Usuń': 'Torles',
  'Edytuj': 'Szerkesztes',
  'Anuluj': 'Megse',
  'Odśwież': 'Frissites',
  'Wstaw za': 'Beszuras utan',
  'Filtruj': 'Szures',
  'Elementy': 'Elemek',
  'Element użytkownika': 'Felhasznaloi elem',
  'Nazwa': 'Nev',
  'Symbol': 'Szimbolum',
  'Sztuk': 'Db',
  'Materiał': 'Anyag',
  'Ocynk': 'Horganyzott acel',
  'Kwasówka': 'Rozsdamentes acel',
  'Aluminium': 'Aluminium',
  'Blacha': 'Lemez',
  'Suma': 'Osszeg',
  'Suma blachy': 'Lemez osszesen',
  'Dane osobowe i opisowe': 'Szemelyes es leiro adatok',
  'Typ': 'Tipus',
  'Uwagi': 'Megjegyzesek',
  'Oznaczenie': 'Jeloles',
  'Przekrój': 'Keresztmetszet',
  'Wykonanie': 'Kivitel',
  'Niskociśnieniowe': 'Alacsony nyomasu',
  'Średniociśnieniowe': 'Kozepes nyomasu',
  'Kanał': 'Csatorna',
  'Kształtka': 'Idom',
  'Nieizolowane': 'Nem szigetelt',
  'Izolowane': 'Szigetelt',
  'Izolacja bez płaszcza': 'Szigeteles kolpeny nelkul',
  'Kanały Kwasówka 1500': 'Rozsdamentes csatornak 1500',
  'Bez Płaszcza': 'Kolpeny nelkul',
  'Mufy': 'Tokos kotes',
  'Kołnierze': 'Karimak',
  'System kształtek': 'Idomrendszer',
  'Prostokątne': 'Teglalap alak',
  'Prostokątne izolowane': 'Szigetelt teglalap',
  'Język': 'Nyelv',
  'Brak danych do wyliczenia': 'Nincs adat a szamitashoz',
  'Brak elementów. Kliknij "Dodaj" aby dodać kształtkę.': 'Nincs elem. Kattintson a "Hozzaadas" gombra uj idom hozzaadasahoz.',
  'Wymagane': 'Kotelezo',
  'Widok 3D': '3D nezet',
  'Widok 3D niedostępny dla tego kształtu': 'A 3D nezet ehhez az idomhoz nem erheto el',
  'Wymiary': 'Meretek',
  'Ruch': 'Mozgas',
  'Powiększ': 'Nagyitas',
  'Zamknij': 'Bezaras',
  'Nie dostępne w wersji demo': 'A demo verzioban nem erheto el',
  'widok z boku': 'oldalnezet',
  'widok z przodu': 'elonezet',
  'przekrój': 'keresztmetszet',
  'izolowany': 'szigetelt',
  'Kanał prostokątny': 'Teglalap csatorna',
  'Łuk symetryczny': 'Szimmetrikus iv',
  'Redukcja sym.': 'Szimmetrikus szukito',
  'Redukcja kwadrat-koło sym.': 'Szimmetrikus negyzet-kor szukito',
  'Redukcja kwadrat-koło asym.': 'Aszimmetrikus negyzet-kor szukito',
  'Redukcja asym.': 'Aszimmetrikus szukito',
  'Łuk redukcyjny': 'Szukito iv',
  'Łuk dyfuzorowany': 'Diffuzor iv',
  'Kolano redukcyjne': 'Szukito konyok',
  'Kolano symetryczne': 'Szimmetrikus konyok',
  'Zaślepka prostokątna': 'Teglalap vegzar',
  'Trójnik z odej. prostokątnym': 'T-idom teglalap leagazassal',
  'Trójnik z odej. okrągłymi': 'T-idom kor leagazasokkal',
  'Trójnik symetryczny': 'Szimmetrikus T-idom',
  'Odsadzka sym.': 'Szimmetrikus offset',
  'Odsadzka asym.': 'Aszimmetrikus offset',
  'Nakładka na rurę': 'Csoborito nyereg',
  'Czwórnik z odej. prostokątnym': 'Negyag teglalap leagazassal',
  'Czwórnik z odej. okrągłymi': 'Negyag kor leagazasokkal',
  'Trójnik orłowy': 'Sas T-idom',
  'Trójnik z od. łukowym': 'T-idom iv leagazassal',
  'Trójnik portkowy': 'Nadrag T-idom',
  'Kanał prost. skośny': 'Ferde teglalap csatorna',
  'Kanał prostopadły': 'Meroleges csatorna',
  'Trójnik skośny': 'Ferde T-idom',
  'Trójnik sk.współosiowy': 'Ferde koaxialis T-idom',
};

const FALLBACK_BY_LANGUAGE: Partial<Record<AppLanguage, Record<string, string>>> = {
  en: EN_FALLBACK,
  de: DE_FALLBACK,
  hu: HU_FALLBACK,
};

export const parseDictionary = (raw: string): DictionaryMap => {
  const map: DictionaryMap = {};
  const lines = raw.split(/\r?\n/);

  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = line.split(';');
    if (cols.length < 5) continue;

    const source = normalize(cols[0]);
    if (!source) continue;

    if (!map[source]) map[source] = {};

    (Object.keys(columnByLanguage) as AppLanguage[]).forEach((lang) => {
      const value = normalize(cols[columnByLanguage[lang]] || '');
      if (value) {
        map[source][lang] = value;
      }
    });
  }

  return map;
};

export const translate = (dict: DictionaryMap, lang: AppLanguage, text: string): string => {
  if (lang === 'pl') return text;

  const fallback = FALLBACK_BY_LANGUAGE[lang] || EN_FALLBACK;

  if (text.endsWith(' izolowany')) {
    const base = text.slice(0, -' izolowany'.length);
    return `${translate(dict, lang, base)} ${translate(dict, lang, 'izolowany')}`;
  }

  const fromFallback = fallback[text] || fallback[text.trim()];
  if (fromFallback) return fromFallback;

  const direct = dict[text]?.[lang];
  if (direct && direct !== text) return direct;

  const trimmed = text.trim();
  if (trimmed && dict[trimmed]?.[lang] && dict[trimmed][lang] !== text) return dict[trimmed][lang] || text;

  if (text.endsWith('...')) {
    const base = text.slice(0, -3).trim();
    const baseTranslated = dict[base]?.[lang] || fallback[base] || EN_FALLBACK[base];
    if (baseTranslated) return `${baseTranslated}...`;
  }

  return fallback[text] || fallback[trimmed] || EN_FALLBACK[text] || EN_FALLBACK[trimmed] || text;
};
