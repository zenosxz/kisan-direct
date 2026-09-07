import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Btn, Field, Input, Page, Panel, Select } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { api } from '../lib/api'
import { DISTRICTS, STATES } from '../lib/india'

const ROLES = [
  { id: 'farmer', key: 'farmer' },
  { id: 'buyer', key: 'buyer' },
  { id: 'fpo_agent', key: 'fpo' },
]

export default function Register() {
  const { t } = useLang()
  const { firebaseUser, profile, loading, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const intent = sessionStorage.getItem('kd-intent')
  const [form, setForm] = useState({
    role: intent === 'buyer' ? 'buyer' : 'farmer',
    name: '',
    state: 'Maharashtra',
    district: 'Pune',
    upi_id: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!firebaseUser) navigate('/', { replace: true })
    if (profile) navigate(profile.role === 'buyer' ? '/marketplace' : '/dashboard', { replace: true })
  }, [firebaseUser, profile, loading, navigate])

  const districts = DISTRICTS[form.state] || []

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.upi_id.trim()) {
      setError('Name and UPI ID are required')
      return
    }
    setBusy(true)
    try {
      await api.upsertUser({
        firebase_uid: firebaseUser.uid,
        phone: firebaseUser.phoneNumber,
        ...form,
      })
      await refreshProfile()
      navigate(form.role === 'buyer' ? '/marketplace' : '/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page title={t.register} subtitle={firebaseUser?.phoneNumber}>
      <Panel title={t.register} className="mx-auto max-w-2xl">
        <form className="space-y-5" onSubmit={submit}>
          <fieldset>
            <legend className="text-sm font-semibold text-navy">{t.role}</legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, role: r.id }))}
                  className={`border px-2 py-3 text-sm font-semibold ${
                    form.role === r.id ? 'border-navy bg-navy text-white' : 'border-slate-300 bg-white text-navy'
                  }`}
                >
                  {t[r.key]}
                </button>
              ))}
            </div>
          </fieldset>

          <Field label={t.name}>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label={t.state}>
            <Select
              value={form.state}
              onChange={(e) => {
                const state = e.target.value
                setForm((f) => ({ ...f, state, district: (DISTRICTS[state] || [''])[0] }))
              }}
            >
              {STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label={t.district}>
            <Select value={form.district} onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}>
              {districts.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </Select>
          </Field>
          <Field label={t.upi}>
            <Input
              placeholder="name@upi"
              value={form.upi_id}
              onChange={(e) => setForm((f) => ({ ...f, upi_id: e.target.value }))}
            />
          </Field>
          {error && <Alert tone="red">{error}</Alert>}
          <Btn variant="navy" disabled={busy} type="submit">
            {busy ? '…' : t.save}
          </Btn>
        </form>
      </Panel>
    </Page>
  )
}
