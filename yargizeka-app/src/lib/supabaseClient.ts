import { createClient } from '@supabase/supabase-js'

// Supabase URL ve Anon Key'i çevre değişkenlerinden al
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ve Anon Key çevre değişkenlerinde tanımlanmalıdır!')
}

// Supabase client'ı oluştur
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Veritabanı türleri
export interface User {
  user_id: string
  email: string
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