import { useState, useEffect } from 'react';
import Link from 'next/link';
import Toast from '../src/components/Toast';
import Navigation from '../src/components/Navigation';

// Recipes defined at module scope so they're available during render and
// not redeclared inside the component (prevents initialization errors).
const RECIPES = [
  { id: 'r1', title: 'Simple Veggie Stir-Fry', ingredients: ['1 head Broccoli','2 Carrots','1 Bell pepper','1/4 cup Soy sauce','2 cloves Garlic','2 cups cooked Rice'], steps: ['Chop vegetables','Stir-fry in oil 5-7 min','Add sauce','Serve with rice'] },
  { id: 'r2', title: 'Banana Oat Pancakes', ingredients: ['1 ripe Banana','1 cup Rolled oats','1 Egg','1 tsp Baking powder','1/2 cup Milk','2 tbsp Maple syrup'], steps: ['Blend banana + oats + egg','Cook on skillet','Serve with syrup'] },
  { id: 'r3', title: 'Tomato Basil Pasta', ingredients: ['8oz Pasta','1 can (14oz) Diced Tomatoes','2 cloves Garlic','1/4 cup fresh Basil','2 tbsp Olive oil','1/4 cup Parmesan cheese'], steps: ['Boil pasta','Saute garlic and tomato','Toss with basil and pasta','Top with parmesan'] },
  { id: 'r4', title: 'Simple Banana Bread (Bake)', ingredients: ['3 ripe Bananas','1.5 cups Flour','1 cup Sugar','1 tsp Baking soda','1 Egg','1/2 cup melted Butter'], steps: ['Mash bananas','Mix dry + wet','Pour into loaf pan','Bake 50-60 min at 350°F'] },
  { id: 'r5', title: 'Oatmeal Raisin Cookies (Bake)', ingredients: ['1.5 cups Rolled oats','1 cup Flour','1/2 cup Brown sugar','1/2 cup Butter','1 Egg','1/2 cup Raisins'], steps: ['Mix ingredients','Spoon onto tray','Bake 10-12 min at 350°F'] },
  { id: 'r6', title: 'Simple Baked Apples (Bake)', ingredients: ['2 Apples','1 tsp Cinnamon','1/4 cup Oats','2 tbsp Butter','2 tbsp Honey'], steps: ['Core apples','Fill with oats+cinnamon','Bake 25-30 min at 375°F'] }
];

export default function RecipesPage() {
  const [user, setUser] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [locationInput, setLocationInput] = useState('');
  const [priceEstimate, setPriceEstimate] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState('');
  const [toast, setToast] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [savedEstimates, setSavedEstimates] = useState([]);

  function showToast(msg){ setToast(msg); setTimeout(()=> setToast(''), 4500) }

  useEffect(() => {
    const raw = localStorage.getItem('mf_user');
    if (raw) {
      try {
        const parsedUser = JSON.parse(raw);
        setUser(parsedUser);
        // Load favorites for this user
        const dataKey = `mf_data_${parsedUser.id}`;
        const rawData = localStorage.getItem(dataKey);
        if (rawData) {
            const parsedData = JSON.parse(rawData);
            setFavorites(parsedData.favorites || []);
        }
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  function persistFavorites(nextFavorites) {
    if (!user) return;
    const key = `mf_data_${user.id}`;
    const raw = localStorage.getItem(key);
    const existingData = raw ? JSON.parse(raw) : {};
    const payload = { ...existingData, favorites: nextFavorites };
    try { localStorage.setItem(key, JSON.stringify(payload)); } catch (e) { /* ignore */ }
  }

  function toggleFavorite(recipe) {
    const exists = favorites.find(f => f.id === recipe.id);
    const next = exists
      ? favorites.filter(f => f.id !== recipe.id)
      : [...favorites, { id: recipe.id, title: recipe.title }];
    setFavorites(next);
    persistFavorites(next);
    showToast(exists ? 'Removed from favorites' : 'Added to favorites!');
  }

  // Fuzzy allergy matching helpers: normalization, simple synonyms, and substring checks.
  function normalizeText(s) {
    return (s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
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
  };

  function allergyToTokens(allergy) {
    const norm = normalizeText(allergy);
    const base = norm.split(' ')[0] || norm;
    const syn = ALLERGY_SYNONYMS[base] || [];
    const tokens = new Set([norm, base, ...syn.map(s => normalizeText(s))]);
    return tokens;
  }

  function ingredientMatchesAnyAllergy(ingredient, allergies) {
    const ing = normalizeText(ingredient);
    if (!ing) return false;
    for (const a of allergies) {
      const tokens = allergyToTokens(a);
      for (const t of tokens) {
        if (!t) continue;
        if (ing === t || ing.includes(t) || t.includes(ing)) return true;
        const re = new RegExp('\\b' + t.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&') + '\\b');
        if (re.test(ing)) return true;
      }
    }
    return false;
  }

  const allowedRecipes = (() => {
    if (!user || user.skipAllergies) return RECIPES;
    const userAllergies = (user.allergies || []);
    if (!userAllergies || userAllergies.length === 0) return RECIPES;
    return RECIPES.filter(r => !(r.ingredients || []).some(ing => ingredientMatchesAnyAllergy(ing, userAllergies)));
  })();

  const excludedInfo = (() => {
    if (!user || user.skipAllergies) return [];
    const userAllergies = (user.allergies || []);
    const out = [];
    for (const r of RECIPES) {
      const matches = [];
      for (const ing of (r.ingredients || [])) {
        for (const a of userAllergies) {
          if (ingredientMatchesAnyAllergy(ing, [a])) {
            matches.push({ ingredient: ing, allergy: a });
          }
        }
      }
      if (matches.length > 0) out.push({ id: r.id, title: r.title, matches });
    }
    return out;
  })();

  // Simple fallback prices per ingredient (USD approximate)
  // Updated to reflect more current average US prices.
  const FALLBACK_PRICES = {
    'Broccoli': 2.50, 'Carrot': 1.00, 'Bell pepper': 1.50, 'Soy sauce': 3.00, 'Garlic': 0.50, 'Rice': 2.00,
    'Banana': 0.60, 'Rolled oats': 3.50, 'Egg': 0.30, 'Baking powder': 2.00, 'Milk': 3.80, 'Maple syrup': 5.00,
    'Pasta': 1.50, 'Tomato': 2.00, 'Basil': 2.50, 'Olive oil': 8.00, 'Parmesan': 5.00,
    'Flour': 3.00, 'Sugar': 2.50, 'Baking soda': 1.00, 'Butter': 4.50,
    'Brown sugar': 2.50, 'Raisins': 4.00,
    'Apple': 1.00, 'Cinnamon': 3.00, 'Oats': 3.50, 'Honey': 5.00
  };

  // Simple location multipliers and currency settings
  const LOCATION_PRESETS = [
    { match: ['japan', 'jp', 'tokyo'], currency: 'JPY', multiplier: 150, locale: 'ja-JP' },
    { match: ['euro','france','germany','de','fr','paris','europe', 'spain', 'italy'], currency: 'EUR', multiplier: 1.1, locale: 'de-DE' },
    { match: ['uk','gb','united kingdom','london'], currency: 'GBP', multiplier: 1.2, locale: 'en-GB' },
    { match: ['canada','ca','toronto','vancouver'], currency: 'CAD', multiplier: 1.1, locale: 'en-CA' },
    { match: ['australia','au','sydney','melbourne'], currency: 'AUD', multiplier: 1.3, locale: 'en-AU' }
  ];

  function detectLocationSettings(locationText) {
    const raw = (locationText||'').toLowerCase();
    for (const preset of LOCATION_PRESETS) {
      for (const token of preset.match) if (raw.includes(token)) return preset;
    }
    return { currency: 'USD', multiplier: 1.0, locale: 'en-US' };
  }

  async function estimatePriceForRecipe(recipe) {
    setPriceEstimate(null);
    setPriceLoading(true);
    const ingredients = recipe.ingredients || [];
    const location = locationInput || 'the United States';

    try {
      const prompt = `You are an expert in grocery price estimation. Using the most current data available (as of today), estimate the approximate prices in USD for the following ingredients at an average US grocery store (like Kroger or Safeway) in ${location}. Provide a short, itemized breakdown and a total. Here are the ingredients: ${ingredients.join(', ')}.`;
      const resp = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ prompt }) });
      if (resp.ok) {
        const j = await resp.json();
        setPriceEstimate(j.response || 'No estimate returned');
        setPriceLoading(false);
        return;
      }
    } catch (err) {
      // fall through to fallback
    }

    const subtotal = ingredients.reduce((sum,ing)=> sum + (FALLBACK_PRICES[ing] || 1.0), 0);
    const preset = detectLocationSettings(locationInput);
    const total = subtotal * preset.multiplier;
    let formatted = total.toFixed(2);
    try { formatted = new Intl.NumberFormat(preset.locale || navigator.language || 'en-US', { style:'currency', currency: preset.currency || 'USD' }).format(total); } catch(e){}
    const breakdown = ingredients.map(ing => `${ing}: ${(FALLBACK_PRICES[ing]||1.0).toFixed(2)} USD`).join('\n');
    setPriceEstimate(`Fallback estimate for ${locationInput || 'your area'} (${preset.currency || 'USD'}):\n${breakdown}\nTotal: ${formatted}`);
    setPriceLoading(false);
  }

  async function getAiAdviceForRecipe(recipe) {
    setAiAdvice('Thinking…');
    try {
      const prompt = `Given the recipe titled "${recipe.title}" with ingredients: ${recipe.ingredients.join(', ')}. Suggest healthier substitutions, portion tips, and quick swaps to make it more allergy-friendly. Keep the answer short and actionable.`;
      const resp = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ prompt }) });
      if (resp.ok) {
        const j = await resp.json();
        setAiAdvice(j.response || 'No advice returned');
        return;
      }
    } catch (err) {
      // ignore
    }
    setAiAdvice('Try increasing vegetables, using whole grains, and reducing added sugars — swap oil for steaming when possible.');
  }

  return (
    <div className="container" style={{
      backgroundColor: '#f0f4f0',
      color: '#333',
      padding: '1rem',
      minHeight: '100vh'
    }}>
      <Navigation />
      <header style={{textAlign:'center', marginBottom:18}}>
        <h1>Recipes</h1>
        <p className="note">Find recipes to cook or bake, filtered by your allergies.</p>
      </header>
      {toast && <Toast message={toast} onClose={()=>setToast('')} />}

      <main>
        <div className="card">
          <h3>Recipes to Cook or Bake</h3>
          <p>Choose a recipe and get an AI-guided suggestion and price estimate for your area.</p>
          <div style={{display:'flex', gap:8, marginBottom:8, flexWrap: 'wrap'}}>
            {allowedRecipes.map(r => (
              <button key={r.id} onClick={() => { setSelectedRecipe(r); setPriceEstimate(null); setAiAdvice('') }} className={`pillBtn ${selectedRecipe?.id===r.id? 'selected':''}`}>{r.title}</button>
            ))}
          </div>
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
                      <button className="small" style={{
                        background: 'transparent',
                        border: '1px solid #2e8b57',
                        color: '#2e8b57'
                      }} onClick={() => {
                        const r = RECIPES.find(x=>x.id===info.id);
                        if (r) { setSelectedRecipe(r); setPriceEstimate(null); setAiAdvice('') }
                      }}>Open anyway</button>
                      }}>
                        Open anyway
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}

          {selectedRecipe && (
            <div style={{marginTop: 16}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h4 style={{marginBottom:6, margin: 0}}>{selectedRecipe.title}</h4>
                <button
                  className="small"
                  style={{backgroundColor: favorites.some(f => f.id === selectedRecipe.id) ? '#ffd700' : '#eee'}}
                  style={favorites.some(f => f.id === selectedRecipe.id) ? {
                    // Favorited style
                    backgroundColor: '#ffd700', // gold
                    color: '#333',
                    border: '1px solid #e0a800',
                    fontWeight: 'bold',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  } : {
                    // Not favorited style
                    backgroundColor: 'transparent',
                    color: '#b8860b', // darkgoldenrod
                    border: '1px solid #b8860b',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleFavorite(selectedRecipe)}
                >
                  ⭐ {favorites.some(f => f.id === selectedRecipe.id) ? 'Favorited' : 'Favorite'}
                </button>
              </div>
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
                <button className="primary" style={{marginLeft:8, backgroundColor: '#2e8b57', color: 'white'}} onClick={() => estimatePriceForRecipe(selectedRecipe)}>{priceLoading? 'Estimating...':'Estimate Price'}</button>
              </div>

              {priceEstimate && (
                <pre style={{background:'#f6fff6', padding:8, marginTop:8, borderRadius:6, whiteSpace:'pre-wrap'}}>{priceEstimate}</pre>
              )}

              <div style={{marginTop:8}}>
                <button
                  className="primary"
                  style={{ backgroundColor: '#2e8b57', color: 'white' }}
                  onClick={()=>getAiAdviceForRecipe(selectedRecipe)}>
                  Get AI advice for healthier swaps
                </button>
                {aiAdvice && <div style={{marginTop:8, background:'#fff', padding:8, borderRadius:6}}>{aiAdvice}</div>}
              </div>
            </div>
          )}
        </div>

        <div className="card" style={{marginTop: '1rem'}}>
          <h3>Your Favorite Recipes</h3>
          {favorites.length === 0 ? (
            <p className="note">You haven't favorited any recipes yet. Click the ⭐ to save a recipe.</p>
          ) : (
            <ul style={{listStyle: 'none', padding: 0}}>
              {favorites.map(fav => (
                <li key={fav.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', padding: '0.5rem', border: '1px solid #eee', borderRadius: '4px'}}>
                  <span>{fav.title}</span>
                  <div style={{display: 'flex', gap: '0.5rem'}}>
                    <button className="small" style={{
                      background: 'transparent',
                      border: '1px solid #2e8b57',
                      color: '#2e8b57'
                    }} onClick={() => {
                      const r = RECIPES.find(x => x.id === fav.id);
                      if (r) {
                        setSelectedRecipe(r);
                        setPriceEstimate(null);
                        setAiAdvice('');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}>Open</button>
                    <button className="small" style={{
                      marginLeft: '0.5rem',
                      color: '#a33',
                      background: '#fff6f6'
                    }} onClick={() => toggleFavorite(fav)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}