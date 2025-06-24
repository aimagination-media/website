// Main JavaScript for AImagination Studio Portfolio

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    init();
});

function init() {
    // Add loaded class to language cards for animation
    animateLanguageCards();
    
    // Set up language detection and redirection
    setupLanguageDetection();
    
    // Add click tracking for analytics
    setupAnalytics();
    
    // Add keyboard navigation
    setupKeyboardNavigation();
}

function animateLanguageCards() {
    const cards = document.querySelectorAll('.language-card');
    
    // Add loaded class with delay for staggered animation
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('loaded');
        }, 100 * (index + 1));
    });
}

function setupLanguageDetection() {
    // Get user's preferred language from browser
    const userLang = navigator.language || navigator.userLanguage;
    const langCode = userLang.substring(0, 2).toLowerCase();
    
    // Store language preference
    localStorage.setItem('preferredLanguage', langCode);
    
    // Add language info to body for CSS targeting
    document.body.setAttribute('data-user-lang', langCode);
    
    // Highlight preferred language card if it exists
    highlightPreferredLanguage(langCode);
}

function highlightPreferredLanguage(langCode) {
    const langMap = {
        'en': 'en/',
        'es': 'es/',
        'de': 'de/'
    };
    
    if (langMap[langCode]) {
        const preferredCard = document.querySelector(`a[href="${langMap[langCode]}"]`);
        if (preferredCard) {
            preferredCard.classList.add('preferred-language');
            
            // Add subtle highlight style
            preferredCard.style.border = '2px solid rgba(255, 215, 0, 0.6)';
            preferredCard.style.boxShadow = '0 8px 32px rgba(255, 215, 0, 0.2)';
        }
    }
}

function setupAnalytics() {
    const languageCards = document.querySelectorAll('.language-card');
    const socialLinks = document.querySelectorAll('.social-links a');
    
    // Track language selection
    languageCards.forEach(card => {
        card.addEventListener('click', function(e) {
            const language = this.querySelector('h3').textContent;
            trackEvent('Language Selection', 'Click', language);
        });
    });
    
    // Track social media clicks
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const platform = this.getAttribute('aria-label');
            trackEvent('Social Media', 'Click', platform);
        });
    });
}

function trackEvent(category, action, label) {
    // Google Analytics 4 event tracking (when GA is implemented)
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
    
    // Console log for development
    console.log(`Analytics: ${category} - ${action} - ${label}`);
}

function setupKeyboardNavigation() {
    const cards = document.querySelectorAll('.language-card');
    
    // Make cards focusable and add keyboard navigation
    cards.forEach((card, index) => {
        card.setAttribute('tabindex', '0');
        
        card.addEventListener('keydown', function(e) {
            switch(e.key) {
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    this.click();
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    focusNextCard(index, cards);
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    focusPreviousCard(index, cards);
                    break;
            }
        });
    });
}

function focusNextCard(currentIndex, cards) {
    const nextIndex = (currentIndex + 1) % cards.length;
    cards[nextIndex].focus();
}

function focusPreviousCard(currentIndex, cards) {
    const prevIndex = currentIndex === 0 ? cards.length - 1 : currentIndex - 1;
    cards[prevIndex].focus();
}

// Utility functions
function getLanguageFromUrl() {
    const path = window.location.pathname;
    const langMatch = path.match(/\/(en|es|de)\//);
    return langMatch ? langMatch[1] : null;
}

function setLanguage(langCode) {
    localStorage.setItem('currentLanguage', langCode);
    document.documentElement.setAttribute('lang', langCode);
}

// Export functions for potential use in other scripts
window.AImagination = {
    trackEvent,
    getLanguageFromUrl,
    setLanguage
}; 