'use client'

import { useState, useEffect } from 'react'
import styles from '../styles/SubBoxManager.module.scss'

const STAGE_POSITIONS = [
  'USC', 'USL', 'USR',  // Upstage Center, Left, Right
  'MSC', 'MSL', 'MSR',  // Mid-stage Center, Left, Right
  'DSC', 'DSL', 'DSR'   // Downstage Center, Left, Right
]

export default function SubBoxManager({ subBoxes = [], onUpdate, isVisible, onClose }) {
  const [localSubBoxes, setLocalSubBoxes] = useState(subBoxes)
  const [editingValues, setEditingValues] = useState({})

  // Sync local state with prop changes (for loading from Firebase/localStorage)
  useEffect(() => {
    setLocalSubBoxes(subBoxes)
    setEditingValues({})
  }, [subBoxes])

  const handleAddSubBox = () => {
    const newSubBox = {
      id: Date.now() + Math.random(),
      name: `Sub-box ${localSubBoxes.length + 1}`,
      inputs: 4,
      color: '#ff0000',
      stagePosition: 'MSC'
    }
    const updated = [...localSubBoxes, newSubBox]
    setLocalSubBoxes(updated)
    onUpdate(updated)
  }

  const handleRemoveSubBox = (id) => {
    const updated = localSubBoxes.filter(subBox => subBox.id !== id)
    setLocalSubBoxes(updated)
    setEditingValues(prev => {
      const newValues = { ...prev }
      delete newValues[`${id}_name`]
      delete newValues[`${id}_inputs`]
      delete newValues[`${id}_stagePosition`]
      return newValues
    })
    onUpdate(updated)
  }

  const handleInputChange = (id, field, value) => {
    const key = `${id}_${field}`
    setEditingValues(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleInputBlur = (id, field) => {
    const key = `${id}_${field}`
    const value = editingValues[key]
    
    if (value !== undefined) {
      let processedValue = value
      if (field === 'inputs') {
        processedValue = parseInt(value) || 0
      }
      
      const updated = localSubBoxes.map(subBox =>
        subBox.id === id ? { ...subBox, [field]: processedValue } : subBox
      )
      setLocalSubBoxes(updated)
      onUpdate(updated)
      
      // Clear the editing value after successful update
      setEditingValues(prev => {
        const newValues = { ...prev }
        delete newValues[key]
        return newValues
      })
    }
  }

  const handleColorChange = (id, value) => {
    // Color input can update immediately as it's typically a single action
    const updated = localSubBoxes.map(subBox =>
      subBox.id === id ? { ...subBox, color: value } : subBox
    )
    setLocalSubBoxes(updated)
    onUpdate(updated)
  }

  const getInputValue = (subBox, field) => {
    const key = `${subBox.id}_${field}`
    return editingValues[key] !== undefined ? editingValues[key] : subBox[field]
  }

  if (!isVisible) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.popover}>
        <div className={styles.header}>
          <h3>Sub-Box Manager</h3>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            title="Close"
          >
            ×
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.controls}>
            <button 
              className={styles.addButton}
              onClick={handleAddSubBox}
            >
              + Add Sub-Box
            </button>
          </div>

          <div className={styles.subBoxList}>
            {localSubBoxes.map(subBox => (
              <div key={subBox.id} className={styles.subBoxItem}>
                <div className={styles.subBoxHeader}>
                  <input
                    type="text"
                    value={getInputValue(subBox, 'name')}
                    onChange={(e) => handleInputChange(subBox.id, 'name', e.target.value)}
                    onBlur={() => handleInputBlur(subBox.id, 'name')}
                    className={styles.nameInput}
                    placeholder="Sub-box name"
                  />
                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemoveSubBox(subBox.id)}
                    title="Remove sub-box"
                  >
                    ×
                  </button>
                </div>
                
                <div className={styles.subBoxControls}>
                  <div className={styles.controlGroup}>
                    <label>Inputs:</label>
                    <input
                      type="number"
                      value={getInputValue(subBox, 'inputs')}
                      onChange={(e) => handleInputChange(subBox.id, 'inputs', e.target.value)}
                      onBlur={() => handleInputBlur(subBox.id, 'inputs')}
                      className={styles.numberInput}
                      min="1"
                      max="32"
                    />
                  </div>
                  
                  <div className={styles.controlGroup}>
                    <label>Color:</label>
                    <input
                      type="color"
                      value={subBox.color}
                      onChange={(e) => handleColorChange(subBox.id, e.target.value)}
                      className={styles.colorInput}
                      list="color-options"
                      placeholder="#ff0000"
                    />
                    <datalist id="color-options">
                      <option value="#ff0000">Red</option>
                      <option value="#00ff00">Green</option>
                      <option value="#0000ff">Blue</option>
                      <option value="#ffff00">Yellow</option>
                      <option value="#ff00ff">Magenta</option>
                      <option value="#00ffff">Cyan</option>
                    </datalist>
                  </div>
                  
                  <div className={styles.controlGroup}>
                    <label>Stage Position:</label>
                    <input
                      type="text"
                      value={getInputValue(subBox, 'stagePosition')}
                      onChange={(e) => handleInputChange(subBox.id, 'stagePosition', e.target.value)}
                      onBlur={() => handleInputBlur(subBox.id, 'stagePosition')}
                      className={styles.positionInput}
                      list="stage-positions"
                    />
                    <datalist id="stage-positions">
                      {STAGE_POSITIONS.map(position => (
                        <option key={position} value={position} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>
            ))}
            
            {localSubBoxes.length === 0 && (
              <div className={styles.emptyState}>
                <p>No sub-boxes configured</p>
                <p>Click "Add Sub-Box" to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}