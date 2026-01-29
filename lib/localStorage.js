import { STORAGE_KEYS } from './constants'

// Simple compression/decompression for localStorage
const compress = (obj) => {
  try {
    const jsonString = JSON.stringify(obj)
    // Remove unnecessary whitespace and compress common patterns
    return jsonString
      .replace(/\s+/g, ' ')
      .replace(/"(\w+)":/g, '$1:') // Remove quotes from keys where possible
      .trim()
  } catch {
    return JSON.stringify(obj)
  }
}

const decompress = (str) => {
  try {
    // Add quotes back to keys
    const normalized = str.replace(/(\w+):/g, '"$1":')
    return JSON.parse(normalized)
  } catch {
    return JSON.parse(str)
  }
}

export const saveToLocalStorage = (spreadsheetId, data) => {
  try {
    const compressed = compress(data)
    localStorage.setItem(`${STORAGE_KEYS.SPREADSHEET_PREFIX}${spreadsheetId}`, compressed)
  } catch (error) {
    console.warn('Failed to save to local storage:', error)
    // Fallback: try saving without compression
    try {
      localStorage.setItem(`${STORAGE_KEYS.SPREADSHEET_PREFIX}${spreadsheetId}`, JSON.stringify(data))
    } catch (fallbackError) {
      console.error('Failed to save even with fallback:', fallbackError)
    }
  }
}

export const loadFromLocalStorage = (spreadsheetId) => {
  try {
    const data = localStorage.getItem(`${STORAGE_KEYS.SPREADSHEET_PREFIX}${spreadsheetId}`)
    if (!data) return null
    
    // Try compressed format first, then fallback to regular JSON
    try {
      return decompress(data)
    } catch {
      return JSON.parse(data)
    }
  } catch (error) {
    console.warn('Failed to load from local storage:', error)
    return null
  }
}

export const saveSyncQueue = (spreadsheetId, queue) => {
  try {
    localStorage.setItem(`${STORAGE_KEYS.SYNC_QUEUE_PREFIX}${spreadsheetId}`, JSON.stringify(queue))
  } catch (error) {
    console.warn('Failed to save sync queue:', error)
  }
}

export const loadSyncQueue = (spreadsheetId) => {
  try {
    const queue = localStorage.getItem(`${STORAGE_KEYS.SYNC_QUEUE_PREFIX}${spreadsheetId}`)
    return queue ? JSON.parse(queue) : []
  } catch (error) {
    console.warn('Failed to load sync queue:', error)
    return []
  }
}

// Cleanup old localStorage entries to prevent bloat
export const cleanupOldEntries = () => {
  try {
    const keysToRemove = []
    const now = Date.now()
    const MAX_AGE = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith(STORAGE_KEYS.SPREADSHEET_PREFIX) || key.startsWith(STORAGE_KEYS.SYNC_QUEUE_PREFIX))) {
        try {
          const data = localStorage.getItem(key)
          const parsed = JSON.parse(data)
          const lastModified = parsed.metadata?.lastModified || parsed.timestamp
          
          if (lastModified) {
            const age = now - new Date(lastModified).getTime()
            if (age > MAX_AGE) {
              keysToRemove.push(key)
            }
          }
        } catch {
          // Invalid data, mark for removal
          keysToRemove.push(key)
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
    if (keysToRemove.length > 0) {
      console.log(`Cleaned up ${keysToRemove.length} old localStorage entries`)
    }
  } catch (error) {
    console.warn('Failed to cleanup localStorage:', error)
  }
}