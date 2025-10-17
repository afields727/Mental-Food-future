import { useEffect } from 'react'

export default function Toast({ message, onClose, duration = 4000 }){
  useEffect(()=>{
    if (!message) return
    const t = setTimeout(()=> onClose && onClose(), duration)
    return ()=> clearTimeout(t)
  },[message, duration, onClose])

  if (!message) return null
  const container = {
    position: 'fixed',
    right: 16,
    bottom: 20,
    zIndex: 9999,
    background: 'rgba(0,0,0,0.85)',
    color: 'white',
    padding: '10px 14px',
    borderRadius: 8,
    boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
    maxWidth: '320px'
  }
  return (
    <div style={container} role="status" aria-live="polite">
      {message}
    </div>
  )
}
