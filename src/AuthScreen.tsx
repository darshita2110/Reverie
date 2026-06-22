import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function AuthScreen() {
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit() {
    setError(''); setInfo('')
    if (!email.trim() || !password) { setError('Enter your email and password.'); return }
    setBusy(true)
    if (mode === 'in') {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) setError(error.message)
    } else {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password })
      if (error) setError(error.message)
      else if (!data.session) setInfo('Account created! Check your email to confirm, then sign in.')
    }
    setBusy(false)
  }

  return (
    <div className="auth-wrap">
      <div className="grain" />
      <div className="auth-card">
        <div className="auth-mark">R</div>
        <h1 className="auth-title">{mode === 'in' ? 'Welcome back' : 'Start your diary'}</h1>
        <p className="auth-sub">
          {mode === 'in' ? 'Sign in to open your pages on any device.' : 'Create an account — your diary follows you everywhere.'}
        </p>

        <label className="auth-label">Email</label>
        <input className="auth-input" type="email" value={email} placeholder="you@example.com"
          onChange={(e) => setEmail(e.target.value)} />

        <label className="auth-label">Password</label>
        <input className="auth-input" type="password" value={password} placeholder="••••••••"
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit() }} />

        {error && <div className="auth-error">{error}</div>}
        {info && <div className="auth-info">{info}</div>}

        <button className="btn btn-primary auth-submit" onClick={submit} disabled={busy}>
          {busy ? 'Please wait…' : mode === 'in' ? 'Sign in' : 'Create account'}
        </button>

        <div className="auth-switch">
          {mode === 'in' ? 'New here?' : 'Already have an account?'}{' '}
          <button onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setError(''); setInfo('') }}>
            {mode === 'in' ? 'Create one' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}