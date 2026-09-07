import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LangContext'

const LINKS = [
  { to: '/', key: 'home' },
  { to: '/about', key: 'about' },
  { to: '/privacy', key: 'privacy' },
  { to: '/rti', key: 'rti' },
  { to: '/grievance', key: 'grievance' },
  { to: '/sitemap', key: 'sitemap' },
  { to: '/contact', key: 'contact' },
]

export default function Footer() {
  const { t } = useLang()
  const [visitors, setVisitors] = useState(1284732)

  useEffect(() => {
    const key = 'kd-visitors'
    const n = Number(localStorage.getItem(key) || 1284732) + 1
    localStorage.setItem(key, String(n))
    setVisitors(n)
  }, [])

  return (
    <footer className="mt-auto bg-navy-dark text-slate-200">
      <div className="mx-auto flex max-w-7xl flex-wrap gap-x-5 gap-y-2 px-4 py-5 text-sm">
        {LINKS.map((l) => (
          <Link key={l.to} className="hover:text-saffron" to={l.to}>
            {t[l.key]}
          </Link>
        ))}
      </div>
      <div className="border-t border-white/10 bg-navy">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs">
          <p>{t.copyright}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span>
              {t.visitors}: <strong className="text-white">{visitors.toLocaleString('en-IN')}</strong>
            </span>
            <span className="border border-white/40 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
              {t.nic}
            </span>
            <span className="border border-india-green px-2 py-0.5 text-[10px] font-semibold tracking-wide text-green-300 uppercase">
              {t.gigw}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
