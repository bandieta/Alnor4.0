import React, { useState, useMemo } from 'react';
import type { GridRow } from '../types';

interface DataGridProps {
  rows: GridRow[];
  selectedRowId: string | null;
  onSelectRow: (id: string) => void;
}

const DataGrid: React.FC<DataGridProps> = ({ rows, selectedRowId, onSelectRow }) => {
  const [filter, setFilter] = useState('');

  const filteredRows = useMemo(() => {
    if (!filter.trim()) return rows;
    const q = filter.toLowerCase();
    return rows.filter((r) =>
      r.oznaczenie.toLowerCase().includes(q) ||
      r.nazwa.toLowerCase().includes(q) ||
      r.symbol.toLowerCase().includes(q) ||
      r.material.toLowerCase().includes(q) ||
      r.uwagi.toLowerCase().includes(q)
    );
  }, [rows, filter]);

  return (
    <div className="data-grid">
      <div className="data-grid-filter">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filtruj elementy..."
          className="data-grid-filter-input"
        />
      </div>
      <table>
        <thead>
          <tr>
            <th className="col-oznacz">Oznaczenie</th>
            <th className="col-nazwa">Nazwa</th>
            <th className="col-symbol">Symbol</th>
            <th className="col-sztuk">Sztuk</th>
            <th className="col-material">Materiał</th>
            <th className="col-m2">Blacha</th>
            <th className="col-m2-total">Suma</th>
            <th className="col-przekroj">Przekrój</th>
            <th className="col-uwagi">Uwagi</th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.map((row) => (
            <tr
              key={row.id}
              className={selectedRowId === row.id ? 'selected' : ''}
              onClick={() => onSelectRow(row.id)}
            >
              <td>{row.oznaczenie}</td>
              <td title={row.nazwa}>{row.nazwa}</td>
              <td title={row.symbol}>{row.symbol}</td>
              <td>{row.sztuk}</td>
              <td>{row.material}</td>
              <td>{row.m2.toFixed(2)}</td>
              <td>{(row.m2 * row.sztuk).toFixed(2)}</td>
              <td>{row.przekroj}</td>
              <td>{row.uwagi}</td>
            </tr>
          ))}
          {filteredRows.length === 0 && (
            <tr>
              <td colSpan={9} className="empty-row">Brak elementów. Kliknij "Dodaj" aby dodać kształtkę.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataGrid;
