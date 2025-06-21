import React, { useState } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAppStore } from '../lib/store'

const Register: React.FC = () => {
  const { isAuthenticated } = useAppStore()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    profession: '',
    barAssociation: '',
    phone: '',
    city: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    // Form validasyonları
    if (!formData.firstName.trim()) {
      setError('Ad alanı zorunludur')
      setLoading(false)
      return
    }

    if (!formData.lastName.trim()) {
      setError('Soyad alanı zorunludur')
      setLoading(false)
      return
    }

    if (!formData.profession.trim()) {
      setError('Meslek alanı zorunludur')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      setLoading(false)
      return
    }

    try {
      // Supabase Auth ile kullanıcı kaydı (email confirmation kapalı)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            profession: formData.profession,
            bar_association: formData.barAssociation,
            phone: formData.phone,
            city: formData.city
          }
        }
      })

      if (authError) throw authError

      if (authData.user && !authData.user.email_confirmed_at) {
        // Email confirmation gerekiyorsa verification sayfasına yönlendir
        setTimeout(() => {
          navigate('/email-verification')
        }, 2000)
        setSuccess('Kayıt başarılı! E-posta doğrulama sayfasına yönlendiriliyorsunuz...')
      } else if (authData.user) {
        // Email confirmation gerektirmiyorsa direkt profil oluştur
        await createUserProfile(authData.user.id)
        setSuccess('Kayıt başarılı! Hesabınız oluşturuldu, giriş yapabilirsiniz.')
      }
      
      // Formu temizle
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        profession: '',
        barAssociation: '',
        phone: '',
        city: ''
      })
    } catch (error: any) {
      setError(error.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const createUserProfile = async (userId: string) => {
    const { error } = await supabase
      .from('users')
      .insert({
        user_id: userId,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        profession: formData.profession,
        bar_association: formData.barAssociation || null,
        phone: formData.phone || null,
        city: formData.city || null,
        subscription_tier: 'free'
      })

    if (error) {
      console.error('Profil oluşturma hatası:', error)
      throw new Error('Kullanıcı profili oluşturulamadı')
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
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">Ad *</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">Soyad *</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">E-posta *</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="profession" className="form-label">Meslek *</label>
            <select
              id="profession"
              name="profession"
              value={formData.profession}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="">Mesleğinizi seçin</option>
              <option value="avukat">Avukat</option>
              <option value="hakim">Hakim</option>
              <option value="savcı">Savcı</option>
              <option value="icra_mudurou">İcra Müdürü</option>
              <option value="icra_muavin">İcra Müavini</option>
              <option value="hukuk_muşaviri">Hukuk Müşaviri</option>
              <option value="hukuk_ogrencisi">Hukuk Öğrencisi</option>
              <option value="akademisyen">Akademisyen</option>
              <option value="diger">Diğer</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="barAssociation" className="form-label">Baro</label>
            <input
              id="barAssociation"
              name="barAssociation"
              type="text"
              value={formData.barAssociation}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Örn: İstanbul Barosu"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone" className="form-label">Telefon</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input"
                placeholder="0532 123 45 67"
              />
            </div>

            <div className="form-group">
              <label htmlFor="city" className="form-label">Şehir</label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Örn: İstanbul"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password" className="form-label">Şifre *</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                minLength={6}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Şifre Tekrarı *</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="form-input"
                minLength={6}
                required
              />
            </div>
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
            type="submit"
            disabled={loading}
            className="auth-submit-btn"
          >
            {loading ? 'Yükleniyor...' : 'Kayıt Ol'}
          </button>

          <div className="auth-toggle">
            <p>
              Zaten hesabınız var mı?
              <Link to="/login" className="auth-toggle-btn">
                Giriş Yap
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register