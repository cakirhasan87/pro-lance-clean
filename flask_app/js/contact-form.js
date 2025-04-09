// Form validation and submission handler
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    console.log("Contact form script loaded"); // Debug
    
    const isEnglish = document.documentElement.lang === 'en';
    
    // Validation messages
    const messages = {
        required: isEnglish ? 'This field is required' : 'Bu alan zorunludur',
        invalidName: isEnglish ? 'Only letters and spaces allowed' : 'Sadece harf ve boşluk kullanılabilir',
        invalidEmail: isEnglish ? 'Please enter a valid email address' : 'Geçerli bir e-posta adresi giriniz',
        invalidPhone: isEnglish ? 'Please enter a valid phone number' : 'Geçerli bir telefon numarası giriniz',
        success: isEnglish ? 'Your message has been sent successfully!' : 'Mesajınız başarıyla gönderildi!',
        error: isEnglish ? 'An error occurred. Please try again later.' : 'Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.'
    };

    // Validation patterns
    const patterns = {
        name: /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^\+?[0-9\s\-\(\)]{7,20}$/
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

    // Create success message element
    function showFormMessage(message, isSuccess = true) {
        // Remove any existing message
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${isSuccess ? 'success' : 'error'}`;
        messageElement.style.padding = '10px';
        messageElement.style.marginTop = '15px';
        messageElement.style.borderRadius = '4px';
        messageElement.style.textAlign = 'center';
        messageElement.style.fontWeight = 'bold';
        
        if (isSuccess) {
            messageElement.style.backgroundColor = '#d4edda';
            messageElement.style.color = '#155724';
        } else {
            messageElement.style.backgroundColor = '#f8d7da';
            messageElement.style.color = '#721c24';
        }
        
        messageElement.textContent = message;
        
        // Insert the message after the submit button
        const submitBtn = contactForm.querySelector('.submit-btn');
        submitBtn.parentNode.insertAdjacentElement('afterend', messageElement);
        
        // Scroll to the message
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Remove the message after 5 seconds if it's a success message
        if (isSuccess) {
            setTimeout(() => {
                messageElement.remove();
            }, 5000);
        }
    }

    // Format phone number
    function formatPhoneNumber(value) {
        // Remove all non-digits
        return value.replace(/[^\d+()-\s]/g, '');
    }

    // Handle phone input
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = formatPhoneNumber(e.target.value);
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
                    if (input.value && !patterns.phone.test(input.value)) {
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
    contactForm.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('input', () => validateInput(input));
        input.addEventListener('blur', () => validateInput(input));
    });

    // Submit button state manager
    function setSubmitButtonState(isLoading) {
        const submitBtn = contactForm.querySelector('.submit-btn');
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + 
                (isEnglish ? 'Sending...' : 'Gönderiliyor...');
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> ' + 
                (isEnglish ? 'Send' : 'Gönder');
        }
    }

    // Form submission handler
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log("Form submitted"); // Debug

        // Validate all fields
        let isValid = true;
        contactForm.querySelectorAll('input, textarea, select').forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });

        if (!isValid) return;

        // Set button to loading state
        setSubmitButtonState(true);

        try {
            // Insert data into Supabase using direct REST API call
            const formDataObj = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value || null,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value,
                created_at: new Date().toISOString(),
                status: 'unread'
            };
            
            console.log("Formatted data for insertion:", formDataObj);
            
            // Try direct REST API call instead of Supabase client
            const response = await fetch('https://drxstcmoroaupedsynhq.supabase.co/rest/v1/contact_messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyeHN0Y21vcm9hdXBlZHN5bmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTA2NDAsImV4cCI6MjA1ODM4NjY0MH0.9AjInAaxWnYesZ_UuDOKtJVfVNO_RetqMmvZsCql11k',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyeHN0Y21vcm9hdXBlZHN5bmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTA2NDAsImV4cCI6MjA1ODM4NjY0MH0.9AjInAaxWnYesZ_UuDOKtJVfVNO_RetqMmvZsCql11k',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(formDataObj)
            });
            
            console.log('API Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', errorText);
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }
            
            // Show success message
            showFormMessage(messages.success, true);
            
            // Reset form
            contactForm.reset();
            
            // Reset validation styles
            contactForm.querySelectorAll('input, textarea, select').forEach(input => {
                input.style.borderColor = '';
                input.style.backgroundColor = '';
            });
            
        } catch (error) {
            console.error('Error submitting form:', error);
            showFormMessage(messages.error, false);
        } finally {
            // Reset button state
            setSubmitButtonState(false);
        }
    });
}); 