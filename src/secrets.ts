import { supabase } from './supabaseClient'

export type Secret = {
  id: string
  title: string
  body: string
  createdAt: number
  updatedAt: number
}

export async function loadSecrets(userId: string): Promise<Secret[]> {
  const { data, error } = await supabase
    .from('secrets')
    .select('id, title, body, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) { console.error('loadSecrets', error); return [] }
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  }))
}

export async function saveSecret(userId: string, secret: Secret): Promise<void> {
  const { error } = await supabase.from('secrets').upsert({
    id: secret.id,
    user_id: userId,
    title: secret.title,
    body: secret.body,
    updated_at: new Date().toISOString(),
  })
  if (error) console.error('saveSecret', error)
}

export async function deleteSecret(userId: string, id: string): Promise<void> {
  const { error } = await supabase.from('secrets').delete().eq('id', id).eq('user_id', userId)
  if (error) console.error('deleteSecret', error)
}

export function makeSecret(): Secret {
  const now = Date.now()
  return { id: crypto.randomUUID(), title: '', body: '', createdAt: now, updatedAt: now }
}
