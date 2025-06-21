-- Mevcut Veritabanını Tamamen Temizleme
-- Bu SQL'i Supabase SQL Editor'da ÖNCE çalıştırın

-- Mevcut tabloları ve şemaları sil
DROP TABLE IF EXISTS yargizeka.case_analyses CASCADE;
DROP TABLE IF EXISTS yargizeka.saved_searches CASCADE;
DROP TABLE IF EXISTS yargizeka.petition_templates CASCADE;
DROP TABLE IF EXISTS yargizeka.usage_logs CASCADE;
DROP TABLE IF EXISTS yargizeka.users CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Trigger fonksiyonlarını sil
DROP FUNCTION IF EXISTS yargizeka.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Şemayı sil
DROP SCHEMA IF EXISTS yargizeka CASCADE;

-- Auth kullanıcılarını da temizle (isteğe bağlı - sadece test kullanıcıları varsa)
-- UYARI: Bu gerçek kullanıcıları da silecek!
-- DELETE FROM auth.users;

COMMIT;