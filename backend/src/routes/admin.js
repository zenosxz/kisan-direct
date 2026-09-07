import { Router } from 'express'
import { requireDb, supabase } from '../supabase.js'

const router = Router()

router.get('/summary', async (req, res) => {
  if (!requireDb(res)) return

  const { data: orders, error: orderError } = await supabase
    .from('orders')
    .select('*, listings(crop, price_per_quintal)')
    .order('created_at', { ascending: false })
    .limit(100)
  if (orderError) return res.status(500).json({ error: orderError.message })

  const { data: users } = await supabase.from('users').select('id, name, role')
  const nameById = Object.fromEntries((users || []).map((u) => [u.id, u.name]))

  const farmerMap = {}
  const buyerMap = {}
  for (const o of orders || []) {
    if (o.status !== 'paid') continue
    farmerMap[o.farmer_id] = (farmerMap[o.farmer_id] || 0) + Number(o.amount || 0)
    const mandiGuess = Number(o.listings?.price_per_quintal || 0) * Number(o.quantity || 0) * 1.08
    const save = Math.max(0, Math.round(mandiGuess - Number(o.amount || 0)))
    buyerMap[o.buyer_id] = (buyerMap[o.buyer_id] || 0) + save
  }

  const { data: disputes } = await supabase
    .from('disputes')
    .select('*')
    .order('created_at', { ascending: false })

  res.json({
    orders: orders || [],
    farmerEarnings: Object.entries(farmerMap).map(([farmer_id, total]) => ({
      farmer_id,
      name: nameById[farmer_id],
      total,
    })),
    buyerSavings: Object.entries(buyerMap).map(([buyer_id, savings]) => ({
      buyer_id,
      name: nameById[buyer_id],
      savings,
    })),
    disputes: disputes || [],
  })
})

export default router
