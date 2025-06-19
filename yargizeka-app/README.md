# YargıZeka - Hukuk Profesyonelleri için AI Destekli Platform

YargıZeka, Türkiye'deki hukuk profesyonellerinin emsal karar arama, dava analizi ve dilekçe hazırlama süreçlerini yapay zeka teknolojileri ile modernize ederek verimliliklerini artırmak için geliştirilmiş bir masaüstü uygulamasıdır.

## 🚀 Özellikler

### 🏠 Ana Modüller
- **Dilekçe Yazma**: AI destekli dilekçe hazırlama aracı
- **Dava Analizi**: Dava dosyalarını analiz etme ve risk değerlendirmesi
- **Hukuk Asistanı**: AI chatbot ile hukuki sorular ve emsal kararlar
- **Yargıtay Arama**: Semantik arama ile Yargıtay/Danıştay kararları

### 🛠 Teknoloji Stack
- **Frontend**: React 18 + TypeScript + Tauri
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI Workflow**: n8n automation
- **Vector Database**: Milvus (semantik arama için)
- **AI Model**: Google Gemini
- **State Management**: Zustand
- **Styling**: Custom CSS with CSS Variables

## 📋 Kurulum

### Ön Gereksinimler
- Node.js (v18 veya üzeri)
- Rust (Tauri için)
- npm veya yarn

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. Çevre Değişkenlerini Ayarla
`.env.example` dosyasını `.env` olarak kopyalayın ve gerekli değerleri doldurun:

```bash
cp .env.example .env
```

Gerekli çevre değişkenleri:
- `VITE_SUPABASE_URL`: Supabase proje URL'i
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_N8N_CHAT_WEBHOOK`: n8n chat webhook URL'i
- `VITE_N8N_PETITION_WEBHOOK`: n8n dilekçe webhook URL'i

### 3. Veritabanını Kur
`supabase/schema.sql` dosyasını Supabase SQL editöründe çalıştırın.

### 4. Uygulamayı Çalıştır

#### Geliştirme Modu
```bash
npm run tauri dev
```

#### Üretim Build'i
```bash
npm run tauri build
```

## 🗄 Veritabanı Şeması

### Supabase Tabloları (yargizeka şeması)
- `users`: Kullanıcı metadata bilgileri
- `usage_logs`: Kullanım logları ve token takibi
- `petition_templates`: Dilekçe şablonları
- `saved_searches`: Kayıtlı aramalar
- `case_analyses`: Dava analiz sonuçları

### Row Level Security (RLS)
Tüm tablolarda RLS politikaları aktif olup, kullanıcılar sadece kendi verilerine erişebilir.

## 🔧 Konfigürasyon

### n8n Workflow Entegrasyonu
Uygulama, aşağıdaki n8n webhook'larını kullanır:
- `/webhook/yargizeka-chat`: Hukuk asistanı sohbetleri
- `/webhook/yargizeka-petition`: Dilekçe oluşturma

### Milvus Vector Database
Yargıtay/Danıştay kararlarının semantik araması için Milvus kullanılır.
- Koleksiyon: `legal_decisions`
- Vektör boyutu: 768 (sentence-transformers)

## 📱 Kullanım

### 1. Giriş/Kayıt
- E-posta ve şifre ile kayıt olun
- Supabase Auth sistemi kullanılır

### 2. Dilekçe Yazma
- Şablon seçin (Tazminat, Boşanma, İcra İtirazı)
- Gerekli bilgileri doldurun
- AI ile dilekçe oluşturun
- İndirin veya kaydedin

### 3. Dava Analizi
- Dava dosyasını yükleyin (PDF/DOCX/TXT)
- AI analizi ile risk değerlendirmesi alın
- Öneriler ve benzer davaları görün

### 4. Hukuk Asistanı
- Hukuki sorularınızı sorun
- Emsal kararlar hakkında bilgi alın
- Sohbet geçmişinizi takip edin

### 5. Yargıtay Arama
- Semantik arama ile karar bulun
- Filtreler kullanın (mahkeme, tarih, tür)
- Aramaları kaydedin

## 🎨 UI/UX Tasarım

### Renk Paleti
- **Ana Renk**: #1a365d (Koyu mavi)
- **İkincil Renk**: #2d3748 (Koyu gri)
- **Vurgu Rengi**: #3182ce (Açık mavi)

### Tipografi
- **Genel**: Inter font ailesi
- **Hukuki Metinler**: Merriweather serif

### Responsive Tasarım
- Desktop-first yaklaşım
- Tablet ve mobil uyumlu
- Minimum 800x600 çözünürlük

## 🔒 Güvenlik

### Veri Güvenliği
- Row Level Security (RLS) politikaları
- API anahtarları çevre değişkenlerinde
- HTTPS zorunlu

### Kullanıcı Gizliliği
- Kullanıcı verileri şifrelenir
- Sadece gerekli veriler toplanır
- KVKK uyumlu

## 📊 Abonelik Planları

### Ücretsiz Plan
- 5 dilekçe/ay
- 3 dava analizi/ay
- 20 sohbet mesajı/ay
- 10 arama/ay

### Temel Plan (₺99/ay)
- 50 dilekçe/ay
- 25 dava analizi/ay
- 200 sohbet mesajı/ay
- 100 arama/ay

### Premium Plan (₺299/ay)
- Sınırsız kullanım
- Öncelikli destek
- Gelişmiş analitik

## 🐛 Hata Ayıklama

### Sık Karşılaşılan Sorunlar

1. **Supabase Bağlantı Hatası**
   - `.env` dosyasındaki URL ve key'leri kontrol edin
   - Supabase projesinin aktif olduğundan emin olun

2. **n8n Webhook Hatası**
   - n8n sunucusunun çalıştığını kontrol edin
   - Webhook URL'lerinin doğru olduğundan emin olun

3. **Tauri Build Hatası**
   - Rust toolchain'in güncel olduğundan emin olun
   - `cargo clean` ve yeniden build deneyin

### Loglar
- Tauri logları: `~/.local/share/com.yargizeka.app/logs/`
- Browser console'da hata mesajlarını kontrol edin

## 🤝 Katkıda Bulunma

1. Repository'yi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje özel lisans altındadır. Detaylar için iletişime geçin.

## 📞 İletişim

- **E-posta**: info@yargizeka.com
- **Web**: https://yargizeka.com
- **Destek**: support@yargizeka.com

## 🔄 Sürüm Geçmişi

### v1.0.0 (2025-06-19)
- İlk stable sürüm
- Tüm ana modüller tamamlandı
- Supabase entegrasyonu
- n8n workflow entegrasyonu
- Responsive UI/UX tasarımı

---

**YargıZeka Takımı** tarafından ❤️ ile geliştirilmiştir.