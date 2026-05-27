import React, { useState, useMemo } from 'react';
import type { ShapeDefinition } from '../types';

interface ShapeListProps {
  shapes: ShapeDefinition[];
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
  disabled?: boolean;
  demoLimit?: number;
}

const ShapeList: React.FC<ShapeListProps> = ({
  shapes,
  selectedSymbol,
  onSelect,
  disabled,
  demoLimit,
}) => {
  const [filter, setFilter] = useState('');
  const lockTooltip = 'Nie dostępne w wersji demo';

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
          placeholder="Filtruj..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="shape-filter-input"
        />
      </div>
      <div className="shape-list-header">
        <span className="col-element">Element</span>
        <span className="col-symbol">Symbol</span>
      </div>
      <div className="shape-list-items">
        {filteredShapes.map((shape) => {
          const shapeIndex = shapes.findIndex((s) => s.symbol === shape.symbol);
          const isLocked = typeof demoLimit === 'number' && shapeIndex >= demoLimit;
          const isSelected = selectedSymbol === shape.symbol;

          return (
            <div
              key={shape.symbol}
              className={`shape-list-item ${isSelected ? 'selected' : ''}${isLocked ? ' locked' : ''}`}
              onClick={() => !disabled && !isLocked && onSelect(shape.symbol)}
              title={isLocked ? lockTooltip : undefined}
            >
              <span className="shape-icon">🔧</span>
              <span
                className={`shape-name${isLocked ? ' shape-name-locked' : ''}`}
                title={isLocked ? lockTooltip : shape.name}
              >
                {shape.name}
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
