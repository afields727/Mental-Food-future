import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function doLogin(e) {
    e.preventDefault()
    setMessage('')
    try {
      // Fake login: check localStorage for stored user
      const raw = localStorage.getItem('mf_user')
      if (raw) {
        const u = JSON.parse(raw)
        if (u.email === email) {
          setMessage('Login successful — redirecting to your tracker...')
          setTimeout(()=>router.push('/tracker'), 400)
          return
        }
      }
      // If no matching local user, create a demo user and store
      const demo = { id: `user_${Date.now()}`, name: 'Demo', email }
      localStorage.setItem('mf_user', JSON.stringify(demo))
      setMessage('Login successful — demo user saved locally. Redirecting...')
      setTimeout(()=>router.push('/tracker'), 400)
    } catch (err) {
      setMessage('Network error')
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h2 style={{margin:0}}>Welcome back</h2>
        <p style={{margin:6, color:'rgba(255,255,255,0.9)'}}>Log in to continue your Mental Food journey</p>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <form onSubmit={doLogin}>
          <div>
            <label>Email</label><br />
            <input className="input" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div style={{ marginTop: 8 }}>
            <label>Password</label><br />
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div style={{ marginTop: 12 }}>
            <button type="submit" className="primary">Log In</button>
          </div>
        </form>

        {message && <p style={{ color: message.startsWith('Login successful') ? 'green' : 'red' }}>{message}</p>}

        <p style={{marginTop:8}}>
          Don't have an account? <Link href="/signup">Sign up</Link>
        </p>

        <p>
          <Link href="/">Back to Home</Link>
        </p>
      </div>
    </div>
  )
}
