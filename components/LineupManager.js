'use client'

import { useState, useEffect } from 'react'
import styles from '../styles/LineupManager.module.scss'

export default function LineupManager({ lineup = [], onUpdate, isVisible, onClose }) {
  const [localLineup, setLocalLineup] = useState(lineup)

  // Sync local state with prop changes (for loading from Firebase/localStorage)
  useEffect(() => {
    setLocalLineup(lineup)
  }, [lineup])

  const handleAddArtist = () => {
    const newArtist = {
      id: Date.now() + Math.random(),
      name: `Artist ${localLineup.length + 1}`,
      startTime: '19:00',
      endTime: '20:00',
      notes: '',
      files: []
    }
    const updated = [...localLineup, newArtist]
    setLocalLineup(updated)
    onUpdate(updated)
  }

  const handleRemoveArtist = (id) => {
    const updated = localLineup.filter(artist => artist.id !== id)
    setLocalLineup(updated)
    onUpdate(updated)
  }

  const handleUpdateArtist = (id, field, value) => {
    const updated = localLineup.map(artist =>
      artist.id === id ? { ...artist, [field]: value } : artist
    )
    setLocalLineup(updated)
    onUpdate(updated)
  }

  const handleFileUpload = (id, event) => {
    const files = Array.from(event.target.files)
    const validFiles = files.filter(file => {
      const fileType = file.type
      return fileType.startsWith('image/') || fileType === 'application/pdf'
    })

    if (validFiles.length > 0) {
      const fileData = validFiles.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
        data: null // In a real app, you'd convert to base64 or upload to cloud storage
      }))

      const artist = localLineup.find(a => a.id === id)
      const updatedFiles = [...(artist.files || []), ...fileData]
      handleUpdateArtist(id, 'files', updatedFiles)
    }
  }

  const handleRemoveFile = (artistId, fileId) => {
    const artist = localLineup.find(a => a.id === artistId)
    const updatedFiles = artist.files.filter(f => f.id !== fileId)
    handleUpdateArtist(artistId, 'files', updatedFiles)
  }

  if (!isVisible) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.popover}>
        <div className={styles.header}>
          <h3>Lineup Manager</h3>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            title="Close"
          >
            ×
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.controls}>
            <button 
              className={styles.addButton}
              onClick={handleAddArtist}
            >
              + Add Artist
            </button>
          </div>

          <div className={styles.artistList}>
            {localLineup.map(artist => (
              <div key={artist.id} className={styles.artistItem}>
                <div className={styles.artistHeader}>
                  <input
                    type="text"
                    value={artist.name}
                    onChange={(e) => handleUpdateArtist(artist.id, 'name', e.target.value)}
                    className={styles.nameInput}
                    placeholder="Artist name"
                  />
                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemoveArtist(artist.id)}
                    title="Remove artist"
                  >
                    ×
                  </button>
                </div>
                
                <div className={styles.artistControls}>
                  <div className={styles.controlGroup}>
                    <label>Start Time:</label>
                    <input
                      type="time"
                      value={artist.startTime}
                      onChange={(e) => handleUpdateArtist(artist.id, 'startTime', e.target.value)}
                      className={styles.timeInput}
                    />
                  </div>
                  
                  <div className={styles.controlGroup}>
                    <label>End Time:</label>
                    <input
                      type="time"
                      value={artist.endTime}
                      onChange={(e) => handleUpdateArtist(artist.id, 'endTime', e.target.value)}
                      className={styles.timeInput}
                    />
                  </div>
                </div>

                <div className={styles.notesSection}>
                  <label>Notes:</label>
                  <textarea
                    value={artist.notes}
                    onChange={(e) => handleUpdateArtist(artist.id, 'notes', e.target.value)}
                    className={styles.notesInput}
                    placeholder="Performance notes, requirements, etc."
                    rows={3}
                  />
                </div>

                <div className={styles.fileSection}>
                  <label>Files (Images & PDFs):</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(artist.id, e)}
                    className={styles.fileInput}
                  />
                  
                  {artist.files && artist.files.length > 0 && (
                    <div className={styles.fileList}>
                      {artist.files.map(file => (
                        <div key={file.id} className={styles.fileItem}>
                          <span className={styles.fileName}>{file.name}</span>
                          <button
                            className={styles.removeFileButton}
                            onClick={() => handleRemoveFile(artist.id, file.id)}
                            title="Remove file"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {localLineup.length === 0 && (
              <div className={styles.emptyState}>
                <p>No artists in lineup</p>
                <p>Click "Add Artist" to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}