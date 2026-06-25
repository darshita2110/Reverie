import type { ReactNode } from 'react'

type Page = 'today' | 'entries' | 'calendar' | 'insights' | 'settings' | 'secrets'
type Theme = 'classic' | 'dusk' | 'botanical' | 'rose'

const navItems: { id: Page; label: string; icon: ReactNode }[] = [
  { id: 'today', label: 'Today', icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>) },
  { id: 'entries', label: 'All entries', icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>) },
  { id: 'calendar', label: 'Calendar', icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>) },
  { id: 'insights', label: 'Mood insights', icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>) },
  { id: 'settings', label: 'Settings', icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>) },
  { id: 'secrets', label: 'Secrets', icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>) },
]
const themes: Theme[] = ['classic', 'dusk', 'botanical', 'rose']

function greeting() {
  const h = new Date().getHours()
  if (h < 5 || h >= 21) return 'night owl'
  if (h < 12) return 'good morning'
  if (h < 17) return 'good afternoon'
  return 'good evening'
}

type SidebarProps = {
  page: Page
  onNavigate: (page: Page) => void
  theme: Theme
  onThemeChange: (theme: Theme) => void
  streak: number
  open: boolean
  name: string
}

export default function Sidebar({ page, onNavigate, theme, onThemeChange, streak, open, name }: SidebarProps) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand">
        <div className="brand-mark">R</div>
        <div>
          <div className="brand-text">Reverie</div>
          <div className="brand-sub">{greeting()}{name ? `, ${name}` : ''}</div>
        </div>
      </div>

      <nav className="nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${page === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-spacer" />

      <div className="streak-card">
        <div className="streak-num">{streak}</div>
        <div className="streak-label">day writing streak</div>
      </div>

      <div className="theme-row">
        {themes.map((t) => (
          <button
            key={t}
            className={`theme-dot t-${t} ${theme === t ? 'active' : ''}`}
            onClick={() => onThemeChange(t)}
            aria-label={t}
            title={t}
          />
        ))}
      </div>
    </aside>
  )
}
