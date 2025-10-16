import { useState } from 'react'
import Link from 'next/link'
import ChatBox from '../src/components/ChatBox'

export default function Tracker() {
  const [dietGoals, setDietGoals] = useState(['Eat more vegetables'])
  const [mentalGoals, setMentalGoals] = useState(['Practice 5 minutes mindfulness'])
  const [weeklyGoal, setWeeklyGoal] = useState('Walk 3x this week')
  const [newDiet, setNewDiet] = useState('')
  const [newMental, setNewMental] = useState('')

  function addDiet() {
    if (!newDiet.trim()) return
    setDietGoals(g=>[...g,newDiet.trim()])
    setNewDiet('')
  }
  function addMental() {
    if (!newMental.trim()) return
    setMentalGoals(g=>[...g,newMental.trim()])
    setNewMental('')
  }

  const pageStyle = { padding:20, background: 'linear-gradient(180deg,#eafbea,#dff6e6)', minHeight: '100vh' }
  const card = { background: '#ffffffcc', padding:16, borderRadius:10, boxShadow: '0 4px 10px rgba(4,60,30,0.05)', marginBottom:12 }
  const primaryBtn = { background: '#0b8457', color:'white', padding:'10px 14px', borderRadius:8, border:'none' }

  return (
    <div style={pageStyle}>
      <header style={{textAlign:'center', marginBottom:18}}>
        <h1 style={{margin:0, color:'#0b8457'}}>Your Tracker</h1>
        <p style={{color:'#1f7a4f'}}>Set weekly goals and track diet and mental wellbeing.</p>
      </header>

      <main style={{display:'grid', gridTemplateColumns: '1fr 380px', gap:18}}>
        <section>
          <div style={card}>
            <h3 style={{color:'#0b8457'}}>Diet Goals</h3>
            <ul>
              {dietGoals.map((d,i)=>(<li key={i}>{d}</li>))}
            </ul>
            <div style={{display:'flex', gap:8}}>
              <input value={newDiet} onChange={e=>setNewDiet(e.target.value)} placeholder="Add diet improvement" />
              <button style={primaryBtn} onClick={addDiet}>Add</button>
            </div>
          </div>

          <div style={card}>
            <h3 style={{color:'#0b8457'}}>Mental Health Goals</h3>
            <ul>
              {mentalGoals.map((m,i)=>(<li key={i}>{m}</li>))}
            </ul>
            <div style={{display:'flex', gap:8}}>
              <input value={newMental} onChange={e=>setNewMental(e.target.value)} placeholder="Add mental wellbeing goal" />
              <button style={primaryBtn} onClick={addMental}>Add</button>
            </div>
          </div>

          <div style={card}>
            <h3 style={{color:'#0b8457'}}>Weekly Goal</h3>
            <input value={weeklyGoal} onChange={e=>setWeeklyGoal(e.target.value)} style={{width:'100%'}} />
          </div>
        </section>

        <aside>
          <div style={card}>
            <h3 style={{color:'#0b8457'}}>Chat</h3>
            <p style={{marginTop:0}}>Talk to the bot about what you ate today or how you're feeling.</p>
            <ChatBox />
          </div>

          <div style={card}>
            <h4 style={{color:'#0b8457'}}>Quick Links</h4>
            <p><Link href="/">Back to Home</Link></p>
            <p><Link href="/signup">Edit Signup</Link></p>
          </div>
        </aside>
      </main>
    </div>
  )
}
