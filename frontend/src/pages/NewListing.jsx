import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Btn, Field, GovTable, Input, Page, Panel, Select, Td } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { api } from '../lib/api'
import { CROPS } from '../lib/india'
import { inr, retailFromMandi, suggestedFromMandi } from '../lib/pricing'

export default function NewListing() {
  const { t } = useLang()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [crop, setCrop] = useState('Wheat')
  const [quantity, setQuantity] = useState('10')
  const [price, setPrice] = useState('')
  const [harvested, setHarvested] = useState(() => new Date().toISOString().slice(0, 10))
  const [mandi, setMandi] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!profile?.state) return
    api
      .mandi(crop, profile.state)
      .then(setMandi)
      .catch(() => setMandi(null))
  }, [crop, profile])

  const comparison = useMemo(() => {
    const yours = Number(price)
    const modal = Number(mandi?.modal_price || 0)
    const suggested = suggestedFromMandi(modal)
    const retail = retailFromMandi(modal)
    const tooLow = yours && modal && yours < modal * 0.9
    return { yours, modal, suggested, retail, tooLow }
  }, [price, mandi])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api.createListing({
        farmer_id: profile.id,
        crop,
        quantity: Number(quantity),
        price_per_quintal: Number(price),
        state: profile.state,
        district: profile.district,
        status: 'active',
        harvested_on: harvested,
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page title={t.newListing} subtitle={`${profile?.district || ''}, ${profile?.state || ''}`}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title={t.newListing}>
          <form className="space-y-4" onSubmit={submit}>
            <Field label={t.crop}>
              <Select value={crop} onChange={(e) => setCrop(e.target.value)}>
                {CROPS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label={t.qty}>
              <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </Field>
            <Field label={t.price}>
              <Input type="number" min="1" required value={price} onChange={(e) => setPrice(e.target.value)} />
            </Field>
            <Field label={t.harvested}>
              <Input type="date" value={harvested} onChange={(e) => setHarvested(e.target.value)} />
            </Field>
            {error && <Alert tone="red">{error}</Alert>}
            <Btn variant="navy" disabled={busy} type="submit">
              {t.publish}
            </Btn>
          </form>
        </Panel>

        <Panel title={t.compare}>
          <p className="mb-3 text-xs text-slate-500">
            {crop} · {profile?.state} · Agmarknet
            {mandi?.market ? ` · ${mandi.market}` : ''}
          </p>
          <GovTable headers={['Parameter', '₹ / quintal']}>
            <tr>
              <Td>{t.yourPrice}</Td>
              <Td className="font-semibold">{comparison.yours ? inr(comparison.yours) : '—'}</Td>
            </tr>
            <tr>
              <Td>{t.mandiRate}</Td>
              <Td>{comparison.modal ? inr(comparison.modal) : 'Awaiting mandi data'}</Td>
            </tr>
            <tr>
              <Td>{t.suggested}</Td>
              <Td className="text-india-green">{comparison.suggested ? inr(comparison.suggested) : '—'}</Td>
            </tr>
            <tr>
              <Td>{t.retail}</Td>
              <Td>{comparison.retail ? inr(comparison.retail) : '—'}</Td>
            </tr>
          </GovTable>
          {comparison.tooLow && (
            <div className="mt-4">
              <Alert>
                Warning: your price is more than 10% below the Agmarknet mandi modal rate. You may be leaving
                income on the table.
              </Alert>
            </div>
          )}
        </Panel>
      </div>
    </Page>
  )
}
