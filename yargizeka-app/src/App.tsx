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
    setLoading(true)

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔑 Auth event:', event, session?.user?.email || 'no user')
        
        if (event === 'INITIAL_SESSION') {
          if (session?.user) {
            console.log('✅ Session var, kullanıcı giriş yapmış')
            await loadUserProfile(session.user)
          } else {
            console.log('❌ Session yok')
            setUser(null)
            setAuthenticated(false)
            setLoading(false)
          }
        } else if (event === 'SIGNED_IN' && session?.user) {
          console.log('🎉 Yeni giriş!')
          await loadUserProfile(session.user)
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 Çıkış yapıldı')
          setUser(null)
          setAuthenticated(false)
          setLoading(false)
        }
      }
    )

    // Kullanıcı profilini yükle
    const loadUserProfile = async (authUser: any) => {
      try {
        // Database'den kullanıcı profilini al
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', authUser.id)
          .single()

        if (userProfile && !error) {
          // Profil bulundu
          console.log('👤 Kullanıcı profili yüklendi:', userProfile)
          setUser(userProfile)
          setAuthenticated(true)
          console.log('✅ setAuthenticated(true) çalıştırıldı')
        } else {
          // Profil yok, basit profil oluştur
          console.log('🆕 Basit profil oluşturuluyor, hata:', error)
          const simpleProfile = {
            user_id: authUser.id,
            email: authUser.email || '',
            first_name: '',
            last_name: '',
            profession: '',
            bar_association: null,
            phone: null,
            city: null,
            subscription_tier: 'free'
          }
          
          console.log('📝 Basit profil oluşturuldu:', simpleProfile)
          setUser(simpleProfile)
          setAuthenticated(true)
          console.log('✅ setAuthenticated(true) çalıştırıldı')
        }
      } catch (error) {
        console.error('❌ Profil yükleme hatası:', error)
        // Hata olsa bile giriş yapmış sayalım
        const fallbackProfile = {
          user_id: authUser.id,
          email: authUser.email || '',
          first_name: '',
          last_name: '',
          profession: '',
          bar_association: null,
          phone: null,
          city: null,
          subscription_tier: 'free'
        }
        console.log('🔄 Fallback profil oluşturuldu:', fallbackProfile)
        setUser(fallbackProfile)
        setAuthenticated(true)
        console.log('✅ setAuthenticated(true) çalıştırıldı (fallback)')
      } finally {
        console.log('🏁 setLoading(false) çalıştırıldı')
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