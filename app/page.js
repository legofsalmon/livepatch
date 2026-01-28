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

// Local storage utilities
const STORAGE_KEY = 'livepatch-spreadsheet'
const SYNC_QUEUE_KEY = 'livepatch-sync-queue'

const saveToLocalStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to save to local storage:', error)
  }
}

const loadFromLocalStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.warn('Failed to load from local storage:', error)
    return null
  }
}

const saveSyncQueue = (queue) => {
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue))
  } catch (error) {
    console.warn('Failed to save sync queue:', error)
  }
}

const loadSyncQueue = () => {
  try {
    const queue = localStorage.getItem(SYNC_QUEUE_KEY)
    return queue ? JSON.parse(queue) : []
  } catch (error) {
    console.warn('Failed to load sync queue:', error)
    return []
  }
}

export default function Home() {
  const [spreadsheetData, setSpreadsheetData] = useState({})
  const [isConnected, setIsConnected] = useState(false)
  const [syncQueue, setSyncQueue] = useState([])
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Load local data and sync queue on startup
    const localData = loadFromLocalStorage()
    const localQueue = loadSyncQueue()
    setSyncQueue(localQueue)

    // Online/offline detection
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)

    const spreadsheetRef = ref(database, 'spreadsheet')
    
    // Listen for real-time updates
    const unsubscribe = onValue(spreadsheetRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setSpreadsheetData(data)
        saveToLocalStorage(data)
      } else {
        // Initialize with default data if empty
        const defaultData = {
          rows: 10,
          cols: 10,
          cells: {},
          rowHeaders: {},
          columnHeaders: {},
          metadata: {
            title: "Untitled Spreadsheet",
            stage: "Draft",
            date: new Date().toISOString().split('T')[0],
            created: new Date().toISOString(),
            lastModified: new Date().toISOString()
          }
        }
        set(spreadsheetRef, defaultData)
        setSpreadsheetData(defaultData)
        saveToLocalStorage(defaultData)
      }
      setIsConnected(true)
    }, (error) => {
      console.error('Firebase connection error:', error)
      setIsConnected(false)
      
      // Use local data if available, otherwise use default
      if (localData) {
        setSpreadsheetData(localData)
      } else {
        const defaultData = {
          rows: 10,
          cols: 10,
          cells: {},
          rowHeaders: {},
          columnHeaders: {},
          metadata: {
            title: "Untitled Spreadsheet",
            stage: "Draft",
            date: new Date().toISOString().split('T')[0],
            created: new Date().toISOString(),
            lastModified: new Date().toISOString()
          }
        }
        setSpreadsheetData(defaultData)
        saveToLocalStorage(defaultData)
      }
    })

    return () => {
      unsubscribe()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Sync queued changes when connection is restored
  useEffect(() => {
    if (isConnected && isOnline && syncQueue.length > 0) {
      console.log('Syncing queued changes:', syncQueue.length)
      
      // Process sync queue
      const processQueue = async () => {
        try {
          // Get the latest version from queue (most recent state)
          const latestChange = syncQueue[syncQueue.length - 1]
          const spreadsheetRef = ref(database, 'spreadsheet')
          await set(spreadsheetRef, latestChange.data)
          
          // Clear the queue after successful sync
          setSyncQueue([])
          saveSyncQueue([])
          console.log('Sync completed successfully')
        } catch (error) {
          console.error('Sync failed:', error)
        }
      }
      
      processQueue()
    }
  }, [isConnected, isOnline, syncQueue])

  const updateSpreadsheet = (newData) => {
    // Ensure metadata exists and update lastModified timestamp
    const dataWithMetadata = {
      ...newData,
      metadata: {
        ...newData.metadata,
        lastModified: new Date().toISOString()
      }
    }
    
    // Always update local state and storage
    setSpreadsheetData(dataWithMetadata)
    saveToLocalStorage(dataWithMetadata)
    
    if (isConnected && isOnline) {
      // Update Firebase if online and connected
      const spreadsheetRef = ref(database, 'spreadsheet')
      set(spreadsheetRef, dataWithMetadata).catch((error) => {
        console.error('Error updating Firebase:', error)
        // Add to sync queue if Firebase update fails
        addToSyncQueue(dataWithMetadata)
      })
    } else {
      // Add to sync queue if offline
      addToSyncQueue(dataWithMetadata)
    }
  }

  const addToSyncQueue = (data) => {
    const queueItem = {
      timestamp: new Date().toISOString(),
      data: data
    }
    
    const newQueue = [...syncQueue, queueItem]
    setSyncQueue(newQueue)
    saveSyncQueue(newQueue)
    console.log('Added to sync queue:', queueItem.timestamp)
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

  return (
    <div className={styles.app}>
      <header className={styles.appHeader}>
        <h1>Live Patch</h1>
        <div className={styles.connectionStatus}>
          <span className={`${styles.statusIndicator} ${isConnected && isOnline ? styles.connected : styles.disconnected}`}></span>
          <span>{isConnected && isOnline ? 'Connected' : !isOnline ? 'Offline' : 'Connecting...'}</span>
          {syncQueue.length > 0 && (
            <span className={styles.syncIndicator}>({syncQueue.length} pending)</span>
          )}
        </div>
      </header>
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
