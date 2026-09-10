import React, { useState, useMemo } from 'react';
import type { ShapeDefinition } from '../types';

interface ShapeListProps {
  shapes: ShapeDefinition[];
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
  disabled?: boolean;
  t: (text: string) => string;
}

const ShapeList: React.FC<ShapeListProps> = ({
  shapes,
  selectedSymbol,
  onSelect,
  disabled,
  t,
}) => {
  const [filter, setFilter] = useState('');

  const filteredShapes = useMemo(() => {
    if (!filter.trim()) return shapes;
    const lower = filter.toLowerCase();
    return shapes.filter(
      (s) => s.symbol.toLowerCase().includes(lower) || s.name.toLowerCase().includes(lower)
    );
  }, [shapes, filter]);

  return (
    <div className={`shape-list${disabled ? ' shape-list-disabled' : ''}`}>
      <div className="shape-list-filter">
        <input
          type="text"
          placeholder={`${t('Filtruj')}...`}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="shape-filter-input"
        />
      </div>
      <div className="shape-list-header">
        <span className="col-element">{t('Elementy')}</span>
        <span className="col-symbol">{t('Symbol')}</span>
      </div>
      <div className="shape-list-items">
        {filteredShapes.map((shape) => {
          const isSelected = selectedSymbol === shape.symbol;

          return (
            <div
              key={shape.symbol}
              className={`shape-list-item ${isSelected ? 'selected' : ''}`}
              onClick={() => !disabled && onSelect(shape.symbol)}
            >
              <span className="shape-icon">🔧</span>
              <span className="shape-name" title={t(shape.name)}>
                {t(shape.name)}
              </span>
              <span className="shape-symbol">{shape.symbol}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShapeList;
