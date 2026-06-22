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
import Onboarding from './Onboarding'
import LockScreen from './LockScreen'
import { loadLock } from './lock'
import { loadEntries, saveEntry, deleteEntry, loadSettings, saveSettings, eraseAllEntries, type Settings } from './storage'
import { makeEmptyEntry, computeStreak, hasContent, todayKey, type Entry } from './diary'
import './App.css'


type Page = 'today' | 'entries' | 'calendar' | 'insights' | 'settings'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(false)

  const [settings, setSettings] = useState<Settings>(() => loadSettings())
  const [page, setPage] = useState<Page>('today')
  const [menuOpen, setMenuOpen] = useState(false)
  const [entries, setEntries] = useState<Record<string, Entry>>({})
  const [entriesLoaded, setEntriesLoaded] = useState(false)
  const [editingDate, setEditingDate] = useState<string | null>(null)
  const [lock] = useState(() => loadLock())
  const [unlocked, setUnlocked] = useState(false)

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
  useEffect(() => {
    if (!lock.enabled) return
    function onVisibility() {
      if (document.visibilityState === 'hidden') setUnlocked(false)
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [lock.enabled])

  function updateSettings(patch: Partial<Settings>) {
    setSettings((prev) => { const next = { ...prev, ...patch }; saveSettings(next); return next })
  }
  function goTo(p: Page) { if (p === 'today') setEditingDate(null); setPage(p); setMenuOpen(false) }
  function openEntry(date: string) { setEditingDate(date); setPage('today'); setMenuOpen(false) }

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

  function eraseEverything() {
    if (!session) return
    eraseAllEntries(session.user.id)
    setEntries({})
  }

  if (!authReady) {
    return <div className="auth-wrap"><div className="auth-sub">Loading…</div></div>
  }
  if (!session) {
    return <AuthScreen />
  }
  if (lock.enabled && !unlocked) {
    return <LockScreen hash={lock.hash} salt={lock.salt} onUnlock={() => setUnlocked(true)} />
  }
  if (!settings.joinedAt) {
    return <Onboarding onComplete={(name) => updateSettings({ name, joinedAt: Date.now() })} />
  }
  if (!entriesLoaded) {
    return <div className="auth-wrap"><div className="auth-sub">Loading your diary…</div></div>
  }

  const activeDate = editingDate ?? todayKey()
  const activeEntry = entries[activeDate] ?? makeEmptyEntry(activeDate)
  const streak = computeStreak(entries)

  return (
    <>
      <div className="grain" />
      <button className="mobile-menu-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>

      <div className="app">
        <Sidebar page={page} onNavigate={goTo} theme={settings.theme} onThemeChange={(t) => updateSettings({ theme: t })} streak={streak} open={menuOpen} name={settings.name} />
        <main className="main">
          {page === 'today' && <TodayPage entry={activeEntry} onChange={upsertEntry} onBack={() => goTo('today')} allEntries={entries} onOpen={openEntry} />}
          {page === 'entries' && <EntriesPage entries={entries} onOpen={openEntry} />}
          {page === 'calendar' && <CalendarPage entries={entries} onOpen={openEntry} />}
          {page === 'insights' && <InsightsPage entries={entries} streak={streak} />}
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
        </main>
      </div>
    </>
  )
}

export default App