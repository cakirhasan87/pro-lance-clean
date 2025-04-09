-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    message TEXT NOT NULL,
    is_bot BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    session_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create the chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
    status VARCHAR DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_activity ON chat_sessions(last_activity DESC);

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow users to view their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Allow users to insert their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Allow anonymous chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Allow users to view their own sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Allow users to create their own sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Allow users to update their own sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Allow anonymous chat sessions" ON chat_sessions;

-- Create policies for chat_messages
CREATE POLICY "Allow users to view their own messages"
ON chat_messages FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Allow users to insert their own messages"
ON chat_messages FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow anonymous chat messages"
ON chat_messages FOR INSERT
TO anon
WITH CHECK (true);

-- Create policies for chat_sessions
CREATE POLICY "Allow users to view their own sessions"
ON chat_sessions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Allow users to create their own sessions"
ON chat_sessions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow users to update their own sessions"
ON chat_sessions FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Allow anonymous chat sessions"
ON chat_sessions FOR INSERT
TO anon
WITH CHECK (true);

-- Create function to update session last_activity
CREATE OR REPLACE FUNCTION update_session_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_sessions
    SET last_activity = NOW()
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update session last_activity
DROP TRIGGER IF EXISTS update_session_last_activity_trigger ON chat_messages;
CREATE TRIGGER update_session_last_activity_trigger
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_session_last_activity();

-- Create function to get chat history
CREATE OR REPLACE FUNCTION get_chat_history(p_session_id UUID)
RETURNS TABLE (
    id UUID,
    message TEXT,
    is_bot BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.message,
        m.is_bot,
        m.created_at,
        m.metadata
    FROM chat_messages m
    WHERE m.session_id = p_session_id
    ORDER BY m.created_at ASC;
END;
$$ LANGUAGE plpgsql; 