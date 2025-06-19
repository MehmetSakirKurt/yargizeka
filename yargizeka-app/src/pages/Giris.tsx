import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAppStore } from '../lib/store'

const Giris: React.FC = () => {
  const { isAuthenticated } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        alert('Kayıt başarılı! Lütfen e-postanızı kontrol edin.')
      }
    } catch (error: any) {
      setError(error.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">YargıZeka</h1>
          <p className="auth-subtitle">Hukuk Profesyonelleri için AI Destekli Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">E-posta</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Şifre</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-submit-btn"
          >
            {loading ? 'Yükleniyor...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
          </button>

          <div className="auth-toggle">
            <p>
              {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="auth-toggle-btn"
              >
                {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Giris