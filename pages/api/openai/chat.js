// Server endpoint that proxies chat completions to OpenAI.
// It will read the API key from several possible env names so you can set
// OPENAI_API_KEY, META_ENV_OPENAI_API_KEY, or VITE_OPENAI_API_KEY depending on your setup.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.META_ENV_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || process.env['META_ENV_OPENAI_API_KEY']
  if (!OPENAI_KEY) return res.status(500).json({ error: 'OpenAI API key not configured on server. Set OPENAI_API_KEY in your environment.' })

  const { messages, prompt, model } = req.body || {}
  if (!messages && !prompt) return res.status(400).json({ error: 'Missing `messages` or `prompt` in request body' })

  const useModel = model || 'gpt-4o-mini'
  const payload = {
    model: useModel,
    messages: messages || (prompt ? [{ role: 'user', content: prompt }] : [{ role: 'user', content: 'Hello' }]),
    temperature: 0.7,
    max_tokens: 800
  }

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(payload)
    })

    if (!r.ok) {
      const text = await r.text()
      console.error('OpenAI error', r.status, text)
      return res.status(502).json({ error: 'OpenAI request failed', status: r.status, details: text })
    }

    const data = await r.json()
    const assistant = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.message || ''
    // keep response small for UI
    const result = (typeof assistant === 'string' ? assistant : JSON.stringify(assistant)).slice(0, 20000)
    return res.status(200).json({ result })
  } catch (err) {
    console.error('OpenAI proxy error', err)
    return res.status(500).json({ error: 'server error', details: String(err) })
  }
}
