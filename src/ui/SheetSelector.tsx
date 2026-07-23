import { useState } from 'react'
import { createSheet, deleteSheet } from '../store/docManager'
import { useSheetIndex } from '../store/hooks'
import { isoToDisplay } from '../model/date'
import { useToasts } from './toastContext'
import styles from './SheetSelector.module.scss'

export default function SheetSelector({ onOpen }: { onOpen: (sheetId: string) => void }) {
  const { entries, loaded } = useSheetIndex()
  const { addToast } = useToasts()
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  const handleCreate = () => {
    if (!name.trim()) return
    const { sheetId } = createSheet(name)
    addToast('Created', `"${name.trim()}" is ready`, 'success')
    setName('')
    setCreating(false)
    onOpen(sheetId)
  }

  const handleDelete = async (sheetId: string, title: string) => {
    if (!window.confirm(`Delete "${title}" from this device and the shared index?`)) return
    await deleteSheet(sheetId)
    addToast('Deleted', `"${title}" removed`, 'info')
  }

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <h1>Live Patch</h1>
        <p>Patch sheets that work with no internet and sync when you have it</p>
      </header>

      <div className={styles.actions}>
        {creating ? (
          <form
            className={styles.createForm}
            onSubmit={(e) => {
              e.preventDefault()
              handleCreate()
            }}
          >
            <label className={styles.visuallyHidden} htmlFor="new-sheet-name">
              Sheet name
            </label>
            <input
              id="new-sheet-name"
              type="text"
              placeholder="Sheet name (e.g. Summer Fest — Main Stage)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <button type="submit">Create</button>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => {
                setCreating(false)
                setName('')
              }}
            >
              Cancel
            </button>
          </form>
        ) : (
          <button type="button" className={styles.createButton} onClick={() => setCreating(true)}>
            + New Sheet
          </button>
        )}
      </div>

      <div className={styles.list}>
        {!loaded && entries.length === 0 ? (
          <p className={styles.empty}>Loading…</p>
        ) : entries.length === 0 ? (
          <div className={styles.empty}>
            <h2>No sheets yet</h2>
            <p>Create your first patch sheet to get started</p>
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.sheetId} className={styles.card}>
              <button
                type="button"
                className={styles.cardOpen}
                onClick={() => onOpen(entry.sheetId)}
              >
                <span className={styles.cardTitle}>{entry.title}</span>
                <span className={styles.cardMeta}>
                  {entry.stage && <span>{entry.stage}</span>}
                  {entry.date && <span>{isoToDisplay(entry.date)}</span>}
                </span>
              </button>
              <button
                type="button"
                className={styles.cardDelete}
                onClick={() => handleDelete(entry.sheetId, entry.title)}
                aria-label={`Delete ${entry.title}`}
                title="Delete sheet"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
