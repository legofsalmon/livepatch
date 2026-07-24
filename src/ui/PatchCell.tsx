import type * as Y from 'yjs'
import { patchSubBoxDisplay, setPatchField, setPatchSubBox } from '../model/sheetDoc'
import { emptyPatchEntry, type PatchEntry, type PatchField, type SubBox } from '../model/types'
import { syncManager } from '../store/sync'
import { useDraft } from './useDraft'
import styles from './PatchGrid.module.scss'

export default function PatchCell({
  doc,
  docName,
  artistId,
  channelId,
  field,
  entry,
  subBoxes,
  datalistId,
  label,
  remoteEditor,
  gridPos,
  onNavigate,
}: {
  doc: Y.Doc
  docName: string
  artistId: string
  channelId: string
  field: PatchField
  entry: PatchEntry | undefined
  subBoxes: SubBox[]
  datalistId?: string
  label: string
  remoteEditor?: { name: string; color: string }
  /** "row:col" position used for keyboard navigation between cells. */
  gridPos: string
  onNavigate: (gridPos: string, rowDelta: number) => void
}) {
  const resolved = entry ?? emptyPatchEntry()
  const displayValue = field === 'subBox' ? patchSubBoxDisplay(resolved, subBoxes) : resolved[field]

  const draft = useDraft(displayValue, (next) => {
    if (field === 'subBox') {
      setPatchSubBox(doc, artistId, channelId, next.trim())
    } else {
      setPatchField(doc, artistId, channelId, field, next)
    }
  })

  const cellId = `${artistId}:${channelId}:${field}`
  const { onBlur, onKeyDown, ...inputProps } = draft.inputProps

  const stripeColor =
    field === 'subBox' && resolved.subBoxId
      ? subBoxes.find((sb) => sb.id === resolved.subBoxId)?.color
      : undefined

  const style: React.CSSProperties = {}
  if (stripeColor) style.borderLeft = `6px solid ${stripeColor}`
  if (remoteEditor) style.boxShadow = `inset 0 0 0 2px ${remoteEditor.color}`

  return (
    <td className={styles.cell}>
      <input
        type="text"
        className={styles.cellInput}
        style={Object.keys(style).length > 0 ? style : undefined}
        aria-label={label}
        list={datalistId}
        title={remoteEditor ? `${remoteEditor.name} is editing this cell` : undefined}
        onFocus={() => {
          syncManager.setEditingCell(docName, cellId)
        }}
        onBlur={() => {
          onBlur()
          syncManager.setEditingCell(docName, null)
        }}
        onKeyDown={(e) => {
          onKeyDown(e) // Enter commits via blur; Escape reverts
          if (e.key === 'Enter') onNavigate(gridPos, e.shiftKey ? -1 : 1)
        }}
        data-grid-pos={gridPos}
        {...inputProps}
      />
    </td>
  )
}
