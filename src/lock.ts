const LOCK_KEY = 'reverie:lock'

export type LockConfig = {
  enabled: boolean
  credentialId: string   // base64 WebAuthn credential ID
  question: string
  answerHash: string
  answerSalt: string
}

export function loadLock(): LockConfig {
  try {
    return {
      enabled: false, credentialId: '', question: '', answerHash: '', answerSalt: '',
      ...JSON.parse(localStorage.getItem(LOCK_KEY) || '{}'),
    }
  } catch {
    return { enabled: false, credentialId: '', question: '', answerHash: '', answerSalt: '' }
  }
}

export function saveLock(cfg: LockConfig): void {
  localStorage.setItem(LOCK_KEY, JSON.stringify(cfg))
}

export function randomSalt(): string {
  const a = new Uint8Array(16)
  crypto.getRandomValues(a)
  return Array.from(a).map(b => b.toString(16).padStart(2, '0')).join('')
}

function randomBytes(n = 32): ArrayBuffer {
  const a = new Uint8Array(n); crypto.getRandomValues(a); return a.buffer as ArrayBuffer
}

export function bufToBase64(buf: ArrayBuffer | Uint8Array): string {
  const b = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let s = ''; b.forEach(x => s += String.fromCharCode(x)); return btoa(s)
}

export function base64ToBuf(s: string): Uint8Array {
  return Uint8Array.from(atob(s), c => c.charCodeAt(0))
}

export async function hashAnswer(answer: string, salt: string): Promise<string> {
  const bytes = new TextEncoder().encode(salt + ':' + answer.toLowerCase().trim())
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function isBiometricSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.PublicKeyCredential !== 'undefined'
}

export async function registerBiometric(displayName: string): Promise<string> {
  const cred = await navigator.credentials.create({
    publicKey: {
      challenge: randomBytes(32),
      rp: { name: 'Reverie', id: window.location.hostname },
      user: { id: randomBytes(16), name: displayName, displayName },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' as const }],
      authenticatorSelection: { authenticatorAttachment: 'platform' as const, userVerification: 'required' as const },
      timeout: 60000,
    },
  }) as PublicKeyCredential
  return bufToBase64(cred.rawId)
}

export async function verifyBiometric(credentialId: string): Promise<boolean> {
  try {
    await navigator.credentials.get({
      publicKey: {
        challenge: randomBytes(32),
        rpId: window.location.hostname,
        allowCredentials: [{ id: base64ToBuf(credentialId).buffer as ArrayBuffer, type: 'public-key' as const }],
        userVerification: 'required' as const,
        timeout: 60000,
      },
    })
    return true
  } catch {
    return false
  }
}

export const SECRET_QUESTIONS = [
  "Who was your first celebrity crush? 💕",
  "What's your most embarrassing childhood memory? 😅",
  "What's a secret talent nobody knows about? 🎭",
  "What's the weirdest dream you've ever had? 🌙",
  "What was your childhood nickname? 🐣",
  "What's your biggest guilty pleasure? 🍫",
  "What's the most rebellious thing you've done? 😏",
  "Name one thing only YOU would know 🤫",
]
