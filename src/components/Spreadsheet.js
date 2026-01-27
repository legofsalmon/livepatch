import React, { useState } from 'react';
import Cell from './Cell';

function Spreadsheet({ rows, cols, cells, onUpdateCell }) {
  const [selectedCell, setSelectedCell] = useState(null);

  // Generate column headers (A, B, C, ...)
  const getColumnLabel = (index) => {
    let label = '';
    let num = index;
    while (num >= 0) {
      label = String.fromCharCode(65 + (num % 26)) + label;
      num = Math.floor(num / 26) - 1;
    }
    return label;
  };

  const handleCellClick = (row, col) => {
    setSelectedCell({ row, col });
  };

  const handleCellUpdate = (row, col, value, formatting) => {
    onUpdateCell(row, col, value, formatting);
  };

  return (
    <div className="spreadsheet">
      <table className="spreadsheet-table">
        <thead>
          <tr>
            <th className="row-header"></th>
            {Array.from({ length: cols }, (_, i) => (
              <th key={i} className="column-header">
                {getColumnLabel(i)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <tr key={rowIndex}>
              <td className="row-header">{rowIndex + 1}</td>
              {Array.from({ length: cols }, (_, colIndex) => {
                const cellKey = `${rowIndex}-${colIndex}`;
                const cellData = cells[cellKey] || { value: '', formatting: {} };
                return (
                  <Cell
                    key={cellKey}
                    row={rowIndex}
                    col={colIndex}
                    value={cellData.value}
                    formatting={cellData.formatting}
                    isSelected={selectedCell?.row === rowIndex && selectedCell?.col === colIndex}
                    onClick={handleCellClick}
                    onUpdate={handleCellUpdate}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Spreadsheet;
