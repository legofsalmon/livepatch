import { useEffect, useState } from 'react'
import { useSheet } from '../store/hooks'
import { sheetDocName } from '../store/docManager'
import { useRemotePeers, useSyncPeers, useSyncStatus } from '../store/useSync'
import Toolbar from './Toolbar'
import PatchGrid from './PatchGrid'
import SubBoxManager from './SubBoxManager'
import LineupManager from './LineupManager'
import SyncSettingsDialog from './SyncSettingsDialog'
import styles from './SheetView.module.scss'

function PresenceAvatars({ sheetId }: { sheetId: string }) {
  const peers = useRemotePeers(sheetDocName(sheetId))
  if (peers.length === 0) return null
  return (
    <span className={styles.avatars} aria-label={`Also here: ${peers.map((p) => p.name).join(', ')}`}>
      {peers.slice(0, 5).map((peer) => (
        <span
          key={peer.clientId}
          className={styles.avatar}
          style={{ backgroundColor: peer.color }}
          title={peer.name}
        >
          {peer.name.charAt(0).toUpperCase()}
        </span>
      ))}
      {peers.length > 5 && <span className={styles.avatarOverflow}>+{peers.length - 5}</span>}
    </span>
  )
}

function SyncStatusChip({
  sheetId,
  onOpenSettings,
}: {
  sheetId: string
  onOpenSettings: () => void
}) {
  const status = useSyncStatus()
  const peers = useSyncPeers(sheetDocName(sheetId))

  const label =
    status === 'off'
      ? 'Local only'
      : status === 'connecting'
        ? 'Connecting…'
        : peers > 1
          ? `Synced · ${peers} devices`
          : 'Synced'

  return (
    <button
      type="button"
      className={`${styles.statusChip} ${styles[status]}`}
      onClick={onOpenSettings}
      title="Sync settings"
    >
      <span className={styles.statusDot} aria-hidden="true" />
      {label}
    </button>
  )
}

export default function SheetView({ sheetId, onClose }: { sheetId: string; onClose: () => void }) {
  const { doc, snapshot, loaded } = useSheet(sheetId)
  const [showHeaders, setShowHeaders] = useState(true)
  const [showSubBoxes, setShowSubBoxes] = useState(false)
  const [showLineup, setShowLineup] = useState(false)
  const [showSyncSettings, setShowSyncSettings] = useState(false)

  const title = snapshot?.meta.title
  useEffect(() => {
    document.title = title ? `${title} — Live Patch` : 'Live Patch'
    return () => {
      document.title = 'Live Patch'
    }
  }, [title])

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
            <PresenceAvatars sheetId={sheetId} />
            <SyncStatusChip sheetId={sheetId} onOpenSettings={() => setShowSyncSettings(true)} />
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
        <PatchGrid doc={doc} docName={sheetDocName(sheetId)} snapshot={snapshot} />
      </div>

      {showSubBoxes && (
        <SubBoxManager doc={doc} snapshot={snapshot} onClose={() => setShowSubBoxes(false)} />
      )}
      {showLineup && (
        <LineupManager doc={doc} snapshot={snapshot} onClose={() => setShowLineup(false)} />
      )}
      {showSyncSettings && <SyncSettingsDialog onClose={() => setShowSyncSettings(false)} />}
    </div>
  )
}
