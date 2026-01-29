import { useState, useCallback } from 'react'
import { NOTIFICATION_DURATIONS } from '@/lib/constants'

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((title, message, type = 'info', duration = NOTIFICATION_DURATIONS.MEDIUM, persistent = false) => {
    // Check if notification with same title and message already exists
    const existingNotification = notifications.find(n => 
      n.title === title && n.message === message
    )
    if (existingNotification) {
      return existingNotification.id
    }
    
    const id = Date.now() + Math.random()
    const notification = { id, title, message, type, duration, persistent }
    setNotifications(prev => [...prev, notification])
    return id
  }, [notifications])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearNotificationsByTitle = useCallback((title) => {
    setNotifications(prev => prev.filter(n => n.title !== title))
  }, [])

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotificationsByTitle
  }
}