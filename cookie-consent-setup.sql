-- Create the cookie_consent_logs table for KVKK-compliant cookie consent tracking
CREATE TABLE cookie_consent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR, -- Anonymous user identifier
    session_id VARCHAR, -- Session identifier
    consent_status VARCHAR NOT NULL, -- 'accepted_all', 'rejected_all', 'custom_settings'
    cookie_settings JSONB, -- Detailed cookie settings for each category
    page_url VARCHAR NOT NULL, -- URL where consent was given
    user_agent TEXT, -- Browser user agent
    ip_address VARCHAR, -- IP address (if available)
    language VARCHAR, -- User's language preference
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add row level security (RLS) policies
ALTER TABLE cookie_consent_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert cookie consent data
CREATE POLICY "Allow anonymous users to insert cookie consent" 
ON cookie_consent_logs FOR INSERT 
TO anon 
WITH CHECK (true);

-- Allow authenticated users to view cookie consent data
CREATE POLICY "Allow authenticated users to view cookie consent" 
ON cookie_consent_logs FOR SELECT 
TO authenticated 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_cookie_consent_created_at ON cookie_consent_logs (created_at DESC);
CREATE INDEX idx_cookie_consent_status ON cookie_consent_logs (consent_status);
CREATE INDEX idx_cookie_consent_user_id ON cookie_consent_logs (user_id);
CREATE INDEX idx_cookie_consent_session_id ON cookie_consent_logs (session_id);
CREATE INDEX idx_cookie_consent_language ON cookie_consent_logs (language);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_cookie_consent_logs_updated_at 
    BEFORE UPDATE ON cookie_consent_logs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create a view for consent analytics
CREATE VIEW cookie_consent_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as consent_date,
    consent_status,
    language,
    COUNT(*) as consent_count,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as unique_sessions
FROM cookie_consent_logs
GROUP BY DATE_TRUNC('day', created_at), consent_status, language
ORDER BY consent_date DESC, consent_status;

-- Create a view for detailed cookie settings analysis
CREATE VIEW cookie_settings_analysis AS
SELECT 
    consent_status,
    language,
    COUNT(*) as total_consents,
    COUNT(*) FILTER (WHERE cookie_settings->>'necessary' = 'true') as necessary_enabled,
    COUNT(*) FILTER (WHERE cookie_settings->>'functional' = 'true') as functional_enabled,
    COUNT(*) FILTER (WHERE cookie_settings->>'performance' = 'true') as performance_enabled,
    COUNT(*) FILTER (WHERE cookie_settings->>'marketing' = 'true') as marketing_enabled
FROM cookie_consent_logs
WHERE cookie_settings IS NOT NULL
GROUP BY consent_status, language
ORDER BY consent_status, language; 