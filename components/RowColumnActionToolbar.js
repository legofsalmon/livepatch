'use client'

import styles from '../styles/RowColumnActions.module.scss'

export default function RowColumnActionToolbar({ 
  type, // 'row' or 'column'
  index, 
  onAdd, 
  onRemove,
  onRename,
  position = 'below' // 'above' or 'below'
}) {
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
      return `Insert col ${nextLabel}`
    } else {
      return `Insert row ${index + 2}`
    }
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
    <div className={`${styles.actionToolbar} ${position === 'above' ? styles.positionAbove : styles.positionBelow}`}>
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