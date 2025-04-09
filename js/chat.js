/**
 * n8n Chat Widget Integration
 * This script loads and configures the n8n Chat widget
 */

// Load the n8n Chat widget script
function loadChatWidget() {
    // First load the configuration
    const configScript = document.createElement('script');
    configScript.src = './js/chat-config.js';
    console.log('Loading chat config from:', configScript.src);
    configScript.onload = loadChatWidgetScript;
    configScript.onerror = function() {
        console.error('Failed to load chat config script');
    };
    document.head.appendChild(configScript);
}

// Load the actual widget script after config is loaded
function loadChatWidgetScript() {
    console.log('Chat config loaded successfully');
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@n8n/chat/widget.js';
    script.async = true;
    console.log('Loading n8n chat widget from:', script.src);
    script.onload = initializeChatWidget;
    script.onerror = function() {
        console.error('Failed to load n8n chat widget script');
    };
    document.head.appendChild(script);

    // Add the required CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/@n8n/chat/style.css';
    document.head.appendChild(link);
}

// Initialize the chat widget with configuration
function initializeChatWidget() {
    console.log('Chat widget script loaded successfully');
    if (typeof window.n8nChat === 'undefined') {
        console.error('n8n Chat widget failed to load - window.n8nChat is undefined');
        return;
    }

    // Use the configuration from the config file
    if (typeof N8N_CHAT_CONFIG === 'undefined') {
        console.error('n8n Chat configuration not found - N8N_CHAT_CONFIG is undefined');
        return;
    }

    console.log('Initializing chat with config:', JSON.stringify(N8N_CHAT_CONFIG));

    // Initialize the widget with the config
    window.n8nChat.init({
        chatConfig: N8N_CHAT_CONFIG
    });

    console.log('Chat widget initialized');

    // Add any custom event listeners
    const widget = document.querySelector('.n8n-chat-widget');
    if (widget) {
        // Example: track when chat is opened
        widget.addEventListener('click', function(e) {
            if (e.target.closest('.n8n-chat-button')) {
                console.log('Chat widget opened');
                // You could add analytics tracking here
            }
        });
    }
}

// Load the chat widget when the page is fully loaded
document.addEventListener('DOMContentLoaded', loadChatWidget); 