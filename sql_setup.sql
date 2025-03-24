-- Create a simplified contact_form table without RLS
CREATE TABLE IF NOT EXISTS public.contact_form (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL
);

-- Completely disable RLS for the contact_form table (for testing)
ALTER TABLE public.contact_form DISABLE ROW LEVEL SECURITY;

-- Create an API for inserting data into contact_form
INSERT INTO public.contact_form (name, email, phone, subject, message)
VALUES ('Test User', 'test@example.com', '555-1234', 'Test Subject', 'This is a test message');

-- Fix the contact_submissions table policies
ALTER TABLE public.contact_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create the correct policies
CREATE POLICY "Allow anon inserts" ON public.contact_submissions 
  FOR INSERT TO anon 
  WITH CHECK (true);

CREATE POLICY "Allow all selects" ON public.contact_submissions
  FOR SELECT TO anon
  USING (true); 