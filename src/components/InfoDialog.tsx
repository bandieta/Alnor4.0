import React, { useEffect } from 'react';

interface InfoDialogProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Generic informational modal, used for both the "O programie" (AboutBox1.cs)
 * and "Opis programu" (Form4.cs) legacy dialogs — same shape (title + static
 * text + a single close action), just different content.
 */
const InfoDialog: React.FC<InfoDialogProps> = ({ title, onClose, children }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="project-info-modal-overlay" onMouseDown={onClose}>
      <div className="info-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="project-info-modal-header">
          <span>{title}</span>
        </div>
        <div className="info-modal-body">{children}</div>
        <div className="project-info-modal-footer">
          <button className="btn btn-primary" onClick={onClose} autoFocus>OK</button>
        </div>
      </div>
    </div>
  );
};

export default InfoDialog;
