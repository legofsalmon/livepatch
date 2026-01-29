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
  const getCurrentDate = () => {
    const today = new Date()
    const day = today.getDate().toString().padStart(2, '0')
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const year = today.getFullYear()
    return `${day}/${month}/${year}` // Returns DD/MM/YYYY format
  }

  const convertToDisplayFormat = (isoDate) => {
    if (!isoDate) return getCurrentDate()
    const date = new Date(isoDate)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const convertToISOFormat = (displayDate) => {
    if (!displayDate) return new Date().toISOString().split('T')[0]
    const parts = displayDate.split('/')
    if (parts.length === 3) {
      const [day, month, year] = parts
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
    return new Date().toISOString().split('T')[0]
  }

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [localTitle, setLocalTitle] = useState(spreadsheetTitle)
  const [localStage, setLocalStage] = useState(stage)
  const [localDate, setLocalDate] = useState(() => convertToDisplayFormat(date))
  const inputRef = useRef(null)

  useEffect(() => {
    setLocalTitle(spreadsheetTitle)
  }, [spreadsheetTitle])

  useEffect(() => {
    setLocalStage(stage)
  }, [stage])

  useEffect(() => {
    setLocalDate(convertToDisplayFormat(date))
  }, [date])

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
    setLocalStage(e.target.value)
  }

  const handleStageBlur = () => {
    const finalStage = localStage.trim() || "Main Stage"
    setLocalStage(finalStage)
    if (onUpdateStage) {
      onUpdateStage(finalStage)
    }
  }

  const handleDateChange = (e) => {
    const newDisplayDate = e.target.value
    setLocalDate(newDisplayDate)
    
    // Convert to ISO format for storage
    const isoDate = convertToISOFormat(newDisplayDate)
    if (onUpdateDate) {
      onUpdateDate(isoDate)
    }
  }

  const handleDateBlur = () => {
    // Validate and format the date on blur
    const parts = localDate.split('/')
    if (parts.length === 3) {
      const [day, month, year] = parts
      const dayNum = parseInt(day, 10)
      const monthNum = parseInt(month, 10)
      const yearNum = parseInt(year, 10)
      
      if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900) {
        const formattedDate = `${dayNum.toString().padStart(2, '0')}/${monthNum.toString().padStart(2, '0')}/${yearNum}`
        setLocalDate(formattedDate)
        const isoDate = convertToISOFormat(formattedDate)
        if (onUpdateDate) {
          onUpdateDate(isoDate)
        }
      } else {
        // Reset to current date if invalid
        setLocalDate(getCurrentDate())
      }
    } else {
      // Reset to current date if invalid format
      setLocalDate(getCurrentDate())
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
            value={localStage || ''}
            onChange={handleStageChange}
            onBlur={handleStageBlur}
            placeholder="Main Stage"
            maxLength={50}
          />
        </div>
        
        <div className={styles.dateSection}>
          <label className={styles.dateLabel}>Date:</label>
          <input
            type="text"
            className={styles.dateInput}
            value={localDate}
            onChange={handleDateChange}
            onBlur={handleDateBlur}
            placeholder="DD/MM/YYYY"
            maxLength={10}
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
