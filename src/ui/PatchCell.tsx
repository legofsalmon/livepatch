import type * as Y from 'yjs'
import { patchSubBoxDisplay, setPatchField, setPatchSubBox } from '../model/sheetDoc'
import { emptyPatchEntry, type PatchEntry, type PatchField, type SubBox } from '../model/types'
import { useDraft } from './useDraft'
import styles from './PatchGrid.module.scss'

export default function PatchCell({
  doc,
  artistId,
  channelId,
  field,
  entry,
  subBoxes,
  datalistId,
  label,
}: {
  doc: Y.Doc
  artistId: string
  channelId: string
  field: PatchField
  entry: PatchEntry | undefined
  subBoxes: SubBox[]
  datalistId?: string
  label: string
}) {
  const resolved = entry ?? emptyPatchEntry()
  const displayValue =
    field === 'subBox' ? patchSubBoxDisplay(resolved, subBoxes) : resolved[field]

  const draft = useDraft(displayValue, (next) => {
    if (field === 'subBox') {
      setPatchSubBox(doc, artistId, channelId, next.trim())
    } else {
      setPatchField(doc, artistId, channelId, field, next)
    }
  })

  const stripeColor =
    field === 'subBox' && resolved.subBoxId
      ? subBoxes.find((sb) => sb.id === resolved.subBoxId)?.color
      : undefined

  return (
    <td className={styles.cell}>
      <input
        type="text"
        className={styles.cellInput}
        style={stripeColor ? { borderLeft: `6px solid ${stripeColor}` } : undefined}
        aria-label={label}
        list={datalistId}
        {...draft.inputProps}
      />
    </td>
  )
}
