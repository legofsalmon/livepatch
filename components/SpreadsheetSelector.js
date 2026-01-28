'use client'

import { useState, useEffect } from 'react'
import { onValue } from 'firebase/database'
import { getSpreadsheetsRef, createSpreadsheet } from '@/lib/firebaseOperations'
import { NOTIFICATION_TYPES, NOTIFICATION_DURATIONS } from '@/lib/constants'
import styles from '../styles/SpreadsheetSelector.module.scss'

export default function SpreadsheetSelector({ onSelectSpreadsheet, addNotification }) {
  const [spreadsheets, setSpreadsheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [newSpreadsheetName, setNewSpreadsheetName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    const spreadsheetsRef = getSpreadsheetsRef()
    
    const unsubscribe = onValue(spreadsheetsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const spreadsheetList = Object.entries(data).map(([id, spreadsheet]) => ({
          id,
          title: spreadsheet.metadata?.title || 'Untitled Spreadsheet',
          stage: spreadsheet.metadata?.stage || 'Draft',
          date: spreadsheet.metadata?.date || new Date().toISOString().split('T')[0],
          lastModified: spreadsheet.metadata?.lastModified || new Date().toISOString(),
          rows: spreadsheet.rows || 10,
          cols: spreadsheet.cols || 10
        }))
        
        spreadsheetList.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
        setSpreadsheets(spreadsheetList)
      } else {
        setSpreadsheets([])
      }
      setLoading(false)
    }, (error) => {
      console.error('Error fetching spreadsheets:', error)
      setLoading(false)
      addNotification('Error', 'Failed to load spreadsheets', NOTIFICATION_TYPES.ERROR, NOTIFICATION_DURATIONS.LONG)
    })

    return () => unsubscribe()
  }, [])

  const createNewSpreadsheet = async () => {
    if (!newSpreadsheetName.trim()) return

    try {
      const { id, data } = await createSpreadsheet(newSpreadsheetName)
      
      addNotification(
        'Created', 
        `"${newSpreadsheetName}" spreadsheet created`, 
        NOTIFICATION_TYPES.SUCCESS, 
        NOTIFICATION_DURATIONS.SHORT
      )
      setNewSpreadsheetName('')
      setShowCreateForm(false)
      
      onSelectSpreadsheet(id, data)
    } catch (error) {
      console.error('Error creating spreadsheet:', error)
      addNotification(
        'Error', 
        'Failed to create spreadsheet', 
        NOTIFICATION_TYPES.ERROR, 
        NOTIFICATION_DURATIONS.LONG
      )
    }
  }

  const handleSelect = (spreadsheet) => {
    onSelectSpreadsheet(spreadsheet.id)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading spreadsheets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Live Patch</h1>
        <p>Select a spreadsheet to open or create a new one</p>
      </div>

      <div className={styles.actions}>
        {!showCreateForm ? (
          <button 
            className={styles.createButton}
            onClick={() => setShowCreateForm(true)}
          >
            + New Spreadsheet
          </button>
        ) : (
          <div className={styles.createForm}>
            <input
              type="text"
              placeholder="Enter spreadsheet name"
              value={newSpreadsheetName}
              onChange={(e) => setNewSpreadsheetName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createNewSpreadsheet()}
              autoFocus
            />
            <button onClick={createNewSpreadsheet}>Create</button>
            <button onClick={() => { setShowCreateForm(false); setNewSpreadsheetName('') }}>Cancel</button>
          </div>
        )}
      </div>

      <div className={styles.spreadsheetList}>
        {spreadsheets.length === 0 ? (
          <div className={styles.empty}>
            <h3>No spreadsheets found</h3>
            <p>Create your first spreadsheet to get started</p>
          </div>
        ) : (
          spreadsheets.map(spreadsheet => (
            <div 
              key={spreadsheet.id}
              className={styles.spreadsheetCard}
              onClick={() => handleSelect(spreadsheet)}
            >
              <div className={styles.cardHeader}>
                <h3>{spreadsheet.title}</h3>
                <span className={styles.stage}>{spreadsheet.stage}</span>
              </div>
              <div className={styles.cardInfo}>
                <span>Size: {spreadsheet.rows} × {spreadsheet.cols}</span>
                <span>Date: {formatDate(spreadsheet.date)}</span>
              </div>
              <div className={styles.cardFooter}>
                <span>Last modified: {formatDate(spreadsheet.lastModified)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}