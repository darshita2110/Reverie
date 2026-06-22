import { useState } from 'react'
import { hashPin } from './lock'

type LockScreenProps = { hash: string; salt: string; onUnlock: () => void }

export default function LockScreen({ hash, salt, onUnlock }: LockScreenProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  async function press(d: string) {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    setError(false)
    if (next.length === 4) {
      const h = await hashPin(next, salt)
      if (h === hash) onUnlock()
      else { setError(true); setTimeout(() => setPin(''), 400) }
    }
  }

  return (
    <div className="lock-wrap">
      <div className="grain" />
      <div className="lock-card">
        <div className="auth-mark">R</div>
        <div className="lock-title">Enter your PIN</div>
        <div className={`pin-dots ${error ? 'error' : ''}`}>
          {[0, 1, 2, 3].map((i) => <span key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`} />)}
        </div>
        <div className="pin-pad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button key={d} className="pin-key" onClick={() => press(d)}>{d}</button>
          ))}
          <span />
          <button className="pin-key" onClick={() => press('0')}>0</button>
          <button className="pin-key pin-back" onClick={() => { setPin(pin.slice(0, -1)); setError(false) }}>⌫</button>
        </div>
      </div>
    </div>
  )
}