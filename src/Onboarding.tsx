import { useState } from 'react'

type OnboardingProps = {
  onComplete: (name: string) => void
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [name, setName] = useState('')

  function start() {
    onComplete(name.trim() || 'friend')
  }

  return (
    <div className="onboard-wrap">
      <div className="grain" />
      <div className="onboard-card">
        <div className="onboard-mark">R</div>
        <div className="onboard-title">Reverie</div>
        <div className="onboard-sub">
          A quiet place to keep your days.<br />Write, tag a mood, watch the year fill in.
        </div>
        <div className="onboard-input-group">
          <label className="onboard-label" htmlFor="onboard-name">What should we call you?</label>
          <input
            id="onboard-name"
            className="onboard-input"
            placeholder="Your first name"
            maxLength={24}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') start() }}
            autoFocus
          />
        </div>
        <button className="btn btn-primary onboard-btn" onClick={start}>Begin writing</button>
      </div>
    </div>
  )
}
