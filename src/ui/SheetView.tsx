import { useState } from 'react'
import { useSheet } from '../store/hooks'
import Toolbar from './Toolbar'
import PatchGrid from './PatchGrid'
import SubBoxManager from './SubBoxManager'
import LineupManager from './LineupManager'
import styles from './SheetView.module.scss'

export default function SheetView({
  sheetId,
  onClose,
}: {
  sheetId: string
  onClose: () => void
}) {
  const { doc, snapshot, loaded } = useSheet(sheetId)
  const [showHeaders, setShowHeaders] = useState(true)
  const [showSubBoxes, setShowSubBoxes] = useState(false)
  const [showLineup, setShowLineup] = useState(false)

  if (!doc || !snapshot || !loaded) {
    return <div className={styles.loading}>Loading sheet…</div>
  }

  return (
    <div className={styles.app}>
      <button
        type="button"
        className={styles.headerToggle}
        onClick={() => setShowHeaders((v) => !v)}
        aria-expanded={showHeaders}
        title={showHeaders ? 'Hide headers to save space' : 'Show headers'}
      >
        <span className={showHeaders ? styles.chevronUp : styles.chevronDown} aria-hidden="true">
          ▲
        </span>
      </button>

      {showHeaders && (
        <header className={styles.appHeader}>
          <div className={styles.headerLeft}>
            <h1>Live Patch</h1>
            <button type="button" className={styles.loadButton} onClick={onClose}>
              📁 Sheets
            </button>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.statusChip}>Saved on this device</span>
          </div>
        </header>
      )}

      {showHeaders && (
        <Toolbar
          doc={doc}
          snapshot={snapshot}
          onOpenSubBoxes={() => setShowSubBoxes(true)}
          onOpenLineup={() => setShowLineup(true)}
        />
      )}

      <div className={styles.gridArea}>
        <PatchGrid doc={doc} snapshot={snapshot} />
      </div>

      {showSubBoxes && (
        <SubBoxManager doc={doc} snapshot={snapshot} onClose={() => setShowSubBoxes(false)} />
      )}
      {showLineup && (
        <LineupManager doc={doc} snapshot={snapshot} onClose={() => setShowLineup(false)} />
      )}
    </div>
  )
}
