import React from 'react';
import type { GridRow } from '../types';

interface DataGridProps {
  rows: GridRow[];
  selectedRowId: string | null;
  onSelectRow: (id: string) => void;
}

const DataGrid: React.FC<DataGridProps> = ({ rows, selectedRowId, onSelectRow }) => {
  return (
    <div className="data-grid">
      <table>
        <thead>
          <tr>
            <th className="col-oznacz">Oznaczenie</th>
            <th className="col-nazwa">Nazwa</th>
            <th className="col-symbol">Symbol</th>
            <th className="col-sztuk">Sztuk</th>
            <th className="col-material">Materiał</th>
            <th className="col-m2">m2</th>
            <th className="col-przekroj">Przekrój</th>
            <th className="col-uwagi">Uwagi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
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
              <td>{row.przekroj}</td>
              <td>{row.uwagi}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={8} className="empty-row">Brak elementów. Kliknij "Dodaj" aby dodać kształtkę.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataGrid;
