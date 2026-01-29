'use client'

import { useState, useEffect } from 'react'
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
  onRemoveRowAt
}) {
  const [selectedCell, setSelectedCell] = useState(null)
  const [selectedRowHeader, setSelectedRowHeader] = useState(null)
  const [selectedColumnHeader, setSelectedColumnHeader] = useState(null)
  const [columnWidths, setColumnWidths] = useState({})

  // Calculate minimum column widths based on content
  useEffect(() => {
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
    
    setColumnWidths(newColumnWidths)
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

  const handleCellUpdate = (row, col, value, formatting) => {
    onUpdateCell(row, col, value, formatting)
  }

  return (
    <div className={styles.spreadsheet}>
      <table className={styles.spreadsheetTable}>
        <thead>
          <tr>
            <th className={styles.rowHeader}></th>
            <th 
              className={styles.groupedHeader}
              colSpan={5}
            >
              Live Patch Configuration
            </th>
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
                const cellData = cells[cellKey] || { value: '', formatting: {} }
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
