'use client'

import { useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getDatabase, onValue } from 'firebase/database'
import { firebaseConfig } from '@/lib/firebaseConfig'
import { saveToLocalStorage, loadFromLocalStorage } from '@/lib/localStorage'
import { getSpreadsheetRef, updateSpreadsheetData } from '@/lib/firebaseOperations'
import { useNotifications } from '@/hooks/useNotifications'
import { useSyncQueue } from '@/hooks/useSyncQueue'
import { NOTIFICATION_TYPES, NOTIFICATION_DURATIONS, DEFAULT_SPREADSHEET } from '@/lib/constants'
import Spreadsheet from '@/components/Spreadsheet'
import Toolbar from '@/components/Toolbar'
import Toast from '@/components/Toast'
import SpreadsheetSelector from '@/components/SpreadsheetSelector'
import styles from '../styles/App.module.scss'

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

export default function Home() {
  const [currentSpreadsheetId, setCurrentSpreadsheetId] = useState(null)
  const [spreadsheetData, setSpreadsheetData] = useState({})
  const [isConnected, setIsConnected] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  
  const { notifications, addNotification, removeNotification, clearNotificationsByTitle } = useNotifications()
  const { syncQueue, addToSyncQueue } = useSyncQueue(currentSpreadsheetId, isConnected, isOnline, addNotification, clearNotificationsByTitle)

  useEffect(() => {
    if (!currentSpreadsheetId) return

    // Load local data and sync queue on startup
    const localData = loadFromLocalStorage(currentSpreadsheetId)
    const localQueue = loadSyncQueue(currentSpreadsheetId)
    setSyncQueue(localQueue)

    // Load local data immediately if available
    if (localData) {
      console.log('Loading initial data from local storage')
      setSpreadsheetData(localData)
    }

    // Online/offline detection
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)

    const spreadsheetRef = getSpreadsheetRef(currentSpreadsheetId)
    
    // Listen for real-time updates
    const unsubscribe = onValue(spreadsheetRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setSpreadsheetData(data)
        saveToLocalStorage(currentSpreadsheetId, data)
        
        if (!isConnected) {
          addNotification('Connected', 'Real-time sync enabled', NOTIFICATION_TYPES.SUCCESS, NOTIFICATION_DURATIONS.SHORT)
        }
      } else {
        // Initialize with default data if empty
        const defaultData = { ...DEFAULT_SPREADSHEET }
        updateSpreadsheetData(currentSpreadsheetId, defaultData)
        setSpreadsheetData(defaultData)
        saveToLocalStorage(currentSpreadsheetId, defaultData)
        
        if (!isConnected) {
          addNotification('Connected', 'New spreadsheet created', NOTIFICATION_TYPES.SUCCESS, NOTIFICATION_DURATIONS.SHORT)
        }
      }
      setIsConnected(true)
    }, (error) => {
      console.error('Firebase connection error:', error)
      setIsConnected(false)
      
      const currentLocalData = loadFromLocalStorage(currentSpreadsheetId)
      if (currentLocalData) {
        console.log('Loading spreadsheet from local storage')
        setSpreadsheetData(currentLocalData)
        addNotification('Connection Lost', 'Working offline with saved data', NOTIFICATION_TYPES.WARNING, NOTIFICATION_DURATIONS.MEDIUM)
      } else {
        const defaultData = { ...DEFAULT_SPREADSHEET }
        setSpreadsheetData(defaultData)
        saveToLocalStorage(currentSpreadsheetId, defaultData)
        addNotification('Connection Lost', 'Starting with new spreadsheet offline', NOTIFICATION_TYPES.WARNING, NOTIFICATION_DURATIONS.MEDIUM)
      }
    })

    return () => {
      unsubscribe()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [currentSpreadsheetId])

  // Handle offline state - load from local storage if available
  useEffect(() => {
    if (!currentSpreadsheetId) return
    
    if (!isOnline && !isConnected) {
      const currentLocalData = loadFromLocalStorage(currentSpreadsheetId)
      if (currentLocalData && Object.keys(spreadsheetData).length === 0) {
        console.log('Loading spreadsheet from local storage (offline mode)')
        setSpreadsheetData(currentLocalData)
      }
      addNotification('Offline Mode', 'Changes will sync when connection returns', NOTIFICATION_TYPES.INFO, NOTIFICATION_DURATIONS.MEDIUM)
    } else if (isOnline && !isConnected) {
      addNotification('Reconnecting...', 'Attempting to restore connection', NOTIFICATION_TYPES.INFO, NOTIFICATION_DURATIONS.SHORT)
    }
  }, [isOnline, isConnected, currentSpreadsheetId, spreadsheetData, addNotification])

  const updateSpreadsheet = (newData) => {
    if (!currentSpreadsheetId) return
    
    const dataWithMetadata = {
      ...newData,
      metadata: {
        ...newData.metadata,
        lastModified: new Date().toISOString()
      }
    }
    
    setSpreadsheetData(dataWithMetadata)
    saveToLocalStorage(currentSpreadsheetId, dataWithMetadata)
    
    if (isConnected && isOnline) {
      updateSpreadsheetData(currentSpreadsheetId, dataWithMetadata).catch((error) => {
        console.error('Error updating Firebase:', error)
        addToSyncQueue(dataWithMetadata)
      })
    } else {
      addToSyncQueue(dataWithMetadata)
    }
  }

  const addRow = () => {
    const newData = {
      ...spreadsheetData,
      rows: (spreadsheetData.rows || 10) + 1
    }
    updateSpreadsheet(newData)
  }

  const insertRow = (afterIndex) => {
    const currentRows = spreadsheetData.rows || 10
    const newRows = currentRows + 1
    const insertAtIndex = afterIndex + 1
    
    const newCells = {}
    const newRowHeaders = {}
    
    // Copy and shift existing cell data
    Object.entries(spreadsheetData.cells || {}).forEach(([cellKey, cellData]) => {
      const [row, col] = cellKey.split('-').map(Number)
      
      if (row < insertAtIndex) {
        // Cells before insertion point stay the same
        newCells[cellKey] = cellData
      } else {
        // Cells at and after insertion point shift down
        const newCellKey = `${row + 1}-${col}`
        newCells[newCellKey] = cellData
      }
    })
    
    // Copy and shift existing row headers
    Object.entries(spreadsheetData.rowHeaders || {}).forEach(([rowIndex, headerValue]) => {
      const row = parseInt(rowIndex)
      
      if (row < insertAtIndex) {
        // Headers before insertion point stay the same
        newRowHeaders[row] = headerValue
      } else {
        // Headers at and after insertion point shift down
        newRowHeaders[row + 1] = headerValue
      }
    })
    
    const newData = {
      ...spreadsheetData,
      rows: newRows,
      cells: newCells,
      rowHeaders: newRowHeaders
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

  const insertColumn = (afterIndex) => {
    const currentCols = spreadsheetData.cols || 10
    const newCols = currentCols + 1
    const insertAtIndex = afterIndex + 1
    
    const newCells = {}
    const newColumnHeaders = {}
    
    // Copy and shift existing cell data
    Object.entries(spreadsheetData.cells || {}).forEach(([cellKey, cellData]) => {
      const [row, col] = cellKey.split('-').map(Number)
      
      if (col < insertAtIndex) {
        // Cells before insertion point stay the same
        newCells[cellKey] = cellData
      } else {
        // Cells at and after insertion point shift right
        const newCellKey = `${row}-${col + 1}`
        newCells[newCellKey] = cellData
      }
    })
    
    // Copy and shift existing column headers
    Object.entries(spreadsheetData.columnHeaders || {}).forEach(([colIndex, headerValue]) => {
      const col = parseInt(colIndex)
      
      if (col < insertAtIndex) {
        // Headers before insertion point stay the same
        newColumnHeaders[col] = headerValue
      } else {
        // Headers at and after insertion point shift right
        newColumnHeaders[col + 1] = headerValue
      }
    })
    
    const newData = {
      ...spreadsheetData,
      cols: newCols,
      cells: newCells,
      columnHeaders: newColumnHeaders
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

  const removeRowAt = (rowIndex) => {
    const currentRows = spreadsheetData.rows || 10
    if (currentRows <= 1) return // Prevent removing all rows
    
    const newRows = currentRows - 1
    const newCells = {}
    const newRowHeaders = {}
    
    // Copy and shift existing cell data
    Object.entries(spreadsheetData.cells || {}).forEach(([cellKey, cellData]) => {
      const [row, col] = cellKey.split('-').map(Number)
      
      if (row < rowIndex) {
        // Cells before removal point stay the same
        newCells[cellKey] = cellData
      } else if (row === rowIndex) {
        // Skip cells in the row being removed
        return
      } else {
        // Cells after removal point shift up
        const newCellKey = `${row - 1}-${col}`
        newCells[newCellKey] = cellData
      }
    })
    
    // Copy and shift existing row headers
    Object.entries(spreadsheetData.rowHeaders || {}).forEach(([rowIndex_key, headerValue]) => {
      const row = parseInt(rowIndex_key)
      
      if (row < rowIndex) {
        // Headers before removal point stay the same
        newRowHeaders[row] = headerValue
      } else if (row === rowIndex) {
        // Skip header being removed
        return
      } else {
        // Headers after removal point shift up
        newRowHeaders[row - 1] = headerValue
      }
    })
    
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
    const newColumnHeaders = { ...spreadsheetData.columnHeaders }
    
    // Remove cells from the last column
    Object.keys(newCells).forEach(cellKey => {
      const [, col] = cellKey.split('-').map(Number)
      if (col >= newCols) {
        delete newCells[cellKey]
      }
    })
    
    // Remove column header for the last column
    if (newColumnHeaders[newCols]) {
      delete newColumnHeaders[newCols]
    }
    
    const newData = {
      ...spreadsheetData,
      cols: newCols,
      cells: newCells,
      columnHeaders: newColumnHeaders
    }
    updateSpreadsheet(newData)
  }

  const removeColumnAt = (columnIndex) => {
    const currentCols = spreadsheetData.cols || 10
    if (currentCols <= 1) return // Prevent removing all columns
    
    const newCols = currentCols - 1
    const newCells = {}
    const newColumnHeaders = {}
    
    // Copy and shift existing cell data
    Object.entries(spreadsheetData.cells || {}).forEach(([cellKey, cellData]) => {
      const [row, col] = cellKey.split('-').map(Number)
      
      if (col < columnIndex) {
        // Cells before removal point stay the same
        newCells[cellKey] = cellData
      } else if (col === columnIndex) {
        // Skip cells in the column being removed
        return
      } else {
        // Cells after removal point shift left
        const newCellKey = `${row}-${col - 1}`
        newCells[newCellKey] = cellData
      }
    })
    
    // Copy and shift existing column headers
    Object.entries(spreadsheetData.columnHeaders || {}).forEach(([colIndex, headerValue]) => {
      const col = parseInt(colIndex)
      
      if (col < columnIndex) {
        // Headers before removal point stay the same
        newColumnHeaders[col] = headerValue
      } else if (col === columnIndex) {
        // Skip header being removed
        return
      } else {
        // Headers after removal point shift left
        newColumnHeaders[col - 1] = headerValue
      }
    })
    
    const newData = {
      ...spreadsheetData,
      cols: newCols,
      cells: newCells,
      columnHeaders: newColumnHeaders
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

  const updateColumnHeader = (col, value) => {
    const newData = {
      ...spreadsheetData,
      columnHeaders: {
        ...spreadsheetData.columnHeaders,
        [col]: value
      }
    }
    updateSpreadsheet(newData)
  }

  const updateSpreadsheetTitle = (title) => {
    const newData = {
      ...spreadsheetData,
      metadata: {
        ...spreadsheetData.metadata,
        title: title,
        lastModified: new Date().toISOString()
      }
    }
    updateSpreadsheet(newData)
  }

  const updateSpreadsheetStage = (stage) => {
    const newData = {
      ...spreadsheetData,
      metadata: {
        ...spreadsheetData.metadata,
        stage: stage,
        lastModified: new Date().toISOString()
      }
    }
    updateSpreadsheet(newData)
  }

  const updateSpreadsheetDate = (date) => {
    const newData = {
      ...spreadsheetData,
      metadata: {
        ...spreadsheetData.metadata,
        date: date,
        lastModified: new Date().toISOString()
      }
    }
    updateSpreadsheet(newData)
  }

  const handleSelectSpreadsheet = (spreadsheetId, initialData = null) => {
    setCurrentSpreadsheetId(spreadsheetId)
    if (initialData) {
      setSpreadsheetData(initialData)
      saveToLocalStorage(spreadsheetId, initialData)
    }
  }

  const handleReturnToSelection = () => {
    setCurrentSpreadsheetId(null)
    setSpreadsheetData({})
    setIsConnected(false)
  }

  // Show spreadsheet selector if no spreadsheet is selected
  if (!currentSpreadsheetId) {
    return (
      <>
        <SpreadsheetSelector 
          onSelectSpreadsheet={handleSelectSpreadsheet}
          addNotification={addNotification}
        />
        <Toast 
          notifications={notifications}
          onRemove={removeNotification}
        />
      </>
    )
  }

  return (
    <div className={styles.app}>
      <header className={styles.appHeader}>
        <div className={styles.headerLeft}>
          <h1>Live Patch</h1>
          <button 
            className={styles.loadButton}
            onClick={handleReturnToSelection}
            title="Load different spreadsheet"
          >
            📁 Load
          </button>
        </div>
        <div className={styles.connectionStatus}>
          <span className={`${styles.statusIndicator} ${isConnected && isOnline ? styles.connected : styles.disconnected}`}></span>
          <span>{isConnected && isOnline ? 'Connected' : !isOnline ? 'Offline' : 'Connecting...'}</span>
          {syncQueue.length > 0 && (
            <span className={styles.syncIndicator}>({syncQueue.length} pending)</span>
          )}
        </div>
      </header>
      <Toast 
        notifications={notifications}
        onRemove={removeNotification}
      />
      <Toolbar 
        spreadsheetTitle={spreadsheetData.metadata?.title || "Untitled Spreadsheet"}
        onUpdateTitle={updateSpreadsheetTitle}
        stage={spreadsheetData.metadata?.stage || "Draft"}
        onUpdateStage={updateSpreadsheetStage}
        date={spreadsheetData.metadata?.date || new Date().toISOString().split('T')[0]}
        onUpdateDate={updateSpreadsheetDate}
      />
      <div className={styles.spreadsheetContainer}>
        <Spreadsheet
          rows={spreadsheetData.rows || 10}
          cols={spreadsheetData.cols || 10}
          cells={spreadsheetData.cells || {}}
          rowHeaders={spreadsheetData.rowHeaders || {}}
          columnHeaders={spreadsheetData.columnHeaders || {}}
          onUpdateCell={updateCell}
          onUpdateRowHeader={updateRowHeader}
          onUpdateColumnHeader={updateColumnHeader}
          onAddRow={addRow}
          onAddColumn={addColumn}
          onRemoveRow={removeRow}
          onRemoveColumn={removeColumn}
          onInsertColumn={insertColumn}
          onRemoveColumnAt={removeColumnAt}
          onInsertRow={insertRow}
          onRemoveRowAt={removeRowAt}
        />
      </div>
    </div>
  )
}
