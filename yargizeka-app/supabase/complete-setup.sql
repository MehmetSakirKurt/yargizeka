-- YargıZeka Komplet Veritabanı Kurulumu
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

-- 1. Kullanıcı metadata tablosu
CREATE TABLE users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    profession VARCHAR(100) NOT NULL,
    bar_association VARCHAR(200),
    phone VARCHAR(20),
    city VARCHAR(100),
    subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Kullanım logları tablosu
CREATE TABLE usage_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Dilekçe şablonları tablosu
CREATE TABLE petition_templates (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(100) UNIQUE NOT NULL,
    template_content TEXT NOT NULL,
    ai_prompt TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Kayıtlı aramalar tablosu
CREATE TABLE saved_searches (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    filters JSONB DEFAULT '{}',
    title VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Dava analizleri tablosu
CREATE TABLE case_analyses (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    case_title VARCHAR(255) NOT NULL,
    case_content TEXT NOT NULL,
    analysis_result JSONB NOT NULL,
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RLS (Row Level Security) etkinleştir
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE petition_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_analyses ENABLE ROW LEVEL SECURITY;

-- 7. RLS Politikaları

-- Users tablosu politikaları
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own" ON users
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own" ON users
    FOR DELETE USING (auth.uid() = user_id);

-- Usage logs politikaları
CREATE POLICY "usage_logs_select_own" ON usage_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "usage_logs_insert_own" ON usage_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usage_logs_delete_own" ON usage_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Petition templates (herkes okuyabilir, kimse yazamaz şimdilik)
CREATE POLICY "petition_templates_select_all" ON petition_templates
    FOR SELECT USING (is_active = TRUE);

-- Saved searches politikaları
CREATE POLICY "saved_searches_select_own" ON saved_searches
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "saved_searches_insert_own" ON saved_searches
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_searches_update_own" ON saved_searches
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "saved_searches_delete_own" ON saved_searches
    FOR DELETE USING (auth.uid() = user_id);

-- Case analyses politikaları
CREATE POLICY "case_analyses_select_own" ON case_analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "case_analyses_insert_own" ON case_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "case_analyses_update_own" ON case_analyses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "case_analyses_delete_own" ON case_analyses
    FOR DELETE USING (auth.uid() = user_id);

-- 8. Trigger fonksiyonu (updated_at otomatik güncelleme için)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Trigger'lar
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_petition_templates_updated_at 
    BEFORE UPDATE ON petition_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. İlk veri girişleri (dilekçe şablonları)
INSERT INTO petition_templates (type, template_content, ai_prompt) VALUES
('tazminat', 
'TAZMINAT DAVASI DİLEKÇESİ

{mahkeme_adi}

Sayın Hakime,

DAVACI: {davaci_adi}
       {davaci_adres}
       
DAVALI: {davali_adi}
       {davali_adres}

KONU: Tazminat Talebi

AÇIKLAMALAR:
{dava_konusu}

TALEP:
1. Davalıdan {tazminat_tutari} TL tazminat tahsili,
2. Temerrüt faizi,
3. Yargılama giderleri ve vekalet ücretinin davalıdan tahsili,

Yukarıda belirtilen sebeplerle davamızın kabulünü saygıyla arz ederim.

{tarih}
{davaci_adi}', 
'Kullanıcının verdiği bilgilere göre tazminat davası dilekçesi hazırla. Türk hukuku ve usul kurallarına uygun, detaylı ve profesyonel olsun.'),

('bosanma',
'BOŞANMA DAVASI DİLEKÇESİ

{mahkeme_adi}

Sayın Hakime,

DAVACI: {davaci_adi}
       {davaci_adres}
       
DAVALI: {davali_adi} 
       {davali_adres}

KONU: Boşanma Talebi

OLAY ve OLGULAR:
{evlilik_bilgileri}

HUKUKI DURUM:
{bosanma_gerekce}

TALEP:
1. Taraflar arasındaki evlilik birliğinin feshi,
2. {mal_rejimi_talep}
3. {nafaka_talep}
4. {velayet_talep}
5. Yargılama giderleri ve vekalet ücretinin davalıdan tahsili,

Yukarıda belirtilen sebeplerle davamızın kabulünü saygıyla arz ederim.

{tarih}
{davaci_adi}',
'Kullanıcının verdiği bilgilere göre boşanma davası dilekçesi hazırla. Türk Medeni Kanunu hükümlerine uygun, detaylı ve profesyonel olsun.'),

('icra_itiraz',
'İCRA TAKİBİNE İTİRAZ DİLEKÇESİ

{mahkeme_adi}

Sayın Hakime,

İTİRAZCI: {borclu_adi}
         {borclu_adres}
         
KARŞI TARAF: {alacakli_adi}
            {alacakli_adres}

İCRA DOSYA NO: {icra_dosya_no}
İCRA DAİRESİ: {icra_dairesi}

KONU: İcra Takibine İtiraz

İTİRAZ GEREKÇELERİ:
{itiraz_gerekce}

TALEP:
1. İcra takibinin durdurulması,
2. {itiraz_detay}
3. Yargılama giderleri ve vekalet ücretinin karşı taraftan tahsili,

Yukarıda belirtilen sebeplerle itirazımızın kabulünü saygıyla arz ederim.

{tarih}
{borclu_adi}',
'Kullanıcının verdiği bilgilere göre icra takibine itiraz dilekçesi hazırla. İcra ve İflas Kanunu hükümlerine uygun, detaylı ve hukuki gerekçeli olsun.');

-- 11. Performans için indeksler
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at);
CREATE INDEX idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX idx_case_analyses_user_id ON case_analyses(user_id);
CREATE INDEX idx_case_analyses_created_at ON case_analyses(created_at);

-- 12. Başarılı kurulum mesajı
SELECT 'YargıZeka veritabanı başarıyla kuruldu! 🎉' as mesaj;