import { useState, useEffect } from 'react'

export default function MoodTracker({ user, onMoodChange, onShowToast }) {
  const [todayMood, setTodayMood] = useState(null)
  const [history, setHistory] = useState([])

  function keyFor(userId, dateStr) { return `mf_mood_${userId}_${dateStr}` }
  function noteKey(userId, dateStr) { return `mf_mood_note_${userId}_${dateStr}` }

  useEffect(() => {
    if (!user) { setTodayMood(null); setHistory([]); return }
    const now = new Date()
    const today = now.toISOString().slice(0,10)
    const raw = localStorage.getItem(keyFor(user.id, today))
    if (raw) setTodayMood(Number(raw))
    // load last 7 days
    const days = []
    for (let i=6;i>=0;i--) {
      const d = new Date(); d.setDate(d.getDate()-i)
      const ds = d.toISOString().slice(0,10)
      const v = localStorage.getItem(keyFor(user.id, ds))
      days.push({ date: ds, value: v?Number(v):null })
    }
    // also load notes
    const withNotes = days.map(d => ({ ...d, note: localStorage.getItem(noteKey(user.id, d.date)) || '' }))
    setHistory(withNotes)
  }, [user])

  function saveMood(value) {
    if (!user) return onShowToast ? onShowToast('Please sign up or log in to save your mood') : console.warn('Please sign up or log in to save your mood')
    const now = new Date(); const today = now.toISOString().slice(0,10)
    try {
      localStorage.setItem(keyFor(user.id, today), String(value))
      setTodayMood(value)
      // update history
      const next = history.map(h => h.date === today ? { ...h, value } : h)
      setHistory(next)
      if (onMoodChange) onMoodChange(next)
    } catch (e) { /* ignore */ }
  }

  function saveNoteFor(date, text) {
    if (!user) return onShowToast ? onShowToast('Please sign up or log in to save notes') : console.warn('Please sign up or log in to save notes')
    try {
      localStorage.setItem(noteKey(user.id, date), text||'')
      setHistory(h => h.map(x => x.date===date ? { ...x, note: text } : x))
    } catch (e) { /* ignore */ }
  }

  return (
    <div>
      <h4>Mood Tracker</h4>
      <p className="note">Tap a mood for today (1 low — 5 high)</p>
      <div style={{display:'flex', gap:8}}>
        {[1,2,3,4,5].map(v => (
          <button key={v} className={`moodBtn ${todayMood===v? 'selected':''}`} onClick={()=>saveMood(v)}>{['😞','😐','🙂','😊','😄'][v-1]}</button>
        ))}
      </div>
      <div style={{marginTop:8}}>
        <small className="note">7-day mood history</small>
        <div style={{marginTop:6}}>
          {history.map(h => (
            <div key={h.date} style={{display:'flex', flexDirection:'column', gap:6, padding:'6px 0', borderBottom:'1px solid #eef7ef'}}>
              <div style={{display:'flex', justifyContent:'space-between', gap:8}}>
                <div style={{color:'#065a2b'}}>{h.date}</div>
                <div>{h.value? ['😞','😐','🙂','😊','😄'][h.value-1] : '—'}</div>
              </div>
              <div>
                <textarea placeholder="Add a short note" value={h.note||''} onChange={e=> setHistory(prev => prev.map(p=> p.date===h.date ? { ...p, note: e.target.value } : p))} style={{width:'100%', minHeight:44, padding:8, borderRadius:6, border:'1px solid #e6f7ef'}} />
                <div style={{marginTop:6}}>
                  <button className="small" onClick={()=>saveNoteFor(h.date, h.note)}>Save note</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
