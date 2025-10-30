import { useState, useEffect } from 'react'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [warning, setWarning] = useState('')

  useEffect(() => {
    setMessages([{ role: 'system', content: 'Hello! I am Tree Roots. I will ask about your allergies before giving recommendations.' }])
  }, [])

  async function sendMessage() {
    if (!input.trim()) return
    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [...messages, userMsg]
      })
    })
    const data = await res.json()
    if (!res.ok) {
      setWarning(data.error?.message || 'Error')
      return
    }
    setMessages(prev => [...prev, { role: 'assistant', content: data.choices[0].message.content }])
  }

  return (
    <div style={{padding:20}}>
      <h2>Tree Roots — Chat</h2>
      <div style={{border:'1px solid #ccc', padding:8, height:300, overflow:'auto', marginBottom:8}}>
        {messages.map((m,i)=> <div key={i} style={{marginBottom:6}}><strong>{m.role}</strong>: {m.content}</div>)}
      </div>
      <div>
        <input value={input} onChange={e=>setInput(e.target.value)} style={{width:'60%'}} onKeyDown={e=>{ if (e.key === 'Enter') sendMessage() }} />
        <button onClick={sendMessage} style={{marginLeft:8}}>Send</button>
      </div>
      {warning && <p style={{color:'red'}}>{warning}</p>}
    </div>
  )
}