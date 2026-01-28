import { useState } from 'react'
import { NOTIFICATION_DURATIONS } from '@/lib/constants'

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([])

  const addNotification = (title, message, type = 'info', duration = NOTIFICATION_DURATIONS.MEDIUM, persistent = false) => {
    // Check if notification with same title already exists
    const existingNotification = notifications.find(n => n.title === title)
    if (existingNotification) {
      return existingNotification.id
    }
    
    const id = Date.now() + Math.random()
    const notification = { id, title, message, type, duration, persistent }
    setNotifications(prev => [...prev, notification])
    return id
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearNotificationsByTitle = (title) => {
    setNotifications(prev => prev.filter(n => n.title !== title))
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotificationsByTitle
  }
}