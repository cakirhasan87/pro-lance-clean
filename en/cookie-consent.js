class CookieConsent {
    constructor() {
        this.cookieName = 'cookie_consent';
        this.cookieValue = null;
        this.banner = null;
        this.revisitButton = null;
        this.init();
    }

    init() {
        this.createBanner();
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
                This website uses cookies to enhance your experience. 
                For more information about our cookie policy, please review our 
                <a href="/en/privacy-policy.html" style="color: #2196F3;">Privacy Policy</a>.
            </div>
            <div class="cookie-consent-buttons">
                <button class="cookie-consent-button cookie-consent-accept">Accept</button>
                <button class="cookie-consent-button cookie-consent-reject">Reject</button>
            </div>
        `;

        document.body.appendChild(this.banner);

        this.banner.querySelector('.cookie-consent-accept').addEventListener('click', () => this.accept());
        this.banner.querySelector('.cookie-consent-reject').addEventListener('click', () => this.reject());
    }

    createRevisitButton() {
        this.revisitButton = document.createElement('button');
        this.revisitButton.className = 'cookie-consent-revisit hidden';
        this.revisitButton.textContent = 'Cookie Settings';
        this.revisitButton.addEventListener('click', () => this.showBanner());
        document.body.appendChild(this.revisitButton);
    }

    showBanner() {
        this.banner.classList.remove('hidden');
        this.revisitButton.classList.add('hidden');
    }

    hideBanner() {
        this.banner.classList.add('hidden');
    }

    updateRevisitButton() {
        this.revisitButton.classList.remove('hidden');
    }

    accept() {
        this.setCookie(this.cookieName, 'accepted', 365);
        this.cookieValue = 'accepted';
        this.hideBanner();
        this.updateRevisitButton();
    }

    reject() {
        this.setCookie(this.cookieName, 'rejected', 365);
        this.cookieValue = 'rejected';
        this.hideBanner();
        this.updateRevisitButton();
    }

    setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
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