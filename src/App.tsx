import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { ChangeEvent } from 'react';
import Toolbar from './components/Toolbar';
import ShapeList from './components/ShapeList';
import DimensionInputs from './components/DimensionInputs';
import type { ValidationError } from './components/DimensionInputs';
import { validateShape, fieldConstraints } from './validation';
import type { ValidationContext } from './validation';
import { exportProject, importProject } from './legacyFormat';
import PropertiesPanel from './components/PropertiesPanel';
import ProjectInfoDialog from './components/ProjectInfoDialog';
import InfoDialog from './components/InfoDialog';
import KotInfo from './components/KotInfo';
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
import { calculateArea, calculateInsulatedArea, generateFullSymbol, generatePrzekroj, kotReport, blachaBandStandard, isBlachaThicknessAtLeast, computeBok } from './calculations';
import type { GridRow, SystemType, MaterialType, Ksztaltka, ProjectInfo } from './types';
import { parseDictionary, translate, isAppLanguage, type AppLanguage, type DictionaryMap } from './i18n';
import './App.css';

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

  // Chemical (PVC/PP/PPs/PE) pipe wall thicknesses — same area formula as
  // sheet metal, just a different material/thickness axis (GRUBOSC_CHEMO_OPTIONS).
  const CHEMO_MATERIALS = ['PVC', 'PP', 'PPs', 'PE'];
  const CHEMO_THICKNESSES = ['4', '5', '6', '8', '10', '12'];
  const chemoIdx: Record<string, number> = {
    '4': 0, '5': 1, '6': 2, '8': 3, '10': 4, '12': 5,
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

  const chemoBuckets: Record<string, { kan: number[]; ksz: number[]; kanIz: number[]; kszIz: number[] }> = {};
  for (const m of CHEMO_MATERIALS) {
    chemoBuckets[m] = {
      kan: Array(CHEMO_THICKNESSES.length).fill(0),
      ksz: Array(CHEMO_THICKNESSES.length).fill(0),
      kanIz: Array(CHEMO_THICKNESSES.length).fill(0),
      kszIz: Array(CHEMO_THICKNESSES.length).fill(0),
    };
  }

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
      // powIz is a per-piece area (like tab[15]/k.powierznia), so it needs the
      // same *qty scaling `area` above already gets — matches Form1.cs's
      // `sSize = tab[15] ... ; izolacje[x] += sSize * qty` shape.
      const izArea = powIz > 0 ? powIz * qty : area;
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
    } else if (CHEMO_MATERIALS.includes(material)) {
      const idx = chemoIdx[blacha];
      if (idx !== undefined) {
        const bucket = chemoBuckets[material];
        const target = isQDa
          ? (insulatedWithJacket ? bucket.kanIz : bucket.kan)
          : (insulatedWithJacket ? bucket.kszIz : bucket.ksz);
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
  for (const m of CHEMO_MATERIALS) {
    pushPair(chemoBuckets[m].kan, chemoBuckets[m].ksz, m, CHEMO_THICKNESSES, lines);
  }

  pushPair(kanOcynkIz, kszOcynkIz, 'Iz. Ocynk', ['0,6', '0,7', '0,8', '0,9', '1', '1,1', '1,2'], izLines);
  pushPair(kanKwasowkaIz, kszKwasowkaIz, 'Iz. Kwasówka', ['0,6', '0,8'], izLines);
  pushPair(kanAluminumIz, kszAluminumIz, 'Iz. Aluminium', ['0,6', '0,8'], izLines);
  for (const m of CHEMO_MATERIALS) {
    pushPair(chemoBuckets[m].kanIz, chemoBuckets[m].kszIz, `Iz. ${m}`, CHEMO_THICKNESSES, izLines);
  }

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

// "50 mm" / "100 mm" -> 50 / 100. Mirrors ksztaltka.cs's
// `gruboscIlozacji.Replace("mm", "").Replace(" ", "")`.
function parseInsulationMm(gruboscIzolacji: string): number {
  return Number.parseFloat(gruboscIzolacji.replace('mm', '').replace(/\s/g, '').replace(',', '.')) || 0;
}

// Rebuilds the material/execution context validateShape needs from an
// imported Ksztaltka, mirroring how the editor derives it while a shape is
// being entered by hand.
function ksztaltkaValidationContext(k: Ksztaltka): ValidationContext {
  return {
    material: k.isChemo ? k.materialChemo : k.material,
    materialType: k.isChemo ? 'chemo' : 'blacha',
    wykonanie: k.wykonanie,
    klasaSzczelnosci: k.klasa_szczelnosci,
    blacha: k.blacha,
    ramki: { wl: k.ramkawl, wyl: k.ramkawyl, od: k.ramkaod },
  };
}

// Denormalizes an imported Ksztaltka back into a display GridRow, mirroring
// the row construction in handleAdd (src/App.tsx ~line 654).
function ksztaltkaToGridRow(k: Ksztaltka): GridRow {
  return {
    id: crypto.randomUUID(),
    oznaczenie: k.oznaczenie,
    nazwa: k.nazwa,
    symbol: k.pelny_symbol,
    sztuk: parseInt(k.sztuk, 10) || 1,
    material: k.isChemo ? k.materialChemo : k.material,
    m2: parseFloat(k.powierznia) || 0,
    przekroj: k.przekroj,
    uwagi: k.uwagi,
    shapeSymbol: k.symbol,
    tab: k.tab,
    ksztaltka: k,
  };
}

function App() {
  const [language] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem('alnor-cam-language');
      if (isAppLanguage(saved)) {
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

  // "Kolory" menu (Form1.cs tłoToolStripMenuItem_Click / kreskaToolStripMenuItem_Click)
  // — 2D drawing outline + background color. Legacy doesn't persist these
  // across launches; we do, since it costs nothing and is strictly nicer.
  const [diagramLineColor, setDiagramLineColor] = useState(
    () => { try { return localStorage.getItem('alnor-cam-line-color') || '#004290'; } catch { return '#004290'; } }
  );
  const [diagramBackgroundColor, setDiagramBackgroundColor] = useState(
    () => { try { return localStorage.getItem('alnor-cam-bg-color') || '#ffffff'; } catch { return '#ffffff'; } }
  );
  useEffect(() => {
    try { localStorage.setItem('alnor-cam-line-color', diagramLineColor); } catch { /* ignore */ }
  }, [diagramLineColor]);
  useEffect(() => {
    try { localStorage.setItem('alnor-cam-bg-color', diagramBackgroundColor); } catch { /* ignore */ }
  }, [diagramBackgroundColor]);

  // "Pamiętaj wartości przy zmianie elementu" vs the default "Przywróć
  // domyślne ustawienia po zmianie elementu" (Form1.cs ~30599-30614): when
  // enabled, a/b carry over to the next shape instead of every field
  // clearing on shape change.
  const [rememberValues, setRememberValues] = useState(false);

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

  // Auto-suggest/upgrade sheet thickness as dimensions grow (Form1.cs
  // zmien_blache_komunikat, ~11533-11649) — only for Ocynk/Kwasówka/Aluminium;
  // chemo has its own thickness scale with no minimum-thickness table.
  const [blachaWarning, setBlachaWarning] = useState<string | null>(null);

  const bok = useMemo(
    () => computeBok(selectedSymbol, dimensionValues.map((v) => parseFloat(v) || 0)),
    [selectedSymbol, dimensionValues]
  );

  // `blacha` is deliberately read via a ref rather than a dependency here:
  // this effect's own `setBlacha(required)` call must not immediately
  // re-trigger itself and, seeing the now-corrected value, null out the
  // warning it just raised before the user ever sees it.
  const blachaRef = useRef(blacha);
  useEffect(() => { blachaRef.current = blacha; }, [blacha]);

  useEffect(() => {
    if (isChemo || isUserElement || bok <= 0) return;
    const required = blachaBandStandard(material, wykonanie, bok);
    if (!required) return;
    if (!isBlachaThicknessAtLeast(material, wykonanie, blachaRef.current, required)) {
      setBlacha(required);
      setBlachaWarning(t('Grubość blachy za mała!'));
    }
  }, [bok, material, wykonanie, isChemo, isUserElement, t]);

  // Manual thickness picks get the same too-thin check (mirrors legacy
  // showing the same warning from the combo box's own change handler).
  const handleBlachaChange = useCallback((value: string) => {
    setBlacha(value);
    if (isChemo || isUserElement || bok <= 0) return;
    const required = blachaBandStandard(material, wykonanie, bok);
    if (required && !isBlachaThicknessAtLeast(material, wykonanie, value, required)) {
      setBlacha(required);
      setBlachaWarning(t('Grubość blachy za mała!'));
    }
  }, [bok, material, wykonanie, isChemo, isUserElement, t]);

  // Auto-dismiss the thickness warning toast.
  useEffect(() => {
    if (!blachaWarning) return;
    const id = setTimeout(() => setBlachaWarning(null), 3500);
    return () => clearTimeout(id);
  }, [blachaWarning]);

  // Kwasówka/Aluminium only ever ran Niskociśnieniowe in the legacy app —
  // Wykonanie was forced and disabled for those materials (Form1.Designer.cs
  // 870-872, forced at Form1.cs:14849-14862).
  const handleMaterialChange = useCallback((value: string) => {
    setMaterial(value);
    if (value !== 'Ocynk') setWykonanie('Niskociśnieniowe');
  }, []);

  // NOTE: legacy silently auto-upgrades an undersized frame (no warning) —
  // see `frameBandStandard()`/`isFrameAtLeast()` in calculations.ts, still
  // used for the symbol-suffix comparison in generateFullSymbol(). A live
  // auto-correct effect was tried here too, but this codebase already has a
  // deliberate, tested "block Add + show a hint with a suggestion chip"
  // pattern for frame sizing (`checkFrames()` — same pattern as the radius
  // and minimum-L rules, see e2e/validation.spec.ts's ramka test) that
  // predates this session. Auto-correcting silently would fire before that
  // hint ever has a chance to show, which regresses an existing, deliberate
  // UX choice rather than filling a gap — so frames are left to that
  // existing validation path instead of a second, conflicting mechanism.

  // Chemo "Kołnierze" (flanges) forces all three frames to P30
  // (Form1.cs:31643-31653).
  const handleWykonanieChange = useCallback((value: string) => {
    setWykonanie(value);
    if (isChemo && value === 'Kołnierze') {
      setRamkiWL('P30');
      setRamkiWYL('P30');
      setRamkiOd('P30');
    }
  }, [isChemo]);

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

  // Order/project header (legacy Form3 "Dane"): stored on every saved
  // Ksztaltka as Qnazwa/Qzamawia/Qdata so files stay legacy-compatible.
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>(() => {
    try {
      const saved = localStorage.getItem('alnor-cam-project-info');
      return saved ? JSON.parse(saved) : { nazwa: '', zamawia: '', data: '' };
    } catch { return { nazwa: '', zamawia: '', data: '' }; }
  });
  const [showProjectInfo, setShowProjectInfo] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('alnor-cam-project-info', JSON.stringify(projectInfo));
    } catch { /* quota exceeded — ignore */ }
  }, [projectInfo]);

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

  // Dimension + property validation. Rules are ported from the legacy .NET app
  // (Form1.cs, per-shape `if (symbol == "…")` blocks) into a standalone module —
  // see `src/validation/` and `docs/REGULY_WALIDACJI.md`.
  const validation = useMemo(
    () =>
      validateShape(selectedSymbol, dimensionValues, {
        material,
        materialType,
        wykonanie,
        klasaSzczelnosci,
        blacha,
        ramki: { wl: ramkiWL, wyl: ramkiWYL, od: ramkiOd },
      }),
    [
      selectedSymbol,
      dimensionValues,
      material,
      materialType,
      wykonanie,
      klasaSzczelnosci,
      blacha,
      ramkiWL,
      ramkiWYL,
      ramkiOd,
    ],
  );

  const validationErrors = useMemo(
    (): ValidationError[] =>
      validation.dimensionErrors.map((e) => ({
        index: e.index,
        message: t(e.message),
        suggest: e.suggest,
      })),
    [validation, t],
  );

  // Effective min/max per dimension field — used to clamp input on blur and show
  // an allowed-range hint. Derived from the same rule set.
  const fieldRanges = useMemo(
    () =>
      fieldConstraints(selectedSymbol, dimensionValues, {
        material,
        materialType,
        wykonanie,
        klasaSzczelnosci,
        blacha,
      }),
    [selectedSymbol, dimensionValues, material, materialType, wykonanie, klasaSzczelnosci, blacha],
  );

  // Property validation (frame size). Sheet-thickness notes are advisory and
  // excluded here so they don't block "Add". Each entry carries the rule text and
  // (for frame rules) a suggested value the user can apply with one click.
  const propertyErrors = useMemo((): Record<string, { message: string; suggest?: string }> => {
    const errors: Record<string, { message: string; suggest?: string }> = {};
    for (const e of validation.propertyErrors) {
      if (e.ruleId === 'blacha.standard' || !e.field) continue;
      const suggest = e.params?.min != null ? String(e.params.min) : undefined;
      errors[e.field] = { message: t(e.message), suggest };
    }
    return errors;
  }, [validation, t]);

  // KOT compliance — structured report for the info popover (see KotInfo).
  const kotStatus = useMemo(
    () =>
      kotReport({
        symbol: selectedSymbol,
        dimensionValues,
        materialType,
        material,
        blacha,
        wykonanie,
        klasaSzczelnosci,
      }),
    [selectedSymbol, dimensionValues, materialType, material, blacha, wykonanie, klasaSzczelnosci],
  );

  // "Ustaw parametry zgodne z KOT" — force the four prerequisites and pick a
  // thickness the KOT table allows for the current largest side.
  const handleMakeKotCompliant = useCallback(() => {
    setMaterialType('blacha');
    setMaterial('Ocynk');
    setWykonanie('Średniociśnieniowe');
    setKlasaSzczelnosci('B');
    const g = kotStatus.allowedGrubosc[0];
    if (g) setBlacha(g);
  }, [kotStatus.allowedGrubosc]);

  // Generate full symbol
  const fullSymbol = useMemo(() => {
    const numValues = dimensionValues.map((v) => parseFloat(v) || 0);
    return generateFullSymbol({
      symbol: selectedSymbol,
      tab: numValues,
      bok,
      isChemo,
      material,
      materialChemo: material,
      gruboscChemo: blacha,
      wykonanie,
      blacha,
      izolowana: isIzolowane,
      plaszcz,
      klasaSzczelnosci,
      lwzmoc,
      ramkiWL,
      ramkiWYL,
    });
  }, [
    selectedSymbol, material, wykonanie, dimensionValues, isChemo, bok, blacha,
    isIzolowane, plaszcz, klasaSzczelnosci, lwzmoc, ramkiWL, ramkiWYL,
  ]);

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
    setDimensionValues((prev) => {
      const next = Array(17).fill('');
      if (rememberValues) {
        next[0] = prev[0] || '';
        next[1] = prev[1] || '';
      }
      return next;
    });
  }, [rememberValues]);

  // PgUp/PgDn = previous/next shape in the catalogue (Form1.cs:30767-30776).
  useEffect(() => {
    if (isUserElement) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'PageUp' && e.key !== 'PageDown') return;
      const target = e.target as HTMLElement | null;
      if (target?.tagName === 'TEXTAREA') return;
      if (showProjectInfo || showAbout || showHelp) return;
      e.preventDefault();
      const idx = SHAPE_DEFINITIONS.findIndex((s) => s.symbol === selectedSymbol);
      if (idx === -1) return;
      const delta = e.key === 'PageDown' ? 1 : -1;
      const next = SHAPE_DEFINITIONS[(idx + delta + SHAPE_DEFINITIONS.length) % SHAPE_DEFINITIONS.length];
      handleSelectShape(next.symbol);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isUserElement, selectedSymbol, showProjectInfo, showAbout, showHelp, handleSelectShape]);

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

  // Replace-by-designation: if Add collides with an existing row's
  // Oznaczenie, confirm before overwriting when the shape type differs
  // (silent overwrite when it matches — same fitting being re-entered).
  // Mirrors Form1.cs's button8_Click loop (~29454-29467): "Czy istniejący
  // element (…) zastąpić?", replacing in place rather than appending.
  // Returns false when the user declined — caller should abort the Add.
  const addOrReplaceRow = useCallback((row: GridRow): boolean => {
    const existingIdx = row.oznaczenie.trim()
      ? gridRows.findIndex((r) => r.oznaczenie === row.oznaczenie)
      : -1;

    if (existingIdx !== -1 && gridRows[existingIdx].shapeSymbol !== row.shapeSymbol) {
      const ok = window.confirm(`${t('Czy istniejący element')} (${row.oznaczenie}) ${t('zastąpić?')}`);
      if (!ok) return false;
    }

    if (existingIdx !== -1) {
      setGridRows((prev) => {
        const next = [...prev];
        next[existingIdx] = row;
        return next;
      });
    } else {
      setGridRows((prev) => [...prev, row]);
    }
    return true;
  }, [gridRows, t]);

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
        if (!addOrReplaceRow(newRow)) return;
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
    const unitAreaIz = isIzolowane
      ? Math.max(calculateInsulatedArea(selectedSymbol, numValues, parseInsulationMm(gruboscIzolacji)), parseFloat(minM2) || 0)
      : 0;
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
      powierzniaIz: isIzolowane ? unitAreaIz.toFixed(2) : '',
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
      if (!addOrReplaceRow(newRow)) return;
      advanceOznaczenie();
    }
  }, [
    validationErrors, propertyErrors, dimensionValues, selectedSymbol, oznaczenie, oznaczenieEnabled, shapeName, sztuk, uwagi,
    material, materialType, blacha, wykonanie, klasaSzczelnosci, lwzmoc,
    ramkiWL, ramkiWYL, ramkiOd, systemType, fullSymbol, calculatedPrzekroj,
    minM2, editingRowId, isIzolowane, plaszcz, gruboscIzolacji,
    isUserElement, userNazwa, userSymbol,
    advanceOznaczenie, addOrReplaceRow,
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
    const unitAreaIz = isIzolowane
      ? Math.max(calculateInsulatedArea(selectedSymbol, numValues, parseInsulationMm(gruboscIzolacji)), parseFloat(minM2) || 0)
      : 0;
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
      powierzniaIz: isIzolowane ? unitAreaIz.toFixed(2) : '',
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
    setProjectInfo({ nazwa: '', zamawia: '', data: '' });
  }, []);

  // Save project — legacy-compatible AES+XML format (same file format the
  // .NET app reads/writes), so exports can be opened by either app.
  const handleSave = useCallback(() => {
    void (async () => {
      // The legacy app only reads the order header (Qnazwa/Qzamawia/Qdata) off
      // item [0] on load, but stamping every row keeps it robust regardless of
      // reordering and costs nothing.
      const ksztaltki = gridRows.map((r) => ({
        ...r.ksztaltka,
        Qnazwa: projectInfo.nazwa,
        Qzamawia: projectInfo.zamawia,
        Qdata: projectInfo.data,
      }));
      const blob = await exportProject(ksztaltki);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'alnorcam-project.alc';
      a.click();
      URL.revokeObjectURL(url);
    })();
  }, [gridRows, projectInfo]);

  // "Eksportuj" — a modern replacement for the legacy hack (select the
  // hidden 31-column grid, copy it to the clipboard as tab-separated text,
  // save the clipboard as a ".xls" that isn't really Excel format —
  // Form1.cs:31386-31402). Same idea (a tabular dump of every row for use
  // outside the app), delivered as an actual openable .csv instead.
  const handleExport = useCallback(() => {
    const header = ['Oznaczenie', 'Nazwa', 'Symbol', 'Sztuk', 'Materiał', 'Blacha', 'Powierzchnia', 'Powierzchnia całkowita', 'Przekrój', 'Uwagi'];
    const csvEscape = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
    const lines = [header.map(csvEscape).join(',')];
    for (const row of gridRows) {
      lines.push([
        row.oznaczenie,
        row.nazwa,
        row.symbol,
        String(row.sztuk),
        row.material,
        row.ksztaltka?.blacha || '',
        row.m2.toFixed(2),
        (row.m2 * row.sztuk).toFixed(2),
        row.przekroj,
        row.uwagi,
      ].map((v) => csvEscape(String(v))).join(','));
    }
    const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alnorcam-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [gridRows]);

  // Load project — tries the legacy AES+XML format first (files from either
  // app), falling back to the old self-invented JSON format so project files
  // saved by earlier versions of this app still load. No fixed extension:
  // the legacy app enforces none either.
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoad = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ''; // allow re-selecting the same file next time
      if (!file) return;
      void (async () => {
        try {
          const buffer = await file.arrayBuffer();
          let ksztaltki;
          try {
            ksztaltki = await importProject(buffer);
          } catch {
            const data = JSON.parse(new TextDecoder().decode(buffer));
            if (!data.rows) throw new Error('not a recognized project file');
            setGridRows(data.rows);
            if (data.nextOznaczenie) {
              setNextOznaczenie(data.nextOznaczenie);
              setOznaczenie(String(data.nextOznaczenie));
            }
            return;
          }

          const validRows: GridRow[] = [];
          const rejected: string[] = [];
          for (const k of ksztaltki) {
            const result = validateShape(k.symbol, k.tab, ksztaltkaValidationContext(k));
            if (result.valid) {
              validRows.push(ksztaltkaToGridRow(k));
            } else {
              const reason = result.violations[0]?.message ?? '';
              rejected.push(`${k.oznaczenie || k.symbol}: ${reason}`);
            }
          }
          setGridRows(validRows);
          const header = ksztaltki[0];
          if (header) {
            setProjectInfo({
              nazwa: header.Qnazwa || '',
              zamawia: header.Qzamawia || '',
              data: header.Qdata || '',
            });
          }
          if (rejected.length > 0) {
            alert(`${t('Błąd wczytywania pliku')}:\n${rejected.join('\n')}`);
          }
        } catch {
          alert(t('Błąd wczytywania pliku'));
        }
      })();
    },
    [t],
  );

  const sumaBlachyReport = useMemo(() => buildSumaBlachyReport(gridRows), [gridRows]);

  // Refresh/recalculate all rows
  const handleRefresh = useCallback(() => {
    setGridRows((prev) =>
      prev.map((row) => {
        const numValues = row.tab.map((v) => parseFloat(v) || 0);
        const area = calculateArea(row.shapeSymbol, numValues);
        const unitArea = Math.max(area, parseFloat(minM2) || 0);
        const k = row.ksztaltka;
        const rowBok = computeBok(row.shapeSymbol, numValues);
        return {
          ...row,
          m2: unitArea,
          symbol: k
            ? generateFullSymbol({
                symbol: row.shapeSymbol,
                tab: numValues,
                bok: rowBok,
                isChemo: k.isChemo,
                material: k.material,
                materialChemo: k.materialChemo,
                gruboscChemo: k.gruboscChemo,
                wykonanie: k.wykonanie || wykonanie,
                blacha: k.blacha,
                izolowana: k.izolowana,
                plaszcz: k.plaszcz,
                klasaSzczelnosci: k.klasa_szczelnosci,
                lwzmoc: k.l_wzmoc,
                ramkiWL: k.ramkawl,
                ramkiWYL: k.ramkawyl,
              })
            : row.symbol,
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
            <div className="header-info-buttons">
              <button
                type="button"
                className="header-info-btn"
                title={t('Opis programu')}
                onClick={() => setShowHelp(true)}
              >
                ?
              </button>
              <button
                type="button"
                className="header-info-btn"
                title={t('O programie')}
                onClick={() => setShowAbout(true)}
              >
                i
              </button>
            </div>
          </div>
          <Toolbar
            systemType={systemType}
            onSystemTypeChange={handleSystemTypeChange}
            onNew={handleNew}
            onSave={handleSave}
            onLoad={handleLoad}
            onOpenProjectInfo={() => setShowProjectInfo(true)}
            onExport={handleExport}
            sumaBlachyReport={sumaBlachyReport}
            t={t}
          />
          {showProjectInfo && (
            <ProjectInfoDialog
              info={projectInfo}
              onSave={setProjectInfo}
              onClose={() => setShowProjectInfo(false)}
              t={t}
            />
          )}
          {showAbout && (
            <InfoDialog title={t('O programie')} onClose={() => setShowAbout(false)}>
              <div className="info-modal-logo">Alnor<span className="logo-accent" style={{ color: '#ce0015' }}>CAM</span></div>
              <p>{t('CAD/CAM do projektowania kształtek blaszanych i chemoodpornych instalacji wentylacyjnych.')}</p>
              <p>© ALNOR Sp. z o.o.</p>
            </InfoDialog>
          )}
          {showHelp && (
            <InfoDialog title={t('Opis programu')} onClose={() => setShowHelp(false)}>
              <p>{t('Wygenerowany plik zestawienia należy przesłać do ALNOR Sp. z o.o.')}</p>
              <p>
                <a href="mailto:alnor@alnor.com.pl">alnor@alnor.com.pl</a>
                {'\n'}tel. 022 737 40 00
              </p>
              <p>{t('Zamówienie na preferencyjnych warunkach, ze względu na przesłanie danych przygotowanych na produkcję.')}</p>
              <p>{t('Aby zachować zgodność z obliczeniami powierzchni, prowadzonymi w ALNORze należy w polu zaokrągleń "m2" zachować wartość 1.0 m2.')}</p>
              <p>{t('Po wybraniu elementu z listy podajemy jego główne wymiary np. dla łuku podajemy tylko przekrój A i B, resztę wymiarów i parametrów wygeneruje program, można je oczywiście zmienić.')}</p>
              <p>{t('Przycisk "Odśwież" spowoduje odnowienie rysunku elementu wg. podanych wymiarów.')}</p>
              <p>{t('Zdefiniowany wymiarowo element umieszczamy w zestawieniu przyciskając "Dodaj". Pozycje możemy też usuwać z zestawienia ("Usuń"), pobierać z zestawienia do edycji ("Edytuj"). Możemy też wstawić element w środek zestawienia przyciskiem "Wstaw za".')}</p>
              <p>{t('Do wybrania elementu z listy kształtek można też zamiast myszki użyć klawiszy PgDn/PgUp.')}</p>
              <p>{t('Aby obracać widok trójwymiarowy elementu, najeżdżamy na niego myszką i przeciągamy. Możemy też powiększać i zmniejszać widok trójwymiarowy kółkiem myszy.')}</p>
              <p>{t('Gotowe zestawienie, po podaniu "Danych osobowych i opisowych", należy zapisać w pliku ("Zapisz") i przesłać do ALNOR Sp. z o.o. na adres podany powyżej, jako załącznik do e-maila.')}</p>
              <p>{t('Zestawienie można również wyeksportować do pliku CSV na własne potrzeby (uwaga, ten format nie służy do przesłania do Alnora).')}</p>
            </InfoDialog>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            data-testid="file-input"
            hidden
          />
          <ShapeList
            shapes={SHAPE_DEFINITIONS}
            selectedSymbol={selectedSymbol}
            onSelect={handleSelectShape}
            disabled={isUserElement}
            t={t}
            rememberValues={rememberValues}
            onToggleRememberValues={setRememberValues}
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
                    <div className="number-stepper">
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
                      <span className="number-stepper-buttons">
                        <button
                          type="button"
                          tabIndex={-1}
                          className="number-stepper-btn number-stepper-btn-up"
                          onClick={() => setSztuk(String((parseInt(sztuk) || 1) + 1))}
                          aria-label="increment"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          className="number-stepper-btn number-stepper-btn-down"
                          onClick={() => setSztuk(String(Math.max(1, (parseInt(sztuk) || 1) - 1)))}
                          aria-label="decrement"
                        />
                      </span>
                    </div>
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
                      }}
                      onFocus={(e) => e.currentTarget.select()}
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
              <div className="shape-diagram-wrapper">
                <div className="diagram-color-controls" title={t('Kolory')}>
                  <label title={t('Kreska rysunku')}>
                    <input
                      type="color"
                      value={diagramLineColor}
                      onChange={(e) => setDiagramLineColor(e.target.value)}
                    />
                  </label>
                  <label title={t('Tło rysunku')}>
                    <input
                      type="color"
                      value={diagramBackgroundColor}
                      onChange={(e) => setDiagramBackgroundColor(e.target.value)}
                    />
                  </label>
                </div>
                <ShapeDiagram
                  symbol={selectedSymbol}
                  values={dimensionValues.map((v) => parseFloat(v) || 0)}
                  labels={currentShape.labels}
                  t={t}
                  lineColor={diagramLineColor}
                  backgroundColor={diagramBackgroundColor}
                />
              </div>
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
                    else if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      document.querySelector<HTMLInputElement>('[data-testid="dim-0"]')?.focus();
                    }
                  }}
                  onFocus={(e) => e.currentTarget.select()}
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
                ranges={fieldRanges}
                onEnter={handleAdd}
              />
              <div className="summary-fields">
                <div className="summary-row">
                  <label>{t('Sztuk')}</label>
                  <div className="number-stepper">
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
                    <span className="number-stepper-buttons">
                      <button
                        type="button"
                        tabIndex={-1}
                        className="number-stepper-btn number-stepper-btn-up"
                        onClick={() => setSztuk(String((parseInt(sztuk) || 1) + 1))}
                        aria-label="increment"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        className="number-stepper-btn number-stepper-btn-down"
                        onClick={() => setSztuk(String(Math.max(1, (parseInt(sztuk) || 1) - 1)))}
                        aria-label="decrement"
                      />
                    </span>
                  </div>
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
                  <textarea
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
                onBlachaChange={handleBlachaChange}
                material={material}
                onMaterialChange={handleMaterialChange}
                wykonanie={wykonanie}
                onWykonanieChange={handleWykonanieChange}
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
                thicknessWarning={blachaWarning}
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
            <button className="btn btn-action" data-testid="btn-add" onClick={handleAdd}>{editingRowId ? t('Zapisz') : t('Dodaj')}</button>
            <button className="btn btn-danger" onClick={handleDelete}>{t('Usuń')}</button>
            <button className="btn btn-action" onClick={handleEdit} disabled={!!editingRowId || !selectedRowId}>{t('Edytuj')}</button>
            {editingRowId && (
              <button className="btn" onClick={() => setEditingRowId(null)}>{t('Anuluj')}</button>
            )}
            <button className="btn btn-action" onClick={handleInsertAfter}>{t('Wstaw za')} ...</button>
            <KotInfo
              report={kotStatus}
              shapeName={t(currentShape.name)}
              onMakeCompliant={handleMakeKotCompliant}
              t={t}
            />
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
