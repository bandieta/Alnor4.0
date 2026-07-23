import React from 'react';
import type { SystemType } from '../types';

interface ToolbarProps {
  systemType: SystemType;
  onSystemTypeChange: (type: SystemType) => void;
  onNew: () => void;
  onSave: () => void;
  onLoad: () => void;
  sumaBlachyReport: string;
  t: (text: string) => string;
}

const Toolbar: React.FC<ToolbarProps> = ({
  systemType,
  onSystemTypeChange,
  onNew,
  onSave,
  onLoad,
  sumaBlachyReport,
  t,
}) => {
  const [sumaExpanded, setSumaExpanded] = React.useState(true);
  const hasSumaData = sumaBlachyReport.trim().length > 0;
  const translateSumaSection = (label: string) => {
    const normalized = label.replace(/:$/, '').trim();
    return `${t(normalized)}:`;
  };

  const translateSumaType = (value: string) => {
    if (value === 'kan') return t('Kanał');
    if (value === 'ksz') return t('Kształtka');
    return value;
  };

  const translateSumaLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed.endsWith(':')) return translateSumaSection(trimmed);

    const parsed = trimmed.match(/^(Iz\.\s+)?(Ocynk|Kwasówka|Aluminium)\s+([0-9,]+)\s+(kan|ksz):\s+(.+)$/);
    if (parsed) {
      const prefix = parsed[1] ? `${t('Izolowane')} ` : '';
      const material = t(parsed[2]);
      const thick = parsed[3];
      const typ = translateSumaType(parsed[4]);
      const value = parsed[5];
      return `${prefix}${material} ${thick} ${typ}: ${value}`;
    }

    const parts = trimmed.split(':');
    if (parts.length >= 2) {
      const label = t(parts[0].trim());
      return `${label}: ${parts.slice(1).join(':').trim()}`;
    }

    return t(trimmed);
  };

  const translatedSumaTitle = hasSumaData
    ? sumaBlachyReport.split('\n').map(translateSumaLine).join('\n')
    : t('Brak danych do wyliczenia');

  return (
    <div className="toolbar">
      <div className="toolbar-buttons">
        <button className="btn btn-primary" onClick={onNew}>{t('Nowy')}</button>
        <button className="btn btn-primary" onClick={onLoad}>{t('Pobierz')}</button>
        <button className="btn btn-primary" onClick={onSave}>{t('Zapisz')}</button>
      </div>

      <button className="btn btn-secondary">{t('Dane osobowe i opisowe')} ...</button>

      <button
        className="btn btn-secondary suma-blachy-toggle"
        onClick={() => setSumaExpanded((v) => !v)}
        title={translatedSumaTitle}
      >
        <span>{t('Suma blachy')}</span>
        <span className={`suma-icon${sumaExpanded ? ' expanded' : ''}`}>▸</span>
      </button>

      {sumaExpanded && (
        <div
          className="suma-blachy-panel"
          title={translatedSumaTitle}
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
                  <th>{t('Materiał')}</th>
                  <th className="suma-head-gr">{t('Grubość')}</th>
                  <th>{t('Typ')}</th>
                  <th className="suma-head-value">{t('Suma')}</th>
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
                        <td colSpan={4} className="suma-section-title">{translateSumaSection(trimmed)}</td>
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
                          <td className="suma-row-label">{prefix ? `${t('Izolowane')} ${t(material)}` : t(material)}</td>
                          <td className="suma-row-label">{thick}</td>
                          <td className="suma-row-label">{translateSumaType(typ)}</td>
                          <td className="suma-row-value">{value}</td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={idx} className="suma-data-row">
                        <td className="suma-row-label" colSpan={3}>{t(label)}</td>
                        <td className="suma-row-value">{value}</td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={idx} className="suma-data-row">
                      <td colSpan={4} className="suma-line">{t(trimmed)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
                  ) : <div className="suma-line">{t('Brak danych do wyliczenia')}.</div>}
        </div>
      )}

      <fieldset className="system-fieldset">
        <legend>{t('System kształtek')}</legend>
        <label className="radio-label">
          <input
            type="radio"
            name="system"
            checked={systemType === 'prostokatne'}
            onChange={() => onSystemTypeChange('prostokatne')}
          />
          <span>{t('Prostokątne')}</span>
        </label>
        <label className="radio-label">
          <input
            type="radio"
            name="system"
            checked={systemType === 'prostokatne_izolowane'}
            onChange={() => onSystemTypeChange('prostokatne_izolowane')}
          />
          <span>{t('Prostokątne izolowane')}</span>
        </label>
        <label className="radio-label">
          <input
            type="radio"
            name="system"
            checked={systemType === 'element_uzytkownika'}
            onChange={() => onSystemTypeChange('element_uzytkownika')}
          />
          <span>{t('Element użytkownika')}</span>
        </label>
      </fieldset>
    </div>
  );
};

export default Toolbar;
