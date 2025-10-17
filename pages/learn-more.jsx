import Link from 'next/link'

export default function LearnMore() {
  return (
    <div style={{ padding: 20, background: 'linear-gradient(180deg,#eafbea,#dff6e6)', minHeight: '100vh' }}>
      <h2>About Mental Food</h2>
      <p>
        Mental Food is a small, caring demo that connects simple food choices with small daily
        practices to support mental wellbeing. We focus on an allergy-first flow so people with
        dietary restrictions can safely find recipes and substitutions.
      </p>

      <h3>Our mission</h3>
      <p>
        To make small food and habit changes approachable — not perfect. We believe the right
        ingredients and tiny rituals can help steady mood, energy, and a sense of routine.
      </p>

      <h3>Values</h3>
      <ul>
        <li>Safety-first: allergies and intolerances are central to our design.</li>
        <li>Simplicity: easy recipes and small practices you can repeat.</li>
        <li>Compassion: this is a gentle tool, not medical advice — for serious concerns consult professionals.</li>
      </ul>

      <h3>Community & Feedback</h3>
      <p>
        This demo is a starting point. If you'd like features like more local pricing, recipe sharing,
        or verified nutritional information, we welcome feedback and contributions.
      </p>

      <p>
        <Link href="/signup">Try signing up</Link> | <Link href="/">Back to Home</Link>
      </p>
    </div>
  )
}
