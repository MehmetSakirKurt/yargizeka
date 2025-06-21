import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  FileText, 
  BarChart3, 
  MessageSquare, 
  Search, 
  User 
} from 'lucide-react'

const Sidebar: React.FC = () => {
  const menuItems = [
    { path: '/', icon: Home, label: 'Ana Sayfa' },
    { path: '/dilekce-yazma', icon: FileText, label: 'Dilekçe Yazma' },
    { path: '/dava-analizi', icon: BarChart3, label: 'Dava Analizi' },
    { path: '/hukuk-asistani', icon: MessageSquare, label: 'Hukuk Asistanı' },
    { path: '/yargitay-arama', icon: Search, label: 'Yargıtay Arama' },
    { path: '/profil', icon: User, label: 'Profil' },
  ]

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img 
            src="/logo.png" 
            alt="YargıZeka Logo" 
            className="sidebar-logo-image"
            onError={(e) => {
              // Logo bulunamazsa gizle ve sadece text göster
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <h1 className="sidebar-title">YargıZeka</h1>
        <p className="sidebar-subtitle">Hukuk Asistanınız</p>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="sidebar-nav-icon" size={20} />
            <span className="sidebar-nav-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <p className="sidebar-version">v1.0.0</p>
      </div>
    </div>
  )
}

export default Sidebar