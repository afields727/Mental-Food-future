import { useState, useEffect, useRef } from 'react'
import Toast from './Toast'

export default function Reminders({ user }) {
  const [quietHours, setQuietHours] = useState(false)
  const [remindersEnabled, setRemindersEnabled] = useState(true)
  const [scheduled, setScheduled] = useState([])
  const timersRef = useRef([])
  const [editingId, setEditingId] = useState(null)
  const [editWhen, setEditWhen] = useState('')
  const [editMsg, setEditMsg] = useState('')
  const [editRec, setEditRec] = useState('none')
  const [useSpecificTime, setUseSpecificTime] = useState(false)
  const [specificWhen, setSpecificWhen] = useState('')
  const [toast, setToast] = useState('')

  function showToast(msg){ setToast(msg); setTimeout(()=>setToast(''), 4500) }

  useEffect(()=>{
    if (!user) return
    const q = localStorage.getItem(`mf_quiet_${user.id}`)
    const r = localStorage.getItem(`mf_reminders_${user.id}`)
    setQuietHours(!!q)
    setRemindersEnabled(r !== '0')
    // load scheduled reminders
    try {
      const raw = localStorage.getItem(`mf_sched_${user.id}`)
      const parsed = raw ? JSON.parse(raw) : []
      setScheduled(parsed)
    } catch(e){ setScheduled([]) }
  },[user])

  function toggleQuiet() {
    if (!user) return showToast('Please sign up to save preferences')
    setQuietHours(q=>{ const next=!q; localStorage.setItem(`mf_quiet_${user.id}`, next? '1': ''); return next })
  }
  function toggleReminders() {
    if (!user) return showToast('Please sign up to save preferences')
    setRemindersEnabled(r=>{ const next=!r; localStorage.setItem(`mf_reminders_${user.id}`, next? '1': '0'); return next })
  }

  function sendQuick(msg) {
    if (!remindersEnabled) return showToast('Reminders are currently off')
    showToast(msg)
  }

  // scheduling helpers (works while app is open)
  function persistScheduled(list) {
    if (!user) return
    try { localStorage.setItem(`mf_sched_${user.id}`, JSON.stringify(list)) } catch(e){}
  }

  function normalizeFuture(item) {
    const it = { ...item }
    let ms = new Date(it.when).getTime() - Date.now()
    if (ms > 0) return it
    // advance for recurring items
    if (it.recurrence === 'daily') {
      while (ms <= 0) { it.when = new Date(new Date(it.when).getTime() + 24*60*60*1000).toISOString(); ms = new Date(it.when).getTime() - Date.now() }
      return it
    }
    if (it.recurrence === 'weekly') {
      while (ms <= 0) { it.when = new Date(new Date(it.when).getTime() + 7*24*60*60*1000).toISOString(); ms = new Date(it.when).getTime() - Date.now() }
      return it
    }
    return it
  }

  function toLocalInputISOString(src) {
    const dt = new Date(src)
    if (isNaN(dt.getTime())) return ''
    const pad = n => String(n).padStart(2, '0')
    const YYYY = dt.getFullYear()
    const MM = pad(dt.getMonth() + 1)
    const DD = pad(dt.getDate())
    const hh = pad(dt.getHours())
    const mm = pad(dt.getMinutes())
    return `${YYYY}-${MM}-${DD}T${hh}:${mm}`
  }

  const nowMin = toLocalInputISOString(new Date())
  const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  const offsetMinutes = -new Date().getTimezoneOffset()
  const offsetSign = offsetMinutes >= 0 ? '+' : '-'
  const offsetHours = String(Math.floor(Math.abs(offsetMinutes)/60)).padStart(2,'0')
  const offsetMins = String(Math.abs(offsetMinutes)%60).padStart(2,'0')
  const tzHint = `${tzName} (UTC${offsetSign}${offsetHours}:${offsetMins})`
  const isSpecificValid = (() => {
    if (!specificWhen) return false
    const d = new Date(specificWhen)
    return !isNaN(d.getTime()) && d.getTime() > Date.now()
  })()
  const isEditValid = (() => {
    if (!editWhen) return false
    const d = new Date(editWhen)
    return !isNaN(d.getTime()) && d.getTime() > Date.now()
  })()

  function startEdit(item) {
    setEditingId(item.id)
    setEditMsg(item.msg || '')
    setEditRec(item.recurrence || 'none')
    setEditWhen(toLocalInputISOString(item.when))
  }

  function cancelEdit() {
    setEditingId(null)
    setEditMsg('')
    setEditRec('none')
    setEditWhen('')
  }

  function saveEdit() {
    if (!editingId) return
    if (!user) return showToast('Sign up to save scheduled reminders')
    const whenDate = new Date(editWhen)
    if (isNaN(whenDate.getTime())) return showToast('Please provide a valid date/time')
    if (whenDate.getTime() <= Date.now()) return showToast('Please choose a future date/time')
    const whenIso = whenDate.toISOString()
    const next = scheduled.map(s => s.id === editingId ? { ...s, msg: editMsg, when: whenIso, recurrence: editRec } : s)
    setScheduled(next)
    persistScheduled(next)
    scheduleAll(next)
    cancelEdit()
  }

  function scheduleAll(list) {
    // clear previous
    timersRef.current.forEach(t=> clearTimeout(t))
    timersRef.current = []
    list.forEach(item => {
      const norm = normalizeFuture(item)
      const ms = new Date(norm.when).getTime() - Date.now()
      if (ms > 0) {
        const id = setTimeout(()=> handleFire(norm), ms)
        timersRef.current.push(id)
      }
    })
  }

  function handleFire(firedItem) {
    // show toast if allowed
    if (remindersEnabled && !quietHours) showToast(firedItem.msg)
    // update state depending on recurrence
    if (firedItem.recurrence === 'daily' || firedItem.recurrence === 'weekly') {
      setScheduled(prev => {
        const next = prev.map(p => {
          if (p.id !== firedItem.id) return p
          const interval = p.recurrence === 'daily' ? 24*60*60*1000 : 7*24*60*60*1000
          const nextWhen = new Date(new Date(p.when).getTime() + interval).toISOString()
          return { ...p, when: nextWhen }
        })
        persistScheduled(next)
        // reschedule updated items
        scheduleAll(next)
        return next
      })
    } else {
      // remove non-recurring fired item
      removeScheduled(firedItem.id)
    }
  }

  useEffect(()=>{
    if (!user) return
    scheduleAll(scheduled)
    return ()=> {
      try {
        timersRef.current.forEach(t => clearTimeout(t))
      } catch(e){}
      timersRef.current = []
    }
  }, [user, scheduled, remindersEnabled, quietHours])

  function addScheduled(msg, minutesFromNow, recurrence='none') {
    if (!user) return showToast('Sign up to save scheduled reminders')
    const mins = Math.max(0, Number(minutesFromNow) || 0)
    if (mins <= 0) {
      // allow zero as immediate but disallow negative
    }
    const when = new Date(Date.now() + mins*60000).toISOString()
    const next = [{ id: Date.now(), msg, when, recurrence }, ...scheduled]
    setScheduled(next)
    persistScheduled(next)
    scheduleAll(next)
  }

  function addScheduledWithWhen(msg, datetimeLocalValue, recurrence='none'){
    if (!user) return showToast('Sign up to save scheduled reminders')
    try {
      const dt = new Date(datetimeLocalValue)
      if (isNaN(dt.getTime())) return showToast('Invalid date/time')
      if (dt.getTime() <= Date.now()) return showToast('Please pick a future date/time')
      const whenIso = dt.toISOString()
      const next = [{ id: Date.now(), msg, when: whenIso, recurrence }, ...scheduled]
      setScheduled(next)
      persistScheduled(next)
      scheduleAll(next)
    } catch(e){ showToast('Invalid date/time') }
  }

  function removeScheduled(id) { const next = scheduled.filter(s=>s.id!==id); setScheduled(next); persistScheduled(next) }

  return (
    <div>
      <h4>Reminders</h4>
      <div style={{display:'flex', gap:8, alignItems:'center'}}>
        <label className="small"><input type="checkbox" checked={remindersEnabled} onChange={toggleReminders} /> Enable reminders</label>
        <label className="small"><input type="checkbox" checked={quietHours} onChange={toggleQuiet} /> Quiet hours</label>
      </div>
      <div style={{marginTop:8}}>
        <button className="small" onClick={()=>sendQuick('Hydrate!')}>Hydrate!</button>
        <button className="small" style={{marginLeft:8}} onClick={()=>sendQuick('Take a mindful pause')}>Mindful pause</button>
      </div>

      <div style={{marginTop:10}}>
        <h5>Schedule a reminder</h5>
        <p className="note">Quick: enter minutes from now and a message</p>
        <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
          <label className="small" style={{display:'flex', alignItems:'center', gap:6}}>
            <input type="checkbox" checked={useSpecificTime} onChange={e=>setUseSpecificTime(e.target.checked)} /> Use specific date/time
          </label>
          {!useSpecificTime ? (
            <input placeholder="Minutes from now" className="input" id="rem-mins" />
          ) : (
            <input type="datetime-local" min={nowMin} className="input" value={specificWhen} onChange={e=>setSpecificWhen(e.target.value)} />
          )}
          <input placeholder="Message" className="input" id="rem-msg" />
          <select id="rem-rec" className="input">
            <option value="none">No repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
          <button className="small" disabled={useSpecificTime ? !isSpecificValid : false} onClick={()=>{
            const msg = document.getElementById('rem-msg').value||'Reminder'
            const rec = document.getElementById('rem-rec').value||'none'
            if (!useSpecificTime) {
              const mins = Number(document.getElementById('rem-mins').value||0)
              addScheduled(msg, mins, rec)
            } else {
              if (!specificWhen) return showToast('Choose a valid date/time')
              addScheduledWithWhen(msg, specificWhen, rec)
            }
            document.getElementById('rem-mins') && (document.getElementById('rem-mins').value='')
            document.getElementById('rem-msg').value=''
            setSpecificWhen('')
            setUseSpecificTime(false)
          }}>Schedule</button>
          {!useSpecificTime ? null : !isSpecificValid ? <small className="note">Please choose a future date/time</small> : null}
        </div>
        <div style={{marginTop:6}}><small className="note">Times shown in your local timezone: {tzHint}</small></div>

        {scheduled.length > 0 && (
          <div style={{marginTop:8}}>
            <h6>Upcoming</h6>
            <ul>
              {scheduled.map(s=> (
                <li key={s.id} style={{display:'flex', justifyContent:'space-between', gap:8, alignItems:'center'}}>
                  {editingId === s.id ? (
                    <div style={{display:'flex', gap:8, alignItems:'center'}}>
                      <input className="input" value={editMsg} onChange={e=>setEditMsg(e.target.value)} />
                      <input type="datetime-local" min={nowMin} className="input" value={editWhen} onChange={e=>setEditWhen(e.target.value)} />
                      <select className="input" value={editRec} onChange={e=>setEditRec(e.target.value)}>
                        <option value="none">No repeat</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                  ) : (
                    <div><strong>{s.msg}</strong><br/><small className="note">{new Date(s.when).toLocaleString()} {s.recurrence && s.recurrence !== 'none' ? `· ${s.recurrence}` : ''}</small></div>
                  )}
                  <div style={{display:'flex', gap:6}}>
                    {editingId === s.id ? (
                      <>
                        <button className="small" disabled={!isEditValid} onClick={saveEdit}>Save</button>
                        <button className="small" onClick={cancelEdit}>Cancel</button>
                        {!isEditValid ? <small className="note" style={{marginLeft:6}}>Pick a future date/time</small> : null}
                      </>
                    ) : (
                      <>
                        <button className="small" onClick={()=>startEdit(s)}>Edit</button>
                        <button className="small" onClick={()=>removeScheduled(s.id)}>Delete</button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
