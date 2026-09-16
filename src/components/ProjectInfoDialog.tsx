import React, { useEffect, useState } from 'react';
import type { ProjectInfo } from '../types';

interface ProjectInfoDialogProps {
  info: ProjectInfo;
  onSave: (info: ProjectInfo) => void;
  onClose: () => void;
  t: (text: string) => string;
}

/**
 * Port of the legacy "Dane" dialog (Form3.cs) — order/project header fields
 * (nazwa zestawienia / zamawiający / data), stored on every saved Ksztaltka
 * as Qnazwa/Qzamawia/Qdata so files stay legacy-compatible.
 */
const ProjectInfoDialog: React.FC<ProjectInfoDialogProps> = ({ info, onSave, onClose, t }) => {
  const [nazwa, setNazwa] = useState(info.nazwa);
  const [zamawia, setZamawia] = useState(info.zamawia);
  const [data, setData] = useState(info.data);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSave = () => {
    onSave({ nazwa, zamawia, data });
    onClose();
  };

  return (
    <div className="project-info-modal-overlay" onMouseDown={onClose}>
      <div className="project-info-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="project-info-modal-header">
          <span>{t('Dane osobowe i opisowe')}</span>
        </div>
        <div className="project-info-modal-body">
          <div className="property-row">
            <label>{t('Nazwa zestawienia')}</label>
            <input
              type="text"
              value={nazwa}
              onChange={(e) => setNazwa(e.target.value)}
              data-testid="project-info-nazwa"
              autoFocus
            />
          </div>
          <div className="property-row">
            <label>{t('Zamawiający')}</label>
            <input
              type="text"
              value={zamawia}
              onChange={(e) => setZamawia(e.target.value)}
              data-testid="project-info-zamawia"
            />
          </div>
          <div className="property-row">
            <label>{t('Data')}</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              data-testid="project-info-data"
            />
          </div>
        </div>
        <div className="project-info-modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>{t('Anuluj')}</button>
          <button className="btn btn-primary" onClick={handleSave} data-testid="project-info-save">{t('Zapisz')}</button>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoDialog;
