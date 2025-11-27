/**
 * AImagination Studio Portfolio - Main JavaScript Entry Point
 * 
 * Modern, modular JavaScript architecture for better maintainability.
 * This file serves as the main entry point and coordinates all modules.
 */

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 AImagination Studio Portfolio - Initializing...');

    // Initialize core functionality
    init();

    console.log('✅ Portfolio initialized successfully');
});

function init() {
    // Core modules initialize themselves via their own DOMContentLoaded listeners
    // This function handles any global initialization that needs to happen after modules load

    // Enhanced animations and interactions
    setupEnhancedAnimations();

    // Analytics and tracking (lightweight version)
    setupAnalytics();

    // Enhanced keyboard navigation
    setupEnhancedKeyboardNavigation();

    // Performance optimizations
    setupPerformanceOptimizations();

    // Accessibility enhancements
    setupAccessibilityEnhancements();

    // Page-specific initialization
    initializePageSpecificFeatures();
}

function setupEnhancedAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements with animation classes
    document.querySelectorAll('.animate-on-scroll, .language-card, .channel-card').forEach(el => {
        el.classList.add('animate-on-scroll'); // Ensure class exists
        observer.observe(el);
    });

    // Parallax effect for Hero
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.5;
            hero.style.transform = `translate3d(0px, ${rate}px, 0px)`;
            hero.style.opacity = 1 - scrolled / 500;
        });
    }

    // 3D Tilt Effect for Cards
    document.querySelectorAll('.language-card, .channel-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -5; // Max rotation deg
            const rotateY = ((x - centerX) / centerX) * 5;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

function setupAnalytics() {
    // Initialize analytics manager
    window.analyticsManager = {
        trackEvent: function (category, action, label, metadata = {}) {
            // Store event for batch sending
            const event = {
                category,
                action,
                label,
                metadata,
                timestamp: Date.now(),
                url: window.location.href,
                userAgent: navigator.userAgent
            };

            // Store in localStorage for now (will be sent to analytics service)
            try {
                const events = JSON.parse(localStorage.getItem('analyticsEvents') || '[]');
                events.push(event);

                // Keep only last 100 events
                if (events.length > 100) {
                    events.splice(0, events.length - 100);
                }

                localStorage.setItem('analyticsEvents', JSON.stringify(events));
                console.log('📊 Analytics event tracked:', event);
            } catch (e) {
                console.warn('Failed to store analytics event:', e);
            }
        }
    };

    // Track page load
    window.analyticsManager.trackEvent('Page', 'Load', document.title);

    // Track page engagement
    let engagementStartTime = Date.now();
    let isEngaged = true;

    // Track when user becomes inactive
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isEngaged) {
            const engagementTime = Date.now() - engagementStartTime;
            window.analyticsManager.trackEvent('Engagement', 'Page Time', 'Seconds', {
                duration: Math.round(engagementTime / 1000)
            });
            isEngaged = false;
        } else if (!document.hidden && !isEngaged) {
            engagementStartTime = Date.now();
            isEngaged = true;
        }
    });
}

function setupEnhancedKeyboardNavigation() {
    // Enhanced focus management
    let isTabbing = false;

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            isTabbing = true;
            document.body.classList.add('using-keyboard');
        }
    });

    document.addEventListener('mousedown', () => {
        isTabbing = false;
        document.body.classList.remove('using-keyboard');
    });

    // Enhanced focus indicators
    const focusableElements = document.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.forEach(element => {
        element.addEventListener('focus', () => {
            if (isTabbing) {
                element.classList.add('keyboard-focused');
            }
        });

        element.addEventListener('blur', () => {
            element.classList.remove('keyboard-focused');
        });
    });
}

function setupPerformanceOptimizations() {
    // Preload critical resources
    const criticalResources = [
        '../assets/css/channels.css',
        '../assets/js/channels.js'
    ];

    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = resource.endsWith('.css') ? 'style' : 'script';
        link.href = resource;
        document.head.appendChild(link);
    });

    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // Monitor performance
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const loadTime = perfData.loadEventEnd - perfData.loadEventStart;

                if (window.analyticsManager) {
                    window.analyticsManager.trackEvent('Performance', 'Page Load Time', 'Milliseconds', {
                        loadTime: Math.round(loadTime)
                    });
                }
            }, 0);
        });
    }
}

function setupAccessibilityEnhancements() {
    // Announce page load to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `${document.title} page loaded`;
    document.body.appendChild(announcement);

    // Remove announcement after screen readers have processed it
    setTimeout(() => {
        if (announcement.parentNode) {
            announcement.parentNode.removeChild(announcement);
        }
    }, 1000);

    // Enhanced focus management for modals and dropdowns
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close any open dropdowns or modals
            const openDropdowns = document.querySelectorAll('.show');
            openDropdowns.forEach(dropdown => {
                dropdown.classList.remove('show');
            });

            // Return focus to appropriate element
            const activeElement = document.activeElement;
            if (activeElement && activeElement.getAttribute('aria-expanded') === 'true') {
                activeElement.setAttribute('aria-expanded', 'false');
            }
        }
    });
}

function initializePageSpecificFeatures() {
    // Initialize features specific to the current page
    const currentPage = getCurrentPageType();

    switch (currentPage) {
        case 'home':
            initializeHomePage();
            break;
        case 'language':
            initializeLanguagePage();
            break;
        case 'channel':
            initializeChannelPage();
            break;
        default:
            console.log('No specific initialization for page type:', currentPage);
    }
}

function getCurrentPageType() {
    const path = window.location.pathname;

    if (path === '/' || path.endsWith('index.html')) {
        return 'home';
    } else if (path.includes('/en/') || path.includes('/es/') || path.includes('/de/')) {
        return 'language';
    } else if (path.includes('/channels/')) {
        return 'channel';
    }

    return 'unknown';
}

function initializeHomePage() {
    console.log('🏠 Initializing home page features');

    // Add any home page specific functionality here
    // For example: hero animations, language card interactions, etc.
}

function initializeLanguagePage() {
    console.log('🌐 Initializing language page features');

    // Add language page specific functionality here
    // For example: channel listings, video grids, etc.
}

function initializeChannelPage() {
    console.log('📺 Initializing channel page features');

    // Add channel page specific functionality here
    // For example: video players, playlist management, etc.
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Global error handling
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);

    if (window.analyticsManager) {
        window.analyticsManager.trackEvent('Error', 'JavaScript', e.message, {
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno
        });
    }
});

// Global unhandled promise rejection handling
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);

    if (window.analyticsManager) {
        window.analyticsManager.trackEvent('Error', 'Promise Rejection', e.reason?.message || 'Unknown');
    }
}); 