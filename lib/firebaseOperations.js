import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, push } from 'firebase/database'
import { firebaseConfig } from './firebaseConfig'
import { FIREBASE_PATHS, DEFAULT_SPREADSHEET } from './constants'

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

export const createSpreadsheet = async (name) => {
  try {
    const spreadsheetsRef = ref(database, FIREBASE_PATHS.SPREADSHEETS)
    const spreadsheetData = {
      ...DEFAULT_SPREADSHEET,
      metadata: {
        ...DEFAULT_SPREADSHEET.metadata,
        title: name.trim(),
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
    }
    
    const newSpreadsheetRef = push(spreadsheetsRef)
    await set(newSpreadsheetRef, spreadsheetData)
    
    return {
      id: newSpreadsheetRef.key,
      data: spreadsheetData
    }
  } catch (error) {
    console.error('Failed to create spreadsheet:', error)
    throw new Error(`Failed to create spreadsheet: ${error.message}`)
  }
}

export const updateSpreadsheetData = async (spreadsheetId, data) => {
  try {
    const spreadsheetRef = ref(database, `${FIREBASE_PATHS.SPREADSHEETS}/${spreadsheetId}`)
    return await set(spreadsheetRef, data)
  } catch (error) {
    console.error('Failed to update spreadsheet:', error)
    throw error
  }
}

export const getSpreadsheetRef = (spreadsheetId) => {
  return ref(database, `${FIREBASE_PATHS.SPREADSHEETS}/${spreadsheetId}`)
}

export const getSpreadsheetsRef = () => {
  return ref(database, FIREBASE_PATHS.SPREADSHEETS)
}