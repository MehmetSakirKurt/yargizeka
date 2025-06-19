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
  const { setUser, setAuthenticated } = useAppStore()

  useEffect(() => {
    // Mevcut oturumu kontrol et
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Kullanıcı bilgilerini veritabanından al
        const { data: userData, error } = await supabase
          .from('yargizeka.users')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (userData && !error) {
          setUser(userData)
          setAuthenticated(true)
        } else if (error && error.code === 'PGRST116') {
          // İlk oturum açtığında da kullanıcı profili yoksa oluştur
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
            .from('yargizeka.users')
            .insert(newUser)
            .select()
            .single()

          if (createdUser && !createError) {
            setUser(createdUser)
            setAuthenticated(true)
          }
        }
      }
    }

    getSession()

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Kullanıcı bilgilerini veritabanından al veya oluştur
          const { data: userData, error } = await supabase
            .from('yargizeka.users')
            .select('*')
            .eq('user_id', session.user.id)
            .single()

          if (error && error.code === 'PGRST116') {
            // Kullanıcı yoksa oluştur - user_metadata'dan bilgileri al
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
              .from('yargizeka.users')
              .insert(newUser)
              .select()
              .single()

            if (createdUser && !createError) {
              setUser(createdUser)
              setAuthenticated(true)
            }
          } else if (userData && !error) {
            setUser(userData)
            setAuthenticated(true)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setAuthenticated(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser, setAuthenticated])

  return (
    <Router>
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