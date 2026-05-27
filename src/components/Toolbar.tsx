import React from 'react';
import type { SystemType } from '../types';

interface ToolbarProps {
  systemType: SystemType;
  onSystemTypeChange: (type: SystemType) => void;
  onNew: () => void;
  onSave: () => void;
  onLoad: () => void;
  sumaBlachyReport: string;
}

const Toolbar: React.FC<ToolbarProps> = ({
  systemType,
  onSystemTypeChange,
  onNew,
  onSave,
  onLoad,
  sumaBlachyReport,
}) => {
  const [sumaExpanded, setSumaExpanded] = React.useState(true);
  const hasSumaData = sumaBlachyReport.trim().length > 0;

  return (
    <div className="toolbar">
      <div className="toolbar-buttons">
        <button className="btn btn-primary" onClick={onNew}>Nowy</button>
        <button className="btn btn-primary" onClick={onLoad}>Pobierz</button>
        <button className="btn btn-primary" onClick={onSave}>Zapisz</button>
      </div>

      <button className="btn btn-secondary">Dane osobowe i opisowe ...</button>

      <button
        className="btn btn-secondary suma-blachy-toggle"
        onClick={() => setSumaExpanded((v) => !v)}
        title={hasSumaData ? sumaBlachyReport : 'Brak danych do wyliczenia'}
      >
        <span>Suma blachy</span>
        <span className={`suma-icon${sumaExpanded ? ' expanded' : ''}`}>▸</span>
      </button>

      {sumaExpanded && (
        <div
          className="suma-blachy-panel"
          title={hasSumaData ? sumaBlachyReport : 'Brak danych do wyliczenia'}
        >
          {hasSumaData ? (
            <table className="suma-table">
              <colgroup>
                <col className="suma-col-material" />
                <col className="suma-col-gr" />
                <col className="suma-col-typ" />
                <col className="suma-col-value" />
              </colgroup>
              <thead>
                <tr className="suma-head-row">
                  <th>Materiał</th>
                  <th className="suma-head-gr">Gr.</th>
                  <th>Typ</th>
                  <th className="suma-head-value">Suma</th>
                </tr>
              </thead>
              <tbody>
                {sumaBlachyReport.split('\n').map((line, idx) => {
                  const trimmed = line.trim();
                  if (!trimmed) {
                    return (
                      <tr key={idx} className="suma-row-gap">
                        <td colSpan={4}>&nbsp;</td>
                      </tr>
                    );
                  }

                  if (trimmed.endsWith(':')) {
                    return (
                      <tr key={idx} className="suma-section-row">
                        <td colSpan={4} className="suma-section-title">{trimmed}</td>
                      </tr>
                    );
                  }

                  const parts = trimmed.split(':');
                  if (parts.length >= 2) {
                    const label = parts[0].trim();
                    const value = parts.slice(1).join(':').trim();

                    const parsed = label.match(/^(Iz\.\s+)?(Ocynk|Kwasówka|Aluminium)\s+([0-9,]+)\s+(kan|ksz)$/);
                    if (parsed) {
                      const prefix = parsed[1] ? 'Iz.' : '';
                      const material = parsed[2];
                      const thick = parsed[3];
                      const typ = parsed[4];
                      return (
                        <tr key={idx} className="suma-data-row">
                          <td className="suma-row-label">{prefix ? `${prefix} ${material}` : material}</td>
                          <td className="suma-row-label">{thick}</td>
                          <td className="suma-row-label">{typ}</td>
                          <td className="suma-row-value">{value}</td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={idx} className="suma-data-row">
                        <td className="suma-row-label" colSpan={3}>{label}</td>
                        <td className="suma-row-value">{value}</td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={idx} className="suma-data-row">
                      <td colSpan={4} className="suma-line">{trimmed}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : <div className="suma-line">Brak danych do wyliczenia.</div>}
        </div>
      )}

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
