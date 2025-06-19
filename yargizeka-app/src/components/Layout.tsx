import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAppStore } from '../lib/store'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAppStore()

  console.log('Layout render - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'user:', user)

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Yükleniyor...</p>
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