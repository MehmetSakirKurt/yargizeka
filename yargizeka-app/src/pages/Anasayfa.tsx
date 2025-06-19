import React from 'react'
import { Link } from 'react-router-dom'
import { FileText, BarChart3, MessageSquare, Search } from 'lucide-react'
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
    <div className="anasayfa">
      <div className="anasayfa-header">
        <h1 className="anasayfa-title">
          Hoş geldiniz, {user?.email?.split('@')[0]}!
        </h1>
        <p className="anasayfa-subtitle">
          YargıZeka ile hukuki süreçlerinizi hızlandırın ve verimliliğinizi artırın.
        </p>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => (
          <Link
            key={index}
            to={feature.link}
            className={`feature-card feature-card-${feature.color}`}
          >
            <div className="feature-icon">
              <feature.icon size={32} />
            </div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </Link>
        ))}
      </div>

      <div className="stats-section">
        <h2 className="stats-title">Kullanım İstatistikleri</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3 className="stat-number">0</h3>
            <p className="stat-label">Hazırlanan Dilekçe</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-number">0</h3>
            <p className="stat-label">Analiz Edilen Dava</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-number">0</h3>
            <p className="stat-label">Yapılan Sohbet</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-number">0</h3>
            <p className="stat-label">Yapılan Arama</p>
          </div>
        </div>
      </div>

      <div className="subscription-info">
        <h2 className="subscription-title">Abonelik Bilgileri</h2>
        <div className="subscription-card">
          <h3 className="subscription-tier">
            {user?.subscription_tier === 'free' ? 'Ücretsiz Plan' : 
             user?.subscription_tier === 'basic' ? 'Temel Plan' : 'Premium Plan'}
          </h3>
          <p className="subscription-description">
            {user?.subscription_tier === 'free' ? 
              'Günde 5 işlem hakkınız bulunmaktadır.' :
              'Sınırsız işlem hakkınız bulunmaktadır.'}
          </p>
          {user?.subscription_tier === 'free' && (
            <Link to="/profil" className="upgrade-btn">
              Planınızı Yükseltin
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Anasayfa