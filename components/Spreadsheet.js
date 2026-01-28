'use client'

import { useState } from 'react'
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
