export interface SyncSettings {
  /** ws:// or wss:// URL of the relay, e.g. wss://sync.example.com or ws://192.168.1.20:1234 */
  url: string
  token: string
}

const KEY = 'livepatch-sync'

const envDefault = (): SyncSettings => ({
  url: (import.meta.env.VITE_SYNC_URL as string | undefined) ?? '',
  token: (import.meta.env.VITE_SYNC_TOKEN as string | undefined) ?? '',
})

export const loadSyncSettings = (): SyncSettings => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return envDefault()
    const parsed = JSON.parse(raw) as Partial<SyncSettings>
    return { url: parsed.url ?? '', token: parsed.token ?? '' }
  } catch {
    return envDefault()
  }
}

export const saveSyncSettings = (settings: SyncSettings) => {
  localStorage.setItem(KEY, JSON.stringify(settings))
}

/** Accepts http(s) URLs too and converts them to ws(s). */
export const normalizeSyncUrl = (input: string): string => {
  const trimmed = input.trim().replace(/\/+$/, '')
  if (!trimmed) return ''
  if (/^wss?:\/\//i.test(trimmed)) return trimmed
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/^http/i, 'ws')
  return `ws://${trimmed}`
}
