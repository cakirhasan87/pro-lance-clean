// Supabase Configuration for Pro-Lance Contact Form
const SUPABASE_CONFIG = {
    url: 'https://drxstcmoroaupedsynhq.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyeHN0Y21vcm9hdXBlZHN5bmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTA2NDAsImV4cCI6MjA1ODM4NjY0MH0.9AjInAaxWnYesZ_UuDOKtJVfVNO_RetqMmvZsCql11k',
    tableName: 'contact_submissions'
};

// Supabase client initialization
let supabase = null;

// Initialize Supabase client
function initSupabase() {
    if (typeof window !== 'undefined' && window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    }
}

// Save contact form data to Supabase
async function saveToSupabase(formData) {
    try {
        if (!supabase) {
            console.error('Supabase client not initialized');
            return { success: false, error: 'Database connection not available' };
        }

        const submissionData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            attachment_name: formData.get('attachment')?.name || null,
            attachment_size: formData.get('attachment')?.size || null,
            source: 'pro-lance-website',
            created_at: new Date().toISOString(),
            status: 'new'
        };

        const { data, error } = await supabase
            .from(SUPABASE_CONFIG.tableName)
            .insert([submissionData]);

        if (error) {
            console.error('Supabase insert error:', error);
            return { success: false, error: error.message };
        }

        console.log('Data saved to Supabase:', data);
        return { success: true, data };

    } catch (error) {
        console.error('Supabase save error:', error);
        return { success: false, error: error.message };
    }
}

// Export functions
window.SupabaseConfig = {
    init: initSupabase,
    save: saveToSupabase,
    config: SUPABASE_CONFIG
};
