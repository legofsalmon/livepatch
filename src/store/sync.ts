import type * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { loadSyncSettings, saveSyncSettings, type SyncSettings } from './syncSettings'

export type SyncStatus = 'off' | 'connecting' | 'connected'

/** Stable per-session device id, announced via awareness so peers can be counted. */
const deviceId = crypto.randomUUID()

/**
 * Attaches a y-websocket provider to every open doc (the doc/room name is the
 * same string as the IndexedDB database name). When there is no configured
 * relay URL the app simply runs local-only — that is a fully supported mode,
 * not an error.
 */
class SyncManager {
  private docs = new Map<string, Y.Doc>()
  private providers = new Map<string, WebsocketProvider>()
  private connected = new Map<string, boolean>()
  private settings: SyncSettings = loadSyncSettings()
  private listeners = new Set<() => void>()

  getSettings(): SyncSettings {
    return this.settings
  }

  updateSettings(settings: SyncSettings) {
    this.settings = settings
    saveSyncSettings(settings)
    for (const name of [...this.providers.keys()]) this.disconnectDoc(name)
    for (const [name, doc] of this.docs) this.connectDoc(name, doc)
    this.emit()
  }

  attach(name: string, doc: Y.Doc) {
    if (this.docs.has(name)) return
    this.docs.set(name, doc)
    this.connectDoc(name, doc)
  }

  detach(name: string) {
    this.disconnectDoc(name)
    this.docs.delete(name)
    this.emit()
  }

  private connectDoc(name: string, doc: Y.Doc) {
    if (!this.settings.url || typeof WebSocket === 'undefined') return
    const provider = new WebsocketProvider(this.settings.url, name, doc, {
      params: this.settings.token ? { token: this.settings.token } : {},
    })
    provider.on('status', ({ status }: { status: string }) => {
      this.connected.set(name, status === 'connected')
      this.emit()
    })
    // Peers only appear in each other's awareness once a local state is set —
    // an untouched (empty) state is never broadcast on join.
    provider.awareness.setLocalStateField('device', { id: deviceId })
    provider.awareness.on('change', () => this.emit())
    this.providers.set(name, provider)
  }

  private disconnectDoc(name: string) {
    const provider = this.providers.get(name)
    if (provider) {
      provider.destroy()
      this.providers.delete(name)
    }
    this.connected.delete(name)
  }

  /** Overall status: connected if any room is, connecting if trying, off if unconfigured. */
  status(): SyncStatus {
    if (!this.settings.url) return 'off'
    for (const isUp of this.connected.values()) if (isUp) return 'connected'
    return 'connecting'
  }

  /** Number of devices (including this one) in a doc's room, from awareness. */
  peers(name: string): number {
    const provider = this.providers.get(name)
    if (!provider || !this.connected.get(name)) return 0
    return provider.awareness.getStates().size
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private emit() {
    for (const listener of this.listeners) listener()
  }
}

export const syncManager = new SyncManager()
