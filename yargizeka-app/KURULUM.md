# YargıZeka Kurulum Rehberi

## 🚀 Hızlı Başlangıç

### 1. Proje Dosyalarını İndirin
```bash
# Proje klasörüne gidin
cd yargizeka-app
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Çevre Değişkenlerini Ayarlayın
`.env.example` dosyasını `.env` olarak kopyalayın:
```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin ve şu değerleri doldurun:

```env
# Supabase Konfigürasyonu
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# n8n Webhook URL'leri  
VITE_N8N_CHAT_WEBHOOK=http://localhost:5678/webhook/yargizeka-chat
VITE_N8N_PETITION_WEBHOOK=http://localhost:5678/webhook/yargizeka-petition

# Milvus (isteğe bağlı)
VITE_MILVUS_HOST=localhost
VITE_MILVUS_PORT=19530
```

### 4. Supabase Veritabanını Kurun

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. SQL Editor'de `supabase/schema.sql` dosyasını çalıştırın
4. Authentication > Settings'ten "Enable email confirmations" kapatın (geliştirme için)

### 5. Uygulamayı Çalıştırın

#### Geliştirme Modu
```bash
npm run dev
```

#### Tauri ile Çalıştırma (Masaüstü)
```bash
# Rust kurulumu gerekli: https://rustup.rs/
npm run tauri dev
```

#### Üretim Build'i
```bash
npm run build
npm run tauri build
```

## 🛠 Detaylı Kurulum

### Supabase Kurulumu

1. **Proje Oluşturma**
   - Supabase'e giriş yapın
   - "New Project" tıklayın
   - Proje adı: "yargizeka"
   - Şifre oluşturun

2. **URL ve Key Alma**
   - Settings > API sayfasına gidin
   - Project URL ve anon public key'i kopyalayın
   - `.env` dosyasına yapıştırın

3. **Veritabanı Schema'sı**
   - SQL Editor'e gidin
   - `supabase/schema.sql` dosyasının içeriğini kopyalayın
   - Çalıştırın (Run)

4. **Authentication Ayarları**
   - Authentication > Settings
   - "Enable email confirmations" → OFF
   - "Enable phone confirmations" → OFF

### n8n Kurulumu (İsteğe Bağlı)

n8n, AI workflow'ları için kullanılır. Yoksa mock veriler kullanılır.

```bash
# Docker ile
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n

# npm ile
npm install n8n -g
n8n start
```

n8n workflow'larını kurmak için:
1. http://localhost:5678 adresine gidin
2. Webhook node'ları oluşturun:
   - `/webhook/yargizeka-chat`
   - `/webhook/yargizeka-petition`

### Milvus Kurulumu (İsteğe Bağlı)

Semantik arama için Milvus gerekli. Yoksa mock veriler kullanılır.

```bash
# Docker ile
docker run -p 19530:19530 -p 9091:9091 milvusdb/milvus:latest
```

## 🔧 Sorun Giderme

### Yaygın Hatalar

1. **"Module not found" hatası**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Supabase bağlantı hatası**
   - `.env` dosyasındaki URL ve key'leri kontrol edin
   - Supabase projesinin aktif olduğundan emin olun

3. **TypeScript hatası**
   ```bash
   npm run build
   ```

4. **Tauri build hatası**
   ```bash
   # Rust güncelleme
   rustup update
   
   # Tauri CLI güncelleme
   cargo install tauri-cli
   ```

### Log Dosyaları

- **Browser Console**: F12 → Console
- **Tauri Logs**: 
  - Windows: `%APPDATA%\com.yargizeka.app\logs\`
  - macOS: `~/Library/Logs/com.yargizeka.app/`
  - Linux: `~/.local/share/com.yargizeka.app/logs/`

## 📱 Test Etme

### 1. Giriş/Kayıt Testi
```
1. Uygulamayı açın
2. "Kayıt Ol" tıklayın
3. E-posta ve şifre girin
4. Giriş yapın
```

### 2. Dilekçe Testi
```
1. "Dilekçe Yazma" sayfasına gidin
2. "Tazminat" şablonunu seçin
3. Gerekli alanları doldurun
4. "Dilekçe Oluştur" tıklayın
```

### 3. Sohbet Testi
```
1. "Hukuk Asistanı" sayfasına gidin
2. Hızlı sorulardan birini seçin
3. Yanıt geldiğini kontrol edin
```

## 🚀 Dağıtım

### Masaüstü Uygulama
```bash
npm run tauri build
```

Build dosyaları `src-tauri/target/release/bundle/` klasöründe oluşur.

### Web Uygulaması
```bash
npm run build
```

`dist/` klasörünü web sunucusuna yükleyin.

## 📞 Destek

Kurulum sırasında sorun yaşarsanız:
- GitHub Issues'da sorun bildirin
- E-posta: support@yargizeka.com
- Dokümantasyon: README.md dosyasını inceleyin