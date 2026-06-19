import { useState, useRef } from 'react'

const MOODS = [
  { id: 'joy', emoji: '😄', label: 'Joyful', cls: 's-joy' },
  { id: 'calm', emoji: '😌', label: 'Calm', cls: 's-calm' },
  { id: 'love', emoji: '🥰', label: 'Loved', cls: 's-love' },
  { id: 'tired', emoji: '😴', label: 'Tired', cls: 's-tired' },
  { id: 'sad', emoji: '😔', label: 'Sad', cls: 's-sad' },
  { id: 'angry', emoji: '😤', label: 'Frustrated', cls: 's-angry' },
  { id: 'anxious', emoji: '😟', label: 'Anxious', cls: 's-anxious' },
  { id: 'grateful', emoji: '🙏', label: 'Grateful', cls: 's-grateful' },
]
const WEATHER = [
  { id: 'sun', icon: '☀️' }, { id: 'cloud', icon: '☁️' }, { id: 'rain', icon: '🌧️' },
  { id: 'snow', icon: '❄️' }, { id: 'storm', icon: '⛈️' },
]

type Entry = {
  date: string
  title: string
  body: string
  mood: string | null
  weather: string | null
  tags: string[]
  photos: string[]
  favorite: boolean
}

function makeEmptyEntry(): Entry {
  return {
    date: new Date().toISOString().slice(0, 10),
    title: '', body: '', mood: null, weather: null, tags: [], photos: [], favorite: false,
  }
}

export default function TodayPage() {
  const [entry, setEntry] = useState<Entry>(makeEmptyEntry)
  const [tagDraft, setTagDraft] = useState('')
  const [saveState, setSaveState] = useState('Start writing — saves as you go')
  const fileRef = useRef<HTMLInputElement>(null)

  const d = new Date(entry.date + 'T12:00:00')
  const longDate = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const weekday = d.toLocaleDateString(undefined, { weekday: 'long' })

  function update(patch: Partial<Entry>) {
    setEntry((e) => ({ ...e, ...patch }))
    setSaveState('Saving…')
    setTimeout(() => setSaveState('Saved just now'), 600)
  }

  function addTag() {
    const v = tagDraft.trim().replace(/^#/, '').slice(0, 20)
    if (v && !entry.tags.includes(v)) update({ tags: [...entry.tags, v] })
    setTagDraft('')
  }

  function addPhotos(files: FileList | null) {
    Array.from(files || []).forEach((f) => {
      const reader = new FileReader()
      reader.onload = (ev) =>
        setEntry((e) => (e.photos.length >= 4 ? e : { ...e, photos: [...e.photos, ev.target?.result as string] }))
      reader.readAsDataURL(f)
    })
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Today's page</div>
          <div className="page-date">{longDate}</div>
        </div>
      </div>

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

          <textarea
            className="body-textarea"
            placeholder="Dear diary, today..."
            value={entry.body}
            onChange={(e) => update({ body: e.target.value })}
          />

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
            <div className="save-state"><span className="save-dot" /><span>{saveState}</span></div>
            <button className="btn btn-primary" onClick={() => setSaveState('Saved just now')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Save page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}