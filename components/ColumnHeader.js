'use client'

import { useState, useRef, useEffect } from 'react'
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

export default function ColumnHeader({ col, value, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value || getDefaultColumnLabel(col))
  const inputRef = useRef(null)

  useEffect(() => {
    setLocalValue(value || getDefaultColumnLabel(col))
  }, [value, col])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleClick = () => {
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
      className={`${styles.columnHeader} ${isEditing ? styles.editingHeader : ''}`}
      onClick={handleClick}
      title="Click to edit column header"
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={styles.headerInput}
          maxLength={20}
        />
      ) : (
        <span className={styles.headerContent}>
          {localValue}
        </span>
      )}
    </th>
  )
}