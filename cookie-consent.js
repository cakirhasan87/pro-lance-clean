// Import Supabase client
import { supabase } from './js/supabase-client.js';

class CookieConsent {
    constructor() {
        this.cookieName = 'cookie_consent';
        this.cookieValue = null;
        this.banner = null;
        this.revisitButton = null;
        this.settingsModal = null;
        this.userId = this.generateUserId();
        this.sessionId = this.generateSessionId();
        this.init();
    }

    init() {
        this.createBanner();
        this.createSettingsModal();
        this.createRevisitButton();
        this.cookieValue = this.getCookie(this.cookieName);
        
        if (this.cookieValue === null) {
            this.showBanner();
        } else {
            this.hideBanner();
            this.updateRevisitButton();
        }
    }

    createBanner() {
        this.banner = document.createElement('div');
        this.banner.className = 'cookie-consent hidden';
        this.banner.innerHTML = `
            <div class="cookie-consent-content">
                <div class="cookie-consent-header">
                    <h3>🍪 Çerez Kullanımı ve Kişisel Veriler</h3>
                    <p>Bu web sitesi, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca çerezler kullanmaktadır. Deneyiminizi geliştirmek ve size daha iyi hizmet sunmak için çerezler kullanıyoruz.</p>
                </div>
                <div class="cookie-consent-info">
                    <p><strong>Çerez Türleri:</strong></p>
                    <ul>
                        <li><strong>Zorunlu Çerezler:</strong> Sitenin temel işlevleri için gerekli</li>
                        <li><strong>İşlevsel Çerezler:</strong> Kullanıcı tercihlerini hatırlamak için</li>
                        <li><strong>Performans Çerezleri:</strong> Site performansını analiz etmek için</li>
                        <li><strong>Pazarlama Çerezleri:</strong> Kişiselleştirilmiş içerik sunmak için</li>
                    </ul>
                    <p>Detaylı bilgi için <a href="/privacy-policy.html" target="_blank">Gizlilik Politikamızı</a> inceleyebilirsiniz.</p>
                </div>
                <div class="cookie-consent-buttons">
                    <button class="cookie-consent-button cookie-consent-settings">Detaylı Ayarlar</button>
                    <button class="cookie-consent-button cookie-consent-accept-all">Tümünü Kabul Et</button>
                    <button class="cookie-consent-button cookie-consent-reject-all">Tümünü Reddet</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.banner);

        this.banner.querySelector('.cookie-consent-accept-all').addEventListener('click', () => this.acceptAll());
        this.banner.querySelector('.cookie-consent-reject-all').addEventListener('click', () => this.rejectAll());
        this.banner.querySelector('.cookie-consent-settings').addEventListener('click', () => this.showSettings());
    }

    createSettingsModal() {
        this.settingsModal = document.createElement('div');
        this.settingsModal.className = 'cookie-settings-modal hidden';
        this.settingsModal.innerHTML = `
            <div class="cookie-settings-content">
                <div class="cookie-settings-header">
                    <h2>🍪 Çerez Ayarları</h2>
                    <button class="cookie-settings-close">&times;</button>
                </div>
                <div class="cookie-settings-body">
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <label class="cookie-category-toggle">
                                <input type="checkbox" id="necessary-cookies" checked disabled>
                                <span class="cookie-category-slider"></span>
                            </label>
                            <div class="cookie-category-info">
                                <h4>Zorunlu Çerezler</h4>
                                <p>Bu çerezler web sitesinin temel işlevleri için gereklidir ve devre dışı bırakılamaz. Bu çerezler kişisel veri içermez ve KVKK kapsamında değildir.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <label class="cookie-category-toggle">
                                <input type="checkbox" id="functional-cookies">
                                <span class="cookie-category-slider"></span>
                            </label>
                            <div class="cookie-category-info">
                                <h4>İşlevsel Çerezler</h4>
                                <p>Bu çerezler kullanıcı tercihlerini hatırlamak ve gelişmiş işlevsellik sağlamak için kullanılır. Bu çerezler olmadan bazı özellikler düzgün çalışmayabilir.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <label class="cookie-category-toggle">
                                <input type="checkbox" id="performance-cookies">
                                <span class="cookie-category-slider"></span>
                            </label>
                            <div class="cookie-category-info">
                                <h4>Performans Çerezleri</h4>
                                <p>Bu çerezler web sitesinin performansını analiz etmek ve kullanıcı deneyimini iyileştirmek için kullanılır. Bu çerezler anonim veri toplar.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <label class="cookie-category-toggle">
                                <input type="checkbox" id="marketing-cookies">
                                <span class="cookie-category-slider"></span>
                            </label>
                            <div class="cookie-category-info">
                                <h4>Pazarlama Çerezleri</h4>
                                <p>Bu çerezler size kişiselleştirilmiş reklamlar ve içerik sunmak için kullanılır. Bu çerezler üçüncü taraf hizmetler tarafından da yerleştirilebilir.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="cookie-settings-footer">
                    <button class="cookie-settings-save">Ayarları Kaydet</button>
                    <button class="cookie-settings-cancel">İptal</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.settingsModal);

        this.settingsModal.querySelector('.cookie-settings-close').addEventListener('click', () => this.hideSettings());
        this.settingsModal.querySelector('.cookie-settings-cancel').addEventListener('click', () => this.hideSettings());
        this.settingsModal.querySelector('.cookie-settings-save').addEventListener('click', () => this.saveSettings());
        
        // Close modal when clicking outside
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.hideSettings();
            }
        });
    }

    createRevisitButton() {
        this.revisitButton = document.createElement('button');
        this.revisitButton.className = 'cookie-consent-revisit hidden';
        this.revisitButton.innerHTML = '🍪 Çerez Ayarları';
        this.revisitButton.addEventListener('click', () => this.showSettings());
        document.body.appendChild(this.revisitButton);
    }

    showBanner() {
        this.banner.classList.remove('hidden');
        this.revisitButton.classList.add('hidden');
    }

    hideBanner() {
        this.banner.classList.add('hidden');
    }

    showSettings() {
        this.settingsModal.classList.remove('hidden');
        this.hideBanner();
        this.revisitButton.classList.add('hidden');
        
        // Load current settings
        this.loadCurrentSettings();
    }

    hideSettings() {
        this.settingsModal.classList.add('hidden');
        this.updateRevisitButton();
    }

    updateRevisitButton() {
        this.revisitButton.classList.remove('hidden');
    }

    loadCurrentSettings() {
        const settings = this.getCookieSettings();
        
        document.getElementById('functional-cookies').checked = settings.functional;
        document.getElementById('performance-cookies').checked = settings.performance;
        document.getElementById('marketing-cookies').checked = settings.marketing;
    }

    getCookieSettings() {
        const settingsCookie = this.getCookie('cookie_settings');
        if (settingsCookie) {
            try {
                return JSON.parse(settingsCookie);
            } catch (e) {
                return this.getDefaultSettings();
            }
        }
        return this.getDefaultSettings();
    }

    getDefaultSettings() {
        return {
            necessary: true, // Always true, cannot be disabled
            functional: false,
            performance: false,
            marketing: false
        };
    }

    async acceptAll() {
        const settings = {
            necessary: true,
            functional: true,
            performance: true,
            marketing: true
        };
        
        this.setCookieSettings(settings);
        this.hideBanner();
        this.updateRevisitButton();
        
        await this.saveToSupabase('accepted_all', settings);
    }

    async rejectAll() {
        const settings = this.getDefaultSettings();
        
        this.setCookieSettings(settings);
        this.hideBanner();
        this.updateRevisitButton();
        
        await this.saveToSupabase('rejected_all', settings);
    }

    async saveSettings() {
        const settings = {
            necessary: true, // Always true
            functional: document.getElementById('functional-cookies').checked,
            performance: document.getElementById('performance-cookies').checked,
            marketing: document.getElementById('marketing-cookies').checked
        };
        
        this.setCookieSettings(settings);
        this.hideSettings();
        
        await this.saveToSupabase('custom_settings', settings);
    }

    setCookieSettings(settings) {
        this.setCookie('cookie_settings', JSON.stringify(settings), 365);
        this.setCookie(this.cookieName, 'configured', 365);
        this.cookieValue = 'configured';
    }

    async saveToSupabase(consentStatus, settings = null) {
        try {
            const consentData = {
                user_id: this.userId,
                session_id: this.sessionId,
                consent_status: consentStatus,
                cookie_settings: settings ? JSON.stringify(settings) : null,
                page_url: window.location.href,
                user_agent: navigator.userAgent,
                language: navigator.language || 'tr',
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('cookie_consent_logs')
                .insert([consentData]);

            if (error) {
                console.error('Error saving cookie consent to Supabase:', error);
            } else {
                console.log('Cookie consent saved to Supabase successfully');
            }
        } catch (error) {
            console.error('Error saving cookie consent to Supabase:', error);
        }
    }

    generateUserId() {
        let userId = localStorage.getItem('prolance_user_id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('prolance_user_id', userId);
        }
        return userId;
    }

    generateSessionId() {
        let sessionId = sessionStorage.getItem('prolance_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('prolance_session_id', sessionId);
        }
        return sessionId;
    }

    setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Lax";
    }

    getCookie(name) {
        const cookieName = name + "=";
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.indexOf(cookieName) === 0) {
                return cookie.substring(cookieName.length, cookie.length);
            }
        }
        return null;
    }
}

// Initialize cookie consent when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CookieConsent();
}); 