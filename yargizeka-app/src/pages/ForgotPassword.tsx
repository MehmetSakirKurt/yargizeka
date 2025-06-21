import React, { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Mail, ArrowLeft, Shield, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAppStore } from '../lib/store'

const ForgotPassword: React.FC = () => {
  const { isAuthenticated } = useAppStore()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      
      if (error) throw error
      
      setSuccess('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen e-postanızı kontrol edin.')
      setEmail('')
    } catch (error: any) {
      setError(error.message || 'Bir hata oluştu')
    } finally {
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
          <p className="brand-subtitle">Şifrenizi sıfırlayın</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modern-auth-form">
          <div className="form-section">
            <h2 className="form-title">Şifre Sıfırlama</h2>
            <p className="form-subtitle">E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim</p>
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

          {error && (
            <div className="modern-error">
              <div className="error-content">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="modern-success">
              <div className="success-content">
                <span className="success-icon">✅</span>
                <span>{success}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="modern-submit-btn"
          >
            <span>{loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}</span>
            {!loading && <ArrowRight size={20} />}
          </button>

          <div className="auth-footer">
            <Link to="/login" className="modern-back-link">
              <ArrowLeft size={16} />
              <span>Giriş sayfasına dön</span>
            </Link>
          </div>
        </form>
      </div>

      {/* Background Design */}
      <div className="auth-background">
        <div className="bg-pattern"></div>
      </div>
    </div>
  )
}

export default ForgotPassword