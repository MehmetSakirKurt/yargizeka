-- YargıZeka Basit Şema (public şemasında)
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

-- Kullanıcı metadata tablosu (public şemasında)
CREATE TABLE IF NOT EXISTS users (
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

-- RLS (Row Level Security) etkinleştir
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Politikaları
CREATE POLICY IF NOT EXISTS "Kullanıcılar kendi kayıtlarını görebilir" ON users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Kullanıcılar kendi kayıtlarını ekleyebilir" ON users
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Kullanıcılar kendi kayıtlarını güncelleyebilir" ON users
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Kullanıcılar kendi kayıtlarını silebilir" ON users
    FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();