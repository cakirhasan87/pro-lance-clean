/**
 * Pro-Lance Modern Chatbot Widget
 * Tamamen bağımsız, Flask backend ile çalışan modern chatbot
 */

class ProLanceChatbot {
    constructor(config = {}) {
        this.config = {
            title: 'Pro-Lance Destek',
            subtitle: 'Size nasıl yardımcı olabilirim?',
            botName: 'Çetin',
            language: 'tr',
            position: 'right',
            primaryColor: '#4CAF50',
            apiEndpoint: '/api/chat/message',
            sessionEndpoint: '/api/chat/session',
            ...config
        };
        
        this.sessionId = null;
        this.isOpen = false;
        this.messages = [];
        this.isTyping = false;
        
        this.init();
    }
    
    init() {
        this.createStyles();
        this.createWidget();
        this.createSession();
        this.bindEvents();
    }
    
    createStyles() {
        const styles = `
            .prolance-chatbot {
                position: fixed;
                ${this.config.position}: 20px;
                bottom: 20px;
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .prolance-chat-button {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: ${this.config.primaryColor};
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                color: white;
                font-size: 24px;
            }
            
            .prolance-chat-button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(0,0,0,0.2);
            }
            
            .prolance-chat-window {
                position: absolute;
                bottom: 80px;
                ${this.config.position}: 0;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 30px rgba(0,0,0,0.2);
                display: none;
                flex-direction: column;
                overflow: hidden;
                animation: slideUp 0.3s ease-out;
            }
            
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .prolance-chat-header {
                background: ${this.config.primaryColor};
                color: white;
                padding: 15px 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .prolance-chat-header-info h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }
            
            .prolance-chat-header-info p {
                margin: 2px 0 0 0;
                font-size: 12px;
                opacity: 0.9;
            }
            
            .prolance-chat-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .prolance-chat-messages {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                background: #f8f9fa;
            }
            
            .prolance-chat-message {
                margin-bottom: 15px;
                display: flex;
                align-items: flex-start;
                gap: 10px;
            }
            
            .prolance-chat-message.user {
                flex-direction: row-reverse;
            }
            
            .prolance-chat-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: ${this.config.primaryColor};
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 12px;
                font-weight: bold;
                flex-shrink: 0;
            }
            
            .prolance-chat-message.user .prolance-chat-avatar {
                background: #007bff;
            }
            
            .prolance-chat-bubble {
                background: white;
                padding: 12px 16px;
                border-radius: 18px;
                max-width: 70%;
                box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                word-wrap: break-word;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .prolance-chat-message.user .prolance-chat-bubble {
                background: ${this.config.primaryColor};
                color: white;
            }
            
            .prolance-chat-typing {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 15px;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .prolance-chat-typing.show {
                opacity: 1;
            }
            
            .prolance-typing-dots {
                display: flex;
                gap: 4px;
                padding: 12px 16px;
                background: white;
                border-radius: 18px;
                box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }
            
            .prolance-typing-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #ccc;
                animation: typingPulse 1.4s infinite ease-in-out;
            }
            
            .prolance-typing-dot:nth-child(2) {
                animation-delay: 0.2s;
            }
            
            .prolance-typing-dot:nth-child(3) {
                animation-delay: 0.4s;
            }
            
            @keyframes typingPulse {
                0%, 60%, 100% {
                    transform: scale(1);
                    opacity: 0.5;
                }
                30% {
                    transform: scale(1.2);
                    opacity: 1;
                }
            }
            
            .prolance-chat-input-container {
                padding: 15px 20px;
                background: white;
                border-top: 1px solid #eee;
                display: flex;
                gap: 10px;
                align-items: center;
            }
            
            .prolance-chat-input {
                flex: 1;
                border: 1px solid #ddd;
                border-radius: 20px;
                padding: 10px 15px;
                font-size: 14px;
                outline: none;
                resize: none;
                max-height: 80px;
                min-height: 20px;
            }
            
            .prolance-chat-input:focus {
                border-color: ${this.config.primaryColor};
            }
            
            .prolance-chat-send {
                background: ${this.config.primaryColor};
                border: none;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                transition: background 0.2s ease;
            }
            
            .prolance-chat-send:hover {
                background: #45a049;
            }
            
            .prolance-chat-send:disabled {
                background: #ccc;
                cursor: not-allowed;
            }
            
            @media (max-width: 480px) {
                .prolance-chat-window {
                    width: calc(100vw - 40px);
                    height: calc(100vh - 100px);
                    bottom: 80px;
                    ${this.config.position}: 20px;
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    createWidget() {
        const widget = document.createElement('div');
        widget.className = 'prolance-chatbot';
        widget.innerHTML = `
            <button class="prolance-chat-button" id="prolance-chat-toggle">
                💬
            </button>
            <div class="prolance-chat-window" id="prolance-chat-window">
                <div class="prolance-chat-header">
                    <div class="prolance-chat-header-info">
                        <h3>${this.config.title}</h3>
                        <p>${this.config.subtitle}</p>
                    </div>
                    <button class="prolance-chat-close" id="prolance-chat-close">
                        ×
                    </button>
                </div>
                <div class="prolance-chat-messages" id="prolance-chat-messages">
                    <div class="prolance-chat-typing" id="prolance-chat-typing">
                        <div class="prolance-chat-avatar">Ç</div>
                        <div class="prolance-typing-dots">
                            <div class="prolance-typing-dot"></div>
                            <div class="prolance-typing-dot"></div>
                            <div class="prolance-typing-dot"></div>
                        </div>
                    </div>
                </div>
                <div class="prolance-chat-input-container">
                    <textarea class="prolance-chat-input" id="prolance-chat-input" 
                        placeholder="Mesajınızı yazın..." rows="1"></textarea>
                    <button class="prolance-chat-send" id="prolance-chat-send">
                        ➤
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(widget);
        
        // Store references
        this.elements = {
            toggle: document.getElementById('prolance-chat-toggle'),
            window: document.getElementById('prolance-chat-window'),
            close: document.getElementById('prolance-chat-close'),
            messages: document.getElementById('prolance-chat-messages'),
            input: document.getElementById('prolance-chat-input'),
            send: document.getElementById('prolance-chat-send'),
            typing: document.getElementById('prolance-chat-typing')
        };
    }
    
    bindEvents() {
        // Toggle chat window
        this.elements.toggle.addEventListener('click', () => this.toggleChat());
        this.elements.close.addEventListener('click', () => this.closeChat());
        
        // Send message
        this.elements.send.addEventListener('click', () => this.sendMessage());
        this.elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize textarea
        this.elements.input.addEventListener('input', () => {
            this.elements.input.style.height = 'auto';
            this.elements.input.style.height = this.elements.input.scrollHeight + 'px';
        });
    }
    
    async createSession() {
        try {
            const response = await fetch(this.config.sessionEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    language: this.config.language
                })
            });
            
            const data = await response.json();
            if (data.success) {
                this.sessionId = data.session_id;
                // Add initial greeting message
                this.addMessage(data.greeting, 'bot');
            }
        } catch (error) {
            console.error('Error creating chat session:', error);
            // Fallback greeting
            const greeting = this.config.language === 'tr' 
                ? 'Merhaba! Ben Çetin, Pro-Lance destek asistanıyım. Size nasıl yardımcı olabilirim?'
                : 'Hello! I\'m Çetin, Pro-Lance support assistant. How can I help you?';
            this.addMessage(greeting, 'bot');
        }
    }
    
    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }
    
    openChat() {
        this.elements.window.style.display = 'flex';
        this.elements.input.focus();
        this.isOpen = true;
        this.scrollToBottom();
    }
    
    closeChat() {
        this.elements.window.style.display = 'none';
        this.isOpen = false;
    }
    
    async sendMessage() {
        const message = this.elements.input.value.trim();
        if (!message || this.isTyping) return;
        
        // Add user message
        this.addMessage(message, 'user');
        this.elements.input.value = '';
        this.elements.input.style.height = 'auto';
        
        // Show typing indicator
        this.showTyping();
        
        try {
            const response = await fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    language: this.config.language,
                    session_id: this.sessionId
                })
            });
            
            const data = await response.json();
            
            // Hide typing indicator
            this.hideTyping();
            
            if (data.success) {
                // Add bot response with slight delay for natural feel
                setTimeout(() => {
                    this.addMessage(data.response, 'bot');
                }, 500);
            } else {
                this.addMessage('Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.', 'bot');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTyping();
            this.addMessage('Bağlantı hatası. Lütfen tekrar deneyin.', 'bot');
        }
    }
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `prolance-chat-message ${sender}`;
        
        const avatar = sender === 'bot' ? 'Ç' : 'S';
        const avatarColor = sender === 'bot' ? this.config.primaryColor : '#007bff';
        
        messageDiv.innerHTML = `
            <div class="prolance-chat-avatar" style="background: ${avatarColor}">${avatar}</div>
            <div class="prolance-chat-bubble">${this.escapeHtml(text)}</div>
        `;
        
        this.elements.messages.insertBefore(messageDiv, this.elements.typing);
        this.messages.push({ text, sender, timestamp: new Date() });
        this.scrollToBottom();
    }
    
    showTyping() {
        this.isTyping = true;
        this.elements.typing.classList.add('show');
        this.elements.send.disabled = true;
        this.scrollToBottom();
    }
    
    hideTyping() {
        this.isTyping = false;
        this.elements.typing.classList.remove('show');
        this.elements.send.disabled = false;
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
        }, 100);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Auto-initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if chatbot should be initialized
    if (!document.querySelector('.prolance-chatbot')) {
        // Detect language from page
        const language = document.documentElement.lang || 
                        (document.URL.includes('/tr/') ? 'tr' : 
                         document.URL.includes('/en/') ? 'en' : 'tr');
        
        // Initialize chatbot
        window.proLanceChatbot = new ProLanceChatbot({
            language: language
        });
    }
});

// Export for manual initialization
window.ProLanceChatbot = ProLanceChatbot; 