import React from 'react'
import { Bell, Settings, LogOut } from 'lucide-react'
import { useAppStore } from '../lib/store'
import { supabase } from '../lib/supabaseClient'

const Header: React.FC = () => {
  const { user, setUser, setAuthenticated } = useAppStore()

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
          <button className="header-action-btn" title="Bildirimler">
            <Bell size={18} />
          </button>
          <button className="header-action-btn" title="Ayarlar">
            <Settings size={18} />
          </button>
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