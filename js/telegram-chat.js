/**
 * Telegram-Style Chat Widget for Pro-Lance
 * Modern, responsive chat interface
 */

class TelegramChat {
    constructor(config = {}) {
        this.config = {
            title: 'Pro-Lance Destek',
            subtitle: 'Mesajlarınızı bekliyoruz',
            primaryColor: '#0088cc',
            secondaryColor: '#f1f3f4',
            position: 'right',
            avatar: '💬',
            ...config
        };
        
        this.isOpen = false;
        this.messages = [];
        this.messageId = 0;
        
        this.init();
    }
    
    init() {
        this.createStyles();
        this.createWidget();
        this.bindEvents();
        this.addWelcomeMessage();
    }
    
    createStyles() {
        const styles = `
            .telegram-chat-widget {
                position: fixed;
                ${this.config.position}: 20px;
                bottom: 20px;
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            }
            
            .telegram-chat-button {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, ${this.config.primaryColor}, #0066aa);
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(0, 136, 204, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                color: white;
                font-size: 28px;
                position: relative;
                overflow: hidden;
            }
            
            .telegram-chat-button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 25px rgba(0, 136, 204, 0.5);
            }
            
            .telegram-chat-button:active {
                transform: scale(0.95);
            }
            
            .telegram-chat-button::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                transform: scale(0);
                transition: transform 0.3s ease;
            }
            
            .telegram-chat-button:hover::before {
                transform: scale(1);
            }
            
            .telegram-chat-container {
                position: absolute;
                bottom: 80px;
                ${this.config.position}: 0;
                width: 380px;
                height: 500px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
                display: none;
                flex-direction: column;
                overflow: hidden;
                transform: translateY(20px) scale(0.9);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .telegram-chat-container.open {
                display: flex;
                transform: translateY(0) scale(1);
                opacity: 1;
            }
            
            .telegram-chat-header {
                background: linear-gradient(135deg, ${this.config.primaryColor}, #0066aa);
                color: white;
                padding: 16px 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                position: relative;
                overflow: hidden;
            }
            
            .telegram-chat-header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></svg>');
                opacity: 0.3;
            }
            
            .telegram-chat-header-info {
                display: flex;
                align-items: center;
                gap: 12px;
                position: relative;
                z-index: 1;
            }
            
            .telegram-chat-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                backdrop-filter: blur(10px);
            }
            
            .telegram-chat-header-text h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                line-height: 1.2;
            }
            
            .telegram-chat-header-text p {
                margin: 2px 0 0 0;
                font-size: 13px;
                opacity: 0.9;
                line-height: 1.2;
            }
            
            .telegram-chat-close {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 8px;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                position: relative;
                z-index: 1;
            }
            
            .telegram-chat-close:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: rotate(90deg);
            }
            
            .telegram-chat-messages {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                background: #f8f9fa;
                background-image: 
                    radial-gradient(circle at 25% 25%, rgba(0, 136, 204, 0.02) 0%, transparent 50%),
                    radial-gradient(circle at 75% 75%, rgba(0, 136, 204, 0.02) 0%, transparent 50%);
            }
            
            .telegram-chat-messages::-webkit-scrollbar {
                width: 4px;
            }
            
            .telegram-chat-messages::-webkit-scrollbar-track {
                background: transparent;
            }
            
            .telegram-chat-messages::-webkit-scrollbar-thumb {
                background: rgba(0, 136, 204, 0.3);
                border-radius: 2px;
            }
            
            .telegram-message {
                margin-bottom: 16px;
                display: flex;
                align-items: flex-end;
                gap: 8px;
                animation: messageSlideIn 0.3s ease-out;
            }
            
            @keyframes messageSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .telegram-message.user {
                flex-direction: row-reverse;
            }
            
            .telegram-message-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: ${this.config.primaryColor};
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 14px;
                font-weight: 600;
                flex-shrink: 0;
                box-shadow: 0 2px 8px rgba(0, 136, 204, 0.2);
            }
            
            .telegram-message.user .telegram-message-avatar {
                background: #28a745;
            }
            
            .telegram-message-bubble {
                background: white;
                padding: 12px 16px;
                border-radius: 18px;
                max-width: 75%;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                word-wrap: break-word;
                font-size: 14px;
                line-height: 1.4;
                position: relative;
                border: 1px solid rgba(0, 0, 0, 0.05);
            }
            
            .telegram-message.user .telegram-message-bubble {
                background: ${this.config.primaryColor};
                color: white;
                border-color: transparent;
            }
            
            .telegram-message-time {
                font-size: 11px;
                opacity: 0.6;
                margin-top: 4px;
                text-align: right;
            }
            
            .telegram-message.user .telegram-message-time {
                opacity: 0.8;
            }
            
            .telegram-typing-indicator {
                display: none;
                align-items: center;
                gap: 8px;
                margin-bottom: 16px;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .telegram-typing-indicator.show {
                display: flex;
                opacity: 1;
            }
            
            .telegram-typing-dots {
                display: flex;
                gap: 4px;
                padding: 12px 16px;
                background: white;
                border-radius: 18px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                border: 1px solid rgba(0, 0, 0, 0.05);
            }
            
            .telegram-typing-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: #999;
                animation: typingPulse 1.4s infinite ease-in-out;
            }
            
            .telegram-typing-dot:nth-child(2) {
                animation-delay: 0.2s;
            }
            
            .telegram-typing-dot:nth-child(3) {
                animation-delay: 0.4s;
            }
            
            @keyframes typingPulse {
                0%, 60%, 100% {
                    transform: scale(1);
                    opacity: 0.4;
                }
                30% {
                    transform: scale(1.3);
                    opacity: 1;
                }
            }
            
            .telegram-chat-input-container {
                padding: 16px 20px;
                background: white;
                border-top: 1px solid #e9ecef;
                display: flex;
                gap: 12px;
                align-items: flex-end;
            }
            
            .telegram-chat-input {
                flex: 1;
                border: 1px solid #e9ecef;
                border-radius: 20px;
                padding: 12px 16px;
                font-size: 14px;
                outline: none;
                resize: none;
                max-height: 100px;
                min-height: 20px;
                line-height: 1.4;
                transition: all 0.2s ease;
                background: #f8f9fa;
            }
            
            .telegram-chat-input:focus {
                border-color: ${this.config.primaryColor};
                background: white;
                box-shadow: 0 0 0 3px rgba(0, 136, 204, 0.1);
            }
            
            .telegram-chat-input::placeholder {
                color: #999;
            }
            
            .telegram-chat-send {
                background: ${this.config.primaryColor};
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                transition: all 0.2s ease;
                box-shadow: 0 2px 8px rgba(0, 136, 204, 0.3);
            }
            
            .telegram-chat-send:hover {
                background: #0066aa;
                transform: scale(1.05);
                box-shadow: 0 4px 12px rgba(0, 136, 204, 0.4);
            }
            
            .telegram-chat-send:active {
                transform: scale(0.95);
            }
            
            .telegram-chat-send:disabled {
                background: #ccc;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }
            
            @media (max-width: 480px) {
                .telegram-chat-container {
                    width: calc(100vw - 20px);
                    height: calc(100vh - 100px);
                    bottom: 80px;
                    ${this.config.position}: 10px;
                }
                
                .telegram-chat-widget {
                    ${this.config.position}: 15px;
                    bottom: 15px;
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    createWidget() {
        const widget = document.createElement('div');
        widget.className = 'telegram-chat-widget';
        widget.innerHTML = `
            <button class="telegram-chat-button" id="telegram-chat-toggle">
                ${this.config.avatar}
            </button>
            <div class="telegram-chat-container" id="telegram-chat-container">
                <div class="telegram-chat-header">
                    <div class="telegram-chat-header-info">
                        <div class="telegram-chat-avatar">${this.config.avatar}</div>
                        <div class="telegram-chat-header-text">
                            <h3>${this.config.title}</h3>
                            <p>${this.config.subtitle}</p>
                        </div>
                    </div>
                    <button class="telegram-chat-close" id="telegram-chat-close">
                        ×
                    </button>
                </div>
                <div class="telegram-chat-messages" id="telegram-chat-messages">
                    <div class="telegram-typing-indicator" id="telegram-typing-indicator">
                        <div class="telegram-message-avatar">🤖</div>
                        <div class="telegram-typing-dots">
                            <div class="telegram-typing-dot"></div>
                            <div class="telegram-typing-dot"></div>
                            <div class="telegram-typing-dot"></div>
                        </div>
                    </div>
                </div>
                <div class="telegram-chat-input-container">
                    <textarea class="telegram-chat-input" id="telegram-chat-input" 
                        placeholder="Mesajınızı yazın..." rows="1"></textarea>
                    <button class="telegram-chat-send" id="telegram-chat-send">
                        ➤
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(widget);
        
        // Store references
        this.elements = {
            toggle: document.getElementById('telegram-chat-toggle'),
            container: document.getElementById('telegram-chat-container'),
            close: document.getElementById('telegram-chat-close'),
            messages: document.getElementById('telegram-chat-messages'),
            input: document.getElementById('telegram-chat-input'),
            send: document.getElementById('telegram-chat-send'),
            typing: document.getElementById('telegram-typing-indicator')
        };
    }
    
    bindEvents() {
        // Toggle chat
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
            this.elements.input.style.height = Math.min(this.elements.input.scrollHeight, 100) + 'px';
        });
        
        // Click outside to close
        document.addEventListener('click', (e) => {
            if (this.isOpen && !e.target.closest('.telegram-chat-widget')) {
                this.closeChat();
            }
        });
    }
    
    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }
    
    openChat() {
        this.elements.container.classList.add('open');
        this.elements.input.focus();
        this.isOpen = true;
        this.scrollToBottom();
    }
    
    closeChat() {
        this.elements.container.classList.remove('open');
        this.isOpen = false;
    }
    
    addWelcomeMessage() {
        setTimeout(() => {
            this.addMessage(
                'Merhaba! 👋\n\nPro-Lance destek ekibine hoş geldiniz. Size nasıl yardımcı olabiliriz?', 
                'bot'
            );
        }, 1000);
    }
    
    sendMessage() {
        const message = this.elements.input.value.trim();
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        this.elements.input.value = '';
        this.elements.input.style.height = 'auto';
        
        // Show typing indicator
        this.showTyping();
        
        // Simulate bot response
        setTimeout(() => {
            this.hideTyping();
            this.generateBotResponse(message);
        }, 1000 + Math.random() * 2000);
    }
    
    generateBotResponse(userMessage) {
        const message = userMessage.toLowerCase();
        let response = '';
        
        if (message.includes('merhaba') || message.includes('selam') || message.includes('hello')) {
            response = 'Merhaba! Size nasıl yardımcı olabilirim? 😊';
        } else if (message.includes('hizmet') || message.includes('service') || message.includes('web') || message.includes('tasarım')) {
            response = 'Pro-Lance olarak şu hizmetleri sunuyoruz:\n\n• Web Tasarım & Geliştirme\n• Mobil Uygulama Geliştirme\n• SEO Optimizasyonu\n• Dijital Pazarlama\n• E-ticaret Çözümleri\n\nHangi konuda detaylı bilgi almak istersiniz?';
        } else if (message.includes('fiyat') || message.includes('ücret') || message.includes('price') || message.includes('cost')) {
            response = 'Fiyatlarımız proje kapsamına göre değişiklik göstermektedir. Size özel bir teklif hazırlayabilmemiz için:\n\n📧 hasancakir@smartiasolutions.com\n📞 İletişim formumuz üzerinden ulaşabilirsiniz.\n\nProje detaylarınızı paylaştığınızda 24 saat içinde geri dönüş yapıyoruz!';
        } else if (message.includes('iletişim') || message.includes('contact') || message.includes('telefon') || message.includes('email')) {
            response = 'Bizimle iletişime geçmenin birkaç yolu var:\n\n📧 E-posta: hasancakir@smartiasolutions.com\n🌐 Web sitesi iletişim formu\n💼 LinkedIn: Pro-Lance\n\nEn hızlı yanıt için e-posta tercih edebilirsiniz. Genellikle 2-4 saat içinde geri dönüş yapıyoruz!';
        } else if (message.includes('teşekkür') || message.includes('thanks') || message.includes('sağol')) {
            response = 'Rica ederim! 😊 Başka sorularınız varsa çekinmeden sorabilirsiniz. Yardımcı olmaktan mutluluk duyarız!';
        } else {
            response = 'Sorunuzu anladığımdan emin olmak istiyorum. Biraz daha detay verebilir misiniz?\n\nAşağıdaki konularda size yardımcı olabilirim:\n• Hizmetlerimiz hakkında bilgi\n• Fiyat teklifleri\n• İletişim bilgileri\n• Proje danışmanlığı';
        }
        
        this.addMessage(response, 'bot');
    }
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `telegram-message ${sender}`;
        
        const time = new Date().toLocaleTimeString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const avatar = sender === 'bot' ? '🤖' : '👤';
        
        messageDiv.innerHTML = `
            <div class="telegram-message-avatar">${avatar}</div>
            <div class="telegram-message-bubble">
                ${this.escapeHtml(text).replace(/\n/g, '<br>')}
                <div class="telegram-message-time">${time}</div>
            </div>
        `;
        
        this.elements.messages.insertBefore(messageDiv, this.elements.typing);
        this.messages.push({ text, sender, timestamp: new Date() });
        this.scrollToBottom();
    }
    
    showTyping() {
        this.elements.typing.classList.add('show');
        this.scrollToBottom();
    }
    
    hideTyping() {
        this.elements.typing.classList.remove('show');
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

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (!document.querySelector('.telegram-chat-widget')) {
        window.telegramChat = new TelegramChat();
    }
});

// Export for manual initialization
window.TelegramChat = TelegramChat;