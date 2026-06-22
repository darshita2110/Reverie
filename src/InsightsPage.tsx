import { MOODS, entriesSorted, wordCount, type Entry } from './diary'

type InsightsPageProps = {
  entries: Record<string, Entry>
  streak: number
}

export default function InsightsPage({ entries, streak }: InsightsPageProps) {
  const all = entriesSorted(entries)

  const counts: Record<string, number> = {}
  MOODS.forEach((m) => (counts[m.id] = 0))
  let withMood = 0
  all.forEach((e) => {
    if (e.mood) {
      counts[e.mood] = (counts[e.mood] || 0) + 1
      withMood++
    }
  })

  const totalWords = all.reduce((sum, e) => sum + wordCount(e), 0)
  const favCount = all.filter((e) => e.favorite).length

  const sortedMoods = MOODS.map((m) => ({ ...m, count: counts[m.id] })).sort((a, b) => b.count - a.count)
  const maxCount = Math.max(1, ...sortedMoods.map((m) => m.count))

  const tagCounts: Record<string, number> = {}
  all.forEach((e) => e.tags.forEach((t) => (tagCounts[t] = (tagCounts[t] || 0) + 1)))
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 12)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Mood insights</div>
          <div className="page-sub">A gentle look back at how your days have felt.</div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-num">{all.length}</div>
          <div className="stat-label">Total pages</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{streak}</div>
          <div className="stat-label">Day streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{totalWords.toLocaleString()}</div>
          <div className="stat-label">Words written</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{favCount}</div>
          <div className="stat-label">Favorited pages</div>
        </div>
      </div>

      <div className="insight-section">
        <div className="insight-title">Mood breakdown</div>
        {withMood === 0 ? (
          <p className="insight-empty">Tag a mood on a page and it'll show up here.</p>
        ) : (
          <div className="mood-bars">
            {sortedMoods.map((m) => (
              <div key={m.id} className="mood-bar-row">
                <div className={`mood-bar-icon ${m.cls}`}>{m.emoji}</div>
                <div className="mood-bar-track">
                  <div className="mood-bar-fill" style={{ width: `${(m.count / maxCount) * 100}%` }} />
                </div>
                <div className="mood-bar-pct">{m.count}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="insight-section">
        <div className="insight-title">Most-used tags</div>
        {topTags.length === 0 ? (
          <p className="insight-empty">Add tags to your pages to spot patterns over time.</p>
        ) : (
          <div className="tag-row">
            {topTags.map(([t, c]) => (
              <span key={t} className="tag-pill">#{t} · {c}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
