import { useState } from 'react'
import { loadLock } from './lock'
import LockScreen from './LockScreen'
import { loadSecrets, saveSecrets, makeSecret, type Secret } from './secrets'

export default function SecretsPage() {
  const lock = loadLock()
  const [unlocked, setUnlocked] = useState(!lock.enabled)
  const [secrets, setSecrets] = useState<Secret[]>(() => loadSecrets())
  const [editing, setEditing] = useState<Secret | null>(null)

  function persist(updated: Secret[]) {
    setSecrets(updated)
    saveSecrets(updated)
  }

  function saveEditing() {
    if (!editing) return
    const trimmed = { ...editing, title: editing.title.trim(), body: editing.body.trim(), updatedAt: Date.now() }
    if (!trimmed.title && !trimmed.body) {
      persist(secrets.filter((s) => s.id !== editing.id))
    } else {
      const exists = secrets.some((s) => s.id === editing.id)
      persist(exists ? secrets.map((s) => s.id === editing.id ? trimmed : s) : [trimmed, ...secrets])
    }
    setEditing(null)
  }

  function deleteSecret(id: string) {
    if (!window.confirm('Delete this secret? This cannot be undone.')) return
    persist(secrets.filter((s) => s.id !== id))
    setEditing(null)
  }

  if (!unlocked) {
    return <LockScreen hash={lock.hash} salt={lock.salt} onUnlock={() => setUnlocked(true)} />
  }

  if (editing) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="page-title">Secret note</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={saveEditing}>Done</button>
            <button className="btn btn-danger" onClick={() => deleteSecret(editing.id)}>Delete</button>
          </div>
        </div>
        <div className="secret-editor">
          <input
            className="secret-title-input"
            placeholder="Title…"
            value={editing.title}
            maxLength={60}
            autoFocus
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
          />
          <textarea
            className="secret-body-input"
            placeholder="Write your secret here…"
            value={editing.body}
            onChange={(e) => setEditing({ ...editing, body: e.target.value })}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Secrets</div>
          <div className="page-sub">Private notes, locked away just for you.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing(makeSecret())}>+ New</button>
      </div>

      {!lock.enabled && (
        <div className="secret-warning">
          No PIN set — your secrets are visible to anyone who opens this app. Go to <strong>Settings → Secrets PIN</strong> to add one.
        </div>
      )}

      {secrets.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <h3>No secrets yet</h3>
          <p>Tap "+ New" to write your first private note.</p>
        </div>
      ) : (
        <div className="secret-list">
          {secrets.map((s) => (
            <button key={s.id} className="secret-card" onClick={() => setEditing(s)}>
              <div className="secret-card-title">{s.title || 'Untitled'}</div>
              {s.body && <div className="secret-card-preview">{s.body.slice(0, 120)}</div>}
              <div className="secret-card-date">
                {new Date(s.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
