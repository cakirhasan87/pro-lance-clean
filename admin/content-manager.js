// Content Manager JavaScript
class ContentManager {
    constructor() {
        this.contentData = {};
        this.unsavedChanges = new Set();
        this.currentFilters = {
            page: '',
            language: '',
            search: ''
        };
        this.init();
    }

    init() {
        this.loadContentData();
        this.setupEventListeners();
        this.renderContentEditors();
    }

    loadContentData() {
        // Load from localStorage or use sample data
        const savedData = localStorage.getItem('contentData');
        if (savedData) {
            this.contentData = JSON.parse(savedData);
        } else {
            this.contentData = {
                // HOME PAGE - Only home-specific content
                'home-hero-title-tr': {
                    id: 'home-hero-title-tr',
                    page: 'home',
                    language: 'tr',
                    section: 'hero',
                    field: 'title',
                    currentValue: 'Pro-Lance ile Geleceğinizi Şekillendirin',
                    originalValue: 'Pro-Lance ile Geleceğinizi Şekillendirin',
                    description: 'Ana Sayfa - Hero Başlığı'
                },
                'home-hero-subtitle-tr': {
                    id: 'home-hero-subtitle-tr',
                    page: 'home',
                    language: 'tr',
                    section: 'hero',
                    field: 'subtitle',
                    currentValue: 'IT çözümleri ve danışmanlık hizmetleri ile işinizi büyütün',
                    originalValue: 'IT çözümleri ve danışmanlık hizmetleri ile işinizi büyütün',
                    description: 'Ana Sayfa - Hero Alt Başlığı'
                },
                'home-hero-description-tr': {
                    id: 'home-hero-description-tr',
                    page: 'home',
                    language: 'tr',
                    section: 'hero',
                    field: 'description',
                    currentValue: '15 yılı aşkın deneyimimizle, işletmenizin dijital dönüşümü için kapsamlı IT çözümleri sunuyoruz.',
                    originalValue: '15 yılı aşkın deneyimimizle, işletmenizin dijital dönüşümü için kapsamlı IT çözümleri sunuyoruz.',
                    description: 'Ana Sayfa - Hero Açıklaması'
                },
                'home-hero-title-en': {
                    id: 'home-hero-title-en',
                    page: 'home',
                    language: 'en',
                    section: 'hero',
                    field: 'title',
                    currentValue: 'Shape Your Future with Pro-Lance',
                    originalValue: 'Shape Your Future with Pro-Lance',
                    description: 'Homepage - Hero Title'
                },
                'home-hero-subtitle-en': {
                    id: 'home-hero-subtitle-en',
                    page: 'home',
                    language: 'en',
                    section: 'hero',
                    field: 'subtitle',
                    currentValue: 'Grow your business with IT solutions and consulting services',
                    originalValue: 'Grow your business with IT solutions and consulting services',
                    description: 'Homepage - Hero Subtitle'
                },
                'home-hero-description-en': {
                    id: 'home-hero-description-en',
                    page: 'home',
                    language: 'en',
                    section: 'hero',
                    field: 'description',
                    currentValue: 'With over 15 years of experience, we provide comprehensive IT solutions for your business digital transformation.',
                    originalValue: 'With over 15 years of experience, we provide comprehensive IT solutions for your business digital transformation.',
                    description: 'Homepage - Hero Description'
                },

                // SERVICES PAGE - Only services-specific content
                'services-hero-title-tr': {
                    id: 'services-hero-title-tr',
                    page: 'services',
                    language: 'tr',
                    section: 'hero',
                    field: 'title',
                    currentValue: 'Hizmetlerimiz',
                    originalValue: 'Hizmetlerimiz',
                    description: 'Hizmetler Sayfası - Ana Başlık'
                },
                'services-hero-subtitle-tr': {
                    id: 'services-hero-subtitle-tr',
                    page: 'services',
                    language: 'tr',
                    section: 'hero',
                    field: 'subtitle',
                    currentValue: 'İşletmeniz için profesyonel çözümler',
                    originalValue: 'İşletmeniz için profesyonel çözümler',
                    description: 'Hizmetler Sayfası - Alt Başlık'
                },
                'services-web-title-tr': {
                    id: 'services-web-title-tr',
                    page: 'services',
                    language: 'tr',
                    section: 'services',
                    field: 'web_title',
                    currentValue: 'Web Geliştirme',
                    originalValue: 'Web Geliştirme',
                    description: 'Hizmetler - Web Geliştirme Başlığı'
                },
                'services-web-description-tr': {
                    id: 'services-web-description-tr',
                    page: 'services',
                    language: 'tr',
                    section: 'services',
                    field: 'web_description',
                    currentValue: 'Modern ve duyarlı web sitesi geliştirme hizmetleri sunuyoruz. SEO dostu, hızlı ve kullanıcı dostu web siteleri ile çevrimiçi varlığınızı güçlendirin.',
                    originalValue: 'Modern ve duyarlı web sitesi geliştirme hizmetleri sunuyoruz. SEO dostu, hızlı ve kullanıcı dostu web siteleri ile çevrimiçi varlığınızı güçlendirin.',
                    description: 'Hizmetler - Web Geliştirme Açıklaması'
                },
                'services-mobile-title-tr': {
                    id: 'services-mobile-title-tr',
                    page: 'services',
                    language: 'tr',
                    section: 'services',
                    field: 'mobile_title',
                    currentValue: 'Mobil Uygulama',
                    originalValue: 'Mobil Uygulama',
                    description: 'Hizmetler - Mobil Uygulama Başlığı'
                },
                'services-mobile-description-tr': {
                    id: 'services-mobile-description-tr',
                    page: 'services',
                    language: 'tr',
                    section: 'services',
                    field: 'mobile_description',
                    currentValue: 'iOS ve Android platformları için yerel ve çapraz platform mobil uygulamalar geliştiriyoruz. Kullanıcı deneyimini ön planda tutan performans odaklı çözümler.',
                    originalValue: 'iOS ve Android platformları için yerel ve çapraz platform mobil uygulamalar geliştiriyoruz. Kullanıcı deneyimini ön planda tutan performans odaklı çözümler.',
                    description: 'Hizmetler - Mobil Uygulama Açıklaması'
                },
                'services-consulting-title-tr': {
                    id: 'services-consulting-title-tr',
                    page: 'services',
                    language: 'tr',
                    section: 'services',
                    field: 'consulting_title',
                    currentValue: 'Yazılım Danışmanlığı',
                    originalValue: 'Yazılım Danışmanlığı',
                    description: 'Hizmetler - Yazılım Danışmanlığı Başlığı'
                },
                'services-consulting-description-tr': {
                    id: 'services-consulting-description-tr',
                    page: 'services',
                    language: 'tr',
                    section: 'services',
                    field: 'consulting_description',
                    currentValue: 'Yazılım projelerinizde ihtiyaç duyduğunuz teknik danışmanlık hizmetini sağlıyoruz. Proje yönetimi ve teknik rehberlik.',
                    originalValue: 'Yazılım projelerinizde ihtiyaç duyduğunuz teknik danışmanlık hizmetini sağlıyoruz. Proje yönetimi ve teknik rehberlik.',
                    description: 'Hizmetler - Yazılım Danışmanlığı Açıklaması'
                },
                'services-hero-title-en': {
                    id: 'services-hero-title-en',
                    page: 'services',
                    language: 'en',
                    section: 'hero',
                    field: 'title',
                    currentValue: 'Our Services',
                    originalValue: 'Our Services',
                    description: 'Services Page - Main Title'
                },
                'services-hero-subtitle-en': {
                    id: 'services-hero-subtitle-en',
                    page: 'services',
                    language: 'en',
                    section: 'hero',
                    field: 'subtitle',
                    currentValue: 'Professional solutions for your business',
                    originalValue: 'Professional solutions for your business',
                    description: 'Services Page - Subtitle'
                },
                'services-web-title-en': {
                    id: 'services-web-title-en',
                    page: 'services',
                    language: 'en',
                    section: 'services',
                    field: 'web_title',
                    currentValue: 'Web Development',
                    originalValue: 'Web Development',
                    description: 'Services - Web Development Title'
                },
                'services-web-description-en': {
                    id: 'services-web-description-en',
                    page: 'services',
                    language: 'en',
                    section: 'services',
                    field: 'web_description',
                    currentValue: 'We provide modern and responsive website development services. Strengthen your online presence with SEO-friendly, fast, and user-friendly websites.',
                    originalValue: 'We provide modern and responsive website development services. Strengthen your online presence with SEO-friendly, fast, and user-friendly websites.',
                    description: 'Services - Web Development Description'
                },
                'services-mobile-title-en': {
                    id: 'services-mobile-title-en',
                    page: 'services',
                    language: 'en',
                    section: 'services',
                    field: 'mobile_title',
                    currentValue: 'Mobile Application',
                    originalValue: 'Mobile Application',
                    description: 'Services - Mobile Application Title'
                },
                'services-mobile-description-en': {
                    id: 'services-mobile-description-en',
                    page: 'services',
                    language: 'en',
                    section: 'services',
                    field: 'mobile_description',
                    currentValue: 'We develop native and cross-platform mobile applications for iOS and Android platforms. Performance-focused solutions that prioritize user experience.',
                    originalValue: 'We develop native and cross-platform mobile applications for iOS and Android platforms. Performance-focused solutions that prioritize user experience.',
                    description: 'Services - Mobile Application Description'
                },
                'services-consulting-title-en': {
                    id: 'services-consulting-title-en',
                    page: 'services',
                    language: 'en',
                    section: 'services',
                    field: 'consulting_title',
                    currentValue: 'Software Consulting',
                    originalValue: 'Software Consulting',
                    description: 'Services - Software Consulting Title'
                },
                'services-consulting-description-en': {
                    id: 'services-consulting-description-en',
                    page: 'services',
                    language: 'en',
                    section: 'services',
                    field: 'consulting_description',
                    currentValue: 'We provide the technical consulting service you need in your software projects. Project management and technical guidance.',
                    originalValue: 'We provide the technical consulting service you need in your software projects. Project management and technical guidance.',
                    description: 'Services - Software Consulting Description'
                },

                // COLLABORATION PAGE - Only collaboration-specific content
                'collaboration-hero-title-tr': {
                    id: 'collaboration-hero-title-tr',
                    page: 'collaboration',
                    language: 'tr',
                    section: 'hero',
                    field: 'title',
                    currentValue: 'İş Birliği',
                    originalValue: 'İş Birliği',
                    description: 'İş Birliği Sayfası - Ana Başlık'
                },
                'collaboration-hero-subtitle-tr': {
                    id: 'collaboration-hero-subtitle-tr',
                    page: 'collaboration',
                    language: 'tr',
                    section: 'hero',
                    field: 'subtitle',
                    currentValue: 'Birlikte başarıya ulaşalım',
                    originalValue: 'Birlikte başarıya ulaşalım',
                    description: 'İş Birliği Sayfası - Alt Başlık'
                },
                'collaboration-description-tr': {
                    id: 'collaboration-description-tr',
                    page: 'collaboration',
                    language: 'tr',
                    section: 'content',
                    field: 'main_description',
                    currentValue: 'Pro-Lance olarak, müşterilerimizle uzun vadeli iş birlikleri kurmayı hedefliyoruz. Deneyimli ekibimiz ve kapsamlı hizmet yelpazemizle, projelerinizde size en iyi çözümleri sunuyoruz.',
                    originalValue: 'Pro-Lance olarak, müşterilerimizle uzun vadeli iş birlikleri kurmayı hedefliyoruz. Deneyimli ekibimiz ve kapsamlı hizmet yelpazemizle, projelerinizde size en iyi çözümleri sunuyoruz.',
                    description: 'İş Birliği Sayfası - Ana Açıklama'
                },
                'collaboration-hero-title-en': {
                    id: 'collaboration-hero-title-en',
                    page: 'collaboration',
                    language: 'en',
                    section: 'hero',
                    field: 'title',
                    currentValue: 'Collaboration',
                    originalValue: 'Collaboration',
                    description: 'Collaboration Page - Main Title'
                },
                'collaboration-hero-subtitle-en': {
                    id: 'collaboration-hero-subtitle-en',
                    page: 'collaboration',
                    language: 'en',
                    section: 'hero',
                    field: 'subtitle',
                    currentValue: 'Let\'s achieve success together',
                    originalValue: 'Let\'s achieve success together',
                    description: 'Collaboration Page - Subtitle'
                },
                'collaboration-description-en': {
                    id: 'collaboration-description-en',
                    page: 'collaboration',
                    language: 'en',
                    section: 'content',
                    field: 'main_description',
                    currentValue: 'At Pro-Lance, we aim to establish long-term partnerships with our clients. With our experienced team and comprehensive service portfolio, we provide you with the best solutions for your projects.',
                    originalValue: 'At Pro-Lance, we aim to establish long-term partnerships with our clients. With our experienced team and comprehensive service portfolio, we provide you with the best solutions for your projects.',
                    description: 'Collaboration Page - Main Description'
                },

                // ABOUT PAGE - Only about-specific content
                'about-hero-title-tr': {
                    id: 'about-hero-title-tr',
                    page: 'about',
                    language: 'tr',
                    section: 'hero',
                    field: 'title',
                    currentValue: 'Hakkımızda',
                    originalValue: 'Hakkımızda',
                    description: 'Hakkımızda Sayfası - Ana Başlık'
                },
                'about-hero-subtitle-tr': {
                    id: 'about-hero-subtitle-tr',
                    page: 'about',
                    language: 'tr',
                    section: 'hero',
                    field: 'subtitle',
                    currentValue: 'Pro-Lance\'in Hikayesi',
                    originalValue: 'Pro-Lance\'in Hikayesi',
                    description: 'Hakkımızda Sayfası - Alt Başlık'
                },
                'about-content-tr': {
                    id: 'about-content-tr',
                    page: 'about',
                    language: 'tr',
                    section: 'content',
                    field: 'main',
                    currentValue: 'Pro-Lance, 15 yılı aşkın deneyime sahip iki IT profesyoneli tarafından kuruldu. Kurucularımızdan biri SAP teknolojileri üzerine uzmanlaşmışken, diğeri kurumsal IT alanında daha geniş bir perspektife sahipti.',
                    originalValue: 'Pro-Lance, 15 yılı aşkın deneyime sahip iki IT profesyoneli tarafından kuruldu. Kurucularımızdan biri SAP teknolojileri üzerine uzmanlaşmışken, diğeri kurumsal IT alanında daha geniş bir perspektife sahipti.',
                    description: 'Hakkımızda Sayfası - Ana İçerik'
                },
                'about-hero-title-en': {
                    id: 'about-hero-title-en',
                    page: 'about',
                    language: 'en',
                    section: 'hero',
                    field: 'title',
                    currentValue: 'About Us',
                    originalValue: 'About Us',
                    description: 'About Page - Main Title'
                },
                'about-hero-subtitle-en': {
                    id: 'about-hero-subtitle-en',
                    page: 'about',
                    language: 'en',
                    section: 'hero',
                    field: 'subtitle',
                    currentValue: 'The Pro-Lance Story',
                    originalValue: 'The Pro-Lance Story',
                    description: 'About Page - Subtitle'
                },
                'about-content-en': {
                    id: 'about-content-en',
                    page: 'about',
                    language: 'en',
                    section: 'content',
                    field: 'main',
                    currentValue: 'Pro-Lance was founded by two IT professionals with over 15 years of experience. While one of our founders specialized in SAP technologies, the other had a broader perspective in corporate IT.',
                    originalValue: 'Pro-Lance was founded by two IT professionals with over 15 years of experience. While one of our founders specialized in SAP technologies, the other had a broader perspective in corporate IT.',
                    description: 'About Page - Main Content'
                }
            };
            this.saveContentData();
        }
    }

    saveContentData() {
        localStorage.setItem('contentData', JSON.stringify(this.contentData));
    }

    setupEventListeners() {
        // Filter event listeners
        const pageFilter = document.getElementById('pageFilter');
        const languageFilter = document.getElementById('languageFilter');
        const searchFilter = document.getElementById('searchFilter');
        const saveAllBtn = document.getElementById('saveAllBtn');
        
        if (pageFilter) {
            pageFilter.addEventListener('change', (e) => {
                this.currentFilters.page = e.target.value;
                this.renderContentEditors();
            });
        }
        
        if (languageFilter) {
            languageFilter.addEventListener('change', (e) => {
                this.currentFilters.language = e.target.value;
                this.renderContentEditors();
            });
        }
        
        if (searchFilter) {
            searchFilter.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value;
                this.renderContentEditors();
            });
        }
        
        if (saveAllBtn) {
            saveAllBtn.addEventListener('click', () => {
                this.saveAllChanges();
            });
        }
        
        // Add reset button for development
        this.addResetButton();
    }
    
    addResetButton() {
        const filtersContainer = document.querySelector('.content-filters');
        if (filtersContainer) {
            const resetBtn = document.createElement('div');
            resetBtn.className = 'filter-group';
            resetBtn.innerHTML = `
                <button id="resetDataBtn" class="btn-secondary" style="background: #dc3545; color: white; border-color: #dc3545;">
                    <i class="fas fa-refresh"></i> Reset Data
                </button>
            `;
            filtersContainer.appendChild(resetBtn);
            
            document.getElementById('resetDataBtn').addEventListener('click', () => {
                if (confirm('This will reset all content data to default values. Are you sure?')) {
                    localStorage.removeItem('contentData');
                    window.location.reload();
                }
            });
        }
    }
    
    renderContentEditors() {
        const container = document.getElementById('contentEditors');
        if (!container) return;
        
        container.innerHTML = '';
        
        const filteredContent = this.getFilteredContent();
        
        if (filteredContent.length === 0) {
            container.innerHTML = '<div class="no-content" style="text-align: center; padding: 2rem; color: #666;">No content found matching your filters.</div>';
            return;
        }
        
        filteredContent.forEach(content => {
            const editor = this.createContentEditor(content);
            container.appendChild(editor);
        });
    }
    
    getFilteredContent() {
        return Object.values(this.contentData).filter(content => {
            // Page filter
            if (this.currentFilters.page && content.page !== this.currentFilters.page) {
                return false;
            }
            
            // Language filter
            if (this.currentFilters.language && content.language !== this.currentFilters.language) {
                return false;
            }
            
            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                return content.description.toLowerCase().includes(searchTerm) || 
                       content.currentValue.toLowerCase().includes(searchTerm);
            }
            
            return true;
        });
    }
    
    createContentEditor(content) {
        const editor = document.createElement('div');
        editor.className = 'content-editor';
        editor.dataset.contentId = content.id;
        
        const isModified = content.currentValue !== content.originalValue;
        const statusClass = isModified ? 'status-unsaved' : 'status-saved';
        
        editor.innerHTML = `
            <div class="content-editor-header">
                <div class="content-editor-title">
                    <span class="status-indicator ${statusClass}"></span>
                    ${content.description}
                </div>
                <div class="content-editor-meta">
                    <span>${content.page.toUpperCase()}</span>
                    <span>${content.language.toUpperCase()}</span>
                    <span>${content.section}</span>
                </div>
            </div>
            <div class="content-editor">
                <textarea class="content-textarea" data-content-id="${content.id}" rows="4">${content.currentValue}</textarea>
                <div class="content-editor-actions">
                    <button class="btn-secondary" onclick="contentManager.resetContent('${content.id}')">
                        <i class="fas fa-undo"></i> Reset
                    </button>
                    <button class="btn-secondary" onclick="contentManager.previewContent('${content.id}')">
                        <i class="fas fa-eye"></i> Preview
                    </button>
                    <button class="btn-primary" onclick="contentManager.saveContent('${content.id}')">
                        <i class="fas fa-save"></i> Save
                    </button>
                </div>
            </div>
        `;
        
        // Add change listener
        const textarea = editor.querySelector('.content-textarea');
        textarea.addEventListener('input', (e) => {
            this.handleContentChange(content.id, e.target.value);
        });
        
        return editor;
    }
    
    handleContentChange(contentId, newValue) {
        this.contentData[contentId].currentValue = newValue;
        this.unsavedChanges.add(contentId);
        this.updateStatusIndicator(contentId);
    }
    
    updateStatusIndicator(contentId) {
        const editor = document.querySelector(`[data-content-id="${contentId}"]`);
        if (!editor) return;
        
        const content = this.contentData[contentId];
        const isModified = content.currentValue !== content.originalValue;
        const statusIndicator = editor.querySelector('.status-indicator');
        
        if (statusIndicator) {
            statusIndicator.className = `status-indicator ${isModified ? 'status-unsaved' : 'status-saved'}`;
        }
    }
    
    async saveContent(contentId) {
        try {
            const content = this.contentData[contentId];
            
            // Here you would typically send the data to your backend
            // For now, we'll simulate the save operation
            await this.simulateSave(content);
            
            // Update original value
            content.originalValue = content.currentValue;
            this.unsavedChanges.delete(contentId);
            this.updateStatusIndicator(contentId);
            this.saveContentData();
            
            this.showNotification('Content saved successfully!', 'success');
        } catch (error) {
            this.showNotification('Error saving content: ' + error.message, 'error');
        }
    }
    
    async saveAllChanges() {
        if (this.unsavedChanges.size === 0) {
            this.showNotification('No changes to save.', 'info');
            return;
        }
        
        try {
            const savePromises = Array.from(this.unsavedChanges).map(contentId => 
                this.saveContent(contentId)
            );
            
            await Promise.all(savePromises);
            this.showNotification(`All changes saved successfully! (${this.unsavedChanges.size} items)`, 'success');
        } catch (error) {
            this.showNotification('Error saving some content: ' + error.message, 'error');
        }
    }
    
    resetContent(contentId) {
        const content = this.contentData[contentId];
        content.currentValue = content.originalValue;
        
        const textarea = document.querySelector(`[data-content-id="${contentId}"] .content-textarea`);
        if (textarea) {
            textarea.value = content.currentValue;
        }
        
        this.unsavedChanges.delete(contentId);
        this.updateStatusIndicator(contentId);
        
        this.showNotification('Content reset to original.', 'info');
    }
    
    previewContent(contentId) {
        const content = this.contentData[contentId];
        
        // Create preview modal
        const modal = document.createElement('div');
        modal.className = 'preview-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 800px; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3>${content.description} - Preview</h3>
                    <button onclick="this.closest('.preview-modal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                <div style="white-space: pre-wrap; line-height: 1.6;">${content.currentValue}</div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    async simulateSave(content) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simulate potential error (1% chance)
        if (Math.random() < 0.01) {
            throw new Error('Network error');
        }
        
        // In a real implementation, you would send the data to your backend
        console.log('Saving content:', content);
    }
    
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize content manager when DOM is loaded
let contentManager;
document.addEventListener('DOMContentLoaded', () => {
    contentManager = new ContentManager();
}); 