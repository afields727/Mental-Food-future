import { useEffect, useState } from 'react'

export default function ProgressChart({ user }) {
  const [values, setValues] = useState([])

  useEffect(()=>{
    if (!user) { setValues([]); return }
    const days = []
    for (let i=6;i>=0;i--) {
      const d = new Date(); d.setDate(d.getDate()-i)
      const ds = d.toISOString().slice(0,10)
      const v = localStorage.getItem(`mf_mood_${user.id}_${ds}`)
      days.push(v? Number(v): 0)
    }
    setValues(days)
  },[user])

  // simple bar chart
  const max = Math.max(...values,5)

  return (
    <div>
      <h4>7-day Mood Chart</h4>
      <div style={{display:'flex', gap:6, alignItems:'end', height:80}}>
        {values.map((v,i)=> (
          <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center'}}>
            <div style={{width:'70%', background:'#e6f7ef', height: (v? (v/max)*100 : 6) + '%', borderRadius:6}}></div>
            <small style={{marginTop:6}}>{v||'—'}</small>
          </div>
        ))}
      </div>
    </div>
  )
}
