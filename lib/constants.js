// Application constants
export const STORAGE_KEYS = {
  SPREADSHEET_PREFIX: 'livepatch-spreadsheet-',
  SYNC_QUEUE_PREFIX: 'livepatch-sync-queue-'
}

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info'
}

export const NOTIFICATION_DURATIONS = {
  SHORT: 3000,
  MEDIUM: 4000,
  LONG: 5000,
  PERSISTENT: 0
}

export const DEFAULT_SPREADSHEET = {
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

export const FIREBASE_PATHS = {
  SPREADSHEETS: 'spreadsheets'
}