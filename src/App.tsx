import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import './App.css'

const themes = ['classic', 'dusk', 'botanical', 'rose'] as const
type Theme = typeof themes[number]
type Page = 'today' | 'entries' | 'calendar' | 'insights' | 'settings'

function App() {
  const [theme, setTheme] = useState<Theme>('classic')
  const [page, setPage] = useState<Page>('today')

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className="app">
      <Sidebar page={page} onNavigate={setPage} theme={theme} onThemeChange={setTheme} />
      <main className="main">
        {page === 'today' && <TodayPage />}
        {page === 'entries' && <Placeholder title="Entries" note="Your past pages will live here." />}
        {page === 'calendar' && <Placeholder title="Calendar" note="A month view of your writing." />}
        {page === 'insights' && <Placeholder title="Insights" note="Moods, streaks and word counts." />}
        {page === 'settings' && <Placeholder title="Settings" note="Make this diary feel like yours." />}
      </main>
    </div>
  )
}

function TodayPage() {
  const [entry, setEntry] = useState('')
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const wordCount = entry.trim() ? entry.trim().split(/\s+/).length : 0

  return (
    <div className="page">
      <p className="date">{today}</p>
      <h1 className="greeting">How was your day?</h1>
      <textarea
        className="writer"
        placeholder="Start writing…"
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
      />
      <p className="count">{wordCount} words</p>
    </div>
  )
}

function Placeholder({ title, note }: { title: string; note: string }) {
  return (
    <div className="page">
      <h1 className="greeting">{title}</h1>
      <p className="placeholder-note">{note}</p>
    </div>
  )
}

export default App