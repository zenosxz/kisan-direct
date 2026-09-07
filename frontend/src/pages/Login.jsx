import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, Btn, Field, Input, Page, Panel } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { auth } from '../firebase'
import { api } from '../lib/api'

export default function Login() {
  const { t } = useLang()
  const { firebaseUser, profile, loading } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const intent = params.get('intent') || 'farmer'
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [step, setStep] = useState('phone')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const recaptchaRef = useRef(null)
  const otpRefs = useRef([])

  useEffect(() => {
    sessionStorage.setItem('kd-intent', intent)
  }, [intent])

  useEffect(() => {
    if (loading) return
    if (firebaseUser && profile) {
      navigate(profile.role === 'buyer' ? '/marketplace' : '/dashboard', { replace: true })
    } else if (firebaseUser && !profile) {
      navigate('/register', { replace: true })
    }
  }, [firebaseUser, profile, loading, navigate])

  const setupRecaptcha = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.clear()
      recaptchaRef.current = null
    }
    recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'normal',
      callback: () => {},
      'expired-callback': () => setError('Verification expired. Please try again.'),
    })
    return recaptchaRef.current
  }

  useEffect(() => {
    setupRecaptcha()
    return () => recaptchaRef.current?.clear()
  }, [])

  const sendOtp = async (e) => {
    e.preventDefault()
    setError('')
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 10) {
      setError(t.phoneInvalid)
      return
    }
    setBusy(true)
    try {
      const verifier = recaptchaRef.current || setupRecaptcha()
      window.kdConfirmation = await signInWithPhoneNumber(auth, `+91${digits}`, verifier)
      setStep('otp')
      setTimeout(() => otpRefs.current[0]?.focus(), 50)
    } catch (err) {
      setupRecaptcha()
      setError(err.message || 'Could not send OTP')
    } finally {
      setBusy(false)
    }
  }

  const verifyOtp = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (!/^\d{6}$/.test(code)) {
      setError(t.otpInvalid)
      return
    }
    setBusy(true)
    setError('')
    try {
      const result = await window.kdConfirmation.confirm(code)
      const data = await api.getUserByPhone(result.user.phoneNumber).catch(() => ({ user: null }))
      navigate(data.user ? (data.user.role === 'buyer' ? '/marketplace' : '/dashboard') : '/register', {
        replace: true,
      })
    } catch (err) {
      setError(err.message || 'Invalid OTP')
    } finally {
      setBusy(false)
    }
  }

  const onOtp = (i, value) => {
    const d = value.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[i] = d
    setOtp(next)
    if (d && i < 5) otpRefs.current[i + 1]?.focus()
  }

  return (
    <Page
      title={intent === 'buyer' ? t.buyerLogin : t.farmerLogin}
      subtitle={t.welcome}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title={t.login}>
          {step === 'phone' ? (
            <form className="space-y-4" onSubmit={sendOtp}>
              <Field label={t.mobile}>
                <div className="flex">
                  <span className="inline-flex items-center border border-r-0 border-slate-300 bg-slate-100 px-3 text-sm font-semibold text-navy">
                    +91
                  </span>
                  <Input
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  />
                </div>
              </Field>
              <p className="text-xs text-slate-500">{t.otpHint}</p>
              <p className="text-xs text-slate-500">{t.recaptcha}</p>
              {error && <Alert tone="red">{error}</Alert>}
              <Btn variant="navy" className="w-full" disabled={busy} type="submit">
                {busy ? '…' : t.sendOtp}
              </Btn>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={verifyOtp}>
              <p className="text-sm text-slate-600">OTP sent to +91 {phone}</p>
              <Field label={t.enterOtp}>
                <div className="flex gap-2">
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      className="h-12 w-12 border border-slate-300 text-center text-lg font-semibold text-navy outline-none focus:border-navy"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => onOtp(i, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
                      }}
                    />
                  ))}
                </div>
              </Field>
              {error && <Alert tone="red">{error}</Alert>}
              <Btn variant="green" className="w-full" disabled={busy} type="submit">
                {busy ? '…' : t.verify}
              </Btn>
              <Btn
                variant="outline"
                className="w-full"
                type="button"
                onClick={() => {
                  setStep('phone')
                  setOtp(['', '', '', '', '', ''])
                  setupRecaptcha()
                }}
              >
                {t.resend}
              </Btn>
            </form>
          )}
          <div id="recaptcha-container" className={`mt-4 min-h-[78px] ${step === 'otp' ? 'hidden' : ''}`} />
        </Panel>

        <Panel title={t.aboutPortal}>
          <ul className="list-disc space-y-2.5 pl-5 text-sm leading-relaxed text-slate-700">
            <li>Direct sale of produce from farmer / FPO to buyer, without unnecessary intermediaries.</li>
            <li>Live reference prices from Agmarknet (data.gov.in) for transparent discovery.</li>
            <li>UPI settlement through Razorpay in test mode for SIH demonstration.</li>
            <li>Ministry MIS for transactions, farmer earnings, buyer savings and disputes.</li>
            <li>Bilingual interface (English / Hindi) in line with GIGW guidance.</li>
          </ul>
          <div className="mt-5">
            <Alert>
              Use a genuine Indian mobile number. Firebase Phone Authentication sends a real SMS OTP. Ensure
              localhost is listed under Firebase authorized domains.
            </Alert>
          </div>
        </Panel>
      </div>
    </Page>
  )
}
