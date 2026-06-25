import { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'
import AuthScreen from './AuthScreen'
import Sidebar from './Sidebar'
import TodayPage from './TodayPage'
import EntriesPage from './EntriesPage'
import CalendarPage from './CalendarPage'
import InsightsPage from './InsightsPage'
import SettingsPage from './SettingsPage'
import EntryView from './EntryView'
import Onboarding from './Onboarding'
import SecretsPage from './SecretsPage'
import { loadEntries, saveEntry, deleteEntry, loadSettings, saveSettings, eraseAllEntries, type Settings } from './storage'
import { makeEmptyEntry, computeStreak, hasContent, todayKey, type Entry } from './diary'
import './App.css'

type Page = 'today' | 'entries' | 'calendar' | 'insights' | 'settings' | 'secrets'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [settings, setSettings] = useState<Settings>(() => loadSettings())
  const [page, setPage] = useState<Page>('today')
  const [menuOpen, setMenuOpen] = useState(false)
  const [entries, setEntries] = useState<Record<string, Entry>>({})
  const [entriesLoaded, setEntriesLoaded] = useState(false)
  const [editingDate, setEditingDate] = useState<string | null>(null)
  const [viewingDate, setViewingDate] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) { setEntries({}); setEntriesLoaded(false); return }
    setEntriesLoaded(false)
    loadEntries(session.user.id).then((e) => {
      setEntries(e)
      setEntriesLoaded(true)
    })
  }, [session])

  useEffect(() => { document.body.setAttribute('data-theme', settings.theme) }, [settings.theme])
  useEffect(() => { document.body.setAttribute('data-font', settings.font) }, [settings.font])

  function updateSettings(patch: Partial<Settings>) {
    setSettings((prev) => { const next = { ...prev, ...patch }; saveSettings(next); return next })
  }
  function goTo(p: Page) {
    if (p === 'today') setEditingDate(null)
    setViewingDate(null)
    setPage(p)
    setMenuOpen(false)
  }
  function openEntry(date: string) {
    setViewingDate(date)
    setMenuOpen(false)
  }
  function upsertEntry(entry: Entry) {
    if (!session) return
    if (hasContent(entry)) {
      setEntries((prev) => ({ ...prev, [entry.date]: entry }))
      saveEntry(session.user.id, entry)
    } else {
      setEntries((prev) => { const next = { ...prev }; delete next[entry.date]; return next })
      deleteEntry(session.user.id, entry.date)
    }
  }
  function deleteEntryNow(date: string) {
    if (!session) return
    setEntries((prev) => { const next = { ...prev }; delete next[date]; return next })
    deleteEntry(session.user.id, date)
  }
  function eraseEverything() {
    if (!session) return
    eraseAllEntries(session.user.id)
    setEntries({})
  }

  if (!authReady) return <div className="auth-wrap"><div className="auth-sub">Loading…</div></div>
  if (!session) return <AuthScreen />
  if (!settings.joinedAt) return <Onboarding onComplete={(name) => updateSettings({ name, joinedAt: Date.now() })} />
  if (!entriesLoaded) return <div className="auth-wrap"><div className="auth-sub">Loading your diary…</div></div>

  const activeDate = editingDate ?? todayKey()
  const activeEntry = entries[activeDate] ?? makeEmptyEntry(activeDate)
  const streak = computeStreak(entries)

  const bottomNavItems: { id: Page; label: string; icon: React.ReactNode }[] = [
    { id: 'today', label: 'Today', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg> },
    { id: 'entries', label: 'Entries', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
    { id: 'calendar', label: 'Calendar', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { id: 'insights', label: 'Insights', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
    { id: 'secrets', label: 'Secrets', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
    { id: 'settings', label: 'Settings', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
  ]

  return (
    <>
      <div className="grain" />
      <button className="mobile-menu-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>

      {menuOpen && <div className="sidebar-backdrop open" onClick={() => setMenuOpen(false)} />}

      <div className="app">
        <Sidebar page={page} onNavigate={goTo} theme={settings.theme} onThemeChange={(t) => updateSettings({ theme: t })} streak={streak} open={menuOpen} name={settings.name} />
        <main className="main">
          {viewingDate ? (
            <EntryView
              entry={entries[viewingDate] ?? makeEmptyEntry(viewingDate)}
              onEdit={() => { setEditingDate(viewingDate); setViewingDate(null); setPage('today') }}
              onDelete={() => { deleteEntryNow(viewingDate); setViewingDate(null) }}
              onBack={() => setViewingDate(null)}
            />
          ) : (
            <>
              {page === 'today' && <TodayPage entry={activeEntry} onChange={upsertEntry} onBack={() => goTo('today')} allEntries={entries} onOpen={openEntry} />}
              {page === 'entries' && <EntriesPage entries={entries} onOpen={openEntry} />}
              {page === 'calendar' && <CalendarPage entries={entries} onOpen={openEntry} />}
              {page === 'insights' && <InsightsPage entries={entries} streak={streak} />}
              {page === 'secrets' && <SecretsPage />}
              {page === 'settings' && (
                <SettingsPage
                  settings={settings}
                  onUpdateSettings={updateSettings}
                  entries={entries}
                  onEraseAll={eraseEverything}
                  email={session.user.email ?? ''}
                  onSignOut={() => supabase.auth.signOut()}
                />
              )}
            </>
          )}
        </main>
      </div>

      <nav className="bottom-nav">
        {bottomNavItems.map(({ id, label, icon }) => (
          <button key={id} className={`bottom-nav-btn ${page === id ? 'active' : ''}`} onClick={() => goTo(id)}>
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </>
  )
}

export default App
