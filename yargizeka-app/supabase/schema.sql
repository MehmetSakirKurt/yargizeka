-- YargıZeka Veritabanı Şeması
-- Bu dosya Supabase'de çalıştırılmalıdır

-- Şema oluştur
CREATE SCHEMA IF NOT EXISTS yargizeka;

-- Kullanıcı metadata tablosu
CREATE TABLE yargizeka.users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
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

-- Kullanım logları tablosu
CREATE TABLE yargizeka.usage_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES yargizeka.users(user_id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dilekçe şablonları tablosu
CREATE TABLE yargizeka.petition_templates (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100) UNIQUE NOT NULL,
    template_content TEXT NOT NULL,
    ai_prompt TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kayıtlı aramalar tablosu
CREATE TABLE yargizeka.saved_searches (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES yargizeka.users(user_id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    filters JSONB DEFAULT '{}',
    title VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dava analizleri tablosu
CREATE TABLE yargizeka.case_analyses (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES yargizeka.users(user_id) ON DELETE CASCADE,
    case_title VARCHAR(255) NOT NULL,
    case_content TEXT NOT NULL,
    analysis_result JSONB NOT NULL,
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) politikalarını etkinleştir
ALTER TABLE yargizeka.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE yargizeka.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE yargizeka.petition_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE yargizeka.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE yargizeka.case_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Politikaları

-- Users tablosu politikaları
CREATE POLICY "Kullanıcılar kendi kayıtlarını görebilir" ON yargizeka.users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi kayıtlarını güncelleyebilir" ON yargizeka.users
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi kayıtlarını silebilir" ON yargizeka.users
    FOR DELETE USING (auth.uid() = user_id);

-- Usage logs politikaları
CREATE POLICY "Kullanıcılar kendi log kayıtlarını görebilir" ON yargizeka.usage_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi log kayıtlarını ekleyebilir" ON yargizeka.usage_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi log kayıtlarını silebilir" ON yargizeka.usage_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Petition templates politikaları (tüm kullanıcılar okuyabilir)
CREATE POLICY "Herkes dilekçe şablonlarını görebilir" ON yargizeka.petition_templates
    FOR SELECT USING (is_active = TRUE);

-- Saved searches politikaları
CREATE POLICY "Kullanıcılar kendi kayıtlı aramalarını görebilir" ON yargizeka.saved_searches
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kayıtlı arama ekleyebilir" ON yargizeka.saved_searches
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi kayıtlı aramalarını güncelleyebilir" ON yargizeka.saved_searches
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi kayıtlı aramalarını silebilir" ON yargizeka.saved_searches
    FOR DELETE USING (auth.uid() = user_id);

-- Case analyses politikaları
CREATE POLICY "Kullanıcılar kendi dava analizlerini görebilir" ON yargizeka.case_analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar dava analizi ekleyebilir" ON yargizeka.case_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi dava analizlerini güncelleyebilir" ON yargizeka.case_analyses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi dava analizlerini silebilir" ON yargizeka.case_analyses
    FOR DELETE USING (auth.uid() = user_id);

-- Trigger fonksiyonları
CREATE OR REPLACE FUNCTION yargizeka.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Updated_at trigger'ları
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON yargizeka.users
    FOR EACH ROW EXECUTE FUNCTION yargizeka.update_updated_at_column();

CREATE TRIGGER update_petition_templates_updated_at BEFORE UPDATE ON yargizeka.petition_templates
    FOR EACH ROW EXECUTE FUNCTION yargizeka.update_updated_at_column();

-- İlk veri girişleri
INSERT INTO yargizeka.petition_templates (type, template_content, ai_prompt) VALUES
('tazminat', 
'TAZMINAT DAVASI DİLEKÇESİ

Sayın Hakime,

Davacı: {davaci_adi}
Davalı: {davali_adi}
Konu: Tazminat Talebi

{dava_konusu}

Saygılarımla,
{davaci_adi}', 
'Kullanıcının verdiği bilgilere göre tazminat davası dilekçesi hazırla. Türk hukuku ve usul kurallarına uygun olsun.'),

('bosanma',
'BOŞANMA DAVASI DİLEKÇESİ

Sayın Hakime,

Davacı: {davaci_adi}
Davalı: {davali_adi}
Konu: Boşanma Talebi

{dava_gerekce}

Saygılarımla,
{davaci_adi}',
'Kullanıcının verdiği bilgilere göre boşanma davası dilekçesi hazırla. Türk Medeni Kanunu hükümlerine uygun olsun.'),

('icra_itiraz',
'İCRA TAKİBİNE İTİRAZ DİLEKÇESİ

Sayın Hakime,

Borçlu: {borclu_adi}
Alacaklı: {alacakli_adi}
İcra Dosya No: {icra_dosya_no}

{itiraz_gerekce}

Saygılarımla,
{borclu_adi}',
'Kullanıcının verdiği bilgilere göre icra takibine itiraz dilekçesi hazırla. İcra ve İflas Kanunu hükümlerine uygun olsun.');

-- İndeksler
CREATE INDEX idx_usage_logs_user_id ON yargizeka.usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON yargizeka.usage_logs(created_at);
CREATE INDEX idx_saved_searches_user_id ON yargizeka.saved_searches(user_id);
CREATE INDEX idx_case_analyses_user_id ON yargizeka.case_analyses(user_id);