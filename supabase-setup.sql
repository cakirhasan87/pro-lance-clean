-- Supabase Contact Form Table Setup
-- Bu SQL script'ini Supabase SQL Editor'da çalıştırın

-- Contact submissions tablosunu oluştur
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    attachment_name TEXT,
    attachment_size BIGINT,
    source TEXT DEFAULT 'pro-lance-website',
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) politikalarını ayarla
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anonim kullanıcıların sadece insert yapabilmesine izin ver
CREATE POLICY "Allow anonymous inserts" ON contact_submissions
    FOR INSERT WITH CHECK (true);

-- Admin kullanıcıların tüm işlemleri yapabilmesine izin ver (opsiyonel)
CREATE POLICY "Allow admin all operations" ON contact_submissions
    FOR ALL USING (auth.role() = 'authenticated');

-- Index'ler oluştur (performans için)
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);

-- Otomatik updated_at güncellemesi için trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contact_submissions_updated_at 
    BEFORE UPDATE ON contact_submissions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Örnek veri ekleme (test için)
-- INSERT INTO contact_submissions (name, email, phone, subject, message) 
-- VALUES ('Test User', 'test@example.com', '(555) 123-4567', 'Test Subject', 'Test message content');

-- Tablo yapısını kontrol et
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'contact_submissions' 
-- ORDER BY ordinal_position;
