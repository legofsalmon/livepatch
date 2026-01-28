import { STORAGE_KEYS } from './constants'

export const saveToLocalStorage = (spreadsheetId, data) => {
  try {
    localStorage.setItem(`${STORAGE_KEYS.SPREADSHEET_PREFIX}${spreadsheetId}`, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to save to local storage:', error)
  }
}

export const loadFromLocalStorage = (spreadsheetId) => {
  try {
    const data = localStorage.getItem(`${STORAGE_KEYS.SPREADSHEET_PREFIX}${spreadsheetId}`)
    return data ? JSON.parse(data) : null
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