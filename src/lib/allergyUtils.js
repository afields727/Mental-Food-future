export const ALLERGY_SYNONYMS = {
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

export function normalizeText(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
}

export function allergyToTokens(allergy) {
  const norm = normalizeText(allergy);
  const base = norm.split(' ')[0] || norm;
  const syn = ALLERGY_SYNONYMS[base] || [];
  const tokens = new Set([norm, base, ...syn.map(s => normalizeText(s))]);
  return tokens;
}

export function ingredientMatchesAnyAllergy(ingredient, allergies) {
  const ing = normalizeText(ingredient);
  if (!ing) return false;
  for (const a of allergies) {
    const tokens = allergyToTokens(a);
    for (const t of tokens) {
      if (!t) continue;
      if (ing === t || ing.includes(t) || t.includes(ing)) return true;
      const re = new RegExp('\\b' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
      if (re.test(ing)) return true;
    }
  }
  return false;
}
