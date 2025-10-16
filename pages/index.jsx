import Link from 'next/link'

export default function Home() {
  const container = {
    padding: 20,
    fontFamily: 'Arial, sans-serif'
  }

  const header = {
    background: '#0b8457',
    color: 'white',
    padding: '12px 20px',
    borderRadius: 8,
    textAlign: 'center',
    marginBottom: 18
  }

  const cols = {
    display: 'flex',
    gap: 16,
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  }

  const col = {
    flex: 1,
    background: '#e6f7ef',
    padding: 18,
    borderRadius: 10,
    minHeight: 180,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  }

  const button = {
    display: 'inline-block',
    padding: '12px 18px',
    background: '#0b8457',
    color: 'white',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: 600
  }

  return (
    <div style={container}>
      <div style={header}>
        <h1 style={{margin:0}}>Home Page</h1>
      </div>

      <div style={cols}>
        <div style={{...col, marginRight:8}}>
          <h3>Sign Up</h3>
          <p>Create an account and set your allergy preferences.</p>
          <Link href="/signup" style={button}>Sign Up</Link>
        </div>

        <div style={{...col, marginLeft:8, marginRight:8}}>
          <h3>Learn More</h3>
          <p>Learn more about Mental Food and how we help you feel welcomed.</p>
          <Link href="/learn-more" style={button}>Learn More</Link>
        </div>

        <div style={{...col, marginLeft:8}}>
          <h3>Log In</h3>
          <p>Already have an account? Log in to continue.</p>
          <Link href="/login" style={button}>Log In</Link>
        </div>
      </div>
    </div>
  )
}
