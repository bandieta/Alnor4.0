import React from 'react';
import type { MaterialType } from '../types';

export interface PropertyError {
  message: string;
  /** value the "apply" chip sets the field to (frame rules only) */
  suggest?: string;
}

interface PropertiesPanelProps {
  materialType: MaterialType;
  onMaterialTypeChange: (type: MaterialType) => void;
  t: (text: string) => string;
  
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

  // Validation errors (keyed by field name). `suggest` is a ready-to-apply value.
  propertyErrors?: Record<string, PropertyError>;

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
  t,
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
  const err = (field: string): PropertyError | undefined => propertyErrors[field];
  const rowClass = (field: string, disabled?: boolean) =>
    `property-row${err(field) ? ' property-row-error' : ''}${disabled ? ' property-row-disabled' : ''}`;

  // Ramka (frame) row: dropdown + an inline hint carrying the validation rule and
  // a one-click "apply the minimum allowed frame" action.
  const renderRamka = (
    field: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
    options: string[],
  ) => {
    const e = err(field);
    return (
      <div className={`${rowClass(field, isChemo)}${e ? ' property-row--withHint' : ''}`}>
        <label>{t(label)}</label>
        <select
          value={value}
          onChange={(ev) => onChange(ev.target.value)}
          disabled={isChemo}
          data-testid={`prop-${field}`}
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        {e && !isChemo && (
          <div className="property-hint" data-testid={`prop-hint-${field}`} role="alert">
            <span className="property-hint-msg">{e.message}</span>
            {e.suggest && (
              <button
                type="button"
                className="property-suggest-chip"
                data-testid={`prop-suggest-${field}`}
                onClick={() => onChange(e.suggest!)}
                title={`${t('Ustaw')} ${e.suggest}`}
              >
                {t('Ustaw')} {e.suggest}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="properties-panel">
      {/* B/C toggle — hidden in insulated mode (forced to Blacha) */}
      {isIzolowane ? (
      <div className="material-type-toggle">
        <span style={{ fontSize: 11, fontWeight: 700, color: '#004290' }}>{t('Blacha')}</span>
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

      <div className={rowClass('material')} title={err('material')?.message || ''}>
        <label>{t('Materiał')}</label>
        <select value={material} onChange={(e) => onMaterialChange(e.target.value)}>
          {materialOptions.map(o => <option key={o} value={o}>{t(o)}</option>)}
        </select>
      </div>

      {/* Plaszcz + Grubość izolacji — only in insulated mode */}
      {isIzolowane && (
        <>
          <div className="property-row">
            <label>{t('Płaszcz zew.')}</label>
            <select value={plaszcz} onChange={(e) => onPlaszczChange(e.target.value)}>
              {plaszczOptions.map(o => <option key={o} value={o}>{t(o)}</option>)}
            </select>
          </div>
          <div className="property-row">
            <label>{t('Grubość izolacji')}</label>
            <select value={gruboscIzolacji} onChange={(e) => onGruboscIzolacjiChange(e.target.value)}>
              {gruboscIzolacjiOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </>
      )}

      <div className={rowClass('wykonanie')} title={err('wykonanie')?.message || ''}>
        <label>{t('Wykonanie')}</label>
        <select value={wykonanie} onChange={(e) => onWykonanieChange(e.target.value)}>
          {wykonanieOptions.map(o => <option key={o} value={o}>{t(o)}</option>)}
        </select>
      </div>

      <div className={rowClass('klasaSzczelnosci', isChemo)} title={err('klasaSzczelnosci')?.message || ''}>
        <label>{t('Kl.szczel.')}</label>
        <select value={klasaSzczelnosci} onChange={(e) => onKlasaSzczelnosciChange(e.target.value)} disabled={isChemo}>
          {klasaOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div className={rowClass('lwzmoc', isChemo)} title={err('lwzmoc')?.message || ''}>
        <label>{t('L.wzmoc.')}</label>
        <select value={lwzmoc} onChange={(e) => onLwzmocChange(e.target.value)} disabled={isChemo}>
          {wzmocOptions.map(o => <option key={o} value={o}>{t(o)}</option>)}
        </select>
      </div>

      {renderRamka('ramkiWL', 'RamkiWL', ramkiWL, onRamkiWLChange, ramkiWLOptions)}
      {renderRamka('ramkiWYL', 'RamkiWYL', ramkiWYL, onRamkiWYLChange, ramkiWYLOptions)}
      {renderRamka('ramkiOd', 'RamkiOd', ramkiOd, onRamkiOdChange, ramkiOdOptions)}
    </div>
  );
};

export default PropertiesPanel;
