'use client'

import { useState, useRef, useEffect } from 'react'
import styles from '../styles/Spreadsheet.module.scss'

export default function RowHeader({ row, value, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value || (row + 1).toString())
  const inputRef = useRef(null)

  useEffect(() => {
    setLocalValue(value || (row + 1).toString())
  }, [value, row])

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
    const finalValue = localValue.trim() || (row + 1).toString()
    setLocalValue(finalValue)
    onUpdate(row, finalValue)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false)
      const finalValue = localValue.trim() || (row + 1).toString()
      setLocalValue(finalValue)
      onUpdate(row, finalValue)
    } else if (e.key === 'Escape') {
      setLocalValue(value || (row + 1).toString())
      setIsEditing(false)
    }
  }

  return (
    <td 
      className={`${styles.rowHeader} ${isEditing ? styles.editingHeader : ''}`}
      onClick={handleClick}
      title="Click to edit row header"
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
    </td>
  )
}