import React from 'react'
import { Link } from 'react-router-dom'
import { FileText, BarChart3, MessageSquare, Search, TrendingUp, Crown, ArrowRight } from 'lucide-react'
import { useAppStore } from '../lib/store'

const Anasayfa: React.FC = () => {
  const { user } = useAppStore()

  const features = [
    {
      icon: FileText,
      title: 'Dilekçe Yazma',
      description: 'AI destekli dilekçe hazırlama aracı ile hızlı ve etkili dilekçeler oluşturun.',
      link: '/dilekce-yazma',
      color: 'blue'
    },
    {
      icon: BarChart3,
      title: 'Dava Analizi',
      description: 'Dava dosyalarınızı yükleyin, AI ile risk analizi yapın ve strateji önerileri alın.',
      link: '/dava-analizi',
      color: 'green'
    },
    {
      icon: MessageSquare,
      title: 'Hukuk Asistanı',
      description: 'Hukuki sorularınızı sorun, emsal kararlar ve detaylı açıklamalar alın.',
      link: '/hukuk-asistani',
      color: 'purple'
    },
    {
      icon: Search,
      title: 'Yargıtay Arama',
      description: 'Yargıtay ve Danıştay kararlarında semantik arama yapın.',
      link: '/yargitay-arama',
      color: 'orange'
    }
  ]

  return (
    <div className="modern-homepage">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <div className="welcome-text">
            <h1 className="welcome-title">
              Hoş geldiniz, {user?.first_name || user?.email?.split('@')[0]}! 👋
            </h1>
            <p className="welcome-subtitle">
              YargıZeka ile hukuki süreçlerinizi hızlandırın ve verimliliğinizi artırın.
            </p>
          </div>
          <div className="welcome-stats">
            <div className="stat-item">
              <TrendingUp size={20} />
              <span>%95 zaman tasarrufu</span>
            </div>
            <div className="stat-item">
              <Crown size={20} />
              <span>{user?.subscription_tier === 'free' ? 'Ücretsiz Plan' : 'Premium Plan'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="features-section">
        <h2 className="section-title">AI Destekli Hukuk Araçları</h2>
        <div className="modern-features-grid">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className={`modern-feature-card feature-${feature.color}`}
            >
              <div className="feature-header">
                <div className="feature-icon">
                  <feature.icon size={28} />
                </div>
                <ArrowRight size={16} className="feature-arrow" />
              </div>
              <div className="feature-content">
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
              <div className="feature-footer">
                <span className="feature-status">Hazır</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <h2 className="section-title">Kullanım İstatistikleri</h2>
        <div className="modern-stats-grid">
          <div className="modern-stat-card">
            <div className="stat-icon">
              <FileText size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">0</h3>
              <p className="stat-label">Hazırlanan Dilekçe</p>
            </div>
          </div>
          <div className="modern-stat-card">
            <div className="stat-icon">
              <BarChart3 size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">0</h3>
              <p className="stat-label">Analiz Edilen Dava</p>
            </div>
          </div>
          <div className="modern-stat-card">
            <div className="stat-icon">
              <MessageSquare size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">0</h3>
              <p className="stat-label">Yapılan Sohbet</p>
            </div>
          </div>
          <div className="modern-stat-card">
            <div className="stat-icon">
              <Search size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">0</h3>
              <p className="stat-label">Yapılan Arama</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Section */}
      <div className="subscription-section">
        <div className="modern-subscription-card">
          <div className="subscription-header">
            <div className="subscription-icon">
              <Crown size={24} />
            </div>
            <div className="subscription-info">
              <h3 className="subscription-tier">
                {user?.subscription_tier === 'free' ? 'Ücretsiz Plan' : 
                 user?.subscription_tier === 'basic' ? 'Temel Plan' : 'Premium Plan'}
              </h3>
              <p className="subscription-description">
                {user?.subscription_tier === 'free' ? 
                  'Günde 5 işlem hakkınız bulunmaktadır.' :
                  'Sınırsız işlem hakkınız bulunmaktadır.'}
              </p>
            </div>
          </div>
          {user?.subscription_tier === 'free' && (
            <div className="subscription-actions">
              <Link to="/profil" className="modern-upgrade-btn">
                <span>Planınızı Yükseltin</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Anasayfa