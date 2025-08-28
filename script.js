/* Main JavaScript File - Cache Busting: 2025-08-24 09:10:00 */

(function() {
    'use strict';

    // Lazy loading for images
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    }, { rootMargin: '50px 0px' });

    lazyImages.forEach(img => imageObserver.observe(img));

    // Header loading with error handling
    const header = document.getElementById('header');
    if (header) {
        const headerPath = window.location.pathname.includes('/en/') ? '/en/header.html' : '/header.html';
        
        fetch(headerPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                header.innerHTML = data;
                
                // Initialize navigation
                initializeNavigation();
                
                // Initialize hamburger menu
                initializeHamburgerMenu();
            })
            .catch(error => {
                console.error('Error loading header:', error);
                // Fallback: create basic header
                header.innerHTML = `
                    <header class="header">
                        <nav class="nav-container">
                            <div class="logo">
                                <a href="${window.location.pathname.includes('/en/') ? '/en/' : '/'}">Pro-Lance</a>
                            </div>
                            <ul class="nav-list">
                                <li><a href="${window.location.pathname.includes('/en/') ? '/en/' : '/'}">${window.location.pathname.includes('/en/') ? 'Home' : 'Ana Sayfa'}</a></li>
                                <li><a href="${window.location.pathname.includes('/en/') ? '/en/services.html' : '/services.html'}">${window.location.pathname.includes('/en/') ? 'Services' : 'Hizmetler'}</a></li>
                                <li><a href="${window.location.pathname.includes('/en/') ? '/en/collaboration.html' : '/collaboration.html'}">${window.location.pathname.includes('/en/') ? 'Collaboration' : 'İşbirliği'}</a></li>
                                <li><a href="${window.location.pathname.includes('/en/') ? '/en/contact.html' : '/contact.html'}">${window.location.pathname.includes('/en/') ? 'Contact' : 'İletişim'}</a></li>
                            </ul>
                            <div class="right-header">
                                <div class="lang-switch">
                                    <a href="/" class="${!window.location.pathname.includes('/en/') ? 'active' : ''}">TR</a>
                                    <a href="/en/" class="${window.location.pathname.includes('/en/') ? 'active' : ''}">EN</a>
                                </div>
                                <button class="hamburger" aria-label="Toggle menu">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </button>
                            </div>
                        </nav>
                    </header>
                `;
                initializeHamburgerMenu();
            });
    }

    // Initialize navigation
    function initializeNavigation() {
        const navLinks = document.querySelectorAll('.nav-list a');
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }

    // Initialize hamburger menu
    function initializeHamburgerMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navList = document.querySelector('.nav-list');
        
        if (hamburger && navList) {
            // Remove any existing event listeners
            const newHamburger = hamburger.cloneNode(true);
            hamburger.parentNode.replaceChild(newHamburger, hamburger);
            
            newHamburger.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const isExpanded = navList.classList.contains('active');
                
                if (isExpanded) {
                    navList.classList.remove('active');
                    newHamburger.classList.remove('active');
                    newHamburger.setAttribute('aria-expanded', 'false');
                } else {
                    navList.classList.add('active');
                    newHamburger.classList.add('active');
                    newHamburger.setAttribute('aria-expanded', 'true');
                }
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', function(event) {
                if (!newHamburger.contains(event.target) && !navList.contains(event.target)) {
                    navList.classList.remove('active');
                    newHamburger.classList.remove('active');
                    newHamburger.setAttribute('aria-expanded', 'false');
                }
            });
            
            // Close menu on Escape key
            document.addEventListener('keydown', function(event) {
                if (event.key === 'Escape' && navList.classList.contains('active')) {
                    navList.classList.remove('active');
                    newHamburger.classList.remove('active');
                    newHamburger.setAttribute('aria-expanded', 'false');
                    newHamburger.focus();
                }
            });
            
            // Close menu when clicking on a link
            const navLinks = navList.querySelectorAll('a');
            navLinks.forEach(link => {
                link.addEventListener('click', function() {
                    if (window.innerWidth <= 768) {
                        navList.classList.remove('active');
                        newHamburger.classList.remove('active');
                        newHamburger.setAttribute('aria-expanded', 'false');
                    }
                });
            });
        }
    }

    // CTA buttons
    const ctaButtons = document.querySelectorAll('.cta-button, .calendly-btn, .submit-btn');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.href && this.href.includes('calendly.com')) {
                e.preventDefault();
                window.open(this.href, '_blank', 'width=600,height=700');
            }
        });
    });

    // Service cards hover effects
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Contact form handling
    const contactForm = document.querySelector('#contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const submitBtn = this.querySelector('.submit-btn');
            
            if (submitBtn) {
                submitBtn.textContent = 'Gönderiliyor...';
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    submitBtn.textContent = 'Gönderildi!';
                    setTimeout(() => {
                        submitBtn.textContent = 'İletişim Formunu Aç';
                        submitBtn.disabled = false;
                    }, 2000);
                }, 1000);
            }
        });
    }

    // Cookie consent
    const cookieConsent = document.getElementById('cookie-consent');
    if (cookieConsent) {
        const acceptBtn = cookieConsent.querySelector('.accept-cookies');
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                localStorage.setItem('cookiesAccepted', 'true');
                cookieConsent.style.display = 'none';
            });
        }
        
        if (localStorage.getItem('cookiesAccepted')) {
            cookieConsent.style.display = 'none';
        }
    }

    // Preload critical resources
    const preloadCriticalResources = () => {
        const isEnglish = window.location.pathname.includes('/en/');
        const basePath = isEnglish ? '../' : '';
        
        const criticalImages = [
            basePath + 'images/collaboration-bg.jpg',
            basePath + 'images/project-management.webp',
            basePath + 'images/digital-transformation.webp'
        ];
        
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', preloadCriticalResources);
    } else {
        preloadCriticalResources();
    }

    // Optimize animations
    const optimizeAnimations = () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }
    };
    optimizeAnimations();

    // Debounce function
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    // Handle scroll
    const handleScroll = debounce(() => {
        const scrolled = window.pageYOffset > 100;
        document.body.classList.toggle('scrolled', scrolled);
    }, 10);

    window.addEventListener('scroll', handleScroll);

    // Service Worker registration with cache clearing
    const serviceWorkerRegistration = () => {
        if ('serviceWorker' in navigator) {
            // Clear all caches first
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        console.log('Deleting cache:', cacheName);
                        return caches.delete(cacheName);
                    })
                );
            }).then(() => {
                // Unregister old service worker
                return navigator.serviceWorker.getRegistrations();
            }).then(registrations => {
                return Promise.all(
                    registrations.map(registration => registration.unregister())
                );
            }).then(() => {
                // Register new service worker
                return navigator.serviceWorker.register('/sw.js');
            }).then(registration => {
                console.log('SW registered:', registration);
            }).catch(error => {
                console.log('SW registration failed:', error);
            });
        }
    };
    serviceWorkerRegistration();

})(); 