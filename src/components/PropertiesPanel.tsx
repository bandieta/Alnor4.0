import React from 'react';
import type { MaterialType } from '../types';

interface PropertiesPanelProps {
  materialType: MaterialType;
  onMaterialTypeChange: (type: MaterialType) => void;
  
  // Blacha properties
  blacha: string;
  onBlachaChange: (v: string) => void;
  material: string;
  onMaterialChange: (v: string) => void;
  wykonanie: string;
  onWykonanieChange: (v: string) => void;
  klasaSzczelnosci: string;
  onKlasaSzczelnosciChange: (v: string) => void;
  lwzmoc: string;
  onLwzmocChange: (v: string) => void;
  ramkiWL: string;
  onRamkiWLChange: (v: string) => void;
  ramkiWYL: string;
  onRamkiWYLChange: (v: string) => void;
  ramkiOd: string;
  onRamkiOdChange: (v: string) => void;

  // Options arrays
  blachaOptions: string[];
  materialOptions: string[];
  wykonanieOptions: string[];
  klasaOptions: string[];
  wzmocOptions: string[];
  ramkiWLOptions: string[];
  ramkiWYLOptions: string[];
  ramkiOdOptions: string[];

  // Validation errors (keyed by field name)
  propertyErrors?: Record<string, string>;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  materialType,
  onMaterialTypeChange,
  blacha,
  onBlachaChange,
  material,
  onMaterialChange,
  wykonanie,
  onWykonanieChange,
  klasaSzczelnosci,
  onKlasaSzczelnosciChange,
  lwzmoc,
  onLwzmocChange,
  ramkiWL,
  onRamkiWLChange,
  ramkiWYL,
  onRamkiWYLChange,
  ramkiOd,
  onRamkiOdChange,
  blachaOptions,
  materialOptions,
  wykonanieOptions,
  klasaOptions,
  wzmocOptions,
  ramkiWLOptions,
  ramkiWYLOptions,
  ramkiOdOptions,
  propertyErrors = {},
}) => {
  const err = (field: string) => propertyErrors[field];
  const rowClass = (field: string) =>
    `property-row${err(field) ? ' property-row-error' : ''}`;

  return (
    <div className="properties-panel">
      <div className="material-type-toggle">
        <label className="radio-label">
          <input
            type="radio"
            name="materialType"
            checked={materialType === 'blacha'}
            onChange={() => onMaterialTypeChange('blacha')}
          />
          <span>B</span>
        </label>
        <label className="radio-label">
          <input
            type="radio"
            name="materialType"
            checked={materialType === 'chemo'}
            onChange={() => onMaterialTypeChange('chemo')}
          />
          <span>C</span>
        </label>
        <select className="prop-select blacha-select" value={blacha} onChange={(e) => onBlachaChange(e.target.value)}>
          {blachaOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div className={rowClass('material')} title={err('material') || ''}>
        <label>Materiał</label>
        <select value={material} onChange={(e) => onMaterialChange(e.target.value)}>
          {materialOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div className={rowClass('wykonanie')} title={err('wykonanie') || ''}>
        <label>Wykonanie</label>
        <select value={wykonanie} onChange={(e) => onWykonanieChange(e.target.value)}>
          {wykonanieOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div className={rowClass('klasaSzczelnosci')} title={err('klasaSzczelnosci') || ''}>
        <label>Kl.szczel.</label>
        <select value={klasaSzczelnosci} onChange={(e) => onKlasaSzczelnosciChange(e.target.value)}>
          {klasaOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div className={rowClass('lwzmoc')} title={err('lwzmoc') || ''}>
        <label>L.wzmoc.</label>
        <select value={lwzmoc} onChange={(e) => onLwzmocChange(e.target.value)}>
          {wzmocOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div className={rowClass('ramkiWL')} title={err('ramkiWL') || ''}>
        <label>RamkiWL</label>
        <select value={ramkiWL} onChange={(e) => onRamkiWLChange(e.target.value)}>
          {ramkiWLOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div className={rowClass('ramkiWYL')} title={err('ramkiWYL') || ''}>
        <label>RamkiWYL</label>
        <select value={ramkiWYL} onChange={(e) => onRamkiWYLChange(e.target.value)}>
          {ramkiWYLOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div className={rowClass('ramkiOd')} title={err('ramkiOd') || ''}>
        <label>RamkiOd</label>
        <select value={ramkiOd} onChange={(e) => onRamkiOdChange(e.target.value)}>
          {ramkiOdOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    </div>
  );
};

export default PropertiesPanel;
