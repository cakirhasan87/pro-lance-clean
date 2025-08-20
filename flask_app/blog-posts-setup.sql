-- Create the blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    slug VARCHAR UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    author VARCHAR DEFAULT 'Pro-Lance Team',
    language VARCHAR DEFAULT 'tr',
    status VARCHAR DEFAULT 'published',
    tags TEXT[] DEFAULT '{}',
    image_url VARCHAR,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add row level security (RLS) policies
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published posts
CREATE POLICY "Allow public read access to published posts" 
ON blog_posts FOR SELECT 
TO anon 
USING (status = 'published');

-- Allow authenticated users to view all posts
CREATE POLICY "Allow authenticated users to view all posts" 
ON blog_posts FOR SELECT 
TO authenticated 
USING (true);

-- Allow authenticated users to insert new posts
CREATE POLICY "Allow authenticated users to insert posts" 
ON blog_posts FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow authenticated users to update posts
CREATE POLICY "Allow authenticated users to update posts" 
ON blog_posts FOR UPDATE 
TO authenticated 
USING (true);

-- Allow authenticated users to delete posts
CREATE POLICY "Allow authenticated users to delete posts" 
ON blog_posts FOR DELETE 
TO authenticated 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_blog_posts_slug ON blog_posts (slug);
CREATE INDEX idx_blog_posts_status ON blog_posts (status);
CREATE INDEX idx_blog_posts_language ON blog_posts (language);
CREATE INDEX idx_blog_posts_published_at ON blog_posts (published_at DESC);
CREATE INDEX idx_blog_posts_tags ON blog_posts USING GIN (tags);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_blog_posts_updated_at 
    BEFORE UPDATE ON blog_posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
