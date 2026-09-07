import { Router } from 'express'
import { supabase } from '../supabase.js'

const router = Router()
const RESOURCE = '9ef84268-d588-465a-a308-a864a43d0070'

router.get('/', async (req, res) => {
  const crop = req.query.crop || 'Wheat'
  const state = req.query.state || ''

  if (process.env.DATA_GOV_API_KEY) {
    try {
      const url = new URL(`https://api.data.gov.in/resource/${RESOURCE}`)
      url.searchParams.set('api-key', process.env.DATA_GOV_API_KEY)
      url.searchParams.set('format', 'json')
      url.searchParams.set('limit', '10')
      url.searchParams.set('filters[commodity]', crop)
      if (state) url.searchParams.set('filters[state]', state)
      const response = await fetch(url)
      const json = await response.json()
      const row = json.records?.[0]
      if (row) {
        return res.json({
          crop,
          state: row.state || state,
          market: row.market,
          modal_price: Number(row.modal_price),
          min_price: Number(row.min_price),
          max_price: Number(row.max_price),
          arrival_date: row.arrival_date,
          source: 'agmarknet',
        })
      }
    } catch {
      /* fall through to supabase */
    }
  }

  if (supabase) {
    let query = supabase.from('mandi_prices').select('*').ilike('crop', crop)
    if (state) query = query.ilike('state', state)
    const { data } = await query.limit(1).maybeSingle()
    if (data) {
      return res.json({
        crop: data.crop,
        state: data.state,
        market: data.market,
        modal_price: Number(data.modal_price),
        min_price: Number(data.min_price),
        max_price: Number(data.max_price),
        arrival_date: data.arrival_date || data.date,
        source: 'supabase',
      })
    }
  }

  res.json({
    crop,
    state,
    market: 'Reference (offline)',
    modal_price: 2200,
    min_price: 2000,
    max_price: 2450,
    source: 'fallback',
  })
})

export default router
