type Page = 'today' | 'entries' | 'calendar' | 'insights' | 'settings'
type Theme = 'classic' | 'dusk' | 'botanical' | 'rose'

const navItems: { id: Page; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'entries', label: 'Entries' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'insights', label: 'Insights' },
  { id: 'settings', label: 'Settings' },
]
const themes: Theme[] = ['classic', 'dusk', 'botanical', 'rose']

type SidebarProps = {
  page: Page
  onNavigate: (page: Page) => void
  theme: Theme
  onThemeChange: (theme: Theme) => void
}

export default function Sidebar({ page, onNavigate, theme, onThemeChange }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">R</div>
        <div>
          <div className="brand-text">Reverie</div>
          <div className="brand-sub">your daily pages</div>
        </div>
      </div>

      <nav className="nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${page === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-spacer" />

      <div className="theme-row">
        {themes.map((t) => (
          <button
            key={t}
            className={`theme-dot t-${t} ${theme === t ? 'active' : ''}`}
            onClick={() => onThemeChange(t)}
            aria-label={t}
          />
        ))}
      </div>
    </aside>
  )
}