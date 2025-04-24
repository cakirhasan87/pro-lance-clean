/**
 * n8n Chat Widget Configuration
 * This file contains the configuration for the n8n Chat widget.
 * Update the values as needed to match your n8n instance.
 * 
 * !!! IMPORTANT: Replace the chatUrl with your actual n8n Chat endpoint URL !!!
 */

const N8N_CHAT_CONFIG = {
    // Required: URL to your n8n instance's chat endpoint
    // For local development, use your local n8n instance URL
    chatUrl: 'https://pro-lance.app.n8n.cloud/webhook/23795385-dda6-498e-9d37-4d1b2d47ec93/chat',
    
    // Appearance settings
    title: 'Pro-Lance Support',
    subtitle: 'Ask us anything about our services',
    primaryColor: '#007bff',
    position: 'right', // 'left' or 'right'
    
    // Behavior settings
    showInitialMessage: false,
    initialMessage: '',
    allowFileUpload: false,
    enableMarkdown: true,
    
    // Bot settings
    botName: 'Çetin',
    
    // Default to floating button, set to CSS selector for embedded mode
    containerSelector: null,
    
    // Advanced settings
    closeAfterResponse: false,
    closeOnOverlayClick: true,
    poweredByEnabled: true,
    
    // Debug mode for local development
    debug: true,
    
    // Optional user identification - uncomment and customize if needed
    // user: {
    //     id: '', // Can be dynamically generated based on user session
    //     name: '', // Can be populated from user profile
    //     email: '' // Can be populated from user profile
    // }
};

// Export configuration for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = N8N_CHAT_CONFIG;
} 