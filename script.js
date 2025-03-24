// Form validation and submission handler
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('collaborationForm');
    if (!form) return;

    const isEnglish = document.documentElement.lang === 'en';
    
    // Validation messages
    const messages = {
        required: isEnglish ? 'This field is required' : 'Bu alan zorunludur',
        invalidName: isEnglish ? 'Only letters and spaces allowed' : 'Sadece harf ve boşluk kullanılabilir',
        invalidEmail: isEnglish ? 'Please enter a valid email address' : 'Geçerli bir e-posta adresi giriniz',
        invalidPhone: isEnglish ? 'Please enter a valid phone number (10 digits)' : 'Geçerli bir telefon numarası giriniz (10 haneli)',
        success: isEnglish ? 'Form submitted successfully. Your email application will open.' : 'Form başarıyla gönderildi. E-posta uygulamanız açılacak.',
        fileTooBig: isEnglish ? 'File size exceeds 10MB limit' : 'Dosya boyutu 10MB limitini aşıyor',
        invalidFileType: isEnglish ? 'Invalid file type. Allowed: PDF, DOC, DOCX, TXT, JPG, PNG' : 'Geçersiz dosya türü. İzin verilenler: PDF, DOC, DOCX, TXT, JPG, PNG'
    };

    // Validation patterns
    const patterns = {
        name: /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^\d{10}$/
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

    // Format phone number
    function formatPhoneNumber(value) {
        // Remove all non-digits
        const cleaned = value.replace(/\D/g, '');
        
        // Trim to max 10 digits
        const trimmed = cleaned.slice(0, 10);
        
        // Format as (XXX) XXX-XXXX
        if (trimmed.length >= 6) {
            return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3, 6)}-${trimmed.slice(6)}`;
        } else if (trimmed.length >= 3) {
            return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3)}`;
        } else if (trimmed.length > 0) {
            return `(${trimmed}`;
        }
        return trimmed;
    }

    // Handle phone input
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            // Store cursor position
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const previousLength = e.target.value.length;

            // Format the number
            e.target.value = formatPhoneNumber(e.target.value);

            // Adjust cursor position if needed
            const newLength = e.target.value.length;
            if (start === previousLength) {
                // If cursor was at the end, keep it at the end
                e.target.setSelectionRange(newLength, newLength);
            } else {
                // Otherwise, try to maintain the cursor position
                const cursorAdjustment = newLength - previousLength;
                e.target.setSelectionRange(start + cursorAdjustment, end + cursorAdjustment);
            }
        });

        // Prevent non-numeric input
        phoneInput.addEventListener('keypress', (e) => {
            if (!/\d/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                e.preventDefault();
            }
        });
    }

    // Handle file input
    const fileInput = document.getElementById('attachment');
    const fileInfo = document.getElementById('fileInfo');
    if (fileInput && fileInfo) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) {
                fileInfo.textContent = '';
                return;
            }

            // Check file size (10MB limit)
            const maxSize = 10 * 1024 * 1024; // 10MB in bytes
            if (file.size > maxSize) {
                fileInfo.style.color = '#dc3545';
                fileInfo.textContent = messages.fileTooBig;
                fileInput.value = ''; // Clear the input
                return;
            }

            // Check file type
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
                'image/jpeg',
                'image/png'
            ];
            if (!allowedTypes.includes(file.type)) {
                fileInfo.style.color = '#dc3545';
                fileInfo.textContent = messages.invalidFileType;
                fileInput.value = ''; // Clear the input
                return;
            }

            // Show file info
            fileInfo.style.color = '#28a745';
            fileInfo.textContent = `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`;
        });
    }

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
        // Pattern validation
        else if (input.value.trim()) {
            switch(input.name) {
                case 'companyName':
                case 'contactPerson':
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
                    // Check if we have exactly 10 digits after removing formatting
                    const digits = input.value.replace(/\D/g, '');
                    if (digits.length !== 10) {
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

    // Add real-time validation
    form.querySelectorAll('input, textarea, select').forEach(input => {
        if (input.id !== 'phone') { // Phone has its own input handler
            input.addEventListener('input', () => validateInput(input));
        }
        input.addEventListener('blur', () => validateInput(input));
    });

    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate all fields
        let isValid = true;
        form.querySelectorAll('input:not([type="file"]), textarea, select').forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });

        if (!isValid) return;

        // Collect form data
        const formData = {
            companyName: document.getElementById('companyName').value,
            contactPerson: document.getElementById('contactPerson').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            industry: document.getElementById('industry').value,
            collaborationType: document.getElementById('collaborationType').value,
            message: document.getElementById('message').value
        };

        // Handle file attachment
        const file = fileInput?.files[0];
        let attachmentInfo = '';
        if (file) {
            attachmentInfo = isEnglish ?
                `\n\nAttachment Information:\nFile Name: ${file.name}\nFile Size: ${(file.size / (1024 * 1024)).toFixed(2)}MB` :
                `\n\nDosya Bilgisi:\nDosya Adı: ${file.name}\nDosya Boyutu: ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
        }

        // Create email content
        const emailSubject = isEnglish ? 
            `Collaboration Request - ${formData.companyName}` : 
            `İş Birliği Talebi - ${formData.companyName}`;

        const emailBody = isEnglish ? `
            New Collaboration Request:
            
            Company Name: ${formData.companyName}
            Contact Person: ${formData.contactPerson}
            Email: ${formData.email}
            Phone: ${formData.phone}
            Industry: ${formData.industry}
            Collaboration Type: ${formData.collaborationType}
            
            Message:
            ${formData.message}
            ${attachmentInfo}
        ` : `
            Yeni İş Birliği Talebi:
            
            Firma Adı: ${formData.companyName}
            İletişim Kişisi: ${formData.contactPerson}
            E-posta: ${formData.email}
            Telefon: ${formData.phone}
            Sektör: ${formData.industry}
            İş Birliği Türü: ${formData.collaborationType}
            
            Mesaj:
            ${formData.message}
            ${attachmentInfo}
        `;

        // Send email
        window.location.href = `mailto:support@pro-lance.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'form-message success';
        successMessage.style.backgroundColor = '#d4edda';
        successMessage.style.color = '#155724';
        successMessage.style.padding = '1rem';
        successMessage.style.borderRadius = '4px';
        successMessage.style.marginTop = '1rem';
        successMessage.textContent = messages.success;
        this.insertAdjacentElement('afterend', successMessage);

        // Reset form and validation styles
        this.reset();
        form.querySelectorAll('input, textarea, select').forEach(input => {
            input.style.borderColor = '';
            input.style.backgroundColor = '';
            if (input.nextElementSibling?.classList.contains('error-message')) {
                input.nextElementSibling.remove();
            }
        });
        if (fileInfo) {
            fileInfo.textContent = '';
        }

        // Remove success message after 5 seconds
        setTimeout(() => successMessage.remove(), 5000);
    });
});

// Mobile Menu Toggle - This will run on all pages
document.addEventListener('DOMContentLoaded', function() {
    // Initialize hamburger menu functionality
    initMobileMenu();
});

function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav');
    const body = document.body;
    
    if (hamburger && nav) {
        // Clear any existing event listeners
        hamburger.replaceWith(hamburger.cloneNode(true));
        const newHamburger = document.querySelector('.hamburger');
        
        newHamburger.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent click from bubbling
            newHamburger.classList.toggle('active');
            nav.classList.toggle('active');
            
            // Toggle body scroll
            if (nav.classList.contains('active')) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (nav.classList.contains('active') && 
                !newHamburger.contains(event.target) && 
                !nav.contains(event.target)) {
                newHamburger.classList.remove('active');
                nav.classList.remove('active');
                body.style.overflow = '';
            }
        });
        
        // Close menu when window is resized beyond mobile breakpoint
        window.addEventListener('resize', function() {
            if (window.innerWidth > 992 && nav.classList.contains('active')) {
                newHamburger.classList.remove('active');
                nav.classList.remove('active');
                body.style.overflow = '';
            }
        });
        
        // Close menu when pressing escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && nav.classList.contains('active')) {
                newHamburger.classList.remove('active');
                nav.classList.remove('active');
                body.style.overflow = '';
            }
        });
    }
} 