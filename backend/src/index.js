import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import adminRoutes from './routes/admin.js'
import listingRoutes from './routes/listings.js'
import mandiRoutes from './routes/mandi.js'
import orderRoutes from './routes/orders.js'
import userRoutes from './routes/users.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  }),
)
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'kisan-direct' })
})

app.use('/api/users', userRoutes)
app.use('/api/listings', listingRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/mandi', mandiRoutes)
app.use('/api/admin', adminRoutes)

app.listen(port, () => {
  console.log(`Kisan Direct API listening on ${port}`)
})
