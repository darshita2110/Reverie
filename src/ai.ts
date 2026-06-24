import { supabase } from './supabaseClient'

export async function aiPrompt(recent: string[]): Promise<string> {
  const { data, error } = await supabase.functions.invoke('ai', {
    body: { task: 'prompt', input: { recent } },
  })
  if (error) { console.error('aiPrompt', error); return '' }
  return (data as { text: string }).text
}

export async function aiMoodTags(body: string): Promise<{ mood: string | null; tags: string[] }> {
  const { data, error } = await supabase.functions.invoke('ai', {
    body: { task: 'moodtags', input: { body } },
  })
  if (error) { console.error('aiMoodTags', error); return { mood: null, tags: [] } }
  return data as { mood: string | null; tags: string[] }
}
