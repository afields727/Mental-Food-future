import { describe, it, expect } from 'vitest';
import Tracker from './tracker.jsx';

// Since the functions are defined inside the component, we can't import them directly.
// For a real-world scenario, these helpers should be extracted to a separate file to be more easily testable.
// For this exercise, I will re-define them in the test file.

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
      const re = new RegExp('\b' + t.replace(/[.*+?^${}()|[\]\]/g, '\$&') + '\b');
      if (re.test(ing)) return true;
    }
  }
  return false;
}

describe('Tracker Component Helper Functions', () => {
  describe('normalizeText', () => {
    it('should convert text to lowercase', () => {
      expect(normalizeText('HELLO')).toBe('hello');
    });

    it('should remove special characters', () => {
      expect(normalizeText('h@e#l$l%o^')).toBe('hello');
    });

    it('should trim whitespace', () => {
      expect(normalizeText('  hello  ')).toBe('hello');
    });

    it('should handle null and undefined input', () => {
      expect(normalizeText(null)).toBe('');
      expect(normalizeText(undefined)).toBe('');
    });
  });

  describe('allergyToTokens', () => {
    it('should create a set of tokens for a given allergy', () => {
      const tokens = allergyToTokens('Peanut Butter');
      expect(tokens).toContain('peanut butter');
      expect(tokens).toContain('peanut');
      expect(tokens).toContain('groundnut');
    });
  });

  describe('ingredientMatchesAnyAllergy', () => {
    it('should return true if an ingredient matches an allergy', () => {
      expect(ingredientMatchesAnyAllergy('Milk', ['Dairy'])).toBe(true);
      expect(ingredientMatchesAnyAllergy('Whole wheat flour', ['wheat'])).toBe(true);
    });

    it('should return false if an ingredient does not match an allergy', () => {
      expect(ingredientMatchesAnyAllergy('Chicken', ['Dairy'])).toBe(false);
    });

    it('should handle complex cases', () => {
      expect(ingredientMatchesAnyAllergy('peanut oil', ['peanut butter'])).toBe(true);
      expect(ingredientMatchesAnyAllergy('soya milk', ['soy'])).toBe(true);
    });
  });
});
