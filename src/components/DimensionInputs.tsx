import React from 'react';

export interface ValidationError {
  index: number;
  message: string;
}

interface DimensionInputsProps {
  labels: string[];
  values: string[];
  onChange: (index: number, value: string) => void;
  errors?: ValidationError[];
  showErrors?: boolean;
}

const DimensionInputs: React.FC<DimensionInputsProps> = ({ labels, values, onChange, errors = [], showErrors = false }) => {
  const leftLabels = labels.slice(0, 8);
  const rightLabels = labels.slice(8);

  const getError = (index: number): string | undefined => {
    return errors.find((e) => e.index === index)?.message;
  };

  const renderInput = (label: string, index: number) => {
    const error = getError(index);
    const hasVisibleError = error && showErrors;
    return (
      <div key={index} className="dimension-row">
        <label className="dimension-label">{label}</label>
        {label !== '...' ? (
          <div className="dimension-input-wrapper">
            <input
              type="number"
              className={`dimension-value${hasVisibleError ? ' dimension-error' : ''}`}
              value={values[index] || ''}
              onChange={(e) => onChange(index, e.target.value)}
            />
            {hasVisibleError && <span className="dimension-error-msg">{error}</span>}
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
