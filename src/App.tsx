import { useState, useCallback, useMemo } from 'react';
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
} from './data';
import { calculateArea, generateSymbol, generatePrzekroj } from './calculations';
import type { GridRow, SystemType, MaterialType, Ksztaltka } from './types';
import './App.css';

function App() {
  // System type
  const [systemType, setSystemType] = useState<SystemType>('prostokatne');

  // Selected shape
  const [selectedSymbol, setSelectedSymbol] = useState('QDa');

  // Designation counter
  const [nextOznaczenie, setNextOznaczenie] = useState(100);
  const [oznaczenie, setOznaczenie] = useState('100');
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
  const [material, setMaterial] = useState('Aluminium');
  const [wykonanie, setWykonanie] = useState('Niskociśnieniowe');
  const [klasaSzczelnosci, setKlasaSzczelnosci] = useState('A');
  const [lwzmoc, setLwzmoc] = useState('2krzyżowe');
  const [ramkiWL, setRamkiWL] = useState('P30');
  const [ramkiWYL, setRamkiWYL] = useState('P20');
  const [ramkiOd, setRamkiOd] = useState('P40');

  // Grid data
  const [gridRows, setGridRows] = useState<GridRow[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // Validation highlight trigger
  const [showValidation, setShowValidation] = useState(false);

  // Editing mode — stores the row ID being edited
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  // Get current shape definition
  const currentShape = useMemo(
    () => SHAPE_DEFINITIONS.find((s) => s.symbol === selectedSymbol) || SHAPE_DEFINITIONS[0],
    [selectedSymbol]
  );

  // Calculate area
  const calculatedArea = useMemo(() => {
    const numValues = dimensionValues.map((v) => parseFloat(v) || 0);
    const area = calculateArea(selectedSymbol, numValues);
    const minArea = parseFloat(minM2) || 0;
    return Math.max(area, minArea) * (parseInt(sztuk) || 1);
  }, [selectedSymbol, dimensionValues, minM2, sztuk]);

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
        errors.push({ index: i, message: 'Wymagane' });
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
  }, [selectedSymbol, dimensionValues, material, materialType, currentShape.labels]);

  // Generate full symbol
  const fullSymbol = useMemo(() => {
    const numValues = dimensionValues.map((v) => parseFloat(v) || 0);
    return generateSymbol(selectedSymbol, material, wykonanie, numValues);
  }, [selectedSymbol, material, wykonanie, dimensionValues]);

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
    // Validate before adding
    if (validationErrors.length > 0) {
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
      oznaczenie: oznaczenie,
      nazwa: shapeName,
      sztuk: sztuk,
      uwagi: uwagi,
      przekroj: calculatedPrzekroj,
      material: material,
      materialChemo: '',
      gruboscChemo: '',
      wykonanieChemo: '',
      isChemo: materialType === 'chemo',
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
      powierznia: (unitArea * qty).toFixed(2),
      powierzniaIz: '',
      pelny_symbol: fullSymbol,
      pelny_symbolIz: '',
      izolowana: systemType === 'prostokatne_izolowane',
      plaszcz: '',
      gruboscIlozacji: '',
      tab: dimensionValues,
    };

    const newRow: GridRow = {
      id: crypto.randomUUID(),
      oznaczenie: oznaczenie,
      nazwa: shapeName,
      symbol: fullSymbol,
      sztuk: qty,
      material: material,
      m2: unitArea * qty,
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
      setNextOznaczenie((prev) => prev + 1);
      setOznaczenie(String(nextOznaczenie + 1));
    }
  }, [
    validationErrors, dimensionValues, selectedSymbol, oznaczenie, shapeName, sztuk, uwagi,
    material, materialType, blacha, wykonanie, klasaSzczelnosci, lwzmoc,
    ramkiWL, ramkiWYL, ramkiOd, systemType, fullSymbol, calculatedPrzekroj,
    minM2, nextOznaczenie, editingRowId,
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

    setSelectedSymbol(row.shapeSymbol);
    setDimensionValues(row.tab);
    setOznaczenie(row.oznaczenie);
    setSztuk(String(row.sztuk));
    setUwagi(row.uwagi);
    setMaterial(row.material);
    setEditingRowId(selectedRowId);
  }, [selectedRowId, gridRows]);

  // Insert after selected
  const handleInsertAfter = useCallback(() => {
    if (!selectedRowId) {
      handleAdd();
      return;
    }

    const numValues = dimensionValues.map((v) => parseFloat(v) || 0);
    const area = calculateArea(selectedSymbol, numValues);
    const unitArea = Math.max(area, parseFloat(minM2) || 0);
    const qty = parseInt(sztuk) || 1;

    const newRow: GridRow = {
      id: crypto.randomUUID(),
      oznaczenie: oznaczenie,
      nazwa: shapeName,
      symbol: fullSymbol,
      sztuk: qty,
      material: material,
      m2: unitArea * qty,
      przekroj: calculatedPrzekroj,
      uwagi: uwagi,
      shapeSymbol: selectedSymbol,
      tab: dimensionValues,
      ksztaltka: {} as Ksztaltka,
    };

    setGridRows((prev) => {
      const idx = prev.findIndex((r) => r.id === selectedRowId);
      const next = [...prev];
      next.splice(idx + 1, 0, newRow);
      return next;
    });
    setNextOznaczenie((prev) => prev + 1);
    setOznaczenie(String(nextOznaczenie + 1));
  }, [
    selectedRowId, dimensionValues, selectedSymbol, oznaczenie, shapeName,
    sztuk, uwagi, material, fullSymbol, calculatedPrzekroj, minM2,
    nextOznaczenie, handleAdd,
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
          alert('Błąd wczytywania pliku');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  // Refresh/recalculate all rows
  const handleRefresh = useCallback(() => {
    setGridRows((prev) =>
      prev.map((row) => {
        const numValues = row.tab.map((v) => parseFloat(v) || 0);
        const area = calculateArea(row.shapeSymbol, numValues);
        const unitArea = Math.max(area, parseFloat(minM2) || 0);
        return {
          ...row,
          m2: unitArea * row.sztuk,
          symbol: generateSymbol(row.shapeSymbol, row.material, row.ksztaltka?.wykonanie || wykonanie, numValues),
        };
      })
    );
  }, [minM2, wykonanie]);

  // Calculate total area
  const totalM2 = useMemo(() => gridRows.reduce((sum, r) => sum + r.m2, 0), [gridRows]);

  return (
    <div className="app">
      <div className="app-body">
        {/* Left sidebar */}
        <div className="left-panel">
          <div className="sidebar-header">
            <span className="logo">Alnor<span className="logo-accent">CAM</span></span>
          </div>
          <Toolbar
            systemType={systemType}
            onSystemTypeChange={setSystemType}
            onNew={handleNew}
            onSave={handleSave}
            onLoad={handleLoad}
          />
          <ShapeList
            shapes={SHAPE_DEFINITIONS}
            selectedSymbol={selectedSymbol}
            onSelect={handleSelectShape}
          />
        </div>

        {/* Main content */}
        <div className="main-panel">
          {/* Editor panel — stacked rows like original WinForms */}
          <div className="editor-panel">
            {/* Row 1: 3D + 2D diagrams side by side */}
            <div className="diagrams-row">
              <ShapeDiagram3D
                symbol={selectedSymbol}
                values={dimensionValues.map((v) => parseFloat(v) || 0)}
              />
              <ShapeDiagram
                symbol={selectedSymbol}
                values={dimensionValues.map((v) => parseFloat(v) || 0)}
                labels={currentShape.labels}
              />
            </div>

            {/* Row 2: oznaczenie + shape name + symbol */}
            <div className="shape-info-row">
              <div className="oznaczenie-row">
                <span className="label">Oznaczenie</span>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={oznaczenieEnabled}
                    onChange={(e) => setOznaczenieEnabled(e.target.checked)}
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
              <div className="shape-name-display">{shapeName}</div>
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
                  <label>Sztuk</label>
                  <input
                    type="number"
                    value={sztuk}
                    onChange={(e) => setSztuk(e.target.value)}
                    className="summary-input"
                  />
                </div>
                <div className="summary-row">
                  <label>m²</label>
                  <span className="summary-input summary-input-readonly">
                    {calculatedArea.toFixed(2)}
                  </span>
                </div>
                <div className="summary-row">
                  <label>Uwagi</label>
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
                onMaterialTypeChange={setMaterialType}
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
                blachaOptions={BLACHA_OPTIONS}
                materialOptions={MATERIAL_OPTIONS}
                wykonanieOptions={WYKONANIE_OPTIONS}
                klasaOptions={KLASA_SZCZELNOSCI_OPTIONS}
                wzmocOptions={WZMOCNIENIE_OPTIONS}
                ramkiWLOptions={RAMKI_WL_OPTIONS}
                ramkiWYLOptions={RAMKI_WYL_OPTIONS}
                ramkiOdOptions={RAMKI_OD_OPTIONS}
              />
            </div>
          </div>

          {/* Action buttons — toolbar above the element list (koszyk) */}
          <div className="action-buttons">
            <button className="btn" onClick={handleRefresh}>Odśwież</button>
            <span className="min-m2-group">
              <label>Min.m2</label>
              <input
                type="text"
                value={minM2}
                onChange={(e) => setMinM2(e.target.value)}
                className="min-m2-input"
              />
            </span>
            <button className="btn btn-action" onClick={handleAdd}>{editingRowId ? 'Zapisz' : 'Dodaj'}</button>
            <button className="btn btn-danger" onClick={handleDelete}>Usuń</button>
            <button className="btn btn-action" onClick={handleEdit} disabled={!!editingRowId}>Edytuj</button>
            <button className="btn btn-action" onClick={handleInsertAfter}>Wstaw za ...</button>
            <button className="btn btn-kot">KOT</button>
          </div>

          {/* Data grid */}
          <DataGrid
            rows={gridRows}
            selectedRowId={selectedRowId}
            onSelectRow={setSelectedRowId}
          />

          {/* Total */}
          {gridRows.length > 0 && (
            <div className="total-bar">
              Suma m²: <strong>{totalM2.toFixed(2)}</strong> | Elementów: <strong>{gridRows.length}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
