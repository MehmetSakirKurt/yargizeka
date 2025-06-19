import React, { useState, useEffect } from 'react'
import { User, Mail, CreditCard, Activity, Settings, Save } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAppStore } from '../lib/store'

interface UsageStats {
  petitions_generated: number
  cases_analyzed: number
  chat_messages: number
  searches_performed: number
  total_tokens_used: number
}

const Profil: React.FC = () => {
  const { user, setUser } = useAppStore()
  const [email, setEmail] = useState(user?.email || '')
  const [subscriptionTier, setSubscriptionTier] = useState(user?.subscription_tier || 'free')
  const [usageStats, setUsageStats] = useState<UsageStats>({
    petitions_generated: 0,
    cases_analyzed: 0,
    chat_messages: 0,
    searches_performed: 0,
    total_tokens_used: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadUsageStats()
  }, [])

  const loadUsageStats = async () => {
    try {
      const { data, error } = await supabase
        .from('yargizeka.usage_logs')
        .select('action_type, tokens_used')
        .eq('user_id', user?.user_id)

      if (error) throw error

      const stats = data.reduce((acc, log) => {
        acc.total_tokens_used += log.tokens_used || 0
        
        switch (log.action_type) {
          case 'petition_generated':
            acc.petitions_generated++
            break
          case 'case_analyzed':
            acc.cases_analyzed++
            break
          case 'chat_message':
            acc.chat_messages++
            break
          case 'legal_search':
            acc.searches_performed++
            break
        }
        
        return acc
      }, {
        petitions_generated: 0,
        cases_analyzed: 0,
        chat_messages: 0,
        searches_performed: 0,
        total_tokens_used: 0
      })

      setUsageStats(stats)
    } catch (error: any) {
      console.error('Kullanım istatistikleri yüklenirken hata:', error)
    }
  }

  const updateProfile = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { data, error } = await supabase
        .from('yargizeka.users')
        .update({
          email: email,
          subscription_tier: subscriptionTier,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.user_id)
        .select()
        .single()

      if (error) throw error

      setUser(data)
      setSuccess('Profil başarıyla güncellendi!')
    } catch (error: any) {
      console.error('Profil güncellenirken hata:', error)
      setError('Profil güncellenemedi')
    } finally {
      setLoading(false)
    }
  }

  const getSubscriptionLimits = (tier: string) => {
    switch (tier) {
      case 'free':
        return {
          name: 'Ücretsiz Plan',
          petitions: 5,
          analyses: 3,
          chats: 20,
          searches: 10,
          price: '₺0/ay'
        }
      case 'basic':
        return {
          name: 'Temel Plan',
          petitions: 50,
          analyses: 25,
          chats: 200,
          searches: 100,
          price: '₺99/ay'
        }
      case 'premium':
        return {
          name: 'Premium Plan',
          petitions: 'Sınırsız',
          analyses: 'Sınırsız',
          chats: 'Sınırsız',
          searches: 'Sınırsız',
          price: '₺299/ay'
        }
      default:
        return {
          name: 'Bilinmeyen Plan',
          petitions: 0,
          analyses: 0,
          chats: 0,
          searches: 0,
          price: '₺0/ay'
        }
    }
  }

  const currentPlan = getSubscriptionLimits(subscriptionTier)

  return (
    <div className="profil">
      <div className="page-header">
        <div className="page-title-section">
          <User className="page-icon" size={32} />
          <div>
            <h1 className="page-title">Profil</h1>
            <p className="page-subtitle">Hesap ayarları ve kullanım istatistikleri</p>
          </div>
        </div>
      </div>

      <div className="profil-content">
        <div className="profil-sections">
          <div className="profil-section">
            <div className="section-header">
              <Settings className="section-icon" size={24} />
              <h2 className="section-title">Hesap Bilgileri</h2>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Mail size={16} />
                E-posta Adresi
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="subscription" className="form-label">
                <CreditCard size={16} />
                Abonelik Planı
              </label>
              <select
                id="subscription"
                value={subscriptionTier}
                onChange={(e) => setSubscriptionTier(e.target.value)}
                className="form-select"
              >
                <option value="free">Ücretsiz Plan</option>
                <option value="basic">Temel Plan</option>
                <option value="premium">Premium Plan</option>
              </select>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                {success}
              </div>
            )}

            <button
              onClick={updateProfile}
              disabled={loading}
              className="update-profile-btn"
            >
              <Save size={16} />
              {loading ? 'Güncelleniyor...' : 'Profili Güncelle'}
            </button>
          </div>

          <div className="profil-section">
            <div className="section-header">
              <Activity className="section-icon" size={24} />
              <h2 className="section-title">Kullanım İstatistikleri</h2>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{usageStats.petitions_generated}</div>
                <div className="stat-label">Dilekçe Oluşturuldu</div>
                <div className="stat-limit">
                  Limit: {typeof currentPlan.petitions === 'number' ? currentPlan.petitions : currentPlan.petitions}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-number">{usageStats.cases_analyzed}</div>
                <div className="stat-label">Dava Analiz Edildi</div>
                <div className="stat-limit">
                  Limit: {typeof currentPlan.analyses === 'number' ? currentPlan.analyses : currentPlan.analyses}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-number">{usageStats.chat_messages}</div>
                <div className="stat-label">Sohbet Mesajı</div>
                <div className="stat-limit">
                  Limit: {typeof currentPlan.chats === 'number' ? currentPlan.chats : currentPlan.chats}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-number">{usageStats.searches_performed}</div>
                <div className="stat-label">Arama Yapıldı</div>
                <div className="stat-limit">
                  Limit: {typeof currentPlan.searches === 'number' ? currentPlan.searches : currentPlan.searches}
                </div>
              </div>
            </div>

            <div className="usage-summary">
              <h3>Toplam Token Kullanımı</h3>
              <div className="token-usage">
                <span className="token-count">{usageStats.total_tokens_used.toLocaleString()}</span>
                <span className="token-label">token</span>
              </div>
            </div>
          </div>

          <div className="profil-section">
            <div className="section-header">
              <CreditCard className="section-icon" size={24} />
              <h2 className="section-title">Mevcut Plan: {currentPlan.name}</h2>
            </div>

            <div className="subscription-info">
              <div className="plan-price">{currentPlan.price}</div>
              
              <div className="plan-features">
                <h4>Plan Özellikleri:</h4>
                <ul>
                  <li>Aylık {currentPlan.petitions} dilekçe oluşturma</li>
                  <li>Aylık {currentPlan.analyses} dava analizi</li>
                  <li>Aylık {currentPlan.chats} sohbet mesajı</li>
                  <li>Aylık {currentPlan.searches} arama</li>
                </ul>
              </div>

              {subscriptionTier === 'free' && (
                <div className="upgrade-section">
                  <h4>Planınızı Yükseltin</h4>
                  <p>Daha fazla özellik ve sınırsız kullanım için premium planlara geçin.</p>
                  <div className="plan-options">
                    <div className="plan-option">
                      <h5>Temel Plan</h5>
                      <p>₺99/ay</p>
                      <button className="upgrade-btn">Temel Plana Geç</button>
                    </div>
                    <div className="plan-option">
                      <h5>Premium Plan</h5>
                      <p>₺299/ay</p>
                      <button className="upgrade-btn premium">Premium Plana Geç</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profil