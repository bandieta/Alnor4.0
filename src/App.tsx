import { useState, useCallback, useMemo, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import ShapeList from './components/ShapeList';
import DimensionInputs from './components/DimensionInputs';
import type { ValidationError } from './components/DimensionInputs';
import PropertiesPanel from './components/PropertiesPanel';
import ShapeDiagram from './components/ShapeDiagram';
import ShapeDiagram3D from './components/ShapeDiagram3D';
import DataGrid from './components/DataGrid';
import {
  SHAPE_DEFINITIONS,
  MATERIAL_OPTIONS,
  BLACHA_OPTIONS,
  WYKONANIE_OPTIONS,
  KLASA_SZCZELNOSCI_OPTIONS,
  WZMOCNIENIE_OPTIONS,
  RAMKI_WL_OPTIONS,
  RAMKI_WYL_OPTIONS,
  RAMKI_OD_OPTIONS,
  MATERIAL_CHEMO_OPTIONS,
  GRUBOSC_CHEMO_OPTIONS,
  WYKONANIE_CHEMO_OPTIONS,
  PLASZCZ_OPTIONS,
  GRUBOSC_IZOLACJI_OPTIONS,
} from './data';
import { calculateArea, generateSymbol, generatePrzekroj, calculateKot } from './calculations';
import type { GridRow, SystemType, MaterialType, Ksztaltka } from './types';
import { LANGUAGE_OPTIONS, parseDictionary, translate, type AppLanguage, type DictionaryMap } from './i18n';
import './App.css';

const DEMO_SHAPE_LIMIT = 4;

function buildSumaBlachyReport(gridRows: GridRow[]): string {
  const ocynkIdx: Record<string, number> = {
    '0,6': 0,
    '0.6': 0,
    '0,7': 1,
    '0.7': 1,
    '0,8': 2,
    '0.8': 2,
    '0,9': 3,
    '0.9': 3,
    '1': 4,
    '1,0': 4,
    '1.0': 4,
    '1,1': 5,
    '1.1': 5,
    '1,10': 5,
    '1.10': 5,
    '1,2': 6,
    '1.2': 6,
  };
  const kwasAlIdx: Record<string, number> = {
    '0,6': 0,
    '0.6': 0,
    '0,8': 1,
    '0.8': 1,
  };

  const kanOcynk = Array(7).fill(0) as number[];
  const kanKwasowka = Array(2).fill(0) as number[];
  const kanAluminum = Array(2).fill(0) as number[];
  const kszOcynk = Array(7).fill(0) as number[];
  const kszKwasowka = Array(2).fill(0) as number[];
  const kszAluminum = Array(2).fill(0) as number[];

  const kanOcynkIz = Array(7).fill(0) as number[];
  const kanKwasowkaIz = Array(2).fill(0) as number[];
  const kanAluminumIz = Array(2).fill(0) as number[];
  const kszOcynkIz = Array(7).fill(0) as number[];
  const kszKwasowkaIz = Array(2).fill(0) as number[];
  const kszAluminumIz = Array(2).fill(0) as number[];

  const kanal1500 = [0, 0];
  const izolacje = [0, 0, 0];

  const parseNum = (v: string) => Number.parseFloat((v || '').replace(',', '.'));

  const norm = (v: string) => {
    const raw = (v || '').trim();
    if (!raw) return '';

    const cleaned = raw.replace(/[^0-9.,]/g, '');
    if (!cleaned) return '';

    // Accept both comma/dot variants (e.g. 1.1, 1,1, 1,10) and normalize to app keys.
    const num = Number.parseFloat(cleaned.replace(',', '.'));
    if (Number.isFinite(num)) {
      const candidates = [0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2];
      const match = candidates.find((c) => Math.abs(c - num) < 0.001);
      if (match !== undefined) {
        if (Math.abs(match - 1.0) < 0.001) return '1';
        return match.toFixed(1).replace('.', ',');
      }
    }

    const s = cleaned.replace('.', ',');
    if (s === '1,0') return '1';
    return s;
  };

  const extractThickness = (row: GridRow) => {
    const k = row.ksztaltka;
    const direct = norm(k?.blacha || '');
    if (direct) return direct;

    const fromSymbol = (row.symbol || '').match(/(?:^|[^0-9])(0[.,][6-9]|1(?:[.,](?:0|1|2))?)(?:[^0-9]|$)/);
    if (fromSymbol?.[1]) return norm(fromSymbol[1]);

    const fromPelny = (k?.pelny_symbol || '').match(/(?:^|[^0-9])(0[.,][6-9]|1(?:[.,](?:0|1|2))?)(?:[^0-9]|$)/);
    if (fromPelny?.[1]) return norm(fromPelny[1]);

    return '';
  };

  for (const row of gridRows) {
    const k = row.ksztaltka;
    const symbol = row.shapeSymbol;
    const material = (row.material || k?.material || '').trim();
    const blacha = extractThickness(row);
    const qty = row.sztuk || 0;
    // Form1 uses tab[15] as the sheet area source for this report.
    const tab15Raw = k?.tab?.[15] || '';
    const tab15 = tab15Raw === '1,0' ? 1.0 : parseNum(tab15Raw);
    const unitArea = Number.isFinite(tab15) && tab15 > 0
      ? tab15
      : (Number.isFinite(row.m2) && row.m2 > 0
        ? row.m2
        : parseNum(k?.powierznia || '0') || 0);
    const area = unitArea * qty;

    const isIzolowana = Boolean(k?.izolowana);
    const plaszcz = k?.plaszcz || '';
    const insulatedWithJacket = isIzolowana && !plaszcz.includes('Bez Płaszcza');

    if (isIzolowana && plaszcz.includes('Bez Płaszcza')) {
      const powIz = parseNum(k?.powierzniaIz || '0') || 0;
      const izArea = powIz > 0 ? powIz : area;
      if ((k?.gruboscIlozacji || '').includes('30')) izolacje[0] += izArea;
      else if ((k?.gruboscIlozacji || '').includes('50')) izolacje[1] += izArea;
      else if ((k?.gruboscIlozacji || '').includes('100')) izolacje[2] += izArea;
    }

    const isQDa = symbol === 'QDa';

    if (material === 'Ocynk') {
      const idx = ocynkIdx[blacha];
      if (idx !== undefined) {
        const target = isQDa
          ? (insulatedWithJacket ? kanOcynkIz : kanOcynk)
          : (insulatedWithJacket ? kszOcynkIz : kszOcynk);
        target[idx] += area;
      }
    } else if (material === 'Kwasówka') {
      const idx = kwasAlIdx[blacha];
      if (idx !== undefined) {
        const target = isQDa
          ? (insulatedWithJacket ? kanKwasowkaIz : kanKwasowka)
          : (insulatedWithJacket ? kszKwasowkaIz : kszKwasowka);
        target[idx] += area;
      }
      if (isQDa && k?.tab?.[9] === '1500') {
        if (insulatedWithJacket) kanal1500[0] += area;
        else kanal1500[1] += area;
      }
    } else if (material === 'Aluminium') {
      const idx = kwasAlIdx[blacha];
      if (idx !== undefined) {
        const target = isQDa
          ? (insulatedWithJacket ? kanAluminumIz : kanAluminum)
          : (insulatedWithJacket ? kszAluminumIz : kszAluminum);
        target[idx] += area;
      }
    }
  }

  const n2 = (v: number) => Math.round(v * 100) / 100;
  const lines: string[] = [];
  const izLines: string[] = [];

  const pushPair = (
    arrKan: number[],
    arrKsz: number[],
    label: string,
    thicknesses: string[],
    target: string[]
  ) => {
    thicknesses.forEach((t, i) => {
      if (arrKan[i] > 0) target.push(`${label} ${t} kan: ${n2(arrKan[i]).toFixed(2)} m2`);
      if (arrKsz[i] > 0) target.push(`${label} ${t} ksz: ${n2(arrKsz[i]).toFixed(2)} m2`);
    });
  };

  pushPair(kanOcynk, kszOcynk, 'Ocynk', ['0,6', '0,7', '0,8', '0,9', '1', '1,1', '1,2'], lines);
  pushPair(kanKwasowka, kszKwasowka, 'Kwasówka', ['0,6', '0,8'], lines);
  pushPair(kanAluminum, kszAluminum, 'Aluminium', ['0,6', '0,8'], lines);

  pushPair(kanOcynkIz, kszOcynkIz, 'Iz. Ocynk', ['0,6', '0,7', '0,8', '0,9', '1', '1,1', '1,2'], izLines);
  pushPair(kanKwasowkaIz, kszKwasowkaIz, 'Iz. Kwasówka', ['0,6', '0,8'], izLines);
  pushPair(kanAluminumIz, kszAluminumIz, 'Iz. Aluminium', ['0,6', '0,8'], izLines);

  const report: string[] = [];
  if (lines.length > 0) {
    report.push('Nieizolowane:', ...lines);
  }
  if (izLines.length > 0) {
    if (report.length > 0) report.push('');
    report.push('Izolowane:', ...izLines);
  }
  if (izolacje.some((v) => v > 0)) {
    if (report.length > 0) report.push('');
    report.push('Izolacja bez płaszcza:');
    if (izolacje[0] > 0) report.push(`30 mm: ${n2(izolacje[0]).toFixed(2)} m2`);
    if (izolacje[1] > 0) report.push(`50 mm: ${n2(izolacje[1]).toFixed(2)} m2`);
    if (izolacje[2] > 0) report.push(`100 mm: ${n2(izolacje[2]).toFixed(2)} m2`);
  }
  if (kanal1500[0] > 0 || kanal1500[1] > 0) {
    if (report.length > 0) report.push('');
    report.push('Kanały Kwasówka 1500:');
    if (kanal1500[0] > 0) report.push(`Izolowane: ${n2(kanal1500[0]).toFixed(2)} m2`);
    if (kanal1500[1] > 0) report.push(`Nieizolowane: ${n2(kanal1500[1]).toFixed(2)} m2`);
  }

  return report.join('\n');
}

function App() {
  const [language, setLanguage] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem('alnor-cam-language');
      if (saved === 'pl' || saved === 'en' || saved === 'de' || saved === 'hu') {
        return saved;
      }
      return 'pl';
    } catch {
      return 'pl';
    }
  });
  const [dictionary, setDictionary] = useState<DictionaryMap>({});

  useEffect(() => {
    const loadDictionary = async () => {
      try {
        const response = await fetch('/slownik.txt');
        if (!response.ok) return;
        const raw = await response.text();
        setDictionary(parseDictionary(raw));
      } catch {
        setDictionary({});
      }
    };

    loadDictionary();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('alnor-cam-language', language);
    } catch {
      // ignore localStorage failures
    }
  }, [language]);

  const t = useCallback((text: string) => translate(dictionary, language, text), [dictionary, language]);

  // System type
  const [systemType, setSystemType] = useState<SystemType>('prostokatne');

  // Selected shape
  const [selectedSymbol, setSelectedSymbol] = useState('QDa');

  // Designation counter — restore from localStorage
  const [nextOznaczenie, setNextOznaczenie] = useState(() => {
    try {
      const saved = localStorage.getItem('alnor-cam-oznaczenie');
      return saved ? parseInt(saved) || 100 : 100;
    } catch { return 100; }
  });
  const [oznaczenie, setOznaczenie] = useState(() => {
    try {
      const saved = localStorage.getItem('alnor-cam-oznaczenie');
      return saved || '100';
    } catch { return '100'; }
  });
  const [oznaczenieEnabled, setOznaczenieEnabled] = useState(true);

  // Dimension values (up to 17 values)
  const [dimensionValues, setDimensionValues] = useState<string[]>(Array(17).fill(''));

  // Quantity
  const [sztuk, setSztuk] = useState('10');

  // Notes
  const [uwagi, setUwagi] = useState('');

  // Min.m2
  const [minM2, setMinM2] = useState('1.0');

  // Material type toggle (B/C)
  const [materialType, setMaterialType] = useState<MaterialType>('blacha');

  // Properties
  const [blacha, setBlacha] = useState('0,8');
  const [material, setMaterial] = useState('Ocynk');
  const [wykonanie, setWykonanie] = useState('Niskociśnieniowe');
  const [klasaSzczelnosci, setKlasaSzczelnosci] = useState('A');
  const [lwzmoc, setLwzmoc] = useState('standard');
  const [ramkiWL, setRamkiWL] = useState('P20');
  const [ramkiWYL, setRamkiWYL] = useState('P20');

  const isChemo = materialType === 'chemo';

  // Handle B/C toggle — switch defaults
  const handleMaterialTypeChange = useCallback((type: MaterialType) => {
    setMaterialType(type);
    if (type === 'chemo') {
      setBlacha(GRUBOSC_CHEMO_OPTIONS[0]);
      setMaterial(MATERIAL_CHEMO_OPTIONS[0]);
      setWykonanie(WYKONANIE_CHEMO_OPTIONS[0]);
    } else {
      setBlacha(BLACHA_OPTIONS[2]); // 0,8
      setMaterial(MATERIAL_OPTIONS[0]); // Ocynk
      setWykonanie(WYKONANIE_OPTIONS[0]); // Niskociśnieniowe
    }
  }, []);
  const [ramkiOd, setRamkiOd] = useState('');

  // Insulation fields (visible when prostokatne_izolowane)
  const [plaszcz, setPlaszcz] = useState(PLASZCZ_OPTIONS[0]);
  const [gruboscIzolacji, setGruboscIzolacji] = useState(GRUBOSC_IZOLACJI_OPTIONS[0]);

  const isIzolowane = systemType === 'prostokatne_izolowane';
  const isUserElement = systemType === 'element_uzytkownika';

  useEffect(() => {
    const selectedIndex = SHAPE_DEFINITIONS.findIndex((s) => s.symbol === selectedSymbol);
    if (selectedIndex >= DEMO_SHAPE_LIMIT) {
      setSelectedSymbol(SHAPE_DEFINITIONS[0].symbol);
      setDimensionValues(Array(17).fill(''));
    }
  }, [selectedSymbol]);

  // Handle system type change — force blacha in insulated mode
  const handleSystemTypeChange = useCallback((type: SystemType) => {
    setSystemType(type);
    if (type === 'prostokatne_izolowane') {
      // C# behavior: force Blacha mode, hide Chemo toggle
      setMaterialType('blacha');
      setBlacha(BLACHA_OPTIONS[2]); // 0,8
      setMaterial(MATERIAL_OPTIONS[0]); // Ocynk
      setWykonanie(WYKONANIE_OPTIONS[0]); // Niskociśnieniowe
    }
  }, []);

  // User element fields (visible when element_uzytkownika)
  const [userNazwa, setUserNazwa] = useState('');
  const [userSymbol, setUserSymbol] = useState('');

  // Grid data — restore from localStorage
  const [gridRows, setGridRows] = useState<GridRow[]>(() => {
    try {
      const saved = localStorage.getItem('alnor-cam-grid');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // Persist grid to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('alnor-cam-grid', JSON.stringify(gridRows));
    } catch { /* quota exceeded — ignore */ }
  }, [gridRows]);

  // Persist oznaczenie counter
  useEffect(() => {
    try {
      localStorage.setItem('alnor-cam-oznaczenie', String(nextOznaczenie));
    } catch { /* ignore */ }
  }, [nextOznaczenie]);

  // Validation highlight trigger
  const [showValidation, setShowValidation] = useState(false);

  // Editing mode — stores the row ID being edited
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  // Get current shape definition
  const currentShape = useMemo(
    () => SHAPE_DEFINITIONS.find((s) => s.symbol === selectedSymbol) || SHAPE_DEFINITIONS[0],
    [selectedSymbol]
  );

  // Calculate raw area (per-unit, no floor)
  const rawArea = useMemo(() => {
    const numValues = dimensionValues.map((v) => parseFloat(v) || 0);
    return calculateArea(selectedSymbol, numValues);
  }, [selectedSymbol, dimensionValues]);

  // Per-unit area with min.m2 floor applied (matches C# WpiszBlacheWPole)
  const calculatedArea = useMemo(() => {
    const minArea = parseFloat(minM2) || 0;
    return Math.max(rawArea, minArea);
  }, [rawArea, minM2]);

  // Display area (total = per-unit × qty)
  const displayArea = useMemo(() => {
    return calculatedArea * (parseInt(sztuk) || 1);
  }, [calculatedArea, sztuk]);

  // Calculate cross-section
  const calculatedPrzekroj = useMemo(() => {
    const numValues = dimensionValues.map((v) => parseFloat(v) || 0);
    return generatePrzekroj(numValues, selectedSymbol);
  }, [dimensionValues, selectedSymbol]);

  // Validation errors
  const validationErrors = useMemo((): ValidationError[] => {
    const errors: ValidationError[] = [];
    const labels = currentShape.labels;

    // Check required fields (non-'...' labels) are not empty
    labels.forEach((label, i) => {
      if (label !== '...' && (!dimensionValues[i] || dimensionValues[i].trim() === '')) {
        errors.push({ index: i, message: t('Wymagane') });
      }
    });

    // QDa-specific range validation
    if (selectedSymbol === 'QDa') {
      const a = parseFloat(dimensionValues[0]);
      const b = parseFloat(dimensionValues[1]);
      const l = parseFloat(dimensionValues[2]);
      const maxAB = material === 'Ocynk' ? 4000 : 2501;
      const materialLabel = material === 'Ocynk' ? '4000' : '2501';

      if (dimensionValues[0] !== '' && (isNaN(a) || a < 100 || a > maxAB)) {
        const existing = errors.findIndex(e => e.index === 0);
        if (existing >= 0) errors[existing].message = `100 - ${materialLabel}`;
        else errors.push({ index: 0, message: `100 - ${materialLabel}` });
      }
      if (dimensionValues[1] !== '' && (isNaN(b) || b < 100 || b > maxAB)) {
        const existing = errors.findIndex(e => e.index === 1);
        if (existing >= 0) errors[existing].message = `100 - ${materialLabel}`;
        else errors.push({ index: 1, message: `100 - ${materialLabel}` });
      }
      if (dimensionValues[2] !== '') {
        const maxL = materialType === 'chemo' ? 1500 : 20000;
        if (isNaN(l) || l < 100 || l > maxL) {
          const existing = errors.findIndex(e => e.index === 2);
          if (existing >= 0) errors[existing].message = `100 - ${maxL}`;
          else errors.push({ index: 2, message: `100 - ${maxL}` });
        }
      }
    }
    return errors;
  }, [selectedSymbol, dimensionValues, material, materialType, currentShape.labels, t]);

  // Property validation (frame size, etc.)
  const propertyErrors = useMemo((): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (selectedSymbol === 'QDa') {
      const a = parseFloat(dimensionValues[0]) || 0;
      const b = parseFloat(dimensionValues[1]) || 0;
      const maxAB = Math.max(a, b);

      const frameRank = (f: string) =>
        f === 'P20' ? 20 : f === 'P30' ? 30 : f === 'P40' ? 40 : 0;

      let minFrame = 'P20';
      if (maxAB > 2500) minFrame = 'P40';
      else if (maxAB > 1000) minFrame = 'P30';

      if (ramkiWL && frameRank(ramkiWL) < frameRank(minFrame)) {
        errors.ramkiWL = `Min. ${minFrame} (max bok ${maxAB})`;
      }
      if (ramkiWYL && frameRank(ramkiWYL) < frameRank(minFrame)) {
        errors.ramkiWYL = `Min. ${minFrame} (max bok ${maxAB})`;
      }
      if (ramkiOd && frameRank(ramkiOd) < frameRank(minFrame)) {
        errors.ramkiOd = `Min. ${minFrame} (max bok ${maxAB})`;
      }
    }

    return errors;
  }, [selectedSymbol, dimensionValues, ramkiWL, ramkiWYL, ramkiOd]);

  // KOT compliance check
  const kotCompliant = useMemo(() => {
    return calculateKot({
      symbol: selectedSymbol,
      dimensionValues,
      materialType,
      material,
      blacha,
      wykonanie,
      klasaSzczelnosci,
    });
  }, [selectedSymbol, dimensionValues, materialType, material, blacha, wykonanie, klasaSzczelnosci]);

  // KOT tooltip — show what's missing
  const kotTooltip = useMemo(() => {
    if (kotCompliant) return t('Zgodne z KOT');
    const missing: string[] = [];
    if (materialType !== 'blacha') missing.push(t('Typ') + ': ' + t('Blacha') + ' (B)');
    if (material !== 'Ocynk') missing.push(t('Materiał') + ': ' + t('Ocynk'));
    if (wykonanie !== 'Średniociśnieniowe') missing.push(t('Wykonanie') + ': ' + t('Średniociśnieniowe'));
    if (klasaSzczelnosci !== 'B') missing.push(t('Kl.szczel.') + ': B');
    if (!['0,6', '0,7', '0,9'].includes(blacha)) missing.push(t('Grubość izolacji') + ': 0,6 / 0,7 / 0,9');
    if (missing.length > 0) return t('Niezgodne z KOT') + '. ' + t('Wymagane') + ':\n' + missing.join('\n');
    return t('Niezgodne z KOT') + ' (' + t('wymiary poza zakresem') + ')';
  }, [kotCompliant, materialType, material, wykonanie, klasaSzczelnosci, blacha, t]);

  // Generate full symbol
  const fullSymbol = useMemo(() => {
    const numValues = dimensionValues.map((v) => parseFloat(v) || 0);
    return generateSymbol(selectedSymbol, material, wykonanie, numValues, isChemo);
  }, [selectedSymbol, material, wykonanie, dimensionValues, isChemo]);

  // Shape name for display
  const shapeName = useMemo(() => {
    const def = SHAPE_DEFINITIONS.find((s) => s.symbol === selectedSymbol);
    if (!def) return '';
    const suffix = systemType === 'prostokatne_izolowane' ? ' izolowany' : '';
    return def.name + suffix;
  }, [selectedSymbol, systemType]);

  // Handle shape selection
  const handleSelectShape = useCallback((symbol: string) => {
    setSelectedSymbol(symbol);
    setDimensionValues(Array(17).fill(''));
  }, []);

  const handleToggleOznaczenieEnabled = useCallback((enabled: boolean) => {
    setOznaczenieEnabled(enabled);
    if (enabled && !oznaczenie.trim()) {
      setOznaczenie(String(nextOznaczenie));
    }
  }, [oznaczenie, nextOznaczenie]);

  const advanceOznaczenie = useCallback(() => {
    if (!oznaczenieEnabled) return;
    setNextOznaczenie((prev) => {
      const next = prev + 1;
      setOznaczenie(String(next));
      return next;
    });
  }, [oznaczenieEnabled]);

  // Handle dimension value change
  const handleDimensionChange = useCallback((index: number, value: string) => {
    setDimensionValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setShowValidation(false);
  }, []);

  // Add element to grid
  const handleAdd = useCallback(() => {
    const rowOznaczenie = oznaczenieEnabled ? oznaczenie : '';

    // User element mode — simplified add
    if (isUserElement) {
      if (!userNazwa.trim() && !userSymbol.trim()) return;
      const qty = parseInt(sztuk) || 1;
      const ksztaltka: Ksztaltka = {
        obcy: true,
        symbol: userSymbol,
        oznaczenie: rowOznaczenie,
        nazwa: userNazwa,
        sztuk: sztuk,
        uwagi: uwagi,
        przekroj: '',
        material: '',
        materialChemo: '',
        gruboscChemo: '',
        wykonanieChemo: '',
        isChemo: false,
        Qnazwa: '',
        Qzamawia: '',
        Qdata: '',
        blacha: '',
        wykonanie: '',
        klasa_szczelnosci: '',
        l_wzmoc: '',
        ramkawl: '',
        ramkawyl: '',
        ramkaod: '',
        powierznia: '0',
        powierzniaIz: '',
        pelny_symbol: userSymbol,
        pelny_symbolIz: '',
        izolowana: false,
        plaszcz: '',
        gruboscIlozacji: '',
        tab: Array(17).fill(''),
      };
      const newRow: GridRow = {
        id: crypto.randomUUID(),
        oznaczenie: rowOznaczenie,
        nazwa: userNazwa,
        symbol: userSymbol,
        sztuk: qty,
        material: '',
        m2: 0,
        przekroj: '',
        uwagi: uwagi,
        shapeSymbol: userSymbol,
        tab: Array(17).fill(''),
        ksztaltka: ksztaltka,
      };
      if (editingRowId) {
        setGridRows((prev) =>
          prev.map((r) => (r.id === editingRowId ? { ...newRow, id: editingRowId } : r))
        );
        setEditingRowId(null);
      } else {
        setGridRows((prev) => [...prev, newRow]);
        advanceOznaczenie();
      }
      return;
    }

    // Validate before adding
    if (validationErrors.length > 0 || Object.keys(propertyErrors).length > 0) {
      setShowValidation(true);
      return;
    }
    const numValues = dimensionValues.map((v) => parseFloat(v) || 0);
    const area = calculateArea(selectedSymbol, numValues);
    const unitArea = Math.max(area, parseFloat(minM2) || 0);
    const qty = parseInt(sztuk) || 1;

    const ksztaltka: Ksztaltka = {
      obcy: false,
      symbol: selectedSymbol,
      oznaczenie: rowOznaczenie,
      nazwa: shapeName,
      sztuk: sztuk,
      uwagi: uwagi,
      przekroj: calculatedPrzekroj,
      material: isChemo ? '' : material,
      materialChemo: isChemo ? material : '',
      gruboscChemo: isChemo ? blacha : '',
      wykonanieChemo: isChemo ? wykonanie : '',
      isChemo: isChemo,
      Qnazwa: '',
      Qzamawia: '',
      Qdata: '',
      blacha: blacha,
      wykonanie: wykonanie,
      klasa_szczelnosci: klasaSzczelnosci,
      l_wzmoc: lwzmoc,
      ramkawl: ramkiWL,
      ramkawyl: ramkiWYL,
      ramkaod: ramkiOd,
      powierznia: unitArea.toFixed(2),
      powierzniaIz: '',
      pelny_symbol: fullSymbol,
      pelny_symbolIz: '',
      izolowana: isIzolowane,
      plaszcz: isIzolowane ? plaszcz : '',
      gruboscIlozacji: isIzolowane ? gruboscIzolacji : '',
      tab: dimensionValues,
    };

    const newRow: GridRow = {
      id: crypto.randomUUID(),
      oznaczenie: rowOznaczenie,
      nazwa: shapeName,
      symbol: fullSymbol,
      sztuk: qty,
      material: material,
      m2: unitArea,
      przekroj: calculatedPrzekroj,
      uwagi: uwagi,
      shapeSymbol: selectedSymbol,
      tab: dimensionValues,
      ksztaltka: ksztaltka,
    };

    if (editingRowId) {
      // Update existing row in place
      setGridRows((prev) =>
        prev.map((r) => (r.id === editingRowId ? { ...newRow, id: editingRowId } : r))
      );
      setEditingRowId(null);
    } else {
      setGridRows((prev) => [...prev, newRow]);
      advanceOznaczenie();
    }
  }, [
    validationErrors, propertyErrors, dimensionValues, selectedSymbol, oznaczenie, oznaczenieEnabled, shapeName, sztuk, uwagi,
    material, materialType, blacha, wykonanie, klasaSzczelnosci, lwzmoc,
    ramkiWL, ramkiWYL, ramkiOd, systemType, fullSymbol, calculatedPrzekroj,
    minM2, editingRowId, isIzolowane, plaszcz, gruboscIzolacji,
    isUserElement, userNazwa, userSymbol,
    advanceOznaczenie,
  ]);

  // Delete selected row
  const handleDelete = useCallback(() => {
    if (!selectedRowId) return;
    setGridRows((prev) => prev.filter((r) => r.id !== selectedRowId));
    setSelectedRowId(null);
  }, [selectedRowId]);

  // Edit selected row — load values into form, keep row in grid
  const handleEdit = useCallback(() => {
    if (!selectedRowId) return;
    const row = gridRows.find((r) => r.id === selectedRowId);
    if (!row) return;

    const k = row.ksztaltka;
    const rowIsChemo = k?.isChemo ?? false;

    setSelectedSymbol(row.shapeSymbol);
    setDimensionValues(row.tab);
    setOznaczenie(row.oznaczenie);
    setSztuk(String(row.sztuk));
    setUwagi(row.uwagi);
    setMaterialType(rowIsChemo ? 'chemo' : 'blacha');
    setMaterial(rowIsChemo ? (k?.materialChemo || '') : row.material);
    setBlacha(rowIsChemo ? (k?.gruboscChemo || '') : (k?.blacha || '0,8'));
    setWykonanie(rowIsChemo ? (k?.wykonanieChemo || '') : (k?.wykonanie || 'Niskociśnieniowe'));
    if (!rowIsChemo && k) {
      setKlasaSzczelnosci(k.klasa_szczelnosci || 'A');
      setLwzmoc(k.l_wzmoc || 'standard');
      setRamkiWL(k.ramkawl || 'P20');
      setRamkiWYL(k.ramkawyl || 'P20');
      setRamkiOd(k.ramkaod || '');
    }
    // Restore insulation fields
    if (k?.izolowana) {
      setSystemType('prostokatne_izolowane');
      setPlaszcz(k.plaszcz || PLASZCZ_OPTIONS[0]);
      setGruboscIzolacji(k.gruboscIlozacji || GRUBOSC_IZOLACJI_OPTIONS[0]);
    }
    // Restore user element mode
    if (k?.obcy) {
      setSystemType('element_uzytkownika');
      setUserNazwa(k.nazwa || '');
      setUserSymbol(k.pelny_symbol || '');
    }
    setEditingRowId(selectedRowId);
  }, [selectedRowId, gridRows]);

  // Insert after selected
  const handleInsertAfter = useCallback(() => {
    const rowOznaczenie = oznaczenieEnabled ? oznaczenie : '';

    if (!selectedRowId) {
      handleAdd();
      return;
    }

    // User element mode
    if (isUserElement) {
      if (!userNazwa.trim() && !userSymbol.trim()) return;
      const qty = parseInt(sztuk) || 1;
      const ksztaltka: Ksztaltka = {
        obcy: true,
        symbol: userSymbol,
        oznaczenie: rowOznaczenie,
        nazwa: userNazwa,
        sztuk: sztuk,
        uwagi: uwagi,
        przekroj: '',
        material: '',
        materialChemo: '',
        gruboscChemo: '',
        wykonanieChemo: '',
        isChemo: false,
        Qnazwa: '', Qzamawia: '', Qdata: '',
        blacha: '', wykonanie: '', klasa_szczelnosci: '', l_wzmoc: '',
        ramkawl: '', ramkawyl: '', ramkaod: '',
        powierznia: '0', powierzniaIz: '',
        pelny_symbol: userSymbol, pelny_symbolIz: '',
        izolowana: false, plaszcz: '', gruboscIlozacji: '',
        tab: Array(17).fill(''),
      };
      const newRow: GridRow = {
        id: crypto.randomUUID(),
        oznaczenie: rowOznaczenie,
        nazwa: userNazwa,
        symbol: userSymbol,
        sztuk: qty,
        material: '',
        m2: 0,
        przekroj: '',
        uwagi: uwagi,
        shapeSymbol: userSymbol,
        tab: Array(17).fill(''),
        ksztaltka: ksztaltka,
      };
      setGridRows((prev) => {
        const idx = prev.findIndex((r) => r.id === selectedRowId);
        const next = [...prev];
        next.splice(idx + 1, 0, newRow);
        return next;
      });
      advanceOznaczenie();
      return;
    }

    if (validationErrors.length > 0 || Object.keys(propertyErrors).length > 0) {
      setShowValidation(true);
      return;
    }

    const numValues = dimensionValues.map((v) => parseFloat(v) || 0);
    const area = calculateArea(selectedSymbol, numValues);
    const unitArea = Math.max(area, parseFloat(minM2) || 0);
    const qty = parseInt(sztuk) || 1;

    const ksztaltka: Ksztaltka = {
      obcy: false,
      symbol: selectedSymbol,
      oznaczenie: rowOznaczenie,
      nazwa: shapeName,
      sztuk: sztuk,
      uwagi: uwagi,
      przekroj: calculatedPrzekroj,
      material: isChemo ? '' : material,
      materialChemo: isChemo ? material : '',
      gruboscChemo: isChemo ? blacha : '',
      wykonanieChemo: isChemo ? wykonanie : '',
      isChemo: isChemo,
      Qnazwa: '',
      Qzamawia: '',
      Qdata: '',
      blacha: blacha,
      wykonanie: wykonanie,
      klasa_szczelnosci: klasaSzczelnosci,
      l_wzmoc: lwzmoc,
      ramkawl: ramkiWL,
      ramkawyl: ramkiWYL,
      ramkaod: ramkiOd,
      powierznia: unitArea.toFixed(2),
      powierzniaIz: '',
      pelny_symbol: fullSymbol,
      pelny_symbolIz: '',
      izolowana: isIzolowane,
      plaszcz: isIzolowane ? plaszcz : '',
      gruboscIlozacji: isIzolowane ? gruboscIzolacji : '',
      tab: dimensionValues,
    };

    const newRow: GridRow = {
      id: crypto.randomUUID(),
      oznaczenie: rowOznaczenie,
      nazwa: shapeName,
      symbol: fullSymbol,
      sztuk: qty,
      material: material,
      m2: unitArea,
      przekroj: calculatedPrzekroj,
      uwagi: uwagi,
      shapeSymbol: selectedSymbol,
      tab: dimensionValues,
      ksztaltka: ksztaltka,
    };

    setGridRows((prev) => {
      const idx = prev.findIndex((r) => r.id === selectedRowId);
      const next = [...prev];
      next.splice(idx + 1, 0, newRow);
      return next;
    });
    advanceOznaczenie();
  }, [
    selectedRowId, validationErrors, propertyErrors, dimensionValues, selectedSymbol,
    oznaczenie, oznaczenieEnabled, shapeName, sztuk, uwagi, material, materialType, blacha, wykonanie,
    klasaSzczelnosci, lwzmoc, ramkiWL, ramkiWYL, ramkiOd, systemType,
    fullSymbol, calculatedPrzekroj, minM2, handleAdd, isChemo,
    isIzolowane, plaszcz, gruboscIzolacji,
    isUserElement, userNazwa, userSymbol,
    advanceOznaczenie,
  ]);

  // New project
  const handleNew = useCallback(() => {
    setGridRows([]);
    setDimensionValues(Array(17).fill(''));
    setNextOznaczenie(100);
    setOznaczenie('100');
    setSelectedRowId(null);
  }, []);

  // Save project as JSON
  const handleSave = useCallback(() => {
    const data = JSON.stringify({ rows: gridRows, nextOznaczenie }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alnorcam-project.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [gridRows, nextOznaczenie]);

  // Load project from JSON
  const handleLoad = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.rows) setGridRows(data.rows);
          if (data.nextOznaczenie) {
            setNextOznaczenie(data.nextOznaczenie);
            setOznaczenie(String(data.nextOznaczenie));
          }
        } catch {
          alert(t('Błąd wczytywania pliku'));
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [t]);

  const sumaBlachyReport = useMemo(() => buildSumaBlachyReport(gridRows), [gridRows]);

  // Refresh/recalculate all rows
  const handleRefresh = useCallback(() => {
    setGridRows((prev) =>
      prev.map((row) => {
        const numValues = row.tab.map((v) => parseFloat(v) || 0);
        const area = calculateArea(row.shapeSymbol, numValues);
        const unitArea = Math.max(area, parseFloat(minM2) || 0);
        return {
          ...row,
          m2: unitArea,
          symbol: generateSymbol(row.shapeSymbol, row.material, row.ksztaltka?.wykonanie || wykonanie, numValues, row.ksztaltka?.isChemo),
        };
      })
    );
  }, [minM2, wykonanie]);

  // Calculate total area
  const totalM2 = useMemo(() => gridRows.reduce((sum, r) => sum + r.m2 * r.sztuk, 0), [gridRows]);

  return (
    <div className="app">
      <div className="app-body">
        {/* Left sidebar */}
        <div className="left-panel">
          <div className="sidebar-header">
            <span className="logo">Alnor<span className="logo-accent">CAM</span></span>
            <div className="lang-switcher" title={t('Język')}>
              <select
                className="lang-dropdown"
                value={language}
                onChange={(e) => setLanguage(e.target.value as AppLanguage)}
                aria-label={t('Język')}
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.label)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Toolbar
            systemType={systemType}
            onSystemTypeChange={handleSystemTypeChange}
            onNew={handleNew}
            onSave={handleSave}
            onLoad={handleLoad}
            sumaBlachyReport={sumaBlachyReport}
            t={t}
          />
          <ShapeList
            shapes={SHAPE_DEFINITIONS}
            selectedSymbol={selectedSymbol}
            onSelect={handleSelectShape}
            disabled={isUserElement}
            demoLimit={DEMO_SHAPE_LIMIT}
            t={t}
          />
        </div>

        {/* Main content */}
        <div className="main-panel">
          {/* Editor panel — stacked rows like original WinForms */}
          <div className="editor-panel">
            {isUserElement ? (
              /* User element mode — simplified input */
              <div className="user-element-panel">
                <div className="user-element-header">{t('Element użytkownika')}</div>
                <div className="user-element-fields">
                  <div className="user-element-row">
                    <label>{t('Nazwa')}</label>
                    <input
                      type="text"
                      value={userNazwa}
                      onChange={(e) => setUserNazwa(e.target.value)}
                      placeholder={`${t('Nazwa')} ${t('Element').toLowerCase()}...`}
                      className="user-element-input"
                    />
                  </div>
                  <div className="user-element-row">
                    <label>{t('Symbol')}</label>
                    <input
                      type="text"
                      value={userSymbol}
                      onChange={(e) => setUserSymbol(e.target.value)}
                      placeholder={t('Symbol / pełna nazwa...')}
                      className="user-element-input"
                    />
                  </div>
                  <div className="user-element-row">
                    <label>{t('Sztuk')}</label>
                    <input
                      type="number"
                      min="1"
                      value={sztuk}
                      onChange={(e) => {
                        const v = parseInt(e.target.value);
                        if (!isNaN(v) && v < 1) return;
                        setSztuk(e.target.value);
                      }}
                      className="user-element-input user-element-input-short"
                    />
                  </div>
                  <div className="user-element-row">
                    <label>{t('Uwagi')}</label>
                    <input
                      type="text"
                      value={uwagi}
                      onChange={(e) => setUwagi(e.target.value)}
                      className="user-element-input"
                    />
                  </div>
                  <div className="oznaczenie-row" style={{ marginTop: 8 }}>
                    <span className="label">{t('Oznaczenie')}</span>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={oznaczenieEnabled}
                        onChange={(e) => handleToggleOznaczenieEnabled(e.target.checked)}
                      />
                    </label>
                    <input
                      type="text"
                      className="oznaczenie-input"
                      value={oznaczenie}
                      onChange={(e) => setOznaczenie(e.target.value)}
                      disabled={!oznaczenieEnabled}
                    />
                  </div>
                </div>
              </div>
            ) : (
            <>
            {/* Row 1: 3D + 2D diagrams side by side */}
            <div className="diagrams-row">
              <ShapeDiagram3D
                symbol={selectedSymbol}
                values={dimensionValues.map((v) => parseFloat(v) || 0)}
                t={t}
              />
              <ShapeDiagram
                symbol={selectedSymbol}
                values={dimensionValues.map((v) => parseFloat(v) || 0)}
                labels={currentShape.labels}
                t={t}
              />
            </div>

            {/* Row 2: oznaczenie + shape name + symbol */}
            <div className="shape-info-row">
              <div className="oznaczenie-row">
                <span className="label">{t('Oznaczenie')}</span>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={oznaczenieEnabled}
                    onChange={(e) => handleToggleOznaczenieEnabled(e.target.checked)}
                  />
                </label>
                <input
                  type="text"
                  className="oznaczenie-input"
                  value={oznaczenie}
                  onChange={(e) => setOznaczenie(e.target.value)}
                  disabled={!oznaczenieEnabled}
                />
              </div>
              <div className="shape-name-display">{t(shapeName)}</div>
              <div className="full-symbol-display" title={fullSymbol}>{fullSymbol}</div>
            </div>

            {/* Row 3: dimensions + summary + properties side by side */}
            <div className="controls-row">
              <DimensionInputs
                labels={currentShape.labels}
                values={dimensionValues}
                onChange={handleDimensionChange}
                errors={validationErrors}
                showErrors={showValidation}
              />
              <div className="summary-fields">
                <div className="summary-row">
                  <label>{t('Sztuk')}</label>
                  <input
                    type="number"
                    min="1"
                    value={sztuk}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      if (!isNaN(v) && v < 1) return;
                      setSztuk(e.target.value);
                    }}
                    className="summary-input"
                  />
                </div>
                <div className="summary-row">
                  <label>{t('Blacha')}</label>
                  <span className="summary-input summary-input-readonly">
                    {calculatedArea.toFixed(2)}
                  </span>
                </div>
                <div className="summary-row">
                  <label>{t('Suma')}</label>
                  <span className="summary-input summary-input-readonly">
                    {displayArea.toFixed(2)}
                  </span>
                </div>
                <div className="summary-row">
                  <label>{t('Uwagi')}</label>
                  <input
                    type="text"
                    value={uwagi}
                    onChange={(e) => setUwagi(e.target.value)}
                    className="summary-input uwagi-input"
                  />
                </div>
              </div>
              <PropertiesPanel
                materialType={materialType}
                onMaterialTypeChange={handleMaterialTypeChange}
                t={t}
                blacha={blacha}
                onBlachaChange={setBlacha}
                material={material}
                onMaterialChange={setMaterial}
                wykonanie={wykonanie}
                onWykonanieChange={setWykonanie}
                klasaSzczelnosci={klasaSzczelnosci}
                onKlasaSzczelnosciChange={setKlasaSzczelnosci}
                lwzmoc={lwzmoc}
                onLwzmocChange={setLwzmoc}
                ramkiWL={ramkiWL}
                onRamkiWLChange={setRamkiWL}
                ramkiWYL={ramkiWYL}
                onRamkiWYLChange={setRamkiWYL}
                ramkiOd={ramkiOd}
                onRamkiOdChange={setRamkiOd}
                blachaOptions={isChemo ? GRUBOSC_CHEMO_OPTIONS : BLACHA_OPTIONS}
                materialOptions={isChemo ? MATERIAL_CHEMO_OPTIONS : MATERIAL_OPTIONS}
                wykonanieOptions={isChemo ? WYKONANIE_CHEMO_OPTIONS : WYKONANIE_OPTIONS}
                klasaOptions={KLASA_SZCZELNOSCI_OPTIONS}
                wzmocOptions={WZMOCNIENIE_OPTIONS}
                ramkiWLOptions={RAMKI_WL_OPTIONS}
                ramkiWYLOptions={RAMKI_WYL_OPTIONS}
                ramkiOdOptions={RAMKI_OD_OPTIONS}
                propertyErrors={propertyErrors}
                isChemo={isChemo}
                isIzolowane={isIzolowane}
                plaszcz={plaszcz}
                onPlaszczChange={setPlaszcz}
                gruboscIzolacji={gruboscIzolacji}
                onGruboscIzolacjiChange={setGruboscIzolacji}
                plaszczOptions={PLASZCZ_OPTIONS}
                gruboscIzolacjiOptions={GRUBOSC_IZOLACJI_OPTIONS}
              />
            </div>
            </>
            )}
          </div>

          {/* Action buttons — toolbar above the element list (koszyk) */}
          <div className="action-buttons">
            <button className="btn" onClick={handleRefresh}>{t('Odśwież')}</button>
            <span className="min-m2-group">
              <label>{t('Min.m2')}</label>
              <input
                type="text"
                value={minM2}
                onChange={(e) => setMinM2(e.target.value)}
                className="min-m2-input"
              />
            </span>
            <button className="btn btn-action" onClick={handleAdd}>{editingRowId ? t('Zapisz') : t('Dodaj')}</button>
            <button className="btn btn-danger" onClick={handleDelete}>{t('Usuń')}</button>
            <button className="btn btn-action" onClick={handleEdit} disabled={!!editingRowId || !selectedRowId}>{t('Edytuj')}</button>
            {editingRowId && (
              <button className="btn" onClick={() => setEditingRowId(null)}>{t('Anuluj')}</button>
            )}
            <button className="btn btn-action" onClick={handleInsertAfter}>{t('Wstaw za')} ...</button>
            <span
              className={`btn btn-kot ${kotCompliant ? 'btn-kot-green' : ''}`}
              title={kotTooltip}
            >KOT</span>
          </div>

          {/* Data grid */}
          <DataGrid
            rows={gridRows}
            selectedRowId={selectedRowId}
            onSelectRow={setSelectedRowId}
            t={t}
          />

          {/* Total */}
          {gridRows.length > 0 && (
            <div className="total-bar">
              {t('Suma')} m²: <strong>{totalM2.toFixed(2)}</strong> | {t('Elementy')}: <strong>{gridRows.length}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
