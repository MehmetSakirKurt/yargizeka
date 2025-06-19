import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAppStore } from '../lib/store'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAppStore()

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Yükleniyor...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/giris" replace />
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