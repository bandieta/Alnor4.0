import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { KotReport } from '../calculations';

interface KotInfoProps {
  report: KotReport;
  /** translated shape name, for the "out of scope" message */
  shapeName: string;
  /** set the properties (material / execution / class / thickness) to a KOT-compliant combo */
  onMakeCompliant?: () => void;
  t: (text: string) => string;
}

/**
 * The "KOT" chip. Click toggles a formatted popover explaining what the KOT
 * standard requires and whether the current shape / settings meet it. Shapes
 * outside KOT scope get a short note instead.
 */
const KotInfo: React.FC<KotInfoProps> = ({ report, shapeName, onMakeCompliant, t }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  const grubOk = report.allowedGrubosc.includes(report.grubosc);
  const statusText = !report.inScope
    ? t('Poza zakresem KOT')
    : report.compliant
      ? t('Zgodne z KOT')
      : t('Niezgodne z KOT');
  const statusClass = !report.inScope
    ? 'kot-status-na'
    : report.compliant
      ? 'kot-status-ok'
      : 'kot-status-bad';

  return (
    <div className="kot-info" ref={ref}>
      <button
        type="button"
        data-testid="btn-kot"
        aria-expanded={open}
        className={`btn btn-kot${report.compliant ? ' btn-kot-green' : ''}`}
        onClick={toggle}
      >
        KOT
      </button>

      {open && (
        <div className="kot-popover" role="dialog" data-testid="kot-popover">
          <div className="kot-popover-head">
            <span className="kot-popover-title">{t('Zgodność z KOT')}</span>
            <span className={`kot-status ${statusClass}`}>{statusText}</span>
          </div>

          {!report.inScope ? (
            <div className="kot-popover-body">
              <p>
                {t('Walidacja zgodności z KOT obejmuje w tej aplikacji wyłącznie kanał prostokątny (QDa).')}
              </p>
              <p className="kot-muted">
                {t('Dla kształtki')} „{shapeName}" {t('zgodność z KOT nie jest sprawdzana.')}
              </p>
            </div>
          ) : (
            <div className="kot-popover-body">
              <p className="kot-section-label">{t('Warunki wstępne')}:</p>
              <ul className="kot-check-list">
                {report.prerequisites.map((p) => (
                  <li key={p.label} className={p.ok ? 'kot-ok' : 'kot-bad'}>
                    <span className="kot-mark">{p.ok ? '✓' : '✗'}</span>
                    {t(p.label)}: <strong>{t(p.need)}</strong>
                  </li>
                ))}
              </ul>

              <p className="kot-section-label">{t('Dobór grubości blachy')}:</p>
              <p className="kot-muted">
                {t('Największy bok')}: <strong>{report.bok || '—'} mm</strong>
                {'  ·  '}
                {t('Długość')} L: <strong>{report.l || '—'} mm</strong>
              </p>
              {report.allowedGrubosc.length > 0 ? (
                <p className={grubOk ? 'kot-ok' : 'kot-bad'}>
                  <span className="kot-mark">{grubOk ? '✓' : '✗'}</span>
                  {t('Dozwolone wg KOT')}: <strong>{report.allowedGrubosc.join(' / ')} mm</strong>
                  {'  —  '}
                  {t('wybrano')} <strong>{report.grubosc} mm</strong>
                </p>
              ) : (
                <p className="kot-bad">
                  <span className="kot-mark">✗</span>
                  {report.bok
                    ? t('Największy bok jest poza zakresem tabeli KOT (100–2000 mm).')
                    : t('Podaj wymiary a, b, L, aby sprawdzić dobór grubości.')}
                </p>
              )}

              <p className="kot-verdict">
                {report.compliant
                  ? t('Dobór spełnia wymagania KOT.')
                  : t('Dobór nie spełnia wszystkich wymagań KOT — popraw pozycje oznaczone ✗.')}
              </p>

              {!report.compliant && onMakeCompliant && (
                <>
                  <button
                    type="button"
                    className="kot-fix-btn"
                    data-testid="kot-fix"
                    onClick={onMakeCompliant}
                  >
                    {t('Ustaw parametry zgodne z KOT')}
                  </button>
                  {!report.bokWithinTable && report.bok > 0 && (
                    <p className="kot-muted kot-fix-note">
                      {t('Największy bok trzeba skorygować ręcznie do zakresu 100–2000 mm.')}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          <p className="kot-footnote">
            {t('KOT — Krajowa Ocena Techniczna: prostokątne przewody i kształtki wentylacyjne z blachy stalowej ocynkowanej.')}
          </p>
        </div>
      )}
    </div>
  );
};

export default KotInfo;
