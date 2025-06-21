import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAppStore } from '../lib/store'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAppStore()

  console.log('Layout render - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'user:', user)

  // Loading durumu çok uzun sürerse bypass et
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log('Layout: Loading çok uzun sürdü, bypass ediliyor')
        const store = useAppStore.getState()
        store.setLoading(false)
      }
    }, 5000) // 5 saniye

    return () => clearTimeout(timer)
  }, [isLoading])

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Yükleniyor...</p>
        <button 
          onClick={() => useAppStore.getState().setLoading(false)}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          Devam Et
        </button>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    console.log('Kullanıcı authenticated değil veya user bilgisi yok, login\'e yönlendiriliyor')
    return <Navigate to="/login" replace />
  }

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