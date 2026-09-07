import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Btn, Field, Input, Page, Panel } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { api } from '../lib/api'
import { inr, retailFromMandi, savingPct } from '../lib/pricing'

function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve()
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = resolve
    s.onerror = () => reject(new Error('Razorpay SDK failed to load'))
    document.body.appendChild(s)
  })
}

export default function Order() {
  const { t } = useLang()
  const { id } = useParams()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [mandi, setMandi] = useState(0)
  const [qty, setQty] = useState(1)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api
      .listings(`?id=${id}`)
      .then(async (d) => {
        const row = (d.listings || [])[0] || null
        setListing(row)
        if (row) {
          const m = await api.mandi(row.crop, row.state).catch(() => null)
          setMandi(Number(m?.modal_price || 0))
        }
      })
      .catch((e) => setError(e.message))
  }, [id])

  const amount = useMemo(() => {
    if (!listing) return 0
    return Math.round(Number(listing.price_per_quintal) * Number(qty))
  }, [listing, qty])

  const retail = retailFromMandi(mandi) * Number(qty || 0)
  const save = savingPct(amount, retail)

  const pay = async () => {
    setError('')
    if (!listing) return
    if (qty < 1 || qty > Number(listing.quantity)) {
      setError('Quantity is not available')
      return
    }
    setBusy(true)
    try {
      await loadRazorpay()
      const order = await api.createRazorpayOrder({
        amount,
        listing_id: listing.id,
        buyer_id: profile.id,
        quantity: Number(qty),
      })
      const key = import.meta.env.VITE_RAZORPAY_KEY_ID
      if (!key) throw new Error('Add VITE_RAZORPAY_KEY_ID to frontend/.env')

      const rzp = new window.Razorpay({
        key,
        amount: order.amount,
        currency: 'INR',
        name: 'Kisan Direct',
        description: `${listing.crop} · ${qty} quintal`,
        order_id: order.id,
        prefill: { contact: profile.phone, name: profile.name },
        theme: { color: '#1a3a5c' },
        handler: async (response) => {
          await api.confirmOrder({
            listing_id: listing.id,
            buyer_id: profile.id,
            farmer_id: listing.farmer_id,
            quantity: Number(qty),
            amount,
            status: 'paid',
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
          navigate('/marketplace')
        },
      })
      rzp.open()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!listing) {
    return (
      <Page title={t.payment}>
        <p className="text-sm text-slate-600">{error || 'Loading listing…'}</p>
      </Page>
    )
  }

  return (
    <Page title={t.payment} subtitle={`${listing.crop} · ${listing.district}, ${listing.state}`}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Price summary">
          <Field label={t.qty}>
            <Input
              type="number"
              min="1"
              max={listing.quantity}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </Field>
          <dl className="mt-4 space-y-2 text-sm">
            <Row k="Direct price / quintal" v={inr(listing.price_per_quintal)} />
            <Row k="Available quantity" v={`${listing.quantity} quintal`} />
            <Row k={t.mandiRate} v={mandi ? inr(mandi) : '—'} />
            <Row k="Estimated retail" v={retail ? inr(retail) : '—'} />
            <Row k={t.saving} v={save ? `${save}%` : '—'} />
            <Row k="Amount payable" v={inr(amount)} strong />
          </dl>
        </Panel>
        <Panel title="Razorpay checkout (UPI · test mode)">
          <p className="text-sm leading-relaxed text-slate-700">
            You will be redirected to the Razorpay payment modal. Complete UPI payment in test mode. On success
            the order is recorded as paid in the ministry database.
          </p>
          {error && (
            <div className="mt-4">
              <Alert tone="red">{error}</Alert>
            </div>
          )}
          <Btn variant="green" className="mt-5 w-full" disabled={busy} type="button" onClick={pay}>
            {t.payUpi} · {inr(amount)}
          </Btn>
        </Panel>
      </div>
    </Page>
  )
}

function Row({ k, v, strong }) {
  return (
    <div className="flex justify-between border-b border-slate-100 py-2">
      <dt className="text-slate-500">{k}</dt>
      <dd className={strong ? 'text-base font-bold text-navy' : 'font-semibold text-navy'}>{v}</dd>
    </div>
  )
}
