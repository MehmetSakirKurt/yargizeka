/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_N8N_CHAT_WEBHOOK: string
  readonly VITE_N8N_PETITION_WEBHOOK: string
  readonly VITE_MILVUS_HOST: string
  readonly VITE_MILVUS_PORT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}