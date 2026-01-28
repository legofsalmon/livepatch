import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, push } from 'firebase/database'
import { firebaseConfig } from './firebaseConfig'
import { FIREBASE_PATHS, DEFAULT_SPREADSHEET } from './constants'

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

export const createSpreadsheet = async (name) => {
  const spreadsheetsRef = ref(database, FIREBASE_PATHS.SPREADSHEETS)
  const spreadsheetData = {
    ...DEFAULT_SPREADSHEET,
    metadata: {
      ...DEFAULT_SPREADSHEET.metadata,
      title: name.trim()
    }
  }
  
  const newSpreadsheetRef = push(spreadsheetsRef)
  await set(newSpreadsheetRef, spreadsheetData)
  
  return {
    id: newSpreadsheetRef.key,
    data: spreadsheetData
  }
}

export const updateSpreadsheetData = async (spreadsheetId, data) => {
  const spreadsheetRef = ref(database, `${FIREBASE_PATHS.SPREADSHEETS}/${spreadsheetId}`)
  return set(spreadsheetRef, data)
}

export const getSpreadsheetRef = (spreadsheetId) => {
  return ref(database, `${FIREBASE_PATHS.SPREADSHEETS}/${spreadsheetId}`)
}

export const getSpreadsheetsRef = () => {
  return ref(database, FIREBASE_PATHS.SPREADSHEETS)
}