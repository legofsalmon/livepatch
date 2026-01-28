import { useState, useEffect } from 'react'
import { saveSyncQueue, loadSyncQueue } from '@/lib/localStorage'
import { updateSpreadsheetData } from '@/lib/firebaseOperations'
import { NOTIFICATION_TYPES, NOTIFICATION_DURATIONS } from '@/lib/constants'

export const useSyncQueue = (spreadsheetId, isConnected, isOnline, addNotification, clearNotificationsByTitle) => {
  const [syncQueue, setSyncQueue] = useState([])

  // Load sync queue on spreadsheet change
  useEffect(() => {
    if (spreadsheetId) {
      const localQueue = loadSyncQueue(spreadsheetId)
      setSyncQueue(localQueue)
    }
  }, [spreadsheetId])

  // Process sync queue when connection is restored
  useEffect(() => {
    if (isConnected && isOnline && syncQueue.length > 0 && spreadsheetId) {
      console.log('Syncing queued changes:', syncQueue.length)
      addNotification(
        'Syncing Changes', 
        `Uploading ${syncQueue.length} pending change(s)`, 
        NOTIFICATION_TYPES.INFO, 
        NOTIFICATION_DURATIONS.PERSISTENT, 
        true
      )
      
      const processQueue = async () => {
        try {
          const latestChange = syncQueue[syncQueue.length - 1]
          await updateSpreadsheetData(spreadsheetId, latestChange.data)
          
          setSyncQueue([])
          saveSyncQueue(spreadsheetId, [])
          console.log('Sync completed successfully')
          
          clearNotificationsByTitle('Syncing Changes')
          addNotification(
            'Sync Complete', 
            'All changes uploaded successfully', 
            NOTIFICATION_TYPES.SUCCESS, 
            NOTIFICATION_DURATIONS.SHORT
          )
        } catch (error) {
          console.error('Sync failed:', error)
          clearNotificationsByTitle('Syncing Changes')
          addNotification(
            'Sync Failed', 
            'Unable to upload changes. Will retry when connection improves.', 
            NOTIFICATION_TYPES.ERROR, 
            NOTIFICATION_DURATIONS.LONG
          )
        }
      }
      
      processQueue()
    }
  }, [isConnected, isOnline, syncQueue, spreadsheetId, addNotification, clearNotificationsByTitle])

  const addToSyncQueue = (data) => {
    if (!spreadsheetId) return
    
    const queueItem = {
      timestamp: new Date().toISOString(),
      data: data
    }
    
    const newQueue = [...syncQueue, queueItem]
    setSyncQueue(newQueue)
    saveSyncQueue(spreadsheetId, newQueue)
    console.log('Added to sync queue:', queueItem.timestamp)
  }

  return {
    syncQueue,
    addToSyncQueue
  }
}