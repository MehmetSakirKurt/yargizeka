import { create } from 'zustand'
import { User } from './supabaseClient'

// Ana uygulama state'i
interface AppState {
  // Kullanıcı bilgileri
  user: User | null
  isAuthenticated: boolean
  
  // UI state'i
  currentPage: string
  isLoading: boolean
  error: string | null
  
  // Sohbet state'i
  chatMessages: ChatMessage[]
  
  // Actions
  setUser: (user: User | null) => void
  setAuthenticated: (authenticated: boolean) => void
  setAuthState: (user: User | null, authenticated: boolean) => void
  setCurrentPage: (page: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addChatMessage: (message: ChatMessage) => void
  clearChatMessages: () => void
}

// Sohbet mesajı türü
export interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
}

// Zustand store'u oluştur
export const useAppStore = create<AppState>((set) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  currentPage: 'anasayfa',
  isLoading: false,
  error: null,
  chatMessages: [],
  
  // Actions
  setUser: (user) => set({ user }),
  setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
  setAuthState: (user: User | null, authenticated: boolean) => set({ 
    user, 
    isAuthenticated: authenticated 
  }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  addChatMessage: (message) => set((state) => ({ 
    chatMessages: [...state.chatMessages, message] 
  })),
  clearChatMessages: () => set({ chatMessages: [] }),
}))