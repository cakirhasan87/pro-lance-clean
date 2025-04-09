-- Create the chat_messages table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    message TEXT NOT NULL,
    is_bot BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    session_id UUID,
    metadata JSONB
);

-- Create the chat_sessions table
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
    status VARCHAR DEFAULT 'active',
    metadata JSONB
);

-- Add indexes for better query performance
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_last_activity ON chat_sessions(last_activity);

-- Add row level security (RLS) policies
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for chat_messages
CREATE POLICY "Allow users to view their own messages"
ON chat_messages FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Allow users to insert their own messages"
ON chat_messages FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policies for chat_sessions
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

-- Allow anonymous access for the chat widget
CREATE POLICY "Allow anonymous chat messages"
ON chat_messages FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow anonymous chat sessions"
ON chat_sessions FOR INSERT
TO anon
WITH CHECK (true); 