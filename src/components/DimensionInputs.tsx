import React, { useCallback } from 'react';

export interface ValidationError {
  index: number;
  message: string;
  /** Optional suggested range — rendered as click-to-apply chips in the field tooltip. */
  suggest?: { min?: number; max?: number };
}

interface DimensionInputsProps {
  labels: string[];
  values: string[];
  onChange: (index: number, value: string) => void;
  errors?: ValidationError[];
  showErrors?: boolean;
}

const SCROLL_STEP = 10;

// Keep only digits and a single decimal separator — no letters, signs or
// exponents. A typed comma is treated as the decimal point (PL keyboards).
const sanitizeNumeric = (raw: string): string => {
  let s = raw.replace(/,/g, '.').replace(/[^\d.]/g, '');
  const dot = s.indexOf('.');
  if (dot !== -1) {
    s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, '');
  }
  return s;
};

const DimensionInputs: React.FC<DimensionInputsProps> = ({ labels, values, onChange, errors = [], showErrors = false }) => {
  const leftLabels = labels.slice(0, 8);
  const rightLabels = labels.slice(8);

  const getError = (index: number): ValidationError | undefined => {
    return errors.find((e) => e.index === index);
  };

  const fmt = (n: number): string => String(Math.round(n * 100) / 100);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const current = parseFloat(values[index]) || 0;
    const delta = e.deltaY < 0 ? SCROLL_STEP : -SCROLL_STEP;
    const next = Math.max(0, current + delta);
    onChange(index, String(next));
  }, [values, onChange]);

  const handleChange = useCallback((index: number, value: string) => {
    onChange(index, sanitizeNumeric(value));
  }, [onChange]);

  // Reject non-numeric characters before they reach the field, so the caret
  // never jumps. sanitizeNumeric() in handleChange still covers paste / autofill.
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length > 1) return;
    if (/[0-9]/.test(e.key) || e.key === '.' || e.key === ',') return;
    e.preventDefault();
  }, []);

  const step = useCallback((index: number, direction: 1 | -1) => {
    const current = parseFloat(values[index]) || 0;
    const next = Math.max(0, current + direction * SCROLL_STEP);
    onChange(index, String(next));
  }, [values, onChange]);

  const renderInput = (label: string, index: number) => {
    const error = getError(index);
    const hasVisibleError = Boolean(error) && showErrors;
    const suggest = error?.suggest;
    const hasSuggest =
      hasVisibleError && suggest && (suggest.min != null || suggest.max != null);
    return (
      <div key={index} className="dimension-row">
        <label className="dimension-label">{label}</label>
        {label !== '...' ? (
          <div className="dimension-input-wrapper">
            <div className="number-stepper">
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                data-testid={`dim-${index}`}
                className={`dimension-value${hasVisibleError ? ' dimension-error' : ''}`}
                value={values[index] || ''}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={handleKeyDown}
                onWheel={(e) => handleWheel(e, index)}
              />
              <span className="number-stepper-buttons">
                <button
                  type="button"
                  tabIndex={-1}
                  className="number-stepper-btn number-stepper-btn-up"
                  onClick={() => step(index, 1)}
                  aria-label="increment"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="number-stepper-btn number-stepper-btn-down"
                  onClick={() => step(index, -1)}
                  aria-label="decrement"
                />
              </span>
            </div>
            {hasVisibleError && (
              <span className="dimension-error-msg" role="alert">
                {error!.message}
                {hasSuggest && (
                  <span className="dimension-suggest">
                    {suggest!.min != null && (
                      <button
                        type="button"
                        data-testid={`dim-suggest-${index}-min`}
                        className="dimension-suggest-chip"
                        onClick={() => onChange(index, fmt(suggest!.min!))}
                        title={`Wstaw wartość minimalną (${fmt(suggest!.min!)})`}
                      >
                        min {fmt(suggest!.min!)}
                      </button>
                    )}
                    {suggest!.max != null && (
                      <button
                        type="button"
                        data-testid={`dim-suggest-${index}-max`}
                        className="dimension-suggest-chip"
                        onClick={() => onChange(index, fmt(suggest!.max!))}
                        title={`Wstaw wartość maksymalną (${fmt(suggest!.max!)})`}
                      >
                        max {fmt(suggest!.max!)}
                      </button>
                    )}
                  </span>
                )}
              </span>
            )}
          </div>
        ) : (
          <input className="dimension-value" disabled value="" />
        )}
      </div>
    );
  };

  return (
    <div className="dimension-inputs">
      <div className="dimension-column">
        {leftLabels.map((label, i) => renderInput(label, i))}
      </div>
      {rightLabels.length > 0 && (
        <div className="dimension-column dimension-column-right">
          {rightLabels.map((label, i) => renderInput(label, i + 8))}
        </div>
      )}
    </div>
  );
};

export default DimensionInputs;
