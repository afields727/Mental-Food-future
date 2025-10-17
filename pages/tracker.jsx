import { useState, useEffect } from 'react'
import Link from 'next/link'
import ChatBox from '../src/components/ChatBox'
import MoodTracker from '../src/components/MoodTracker'
import ProgressChart from '../src/components/ProgressChart'
import Reminders from '../src/components/Reminders'
import Toast from '../src/components/Toast'

// Recipes defined at module scope so they're available during render and
// not redeclared inside the component (prevents initialization errors).
const RECIPES = [
  { id: 'r1', title: 'Simple Veggie Stir-Fry', ingredients: ['Broccoli','Carrot','Bell pepper','Soy sauce','Garlic','Rice'], steps: ['Chop vegetables','Stir-fry in oil 5-7 min','Add sauce','Serve with rice'] },
  { id: 'r2', title: 'Banana Oat Pancakes', ingredients: ['Banana','Rolled oats','Egg','Baking powder','Milk','Maple syrup'], steps: ['Blend banana + oats + egg','Cook on skillet','Serve with syrup'] },
  { id: 'r3', title: 'Tomato Basil Pasta', ingredients: ['Pasta','Tomato','Garlic','Basil','Olive oil','Parmesan'], steps: ['Boil pasta','Saute garlic and tomato','Toss with basil and pasta','Top with parmesan'] },
  { id: 'r4', title: 'Simple Banana Bread (Bake)', ingredients: ['Banana','Flour','Sugar','Baking soda','Egg','Butter'], steps: ['Mash bananas','Mix dry + wet','Pour into loaf pan','Bake 50-60 min at 350°F'] },
  { id: 'r5', title: 'Oatmeal Raisin Cookies (Bake)', ingredients: ['Rolled oats','Flour','Brown sugar','Butter','Egg','Raisins'], steps: ['Mix ingredients','Spoon onto tray','Bake 10-12 min at 350°F'] },
  { id: 'r6', title: 'Simple Baked Apples (Bake)', ingredients: ['Apple','Cinnamon','Oats','Butter','Honey'], steps: ['Core apples','Fill with oats+cinnamon','Bake 25-30 min at 375°F'] }
]

export default function Tracker() {
  const [user, setUser] = useState(null)
  const [dietGoals, setDietGoals] = useState(['Eat more vegetables'])
  const [mentalGoals, setMentalGoals] = useState(['Practice 5 minutes mindfulness'])
  const [weeklyGoal, setWeeklyGoal] = useState('Walk 3x this week')
  const [newDiet, setNewDiet] = useState('')
  const [newMental, setNewMental] = useState('')
  const [userLoaded, setUserLoaded] = useState(false)
  const [welcomeMessage, setWelcomeMessage] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem('mf_user')
    if (raw) {
      try { setUser(JSON.parse(raw)) } catch (e) { setUser(null) }
    } else {
      // Create a persistent local user so the app behaves like a real website
      // and user actions persist across reloads (not a 'demo' mode).
      try {
        const anon = { id: 'local_user', name: 'You', email: '', createdAt: Date.now(), allergies: [] }
        localStorage.setItem('mf_user', JSON.stringify(anon))
        setUser(anon)
      } catch (e) {
        setUser(null)
      }
    }
    setUserLoaded(true)
  }, [])

  

  

  

  // set a friendly welcome message for new vs returning users
  useEffect(() => {
    if (!user) { setWelcomeMessage(''); return }
    try {
      const seenKey = `mf_seen_${user.id}`
      const seen = localStorage.getItem(seenKey)
      if (!seen) {
        setWelcomeMessage(`Welcome, ${user.name || user.email || 'friend'}!`)
        localStorage.setItem(seenKey, Date.now())
      } else {
        setWelcomeMessage(`Welcome back, ${user.name || user.email || 'friend'}!`)
      }
    } catch (e) { setWelcomeMessage(`Welcome, ${user.name || user.email || 'friend'}!`) }
  }, [user])

  // Goal functions that persist are defined later (to ensure persistence to localStorage)


  // Fuzzy allergy matching helpers: normalization, simple synonyms, and substring checks.
  function normalizeText(s) {
    return (s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
  }

  const ALLERGY_SYNONYMS = {
    peanut: ['peanut', 'peanut butter', 'groundnut', 'peanuts'],
    milk: ['milk', 'dairy', 'whole milk', 'skim milk'],
    egg: ['egg', 'eggs', 'egg white', 'egg yolk'],
    wheat: ['wheat', 'flour', 'whole wheat', 'bread'],
    shrimp: ['shrimp', 'prawn', 'prawns'],
    soy: ['soy', 'soya', 'soy sauce', 'tofu'],
    salmon: ['salmon', 'fish', 'trout'],
    almond: ['almond', 'almond butter', 'almonds'],
    cashew: ['cashew', 'cashews'],
    shellfish: ['shellfish', 'crab', 'lobster', 'mussel', 'clams']
  }

  function allergyToTokens(allergy) {
    const norm = normalizeText(allergy)
    const base = norm.split(' ')[0] || norm
    const syn = ALLERGY_SYNONYMS[base] || []
    const tokens = new Set([norm, base, ...syn.map(s => normalizeText(s))])
    return tokens
  }

  function ingredientMatchesAnyAllergy(ingredient, allergies) {
    const ing = normalizeText(ingredient)
    if (!ing) return false
    for (const a of allergies) {
      const tokens = allergyToTokens(a)
      for (const t of tokens) {
        if (!t) continue
        // exact or substring both ways to catch 'peanut butter' vs 'peanut'
        if (ing === t || ing.includes(t) || t.includes(ing)) return true
        // also check word boundaries: token appears as separate word
        const re = new RegExp('\\b' + t.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&') + '\\b')
        if (re.test(ing)) return true
      }
    }
    return false
  }

  // Compute allowed recipes by excluding any recipe that contains an ingredient
  // that the user flagged as allergic (use fuzzy matching above)
  const allowedRecipes = (() => {
    if (!user || user.skipAllergies) return RECIPES
    const userAllergies = (user.allergies || [])
    if (!userAllergies || userAllergies.length === 0) return RECIPES
    return RECIPES.filter(r => !(r.ingredients || []).some(ing => ingredientMatchesAnyAllergy(ing, userAllergies)))
  })()

  // Compute which recipes were excluded and the matching allergy reasons
  const excludedInfo = (() => {
    if (!user || user.skipAllergies) return []
    const userAllergies = (user.allergies || [])
    const out = []
    for (const r of RECIPES) {
      const matches = []
      for (const ing of (r.ingredients || [])) {
        for (const a of userAllergies) {
          if (ingredientMatchesAnyAllergy(ing, [a])) {
            matches.push({ ingredient: ing, allergy: a })
          }
        }
      }
      if (matches.length > 0) out.push({ id: r.id, title: r.title, matches })
    }
    return out
  })()

  // Listen for chat-sent requests to open a recipe in the tracker (placed after RECIPES)
  useEffect(() => {
    function handler(e) {
      try {
        const id = e?.detail?.id
        if (!id) return
        const r = RECIPES.find(x => x.id === id)
        if (r) { setSelectedRecipe(r); setAiAdvice(''); setPriceEstimate(null) }
      } catch (err) { /* ignore */ }
    }
    window.addEventListener('mf_open_recipe', handler)
    return () => window.removeEventListener('mf_open_recipe', handler)
  }, [user])

  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [locationInput, setLocationInput] = useState('')
  const [priceEstimate, setPriceEstimate] = useState(null)
  const [priceLoading, setPriceLoading] = useState(false)
  const [aiAdvice, setAiAdvice] = useState('')

  // persistence
  const [favorites, setFavorites] = useState([])
  const [savedEstimates, setSavedEstimates] = useState([])
  const [toast, setToast] = useState('')
  function showToast(msg){ setToast(msg); setTimeout(()=> setToast(''), 4500) }

  // Simple fallback prices per ingredient (USD approximate)
  const FALLBACK_PRICES = {
    'Broccoli': 1.5,'Carrot':0.5,'Bell pepper':1.0,'Soy sauce':2.5,'Garlic':0.2,'Rice':1.0,
    'Banana':0.3,'Rolled oats':1.2,'Egg':0.2,'Baking powder':0.1,'Milk':0.8,'Maple syrup':2.0,
    'Pasta':1.0,'Tomato':0.8,'Basil':0.5,'Olive oil':3.0,'Parmesan':2.5
  }

  // Simple location multipliers and currency settings
  const LOCATION_PRESETS = [
    { match: ['uk','gb','united kingdom','london'], currency: 'GBP', multiplier: 1.2, locale: 'en-GB' },
    { match: ['canada','ca','toronto','vancouver'], currency: 'CAD', multiplier: 1.1, locale: 'en-CA' },
    { match: ['euro','france','germany','de','fr','paris','europe'], currency: 'EUR', multiplier: 1.1, locale: 'en-IE' },
    { match: ['australia','au','sydney','melbourne'], currency: 'AUD', multiplier: 1.3, locale: 'en-AU' }
  ]

  function detectLocationSettings(locationText) {
    const raw = (locationText||'').toLowerCase()
    for (const preset of LOCATION_PRESETS) {
      for (const token of preset.match) if (raw.includes(token)) return preset
    }
    return { currency: 'USD', multiplier: 1.0, locale: 'en-US' }
  }

  async function estimatePriceForRecipe(recipe) {
    setPriceEstimate(null)
    setPriceLoading(true)
    const ingredients = recipe.ingredients || []

    try {
      // Try server OpenAI endpoint to ask for local price estimates
      const prompt = `Estimate approximate local prices (in USD) for the following ingredients in ${locationInput || 'my area'}: ${ingredients.join(', ')}. Provide a short breakdown and total.`
      const resp = await fetch('/api/openai/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ prompt }) })
      if (resp.ok) {
        const j = await resp.json()
        setPriceEstimate(j.result || 'No estimate returned')
        setPriceLoading(false)
        return
      }
    } catch (err) {
      // fall through to fallback
    }

    // Fallback local calculation with basic location sensitivity
    const subtotal = ingredients.reduce((sum,ing)=> sum + (FALLBACK_PRICES[ing] || 1.0), 0)
    const preset = detectLocationSettings(locationInput)
    const total = subtotal * preset.multiplier
    // format currency using detected locale and currency
    let formatted = total.toFixed(2)
    try { formatted = new Intl.NumberFormat(preset.locale || navigator.language || 'en-US', { style:'currency', currency: preset.currency || 'USD' }).format(total) } catch(e){}
    const breakdown = ingredients.map(ing => `${ing}: ${(FALLBACK_PRICES[ing]||1.0).toFixed(2)} USD`).join('\n')
    setPriceEstimate(`Fallback estimate for ${locationInput || 'your area'} (${preset.currency || 'USD'}):\n${breakdown}\nTotal: ${formatted}`)
    setPriceLoading(false)
  }

  async function getAiAdviceForRecipe(recipe) {
    setAiAdvice('Thinking…')
    try {
      const prompt = `Given the recipe titled "${recipe.title}" with ingredients: ${recipe.ingredients.join(', ')}. Suggest healthier substitutions, portion tips, and quick swaps to make it more allergy-friendly. Keep the answer short and actionable.`
      const resp = await fetch('/api/openai/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ prompt }) })
      if (resp.ok) {
        const j = await resp.json()
        setAiAdvice(j.result || 'No advice returned')
        return
      }
    } catch (err) {
      // ignore
    }
    // fallback simple advice
    setAiAdvice('Try increasing vegetables, using whole grains, and reducing added sugars — swap oil for steaming when possible.')
  }

  // --- Persistence: favorites & saved estimates per user (localStorage) ---
  useEffect(() => {
    if (!user) { setFavorites([]); setSavedEstimates([]); return }
    const key = `mf_data_${user.id}`
    const raw = localStorage.getItem(key)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        setFavorites(parsed.favorites || [])
        setSavedEstimates(parsed.estimates || [])
        setDietGoals(parsed.dietGoals || ['Eat more vegetables'])
        setMentalGoals(parsed.mentalGoals || ['Practice 5 minutes mindfulness'])
        setWeeklyGoal(parsed.weeklyGoal || 'Walk 3x this week')
      } catch (e) {
        setFavorites([])
        setSavedEstimates([])
      }
    } else {
      setFavorites([])
      setSavedEstimates([])
    }
  }, [user])

  function persistUserData(nextFavorites, nextEstimates, nextDietGoals, nextMentalGoals, nextWeeklyGoal) {
    if (!user) return
    const key = `mf_data_${user.id}`
    const payload = {
      favorites: nextFavorites || favorites,
      estimates: nextEstimates || savedEstimates,
      dietGoals: nextDietGoals || dietGoals,
      mentalGoals: nextMentalGoals || mentalGoals,
      weeklyGoal: nextWeeklyGoal || weeklyGoal
    }
    try { localStorage.setItem(key, JSON.stringify(payload)) } catch (e) { /* ignore */ }
  }

  function toggleFavorite(recipe) {
    const exists = favorites.find(f=>f.id===recipe.id)
    const next = exists ? favorites.filter(f=>f.id!==recipe.id) : [...favorites, { id: recipe.id, title: recipe.title }]
    setFavorites(next)
    persistUserData(next, null)
  }

  function saveEstimateForSelected() {
    if (!selectedRecipe || !priceEstimate) return showToast('Select a recipe and estimate price first')
    const entry = { id: selectedRecipe.id, title: selectedRecipe.title, estimate: priceEstimate, location: locationInput || '', ts: Date.now() }
    const next = [entry, ...savedEstimates].slice(0,20)
    setSavedEstimates(next)
    persistUserData(null, next)
  }

  function removeSavedEstimate(idx) {
    const next = savedEstimates.filter((_,i)=>i!==idx)
    setSavedEstimates(next)
    persistUserData(null, next)
  }

  // Update diet/mental persistence on changes
  function addDiet() {
    if (!newDiet.trim()) return
    const next = [...dietGoals, newDiet.trim()]
    setDietGoals(next)
    setNewDiet('')
    persistUserData(null, null, next, null, null)
  }
  function removeDiet(idx) { const next = dietGoals.filter((_,i)=>i!==idx); setDietGoals(next); persistUserData(null,null,next,null,null) }
  function addMental() {
    if (!newMental.trim()) return
    const next = [...mentalGoals, newMental.trim()]
    setMentalGoals(next)
    setNewMental('')
    persistUserData(null, null, null, next, null)
  }
  function removeMental(idx) { const next = mentalGoals.filter((_,i)=>i!==idx); setMentalGoals(next); persistUserData(null,null,null,next,null) }

  // Persist weekly goal whenever it changes
  useEffect(() => {
    if (!user) return
    persistUserData(null, null, null, null, weeklyGoal)
  }, [weeklyGoal, user])

  return (
    <div className="container">
      <header style={{textAlign:'center', marginBottom:18}}>
        <h1 className="welcome">{welcomeMessage || 'Your Tracker'}</h1>
        <p className="note">Set weekly goals and track diet and mental wellbeing.</p>
        {user ? (
          <div style={{marginTop:8}}>
            <strong className="welcome">Welcome, {user.name || user.email}</strong>
            <button onClick={() => { localStorage.removeItem('mf_user'); setUser(null); window.location = '/' }} style={{marginLeft:12}}>Sign Out</button>
          </div>
        ) : (
          <div style={{marginTop:8}}><em className="note">No local user detected — sign up or login</em></div>
        )}
      </header>
      {toast && <Toast message={toast} onClose={()=>setToast('')} />}

      <main className="grid-two">
        <section>
          <div className="card">
            <h3>Recipes to Cook or Bake</h3>
            <p>Choose a recipe and get an AI-guided suggestion and price estimate for your area.</p>
            <div style={{display:'flex', gap:8, marginBottom:8}}>
              {allowedRecipes.map(r => (
                <button key={r.id} onClick={() => { setSelectedRecipe(r); setPriceEstimate(null); setAiAdvice('') }} className={`pillBtn ${selectedRecipe?.id===r.id? 'selected':''}`}>{r.title}</button>
              ))}
            </div>
            {/* Hidden recipes info toggle */}
            {excludedInfo.length > 0 && (
              <details style={{marginTop:6}}>
                <summary style={{cursor:'pointer'}}>Hidden recipes ({excludedInfo.length}) — why they were filtered</summary>
                <div style={{marginTop:8}}>
                  {excludedInfo.map(info => (
                    <div key={info.id} style={{padding:8, borderBottom:'1px dashed #eee'}}>
                      <strong>{info.title}</strong>
                      <div style={{fontSize:13, marginTop:6}}>
                        {info.matches.map((m, i) => (
                          <div key={i} style={{color:'#a33'}}>Allergy match: {m.allergy} — ingredient: {m.ingredient}</div>
                        ))}
                      </div>
                      <div style={{marginTop:6}}>
                        <button className="small" onClick={() => {
                          const r = RECIPES.find(x=>x.id===info.id)
                          if (r) { setSelectedRecipe(r); setPriceEstimate(null); setAiAdvice('') }
                        }}>Open anyway</button>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            )}

            {selectedRecipe && (
              <div>
                <h4 style={{marginBottom:6}}>{selectedRecipe.title}</h4>
                <strong>Ingredients</strong>
                <ul>
                  {selectedRecipe.ingredients.map((ing,i)=>(<li key={i}>{ing}</li>))}
                </ul>
                <strong>Steps</strong>
                <ol>
                  {selectedRecipe.steps.map((s,i)=>(<li key={i}>{s}</li>))}
                </ol>

                <div style={{marginTop:8}}>
                  <input className="input" placeholder="Enter your city or country for local price estimate" value={locationInput} onChange={e=>setLocationInput(e.target.value)} style={{width:'60%'}} />
                  <button className="primary" style={{marginLeft:8}} onClick={() => estimatePriceForRecipe(selectedRecipe)}>{priceLoading? 'Estimating...':'Estimate Price'}</button>
                </div>

                {priceEstimate && (
                  <pre style={{background:'#f6fff6', padding:8, marginTop:8, borderRadius:6, whiteSpace:'pre-wrap'}}>{priceEstimate}</pre>
                )}

                <div style={{marginTop:8}}>
                  <button className="primary" onClick={()=>getAiAdviceForRecipe(selectedRecipe)}>Get AI advice for healthier swaps</button>
                  {aiAdvice && <div style={{marginTop:8, background:'#fff', padding:8, borderRadius:6}}>{aiAdvice}</div>}
                </div>
              </div>
            )}
          </div>
          <div className="card">
            <h3>Diet Goals</h3>
            <ul>
              {dietGoals.map((d,i)=>(<li key={i}>{d} <button className="small" style={{marginLeft:8}} onClick={()=>removeDiet(i)}>Remove</button></li>))}
            </ul>
            <div style={{display:'flex', gap:8}}>
              <input className="input" value={newDiet} onChange={e=>setNewDiet(e.target.value)} placeholder="Add diet improvement" />
              <button className="primary" onClick={addDiet}>Add</button>
            </div>
          </div>

          <div className="card">
            <h3>Mental Health Goals</h3>
            <ul>
              {mentalGoals.map((m,i)=>(<li key={i}>{m} <button className="small" style={{marginLeft:8}} onClick={()=>removeMental(i)}>Remove</button></li>))}
            </ul>
            <div style={{display:'flex', gap:8}}>
              <input className="input" value={newMental} onChange={e=>setNewMental(e.target.value)} placeholder="Add mental wellbeing goal" />
              <button className="primary" onClick={addMental}>Add</button>
            </div>
          </div>

          <div className="card">
            <h3>Weekly Goal</h3>
            <input className="input" value={weeklyGoal} onChange={e=>setWeeklyGoal(e.target.value)} />
          </div>
        </section>

        <aside>
          <div className="card">
            <h3>Chat</h3>
            <p style={{marginTop:0}}>Talk to the bot about what you ate today or how you're feeling.</p>
            <ChatBox allowedRecipes={allowedRecipes} initialUserAllergies={user?.allergies || []} />
          </div>

          <div className="card">
            <MoodTracker user={user} onMoodChange={()=>{}} />
          </div>

          <div className="card">
            <ProgressChart user={user} />
          </div>

          <div className="card">
            <Reminders user={user} />
          </div>

          <div className="card">
            <h4>Saved favorites</h4>
            {favorites.length === 0 ? (
              <p className="note">No favorites yet — mark a recipe as favorite to save it.</p>
            ) : (
              <ul>
                {favorites.map((f,idx) => (
                  <li key={f.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:8}}>
                    <span>{f.title}</span>
                    <div>
                      <button className="small" onClick={() => {
                        const r = RECIPES.find(x=>x.id===f.id)
                        if (r) { setSelectedRecipe(r); setAiAdvice(''); setPriceEstimate(null) }
                      }}>Open</button>
                      <button className="small" style={{marginLeft:8}} onClick={() => {
                        const next = favorites.filter(x=>x.id!==f.id); setFavorites(next); persistUserData(next,null)
                      }}>Remove</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <h4>Saved estimates</h4>
            {savedEstimates.length === 0 ? (
              <p className="note">No saved price estimates.</p>
            ) : (
              <ul>
                {savedEstimates.map((s,idx) => (
                  <li key={s.ts} style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8}}>
                    <div style={{flex:1}}>
                      <strong>{s.title}</strong>
                      <div style={{fontSize:'0.9rem'}}>{s.location ? `Location: ${s.location}` : ''}</div>
                      <pre style={{whiteSpace:'pre-wrap', margin:6}}>{s.estimate}</pre>
                    </div>
                    <div style={{display:'flex', flexDirection:'column', gap:6}}>
                      <button className="small" onClick={() => {
                        const r = RECIPES.find(x=>x.id===s.id)
                        if (r) { setSelectedRecipe(r); setLocationInput(s.location||''); setPriceEstimate(s.estimate); setAiAdvice('') }
                      }}>Load</button>
                      <button className="small" onClick={() => removeSavedEstimate(idx)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <h4>Quick Links</h4>
            <p><Link href="/">Back to Home</Link></p>
            <p><Link href="/signup">Edit Signup</Link></p>
          </div>
        </aside>
      </main>
    </div>
  )
}
