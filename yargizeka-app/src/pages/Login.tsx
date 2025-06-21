import React, { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAppStore } from '../lib/store'

const Login: React.FC = () => {
  const { isAuthenticated } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      console.log('Giriş yapılıyor...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('Auth error:', error)
        throw error
      }

      if (data.user) {
        console.log('Login başarılı, kullanıcı:', data.user.email)
        // Auth state listener otomatik olarak yakalar, sadece bekle
      }
    } catch (error: any) {
      console.error('Login hatası:', error)
      
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
    // Not: setLoading(false) işlemini App.tsx'teki auth listener yapacak
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
            {loading ? 'Yükleniyor...' : 'Giriş Yap'}
          </button>

          <div className="auth-links">
            <Link to="/forgot-password" className="auth-link">
              Şifremi Unuttum
            </Link>
          </div>

          <div className="auth-toggle">
            <p>
              Hesabınız yok mu?
              <Link to="/register" className="auth-toggle-btn">
                Kayıt Ol
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login