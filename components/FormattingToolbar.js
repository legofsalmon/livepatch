'use client'

import { useState, useRef, useEffect } from 'react'
import styles from '../styles/FormattingToolbar.module.scss'

export default function FormattingToolbar({ formatting, onFormatChange, isFirstRow = false }) {
  const [showColorPicker, setShowColorPicker] = useState(false)
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
      if (availableSpace < 160) {
        setIsUltraCompact(true)
        setIsCompact(true)
      } else if (availableSpace < 500) {
        setIsUltraCompact(false)
        setIsCompact(true)
      } else {
        setIsUltraCompact(false)
        setIsCompact(false)
      }
    }
  }, [showColorPicker])

  const toggleBold = () => {
    onFormatChange('bold', !formatting.bold)
  }

  const toggleItalic = () => {
    onFormatChange('italic', !formatting.italic)
  }

  const toggleUnderline = () => {
    onFormatChange('underline', !formatting.underline)
  }

  const handleColorChange = (color) => {
    onFormatChange('color', color)
    setShowColorPicker(false)
  }

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#008000', '#000080', '#808080'
  ]

  return (
    <div 
      ref={toolbarRef}
      className={`${styles.formattingToolbar} ${
        isFirstRow ? styles.positionBelow : ''
      } ${
        positioning === 'right' ? styles.positionRight : ''
      } ${
        isCompact ? styles.compact : ''
      } ${
        isUltraCompact ? styles.ultraCompact : ''
      }`}
    >
      <button
        className={`${styles.formatButton} ${formatting.bold ? styles.active : ''}`}
        onClick={toggleBold}
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        className={`${styles.formatButton} ${formatting.italic ? styles.active : ''}`}
        onClick={toggleItalic}
        title="Italic"
      >
        <em>I</em>
      </button>
      <button
        className={`${styles.formatButton} ${formatting.underline ? styles.active : ''}`}
        onClick={toggleUnderline}
        title="Underline"
      >
        <u>U</u>
      </button>
      <button
        className={`${styles.formatButton} ${styles.colorButton}`}
        onClick={() => setShowColorPicker(!showColorPicker)}
        title="Text Color"
        style={{ color: formatting.color || '#000000' }}
      >
        A
      </button>
      {showColorPicker && (
        <div className={styles.colorPicker}>
          {colors.map((color) => (
            <button
              key={color}
              className={styles.colorOption}
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(color)}
              title={color}
            />
          ))}
        </div>
      )}
    </div>
  )
}
