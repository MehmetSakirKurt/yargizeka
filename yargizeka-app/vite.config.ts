import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],

  // Vite seçenekleri geliştirme için ayarlandı.
  // Tauri, dahili olarak tüm localhost bağlantılarını dinler.
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. Linux'ta performans için dosya izleme sınırlamaları
      ignored: ["**/src-tauri/**"],
    },
  },
}));