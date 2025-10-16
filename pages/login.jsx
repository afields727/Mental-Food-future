import { useState } from 'react'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function doLogin(e) {
    e.preventDefault()
    setMessage('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('Login successful: ' + JSON.stringify(data.user))
      } else {
        setMessage(data.error || 'Login failed')
      }
    } catch (err) {
      setMessage('Network error')
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Log In</h2>
      <form onSubmit={doLogin}>
        <div>
          <label>Email</label><br />
          <input value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Password</label><br />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit">Log In</button>
        </div>
      </form>

      {message && <p style={{ color: message.startsWith('Login successful') ? 'green' : 'red' }}>{message}</p>}

      <p>
        Don't have an account? <Link href="/signup">Sign up</Link>
      </p>

      <p>
        <Link href="/">Back to Home</Link>
      </p>
    </div>
  )
}
