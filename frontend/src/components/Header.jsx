import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { Btn } from './ui'

export default function Header() {
  const { t, toggle, lang } = useLang()
  const { firebaseUser, profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const home = !firebaseUser
    ? '/'
    : profile?.role === 'admin'
      ? '/admin'
      : profile?.role === 'buyer'
        ? '/marketplace'
        : '/dashboard'

  return (
    <header>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-saffron focus:px-3 focus:py-2 focus:text-navy"
      >
        {t.skip}
      </a>
      <div className="grid h-1 grid-cols-3">
        <div className="bg-saffron" />
        <div className="bg-white" />
        <div className="bg-india-green" />
      </div>

      <div className="border-b-4 border-saffron bg-navy text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <Link to={home} className="flex min-w-0 items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white bg-navy-dark text-lg font-bold tracking-tight text-white">
              KD
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-saffron">{t.gov}</p>
              <h1 className="text-xl font-bold leading-tight tracking-wide text-white md:text-2xl">{t.portal}</h1>
              <p className="truncate text-[11px] text-slate-200">{t.ministry}</p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="border border-saffron px-2 py-1 text-[11px] font-bold tracking-wide text-saffron">
              {t.problem}
            </span>
            <button
              type="button"
              onClick={toggle}
              className="border border-white/70 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
            >
              {lang === 'en' ? 'हिन्दी' : 'English'}
            </button>
            {firebaseUser ? (
              <>
                <span className="hidden text-xs text-slate-200 sm:inline">{profile?.name || firebaseUser.phoneNumber}</span>
                <Btn
                  variant="saffron"
                  className="py-1.5 text-xs"
                  type="button"
                  onClick={async () => {
                    await logout()
                    navigate('/')
                  }}
                >
                  {t.logout}
                </Btn>
              </>
            ) : (
              <>
                <Link
                  to="/?intent=farmer"
                  className={`inline-flex px-3 py-1.5 text-xs font-semibold ${
                    location.search.includes('buyer') ? 'bg-saffron/90 text-navy' : 'bg-saffron text-navy'
                  }`}
                >
                  {t.farmerLogin}
                </Link>
                <Link
                  to="/?intent=buyer"
                  className="inline-flex bg-india-green px-3 py-1.5 text-xs font-semibold text-white"
                >
                  {t.buyerLogin}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {firebaseUser && profile && (
        <nav className="border-b border-slate-200 bg-white" aria-label="Primary">
          <div className="mx-auto flex max-w-7xl gap-0 overflow-x-auto px-4 text-sm">
            {profile.role !== 'buyer' && (
              <NavLink className={navClass} to="/dashboard">
                {t.dashboard}
              </NavLink>
            )}
            {(profile.role === 'farmer' || profile.role === 'fpo_agent') && (
              <NavLink className={navClass} to="/listings/new">
                {t.newListing}
              </NavLink>
            )}
            <NavLink className={navClass} to="/marketplace">
              {t.marketplace}
            </NavLink>
            {profile.role === 'admin' && (
              <NavLink className={navClass} to="/admin">
                {t.admin}
              </NavLink>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}

function navClass({ isActive }) {
  return `px-4 py-2.5 whitespace-nowrap border-b-2 ${
    isActive
      ? 'border-saffron font-semibold text-navy'
      : 'border-transparent text-slate-600 hover:text-navy'
  }`
}
