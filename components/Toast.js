'use client'

import { useEffect, useState } from 'react'
import styles from '../styles/Toast.module.scss'

export default function Toast({ notifications, onRemove }) {
  const [animatingNotifications, setAnimatingNotifications] = useState([])

  useEffect(() => {
    // Auto-remove notifications after their duration
    const timers = []
    
    notifications.forEach(notification => {
      if (notification.duration > 0) {
        const timer = setTimeout(() => {
          handleRemove(notification.id)
        }, notification.duration)
        timers.push(timer)
      }
    })
    
    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [notifications])

  const handleRemove = (id) => {
    // Add slideOut animation
    setAnimatingNotifications(prev => [...prev, id])
    
    // Remove after animation completes
    setTimeout(() => {
      onRemove(id)
      setAnimatingNotifications(prev => prev.filter(animId => animId !== id))
    }, 300)
  }

  if (notifications.length === 0) return null

  return (
    <div className={styles.toastContainer}>
      {notifications.map(notification => {
        const isAnimatingOut = animatingNotifications.includes(notification.id)
        
        return (
          <div 
            key={notification.id}
            className={`${styles.toast} ${styles[notification.type]} ${
              isAnimatingOut ? styles.slideOut : styles.slideIn
            }`}
            onClick={() => handleRemove(notification.id)}
          >
            <div className={styles.toastContent}>
              <div className={styles.toastIcon}>
                {notification.type === 'success' && '✓'}
                {notification.type === 'warning' && '⚠'}
                {notification.type === 'error' && '✕'}
                {notification.type === 'info' && 'ℹ'}
              </div>
              <div className={styles.toastMessage}>
                <div className={styles.toastTitle}>{notification.title}</div>
                {notification.message && (
                  <div className={styles.toastDescription}>{notification.message}</div>
                )}
              </div>
              {!notification.persistent && (
                <button 
                  className={styles.toastClose}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(notification.id)
                  }}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}