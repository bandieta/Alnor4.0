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

  // Chemo mode disables certain fields
  isChemo: boolean;

  // Insulation fields (visible when prostokatne_izolowane)
  isIzolowane: boolean;
  plaszcz: string;
  onPlaszczChange: (v: string) => void;
  gruboscIzolacji: string;
  onGruboscIzolacjiChange: (v: string) => void;
  plaszczOptions: string[];
  gruboscIzolacjiOptions: string[];
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
  isChemo,
  isIzolowane,
  plaszcz,
  onPlaszczChange,
  gruboscIzolacji,
  onGruboscIzolacjiChange,
  plaszczOptions,
  gruboscIzolacjiOptions,
}) => {
  const err = (field: string) => propertyErrors[field];
  const rowClass = (field: string, disabled?: boolean) =>
    `property-row${err(field) ? ' property-row-error' : ''}${disabled ? ' property-row-disabled' : ''}`;

  return (
    <div className="properties-panel">
      {/* B/C toggle — hidden in insulated mode (forced to Blacha) */}
      {isIzolowane ? (
      <div className="material-type-toggle">
        <span style={{ fontSize: 11, fontWeight: 700, color: '#004290' }}>Blacha</span>
        <select className="prop-select blacha-select" value={blacha} onChange={(e) => onBlachaChange(e.target.value)}>
          {blachaOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      ) : (
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
      )}

      <div className={rowClass('material')} title={err('material') || ''}>
        <label>Materiał</label>
        <select value={material} onChange={(e) => onMaterialChange(e.target.value)}>
          {materialOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      {/* Plaszcz + Grubość izolacji — only in insulated mode */}
      {isIzolowane && (
        <>
          <div className="property-row">
            <label>Płaszcz zew.</label>
            <select value={plaszcz} onChange={(e) => onPlaszczChange(e.target.value)}>
              {plaszczOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="property-row">
            <label>Grubość izol.</label>
            <select value={gruboscIzolacji} onChange={(e) => onGruboscIzolacjiChange(e.target.value)}>
              {gruboscIzolacjiOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </>
      )}

      <div className={rowClass('wykonanie')} title={err('wykonanie') || ''}>
        <label>Wykonanie</label>
        <select value={wykonanie} onChange={(e) => onWykonanieChange(e.target.value)}>
          {wykonanieOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div className={rowClass('klasaSzczelnosci', isChemo)} title={err('klasaSzczelnosci') || ''}>
        <label>Kl.szczel.</label>
        <select value={klasaSzczelnosci} onChange={(e) => onKlasaSzczelnosciChange(e.target.value)} disabled={isChemo}>
          {klasaOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div className={rowClass('lwzmoc', isChemo)} title={err('lwzmoc') || ''}>
        <label>L.wzmoc.</label>
        <select value={lwzmoc} onChange={(e) => onLwzmocChange(e.target.value)} disabled={isChemo}>
          {wzmocOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div className={rowClass('ramkiWL', isChemo)} title={err('ramkiWL') || ''}>
        <label>RamkiWL</label>
        <select value={ramkiWL} onChange={(e) => onRamkiWLChange(e.target.value)} disabled={isChemo}>
          {ramkiWLOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div className={rowClass('ramkiWYL', isChemo)} title={err('ramkiWYL') || ''}>
        <label>RamkiWYL</label>
        <select value={ramkiWYL} onChange={(e) => onRamkiWYLChange(e.target.value)} disabled={isChemo}>
          {ramkiWYLOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div className={rowClass('ramkiOd', isChemo)} title={err('ramkiOd') || ''}>
        <label>RamkiOd</label>
        <select value={ramkiOd} onChange={(e) => onRamkiOdChange(e.target.value)} disabled={isChemo}>
          {ramkiOdOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    </div>
  );
};

export default PropertiesPanel;
