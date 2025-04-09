import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Initialize Supabase client with the new project credentials
const supabaseUrl = 'https://hhudczwbcjejxvbxglkv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhodWRjendiejZqZWp4dmJ4Z2xrdiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzA5NzQ3MTU3LCJleHAiOjIwMjUzMjMxNTd9.P_C70m_yEY0H9M72_QvEVX-HSY0nPipJrWpvrdmxQ0M'

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupChatTables() {
    try {
        // Read the SQL file
        const sql = readFileSync(join(__dirname, 'chat-tables.sql'), 'utf8')

        // Execute the SQL commands
        const { data, error } = await supabase.rpc('exec_sql', { sql })

        if (error) {
            console.error('Error setting up chat tables:', error)
            return
        }

        console.log('Chat tables created successfully!')
        
        // Verify the tables were created
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .in('table_name', ['chat_messages', 'chat_sessions'])

        if (tablesError) {
            console.error('Error verifying tables:', tablesError)
            return
        }

        console.log('Created tables:', tables)
    } catch (error) {
        console.error('Error:', error)
    }
}

setupChatTables() 