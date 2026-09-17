import React, { useState, useMemo, useEffect } from 'react';
import type { ShapeDefinition } from '../types';

interface ShapeListProps {
  shapes: ShapeDefinition[];
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
  disabled?: boolean;
  t: (text: string) => string;
  /** "Pamiętaj wartości przy zmianie elementu" (Form1.cs ~30599-30614) — carries a/b over to the next shape instead of clearing all fields. */
  rememberValues: boolean;
  onToggleRememberValues: (value: boolean) => void;
}

const ShapeList: React.FC<ShapeListProps> = ({
  shapes,
  selectedSymbol,
  onSelect,
  disabled,
  t,
  rememberValues,
  onToggleRememberValues,
}) => {
  const [filter, setFilter] = useState('');

  const filteredShapes = useMemo(() => {
    if (!filter.trim()) return shapes;
    const lower = filter.toLowerCase();
    return shapes.filter(
      (s) => s.symbol.toLowerCase().includes(lower) || s.name.toLowerCase().includes(lower)
    );
  }, [shapes, filter]);

  // Keep the selected row visible when it changes via wheel or PgUp/PgDn,
  // mirroring a bound DataGridView following its selected index.
  useEffect(() => {
    const el = document.querySelector(`[data-testid="shape-${selectedSymbol}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedSymbol]);

  // Mouse wheel over the catalogue moves the selection instead of scrolling
  // (datagridviewex.cs — a DataGridView subclass that raises custom
  // up/down-wheel events moving the binding-source position).
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (disabled || filteredShapes.length === 0) return;
    e.preventDefault();
    const idx = filteredShapes.findIndex((s) => s.symbol === selectedSymbol);
    const from = idx === -1 ? 0 : idx;
    const delta = e.deltaY > 0 ? 1 : -1;
    const next = filteredShapes[(from + delta + filteredShapes.length) % filteredShapes.length];
    onSelect(next.symbol);
  };

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
      <label className="remember-values-toggle" title={t('Pamiętaj wartości przy zmianie elementu')}>
        <input
          type="checkbox"
          checked={rememberValues}
          onChange={(e) => onToggleRememberValues(e.target.checked)}
        />
        <span>{t('Pamiętaj wartości')}</span>
      </label>
      <div className="shape-list-header">
        <span className="col-element">{t('Elementy')}</span>
        <span className="col-symbol">{t('Symbol')}</span>
      </div>
      <div className="shape-list-items" onWheel={handleWheel}>
        {filteredShapes.map((shape) => {
          const isSelected = selectedSymbol === shape.symbol;

          return (
            <div
              key={shape.symbol}
              data-testid={`shape-${shape.symbol}`}
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
