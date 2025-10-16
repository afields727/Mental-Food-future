import Link from 'next/link'

export default function LearnMore() {
  return (
    <div style={{ padding: 20, background: 'linear-gradient(180deg,#eafbea,#dff6e6)', minHeight: '100vh' }}>
      <h2>About Mental Food</h2>
      <p>
        Mental Food is a small demo app that emphasizes an allergy-first signup flow so people
        with dietary restrictions can get personalized, safe food suggestions.
      </p>
      <p>
        This demo lets you mark allergies, see naive substitutes, and finish signup. It is a
        scaffold for a larger product that would include profiles, recipes, and community features.
      </p>

      <p>
        <Link href="/signup">Try signing up</Link> | <Link href="/">Back to Home</Link>
      </p>
    </div>
  )
}
