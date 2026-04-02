import React, { useState, useMemo } from 'react';
import type { ShapeDefinition } from '../types';

interface ShapeListProps {
  shapes: ShapeDefinition[];
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
}

const ShapeList: React.FC<ShapeListProps> = ({ shapes, selectedSymbol, onSelect }) => {
  const [filter, setFilter] = useState('');

  const filteredShapes = useMemo(() => {
    if (!filter.trim()) return shapes;
    const lower = filter.toLowerCase();
    return shapes.filter(
      (s) => s.symbol.toLowerCase().includes(lower) || s.name.toLowerCase().includes(lower)
    );
  }, [shapes, filter]);

  return (
    <div className="shape-list">
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
        {filteredShapes.map((shape) => (
          <div
            key={shape.symbol}
            className={`shape-list-item ${selectedSymbol === shape.symbol ? 'selected' : ''}`}
            onClick={() => onSelect(shape.symbol)}
          >
            <span className="shape-icon">🔧</span>
            <span className="shape-name" title={shape.name}>{shape.name}</span>
            <span className="shape-symbol">{shape.symbol}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShapeList;
