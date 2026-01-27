'use client'

import { useState } from 'react'
import Cell from './Cell'
import styles from '../styles/Spreadsheet.module.scss'

export default function Spreadsheet({ rows, cols, cells, onUpdateCell }) {
  const [selectedCell, setSelectedCell] = useState(null)

  // Generate column headers (A, B, C, ...)
  const getColumnLabel = (index) => {
    let label = ''
    let num = index
    while (num >= 0) {
      label = String.fromCharCode(65 + (num % 26)) + label
      num = Math.floor(num / 26) - 1
    }
    return label
  }

  const handleCellClick = (row, col) => {
    setSelectedCell({ row, col })
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
              <th key={i} className={styles.columnHeader}>
                {getColumnLabel(i)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <tr key={rowIndex}>
              <td className={styles.rowHeader}>{rowIndex + 1}</td>
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
