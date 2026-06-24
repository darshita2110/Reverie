import { useState, useRef } from 'react'
import { MOODS, WEATHER, todayKey, stripHtml, type Entry } from './diary'
import RichEditor from './RichEditor'
import { aiPrompt, aiMoodTags } from './ai'

type TodayPageProps = {
  entry: Entry
  onChange: (entry: Entry) => void
  onBack: () => void
  allEntries: Record<string, Entry>
  onOpen: (date: string) => void
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.readAsDataURL(file)
  })
}

export default function TodayPage({ entry, onChange, onBack, allEntries, onOpen }: TodayPageProps) {
  const [tagDraft, setTagDraft] = useState('')
  const [promptText, setPromptText] = useState('')
  const [busyPrompt, setBusyPrompt] = useState(false)
  const [busyAI, setBusyAI] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const d = new Date(entry.date + 'T12:00:00')
  const longDate = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const weekday = d.toLocaleDateString(undefined, { weekday: 'long' })
  const isToday = entry.date === todayKey()
  const isEmpty = !stripHtml(entry.body)

  const memories = Object.values(allEntries)
    .filter((e) => e.date !== entry.date && e.date.slice(5) === entry.date.slice(5) && (e.title || e.body || e.mood))
    .sort((a, b) => b.date.localeCompare(a.date))

  const recentSnippets = Object.values(allEntries)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map((e) => stripHtml(e.body))
    .filter(Boolean)

  function update(patch: Partial<Entry>) {
    onChange({ ...entry, ...patch })
  }
  function addTag() {
    const v = tagDraft.trim().replace(/^#/, '').slice(0, 20)
    if (v && !entry.tags.includes(v)) update({ tags: [...entry.tags, v] })
    setTagDraft('')
  }
  async function addPhotos(files: FileList | null) {
    const room = 4 - entry.photos.length
    const slice = Array.from(files || []).slice(0, room)
    const urls = await Promise.all(slice.map(readAsDataURL))
    if (urls.length) update({ photos: [...entry.photos, ...urls] })
  }

  async function getPrompt() {
    setBusyPrompt(true)
    setPromptText(await aiPrompt(recentSnippets))
    setBusyPrompt(false)
  }

  async function suggestMoodTags() {
    const text = stripHtml(entry.body)
    if (!text) return
    setBusyAI(true)
    const s = await aiMoodTags(text)
    const validMood = MOODS.some((m) => m.id === s.mood) ? s.mood : entry.mood
    const cleanTags = (s.tags || []).map((t) => t.toLowerCase().replace(/^#/, '').slice(0, 20)).filter(Boolean)
    const mergedTags = Array.from(new Set([...entry.tags, ...cleanTags])).slice(0, 8)
    update({ mood: validMood, tags: mergedTags })
    setBusyAI(false)
  }

  const status = stripHtml(entry.body) || entry.title || entry.mood ? 'Saved to your diary' : 'Start writing — saves as you go'

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">{isToday ? "Today's page" : 'Editing a page'}</div>
          <div className="page-date">{longDate}</div>
        </div>
        {!isToday && <button className="btn btn-ghost" onClick={onBack}>Back to today</button>}
      </div>

      {memories.length > 0 && (
        <div className="memories">
          <div className="memories-title">On this day</div>
          <div className="memories-row">
            {memories.map((m) => (
              <button key={m.date} className="memory-card" onClick={() => onOpen(m.date)}>
                <div className="memory-year">{m.date.slice(0, 4)}</div>
                <div className="memory-text">{m.title || (m.body ? stripHtml(m.body).slice(0, 70) : 'A quiet page')}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="journal-sheet">
        <button
          className={`ribbon ${entry.favorite ? '' : 'inactive'}`}
          onClick={() => update({ favorite: !entry.favorite })}
          title="Mark as favorite"
        />
        <div className="sheet-inner">
          <div className="sheet-meta">
            <div className="sheet-weekday">{weekday} musings</div>
            <div className="weather-pick">
              {WEATHER.map((w) => (
                <button
                  key={w.id}
                  className={`weather-btn ${entry.weather === w.id ? 'active' : ''}`}
                  onClick={() => update({ weather: entry.weather === w.id ? null : w.id })}
                >
                  {w.icon}
                </button>
              ))}
            </div>
          </div>

          <input
            className="title-input"
            placeholder="Give today a title…"
            value={entry.title}
            maxLength={80}
            onChange={(e) => update({ title: e.target.value })}
          />

          <div className="mood-strip">
            {MOODS.map((m) => (
              <button
                key={m.id}
                className={`sticker ${m.cls} ${entry.mood === m.id ? 'selected' : ''}`}
                onClick={() => update({ mood: entry.mood === m.id ? null : m.id })}
                title={m.label}
              >
                {m.emoji}
              </button>
            ))}
          </div>

          <button className="btn btn-ghost ai-suggest" onClick={suggestMoodTags} disabled={busyAI || isEmpty}>
            {busyAI ? 'Reading…' : '✨ Suggest mood & tags'}
          </button>

          {isEmpty && (
            <div className="prompt-card">
              {promptText ? (
                <>
                  <span className="prompt-spark">✨</span>
                  <span className="prompt-text">{promptText}</span>
                  <button className="prompt-refresh" onClick={getPrompt} disabled={busyPrompt} title="Another one">↻</button>
                </>
              ) : (
                <button className="btn btn-ghost" onClick={getPrompt} disabled={busyPrompt}>
                  {busyPrompt ? 'Thinking…' : '✨ Give me a writing prompt'}
                </button>
              )}
            </div>
          )}

          <RichEditor key={entry.date} value={entry.body} onChange={(html) => update({ body: html })} placeholder="Dear diary, today..." />

          <div className="photo-strip">
            {entry.photos.map((p, i) => (
              <img key={i} className="photo-thumb" src={p} alt="" />
            ))}
            {entry.photos.length < 4 && (
              <button className="add-photo-btn" onClick={() => fileRef.current?.click()} title="Add a photo">+</button>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addPhotos(e.target.files)} />
          </div>

          <div className="tag-row">
            {entry.tags.map((t) => (
              <span key={t} className="tag-pill">#{t} <button onClick={() => update({ tags: entry.tags.filter((x) => x !== t) })}>×</button></span>
            ))}
            <input
              className="tag-input"
              placeholder="+ add a tag"
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
            />
          </div>

          <div className="sheet-footer">
            <div className="save-state"><span className="save-dot" /><span>{status}</span></div>
            <button className="btn btn-primary" onClick={() => onChange(entry)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Save page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
