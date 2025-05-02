// Form validation and submission handler
document.addEventListener('DOMContentLoaded', function() {
    const collaborationForm = document.getElementById('collaborationForm');
    const contactForm = document.getElementById('contactForm');
    
    // Validation messages
    const messages = {
        required: document.documentElement.lang === 'en' ? 'This field is required' : 'Bu alan zorunludur',
        invalidName: document.documentElement.lang === 'en' ? 'Only letters and spaces allowed' : 'Sadece harf ve boşluk kullanılabilir',
        invalidEmail: document.documentElement.lang === 'en' ? 'Please enter a valid email address' : 'Geçerli bir e-posta adresi giriniz',
        invalidPhone: document.documentElement.lang === 'en' ? 'Please enter a valid phone number' : 'Geçerli bir telefon numarası giriniz',
        success: document.documentElement.lang === 'en' ? 'Form submitted successfully!' : 'Form başarıyla gönderildi!',
        error: document.documentElement.lang === 'en' ? 'An error occurred. Please try again.' : 'Bir hata oluştu. Lütfen tekrar deneyin.',
        fileTooBig: document.documentElement.lang === 'en' ? 'File size exceeds 10MB limit' : 'Dosya boyutu 10MB limitini aşıyor',
        invalidFileType: document.documentElement.lang === 'en' ? 'Invalid file type. Allowed: PDF, DOC, DOCX, TXT, JPG, PNG' : 'Geçersiz dosya türü. İzin verilenler: PDF, DOC, DOCX, TXT, JPG, PNG'
    };

    // Validation patterns
    const patterns = {
        name: /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^[\d\s()+\-]{10,}$/ // More flexible phone validation
    };

    // Create error message element
    function createErrorElement() {
        const error = document.createElement('small');
        error.className = 'error-message';
        error.style.color = '#dc3545';
        error.style.fontSize = '0.85rem';
        error.style.marginTop = '0.25rem';
        return error;
    }

    // Format phone number (more flexible)
    function formatPhoneNumber(value) {
        const digits = value.replace(/\D/g, '');
        return digits.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }

    // Handle phone input for both forms
    document.querySelectorAll('input[type="tel"]').forEach(phoneInput => {
        if (!phoneInput) return;
        
        phoneInput.addEventListener('input', (e) => {
            if (e.target.value.length > 0) {
            e.target.value = formatPhoneNumber(e.target.value);
            }
        });
    });

    // Validate single input
    function validateInput(input) {
        const errorElement = input.nextElementSibling?.classList.contains('error-message') 
            ? input.nextElementSibling 
            : createErrorElement();
        
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (input.required && !input.value.trim()) {
            isValid = false;
            errorMessage = messages.required;
        } 
        // Pattern validation for non-empty fields
        else if (input.value.trim()) {
            switch(input.name) {
                case 'companyName':
                case 'contactPerson':
                case 'name':
                    if (!patterns.name.test(input.value)) {
                        isValid = false;
                        errorMessage = messages.invalidName;
                    }
                    break;
                case 'email':
                    if (!patterns.email.test(input.value)) {
                        isValid = false;
                        errorMessage = messages.invalidEmail;
                    }
                    break;
                case 'phone':
                    if (input.value.trim() && !patterns.phone.test(input.value)) {
                        isValid = false;
                        errorMessage = messages.invalidPhone;
                    }
                    break;
            }
        }

        // Update input styling
        input.style.borderColor = isValid ? '#28a745' : '#dc3545';
        input.style.backgroundColor = isValid ? '#f8fff9' : '#fff8f8';

        // Update or remove error message
        if (!isValid) {
            errorElement.textContent = errorMessage;
            if (!input.nextElementSibling?.classList.contains('error-message')) {
                input.insertAdjacentElement('afterend', errorElement);
            }
        } else if (input.nextElementSibling?.classList.contains('error-message')) {
            input.nextElementSibling.remove();
        }

        return isValid;
    }

    // Add real-time validation to both forms
    [collaborationForm, contactForm].forEach(form => {
        if (!form) return;
        
    form.querySelectorAll('input, textarea, select').forEach(input => {
            if (input.type !== 'tel') { // Phone has its own input handler
            input.addEventListener('input', () => validateInput(input));
        }
        input.addEventListener('blur', () => validateInput(input));
        });
    });

    // Generic form submission handler
    async function handleFormSubmit(form, endpoint) {
        // Validate all fields
        let isValid = true;
        form.querySelectorAll('input, textarea, select').forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });

        if (!isValid) return false;

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';
        submitBtn.disabled = true;

        try {
            // Prepare form data
            const formData = new FormData(form);
            
            // Submit form
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Network response was not ok');

            // Show success message
            showMessage(messages.success, 'success');
            form.reset();
            
            // Reset file info if present
            const fileInfo = document.getElementById('fileInfo');
            if (fileInfo) fileInfo.textContent = '';

        } catch (error) {
            console.error('Form submission error:', error);
            showMessage(messages.error, 'error');
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }

        return false;
    }

    // Message display function
    function showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert alert-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.right = '20px';
        messageDiv.style.padding = '1rem';
        messageDiv.style.borderRadius = '4px';
        messageDiv.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
        messageDiv.style.color = type === 'success' ? '#155724' : '#721c24';
        messageDiv.style.border = `1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'}`;
        messageDiv.style.zIndex = '1000';
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transition = 'opacity 0.5s ease';
            setTimeout(() => messageDiv.remove(), 500);
        }, 3000);
    }

    // Attach submit handlers
    if (collaborationForm) {
        collaborationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmit(collaborationForm, '/submit-collaboration');
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmit(contactForm, '/submit-contact');
        });
    }
});

// Mobile Menu Toggle for new header
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav');
    const navList = document.querySelector('.nav-list');
    
    if(hamburger && nav && navList) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            nav.classList.toggle('active');
            navList.classList.toggle('active');
            document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close menu when a link is clicked
        navList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                nav.classList.remove('active');
                navList.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!hamburger.contains(event.target) && 
                !nav.contains(event.target) && 
                nav.classList.contains('active')) {
                hamburger.classList.remove('active');
                nav.classList.remove('active');
                navList.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}); 