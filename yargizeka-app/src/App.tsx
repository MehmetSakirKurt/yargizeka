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
  const { setAuthState, setLoading } = useAppStore()

  // Global error handler for browser extension conflicts
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Browser extension hatalarını yok say
      if (event.reason?.message?.includes('Could not establish connection')) {
        console.warn('Browser extension error ignored:', event.reason.message)
        event.preventDefault()
        return
      }
      
      // Diğer hatalar için normal işlem
      console.error('Unhandled promise rejection:', event.reason)
    }

    const handleError = (event: ErrorEvent) => {
      // Browser extension hatalarını yok say
      if (event.message?.includes('Could not establish connection')) {
        console.warn('Browser extension error ignored:', event.message)
        event.preventDefault()
        return
      }
      
      console.error('Global error:', event.error)
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    let isProcessing = false // Çift event kontrolü

    // Auth state değişikliklerini dinle (sadece bu yeterli!)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.email)
        
        // Çift event'i önle
        if (isProcessing && event === 'SIGNED_IN') {
          console.log('Çift SIGNED_IN event önlendi')
          return
        }
        
        if (event === 'INITIAL_SESSION') {
          // İlk yükleme
          if (session?.user) {
            console.log('Mevcut session bulundu')
            isProcessing = true
            await handleUserSession(session)
            isProcessing = false
          } else {
            console.log('Session yok')
            setAuthState(null, false)
            setLoading(false)
          }
        } else if (event === 'SIGNED_IN' && session?.user) {
          console.log('Yeni giriş yapıldı')
          isProcessing = true
          setLoading(true)
          await handleUserSession(session)
          isProcessing = false
        } else if (event === 'SIGNED_OUT') {
          isProcessing = false
          setAuthState(null, false)
          setLoading(false)
        }
      }
    )

    // Kullanıcı session'ını işle
    const handleUserSession = async (session: any) => {
      try {
        console.log('Kullanıcı profili kontrol ediliyor...')
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (userData && !error) {
          console.log('Kullanıcı profili bulundu, giriş başarılı')
          setAuthState(userData, true)
        } else if (error?.code === 'PGRST116') {
          console.log('Kullanıcı profili yok, oluşturuluyor...')
          // Kullanıcı profili yok, oluştur
          const metadata = session.user.user_metadata || {}
          const newUser = {
            user_id: session.user.id,
            email: session.user.email || '',
            first_name: metadata.first_name || '',
            last_name: metadata.last_name || '',
            profession: metadata.profession || '',
            bar_association: metadata.bar_association || null,
            phone: metadata.phone || null,
            city: metadata.city || null,
            subscription_tier: 'free'
          }

          const { data: createdUser, error: createError } = await supabase
            .from('users')
            .insert(newUser)
            .select()
            .single()

          if (createdUser && !createError) {
            console.log('Yeni kullanıcı profili oluşturuldu')
            setAuthState(createdUser, true)
          } else {
            console.error('Kullanıcı profili oluşturulamadı:', createError)
            setAuthState(null, false)
          }
        } else {
          console.log('Database hatası, basit profil oluşturuluyor...')
          // Database hatası ama user var, basit profil oluştur
          setAuthState({
            user_id: session.user.id,
            email: session.user.email || '',
            first_name: '',
            last_name: '',
            profession: '',
            bar_association: null,
            phone: null,
            city: null,
            subscription_tier: 'free'
          }, true)
        }
      } catch (error) {
        console.error('User session error:', error)
        setAuthState(null, false)
      } finally {
        console.log('Auth işlemi tamamlandı, loading kapatılıyor')
        setLoading(false)
      }
    }

    return () => subscription.unsubscribe()
  }, [setAuthState, setLoading])

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