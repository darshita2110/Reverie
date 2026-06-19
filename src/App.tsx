import { useState } from 'react'
import './App.css'

function App() {
  const [entry, setEntry] = useState('')

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const wordCount = entry.trim() ? entry.trim().split(/\s+/).length : 0

  return (
    <div className="page">
      <header className="topbar">
        <span className="brand">Reverie</span>
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