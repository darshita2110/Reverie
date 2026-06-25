const KEY = 'reverie:secrets'

export type Secret = {
  id: string
  title: string
  body: string
  createdAt: number
  updatedAt: number
}

export function loadSecrets(): Secret[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export function saveSecrets(secrets: Secret[]): void {
  localStorage.setItem(KEY, JSON.stringify(secrets))
}

export function makeSecret(): Secret {
  const now = Date.now()
  return { id: crypto.randomUUID(), title: '', body: '', createdAt: now, updatedAt: now }
}
