import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import TodayPage from './TodayPage'
import EntriesPage from './EntriesPage'
import { loadEntries, saveEntry, deleteEntry } from './storage'
import { makeEmptyEntry, computeStreak, hasContent, todayKey, type Entry } from './diary'
import './App.css'

const themes = ['classic', 'dusk', 'botanical', 'rose'] as const
type Theme = typeof themes[number]
type Page = 'today' | 'entries' | 'calendar' | 'insights' | 'settings'

function App() {
  const [theme, setTheme] = useState<Theme>('classic')
  const [page, setPage] = useState<Page>('today')
  const [menuOpen, setMenuOpen] = useState(false)
  const [entries, setEntries] = useState<Record<string, Entry>>(() => loadEntries())
  const [editingDate, setEditingDate] = useState<string | null>(null)

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  function goTo(p: Page) {
    if (p === 'today') setEditingDate(null)
    setPage(p)
    setMenuOpen(false)
  }

  function openEntry(date: string) {
    setEditingDate(date)
    setPage('today')
    setMenuOpen(false)
  }

  function upsertEntry(entry: Entry) {
    setEntries((prev) => ({ ...prev, [entry.date]: entry }))
    if (hasContent(entry)) saveEntry(entry)
    else deleteEntry(entry.date)
  }

  const activeDate = editingDate ?? todayKey()
  const activeEntry = entries[activeDate] ?? makeEmptyEntry(activeDate)
  const streak = computeStreak(entries)

  return (
    <>
      <div className="grain" />
      <button className="mobile-menu-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>

      <div className="app">
        <Sidebar page={page} onNavigate={goTo} theme={theme} onThemeChange={setTheme} streak={streak} open={menuOpen} />
        <main className="main">
          {page === 'today' && <TodayPage entry={activeEntry} onChange={upsertEntry} onBack={() => goTo('today')} />}
          {page === 'entries' && <EntriesPage entries={entries} onOpen={openEntry} />}
          {page === 'calendar' && <Placeholder title="Calendar" note="A month view of your writing." />}
          {page === 'insights' && <Placeholder title="Mood insights" note="Moods, streaks and word counts." />}
          {page === 'settings' && <Placeholder title="Settings" note="Make this diary feel like yours." />}
        </main>
      </div>
    </>
  )
}

function Placeholder({ title, note }: { title: string; note: string }) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">{title}</div>
          <div className="page-sub">{note}</div>
        </div>
      </div>
    </div>
  )
}

export default App