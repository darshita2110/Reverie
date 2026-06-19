import { useState } from 'react'
import { MOODS, entriesSorted, type Entry } from './diary'

type EntriesPageProps = {
  entries: Record<string, Entry>
  onOpen: (date: string) => void
}

function snippet(body: string): string {
  const text = body.trim()
  if (!text) return 'No words yet — just a feeling.'
  return text.length > 140 ? text.slice(0, 140) + '…' : text
}

export default function EntriesPage({ entries, onOpen }: EntriesPageProps) {
  const [query, setQuery] = useState('')
  const [moodFilter, setMoodFilter] = useState('all')

  let list = entriesSorted(entries)
  if (moodFilter !== 'all') list = list.filter((e) => e.mood === moodFilter)
  if (query.trim()) {
    const q = query.toLowerCase()
    list = list.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.body.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q)),
    )
  }

  const total = Object.keys(entries).length

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">All entries</div>
          <div className="page-sub">{total} page{total === 1 ? '' : 's'} written so far. Every one of them counts.</div>
        </div>
      </div>

      <div className="filter-row">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Search your entries…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <button className={`chip ${moodFilter === 'all' ? 'active' : ''}`} onClick={() => setMoodFilter('all')}>All moods</button>
        {MOODS.map((m) => (
          <button key={m.id} className={`chip ${moodFilter === m.id ? 'active' : ''}`} onClick={() => setMoodFilter(m.id)}>
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          <h3>No pages here yet</h3>
          <p>Try a different mood filter, or go write today's page — this list fills in as you go.</p>
        </div>
      ) : (
        <div className="entry-list">
          {list.map((e) => {
            const d = new Date(e.date + 'T12:00:00')
            const mood = MOODS.find((m) => m.id === e.mood)
            return (
              <div key={e.date} className="entry-card" onClick={() => onOpen(e.date)}>
                <div className="entry-date-block">
                  <div className="entry-date-day">{d.getDate()}</div>
                  <div className="entry-date-mon">{d.toLocaleDateString(undefined, { month: 'short' })}</div>
                </div>
                {e.photos[0] && <img className="entry-thumb" src={e.photos[0]} alt="" />}
                <div className="entry-body">
                  <div className="entry-title-row">
                    <span className="entry-title">{e.title || 'Untitled page'}</span>
                  </div>
                  <div className="entry-snippet">{snippet(e.body)}</div>
                  <div className="entry-meta-row">
                    {mood && <span className={`entry-mood-icon ${mood.cls}`}>{mood.emoji}</span>}
                    {e.tags.length > 0 && (
                      <div className="entry-tags-mini">
                        {e.tags.slice(0, 4).map((t) => <span key={t} className="mini-tag">#{t}</span>)}
                      </div>
                    )}
                  </div>
                </div>
                {e.favorite && <span className="entry-fav">★</span>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}