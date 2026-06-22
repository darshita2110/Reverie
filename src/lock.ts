const LOCK_KEY = 'reverie:lock'

export type LockConfig = { enabled: boolean; hash: string; salt: string }

export function loadLock(): LockConfig {
  try {
    return { enabled: false, hash: '', salt: '', ...JSON.parse(localStorage.getItem(LOCK_KEY) || '{}') }
  } catch {
    return { enabled: false, hash: '', salt: '' }
  }
}

export function saveLock(cfg: LockConfig): void {
  localStorage.setItem(LOCK_KEY, JSON.stringify(cfg))
}

export function randomSalt(): string {
  const a = new Uint8Array(16)
  crypto.getRandomValues(a)
  return Array.from(a).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  const bytes = new TextEncoder().encode(salt + ':' + pin)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')
}