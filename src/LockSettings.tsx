import { useState } from 'react'
import { loadLock, saveLock, hashPin, randomSalt } from './lock'

export default function LockSettings() {
  const [cfg, setCfg] = useState(() => loadLock())
  const [setting, setSetting] = useState(false)
  const [pin1, setPin1] = useState('')
  const [pin2, setPin2] = useState('')
  const [error, setError] = useState('')

  async function savePin() {
    setError('')
    if (!/^\d{4}$/.test(pin1)) { setError('PIN must be exactly 4 digits.'); return }
    if (pin1 !== pin2) { setError('The PINs do not match.'); return }
    const salt = randomSalt()
    const hash = await hashPin(pin1, salt)
    const next = { enabled: true, hash, salt }
    saveLock(next); setCfg(next)
    setSetting(false); setPin1(''); setPin2('')
  }
  function turnOff() {
    const next = { enabled: false, hash: '', salt: '' }
    saveLock(next); setCfg(next)
  }

  return (
    <div className="settings-section">
      <div className="settings-title">Secrets PIN</div>
      <div className="settings-row" style={{ borderBottom: setting ? '1px solid var(--line)' : 'none' }}>
        <div>
          <div className="settings-row-label">PIN lock · {cfg.enabled ? 'On' : 'Off'}</div>
          <div className="settings-row-sub">Require a 4-digit PIN to open your Secrets page.</div>
        </div>
        {cfg.enabled ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => setSetting(true)}>Change</button>
            <button className="btn btn-ghost" onClick={turnOff}>Turn off</button>
          </div>
        ) : (
          <button className="btn btn-ghost" onClick={() => setSetting(true)}>Set up PIN</button>
        )}
      </div>
      {setting && (
        <div className="pin-setup">
          <input className="settings-input" type="password" inputMode="numeric" maxLength={4} placeholder="New 4-digit PIN"
            value={pin1} onChange={(e) => setPin1(e.target.value.replace(/\D/g, ''))} />
          <input className="settings-input" type="password" inputMode="numeric" maxLength={4} placeholder="Confirm PIN"
            value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, ''))} />
          {error && <div className="auth-error">{error}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={savePin}>Save PIN</button>
            <button className="btn btn-ghost" onClick={() => { setSetting(false); setError(''); setPin1(''); setPin2('') }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}