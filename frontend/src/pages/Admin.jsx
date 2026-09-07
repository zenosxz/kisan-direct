import { useEffect, useState } from 'react'
import { GovTable, Page, Panel, StatCard, StatusPill, Td } from '../components/ui'
import { useLang } from '../context/LangContext'
import { api } from '../lib/api'
import { inr } from '../lib/pricing'

const TABS = ['overview', 'transactions', 'priceImpact', 'disputes', 'reports']

export default function Admin() {
  const { t } = useLang()
  const [tab, setTab] = useState('overview')
  const [data, setData] = useState({
    orders: [],
    farmerEarnings: [],
    buyerSavings: [],
    disputes: [],
  })
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .adminSummary()
      .then(setData)
      .catch((e) => setError(e.message))
  }, [])

  const paid = (data.orders || []).filter((o) => o.status === 'paid' || o.status === 'accepted')
  const gmv = paid.reduce((s, o) => s + Number(o.amount || 0), 0)
  const savings = (data.buyerSavings || []).reduce((s, r) => s + Number(r.savings || 0), 0)

  return (
    <Page title={t.admin} subtitle="Management Information System">
      <div className="mb-5 flex flex-wrap border border-slate-300 bg-white">
        {TABS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-sm font-semibold ${
              tab === id ? 'bg-navy text-white' : 'text-navy hover:bg-slate-50'
            }`}
          >
            {t[id]}
          </button>
        ))}
      </div>
      {error && <p className="mb-4 text-sm text-red-700">{error}</p>}

      {tab === 'overview' && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Gross merchandise" value={inr(gmv)} />
          <StatCard label="Paid orders" value={paid.length} />
          <StatCard label="Buyer savings" value={inr(savings)} />
        </div>
      )}

      {tab === 'transactions' && (
        <Panel title={t.transactions}>
          <GovTable
            headers={['Order', t.commodity, 'Amount', t.status, 'Payment ID']}
            empty={(data.orders || []).length === 0 ? 'No transactions.' : null}
          >
            {(data.orders || []).map((o) => (
              <tr key={o.id}>
                <Td className="font-mono text-xs">{String(o.id).slice(0, 8)}</Td>
                <Td>{o.crop || o.listings?.crop}</Td>
                <Td>{inr(o.amount)}</Td>
                <Td>
                  <StatusPill value={o.status} />
                </Td>
                <Td className="font-mono text-xs">{o.razorpay_payment_id || '—'}</Td>
              </tr>
            ))}
          </GovTable>
        </Panel>
      )}

      {tab === 'priceImpact' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Farmer earnings">
            <GovTable
              headers={[t.farmerName, 'Paid total']}
              empty={(data.farmerEarnings || []).length === 0 ? 'No paid orders yet.' : null}
            >
              {(data.farmerEarnings || []).map((r) => (
                <tr key={r.farmer_id}>
                  <Td>{r.name || r.farmer_id}</Td>
                  <Td>{inr(r.total)}</Td>
                </tr>
              ))}
            </GovTable>
          </Panel>
          <Panel title="Buyer savings vs retail">
            <GovTable
              headers={['Buyer', 'Estimated savings']}
              empty={(data.buyerSavings || []).length === 0 ? 'No savings data.' : null}
            >
              {(data.buyerSavings || []).map((r) => (
                <tr key={r.buyer_id}>
                  <Td>{r.name || r.buyer_id}</Td>
                  <Td className="font-semibold text-india-green">{inr(r.savings)}</Td>
                </tr>
              ))}
            </GovTable>
          </Panel>
        </div>
      )}

      {tab === 'disputes' && (
        <Panel title={t.disputes}>
          <GovTable
            headers={['ID', 'Order', 'Reason', t.status]}
            empty={(data.disputes || []).length === 0 ? 'No disputes.' : null}
          >
            {(data.disputes || []).map((d) => (
              <tr key={d.id}>
                <Td className="font-mono text-xs">{String(d.id).slice(0, 8)}</Td>
                <Td className="font-mono text-xs">{String(d.order_id).slice(0, 8)}</Td>
                <Td>{d.reason}</Td>
                <Td>
                  <StatusPill value={d.status} />
                </Td>
              </tr>
            ))}
          </GovTable>
        </Panel>
      )}

      {tab === 'reports' && (
        <Panel title={t.reports}>
          <p className="text-sm text-slate-700">
            Downloadable statutory reports can be generated once the live Supabase dataset is connected. Current
            session totals: GMV {inr(gmv)}; {paid.length} settled orders; estimated consumer savings {inr(savings)}.
          </p>
        </Panel>
      )}
    </Page>
  )
}
