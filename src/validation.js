function isString(v) {
  return typeof v === 'string' && v.length > 0
}

function validateSignupPayload(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'invalid body' }
  const { name, email, password } = body
  if (!isString(name) || name.length < 2) return { ok: false, error: 'name' }
  if (!isString(email) || !email.includes('@')) return { ok: false, error: 'email' }
  if (!isString(password) || password.length < 8) return { ok: false, error: 'password' }
  return { ok: true }
}

module.exports = { validateSignupPayload }
