import { useSyncExternalStore } from 'react'
import { syncManager, type SyncStatus } from './sync'

export const useSyncStatus = (): SyncStatus =>
  useSyncExternalStore(syncManager.subscribe, () => syncManager.status())

/** Devices (including this one) currently in the given doc's sync room. */
export const useSyncPeers = (docName: string): number =>
  useSyncExternalStore(syncManager.subscribe, () => syncManager.peers(docName))
