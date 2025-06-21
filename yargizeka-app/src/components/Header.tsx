import React, { useState } from 'react'
import { Bell, Settings, LogOut } from 'lucide-react'
import { useAppStore } from '../lib/store'
import { supabase } from '../lib/supabaseClient'

const Header: React.FC = () => {
  const { user, setUser, setAuthenticated } = useAppStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setAuthenticated(false)
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error)
    }
  }

  return (
    <header className="header">
      <div className="header-left">
        <h2 className="header-title">Hoş geldiniz</h2>
      </div>
      
      <div className="header-right">
        <div className="header-user-info">
          <span className="header-user-name">
            {user?.first_name && user?.last_name 
              ? `${user.first_name} ${user.last_name}` 
              : user?.email}
          </span>
          <span className="header-user-profession">{user?.profession}</span>
          <span className="header-user-tier">{user?.subscription_tier}</span>
        </div>
        
        <div className="header-actions">
          <div className="header-action-wrapper">
            <button 
              className="header-action-btn" 
              title="Bildirimler"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={18} />
              <span className="notification-badge">3</span>
            </button>
            {showNotifications && (
              <div className="dropdown-menu notifications-dropdown">
                <div className="dropdown-header">
                  <h3>Bildirimler</h3>
                </div>
                <div className="dropdown-content">
                  <div className="notification-item">
                    <div className="notification-title">Yeni dilekçe şablonu</div>
                    <div className="notification-text">İş hukuku dilekçe şablonu eklendi</div>
                    <div className="notification-time">2 saat önce</div>
                  </div>
                  <div className="notification-item">
                    <div className="notification-title">Sistem güncellemesi</div>
                    <div className="notification-text">Yeni özellikler eklendi</div>
                    <div className="notification-time">1 gün önce</div>
                  </div>
                  <div className="notification-item">
                    <div className="notification-title">Hesap doğrulandı</div>
                    <div className="notification-text">E-posta adresiniz doğrulandı</div>
                    <div className="notification-time">3 gün önce</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="header-action-wrapper">
            <button 
              className="header-action-btn" 
              title="Ayarlar"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings size={18} />
            </button>
            {showSettings && (
              <div className="dropdown-menu settings-dropdown">
                <div className="dropdown-header">
                  <h3>Ayarlar</h3>
                </div>
                <div className="dropdown-content">
                  <button className="dropdown-item">
                    <span>Hesap Ayarları</span>
                  </button>
                  <button className="dropdown-item">
                    <span>Bildirim Tercihleri</span>
                  </button>
                  <button className="dropdown-item">
                    <span>Abonelik Planı</span>
                  </button>
                  <button className="dropdown-item">
                    <span>Gizlilik Ayarları</span>
                  </button>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item">
                    <span>Yardım & Destek</span>
                  </button>
                  <button className="dropdown-item">
                    <span>Hakkında</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          <button 
            className="header-action-btn logout-btn" 
            onClick={handleLogout}
            title="Çıkış Yap"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header