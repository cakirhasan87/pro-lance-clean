// Supabase client configuration for cookie consent
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Initialize the Supabase client
const supabaseUrl = 'https://drxstcmoroaupedsynhq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyeHN0Y21vcm9hdXBlZHN5bmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTA2NDAsImV4cCI6MjA1ODM4NjY0MH0.9AjInAaxWnYesZ_UuDOKtJVfVNO_RetqMmvZsCql11k'
const supabase = createClient(supabaseUrl, supabaseKey)

export { supabase } 