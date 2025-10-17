import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from './signup.module.css';

const SAMPLE_FOODS = {
  fruits: ['Apple', 'Banana', 'Orange', 'Strawberry', 'Peach', 'Pear', 'Mango', 'Kiwi', 'Pineapple', 'Grapes', 'Melon', 'Cherry'],
  vegetables: ['Tomato', 'Carrot', 'Spinach', 'Lettuce', 'Bell Pepper', 'Broccoli', 'Cauliflower', 'Zucchini', 'Cucumber', 'Onion', 'Garlic'],
  starches: ['Potato', 'Sweet Potato', 'Yam', 'Cassava', 'Taro', 'Corn', 'Plantain'],
  grains: ['Wheat', 'Barley', 'Rice', 'Oats', 'Rye', 'Quinoa', 'Cornmeal'],
  dairy: ['Milk', 'Cheese', 'Yogurt', 'Butter', 'Cream'],
  nuts: ['Peanut', 'Almond', 'Walnut', 'Cashew', 'Pistachio', 'Hazelnut'],
  seafood: ['Shrimp', 'Crab', 'Lobster', 'Salmon', 'Tuna', 'Clams', 'Mussels'],
  eggs: ['Chicken Egg', 'Duck Egg'],
};

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [allergies, setAllergies] = useState({});
  const [skipAllergies, setSkipAllergies] = useState(false);
  const [finalConfirmed, setFinalConfirmed] = useState(false);
  const [message, setMessage] = useState('');
  // High risk categories removed from visual warnings — simplified UI

  function toggleAllergy(category, item) {
    setAllergies(prev => {
      const key = `${category}:${item}`;
      const next = { ...prev };
      next[key] ? delete next[key] : (next[key] = true);
      return next;
    });
  }

  function selectAllCategory(category) {
    setAllergies(prev => {
      const next = { ...prev };
      const items = SAMPLE_FOODS[category] || [];
      items.forEach(it => { next[`${category}:${it}`] = true });
      return next;
    });
  }

  function clearAllCategory(category) {
    setAllergies(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { if (k.startsWith(category + ':')) delete next[k] });
      return next;
    });
  }

  function substitutesFor(item) {
    const map = {
      Apple: ['Pear', 'Peach', 'Cooked Apple (if raw gives issue)'],
      Banana: ['Plantain', 'Mashed avocado'],
      Tomato: ['Roasted Red Pepper', 'Extra herbs for flavor'],
      Potato: ['Sweet Potato', 'Yam'],
      Wheat: ['Gluten-free oats', 'Rice flour', 'Quinoa'],
      Milk: ['Oat milk', 'Almond milk', 'Soy milk (if no soy allergy)'],
      Cheese: ['Nutritional yeast', 'Vegan cheese'],
      Peanut: ['Sunflower seeds', 'Seed butters'],
      Shrimp: ['Firm tofu', 'King oyster mushroom'],
      Egg: ['Mashed banana', 'Flaxseed + water'],
      Almond: ['Pumpkin seeds', 'Sunflower seeds'],
      Mango: ['Papaya', 'Peach'],
      Kiwi: ['Green grapes', 'Cucumber'],
      Salmon: ['Trout', 'White fish'],
    };
    return map[item] || ['No clear substitute'];
  };

  async function finishSignup() {
    if (!finalConfirmed) {
      setMessage('Please confirm final step before finishing.');
      return;
    }

    try {
      // Persist the user's selected allergies so other parts of the app can filter recipes
      const allergyList = skipAllergies ? [] : Object.keys(allergies).map(k => k.split(':')[1]);
      const user = { id: `user_${Date.now()}`, name, email, skipAllergies, allergies: allergyList };
      localStorage.setItem('mf_user', JSON.stringify(user));
      setMessage('Signup successful — redirecting...');
      setStep(3);
      setTimeout(() => router.push('/tracker'), 600);
    } catch {
      setMessage('Unable to save user locally');
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Sign Up (Allergy-first)</h2>
        <p className={styles.subtitle}>
          Create your account and tell us about allergies so we can guide recipe substitutions.
        </p>
      </header>

      {/* Step 0: Account Info */}
      {step === 0 && (
        <div className={styles.formSection}>
          <h3>Account</h3>
          <label className={styles.label}>Name</label>
          <input className={styles.input} value={name} onChange={e => setName(e.target.value)} />

          <label className={styles.label}>Email</label>
          <input className={styles.input} value={email} onChange={e => setEmail(e.target.value)} />

          <label className={styles.label}>Password</label>
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <div className={styles.actions}>
            <button className={styles.btnPrimary} onClick={() => setStep(1)}>
              Next: Allergies
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Allergies */}
      {step === 1 && (
        <div className={styles.formSection}>
          <h3>Allergies</h3>
          <p className={styles.note}>Select items you are allergic to or skip this step.</p>

          <label className={styles.allergyItem}>
            <input
              type="checkbox"
              checked={skipAllergies}
              onChange={e => setSkipAllergies(e.target.checked)}
            />
            Skip allergy questions
          </label>

          {!skipAllergies &&
            Object.entries(SAMPLE_FOODS).map(([cat, items]) => (
              <div key={cat} className={styles.categoryGroup}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <strong>{cat}</strong>
                    <div>
                      <button className={styles.smallAction} onClick={() => selectAllCategory(cat)}>Select all</button>
                      <button className={styles.smallAction} onClick={() => clearAllCategory(cat)} style={{marginLeft:8}}>Clear</button>
                    </div>
                  </div>
                  <div className={styles.checkboxGroup}>
                  {items.map(item => {
                    const key = `${cat}:${item}`;
                    return (
                      <label key={key} className={styles.allergyItem}>
                        <input
                          type="checkbox"
                          checked={!!allergies[key]}
                          onChange={() => toggleAllergy(cat, item)}
                        />
                        {item}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

          <div className={styles.actions}>
            <button className={styles.btnGhost} onClick={() => setStep(0)}>
              Back
            </button>
            <button className={styles.btnPrimary} onClick={() => setStep(2)}>
              Next: Review
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <div className={styles.formSection}>
          <h3>Review & Substitutes</h3>

          {skipAllergies ? (
            <p className={styles.note}>You chose to skip allergy questions.</p>
          ) : Object.keys(allergies).length === 0 ? (
            <p className={styles.note}>No allergies selected.</p>
          ) : (
            <ul className={styles.reviewList}>
              {Object.keys(allergies).map(k => {
                const [cat, item] = k.split(':');
                return (
                  <li key={k}>
                    {item} ({cat}) — substitutes: {substitutesFor(item).join(', ')}
                  </li>
                );
              })}
            </ul>
          )}

          <label className={styles.confirm}>
            <input
              type="checkbox"
              checked={finalConfirmed}
              onChange={e => setFinalConfirmed(e.target.checked)}
            />
            I confirm my choices
          </label>

          <div className={styles.actions}>
            <button className={styles.btnGhost} onClick={() => setStep(1)}>
              Back
            </button>
            <button className={styles.btnPrimary} onClick={finishSignup}>
              Finish Signup
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Complete */}
      {step === 3 && (
        <div className={styles.completed}>
          <h3>Signup complete</h3>
          <p>{message}</p>
        </div>
      )}

      {message && step !== 3 && <p className={styles.message}>{message}</p>}
    </div>
  );
}
