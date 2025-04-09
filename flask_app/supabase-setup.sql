-- Create the contact_messages table
CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    phone VARCHAR,
    subject VARCHAR NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    status VARCHAR DEFAULT 'unread'
);

-- Add row level security (RLS) policies
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Only allow authenticated users to view the messages
CREATE POLICY "Allow authenticated users to view messages" 
ON contact_messages FOR SELECT 
TO authenticated 
USING (true);

-- Only allow authenticated users to insert new messages
CREATE POLICY "Allow anonymous users to insert messages" 
ON contact_messages FOR INSERT 
TO anon 
WITH CHECK (true);

-- Only allow authenticated users to update messages
CREATE POLICY "Allow authenticated users to update messages" 
ON contact_messages FOR UPDATE 
TO authenticated 
USING (true);

-- Create an index on the created_at column for sorting
CREATE INDEX idx_contact_messages_created_at ON contact_messages (created_at DESC); 