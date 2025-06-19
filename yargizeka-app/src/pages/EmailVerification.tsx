import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'

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
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="verification-icon">
            <Mail size={48} color="#3182ce" />
          </div>
          <h1 className="auth-title">E-posta Doğrulama</h1>
          <p className="auth-subtitle">
            Kayıt işleminiz başarıyla tamamlandı! Hesabınızı aktifleştirmek için e-posta adresinize gönderilen doğrulama linkine tıklayın.
          </p>
        </div>

        <div className="verification-steps">
          <div className="step">
            <CheckCircle size={20} color="#38a169" />
            <span>Kayıt işlemi tamamlandı</span>
          </div>
          <div className="step">
            <AlertCircle size={20} color="#ed8936" />
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
          <p>E-posta gelmediyse:</p>
          <form onSubmit={handleResendEmail} className="resend-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta adresinizi girin"
              className="form-input"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="btn btn-secondary"
            >
              {loading ? 'Gönderiliyor...' : 'Tekrar Gönder'}
            </button>
          </form>

          {message && (
            <div className="success-message">
              {message}
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        <div className="auth-toggle">
          <p>
            E-postanızı doğruladınız mı?
            <Link to="/login" className="auth-toggle-btn">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmailVerification