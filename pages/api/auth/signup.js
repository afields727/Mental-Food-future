const { validateSignupPayload } = require('../../../src/validation')

async function loadBcryptLike() {
  try { return require('bcrypt') } catch (e) { try { return require('bcryptjs') } catch (_) { return null } }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const body = req.body || {}
  const v = validateSignupPayload(body)
  if (!v.ok) return res.status(400).json({ error: 'invalid input', field: v.error })

  const { name, email, password, skipAllergies } = body

  try {
    const bcryptLib = await loadBcryptLike()
    if (!bcryptLib) return res.status(500).json({ error: "No bcrypt implementation available. Install 'bcrypt' or 'bcryptjs'." })

    const hashFn = bcryptLib.hash ? bcryptLib.hash.bind(bcryptLib) : (pwd, rounds) => bcryptLib.hashSync(pwd, rounds)
    await hashFn(password, 10)

    const demoId = `user_${Date.now()}`
    return res.status(201).json({ user: { id: demoId, name, email, skipAllergies: !!skipAllergies } })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'server error' })
  }
}
