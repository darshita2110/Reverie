import { MOODS, WEATHER, stripHtml, type Entry } from './diary'

type EntryViewProps = {
  entry: Entry
  onEdit: () => void
  onDelete: () => void
  onBack: () => void
}

export default function EntryView({ entry, onEdit, onDelete, onBack }: EntryViewProps) {
  const d = new Date(entry.date + 'T12:00:00')
  const longDate = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const mood = MOODS.find((m) => m.id === entry.mood)
  const weather = WEATHER.find((w) => w.id === entry.weather)

  function handleDelete() {
    if (window.confirm('Delete this page? This cannot be undone.')) onDelete()
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">{entry.title || 'Untitled page'}</div>
          <div className="page-date">{longDate}</div>
        </div>
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
      </div>

      <div className="journal-sheet">
        <div className="sheet-inner">
          <div className="view-meta">
            {mood && <span className={`entry-mood-icon ${mood.cls}`}>{mood.emoji}</span>}
            {weather && <span className="view-weather">{weather.icon}</span>}
            {entry.favorite && <span className="entry-fav-inline">★ favorite</span>}
          </div>

          {stripHtml(entry.body) ? (
            <div className="view-body" dangerouslySetInnerHTML={{ __html: entry.body }} />
          ) : (
            <div className="view-empty">No words on this page — just a feeling.</div>
          )}

          {entry.photos.length > 0 && (
            <div className="photo-strip">
              {entry.photos.map((p, i) => <img key={i} className="photo-thumb" src={p} alt="" />)}
            </div>
          )}

          {entry.tags.length > 0 && (
            <div className="tag-row">
              {entry.tags.map((t) => <span key={t} className="tag-pill">#{t}</span>)}
            </div>
          )}

          <div className="sheet-footer">
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            <button className="btn btn-primary" onClick={onEdit}>Edit page</button>
          </div>
        </div>
      </div>
    </div>
  )
}