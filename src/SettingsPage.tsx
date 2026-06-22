import { todayKey, type Entry } from './diary'

type Theme = 'classic' | 'dusk' | 'botanical' | 'rose'

const THEMES: { id: Theme; name: string; sub: string; preview: string }[] = [
  { id: 'classic', name: 'Classic', sub: 'Warm paper & terracotta', preview: 'linear-gradient(135deg,#FBF6EC 0 50%,#B85C38 50%)' },
  { id: 'dusk', name: 'Dusk', sub: 'Soft dark for night', preview: 'linear-gradient(135deg,#2B2521 0 50%,#E08A5E 50%)' },
  { id: 'botanical', name: 'Botanical', sub: 'Sage & cream', preview: 'linear-gradient(135deg,#F3F1E6 0 50%,#4F7A52 50%)' },
  { id: 'rose', name: 'Rose', sub: 'Dusty pink & blush', preview: 'linear-gradient(135deg,#FBF0EC 0 50%,#C65A6E 50%)' },
]

type SettingsPageProps = {
  theme: Theme
  onThemeChange: (t: Theme) => void
  displayName: string
  remindersOn: boolean
  onSettingsChange: (patch: { displayName?: string; remindersOn?: boolean }) => void
  entries: Record<string, Entry>
  onEraseAll: () => void
}

export default function SettingsPage({ theme, onThemeChange, displayName, remindersOn, onSettingsChange, entries, onEraseAll }: SettingsPageProps) {
  function exportJson() {
    const data = JSON.stringify(Object.values(entries), null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reverie-${todayKey()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  function eraseAll() {
    if (window.confirm('Erase ALL your entries? This cannot be undone.')) onEraseAll()
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-sub">Make this diary feel like yours.</div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-title">Theme</div>
        <div className="theme-grid">
          {THEMES.map((t) => (
            <div key={t.id} className={`theme-card ${theme === t.id ? 'active' : ''}`} onClick={() => onThemeChange(t.id)}>
              <div className="theme-preview" style={{ background: t.preview }} />
              <div className="theme-card-name">{t.name}</div>
              <div className="theme-card-sub">{t.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-title">Profile</div>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Display name</div>
            <div className="settings-row-sub">A friendly name for your diary.</div>
          </div>
          <input className="settings-input" value={displayName} placeholder="Your name" maxLength={24}
            onChange={(e) => onSettingsChange({ displayName: e.target.value })} />
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Daily reminder</div>
            <div className="settings-row-sub">A gentle nudge to write each day.</div>
          </div>
          <button className={`switch ${remindersOn ? 'on' : ''}`} onClick={() => onSettingsChange({ remindersOn: !remindersOn })} aria-label="Toggle daily reminder" />
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-title">Your data</div>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Export entries</div>
            <div className="settings-row-sub">Download all your pages as a JSON file.</div>
          </div>
          <button className="btn btn-ghost" onClick={exportJson}>Export</button>
        </div>
        <div className="danger-zone">
          <div className="settings-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <div>
              <div className="settings-row-label">Erase everything</div>
              <div className="settings-row-sub">Permanently delete all entries. No undo.</div>
            </div>
            <button className="btn btn-danger" onClick={eraseAll}>Erase all</button>
          </div>
        </div>
      </div>
    </div>
  )
}