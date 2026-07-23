import * as Y from 'yjs'
import {
  emptyPatchEntry,
  patchKey,
  type Artist,
  type Channel,
  type PatchEntry,
  type PatchField,
  type SheetMeta,
  type SheetSnapshot,
  type SubBox,
} from './types'
import { DEFAULT_CHANNEL_COUNT, STAGE_POSITIONS } from './constants'
import { todayIso } from './date'

/**
 * Transaction origin for edits made by this client through the ops below.
 * The store layer uses it to distinguish local edits (which should bump the
 * sheet's lastModified in the index) from updates arriving from IndexedDB
 * load or remote sync.
 */
export const LOCAL_ORIGIN = 'livepatch-local'

type YEntity = Y.Map<unknown>

export interface SheetRoots {
  meta: Y.Map<unknown>
  channels: Y.Array<YEntity>
  artists: Y.Array<YEntity>
  subBoxes: Y.Array<YEntity>
  patches: Y.Map<YEntity>
}

export const getSheetRoots = (doc: Y.Doc): SheetRoots => ({
  meta: doc.getMap('meta'),
  channels: doc.getArray<YEntity>('channels'),
  artists: doc.getArray<YEntity>('artists'),
  subBoxes: doc.getArray<YEntity>('subBoxes'),
  patches: doc.getMap<YEntity>('patches'),
})

const mapFrom = (obj: Record<string, unknown>): YEntity => {
  const map = new Y.Map<unknown>()
  for (const [k, v] of Object.entries(obj)) map.set(k, v)
  return map
}

const transact = (doc: Y.Doc, fn: () => void) => doc.transact(fn, LOCAL_ORIGIN)

const findById = (arr: Y.Array<YEntity>, id: string): { item: YEntity; index: number } | null => {
  for (let i = 0; i < arr.length; i++) {
    const item = arr.get(i)
    if (item.get('id') === id) return { item, index: i }
  }
  return null
}

// --- Creation ---------------------------------------------------------------

export interface InitSheetOptions {
  title: string
  date?: string
  now?: string
  channelCount?: number
}

/** Populate an empty doc with the default sheet structure. */
export const initSheet = (doc: Y.Doc, options: InitSheetOptions): void => {
  const { meta, channels, artists } = getSheetRoots(doc)
  const now = options.now ?? new Date().toISOString()
  transact(doc, () => {
    meta.set('title', options.title.trim() || 'Untitled Sheet')
    meta.set('stage', '')
    meta.set('date', options.date ?? todayIso())
    meta.set('created', now)
    const count = options.channelCount ?? DEFAULT_CHANNEL_COUNT
    for (let i = 0; i < count; i++) {
      channels.push([mapFrom({ id: crypto.randomUUID(), label: String(i + 1) })])
    }
    artists.push([
      mapFrom({
        id: crypto.randomUUID(),
        name: 'Artist 1',
        startTime: '19:00',
        endTime: '20:00',
        notes: '',
      }),
    ])
  })
}

// --- Meta -------------------------------------------------------------------

export const setMetaField = (doc: Y.Doc, field: 'title' | 'stage' | 'date', value: string) => {
  const { meta } = getSheetRoots(doc)
  transact(doc, () => meta.set(field, value))
}

// --- Channels ---------------------------------------------------------------

export const addChannel = (doc: Y.Doc, afterChannelId?: string): string => {
  const { channels } = getSheetRoots(doc)
  const id = crypto.randomUUID()
  transact(doc, () => {
    const index =
      afterChannelId !== undefined ? (findById(channels, afterChannelId)?.index ?? null) : null
    const insertAt = index === null ? channels.length : index + 1
    channels.insert(insertAt, [mapFrom({ id, label: String(channels.length + 1) })])
  })
  return id
}

export const renameChannel = (doc: Y.Doc, channelId: string, label: string) => {
  const { channels } = getSheetRoots(doc)
  transact(doc, () => {
    findById(channels, channelId)?.item.set('label', label)
  })
}

/** Remove a channel and every artist's patch entry for it. */
export const removeChannel = (doc: Y.Doc, channelId: string) => {
  const { channels, patches } = getSheetRoots(doc)
  transact(doc, () => {
    const found = findById(channels, channelId)
    if (!found) return
    channels.delete(found.index)
    for (const key of [...patches.keys()]) {
      if (key.endsWith(`:${channelId}`)) patches.delete(key)
    }
  })
}

// --- Artists ----------------------------------------------------------------

export const addArtist = (doc: Y.Doc): string => {
  const { artists } = getSheetRoots(doc)
  const id = crypto.randomUUID()
  transact(doc, () => {
    artists.push([
      mapFrom({
        id,
        name: `Artist ${artists.length + 1}`,
        startTime: '19:00',
        endTime: '20:00',
        notes: '',
      }),
    ])
  })
  return id
}

export const updateArtist = (
  doc: Y.Doc,
  artistId: string,
  fields: Partial<Omit<Artist, 'id'>>
) => {
  const { artists } = getSheetRoots(doc)
  transact(doc, () => {
    const found = findById(artists, artistId)
    if (!found) return
    for (const [k, v] of Object.entries(fields)) found.item.set(k, v)
  })
}

/** Remove an artist and all of their patch entries. */
export const removeArtist = (doc: Y.Doc, artistId: string) => {
  const { artists, patches } = getSheetRoots(doc)
  transact(doc, () => {
    const found = findById(artists, artistId)
    if (!found) return
    artists.delete(found.index)
    for (const key of [...patches.keys()]) {
      if (key.startsWith(`${artistId}:`)) patches.delete(key)
    }
  })
}

// --- Sub-boxes --------------------------------------------------------------

export const addSubBox = (doc: Y.Doc, defaults?: Partial<Omit<SubBox, 'id'>>): string => {
  const { subBoxes } = getSheetRoots(doc)
  const id = crypto.randomUUID()
  transact(doc, () => {
    subBoxes.push([
      mapFrom({
        id,
        name: defaults?.name ?? `Sub-box ${subBoxes.length + 1}`,
        inputs: defaults?.inputs ?? 4,
        color: defaults?.color ?? '#ff0000',
        stagePosition: defaults?.stagePosition ?? STAGE_POSITIONS[3], // MSC
      }),
    ])
  })
  return id
}

export const updateSubBox = (
  doc: Y.Doc,
  subBoxId: string,
  fields: Partial<Omit<SubBox, 'id'>>
) => {
  const { subBoxes } = getSheetRoots(doc)
  transact(doc, () => {
    const found = findById(subBoxes, subBoxId)
    if (!found) return
    for (const [k, v] of Object.entries(fields)) found.item.set(k, v)
  })
}

/**
 * Remove a sub-box. Patch cells referencing it keep their content by
 * converting the reference into free text (the sub-box's display name).
 */
export const removeSubBox = (doc: Y.Doc, subBoxId: string) => {
  const { subBoxes, patches } = getSheetRoots(doc)
  transact(doc, () => {
    const found = findById(subBoxes, subBoxId)
    if (!found) return
    const display = subBoxDisplayName(found.item.toJSON() as SubBox)
    subBoxes.delete(found.index)
    for (const entry of patches.values()) {
      if (entry.get('subBoxId') === subBoxId) {
        entry.set('subBoxId', null)
        entry.set('subBoxText', display)
      }
    }
  })
}

/** "Name (POS)" when a stage position is set, otherwise just the name. */
export const subBoxDisplayName = (subBox: Pick<SubBox, 'name' | 'stagePosition'>): string =>
  subBox.stagePosition ? `${subBox.name} (${subBox.stagePosition})` : subBox.name

// --- Patches ----------------------------------------------------------------

const getOrCreateEntry = (patches: Y.Map<YEntity>, key: string): YEntity => {
  let entry = patches.get(key)
  if (!entry) {
    entry = mapFrom(emptyPatchEntry() as unknown as Record<string, unknown>)
    patches.set(key, entry)
  }
  return entry
}

export const setPatchField = (
  doc: Y.Doc,
  artistId: string,
  channelId: string,
  field: Exclude<PatchField, 'subBox'>,
  value: string
) => {
  const { patches } = getSheetRoots(doc)
  transact(doc, () => {
    getOrCreateEntry(patches, patchKey(artistId, channelId)).set(field, value)
  })
}

/**
 * Set the sub-box cell from raw user text. If the text matches a defined
 * sub-box (by display name or bare name, case-insensitively), the cell stores
 * a reference to it; otherwise it stores the text as-is.
 */
export const setPatchSubBox = (doc: Y.Doc, artistId: string, channelId: string, raw: string) => {
  const { subBoxes, patches } = getSheetRoots(doc)
  transact(doc, () => {
    const entry = getOrCreateEntry(patches, patchKey(artistId, channelId))
    const needle = raw.trim().toLowerCase()
    const match = needle
      ? subBoxes
          .toArray()
          .map((m) => m.toJSON() as SubBox)
          .find(
            (sb) =>
              sb.name.trim().toLowerCase() === needle ||
              subBoxDisplayName(sb).trim().toLowerCase() === needle
          )
      : undefined
    entry.set('subBoxId', match ? match.id : null)
    entry.set('subBoxText', match ? '' : raw)
  })
}

/** Copy every patch entry from one artist onto another (overwriting). */
export const copyPatchesFromArtist = (doc: Y.Doc, sourceArtistId: string, targetArtistId: string) => {
  const { channels, patches } = getSheetRoots(doc)
  transact(doc, () => {
    for (const channel of channels.toArray()) {
      const channelId = channel.get('id') as string
      const source = patches.get(patchKey(sourceArtistId, channelId))
      if (!source) continue
      patches.set(patchKey(targetArtistId, channelId), mapFrom(source.toJSON()))
    }
  })
}

// --- Snapshot ---------------------------------------------------------------

const withEntryDefaults = (raw: Partial<PatchEntry>): PatchEntry => ({
  ...emptyPatchEntry(),
  ...raw,
})

export const snapshotSheet = (doc: Y.Doc): SheetSnapshot => {
  const { meta, channels, artists, subBoxes, patches } = getSheetRoots(doc)
  const patchesJson: Record<string, PatchEntry> = {}
  for (const [key, entry] of patches.entries()) {
    patchesJson[key] = withEntryDefaults(entry.toJSON() as Partial<PatchEntry>)
  }
  return {
    meta: {
      title: (meta.get('title') as string) ?? '',
      stage: (meta.get('stage') as string) ?? '',
      date: (meta.get('date') as string) ?? '',
      created: (meta.get('created') as string) ?? '',
    } satisfies SheetMeta,
    channels: channels.toArray().map((m) => m.toJSON() as Channel),
    artists: artists.toArray().map((m) => m.toJSON() as Artist),
    subBoxes: subBoxes.toArray().map((m) => m.toJSON() as SubBox),
    patches: patchesJson,
  }
}

/** The text a patch cell's sub-box column should display. */
export const patchSubBoxDisplay = (entry: PatchEntry, subBoxes: SubBox[]): string => {
  if (entry.subBoxId) {
    const sb = subBoxes.find((s) => s.id === entry.subBoxId)
    if (sb) return subBoxDisplayName(sb)
  }
  return entry.subBoxText
}
