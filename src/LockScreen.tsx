import { useState, useEffect } from 'react'
import { verifyBiometric, hashAnswer, isBiometricSupported, type LockConfig } from './lock'

type Props = { lock: LockConfig; onUnlock: () => void; title?: string }

export default function LockScreen({ lock, onUnlock, title = 'Welcome back 👋' }: Props) {
  const hasBiometric = !!(lock.credentialId && isBiometricSupported())
  const [mode, setMode] = useState<'biometric' | 'question'>(hasBiometric ? 'biometric' : 'question')
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const [trying, setTrying] = useState(false)

  useEffect(() => {
    if (hasBiometric) tryBiometric()
  }, [])

  async function tryBiometric() {
    setTrying(true)
    setError('')
    const ok = await verifyBiometric(lock.credentialId)
    setTrying(false)
    if (ok) onUnlock()
    else setError("Biometric didn't work. Try your secret question.")
  }

  async function checkAnswer() {
    if (!answer.trim()) return
    const h = await hashAnswer(answer, lock.answerSalt)
    if (h === lock.answerHash) {
      onUnlock()
    } else {
      setError("That doesn't seem right 🤔 Try again.")
      setAnswer('')
    }
  }

  return (
    <div className="lock-wrap">
      <div className="grain" />
      <div className="lock-card">
        <div className="lock-emoji">{mode === 'biometric' ? '🔐' : '🤫'}</div>
        <div className="lock-title">{title}</div>

        {mode === 'biometric' ? (
          <>
            <p className="lock-sub">Use your fingerprint or face ID to unlock</p>
            <button className="btn btn-primary lock-bio-btn" onClick={tryBiometric} disabled={trying}>
              {trying ? 'Verifying…' : '☝️ Touch to unlock'}
            </button>
            {error && <div className="lock-error">{error}</div>}
            <button className="lock-switch-btn" onClick={() => { setMode('question'); setError('') }}>
              Use secret question instead
            </button>
          </>
        ) : (
          <>
            <p className="lock-sub lock-question">{lock.question}</p>
            <input
              className="lock-answer-input"
              type="text"
              placeholder="Your answer…"
              value={answer}
              autoFocus
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') checkAnswer() }}
            />
            {error && <div className="lock-error">{error}</div>}
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={checkAnswer}>
              Unlock
            </button>
            {hasBiometric && (
              <button className="lock-switch-btn" onClick={() => { setMode('biometric'); setError(''); tryBiometric() }}>
                Use fingerprint instead
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
