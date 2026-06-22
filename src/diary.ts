export type Entry = {
  date: string
  title: string
  body: string
  mood: string | null
  weather: string | null
  tags: string[]
  photos: string[]
  favorite: boolean
}

export const MOODS = [
  { id: 'joy', emoji: '😄', label: 'Joyful', cls: 's-joy' },
  { id: 'calm', emoji: '😌', label: 'Calm', cls: 's-calm' },
  { id: 'love', emoji: '🥰', label: 'Loved', cls: 's-love' },
  { id: 'tired', emoji: '😴', label: 'Tired', cls: 's-tired' },
  { id: 'sad', emoji: '😔', label: 'Sad', cls: 's-sad' },
  { id: 'angry', emoji: '😤', label: 'Frustrated', cls: 's-angry' },
  { id: 'anxious', emoji: '😟', label: 'Anxious', cls: 's-anxious' },
  { id: 'grateful', emoji: '🙏', label: 'Grateful', cls: 's-grateful' },
]
export const WEATHER = [
  { id: 'sun', icon: '☀️' }, { id: 'cloud', icon: '☁️' }, { id: 'rain', icon: '🌧️' },
  { id: 'snow', icon: '❄️' }, { id: 'storm', icon: '⛈️' },
]

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}

export function makeEmptyEntry(date = todayKey()): Entry {
  return { date, title: '', body: '', mood: null, weather: null, tags: [], photos: [], favorite: false }
}

export function stripHtml(html: string): string {
  if (!html) return ''
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return (tmp.textContent || '').replace(/\s+/g, ' ').trim()
}

export function hasContent(e: Entry): boolean {
  return Boolean(stripHtml(e.body) || e.title.trim() || e.mood || e.weather || e.tags.length || e.photos.length || e.favorite)
}

export function entriesSorted(entries: Record<string, Entry>): Entry[] {
  return Object.values(entries).sort((a, b) => b.date.localeCompare(a.date))
}

export function computeStreak(entries: Record<string, Entry>): number {
  let streak = 0
  const cursor = new Date()
  while (entries[todayKey(cursor)] && hasContent(entries[todayKey(cursor)])) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function wordCount(e: Entry): number {
  const text = stripHtml(e.body)
  return text ? text.split(/\s+/).length : 0
}