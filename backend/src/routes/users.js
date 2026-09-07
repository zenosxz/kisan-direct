import { Router } from 'express'
import { requireDb, supabase } from '../supabase.js'

const router = Router()

router.get('/by-phone/:phone', async (req, res) => {
  if (!requireDb(res)) return
  const phone = decodeURIComponent(req.params.phone)
  const { data, error } = await supabase.from('users').select('*').eq('phone', phone).maybeSingle()
  if (error) return res.status(500).json({ error: error.message })
  res.json({ user: data })
})

router.post('/', async (req, res) => {
  if (!requireDb(res)) return
  const payload = req.body
  const { data: existing, error: findError } = await supabase
    .from('users')
    .select('*')
    .eq('phone', payload.phone)
    .maybeSingle()
  if (findError) return res.status(500).json({ error: findError.message })

  if (existing) {
    const { data, error } = await supabase
      .from('users')
      .update({
        name: payload.name,
        role: payload.role,
        state: payload.state,
        district: payload.district,
        upi_id: payload.upi_id,
        firebase_uid: payload.firebase_uid,
      })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ user: data })
  }

  const { data, error } = await supabase.from('users').insert(payload).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json({ user: data })
})

export default router
