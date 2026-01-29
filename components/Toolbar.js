'use client'

import { useState, useRef, useEffect } from 'react'
import styles from '../styles/Toolbar.module.scss'

export default function Toolbar({ 
  spreadsheetTitle = "Untitled Spreadsheet", 
  onUpdateTitle,
  stage = "Main Stage", 
  onUpdateStage,
  date,
  onUpdateDate,
  onToggleSubBoxManager,
  onToggleLineupManager,
  onExportCSV
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [localTitle, setLocalTitle] = useState(spreadsheetTitle)
  const inputRef = useRef(null)

  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0] // Returns YYYY-MM-DD format
  }

  useEffect(() => {
    setLocalTitle(spreadsheetTitle)
  }, [spreadsheetTitle])

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditingTitle])

  const handleTitleClick = () => {
    setIsEditingTitle(true)
  }

  const handleTitleChange = (e) => {
    setLocalTitle(e.target.value)
  }

  const handleTitleBlur = () => {
    setIsEditingTitle(false)
    const finalTitle = localTitle.trim() || "Untitled Spreadsheet"
    setLocalTitle(finalTitle)
    if (onUpdateTitle) {
      onUpdateTitle(finalTitle)
    }
  }

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditingTitle(false)
      const finalTitle = localTitle.trim() || "Untitled Spreadsheet"
      setLocalTitle(finalTitle)
      if (onUpdateTitle) {
        onUpdateTitle(finalTitle)
      }
    } else if (e.key === 'Escape') {
      setLocalTitle(spreadsheetTitle)
      setIsEditingTitle(false)
    }
  }

  const handleStageChange = (e) => {
    if (onUpdateStage) {
      onUpdateStage(e.target.value)
    }
  }

  const handleDateChange = (e) => {
    if (onUpdateDate) {
      onUpdateDate(e.target.value)
    }
  }

  return (
    <div className={styles.toolbar}>
      <div className={styles.titleSection}>
        {isEditingTitle ? (
          <input
            ref={inputRef}
            type="text"
            value={localTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className={styles.titleInput}
            placeholder="Enter spreadsheet title"
            maxLength={100}
          />
        ) : (
          <h2 
            className={styles.title}
            onClick={handleTitleClick}
            title="Click to edit title"
          >
            {localTitle}
          </h2>
        )}
      </div>
      
      <div className={styles.metadataSection}>
        <div className={styles.stageSection}>
          <label className={styles.stageLabel}>Stage:</label>
          <input
            type="text"
            className={styles.stageInput}
            value={stage || ''}
            onChange={handleStageChange}
            placeholder="Main Stage"
            maxLength={50}
          />
        </div>
        
        <div className={styles.dateSection}>
          <label className={styles.dateLabel}>Date:</label>
          <input
            type="date"
            className={styles.dateInput}
            value={date || getCurrentDate()}
            onChange={handleDateChange}
          />
        </div>
        
        <div className={styles.actionSection}>
          <button 
            className={styles.subBoxButton}
            onClick={onToggleSubBoxManager}
            title="Manage Sub-Boxes"
          >
            Sub-Boxes
          </button>
          <button 
            className={styles.lineupButton}
            onClick={onToggleLineupManager}
            title="Manage Artist Lineup"
          >
            Lineup
          </button>
          <button 
            className={styles.exportButton}
            onClick={onExportCSV}
            title="Download as CSV"
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  )
}
