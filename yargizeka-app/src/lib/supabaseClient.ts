import { createClient } from '@supabase/supabase-js'

// Supabase URL ve Anon Key'i çevre değişkenlerinden al
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Environment check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlPreview: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'undefined'
})

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ve Anon Key çevre değişkenlerinde tanımlanmalıdır!')
}

if (supabaseUrl.includes('BURAYA_') || supabaseAnonKey.includes('BURAYA_')) {
  throw new Error('Lütfen .env dosyasında gerçek Supabase anahtarlarını kullanın!')
}

// Supabase client'ı oluştur
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-client-info': 'yargizeka-app'
    }
  }
})

// Veritabanı türleri
export interface User {
  user_id: string
  email: string
  first_name: string
  last_name: string
  profession: string
  bar_association?: string
  phone?: string
  city?: string
  subscription_tier: string
  created_at?: string
  updated_at?: string
}

export interface UsageLog {
  id: number
  user_id: string
  action_type: string
  tokens_used: number
  created_at?: string
}

export interface PetitionTemplate {
  id: number
  type: string
  template_content: string
  ai_prompt: string
  created_at?: string
  updated_at?: string
}

export interface SavedSearch {
  id: number
  user_id: string
  search_query: string
  filters: Record<string, any>
  created_at?: string
}