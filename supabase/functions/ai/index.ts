const GROQ_KEY = Deno.env.get("GROQ_API_KEY")!
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"
const MODEL = "llama-3.1-8b-instant"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

async function callGroq(prompt: string): Promise<string> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
      max_tokens: 300,
    }),
  })
  const data = await res.json()
  return (data?.choices?.[0]?.message?.content ?? "").trim()
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })

  try {
    const { task, input } = await req.json()
    let result: unknown

    if (task === "prompt") {
      const recent = (input?.recent ?? []).slice(0, 5).join("\n---\n")
      let p =
        "You are a warm, gentle journaling companion. Write ONE short reflective writing " +
        "prompt (max 20 words) to help someone start today's diary entry. Be kind and " +
        "specific, not generic. Return only the prompt text, no quotes."
      if (recent) p += "\n\nSnippets from their recent entries for context:\n" + recent
      result = { text: await callGroq(p) }

    } else if (task === "moodtags") {
      const body = (input?.body ?? "").slice(0, 4000)
      const moods = "joy, calm, love, tired, sad, angry, anxious, grateful"
      const p =
        `Read this diary entry and reply with STRICT JSON only (no markdown), as ` +
        `{"mood":"<one of: ${moods}>","tags":["tag1","tag2"]}. Pick the single best mood id ` +
        `from that list and 2-4 short lowercase single-word tags (no #).\n\nEntry:\n` + body
      const raw = await callGroq(p)
      const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim()
      try { result = JSON.parse(cleaned) } catch { result = { mood: null, tags: [] } }

    } else {
      return new Response(JSON.stringify({ error: "unknown task" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } })
    }

    return new Response(JSON.stringify(result),
      { headers: { ...cors, "Content-Type": "application/json" } })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } })
  }
})
