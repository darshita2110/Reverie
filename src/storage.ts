import { supabase } from './supabaseClient'
import type { Entry } from './diary'

/* ---------- ENTRIES (cloud, per user) ---------- */
export async function loadEntries(userId: string): Promise<Record<string, Entry>> {
  const { data, error } = await supabase.from('entries').select('date, data').eq('user_id', userId)
  if (error) { console.error('loadEntries', error); return {} }
  const out: Record<string, Entry> = {}
  for (const row of data ?? []) out[row.date as string] = row.data as Entry
  return out
}

export async function saveEntry(userId: string, entry: Entry): Promise<void> {
  const { error } = await supabase.from('entries').upsert({
    user_id: userId,
    date: entry.date,
    data: entry,
    updated_at: new Date().toISOString(),
  })
  if (error) console.error('saveEntry', error)
}

export async function deleteEntry(userId: string, date: string): Promise<void> {
  const { error } = await supabase.from('entries').delete().eq('user_id', userId).eq('date', date)
  if (error) console.error('deleteEntry', error)
}

export async function eraseAllEntries(userId: string): Promise<void> {
  const { error } = await supabase.from('entries').delete().eq('user_id', userId)
  if (error) console.error('eraseAllEntries', error)
}

/* ---------- SETTINGS (local, per device) ---------- */
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

const SETTINGS_KEY = 'reverie:settings'

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