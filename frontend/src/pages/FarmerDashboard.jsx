import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Btn, GovTable, Page, StatCard, StatusPill, Td } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { api } from '../lib/api'
import { inr } from '../lib/pricing'

export default function FarmerDashboard() {
  const { t } = useLang()
  const { profile } = useAuth()
  const [stats, setStats] = useState({
    earnings: 0,
    activeListings: 0,
    pendingOrders: 0,
    listings: [],
    orders: [],
    nudge: null,
  })
  const [mandiByCrop, setMandiByCrop] = useState({})
  const [error, setError] = useState('')

  const load = () => {
    if (!profile?.id) return
    api
      .farmerStats(profile.id)
      .then(async (s) => {
        setStats(s)
        const crops = [...new Set((s.listings || []).map((l) => l.crop))]
        const entries = await Promise.all(
          crops.map(async (crop) => {
            try {
              const m = await api.mandi(crop, profile.state)
              return [crop, m]
            } catch {
              return [crop, null]
            }
          }),
        )
        setMandiByCrop(Object.fromEntries(entries))
      })
      .catch((e) => setError(e.message))
  }

  useEffect(load, [profile])

  const act = async (id, status) => {
    try {
      await api.updateOrderStatus(id, status)
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  const pending = (stats.orders || []).filter((o) => ['pending', 'paid'].includes(o.status))

  return (
    <Page
      title={t.dashboard}
      subtitle={`${profile?.name || ''} · ${profile?.district || ''}, ${profile?.state || ''}`}
      actions={
        <Link to="/listings/new" className="inline-flex bg-saffron px-4 py-2 text-sm font-semibold text-navy">
          {t.newListing}
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t.earnings} value={inr(stats.earnings)} />
        <StatCard label={t.activeListings} value={stats.activeListings ?? 0} />
        <StatCard label={t.pendingOrders} value={pending.length} />
      </div>

      <div className="mt-5">
        <Alert>
          <p className="font-semibold text-navy">{t.aiNudge}</p>
          <p className="mt-1">
            {stats.nudge ||
              'Publish a listing to receive Agmarknet-based pricing guidance for your crop and state.'}
          </p>
        </Alert>
      </div>

      {error && (
        <div className="mt-4">
          <Alert tone="red">{error}</Alert>
        </div>
      )}

      <h2 className="mt-8 mb-2 text-sm font-bold tracking-wide text-navy uppercase">{t.activeListings}</h2>
      <GovTable
        headers={[t.crop, t.qty, t.directPrice, t.mandiRate, t.status, t.action]}
        empty={(stats.listings || []).length === 0 ? 'No listings yet.' : null}
      >
        {(stats.listings || []).map((row) => {
          const mandi = mandiByCrop[row.crop]?.modal_price
          return (
            <tr key={row.id}>
              <Td>{row.crop}</Td>
              <Td>{row.quantity}</Td>
              <Td>{inr(row.price_per_quintal)}</Td>
              <Td>{mandi ? inr(mandi) : '—'}</Td>
              <Td>
                <StatusPill value={row.status} />
              </Td>
              <Td>
                {row.status === 'active' && (
                  <Link className="text-sm font-semibold text-navy underline" to="/listings/new">
                    {t.newListing}
                  </Link>
                )}
              </Td>
            </tr>
          )
        })}
      </GovTable>

      <h2 className="mt-8 mb-2 text-sm font-bold tracking-wide text-navy uppercase">{t.pendingOrders}</h2>
      <GovTable
        headers={['Order', t.qty, 'Amount', t.status, t.action]}
        empty={pending.length === 0 ? 'No pending orders.' : null}
      >
        {pending.map((o) => (
          <tr key={o.id}>
            <Td className="font-mono text-xs">{String(o.id).slice(0, 8)}</Td>
            <Td>{o.quantity}</Td>
            <Td>{inr(o.amount)}</Td>
            <Td>
              <StatusPill value={o.status} />
            </Td>
            <Td>
              <div className="flex gap-2">
                <Btn variant="green" className="px-3 py-1 text-xs" type="button" onClick={() => act(o.id, 'accepted')}>
                  {t.accept}
                </Btn>
                <Btn variant="danger" className="px-3 py-1 text-xs" type="button" onClick={() => act(o.id, 'declined')}>
                  {t.decline}
                </Btn>
              </div>
            </Td>
          </tr>
        ))}
      </GovTable>
    </Page>
  )
}
