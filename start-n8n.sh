#!/bin/bash

# YargıZeka N8N Başlatma Scripti
# Bu script N8N servislerini Docker Compose ile başlatır

set -e

echo "🚀 YargıZeka N8N Servisleri Başlatılıyor..."

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonksiyonlar
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Environment dosyasını kontrol et
if [ ! -f ".env.n8n" ]; then
    print_warning ".env.n8n dosyası bulunamadı. Örnek dosyadan kopyalanıyor..."
    cp .env.n8n.example .env.n8n 2>/dev/null || echo "# N8N Environment Variables" > .env.n8n
fi

# Docker ve Docker Compose kontrolü
print_status "Docker ve Docker Compose kontrol ediliyor..."

if ! command -v docker &> /dev/null; then
    print_error "Docker kurulu değil. Lütfen Docker'ı kurun: https://docs.docker.com/install/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose kurulu değil. Lütfen Docker Compose'u kurun: https://docs.docker.com/compose/install/"
    exit 1
fi

# Docker servisinin çalışıp çalışmadığını kontrol et
if ! docker info &> /dev/null; then
    print_error "Docker servisi çalışmıyor. Lütfen Docker'ı başlatın."
    exit 1
fi

print_success "Docker ve Docker Compose hazır!"

# N8N workflow dizinini oluştur
print_status "N8N workflow dizini kontrol ediliyor..."
mkdir -p n8n-workflows

# Workflow dosyalarının varlığını kontrol et
WORKFLOWS=(
    "yargizeka-chat-workflow.json"
    "yargizeka-petition-workflow.json"
    "yargizeka-case-analysis-workflow.json"
    "yargizeka-legal-search-workflow.json"
)

for workflow in "${WORKFLOWS[@]}"; do
    if [ -f "n8n-workflows/$workflow" ]; then
        print_success "✓ $workflow mevcut"
    else
        print_warning "⚠ $workflow bulunamadı"
    fi
done

# Mevcut container'ları kontrol et ve durdur
print_status "Mevcut N8N container'ları kontrol ediliyor..."

if docker ps -q --filter "name=yargizeka-n8n" | grep -q .; then
    print_warning "Mevcut N8N container'ları durduruluyor..."
    docker-compose down
fi

# Environment dosyasını yükle
if [ -f ".env.n8n" ]; then
    print_status "Environment değişkenleri yükleniyor..."
    export $(grep -v '^#' .env.n8n | xargs)
fi

# Servisleri başlat
print_status "N8N servisleri başlatılıyor..."

# Sadece temel servisleri başlat (Milvus optional)
if [ "$1" = "--minimal" ]; then
    print_status "Minimal konfigürasyon ile başlatılıyor (sadece N8N + PostgreSQL + Redis)..."
    docker-compose up -d n8n n8n-db redis
else
    print_status "Tam konfigürasyon ile başlatılıyor..."
    docker-compose up -d
fi

# Servislerin başlamasını bekle
print_status "Servislerin başlaması bekleniyor..."
sleep 10

# Health check
print_status "Servis durumları kontrol ediliyor..."

check_service() {
    local service_name=$1
    local url=$2
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            print_success "✓ $service_name hazır ($url)"
            return 0
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "✗ $service_name başlatılamadı ($url)"
            return 1
        fi
        
        printf "."
        sleep 2
        ((attempt++))
    done
}

# N8N'i kontrol et
printf "${BLUE}[INFO]${NC} N8N servisi kontrol ediliyor"
if check_service "N8N" "http://localhost:5678/healthz"; then
    echo ""
    print_success "N8N başarıyla başlatıldı!"
    print_status "N8N Web UI: http://localhost:5678"
    print_status "Kullanıcı adı: admin"
    print_status "Şifre: yargizeka2025"
else
    echo ""
    print_error "N8N başlatılamadı. Logları kontrol edin: docker-compose logs n8n"
fi

# Redis'i kontrol et (Redis health check farklı)
if docker ps --filter "name=yargizeka-redis" --filter "status=running" | grep -q yargizeka-redis; then
    print_success "✓ Redis hazır"
else
    print_error "✗ Redis başlatılamadı"
fi

# PostgreSQL'i kontrol et
if docker ps --filter "name=yargizeka-n8n-db" --filter "status=running" | grep -q yargizeka-n8n-db; then
    print_success "✓ PostgreSQL hazır"
else
    print_error "✗ PostgreSQL başlatılamadı"
fi

# Webhook URL'lerini göster
echo ""
print_status "Webhook URL'leri:"
echo "  📧 Chat: http://localhost:5678/webhook/yargizeka-chat"
echo "  📝 Petition: http://localhost:5678/webhook/yargizeka-petition"
echo "  📊 Case Analysis: http://localhost:5678/webhook/yargizeka-case-analysis"
echo "  🔍 Legal Search: http://localhost:5678/webhook/yargizeka-legal-search"

echo ""
print_status "Kullanışlı Komutlar:"
echo "  🔍 Logları görüntüle: docker-compose logs -f n8n"
echo "  🔄 Servisleri yeniden başlat: docker-compose restart"
echo "  🛑 Servisleri durdur: docker-compose down"
echo "  🧹 Temizlik (volumes dahil): docker-compose down -v"

echo ""
print_success "🎉 YargıZeka N8N kurulumu tamamlandı!"
print_status "Workflow'ları içe aktarmak için: http://localhost:5678 adresini ziyaret edin"
print_status "Kurulum rehberi: ./n8n-setup-guide.md"

# Test webhook'larını çalıştır (opsiyonel)
if [ "$2" = "--test" ]; then
    echo ""
    print_status "Webhook'lar test ediliyor..."
    
    # N8N'in tamamen başlamasını bekle
    sleep 5
    
    # Chat webhook testi
    print_status "Chat webhook test ediliyor..."
    curl -X POST http://localhost:5678/webhook/yargizeka-chat \
        -H "Content-Type: application/json" \
        -d '{"question": "Test sorusu"}' \
        -w "\nHTTP Status: %{http_code}\n" || print_warning "Chat webhook henüz aktif değil"
    
    echo ""
    print_status "Diğer webhook'ları test etmek için workflow'ları N8N'de aktifleştirin"
fi