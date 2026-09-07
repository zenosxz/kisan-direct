import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { copy } from '../i18n'

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('kd-lang') || 'en')

  useEffect(() => {
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en'
  }, [lang])

  const value = useMemo(() => {
    const toggle = () => {
      const next = lang === 'en' ? 'hi' : 'en'
      localStorage.setItem('kd-lang', next)
      setLang(next)
    }
    return { lang, t: copy[lang], toggle }
  }, [lang])

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}
