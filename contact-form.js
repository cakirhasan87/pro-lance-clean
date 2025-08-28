// Contact Form Handler for n8n Integration
(function() {
    'use strict';
    
    // Form validation and submission
    class ContactForm {
        constructor() {
            console.log('ContactForm constructor called');
            this.form = document.getElementById('contact-form');
            console.log('Form element found:', this.form);
            
            this.submitBtn = this.form?.querySelector('.submit-btn');
            this.submitStatus = document.getElementById('submit-status');
            
            if (this.form) {
                console.log('Form found, initializing...');
                this.init();
            } else {
                console.error('Form element not found!');
            }
        }
        
        init() {
            this.setupEventListeners();
            this.setupFileInput();
            this.setupPhoneInput();
            this.initSupabase();
        }
        
        initSupabase() {
            // Supabase client'ını initialize et
            if (window.SupabaseConfig && window.SupabaseConfig.init) {
                window.SupabaseConfig.init();
                console.log('Supabase client initialized');
            } else {
                console.warn('Supabase config not found');
            }
        }
        
        setupEventListeners() {
            // Form submission
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            
            // Real-time validation
            const inputs = this.form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
            
            // File input change
            const fileInput = this.form.querySelector('#attachment');
            if (fileInput) {
                fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
            }
        }
        
        setupFileInput() {
            const fileInput = this.form.querySelector('#attachment');
            const fileInfo = document.getElementById('attachment-info');
            
            if (fileInput && fileInfo) {
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const size = (file.size / (1024 * 1024)).toFixed(2);
                        fileInfo.textContent = `Seçilen dosya: ${file.name} (${size}MB)`;
                        fileInfo.style.color = '#28a745';
                    } else {
                        fileInfo.textContent = 'Desteklenen formatlar: PDF, DOC, DOCX, TXT, JPG, PNG (Maks. 10MB)';
                        fileInfo.style.color = '#6c757d';
                    }
                });
            }
        }
        
        setupPhoneInput() {
            const phoneInput = this.form.querySelector('#phone');
            if (phoneInput) {
                phoneInput.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 10) value = value.slice(0, 10);
                    
                    if (value.length >= 6) {
                        value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
                    } else if (value.length >= 3) {
                        value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
                    } else if (value.length > 0) {
                        value = `(${value}`;
                    }
                    
                    e.target.value = value;
                });
            }
        }
        
        validateField(field) {
            const fieldName = field.name;
            const value = field.value.trim();
            const errorElement = document.getElementById(`${fieldName}-error`);
            
            let isValid = true;
            let errorMessage = '';
            
            // Required field validation
            if (field.hasAttribute('required') && !value) {
                isValid = false;
                errorMessage = 'Bu alan zorunludur';
            }
            
            // Email validation
            if (fieldName === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Geçerli bir e-posta adresi giriniz';
                }
            }
            
            // Phone validation
            if (fieldName === 'phone' && value) {
                const digits = value.replace(/\D/g, '');
                if (digits.length !== 10) {
                    isValid = false;
                    errorMessage = 'Geçerli bir telefon numarası giriniz (10 haneli)';
                }
            }
            
            // Name validation
            if (fieldName === 'name' && value) {
                const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿÇĞIİÖŞÜçğıiöşü\s]+$/;
                if (!nameRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Sadece harf ve boşluk kullanılabilir';
                }
            }
            
            // Update field appearance and error message
            this.updateFieldValidation(field, isValid, errorMessage, errorElement);
            
            return isValid;
        }
        
        updateFieldValidation(field, isValid, errorMessage, errorElement) {
            if (isValid) {
                field.style.borderColor = '#28a745';
                field.style.backgroundColor = '#f8fff9';
                if (errorElement) {
                    errorElement.textContent = '';
                    errorElement.classList.remove('show');
                }
            } else {
                field.style.borderColor = '#dc3545';
                field.style.backgroundColor = '#fff8f8';
                if (errorElement) {
                    errorElement.textContent = errorMessage;
                    errorElement.classList.add('show');
                }
            }
        }
        
        clearFieldError(field) {
            const fieldName = field.name;
            const errorElement = document.getElementById(`${fieldName}-error`);
            
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.classList.remove('show');
            }
            
            field.style.borderColor = '#e1e5e9';
            field.style.backgroundColor = '#fff';
        }
        
        validateFile(file) {
            const maxSize = 10 * 1024 * 1024; // 10MB
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
                'image/jpeg',
                'image/png'
            ];
            
            if (file.size > maxSize) {
                return { isValid: false, message: 'Dosya boyutu 10MB limitini aşıyor' };
            }
            
            if (!allowedTypes.includes(file.type)) {
                return { isValid: false, message: 'Geçersiz dosya türü. İzin verilenler: PDF, DOC, DOCX, TXT, JPG, PNG' };
            }
            
            return { isValid: true };
        }
        
        handleFileSelect(e) {
            const file = e.target.files[0];
            if (file) {
                const validation = this.validateFile(file);
                if (!validation.isValid) {
                    this.showStatus(validation.message, 'error');
                    e.target.value = '';
                    return;
                }
            }
        }
        
        validateForm() {
            const inputs = this.form.querySelectorAll('input[required], textarea[required], select[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!this.validateField(input)) {
                    isValid = false;
                }
            });
            
            // Validate file if selected
            const fileInput = this.form.querySelector('#attachment');
            if (fileInput && fileInput.files[0]) {
                const validation = this.validateFile(fileInput.files[0]);
                if (!validation.isValid) {
                    this.showStatus(validation.message, 'error');
                    isValid = false;
                }
            }
            
            return isValid;
        }
        
        async handleSubmit(e) {
            e.preventDefault();
            
            if (!this.validateForm()) {
                this.showStatus('Lütfen tüm zorunlu alanları doldurun ve hataları düzeltin', 'error');
                return;
            }
            
            this.setLoadingState(true);
            
            try {
                const formData = new FormData(this.form);
                
                // Add timestamp and source
                formData.append('timestamp', new Date().toISOString());
                formData.append('source', 'pro-lance-website');
                
                // Debug: Log form data
                console.log('Form data being sent:');
                for (let [key, value] of formData.entries()) {
                    console.log(`${key}: ${value}`);
                }
                
                // Create data for n8n in the correct format
                console.log('Creating n8n data object...');
                const n8nData = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    subject: formData.get('subject'),
                    message: formData.get('message'),
                    timestamp: formData.get('timestamp'),
                    source: formData.get('source')
                };
                console.log('n8nData object created:', n8nData);
                
                // Debug: Log n8n data
                console.log('n8n data being sent:');
                console.log(JSON.stringify(n8nData, null, 2));
                
                // Send to n8n workflow first
                console.log('Sending to n8n workflow...');
                console.log('n8n URL:', this.form.action);
                
                const n8nResponse = await fetch(this.form.action, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(n8nData)
                });
                
                console.log('n8n response status:', n8nResponse.status);
                console.log('n8n response headers:', [...n8nResponse.headers.entries()]);
                
                let n8nResponseText = '';
                try {
                    n8nResponseText = await n8nResponse.text();
                    console.log('n8n response:', n8nResponseText);
                } catch (error) {
                    console.log('Could not read n8n response text:', error);
                }
                
                // Save to Supabase
                let supabaseResult = { success: false };
                if (window.SupabaseConfig && window.SupabaseConfig.save) {
                    console.log('Saving to Supabase...');
                    supabaseResult = await window.SupabaseConfig.save(formData);
                    
                    if (supabaseResult.success) {
                        console.log('Data saved to Supabase successfully');
                    } else {
                        console.warn('Supabase save failed:', supabaseResult.error);
                    }
                }
                
                // Check if n8n request was successful
                if (n8nResponse.ok) {
                    let successMessage = 'Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.';
                    
                    if (supabaseResult.success) {
                        successMessage += ' (Veritabanına kaydedildi)';
                    }
                    
                    this.showStatus(successMessage, 'success');
                    this.form.reset();
                    this.resetFileInfo();
                } else {
                    throw new Error(`n8n workflow error: ${n8nResponse.status}`);
                }
                
            } catch (error) {
                console.error('Form submission error:', error);
                this.showStatus('Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin veya alternatif iletişim yöntemlerini kullanın.', 'error');
            } finally {
                this.setLoadingState(false);
            }
        }
        
        setLoadingState(loading) {
            if (loading) {
                this.submitBtn.classList.add('loading');
                this.submitBtn.disabled = true;
            } else {
                this.submitBtn.classList.remove('loading');
                this.submitBtn.disabled = false;
            }
        }
        
        showStatus(message, type) {
            if (this.submitStatus) {
                this.submitStatus.textContent = message;
                this.submitStatus.className = `submit-status ${type}`;
                this.submitStatus.style.display = 'block';
                
                // Auto-hide success messages
                if (type === 'success') {
                    setTimeout(() => {
                        this.submitStatus.style.display = 'none';
                    }, 5000);
                }
            }
        }
        
        resetFileInfo() {
            const fileInfo = document.getElementById('attachment-info');
            if (fileInfo) {
                fileInfo.textContent = 'Desteklenen formatlar: PDF, DOC, DOCX, TXT, JPG, PNG (Maks. 10MB)';
                fileInfo.style.color = '#6c757d';
            }
        }
    }
    
    // Initialize form when DOM is ready
    console.log('Contact form script loaded');
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded, initializing ContactForm');
            new ContactForm();
        });
    } else {
        console.log('DOM already loaded, initializing ContactForm');
        new ContactForm();
    }
    
    // Export for global access
    window.ContactForm = ContactForm;
    
})();
