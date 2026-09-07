import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { firebaseUser, profile, loading } = useAuth()

  if (loading) {
    return (
      <main id="main-content" className="flex flex-1 items-center justify-center text-sm text-navy">
        Loading services…
      </main>
    )
  }

  if (!firebaseUser) return <Navigate to="/" replace />
  if (!profile) return <Navigate to="/register" replace />
  if (roles && !roles.includes(profile.role)) return <Navigate to="/marketplace" replace />

  return children
}
