import type { Entry } from './diary'

const ENTRY_PREFIX = 'reverie:entry:'
const SETTINGS_KEY = 'reverie:settings'

export function loadEntries(): Record<string, Entry> {
  const out: Record<string, Entry> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith(ENTRY_PREFIX)) continue
    try {
      const entry = JSON.parse(localStorage.getItem(key) || '') as Entry
      out[entry.date] = entry
    } catch {
      // skip any broken record
    }
  }
  return out
}

export function saveEntry(entry: Entry): void {
  localStorage.setItem(ENTRY_PREFIX + entry.date, JSON.stringify(entry))
}

export function deleteEntry(date: string): void {
  localStorage.removeItem(ENTRY_PREFIX + date)
}

export type Theme = 'classic' | 'dusk' | 'botanical' | 'rose'
export type FontChoice = 'serif' | 'rounded' | 'classic-sans' | 'mono'

export type Settings = {
  name: string
  theme: Theme
  font: FontChoice
  remindersOn: boolean
  joinedAt: number | null
}

export const DEFAULT_SETTINGS: Settings = {
  name: '',
  theme: 'classic',
  font: 'serif',
  remindersOn: false,
  joinedAt: null,
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function eraseAllEntries(): void {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(ENTRY_PREFIX)) keys.push(key)
  }
  keys.forEach((k) => localStorage.removeItem(k))
}
