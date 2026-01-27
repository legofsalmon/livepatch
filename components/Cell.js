'use client'

import { useState, useRef, useEffect } from 'react'
import FormattingToolbar from './FormattingToolbar'
import styles from '../styles/Cell.module.scss'

export default function Cell({ row, col, value, formatting, isSelected, onClick, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const [localFormatting, setLocalFormatting] = useState(formatting || {})
  const inputRef = useRef(null)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    setLocalFormatting(formatting || {})
  }, [formatting])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleClick = () => {
    onClick(row, col)
  }

  const handleDoubleClick = () => {
    setIsEditing(true)
  }

  const handleChange = (e) => {
    setLocalValue(e.target.value)
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (localValue !== value) {
      onUpdate(row, col, localValue, localFormatting)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false)
      onUpdate(row, col, localValue, localFormatting)
    } else if (e.key === 'Escape') {
      setLocalValue(value)
      setIsEditing(false)
    }
  }

  const handleFormatChange = (formatType, formatValue) => {
    const newFormatting = {
      ...localFormatting,
      [formatType]: formatValue
    }
    setLocalFormatting(newFormatting)
    onUpdate(row, col, localValue, newFormatting)
  }

  const getCellStyle = () => {
    const style = {}
    
    if (localFormatting.bold) {
      style.fontWeight = 'bold'
    }
    if (localFormatting.italic) {
      style.fontStyle = 'italic'
    }
    if (localFormatting.underline) {
      style.textDecoration = 'underline'
    }
    if (localFormatting.color) {
      style.color = localFormatting.color
    }
    
    return style
  }

  const cellClasses = [
    styles.spreadsheetCell,
    isSelected && styles.selected,
    isEditing && styles.editing
  ].filter(Boolean).join(' ')

  return (
    <td
      className={cellClasses}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {isSelected && !isEditing && (
        <FormattingToolbar
          formatting={localFormatting}
          onFormatChange={handleFormatChange}
          isFirstRow={row === 0}
        />
      )}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={styles.cellInput}
          style={getCellStyle()}
        />
      ) : (
        <div className={styles.cellContent} style={getCellStyle()}>
          {localValue}
        </div>
      )}
    </td>
  )
}
