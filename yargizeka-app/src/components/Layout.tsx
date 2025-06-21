import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAppStore } from '../lib/store'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAppStore()

  console.log('🖥️ Layout render:', {
    isAuthenticated,
    isLoading, 
    hasUser: !!user,
    userEmail: user?.email
  })

  if (isLoading) {
    console.log('⏳ Layout: Loading ekranı gösteriliyor')
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>YargıZeka Yükleniyor...</p>
        <small style={{ marginTop: '1rem', opacity: 0.7, fontSize: '0.9rem' }}>
          Kullanıcı doğrulanıyor...
        </small>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('🚫 Layout: Giriş yapmamış, login sayfasına yönlendiriliyor')
    return <Navigate to="/login" replace />
  }

  console.log('✅ Layout: Ana layout gösteriliyor')

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout