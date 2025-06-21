import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import { useAppStore } from './lib/store'
import Layout from './components/Layout'
import Anasayfa from './pages/Anasayfa'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import EmailVerification from './pages/EmailVerification'
import DilekceYazma from './pages/DilekceYazma'
import DavaAnalizi from './pages/DavaAnalizi'
import HukukAsistani from './pages/HukukAsistani'
import YargitayArama from './pages/YargitayArama'
import Profil from './pages/Profil'

function App() {
  const { setUser, setAuthenticated, setLoading } = useAppStore()

  useEffect(() => {
    console.log('🚀 App useEffect başladı')
    setLoading(true)

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔑 Auth event:', event, 'User:', session?.user?.email || 'no user')
        
        try {
          if (session?.user) {
            console.log('👤 Kullanıcı var, profil yükleniyor...')
            await loadUserProfile(session.user)
          } else {
            console.log('❌ Kullanıcı yok, logout state')
            setUser(null)
            setAuthenticated(false)
            setLoading(false)
          }
        } catch (error) {
          console.error('❌ Auth event error:', error)
          setLoading(false)
        }
      }
    )

    // Kullanıcı profilini yükle
    const loadUserProfile = async (authUser: any) => {
      console.log('📡 Profil yükleniyor:', authUser.email)
      
      try {
        // Basit profil oluştur - Database sorgulamayı atlayalım test için
        const userProfile = {
          user_id: authUser.id,
          email: authUser.email || '',
          first_name: authUser.user_metadata?.first_name || '',
          last_name: authUser.user_metadata?.last_name || '',
          profession: authUser.user_metadata?.profession || '',
          bar_association: authUser.user_metadata?.bar_association || null,
          phone: authUser.user_metadata?.phone || null,
          city: authUser.user_metadata?.city || null,
          subscription_tier: 'free'
        }
        
        console.log('✅ Profil hazırlandı:', userProfile.email)
        
        // State'i güncelle
        setUser(userProfile)
        setAuthenticated(true)
        setLoading(false)
        
        console.log('🎯 Auth state güncellendi - isAuthenticated: true, isLoading: false')
        
      } catch (error) {
        console.error('❌ Profil yükleme hatası:', error)
        setLoading(false)
      }
    }

    return () => subscription.unsubscribe()
  }, [])

  return (
    <Router 
      future={{ 
        v7_startTransition: true,
        v7_relativeSplatPath: true 
      }}
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/giris" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Anasayfa />} />
          <Route path="dilekce-yazma" element={<DilekceYazma />} />
          <Route path="dava-analizi" element={<DavaAnalizi />} />
          <Route path="hukuk-asistani" element={<HukukAsistani />} />
          <Route path="yargitay-arama" element={<YargitayArama />} />
          <Route path="profil" element={<Profil />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App