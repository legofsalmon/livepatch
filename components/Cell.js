'use client'

import { useState, useRef, useEffect } from 'react'
import FormattingToolbar from './FormattingToolbar'
import styles from '../styles/Cell.module.scss'

export default function Cell({ row, col, value, formatting, isSelected, onClick, onUpdate, columnHeader }) {
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

  const getDatalistInfo = () => {
    if (!columnHeader) return null
    
    const headerLower = columnHeader.toLowerCase()
    
    if (headerLower.includes('input')) {
      return {
        id: 'input-options',
        options: ['Guitar', 'Bass', 'Vocals', 'Drums', 'Keys', 'Synth', 'Saxophone', 'Trumpet', 'Violin']
      }
    } else if (headerLower.includes('sub') || headerLower.includes('box')) {
      return {
        id: 'sub-box-options',
        options: ['DI', 'Amp', 'Cabinet', 'Monitor', 'Fold-back', 'Sub', 'Main', 'Side-fill']
      }
    } else if (headerLower.includes('description')) {
      return {
        id: 'description-options',
        options: ['Lead Vocals', 'Backing Vocals', 'Electric Guitar', 'Acoustic Guitar', 'Bass Guitar', 'Kick Drum', 'Snare Drum', 'Hi-Hat', 'Keyboard', 'Piano']
      }
    } else if (headerLower.includes('mic') || headerLower.includes('di')) {
      return {
        id: 'mic-di-options',
        options: ['SM58', 'SM57', 'Beta 58A', 'Beta 87A', 'KSM8', 'DI Box', 'Active DI', 'Passive DI', 'Countryman', 'Radial']
      }
    } else if (headerLower.includes('stand')) {
      return {
        id: 'stand-options',
        options: ['Boom Stand', 'Straight Stand', 'Desktop Stand', 'Clip-on', 'Overhead', 'Floor Stand', 'Short Boom', 'Tall Stand']
      }
    }
    
    return null
  }

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
        <>
          <input
            ref={inputRef}
            type="text"
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={styles.cellInput}
            style={getCellStyle()}
            list={getDatalistInfo()?.id}
          />
          {getDatalistInfo() && (
            <datalist id={getDatalistInfo().id}>
              {getDatalistInfo().options.map((option, index) => (
                <option key={index} value={option} />
              ))}
            </datalist>
          )}
        </>
      ) : (
        <div className={styles.cellContent} style={getCellStyle()}>
          {localValue}
        </div>
      )}
    </td>
  )
}
