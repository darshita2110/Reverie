import { useState, useRef } from 'react'
import { MOODS, WEATHER, type Entry } from './diary'

type TodayPageProps = { entry: Entry; onChange: (entry: Entry) => void }

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.readAsDataURL(file)
  })
}

export default function TodayPage({ entry, onChange }: TodayPageProps) {
  const [tagDraft, setTagDraft] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const d = new Date(entry.date + 'T12:00:00')
  const longDate = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const weekday = d.toLocaleDateString(undefined, { weekday: 'long' })

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

  const status = entry.title || entry.body || entry.mood ? 'Saved to your diary' : 'Start writing — saves as you go'

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