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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error

      // Başarılı giriş sonrası kullanıcı profilini çek ve store'u güncelle
      if (data.user) {
        console.log('Login başarılı, kullanıcı ID:', data.user.id)
        // Auth state listener App.tsx'te bu değişikliği yakalayacak
      }
    } catch (error: any) {
      console.error('Login hatası:', error)
      
      // Daha kullanıcı dostu hata mesajları
      let errorMessage = 'Bir hata oluştu'
      
      if (error.message === 'Email not confirmed') {
        errorMessage = 'E-posta adresiniz doğrulanmamış. Lütfen e-postanızı kontrol edin ve doğrulama linkine tıklayın.'
      } else if (error.message === 'Invalid login credentials') {
        errorMessage = 'E-posta adresi veya şifre hatalı. Lütfen tekrar deneyin.'
      } else if (error.message === 'Too many requests') {
        errorMessage = 'Çok fazla giriş denemesi yaptınız. Lütfen birkaç dakika bekleyin.'
      } else {
        errorMessage = error.message || 'Giriş yapılırken bir hata oluştu'
      }
      
      setError(errorMessage)
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