import Link from 'next/link'

export default function Home() {
  return (
    <div className="container">
      <div className="header">
        <h1>Mental Food for the best mentality</h1>
        <p style={{ marginTop: 6, opacity: 0.95 }}>Food and small daily rituals to help your mind feel better.</p>
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 18 }}>
        <div style={{ flex: 1 }} className="card">
          <h3>Sign Up</h3>
          <p>Create an account and set your allergy preferences.</p>
          <Link href="/signup"><button className="primary">Sign Up</button></Link>
        </div>

        <div style={{ flex: 1 }} className="card">
          <h3>Learn More</h3>
          <p>Learn more about Mental Food and how we help you feel welcomed.</p>
          <Link href="/learn-more"><button className="primary">Learn More</button></Link>
        </div>

        <div style={{ flex: 1 }} className="card">
          <h3>Log In</h3>
          <p>Already have an account? Log in to continue.</p>
          <Link href="/login"><button className="primary">Log In</button></Link>
        </div>
      </div>
    </div>
  )
}
