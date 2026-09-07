import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

console.log('Supabase URL:', url)
console.log('Supabase Key exists:', !!key)

export const supabase =
  url && key ? createClient(url, key, { auth: { persistSession: false } }) : null

export function requireDb(res) {
  if (!supabase) {
    res.status(503).json({
      error: 'Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to backend/.env',
    })
    return false
  }
  return true
}