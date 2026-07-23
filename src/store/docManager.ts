import * as Y from 'yjs'
import { IndexeddbPersistence } from 'y-indexeddb'
import { getSheetRoots, initSheet, LOCAL_ORIGIN } from '../model/sheetDoc'
import { removeIndexEntry, upsertIndexEntry } from '../model/indexDoc'

/**
 * Owns the lifecycle of Y.Docs and their IndexedDB persistence. One doc per
 * sheet plus a singleton index doc. Sync providers attach in the sync layer.
 */

const SHEET_DB_PREFIX = 'livepatch-sheet-'
export const INDEX_DOC_NAME = 'livepatch-index'

export interface DocHandle {
  doc: Y.Doc
  /** Resolves once IndexedDB has loaded the doc's persisted state. */
  whenLoaded: Promise<void>
  destroy: () => void
}

const hasIndexedDb = typeof indexedDB !== 'undefined'

const openDoc = (dbName: string): DocHandle => {
  const doc = new Y.Doc()
  if (!hasIndexedDb) {
    return { doc, whenLoaded: Promise.resolve(), destroy: () => doc.destroy() }
  }
  const persistence = new IndexeddbPersistence(dbName, doc)
  const whenLoaded = persistence.whenSynced.then(() => undefined)
  return {
    doc,
    whenLoaded,
    destroy: () => {
      persistence.destroy()
      doc.destroy()
    },
  }
}

let indexHandle: DocHandle | null = null

/** The singleton index doc; opened lazily, kept open for the app's lifetime. */
export const openIndex = (): DocHandle => {
  if (!indexHandle) indexHandle = openDoc(INDEX_DOC_NAME)
  return indexHandle
}

const sheetHandles = new Map<string, DocHandle>()

/**
 * Open (or reuse) a sheet doc. Local edits automatically refresh the sheet's
 * index entry — title, stage, date, and lastModified — so the selector stays
 * current without every mutation knowing about the index.
 */
export const openSheet = (sheetId: string): DocHandle => {
  const existing = sheetHandles.get(sheetId)
  if (existing) return existing

  const inner = openDoc(SHEET_DB_PREFIX + sheetId)
  const { doc } = inner

  const onUpdate = (_update: Uint8Array, origin: unknown) => {
    if (origin !== LOCAL_ORIGIN) return
    const { meta } = getSheetRoots(doc)
    upsertIndexEntry(openIndex().doc, sheetId, {
      title: (meta.get('title') as string) ?? 'Untitled Sheet',
      stage: (meta.get('stage') as string) ?? '',
      date: (meta.get('date') as string) ?? '',
      lastModified: new Date().toISOString(),
    })
  }
  doc.on('update', onUpdate)

  const handle: DocHandle = {
    doc,
    whenLoaded: inner.whenLoaded,
    destroy: () => {
      doc.off('update', onUpdate)
      sheetHandles.delete(sheetId)
      inner.destroy()
    },
  }
  sheetHandles.set(sheetId, handle)
  return handle
}

/** Create a new sheet: fresh id, default structure, index entry. */
export const createSheet = (title: string): { sheetId: string; handle: DocHandle } => {
  const sheetId = crypto.randomUUID()
  const handle = openSheet(sheetId)
  initSheet(handle.doc, { title })
  return { sheetId, handle }
}

/** Delete a sheet's local data and index entry. */
export const deleteSheet = async (sheetId: string): Promise<void> => {
  sheetHandles.get(sheetId)?.destroy()
  removeIndexEntry(openIndex().doc, sheetId)
  if (hasIndexedDb) {
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase(SHEET_DB_PREFIX + sheetId)
      req.onsuccess = req.onerror = req.onblocked = () => resolve()
    })
  }
}

/**
 * Sheet ids with data in this browser's IndexedDB — lets the selector list
 * local sheets even if they're missing from the (possibly never-synced) index.
 */
export const listLocalSheetIds = async (): Promise<string[]> => {
  if (!hasIndexedDb || typeof indexedDB.databases !== 'function') return []
  const dbs = await indexedDB.databases()
  return dbs
    .map((db) => db.name ?? '')
    .filter((name) => name.startsWith(SHEET_DB_PREFIX))
    .map((name) => name.slice(SHEET_DB_PREFIX.length))
}
