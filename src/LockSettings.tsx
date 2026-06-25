import { useState } from 'react'
import {
  loadLock, saveLock, hashAnswer, randomSalt,
  registerBiometric, isBiometricSupported, SECRET_QUESTIONS,
} from './lock'

type Step = 'idle' | 'biometric' | 'question'

export default function LockSettings() {
  const [cfg, setCfg] = useState(() => loadLock())
  const [step, setStep] = useState<Step>('idle')
  const [bioError, setBioError] = useState('')
  const [credentialId, setCredentialId] = useState(cfg.credentialId)
  const [question, setQuestion] = useState(cfg.question || SECRET_QUESTIONS[0])
  const [customQ, setCustomQ] = useState('')
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')

  const bioSupported = isBiometricSupported()
  const activeQuestion = question === SECRET_QUESTIONS[SECRET_QUESTIONS.length - 1] ? customQ : question

  async function startSetup() {
    setBioError('')
    setCredentialId('')
    if (bioSupported) {
      setStep('biometric')
    } else {
      setStep('question')
    }
  }

  async function doRegisterBiometric() {
    setBioError('')
    try {
      const id = await registerBiometric('Reverie user')
      setCredentialId(id)
      setStep('question')
    } catch {
      setBioError('Biometric setup failed. You can skip and use a secret question only.')
    }
  }

  async function saveSetup() {
    setError('')
    if (!activeQuestion.trim()) { setError('Please enter a question.'); return }
    if (answer.trim().length < 2) { setError('Answer is too short.'); return }
    const salt = randomSalt()
    const hash = await hashAnswer(answer, salt)
    const next = {
      enabled: true,
      credentialId,
      question: activeQuestion.trim(),
      answerHash: hash,
      answerSalt: salt,
    }
    saveLock(next)
    setCfg(next)
    setStep('idle')
    setAnswer('')
  }

  function turnOff() {
    const next = { enabled: false, credentialId: '', question: '', answerHash: '', answerSalt: '' }
    saveLock(next)
    setCfg(next)
    setStep('idle')
  }

  if (step === 'biometric') {
    return (
      <div className="settings-section">
        <div className="settings-title">Set up lock</div>
        <div className="lock-setup-card">
          <div className="lock-setup-emoji">🔐</div>
          <p className="lock-setup-desc">First, let's register your fingerprint or Face ID.</p>
          <button className="btn btn-primary" onClick={doRegisterBiometric}>☝️ Register biometric</button>
          {bioError && <div className="auth-error" style={{ marginTop: 12 }}>{bioError}</div>}
          <button className="lock-switch-btn" style={{ marginTop: 12 }} onClick={() => { setCredentialId(''); setStep('question') }}>
            Skip — use secret question only
          </button>
        </div>
      </div>
    )
  }

  if (step === 'question') {
    return (
      <div className="settings-section">
        <div className="settings-title">Set up secret question</div>
        {credentialId && <div className="auth-info">✅ Biometric registered! Now set a backup question.</div>}
        <div className="lock-setup-card">
          <div className="lock-setup-emoji">🤫</div>
          <p className="lock-setup-desc">Pick a question only you can answer.</p>
          <div className="lock-q-list">
            {SECRET_QUESTIONS.map((q) => (
              <button
                key={q}
                className={`lock-q-option ${question === q ? 'active' : ''}`}
                onClick={() => setQuestion(q)}
              >
                {q}
              </button>
            ))}
          </div>
          {question === SECRET_QUESTIONS[SECRET_QUESTIONS.length - 1] && (
            <input
              className="settings-input"
              placeholder="Type your own question…"
              value={customQ}
              maxLength={80}
              onChange={(e) => setCustomQ(e.target.value)}
              style={{ marginTop: 10 }}
            />
          )}
          <input
            className="settings-input"
            placeholder="Your answer (case-insensitive)"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            style={{ marginTop: 10 }}
          />
          {error && <div className="auth-error" style={{ marginTop: 8 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn btn-primary" onClick={saveSetup}>Save</button>
            <button className="btn btn-ghost" onClick={() => { setStep('idle'); setAnswer(''); setError('') }}>Cancel</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-section">
      <div className="settings-title">App lock</div>
      <div className="settings-row" style={{ borderBottom: 'none' }}>
        <div>
          <div className="settings-row-label">
            {cfg.enabled
              ? `🔐 On · ${cfg.credentialId ? 'Biometric + secret question' : 'Secret question'}`
              : 'Off'}
          </div>
          <div className="settings-row-sub">
            Locks the app and your Secrets page.
          </div>
        </div>
        {cfg.enabled ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={startSetup}>Change</button>
            <button className="btn btn-ghost" onClick={turnOff}>Turn off</button>
          </div>
        ) : (
          <button className="btn btn-ghost" onClick={startSetup}>Set up</button>
        )}
      </div>
    </div>
  )
}
