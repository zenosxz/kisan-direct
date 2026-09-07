import { onAuthStateChanged, signOut } from 'firebase/auth'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { auth } from '../firebase'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)
      if (!user) {
        setProfile(null)
        setLoading(false)
        return
      }
      try {
        const phone = user.phoneNumber
        const data = await api.getUserByPhone(phone)
        setProfile(data.user || null)
      } catch {
        setProfile(null)
      } finally {
        setLoading(false)
      }
    })
    return unsub
  }, [])

  const refreshProfile = async () => {
    if (!firebaseUser?.phoneNumber) return
    const data = await api.getUserByPhone(firebaseUser.phoneNumber)
    setProfile(data.user || null)
  }

  const logout = async () => {
    await signOut(auth)
    setProfile(null)
  }

  const value = useMemo(
    () => ({ firebaseUser, profile, loading, refreshProfile, logout, setProfile }),
    [firebaseUser, profile, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
