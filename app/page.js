'use client'

import { useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, set } from 'firebase/database'
import { firebaseConfig } from '@/lib/firebaseConfig'
import Spreadsheet from '@/components/Spreadsheet'
import Toolbar from '@/components/Toolbar'
import styles from '../styles/App.module.scss'

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

export default function Home() {
  const [spreadsheetData, setSpreadsheetData] = useState({})
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const spreadsheetRef = ref(database, 'spreadsheet')
    
    // Listen for real-time updates
    const unsubscribe = onValue(spreadsheetRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setSpreadsheetData(data)
      } else {
        // Initialize with default data if empty
        const defaultData = {
          rows: 10,
          cols: 10,
          cells: {},
          rowHeaders: {}
        }
        set(spreadsheetRef, defaultData)
        setSpreadsheetData(defaultData)
      }
      setIsConnected(true)
    }, (error) => {
      console.error('Firebase connection error:', error)
      setIsConnected(false)
      // Use local data if Firebase is not available
      const defaultData = {
        rows: 10,
        cols: 10,
        cells: {},
        rowHeaders: {}
      }
      setSpreadsheetData(defaultData)
    })

    return () => unsubscribe()
  }, [])

  const updateSpreadsheet = (newData) => {
    const spreadsheetRef = ref(database, 'spreadsheet')
    set(spreadsheetRef, newData).catch((error) => {
      console.error('Error updating spreadsheet:', error)
      // Update local state even if Firebase fails
      setSpreadsheetData(newData)
    })
  }

  const addRow = () => {
    const newData = {
      ...spreadsheetData,
      rows: (spreadsheetData.rows || 10) + 1
    }
    updateSpreadsheet(newData)
  }

  const addColumn = () => {
    const newData = {
      ...spreadsheetData,
      cols: (spreadsheetData.cols || 10) + 1
    }
    updateSpreadsheet(newData)
  }

  const removeRow = () => {
    const currentRows = spreadsheetData.rows || 10
    if (currentRows <= 1) return // Prevent removing all rows
    
    const newRows = currentRows - 1
    const newCells = { ...spreadsheetData.cells }
    const newRowHeaders = { ...spreadsheetData.rowHeaders }
    
    // Remove cells from the last row
    Object.keys(newCells).forEach(cellKey => {
      const [row] = cellKey.split('-').map(Number)
      if (row >= newRows) {
        delete newCells[cellKey]
      }
    })
    
    // Remove row header for the last row
    if (newRowHeaders[newRows]) {
      delete newRowHeaders[newRows]
    }
    
    const newData = {
      ...spreadsheetData,
      rows: newRows,
      cells: newCells,
      rowHeaders: newRowHeaders
    }
    updateSpreadsheet(newData)
  }

  const removeColumn = () => {
    const currentCols = spreadsheetData.cols || 10
    if (currentCols <= 1) return // Prevent removing all columns
    
    const newCols = currentCols - 1
    const newCells = { ...spreadsheetData.cells }
    
    // Remove cells from the last column
    Object.keys(newCells).forEach(cellKey => {
      const [, col] = cellKey.split('-').map(Number)
      if (col >= newCols) {
        delete newCells[cellKey]
      }
    })
    
    const newData = {
      ...spreadsheetData,
      cols: newCols,
      cells: newCells
    }
    updateSpreadsheet(newData)
  }

  const updateCell = (row, col, value, formatting) => {
    const cellKey = `${row}-${col}`
    const newData = {
      ...spreadsheetData,
      cells: {
        ...spreadsheetData.cells,
        [cellKey]: { value, formatting }
      }
    }
    updateSpreadsheet(newData)
  }

  const updateRowHeader = (row, value) => {
    const newData = {
      ...spreadsheetData,
      rowHeaders: {
        ...spreadsheetData.rowHeaders,
        [row]: value
      }
    }
    updateSpreadsheet(newData)
  }

  return (
    <div className={styles.app}>
      <header className={styles.appHeader}>
        <h1>Live Patch</h1>
        <div className={styles.connectionStatus}>
          <span className={`${styles.statusIndicator} ${isConnected ? styles.connected : styles.disconnected}`}></span>
          <span>{isConnected ? 'Connected' : 'Offline'}</span>
        </div>
      </header>
      <Toolbar 
        onAddRow={addRow} 
        onAddColumn={addColumn}
        onRemoveRow={removeRow}
        onRemoveColumn={removeColumn}
      />
      <div className={styles.spreadsheetContainer}>
        <Spreadsheet
          rows={spreadsheetData.rows || 10}
          cols={spreadsheetData.cols || 10}
          cells={spreadsheetData.cells || {}}
          rowHeaders={spreadsheetData.rowHeaders || {}}
          onUpdateCell={updateCell}
          onUpdateRowHeader={updateRowHeader}
        />
      </div>
    </div>
  )
}
