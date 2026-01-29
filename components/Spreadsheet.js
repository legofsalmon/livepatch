'use client'

import { useState, useMemo } from 'react'
import Cell from './Cell'
import RowHeader from './RowHeader'
import ColumnHeader from './ColumnHeader'
import styles from '../styles/Spreadsheet.module.scss'

export default function Spreadsheet({ 
  rows, 
  cols, 
  cells, 
  rowHeaders, 
  columnHeaders, 
  subBoxes,
  lineup = [],
  onUpdateCell, 
  onUpdateRowHeader, 
  onUpdateColumnHeader,
  onAddRow,
  onAddColumn,
  onRemoveRow,
  onRemoveColumn,
  onInsertColumn,
  onRemoveColumnAt,
  onInsertRow,
  onRemoveRowAt,
  onCopyFromLeft
}) {
  const [selectedCell, setSelectedCell] = useState(null)
  const [selectedRowHeader, setSelectedRowHeader] = useState(null)
  const [selectedColumnHeader, setSelectedColumnHeader] = useState(null)

  // Calculate minimum column widths based on content - memoized for performance
  const columnWidths = useMemo(() => {
    const newColumnWidths = {}
    
    for (let col = 0; col < cols; col++) {
      let maxWidth = 100 // minimum width
      
      // Check column header width
      const headerText = columnHeaders[col] || `Column ${col + 1}`
      const headerWidth = Math.max(headerText.length * 8 + 20, 80)
      maxWidth = Math.max(maxWidth, headerWidth)
      
      // Check all cell contents in this column
      for (let row = 0; row < rows; row++) {
        const cellKey = `${row}-${col}`
        const cellData = cells[cellKey]
        if (cellData && cellData.value) {
          const cellWidth = Math.max(cellData.value.toString().length * 8 + 20, 80)
          maxWidth = Math.max(maxWidth, cellWidth)
        }
      }
      
      // Cap maximum width to prevent excessive column sizes
      newColumnWidths[col] = Math.min(maxWidth, 300)
    }
    
    return newColumnWidths
  }, [cols, rows, cells, columnHeaders])


  const handleCellClick = (row, col) => {
    setSelectedCell({ row, col })
    setSelectedRowHeader(null)
    setSelectedColumnHeader(null)
  }

  const handleRowHeaderSelect = (row) => {
    setSelectedRowHeader(row)
    setSelectedCell(null)
    setSelectedColumnHeader(null)
  }

  const handleColumnHeaderSelect = (col) => {
    setSelectedColumnHeader(col)
    setSelectedCell(null)
    setSelectedRowHeader(null)
  }

  const handleCellUpdate = (row, col, value) => {
    onUpdateCell(row, col, value)
  }

  return (
    <div className={styles.spreadsheet}>
      <table className={styles.spreadsheetTable}>
        <thead>
          <tr>
            <th className={styles.rowHeader}></th>
            {lineup.map((artist, index) => (
              <th 
                key={artist.id}
                className={styles.groupedHeader}
                colSpan={5}
              >
                <div className={styles.artistHeaderContent}>
                  <span className={styles.artistName}>{artist.name}</span>
                  <div className={styles.artistToolbar}>
                    <button
                      className={`${styles.copyButton} ${index === 0 ? styles.disabled : ''}`}
                      onClick={() => onCopyFromLeft && onCopyFromLeft(index)}
                      disabled={index === 0}
                      title={index === 0 ? "No artist to copy from" : `Copy from ${lineup[index - 1]?.name}`}
                    >
                      ← Copy
                    </button>
                  </div>
                </div>
              </th>
            ))}
          </tr>
          <tr>
            <th className={styles.rowHeader}></th>
            {Array.from({ length: cols }, (_, i) => (
              <ColumnHeader
                key={i}
                col={i}
                value={columnHeaders[i]}
                onUpdate={onUpdateColumnHeader}
                isSelected={selectedColumnHeader === i}
                onSelect={handleColumnHeaderSelect}
                onAddColumn={onInsertColumn}
                onRemoveColumn={onRemoveColumnAt}
                style={{ minWidth: `${columnWidths[i] || 100}px` }}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <tr key={rowIndex}>
              <RowHeader 
                row={rowIndex}
                value={rowHeaders[rowIndex]}
                onUpdate={onUpdateRowHeader}
                isSelected={selectedRowHeader === rowIndex}
                onSelect={handleRowHeaderSelect}
                onAddRow={onInsertRow}
                onRemoveRow={onRemoveRowAt}
              />
              {Array.from({ length: cols }, (_, colIndex) => {
                const cellKey = `${rowIndex}-${colIndex}`
                const cellData = cells[cellKey] || { value: '' }
                return (
                  <Cell
                    key={colIndex}
                    row={rowIndex}
                    col={colIndex}
                    value={cellData.value}
                    isSelected={selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex}
                    onClick={handleCellClick}
                    onUpdate={handleCellUpdate}
                    columnHeader={columnHeaders[colIndex]}
                    subBoxes={subBoxes}
                    style={{ minWidth: `${columnWidths[colIndex] || 100}px` }}
                  />
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
