import React, { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAppStore } from '../lib/store'

const Login: React.FC = () => {
  const { isAuthenticated, user } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  console.log('🔐 Login sayfa render:', { isAuthenticated, hasUser: !!user })

  if (isAuthenticated) {
    console.log('✅ Login: Zaten giriş yapmış, ana sayfaya yönlendiriliyor')
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error

      if (data.user) {
        console.log('🎉 Login başarılı, user:', data.user.email)
        // Auth state otomatik olarak App.tsx'deki onAuthStateChange ile handle edilecek
        // Bu yüzden manual olarak setLoading(false) yapmıyoruz
      }
    } catch (error: any) {
      console.error('❌ Login hatası:', error)
      let errorMessage = 'Giriş yapılamadı'
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'E-posta veya şifre hatalı'
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'E-posta doğrulanmamış'
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Çok fazla deneme, lütfen bekleyin'
      }
      
      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div className="modern-auth-container">
      <div className="modern-auth-card">
        {/* Header */}
        <div className="modern-auth-header">
          <div className="brand-section">
            <div className="brand-icon">
              <Shield size={32} />
            </div>
            <h1 className="brand-title">YargıZeka</h1>
          </div>
          <p className="brand-subtitle">Hukuk dünyasının AI destekli geleceği</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modern-auth-form">
          <div className="form-section">
            <h2 className="form-title">Hesabınıza Giriş Yapın</h2>
            <p className="form-subtitle">Hukuki işlerinizi AI ile hızlandırın</p>
          </div>

          <div className="input-group">
            <label htmlFor="email" className="modern-label">E-posta Adresi</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="modern-input"
                placeholder="ornek@email.com"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password" className="modern-label">Şifre</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="modern-input"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="modern-error">
              <div className="error-content">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="modern-submit-btn"
          >
            <span>{loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</span>
            {!loading && <ArrowRight size={20} />}
          </button>

          <div className="auth-divider">
            <span>veya</span>
          </div>

          <div className="auth-footer">
            <Link to="/forgot-password" className="modern-link">
              Şifrenizi mi unuttunuz?
            </Link>
            
            <div className="signup-section">
              <span>Hesabınız yok mu? </span>
              <Link to="/register" className="signup-link">
                Hemen Kayıt Olun
              </Link>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="auth-card-footer">
          <div className="feature-list">
            <div className="feature-item">
              <span>🤖</span>
              <span>AI Destekli Dilekçe</span>
            </div>
            <div className="feature-item">
              <span>⚡</span>
              <span>Hızlı Dava Analizi</span>
            </div>
            <div className="feature-item">
              <span>🔍</span>
              <span>Yargıtay Arama</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Design */}
      <div className="auth-background">
        <div className="bg-pattern"></div>
      </div>
    </div>
  )
}

export default Login