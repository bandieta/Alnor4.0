import React from 'react';
import type { ShapeDefinition } from '../types';

interface ShapeListProps {
  shapes: ShapeDefinition[];
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
}

const ShapeList: React.FC<ShapeListProps> = ({ shapes, selectedSymbol, onSelect }) => {
  return (
    <div className="shape-list">
      <div className="shape-list-header">
        <span className="col-element">Element</span>
        <span className="col-symbol">Symbol</span>
      </div>
      <div className="shape-list-items">
        {shapes.map((shape) => (
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
