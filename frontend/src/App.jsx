import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { LangProvider } from './context/LangContext'
import Admin from './pages/Admin'
import FarmerDashboard from './pages/FarmerDashboard'
import { InfoPage, SitemapPage } from './pages/Info'
import Login from './pages/Login'
import Marketplace from './pages/Marketplace'
import NewListing from './pages/NewListing'
import Order from './pages/Order'
import Register from './pages/Register'

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="flex min-h-screen flex-col bg-white">
            <Header />
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<InfoPage id="about" />} />
              <Route path="/privacy" element={<InfoPage id="privacy" />} />
              <Route path="/rti" element={<InfoPage id="rti" />} />
              <Route path="/grievance" element={<InfoPage id="grievance" />} />
              <Route path="/contact" element={<InfoPage id="contact" />} />
              <Route path="/sitemap" element={<SitemapPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute roles={['farmer', 'fpo_agent', 'admin']}>
                    <FarmerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/listings/new"
                element={
                  <ProtectedRoute roles={['farmer', 'fpo_agent', 'admin']}>
                    <NewListing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/marketplace"
                element={
                  <ProtectedRoute>
                    <Marketplace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order/:id"
                element={
                  <ProtectedRoute roles={['buyer', 'admin']}>
                    <Order />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LangProvider>
  )
}
