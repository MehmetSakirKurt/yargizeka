import React, { useState } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Briefcase, Phone, MapPin, ArrowRight, Shield } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAppStore } from '../lib/store'

const Register: React.FC = () => {
  const { isAuthenticated } = useAppStore()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
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

  const nextStep = () => {
    if (currentStep === 1) {
      // İlk adım validasyonu
      if (!formData.firstName || !formData.lastName || !formData.email) {
        setError('Lütfen tüm zorunlu alanları doldurun')
        return
      }
    }
    setCurrentStep(currentStep + 1)
    setError(null)
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
    setError(null)
  }

  const renderStep1 = () => (
    <div className="step-content">
      <div className="form-section">
        <h2 className="form-title">Hesap Bilgileri</h2>
        <p className="form-subtitle">Temel bilgilerinizi girin</p>
      </div>

      <div className="form-grid">
        <div className="input-group">
          <label htmlFor="firstName" className="modern-label">Ad *</label>
          <div className="input-wrapper">
            <User className="input-icon" size={20} />
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              className="modern-input"
              placeholder="Adınız"
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="lastName" className="modern-label">Soyad *</label>
          <div className="input-wrapper">
            <User className="input-icon" size={20} />
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange}
              className="modern-input"
              placeholder="Soyadınız"
              required
            />
          </div>
        </div>
      </div>

      <div className="input-group">
        <label htmlFor="email" className="modern-label">E-posta Adresi *</label>
        <div className="input-wrapper">
          <Mail className="input-icon" size={20} />
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            className="modern-input"
            placeholder="ornek@email.com"
            required
          />
        </div>
      </div>

      <div className="form-grid">
        <div className="input-group">
          <label htmlFor="password" className="modern-label">Şifre *</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={20} />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              className="modern-input"
              placeholder="••••••••"
              minLength={6}
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

        <div className="input-group">
          <label htmlFor="confirmPassword" className="modern-label">Şifre Tekrarı *</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={20} />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="modern-input"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="step-content">
      <div className="form-section">
        <h2 className="form-title">Mesleki Bilgiler</h2>
        <p className="form-subtitle">Hukuki alanınızı belirtin</p>
      </div>

      <div className="input-group">
        <label htmlFor="profession" className="modern-label">Meslek *</label>
        <div className="input-wrapper">
          <Briefcase className="input-icon" size={20} />
          <select
            id="profession"
            name="profession"
            value={formData.profession}
            onChange={handleInputChange}
            className="modern-input"
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
      </div>

      <div className="input-group">
        <label htmlFor="barAssociation" className="modern-label">Baro</label>
        <div className="input-wrapper">
          <Briefcase className="input-icon" size={20} />
          <input
            id="barAssociation"
            name="barAssociation"
            type="text"
            value={formData.barAssociation}
            onChange={handleInputChange}
            className="modern-input"
            placeholder="İstanbul Barosu"
          />
        </div>
      </div>

      <div className="form-grid">
        <div className="input-group">
          <label htmlFor="phone" className="modern-label">Telefon</label>
          <div className="input-wrapper">
            <Phone className="input-icon" size={20} />
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              className="modern-input"
              placeholder="0532 123 45 67"
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="city" className="modern-label">Şehir</label>
          <div className="input-wrapper">
            <MapPin className="input-icon" size={20} />
            <input
              id="city"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleInputChange}
              className="modern-input"
              placeholder="İstanbul"
            />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="modern-auth-container">
      <div className="modern-auth-card register-card">
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

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / 2) * 100}%` }}
            ></div>
          </div>
          <div className="progress-steps">
            <span className={currentStep >= 1 ? 'active' : ''}>1</span>
            <span className={currentStep >= 2 ? 'active' : ''}>2</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modern-auth-form">
          {currentStep === 1 ? renderStep1() : renderStep2()}

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

          <div className="form-actions">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="modern-back-btn"
              >
                Geri
              </button>
            )}
            
            {currentStep < 2 ? (
              <button
                type="button"
                onClick={nextStep}
                className="modern-submit-btn"
              >
                <span>İleri</span>
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="modern-submit-btn"
              >
                <span>{loading ? 'Kayıt Oluşturuluyor...' : 'Kayıt Ol'}</span>
                {!loading && <ArrowRight size={20} />}
              </button>
            )}
          </div>

          <div className="auth-footer">
            <div className="login-section">
              <span>Zaten hesabınız var mı? </span>
              <Link to="/login" className="login-link">
                Giriş Yapın
              </Link>
            </div>
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

export default Register