import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Btn, Field, GovTable, Page, Panel, Select, Td } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { api } from '../lib/api'
import { CROPS, STATES } from '../lib/india'
import { estimateKm, inr, retailFromMandi, savingPct } from '../lib/pricing'

export default function Marketplace() {
  const { t } = useLang()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [crop, setCrop] = useState('')
  const [state, setState] = useState('')
  const [distance, setDistance] = useState('all')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const search = async (e) => {
    e?.preventDefault()
    setBusy(true)
    setError('')
    try {
      const params = new URLSearchParams()
      params.set('status', 'active')
      if (crop) params.set('crop', crop)
      if (state) params.set('state', state)
      const d = await api.listings(`?${params.toString()}`)
      const listings = d.listings || []
      const withRates = await Promise.all(
        listings.map(async (row) => {
          try {
            const m = await api.mandi(row.crop, row.state)
            return { ...row, _mandi: Number(m.modal_price || 0) }
          } catch {
            return { ...row, _mandi: 0 }
          }
        }),
      )
      setRows(withRates)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    search()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const km = estimateKm(profile, row)
      row._km = km
      if (distance === '50') return km <= 50
      if (distance === '200') return km <= 200
      if (distance === '500') return km <= 500
      return true
    })
  }, [rows, distance, profile])

  return (
    <Page title={t.marketplace} subtitle="Active lots available for direct purchase">
      <Panel title={t.filters}>
        <form className="grid gap-3 md:grid-cols-4" onSubmit={search}>
          <Field label={t.crop}>
            <Select value={crop} onChange={(e) => setCrop(e.target.value)}>
              <option value="">{t.all}</option>
              {CROPS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label={t.state}>
            <Select value={state} onChange={(e) => setState(e.target.value)}>
              <option value="">{t.all}</option>
              {STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label={t.distance}>
            <Select value={distance} onChange={(e) => setDistance(e.target.value)}>
              <option value="all">{t.all}</option>
              <option value="50">≤ 50 km</option>
              <option value="200">≤ 200 km</option>
              <option value="500">≤ 500 km</option>
            </Select>
          </Field>
          <div className="flex items-end">
            <Btn variant="navy" className="w-full" disabled={busy} type="submit">
              {t.search}
            </Btn>
          </div>
        </form>
      </Panel>

      {error && (
        <div className="mt-4">
          <Alert tone="red">{error}</Alert>
        </div>
      )}

      <div className="mt-5">
        <GovTable
          headers={[
            t.sl,
            t.commodity,
            t.farmerName,
            t.stateDist,
            t.qty,
            t.directPrice,
            t.mandiRate,
            t.retail,
            t.saving,
            t.harvested,
            t.rating,
            t.action,
          ]}
          empty={filtered.length === 0 ? 'Use Search to load active listings.' : null}
        >
          {filtered.map((row, i) => {
            const retail = retailFromMandi(row._mandi)
            const save = savingPct(row.price_per_quintal, retail)
            return (
              <tr key={row.id}>
                <Td>{i + 1}</Td>
                <Td className="font-semibold">{row.crop}</Td>
                <Td>{row.farmer?.name || row.farmer_name || '—'}</Td>
                <Td>
                  {row.state}
                  <span className="block text-xs text-slate-500">{row.district}</span>
                </Td>
                <Td>{row.quantity}</Td>
                <Td className="font-semibold text-navy">{inr(row.price_per_quintal)}</Td>
                <Td>{row._mandi ? inr(row._mandi) : '—'}</Td>
                <Td>{retail ? inr(retail) : '—'}</Td>
                <Td className="font-semibold text-india-green">{save ? `${save}%` : '—'}</Td>
                <Td>{row.harvested_on || row.created_at?.slice(0, 10) || '—'}</Td>
                <Td>{row.rating || '4.2'}</Td>
                <Td>
                  <Btn
                    variant="green"
                    className="px-3 py-1 text-xs"
                    type="button"
                    onClick={() => navigate(`/order/${row.id}`)}
                  >
                    {t.orderNow}
                  </Btn>
                </Td>
              </tr>
            )
          })}
        </GovTable>
      </div>
    </Page>
  )
}
