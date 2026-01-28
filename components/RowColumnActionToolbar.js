'use client'

import { useRef, useEffect, useState } from 'react'
import styles from '../styles/RowColumnActions.module.scss'

export default function RowColumnActionToolbar({ 
  type, // 'row' or 'column'
  index, 
  onAdd, 
  onRemove,
  onRename,
  position = 'below' // 'above' or 'below'
}) {
  const [positioning, setPositioning] = useState('left')
  const [isCompact, setIsCompact] = useState(false)
  const [isUltraCompact, setIsUltraCompact] = useState(false)
  const toolbarRef = useRef(null)

  useEffect(() => {
    if (toolbarRef.current) {
      const toolbar = toolbarRef.current
      const rect = toolbar.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      
      // Check if toolbar extends beyond right edge of viewport
      if (rect.right > viewportWidth - 20) { // 20px margin
        setPositioning('right')
      } else {
        setPositioning('left')
      }
      
      // Check if we need compact modes
      const availableSpace = viewportWidth - rect.left - 40 // 40px margin
      if (availableSpace < 180) {
        setIsUltraCompact(true)
        setIsCompact(true)
      } else if (availableSpace < 600) {
        setIsUltraCompact(false)
        setIsCompact(true)
      } else {
        setIsUltraCompact(false)
        setIsCompact(false)
      }
    }
  }, [])
  const getColumnLabel = (index) => {
    let label = ''
    let num = index
    while (num >= 0) {
      label = String.fromCharCode(65 + (num % 26)) + label
      num = Math.floor(num / 26) - 1
    }
    return label
  }

  const handleAdd = () => {
    onAdd(index)
  }

  const handleRemove = () => {
    onRemove(index)
  }

  const handleRename = () => {
    if (onRename) {
      onRename(index)
    }
  }

  const getAddButtonText = () => {
    if (type === 'column') {
      const currentLabel = getColumnLabel(index)
      const nextLabel = getColumnLabel(index + 1)
      return isCompact ? `+ ${nextLabel}` : `Insert`
    } else {
      return isCompact ? `+ ${index + 2}` : `Insert row`
    }
  }

  const getRemoveButtonText = () => {
    if (type === 'column') {
      const currentLabel = getColumnLabel(index)
      return isCompact ? `- ${currentLabel}` : `Remove`
    } else {
      return isCompact ? `- ${index + 1}` : `Remove row ${index + 1}`
    }
  }

  const getRenameButtonText = () => {
    return isCompact ? '✎' : 'Rename'
  }

  const getAddTooltip = () => {
    if (type === 'column') {
      const currentLabel = getColumnLabel(index)
      const nextLabel = getColumnLabel(index + 1)
      return `Insert new column ${nextLabel} to the right of ${currentLabel}`
    } else {
      return `Insert new row ${index + 2} below row ${index + 1}`
    }
  }

  const getRemoveTooltip = () => {
    if (type === 'column') {
      const currentLabel = getColumnLabel(index)
      return `Remove column ${currentLabel}`
    } else {
      return `Remove row ${index + 1}`
    }
  }

  return (
    <div 
      ref={toolbarRef}
      className={`${styles.actionToolbar} ${
        position === 'above' ? styles.positionAbove : styles.positionBelow
      } ${
        positioning === 'right' ? styles.positionRight : ''
      }`}
    >
      <button
        className={styles.actionButton}
        onClick={handleAdd}
        title={getAddTooltip()}
      >
        <span>➕</span> {getAddButtonText()}
      </button>
      <button
        className={`${styles.actionButton} ${styles.renameButton}`}
        onClick={handleRename}
        title={`Rename ${type} ${type === 'column' ? getColumnLabel(index) : index + 1}`}
      >
        <span>✏️</span> Rename
      </button>
      <button
        className={`${styles.actionButton} ${styles.removeButton}`}
        onClick={handleRemove}
        title={getRemoveTooltip()}
      >
        <span>➖</span> Remove {type}
      </button>
    </div>
  )
}