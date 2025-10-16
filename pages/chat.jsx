import { useState } from 'react'

export default function Chat() {
  const [email, setEmail] = useState('')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [warning, setWarning] = useState('')

  async function start() {
    setMessages([{ role: 'system', text: 'Hello! I am Tree Roots. I will ask about your allergies before giving recommendations.' }])
  }

  async function sendMessage() {
    if (!input.trim()) return
    const userMsg = { role: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    const res = await fetch('/api/chat/send', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, message: userMsg.text }) })
    const data = await res.json()
    if (!res.ok) {
      setWarning(data.error || 'Error')
      return
    }
    setMessages(prev => [...prev, { role: 'ai', text: data.reply }])
  }

  async function getRecommendations() {
    const res = await fetch('/api/recommend', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email }) })
    const data = await res.json()
    if (!res.ok) {
      setWarning(data.error)
      return
    }
    setMessages(prev => [...prev, { role: 'ai', text: 'Recommendations:\n' + JSON.stringify(data, null, 2) }])
  }

  return (
    <div style={{padding:20}}>
      <h2>Tree Roots — Chat</h2>
      <div style={{marginBottom:8}}>
        <label>Your email (identify user): </label>
        <input value={email} onChange={e=>setEmail(e.target.value)} />
        <button onClick={start} style={{marginLeft:8}}>Start</button>
      </div>
      <div style={{border:'1px solid #ccc', padding:8, height:300, overflow:'auto', marginBottom:8}}>
        {messages.map((m,i)=> <div key={i} style={{marginBottom:6}}><strong>{m.role}</strong>: {m.text}</div>)}
      </div>
      <div>
        <input value={input} onChange={e=>setInput(e.target.value)} style={{width:'60%'}} onKeyDown={e=>{ if (e.key === 'Enter') sendMessage() }} />
        <button onClick={sendMessage} style={{marginLeft:8}}>Send</button>
        <button onClick={getRecommendations} style={{marginLeft:8}}>Get Recommendations</button>
      </div>
      {warning && <p style={{color:'red'}}>{warning}</p>}
    </div>
  )
}
