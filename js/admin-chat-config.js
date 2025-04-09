/**
 * n8n Chat Widget Configuration for Admin Pages
 * This file contains the specialized configuration for admin users.
 * 
 * !!! IMPORTANT: Replace the chatUrl with your actual n8n Chat endpoint URL !!!
 */

const N8N_ADMIN_CHAT_CONFIG = {
    // Required: URL to your n8n instance's chat endpoint
    // Replace this with your actual n8n Chat URL
    chatUrl: 'https://pro-lance.app.n8n.cloud/webhook/23795385-dda6-498e-9d37-4d1b2d47ec93/chat',
    
    // Appearance settings
    title: 'Admin Support',
    subtitle: 'Technical support for administrators',
    primaryColor: '#007bff', // Blue for admin to differentiate from user chat
    position: 'right',
    
    // Behavior settings
    showInitialMessage: true,
    initialMessage: 'Hello admin! Need technical assistance with the admin panel?',
    allowFileUpload: true, // Allow file uploads for admins to share error logs
    enableMarkdown: true,
    
    // Default to floating button
    containerSelector: null,
    
    // Additional settings
    closeAfterResponse: false,
    closeOnOverlayClick: true,
    poweredByEnabled: true,
    
    // Admin identification
    user: {
        id: 'admin-user', // This could be dynamically set based on the logged-in admin
        name: 'Admin User',
        role: 'administrator'
    }
};

// Export configuration for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = N8N_ADMIN_CHAT_CONFIG;
} 