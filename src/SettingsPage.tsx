import { useState } from 'react'
import type { Settings, Theme, FontChoice } from './storage'
import type { Entry } from './diary'

type SettingsPageProps = {
  settings: Settings
  onUpdateSettings: (patch: Partial<Settings>) => void
  entries: Record<string, Entry>
  onEraseAll: () => void
}

const THEME_DEFS: { id: Theme; name: string; sub: string; gradient: string }[] = [
  { id: 'classic', name: 'Classic', sub: 'Warm paper & terracotta', gradient: 'linear-gradient(135deg,#FBF6EC,#B85C38)' },
  { id: 'dusk', name: 'Dusk', sub: 'Low light, soft ember', gradient: 'linear-gradient(135deg,#2B2521,#E08A5E)' },
  { id: 'botanical', name: 'Botanical', sub: 'Sage greens, garden air', gradient: 'linear-gradient(135deg,#F3F1E6,#4F7A52)' },
  { id: 'rose', name: 'Rose', sub: 'Dusty pink, soft warmth', gradient: 'linear-gradient(135deg,#FBF0EC,#C65A6E)' },
]

const FONT_DEFS: { id: FontChoice; name: string; family: string }[] = [
  { id: 'serif', name: 'Fraunces + Inter', family: "'Fraunces', serif" },
  { id: 'rounded', name: 'Quicksand', family: "'Quicksand', sans-serif" },
  { id: 'classic-sans', name: 'Inter', family: "'Inter', sans-serif" },
  { id: 'mono', name: 'Space Mono', family: "'Space Mono', monospace" },
]

export default function SettingsPage({ settings, onUpdateSettings, entries, onEraseAll }: SettingsPageProps) {
  const [nameDraft, setNameDraft] = useState(settings.name)
  const totalEntries = Object.keys(entries).length

  function commitName() {
    onUpdateSettings({ name: nameDraft.trim() })
  }

  function handleExport() {
    const payload = { settings, entries }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'reverie-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleEraseAll() {
    if (totalEntries === 0) return
    const ok = window.confirm('This will permanently delete every page you have written. This cannot be undone. Continue?')
    if (ok) onEraseAll()
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
          {THEME_DEFS.map((t) => (
            <div
              key={t.id}
              className={`theme-card ${settings.theme === t.id ? 'active' : ''}`}
              onClick={() => onUpdateSettings({ theme: t.id })}
            >
              <div className="theme-preview" style={{ background: t.gradient }} />
              <div className="theme-card-name">{t.name}</div>
              <div className="theme-card-sub">{t.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-title">Font</div>
        <div className="font-grid">
          {FONT_DEFS.map((f) => (
            <div
              key={f.id}
              className={`font-card ${settings.font === f.id ? 'active' : ''}`}
              onClick={() => onUpdateSettings({ font: f.id })}
            >
              <div className="font-card-name">{f.name}</div>
              <div className="font-card-sample" style={{ fontFamily: f.family }}>Dear diary, today felt different.</div>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-title">Preferences</div>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Display name</div>
            <div className="settings-row-sub">Used in your greeting on the sidebar</div>
          </div>
          <input
            className="settings-input"
            value={nameDraft}
            maxLength={24}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => { if (e.key === 'Enter') commitName() }}
          />
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Daily reminder</div>
            <div className="settings-row-sub">A gentle nudge if you haven't written today</div>
          </div>
          <button
            className={`switch ${settings.remindersOn ? 'on' : ''}`}
            onClick={() => onUpdateSettings({ remindersOn: !settings.remindersOn })}
            aria-label="Toggle daily reminder"
          />
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-title">Your data</div>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Export your diary</div>
            <div className="settings-row-sub">Download every page as a JSON file — handy for moving devices or keeping a backup</div>
          </div>
          <button className="btn btn-ghost" onClick={handleExport}>Export</button>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-title">Danger zone</div>
        <div className="danger-zone">
          <div className="settings-row" style={{ borderBottom: 'none' }}>
            <div>
              <div className="settings-row-label">Erase all entries</div>
              <div className="settings-row-sub">Permanently deletes all {totalEntries} page{totalEntries === 1 ? '' : 's'} you've written</div>
            </div>
            <button className="btn btn-danger" onClick={handleEraseAll} disabled={totalEntries === 0}>
              Erase everything
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
