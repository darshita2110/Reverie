import type { Entry } from './diary'

const PREFIX = 'reverie:entry:'

export function loadEntries(): Record<string, Entry> {
  const out: Record<string, Entry> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith(PREFIX)) continue
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
  localStorage.setItem(PREFIX + entry.date, JSON.stringify(entry))
}

export function deleteEntry(date: string): void {
  localStorage.removeItem(PREFIX + date)
}

export type Settings = { theme: string; displayName: string; remindersOn: boolean }
const SETTINGS_KEY = 'reverie:settings'

export function loadSettings(): Settings {
  const def: Settings = { theme: 'classic', displayName: '', remindersOn: false }
  try {
    return { ...def, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }
  } catch {
    return def
  }
}

export function saveSettings(s: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
}

export function clearAllEntries(): void {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith(PREFIX)) keys.push(k)
  }
  keys.forEach((k) => localStorage.removeItem(k))
}