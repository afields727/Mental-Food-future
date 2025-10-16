import { useState } from 'react'

const SAMPLE_FOODS = {
  fruits: ['Apple','Banana','Orange','Strawberry'],
  vegetables: ['Tomato','Carrot','Spinach','Lettuce'],
  starches: ['Potato','Yam','Cassava'],
  grains: ['Wheat','Barley','Rice']
}

export default function Signup() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [allergies, setAllergies] = useState({})
  const [skipAllergies, setSkipAllergies] = useState(false)
  const [finalConfirmed, setFinalConfirmed] = useState(false)
  const [message, setMessage] = useState('')

  function toggleAllergy(category, item) {
    setAllergies(prev => {
      const key = `${category}:${item}`
      const next = { ...prev }
      if (next[key]) delete next[key]
      else next[key] = true
      return next
    })
  }

  function substitutesFor(item) {
    // naive substitutes map
    const map = {
      'Apple': ['Pear','Peach'],
      'Banana': ['Plantain'],
      'Tomato': ['Bell Pepper'],
      'Potato': ['Sweet Potato']
    }
    return map[item] || ['No clear substitute']
  }

  async function finishSignup() {
    if (!finalConfirmed) {
      setMessage('Please confirm final step before finishing.')
      return
    }

    const allergyList = skipAllergies ? [] : Object.keys(allergies).map(k => {
      const [category,item] = k.split(':')
      return { category, item, allergic: true }
    })

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ name, email, password, allergies: allergyList, skipAllergies })
    })
    const data = await res.json()
    if (res.ok) {
      setMessage('Signup successful: ' + JSON.stringify(data))
      setStep(3)
    } else {
      setMessage(data.error || 'Signup failed')
    }
  }

  return (
    <div style={{padding:20}}>
      <h2>Sign Up (Allergy-first)</h2>
      {step === 0 && (
        <div>
          <h3>Account</h3>
          <div>
            <label>Name</label><br />
            <input value={name} onChange={e=>setName(e.target.value)} />
          </div>
          <div>
            <label>Email</label><br />
            <input value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div>
            <label>Password</label><br />
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <button onClick={()=>setStep(1)}>Next: Allergies</button>
        </div>
      )}

      {step === 1 && (
        <div>
          <h3>Are you allergic to any of these categories?</h3>
          <p>Choose items you are allergic to or use "Not allergic" or "Skip".</p>
          <div style={{marginBottom:10}}>
            <label>
              <input type="checkbox" checked={skipAllergies} onChange={e=>setSkipAllergies(e.target.checked)} /> Skip allergy questions
            </label>
          </div>
          {!skipAllergies && Object.entries(SAMPLE_FOODS).map(([cat,items])=> (
            <div key={cat} style={{marginBottom:8}}>
              <strong>{cat}</strong>
              <div>
                {items.map(item=> {
                  const key = `${cat}:${item}`
                  return (
                    <label key={key} style={{display:'inline-block',marginRight:8}}>
                      <input type="checkbox" checked={!!allergies[key]} onChange={()=>toggleAllergy(cat,item)} /> {item}
                    </label>
                  )
                })}
              </div>
            </div>
          ))}

          <div style={{marginTop:12}}>
            <button onClick={()=>setStep(0)}>Back</button>
            <button onClick={()=>setStep(2)} style={{marginLeft:8}}>Next: Review</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3>Review & Substitutes</h3>
          {skipAllergies ? (
            <p>User chose to skip allergy questions.</p>
          ) : (
            <div>
              {Object.keys(allergies).length === 0 ? (
                <p>No allergies selected. You can go back and choose or select "Not allergic" explicitly.</p>
              ) : (
                <div>
                  <p>Selected allergies will be blocked and substituted where possible:</p>
                  <ul>
                    {Object.keys(allergies).map(k => {
                      const [cat,item] = k.split(':')
                      return (
                        <li key={k}>{item} ({cat}) — substitutes: {substitutesFor(item).join(', ')}</li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div style={{marginTop:12}}>
            <label>
              <input type="checkbox" checked={finalConfirmed} onChange={e=>setFinalConfirmed(e.target.checked)} /> I confirm these choices and want to finish signup
            </label>
          </div>

          <div style={{marginTop:12}}>
            <button onClick={()=>setStep(1)}>Back</button>
            <button onClick={finishSignup} style={{marginLeft:8}}>Finish Signup</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3>Signup complete</h3>
          <p>{message}</p>
        </div>
      )}

      {message && step !== 3 && <p style={{color:'red'}}>{message}</p>}
    </div>
  )
}
