import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Mail, CheckCircle, AlertCircle, Shield, ArrowRight, RefreshCw } from 'lucide-react'

const EmailVerification: React.FC = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleResendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      })

      if (error) throw error

      setMessage('Doğrulama e-postası tekrar gönderildi. Lütfen e-posta kutunuzu kontrol edin.')
    } catch (error: any) {
      setError(error.message || 'E-posta gönderilirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modern-auth-container">
      <div className="modern-auth-card verification-card">
        {/* Header */}
        <div className="modern-auth-header">
          <div className="brand-section">
            <div className="brand-icon">
              <Shield size={32} />
            </div>
            <h1 className="brand-title">YargıZeka</h1>
          </div>
          <p className="brand-subtitle">E-posta doğrulama</p>
        </div>

        {/* Verification Content */}
        <div className="verification-content">
          <div className="verification-icon">
            <div className="icon-wrapper">
              <Mail size={48} />
            </div>
          </div>
          
          <div className="form-section">
            <h2 className="form-title">E-posta Doğrulama Gerekli</h2>
            <p className="form-subtitle">
              Kayıt işleminiz başarıyla tamamlandı! Hesabınızı aktifleştirmek için e-posta adresinize gönderilen doğrulama linkine tıklayın.
            </p>
          </div>

          <div className="verification-steps">
            <div className="step-item completed">
              <CheckCircle size={20} />
              <span>Kayıt işlemi tamamlandı</span>
            </div>
            <div className="step-item pending">
              <AlertCircle size={20} />
              <span>E-posta doğrulama bekleniyor</span>
            </div>
          </div>

          <div className="verification-info">
            <h3>Sonraki Adımlar:</h3>
            <ol>
              <li>E-posta kutunuzu kontrol edin</li>
              <li>YargıZeka'dan gelen doğrulama e-postasını bulun</li>
              <li>E-postadaki "Hesabımı Doğrula" linkine tıklayın</li>
              <li>Doğrulama tamamlandıktan sonra giriş yapın</li>
            </ol>
          </div>

          <div className="resend-section">
            <p className="resend-title">E-posta gelmediyse:</p>
            <form onSubmit={handleResendEmail} className="resend-form">
              <div className="input-group">
                <label htmlFor="email" className="modern-label">E-posta Adresi</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={20} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    className="modern-input"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="modern-submit-btn secondary"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                <span>{loading ? 'Gönderiliyor...' : 'Tekrar Gönder'}</span>
              </button>
            </form>

            {message && (
              <div className="modern-success">
                <div className="success-content">
                  <span className="success-icon">✅</span>
                  <span>{message}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="modern-error">
                <div className="error-content">
                  <span className="error-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>

          <div className="auth-footer">
            <div className="login-section">
              <span>E-postanızı doğruladınız mı? </span>
              <Link to="/login" className="login-link">
                <span>Giriş Yapın</span>
                <ArrowRight size={16} />
              </Link>
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

export default EmailVerification