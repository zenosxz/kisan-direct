import { Router } from 'express'
import { requireDb, supabase } from '../supabase.js'

const router = Router()

function listingsQuery(req, withFarmer) {
  let query = supabase
    .from('listings')
    .select(withFarmer ? '*, farmer:users!farmer_id(name)' : '*')
  if (req.query.id) query = query.eq('id', req.query.id)
  if (req.query.status) query = query.eq('status', req.query.status)
  if (req.query.crop) query = query.eq('crop', req.query.crop)
  if (req.query.state) query = query.eq('state', req.query.state)
  return query
}

router.get('/', async (req, res) => {
  if (!requireDb(res)) return
  let { data, error } = await listingsQuery(req, true).order('created_at', { ascending: false })
  if (error) {
    const retry = await listingsQuery(req, false)
    data = retry.data
    error = retry.error
  }
  if (error) return res.status(500).json({ error: error.message })
  res.json({ listings: data || [] })
})

router.post('/', async (req, res) => {
  if (!requireDb(res)) return
  let { data, error } = await supabase.from('listings').insert(req.body).select().single()
  if (error && req.body.harvested_on) {
    const rest = { ...req.body }
    delete rest.harvested_on
    const retry = await supabase.from('listings').insert(rest).select().single()
    data = retry.data
    error = retry.error
  }
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json({ listing: data })
})

router.get('/farmer/:farmerId/stats', async (req, res) => {
  if (!requireDb(res)) return
  const farmerId = req.params.farmerId

  let { data: listings, error: listError } = await supabase
    .from('listings')
    .select('*')
    .eq('farmer_id', farmerId)
    .order('created_at', { ascending: false })
  if (listError) {
    const retry = await supabase.from('listings').select('*').eq('farmer_id', farmerId)
    listings = retry.data
    listError = retry.error
  }
  if (listError) return res.status(500).json({ error: listError.message })

  let { data: orders, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('farmer_id', farmerId)
    .order('created_at', { ascending: false })
  if (orderError) {
    const retry = await supabase.from('orders').select('*').eq('farmer_id', farmerId)
    orders = retry.data
    orderError = retry.error
  }
  if (orderError) return res.status(500).json({ error: orderError.message })

  const earnings = (orders || [])
    .filter((o) => o.status === 'paid' || o.status === 'accepted')
    .reduce((sum, o) => sum + Number(o.amount || 0), 0)
  const pendingOrders = (orders || []).filter((o) => o.status === 'pending').length
  const activeListings = (listings || []).filter((l) => l.status === 'active').length

  let nudge = null
  const latest = (listings || [])[0]
  if (latest) {
    const { data: mandi } = await supabase
      .from('mandi_prices')
      .select('*')
      .ilike('crop', latest.crop)
      .limit(1)
      .maybeSingle()
    if (mandi?.modal_price) {
      const diff = Number(latest.price_per_quintal) - Number(mandi.modal_price)
      nudge =
        diff > 0
          ? `${latest.crop} is ₹${Math.abs(diff)} above the latest mandi modal rate (₹${mandi.modal_price}).`
          : `${latest.crop} is ₹${Math.abs(diff)} below the latest mandi modal rate (₹${mandi.modal_price}). Consider a modest increase.`
    }
  }

  res.json({
    earnings,
    activeListings,
    pendingOrders,
    listings: listings || [],
    orders: orders || [],
    nudge,
  })
})

export default router
