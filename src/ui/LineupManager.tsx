import { useEffect } from 'react'
import type * as Y from 'yjs'
import { addArtist, removeArtist, updateArtist } from '../model/sheetDoc'
import type { Artist, SheetSnapshot } from '../model/types'
import { useDraft } from './useDraft'
import styles from './Manager.module.scss'

function ArtistRow({
  doc,
  artist,
  removable,
}: {
  doc: Y.Doc
  artist: Artist
  removable: boolean
}) {
  const name = useDraft(artist.name, (next) =>
    updateArtist(doc, artist.id, { name: next.trim() || artist.name })
  )
  const notes = useDraft(artist.notes, (next) => updateArtist(doc, artist.id, { notes: next }))

  return (
    <div className={styles.item}>
      <div className={styles.itemHeader}>
        <input
          className={styles.nameInput}
          type="text"
          placeholder="Artist name"
          aria-label="Artist name"
          {...name.inputProps}
        />
        <button
          type="button"
          className={styles.removeButton}
          onClick={() => removeArtist(doc, artist.id)}
          disabled={!removable}
          aria-label={`Remove ${artist.name}`}
          title={removable ? 'Remove artist' : 'At least one artist is required'}
        >
          ×
        </button>
      </div>
      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label htmlFor={`artist-start-${artist.id}`}>Start:</label>
          <input
            id={`artist-start-${artist.id}`}
            type="time"
            value={artist.startTime}
            onChange={(e) => updateArtist(doc, artist.id, { startTime: e.target.value })}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor={`artist-end-${artist.id}`}>End:</label>
          <input
            id={`artist-end-${artist.id}`}
            type="time"
            value={artist.endTime}
            onChange={(e) => updateArtist(doc, artist.id, { endTime: e.target.value })}
          />
        </div>
      </div>
      <div className={styles.notes}>
        <label htmlFor={`artist-notes-${artist.id}`}>Notes:</label>
        <textarea
          id={`artist-notes-${artist.id}`}
          rows={2}
          placeholder="Performance notes, requirements, etc."
          {...notes.inputProps}
        />
      </div>
    </div>
  )
}

export default function LineupManager({
  doc,
  snapshot,
  onClose,
}: {
  doc: Y.Doc
  snapshot: SheetSnapshot
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.popover}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lineup-manager-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id="lineup-manager-title">Lineup Manager</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.controls}>
            <button type="button" className={styles.addButton} onClick={() => addArtist(doc)}>
              + Add Artist
            </button>
          </div>
          {snapshot.artists.map((artist) => (
            <ArtistRow
              key={artist.id}
              doc={doc}
              artist={artist}
              removable={snapshot.artists.length > 1}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
