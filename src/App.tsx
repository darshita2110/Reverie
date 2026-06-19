import { useState, useEffect } from 'react'
import './App.css'

const themes = ['classic', 'dusk', 'botanical', 'rose'] as const
type Theme = typeof themes[number]

function App() {
  const [entry, setEntry] = useState('')
  const [theme, setTheme] = useState<Theme>('classic')

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const wordCount = entry.trim() ? entry.trim().split(/\s+/).length : 0

  return (
    <div className="page">
      <header className="topbar">
        <span className="brand">Reverie</span>
        <div className="theme-row">
          {themes.map((t) => (
            <button
              key={t}
              className={`theme-dot t-${t} ${theme === t ? 'active' : ''}`}
              onClick={() => setTheme(t)}
              aria-label={t}
            />
          ))}
        </div>
      </header>

      <main className="entry-area">
        <p className="date">{today}</p>
        <h1 className="greeting">How was your day?</h1>
        <textarea
          className="writer"
          placeholder="Start writing…"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
        />
        <p className="count">{wordCount} words</p>
      </main>
    </div>
  )
}

export default App