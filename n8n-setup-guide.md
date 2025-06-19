# YargıZeka N8N Kurulum ve Konfigürasyon Rehberi

## 📋 Genel Bakış

Bu rehber, YargıZeka projesinde kullanılacak N8N automation workflow'larının Docker ile kurulumu ve konfigürasyonunu açıklar. N8N, YargıZeka'nın AI destekli özelliklerini (sohbet, dilekçe oluşturma, dava analizi) yönetmek için kullanılır.

## 🚀 Hızlı Başlangıç

### 1. Docker ile N8N Kurulumu

```bash
# N8N Docker container'ını çalıştır
docker run -it --rm \
  --name yargizeka-n8n \
  -p 5678:5678 \
  -e GENERIC_TIMEZONE="Europe/Istanbul" \
  -e TZ="Europe/Istanbul" \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### 2. Docker Compose ile Kalıcı Kurulum

`docker-compose.yml` dosyası oluşturun:

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: yargizeka-n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - GENERIC_TIMEZONE=Europe/Istanbul
      - TZ=Europe/Istanbul
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=yargizeka2025
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678/
      - N8N_METRICS=true
    volumes:
      - n8n_data:/home/node/.n8n
      - ./n8n-workflows:/home/node/.n8n/workflows
    networks:
      - yargizeka-network

  # PostgreSQL veritabanı (N8N için)
  n8n-db:
    image: postgres:13
    container_name: yargizeka-n8n-db
    restart: unless-stopped
    environment:
      - POSTGRES_DB=n8n
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=n8n_password
    volumes:
      - n8n_db_data:/var/lib/postgresql/data
    networks:
      - yargizeka-network

volumes:
  n8n_data:
  n8n_db_data:

networks:
  yargizeka-network:
    driver: bridge
```

### 3. Servisleri Başlatma

```bash
# Docker Compose ile başlat
docker-compose up -d

# Logları kontrol et
docker-compose logs -f n8n
```

## 🔧 N8N Konfigürasyonu

### 1. İlk Kurulum

1. **Web arayüzüne erişim**: http://localhost:5678
2. **Admin hesabı oluşturun** (Basic Auth aktifse)
3. **Kullanıcı hesabı oluşturun**

### 2. Google Gemini API Kurulumu

N8N'de Google Gemini kullanmak için:

1. **Credentials** bölümüne gidin
2. **Google** seçin ve API key'inizi ekleyin
3. Gemini Pro modelini aktifleştirin

### 3. Webhook URL'lerini Ayarlama

YargıZeka uygulamasında `.env` dosyasını güncelleyin:

```env
# N8N Webhook URL'leri
VITE_N8N_CHAT_WEBHOOK=http://localhost:5678/webhook/yargizeka-chat
VITE_N8N_PETITION_WEBHOOK=http://localhost:5678/webhook/yargizeka-petition
VITE_N8N_CASE_ANALYSIS_WEBHOOK=http://localhost:5678/webhook/yargizeka-case-analysis
VITE_N8N_LEGAL_SEARCH_WEBHOOK=http://localhost:5678/webhook/yargizeka-legal-search
```

## 📦 Workflow'ları İçe Aktarma

### 1. Workflow Dosyalarını İçe Aktarma

N8N web arayüzünde:

1. **Workflows** → **Import from file**
2. Aşağıdaki dosyaları sırasıyla içe aktarın:
   - `yargizeka-chat-workflow.json`
   - `yargizeka-petition-workflow.json`
   - `yargizeka-case-analysis-workflow.json`
   - `yargizeka-legal-search-workflow.json`

### 2. Workflow'ları Aktifleştirme

Her workflow için:
1. Workflow'u açın
2. Sağ üst köşedeki **Inactive** toggle'ını **Active** yapın
3. **Save** butonuna tıklayın

## 🔄 YargıZeka Workflow'ları

### 1. Sohbet Workflow'u (`yargizeka-chat-workflow.json`)

**Amaç**: Hukuk asistanı sohbet sistemi
**Endpoint**: `POST /webhook/yargizeka-chat`

**İstek Formatı**:
```json
{
  "question": "Tazminat davası nasıl açılır?",
  "session_id": "optional-session-id"
}
```

**Yanıt Formatı**:
```json
{
  "response": "Tazminat davası açmak için...",
  "timestamp": "2025-06-19T10:00:00.000Z",
  "tokens_used": 245
}
```

### 2. Dilekçe Oluşturma Workflow'u (`yargizeka-petition-workflow.json`)

**Amaç**: AI destekli dilekçe oluşturma
**Endpoint**: `POST /webhook/yargizeka-petition`

**İstek Formatı**:
```json
{
  "petition_type": "tazminat",
  "user_data": {
    "davaci_adi": "Ahmet Yılmaz",
    "davaci_tc": "12345678901",
    "davaci_adres": "İstanbul",
    "davali_adi": "Mehmet Kaya",
    "tazminat_miktari": "50000",
    "olay_aciklamasi": "Trafik kazası..."
  }
}
```

**Desteklenen Dilekçe Türleri**:
- `tazminat`: Tazminat davası
- `bosanma`: Boşanma davası
- `icra_itiraz`: İcra takibine itiraz

### 3. Dava Analizi Workflow'u (`yargizeka-case-analysis-workflow.json`)

**Amaç**: Dava dosyalarının AI analizi
**Endpoint**: `POST /webhook/yargizeka-case-analysis`

**İstek Formatı**:
```json
{
  "case_title": "Tazminat Davası",
  "case_content": "Dava dosyasının tam metni...",
  "analysis_type": "comprehensive"
}
```

**Yanıt Formatı**:
```json
{
  "case_title": "Tazminat Davası",
  "analysis_result": {
    "summary": "Davanın özeti...",
    "risk_factors": "Risk faktörleri...",
    "recommendations": "Öneriler...",
    "similar_cases": "Benzer davalar...",
    "legal_assessment": "Hukuki değerlendirme..."
  },
  "risk_score": 65,
  "success_probability": 75,
  "estimated_duration": "8 ay"
}
```

### 4. Hukuki Arama Workflow'u (`yargizeka-legal-search-workflow.json`)

**Amaç**: Semantik hukuki arama
**Endpoint**: `POST /webhook/yargizeka-legal-search`

**İstek Formatı**:
```json
{
  "search_query": "tazminat hesaplaması",
  "filters": {
    "court_type": "yargitay",
    "date_range": "2023",
    "case_type": "hukuk"
  },
  "limit": 10
}
```

## 🛠 Geliştirme ve Test

### 1. Workflow'ları Test Etme

Her webhook'u test etmek için:

```bash
# Sohbet testi
curl -X POST http://localhost:5678/webhook/yargizeka-chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Test sorusu"}'

# Dilekçe testi
curl -X POST http://localhost:5678/webhook/yargizeka-petition \
  -H "Content-Type: application/json" \
  -d '{
    "petition_type": "tazminat",
    "user_data": {
      "davaci_adi": "Test Kullanıcı",
      "tazminat_miktari": "10000"
    }
  }'
```

### 2. Debug ve Log'lara Erişim

```bash
# N8N container logları
docker-compose logs -f n8n

# N8N execution logları
# Web arayüzünde Executions bölümünden görülebilir
```

### 3. Workflow Düzenleme

N8N web arayüzünde:
1. **Workflows** bölümüne gidin
2. Düzenlemek istediğiniz workflow'u açın
3. Node'ları drag-drop ile düzenleyin
4. **Save** ve **Test workflow** yapın

## 🔒 Güvenlik Konfigürasyonu

### 1. Production Ayarları

Production ortamı için `docker-compose.yml` güncellemeleri:

```yaml
environment:
  - N8N_BASIC_AUTH_ACTIVE=true
  - N8N_BASIC_AUTH_USER=${N8N_USER}
  - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
  - N8N_JWT_AUTH_ACTIVE=true
  - N8N_JWT_AUTH_HEADER=authorization
  - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
  - DB_TYPE=postgresdb
  - DB_POSTGRESDB_HOST=n8n-db
  - DB_POSTGRESDB_DATABASE=n8n
  - DB_POSTGRESDB_USER=n8n
  - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
```

### 2. SSL/HTTPS Konfigürasyonu

Nginx proxy ile HTTPS:

```nginx
server {
    listen 443 ssl;
    server_name n8n.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📊 Monitoring ve Analytics

### 1. N8N Metrics

N8N built-in metrics'i aktifleştirmek için:

```yaml
environment:
  - N8N_METRICS=true
  - N8N_METRICS_PREFIX=n8n_
```

### 2. Workflow Execution Monitoring

```bash
# Execution istatistikleri
curl http://localhost:5678/metrics

# Health check
curl http://localhost:5678/healthz
```

## 🚨 Sorun Giderme

### 1. Yaygın Sorunlar

**Webhook'lar çalışmıyor**:
```bash
# N8N servisini yeniden başlat
docker-compose restart n8n

# Firewall kontrolü
sudo ufw allow 5678
```

**Gemini API hatası**:
- API key'in doğru olduğunu kontrol edin
- Quota limitlerini kontrol edin
- Gemini Pro modelinin aktif olduğunu doğrulayın

**Memory hatası**:
```yaml
services:
  n8n:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

### 2. Backup ve Restore

**Backup**:
```bash
# N8N veri backup
docker run --rm -v n8n_data:/data -v $(pwd):/backup alpine tar czf /backup/n8n-backup.tar.gz -C /data .

# Workflow'ları export et
# N8N web arayüzünden Settings > Import/Export
```

**Restore**:
```bash
# Veri restore
docker run --rm -v n8n_data:/data -v $(pwd):/backup alpine tar xzf /backup/n8n-backup.tar.gz -C /data
```

## 📈 Performance Optimization

### 1. Resource Limits

```yaml
services:
  n8n:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

### 2. Caching

Redis ile caching:

```yaml
services:
  redis:
    image: redis:alpine
    container_name: yargizeka-redis
    
  n8n:
    environment:
      - N8N_USER_MANAGEMENT_DISABLED=false
      - QUEUE_BULL_REDIS_HOST=redis
```

## 📝 API Referansı

### Webhook Endpoints

| Endpoint | Method | Açıklama | Durum |
|----------|--------|----------|-------|
| `/webhook/yargizeka-chat` | POST | Hukuk asistanı sohbet | ✅ Aktif |
| `/webhook/yargizeka-petition` | POST | Dilekçe oluşturma | ✅ Aktif |
| `/webhook/yargizeka-case-analysis` | POST | Dava analizi | ✅ Aktif |
| `/webhook/yargizeka-legal-search` | POST | Hukuki arama | ✅ Aktif |

### Error Codes

| Kod | Açıklama |
|-----|----------|
| 400 | Geçersiz istek parametreleri |
| 401 | Yetkisiz erişim |
| 429 | Rate limit aşıldı |
| 500 | Internal server error |

## 🔄 Güncelleme ve Bakım

### 1. N8N Güncelleme

```bash
# Yeni versiyonu çek
docker-compose pull n8n

# Servisi yeniden başlat
docker-compose up -d n8n
```

### 2. Workflow Versiyonlama

- Her workflow güncellemesinde versiyonu artırın
- Git repository'de workflow'ları takip edin
- Production'a deploy etmeden önce test edin

## 📞 Destek ve İletişim

- **Dokümantasyon**: N8N resmi dokümantasyonu
- **Community**: N8N Discord sunucusu
- **YargıZeka Destek**: support@yargizeka.com

---

**🚀 YargıZeka N8N Setup by AI Assistant**
*Bu rehber YargıZeka projesi için özelleştirilmiştir.*