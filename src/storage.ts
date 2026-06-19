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