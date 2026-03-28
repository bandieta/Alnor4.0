import React from 'react';
import type { SystemType } from '../types';

interface ToolbarProps {
  systemType: SystemType;
  onSystemTypeChange: (type: SystemType) => void;
  onNew: () => void;
  onSave: () => void;
  onLoad: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  systemType,
  onSystemTypeChange,
  onNew,
  onSave,
  onLoad,
}) => {
  return (
    <div className="toolbar">
      <div className="toolbar-buttons">
        <button className="btn btn-primary" onClick={onNew}>Nowy</button>
        <button className="btn btn-primary" onClick={onLoad}>Pobierz</button>
        <button className="btn btn-primary" onClick={onSave}>Zapisz</button>
      </div>

      <button className="btn btn-secondary">Dane osobowe i opisowe ...</button>

      <button className="btn btn-secondary">Suma blachy</button>

      <fieldset className="system-fieldset">
        <legend>System kształtek</legend>
        <label className="radio-label">
          <input
            type="radio"
            name="system"
            checked={systemType === 'prostokatne'}
            onChange={() => onSystemTypeChange('prostokatne')}
          />
          <span>Prostokątne</span>
        </label>
        <label className="radio-label">
          <input
            type="radio"
            name="system"
            checked={systemType === 'prostokatne_izolowane'}
            onChange={() => onSystemTypeChange('prostokatne_izolowane')}
          />
          <span>Prostokątne izolowane</span>
        </label>
        <label className="radio-label">
          <input
            type="radio"
            name="system"
            checked={systemType === 'element_uzytkownika'}
            onChange={() => onSystemTypeChange('element_uzytkownika')}
          />
          <span>Element użytkownika</span>
        </label>
      </fieldset>
    </div>
  );
};

export default Toolbar;
