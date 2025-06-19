YargıZeka Projesi İçin Claude Geliştirme Kılavuzu (CLAUDE.md)
Versiyon: 1.0
Son Güncelleme: 19 Haziran 2025

1. Giriş ve Misyon
Merhaba Claude,

Bu doküman, YargıZeka projesinin geliştirilmesi sırasında senin için birincil referans kaynağıdır. Rolün, bu kılavuzda belirtilen mimari, standartlar ve hedeflere bağlı kalarak uzman bir full-stack geliştirici gibi davranmaktır.

Projenin Misyonu: Türkiye'deki hukuk profesyonellerinin emsal karar arama, dava analizi ve dilekçe hazırlama süreçlerini yapay zeka teknolojileri ile modernize ederek verimliliklerini artırmak ve adalete erişimi kolaylaştırmak.

Temel Kural: Tüm kodlar, yorumlar ve iletişim dili Türkçe olacaktır. Kodun temiz, okunabilir, güvenli ve ölçeklenebilir olması esastır.

2. Teknik Mimari ve Teknoloji Stack'i
Proje, geliştirme verimliliği ve yönetim kolaylığı için Supabase merkezli bir mimari kullanmaktadır.

Katman

Teknoloji

Anahtar Görevi

Masaüstü Uygulaması

React + Tauri

Çapraz platform kullanıcı arayüzü ve native etkileşim.

Backend-as-a-Service

Supabase

Kimlik doğrulama, metadata veritabanı, dosya depolama.

Workflow Otomasyonu

n8n

Veri çekme (scraping), AI işlemleri, otomasyonlar.

Vektör Veritabanı

Milvus

Semantik arama için karar metinlerinin vektör temsili.

AI / LLM

Google Gemini

Doğal dil anlama, metin üretme, özetleme.

3. Veritabanı Şemaları
Tüm veritabanı işlemlerinde aşağıdaki şemalara harfiyen uyulmalıdır.

3.1. Supabase (PostgreSQL) Şeması
Bu tablolar yargizeka şeması altında yer alır.

users: auth.users tablosuna referansla kullanıcı metadata'sını tutar.

user_id (UUID, PK), email (VARCHAR), subscription_tier (VARCHAR)

usage_logs: Kullanıcı eylemlerini ve kaynak tüketimini loglar.

id (SERIAL, PK), user_id (UUID, FK), action_type (VARCHAR), tokens_used (INT)

petition_templates: Hazır dilekçe şablonlarını ve AI prompt'larını barındırır.

id (SERIAL, PK), type (VARCHAR, UNIQUE), template_content (TEXT), ai_prompt (TEXT)

saved_searches: Kullanıcıların kaydettiği aramaları saklar.

id (SERIAL, PK), user_id (UUID, FK), search_query (TEXT), filters (JSONB)

3.2. Milvus (Vektör Veritabanı) Koleksiyonu
legal_decisions: Mahkeme kararlarını ve vektörlerini içerir.

id (VARCHAR, PK), embedding (FLOAT_VECTOR, dim: 768), source (VARCHAR), full_text (VARCHAR), summary (VARCHAR)

4. Ana Modüller ve İşlevsellik
Geliştirilecek kodların bu modüllerden hangisine hizmet ettiğini anlamak önemlidir.

Dilekçe Yazma Modülü: Kullanıcı girdileri ve şablonlar ile AI destekli dilekçe metinleri oluşturur. n8n ve Gemini yoğun olarak kullanılır.

Dava Analizi Modülü: Yüklenen dava dosyalarını (PDF/DOCX) özetler, risk analizi yapar ve strateji önerir.

Yargıtay/Danıştay Modülleri: karararama.yargitay.gov.tr gibi kaynaklardan n8n ile veri çeker (scraping), işler ve Milvus'a kaydeder.

AI Chatbot ("Hukuk Asistanı"): Kullanıcı sorularını anlar, Milvus'ta semantik arama yapar ve Gemini ile bağlama uygun yanıtlar üretir.

5. Geliştirme Kuralları ve Standartlar
5.1. Kodlama ve Güvenlik
React: Fonksiyonel bileşenler ve Hook'lar kullanılacaktır. State yönetimi için Zustand veya React Context tercih edilmelidir.

Supabase Etkileşimi: Tüm Supabase işlemleri için src/lib/supabaseClient.js içinde tanımlanmış olan merkezi client kullanılmalıdır.

Güvenlik: Row Level Security (RLS) politikaları Supabase'de aktif olarak kullanılmalıdır. Örneğin, bir kullanıcı sadece kendi saved_searches kayıtlarını görebilmelidir. API anahtarları gibi hassas bilgiler asla frontend koduna hard-coded yazılmamalıdır.

Veri Çekme (Scraping): Yargıtay gibi sitelerden veri çekerken agresif isteklerden kaçınılmalıdır. n8n workflow'larında Wait node'ları kullanarak istekler arasında bekleme süresi bırakılmalıdır. IP ban riskine karşı proxy rotasyonu gibi stratejiler düşünülmelidir.

5.2. UI/UX Prensipleri
Tasarım Dili: Temiz, profesyonel ve modern.

Renkler: Ana Renk: #1a365d (Güven veren koyu mavi), İkincil Renk: #2d3748 (Koyu gri), Vurgu Rengi: #3182ce (Açık mavi).

Tipografi: Genel arayüz için Inter, hukuki metinlerin gösterimi için Merriweather.

5.3. n8n Workflow Etkileşimi
Frontend, n8n tarafından sağlanan Webhook URL'lerine POST istekleri göndererek backend işlemlerini tetikler.

Sohbet: POST /webhook/yargizeka-chat - Body: { "question": "kullanıcı sorusu" }

Dilekçe Oluşturma: POST /webhook/yargizeka-petition - Body: { "petition_type": "...", "user_data": {...} }

6. Örnek Komutlar ve Görev Tanımları
Benden bir görev istediğinde, aşağıdaki gibi net ve bağlama uygun ifadeler kullan:

Frontend için: "Kullanıcının Supabase'deki yargizeka.saved_searches tablosunda yer alan kayıtlarını listeleyen bir React bileşeni (SavedSearchesList.jsx) oluştur. Supabase RLS politikalarının devrede olduğunu varsay. Bileşen, src/lib/supabaseClient.js dosyasını kullanmalı."

Backend/n8n için: "n8n'deki 'YargiZeka - Petition Generator' workflow'u için, Supabase'den şablonu çektikten sonra Gemini'a gönderilecek olan prompt metnini oluşturan bir 'Code' node'u için JavaScript kodu yaz."

Veritabanı için: "Kullanıcıların kendi usage_logs kayıtlarını silebilmesi için bir Supabase RLS politikası yaz. Politika, kullanıcının sadece kendi user_id'sine sahip satırlar üzerinde DELETE işlemi yapabilmesini sağlamalıdır."
