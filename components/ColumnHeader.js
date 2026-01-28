'use client'

import { useState, useRef, useEffect } from 'react'
import RowColumnActionToolbar from './RowColumnActionToolbar'
import styles from '../styles/Spreadsheet.module.scss'

// Generate default column labels (A, B, C, ...)
const getDefaultColumnLabel = (index) => {
  let label = ''
  let num = index
  while (num >= 0) {
    label = String.fromCharCode(65 + (num % 26)) + label
    num = Math.floor(num / 26) - 1
  }
  return label
}

export default function ColumnHeader({ col, value, onUpdate, isSelected, onSelect, onAddColumn, onRemoveColumn }) {
  const [isEditing, setIsEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value || getDefaultColumnLabel(col))
  const inputRef = useRef(null)
  const headerRef = useRef(null)

  useEffect(() => {
    setLocalValue(value || getDefaultColumnLabel(col))
  }, [value, col])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleClick = (e) => {
    if (!isEditing) {
      e.stopPropagation()
      if (onSelect) {
        onSelect(col)
      }
    } else {
      setIsEditing(true)
    }
  }

  const handleRename = () => {
    setIsEditing(true)
  }

  const handleChange = (e) => {
    setLocalValue(e.target.value)
  }

  const handleBlur = () => {
    setIsEditing(false)
    const finalValue = localValue.trim() || getDefaultColumnLabel(col)
    setLocalValue(finalValue)
    onUpdate(col, finalValue)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false)
      const finalValue = localValue.trim() || getDefaultColumnLabel(col)
      setLocalValue(finalValue)
      onUpdate(col, finalValue)
    } else if (e.key === 'Escape') {
      setLocalValue(value || getDefaultColumnLabel(col))
      setIsEditing(false)
    }
  }

  return (
    <th 
      ref={headerRef}
      className={`${styles.columnHeader} ${isEditing ? styles.editingHeader : ''} ${isSelected ? styles.selectedHeader : ''}`}
      onClick={handleClick}
      title={isSelected ? "Column actions available" : "Click to edit column header or access column actions"}
    >
      {isSelected && !isEditing && (
        <div className={styles.actionContainer}>
          <RowColumnActionToolbar
            type="column"
            index={col}
            onAdd={() => onAddColumn && onAddColumn(col)}
            onRemove={() => onRemoveColumn && onRemoveColumn(col)}
            onRename={handleRename}
            position="below"
          />
        </div>
      )}
      {isEditing ? (
        <>
          <input
            ref={inputRef}
            type="text"
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={styles.headerInput}
            maxLength={20}
            list="column-options"
          />
          <datalist id="column-options">
            <option value="Input" />
            <option value="Sub-box" />
            <option value="Description" />
            <option value="Mic/DI" />
            <option value="Stand" />
          </datalist>
        </>
      ) : (
        <span className={styles.headerContent}>
          {localValue}
        </span>
      )}
    </th>
  )
}