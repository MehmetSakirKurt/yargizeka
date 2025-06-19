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
    // Loading state'i başlat
    setLoading(true)
    
    // Mevcut oturumu kontrol et
    const getSession = async () => {
      try {
        console.log('Session kontrol ediliyor...')
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          console.log('Session bulundu, kullanıcı bilgileri alınıyor...')
          // Kullanıcı bilgilerini veritabanından al
          const { data: userData, error } = await supabase
            .from('yargizeka.users')
            .select('*')
            .eq('user_id', session.user.id)
            .single()

          if (userData && !error) {
            console.log('Kullanıcı profili bulundu')
            setUser(userData)
            setAuthenticated(true)
          } else if (error && error.code === 'PGRST116') {
            console.log('Kullanıcı profili bulunamadı, oluşturuluyor...')
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
              console.log('Kullanıcı profili oluşturuldu')
              setUser(createdUser)
              setAuthenticated(true)
            } else {
              console.error('Kullanıcı profili oluşturulamadı:', createError)
              setAuthenticated(false)
            }
          } else {
            console.error('Kullanıcı profili alınamadı:', error)
            setAuthenticated(false)
          }
        } else {
          console.log('Session bulunamadı')
          setAuthenticated(false)
        }
      } catch (error) {
        console.error('Session kontrol hatası:', error)
        setAuthenticated(false)
      } finally {
        // Loading state'i bitir
        console.log('Loading tamamlandı')
        setLoading(false)
      }
    }

    getSession()

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state değişti:', event, session?.user?.email, session?.user?.email_confirmed_at)
        
        if (event === 'SIGNED_IN' && session?.user) {
          setLoading(true)
          
          try {
            // Email doğrulama kontrolü - eğer email doğrulanmamışsa uyarı ver ama devam et
            if (!session.user.email_confirmed_at) {
              console.log('Email doğrulanmamış, ama devam ediliyor...')
            }

            // Kullanıcı bilgilerini veritabanından al veya oluştur
            const { data: userData, error } = await supabase
              .from('yargizeka.users')
              .select('*')
              .eq('user_id', session.user.id)
              .single()

            console.log('Veritabanı sorgusu sonucu:', userData, error)

            if (error && error.code === 'PGRST116') {
              console.log('Kullanıcı profili bulunamadı, oluşturuluyor...')
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

              console.log('Oluşturulacak kullanıcı:', newUser)

              const { data: createdUser, error: createError } = await supabase
                .from('yargizeka.users')
                .insert(newUser)
                .select()
                .single()

              console.log('Kullanıcı oluşturma sonucu:', createdUser, createError)

              if (createdUser && !createError) {
                setUser(createdUser)
                setAuthenticated(true)
                console.log('Kullanıcı store\'a eklendi ve authenticated=true yapıldı')
              } else {
                console.error('Kullanıcı oluşturulamadı:', createError)
                setAuthenticated(false)
              }
            } else if (userData && !error) {
              setUser(userData)
              setAuthenticated(true)
              console.log('Mevcut kullanıcı store\'a eklendi ve authenticated=true yapıldı')
            } else if (error) {
              console.error('Veritabanı hatası:', error)
              setAuthenticated(false)
            }
          } finally {
            setLoading(false)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setAuthenticated(false)
          setLoading(false)
          console.log('Kullanıcı çıkış yaptı')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser, setAuthenticated, setLoading])

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