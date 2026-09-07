import crypto from 'crypto'
import { Router } from 'express'
import Razorpay from 'razorpay'
import { requireDb, supabase } from '../supabase.js'

const router = Router()

function client() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
}

router.post('/razorpay', async (req, res) => {
  const rzp = client()
  if (!rzp) {
    return res.status(503).json({ error: 'Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env' })
  }
  const amountPaise = Math.round(Number(req.body.amount) * 100)
  try {
    const order = await rzp.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `kd_${Date.now()}`,
      notes: {
        listing_id: String(req.body.listing_id || ''),
        buyer_id: String(req.body.buyer_id || ''),
      },
    })
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/confirm', async (req, res) => {
  if (!requireDb(res)) return
  const {
    listing_id,
    buyer_id,
    farmer_id,
    quantity,
    amount,
    status,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body

  if (process.env.RAZORPAY_KEY_SECRET && razorpay_signature) {
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')
    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' })
    }
  }

  const { data, error } = await supabase
    .from('orders')
    .insert({
      listing_id,
      buyer_id,
      farmer_id,
      quantity,
      amount,
      status: status || 'paid',
      razorpay_order_id,
      razorpay_payment_id,
    })
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })

  await supabase.from('listings').update({ status: 'sold' }).eq('id', listing_id)

  res.status(201).json({ order: data })
})

router.patch('/:id/status', async (req, res) => {
  if (!requireDb(res)) return
  const { status } = req.body
  if (!['accepted', 'declined', 'pending', 'paid'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', req.params.id)
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.json({ order: data })
})

export default router
