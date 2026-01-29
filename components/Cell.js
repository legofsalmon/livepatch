'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import styles from '../styles/Cell.module.scss'

export default function Cell({ row, col, value, isSelected, onClick, onUpdate, columnHeader, subBoxes, style }) {
  const [isEditing, setIsEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const inputRef = useRef(null)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const datalistInfo = useMemo(() => {
    if (!columnHeader) return null
    
    const headerLower = columnHeader.toLowerCase()
    
    if (headerLower.includes('input')) {
      return {
        id: 'input-options',
        options: ['Guitar', 'Bass', 'Vocals', 'Drums', 'Keys', 'Synth', 'Saxophone', 'Trumpet', 'Violin']
      }
    } else if (headerLower.includes('sub') || headerLower.includes('box')) {
      const subBoxNames = subBoxes && subBoxes.length > 0 
        ? subBoxes.map(subBox => `${subBox.name} (${subBox.stagePosition})`)
        : ['DI', 'Amp', 'Cabinet', 'Monitor', 'Fold-back', 'Sub', 'Main', 'Side-fill']
      return {
        id: 'sub-box-options',
        options: subBoxNames
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
  }, [columnHeader, subBoxes])

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
      onUpdate(row, col, localValue)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false)
      onUpdate(row, col, localValue)
    } else if (e.key === 'Escape') {
      setLocalValue(value)
      setIsEditing(false)
    }
  }

  const getCellBackgroundStyle = () => {
    const style = {}
    
    // Apply sub-box border color if this is a sub-box column cell
    if (columnHeader && (columnHeader.toLowerCase().includes('sub') || 
        columnHeader.toLowerCase().includes('box'))) {
      if (localValue && subBoxes && subBoxes.length > 0) {
        // Extract sub-box name from value (format: "Sub-box name (position)")
        const subBoxName = localValue.includes('(') ? 
          localValue.substring(0, localValue.lastIndexOf('(')).trim() :
          localValue.trim()
        
        // Find matching sub-box
        const matchingSubBox = subBoxes.find(subBox => subBox.name === subBoxName)
        if (matchingSubBox && matchingSubBox.color) {
          style.borderLeft = `8px solid ${matchingSubBox.color}`
        }
      }
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
      style={{...getCellBackgroundStyle(), ...style}}
    >
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
            list={datalistInfo?.id}
          />
          {datalistInfo && (
            <datalist id={datalistInfo.id}>
              {datalistInfo.options.map((option, index) => (
                <option key={index} value={option} />
              ))}
            </datalist>
          )}
        </>
      ) : (
        <div className={styles.cellContent}>
          {localValue}
        </div>
      )}
    </td>
  )
}
