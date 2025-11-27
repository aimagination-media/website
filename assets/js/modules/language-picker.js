/**
 * Language Picker Module
 * 
 * Handles language selection, preferences, and switching functionality.
 * Part of the modular JavaScript architecture for better maintainability.
 */

export class LanguagePickerManager {
    constructor() {
        this.languagePicker = null;
        this.languageToggle = null;
        this.languageDropdown = null;
        this.languageOptions = [];
        this.currentLanguageSpan = null;
        this.currentFlagSpan = null;
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        if (this.isInitialized) return;
        
        this.languagePicker = document.getElementById('languagePicker');
        this.languageToggle = document.getElementById('languageToggle');
        this.languageDropdown = document.getElementById('languageDropdown');
        this.languageOptions = document.querySelectorAll('.language-option');
        this.currentLanguageSpan = this.languageToggle?.querySelector('.language-name');
        this.currentFlagSpan = this.languageToggle?.querySelector('.language-flag');
        
        if (this.languagePicker && this.languageToggle && this.languageDropdown) {
            this.setupLanguageDetection();
            this.setupToggleButton();
            this.setupLanguageOptions();
            this.setupKeyboardNavigation();
            this.setupClickOutside();
            
            this.isInitialized = true;
            console.log('Language picker module initialized');
        }
    }
    
    setupLanguageDetection() {
        const detectedLang = this.getUserPreferredLanguage();
        this.updateCurrentLanguageDisplay(detectedLang);
    }
    
    setupToggleButton() {
        this.languageToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = this.languageDropdown.classList.contains('show');
            
            if (isOpen) {
                this.closeDropdown();
            } else {
                this.openDropdown();
            }
        });
    }
    
    setupLanguageOptions() {
        this.languageOptions.forEach((option, index) => {
            option.addEventListener('click', () => {
                this.handleLanguageSelection(option);
            });
            
            // Enhanced hover effects
            option.addEventListener('mouseenter', () => {
                option.style.transform = 'translateX(4px)';
                option.style.background = 'rgba(79, 172, 254, 0.1)';
            });
            
            option.addEventListener('mouseleave', () => {
                option.style.transform = '';
                option.style.background = '';
            });
            
            // Set tabindex for keyboard navigation
            option.setAttribute('tabindex', '0');
            option.setAttribute('role', 'option');
        });
    }
    
    setupKeyboardNavigation() {
        this.languageToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.languageToggle.click();
            }
        });
        
        this.languageDropdown.addEventListener('keydown', (e) => {
            const currentIndex = Array.from(this.languageOptions).findIndex(
                option => option === document.activeElement
            );
            
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.focusNextOption(currentIndex);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.focusPreviousOption(currentIndex);
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (document.activeElement.classList.contains('language-option')) {
                        document.activeElement.click();
                    }
                    break;
                case 'Escape':
                    this.closeDropdown();
                    this.languageToggle.focus();
                    break;
            }
        });
    }
    
    setupClickOutside() {
        document.addEventListener('click', (e) => {
            if (!this.languagePicker.contains(e.target)) {
                this.closeDropdown();
            }
        });
    }
    
    openDropdown() {
        this.languageDropdown.classList.add('show');
        this.languageToggle.setAttribute('aria-expanded', 'true');
        this.languageDropdown.setAttribute('aria-hidden', 'false');
        
        // Focus first option
        this.focusFirstOption();
        
        // Track event
        if (window.analyticsManager) {
            window.analyticsManager.trackEvent('Language Picker', 'Dropdown Open');
        }
    }
    
    closeDropdown() {
        this.languageDropdown.classList.remove('show');
        this.languageToggle.setAttribute('aria-expanded', 'false');
        this.languageDropdown.setAttribute('aria-hidden', 'true');
    }
    
    focusFirstOption() {
        if (this.languageOptions.length > 0) {
            this.languageOptions[0].focus();
        }
    }
    
    focusNextOption(currentIndex) {
        const nextIndex = (currentIndex + 1) % this.languageOptions.length;
        this.languageOptions[nextIndex].focus();
    }
    
    focusPreviousOption(currentIndex) {
        const prevIndex = currentIndex <= 0 ? this.languageOptions.length - 1 : currentIndex - 1;
        this.languageOptions[prevIndex].focus();
    }
    
    handleLanguageSelection(option) {
        const langCode = option.getAttribute('data-lang');
        const langHref = option.getAttribute('data-href');
        const langName = option.querySelector('.language-name').textContent;
        const langFlag = option.querySelector('.language-flag').textContent;
        
        // Update current language display
        if (this.currentLanguageSpan) this.currentLanguageSpan.textContent = langName;
        if (this.currentFlagSpan) this.currentFlagSpan.textContent = langFlag;
        
        // Store preference
        this.storeLanguagePreference(langCode, langName, langFlag);
        
        // Close dropdown
        this.closeDropdown();
        
        // Track selection
        if (window.analyticsManager) {
            window.analyticsManager.trackEvent('Language Picker', 'Selection', langName, {
                code: langCode,
                method: 'dropdown'
            });
        }
        
        // Add loading state and navigate
        this.showLoadingState(option);
        
        setTimeout(() => {
            window.location.href = langHref;
        }, 300);
    }
    
    showLoadingState(option) {
        option.style.background = 'rgba(79, 172, 254, 0.2)';
        option.innerHTML += '<span style="margin-left: auto; animation: spin 1s linear infinite;">⟳</span>';
    }
    
    storeLanguagePreference(langCode, langName, langFlag) {
        const preference = {
            code: langCode,
            name: langName,
            flag: langFlag,
            timestamp: Date.now(),
            expires: Date.now() + (90 * 24 * 60 * 60 * 1000) // 90 days
        };
        
        try {
            localStorage.setItem('languagePreference', JSON.stringify(preference));
        } catch (e) {
            console.warn('Failed to store language preference:', e);
        }
    }
    
    getUserPreferredLanguage() {
        // Try to get from localStorage first
        try {
            const stored = localStorage.getItem('languagePreference');
            if (stored) {
                const preference = JSON.parse(stored);
                if (preference.expires > Date.now()) {
                    return preference.code;
                }
            }
        } catch (e) {
            console.warn('Failed to read language preference:', e);
        }
        
        // Fall back to browser language
        const browserLang = navigator.language || navigator.userLanguage;
        const supportedLanguages = ['en', 'es', 'de', 'hi'];
        
        // Extract language code (e.g., 'en-US' -> 'en')
        const langCode = browserLang.split('-')[0].toLowerCase();
        
        return supportedLanguages.includes(langCode) ? langCode : 'en';
    }
    
    updateCurrentLanguageDisplay(langCode) {
        const languageNames = {
            'en': { name: 'English', flag: '🇺🇸' },
            'es': { name: 'Español', flag: '🇪🇸' },
            'de': { name: 'Deutsch', flag: '🇩🇪' },
            'hi': { name: 'हिंदी', flag: '🇮🇳' }
        };
        
        const langInfo = languageNames[langCode] || languageNames['en'];
        
        if (this.currentLanguageSpan) {
            this.currentLanguageSpan.textContent = langInfo.name;
        }
        if (this.currentFlagSpan) {
            this.currentFlagSpan.textContent = langInfo.flag;
        }
        
        // Highlight preferred language option
        this.highlightPreferredLanguage(langCode);
    }
    
    highlightPreferredLanguage(langCode) {
        this.languageOptions.forEach(option => {
            const optionLang = option.getAttribute('data-lang');
            if (optionLang === langCode) {
                option.classList.add('preferred');
                
                // Add recommended badge if not already present
                if (!option.querySelector('.language-badge')) {
                    const badge = document.createElement('span');
                    badge.className = 'language-badge';
                    badge.textContent = 'Recommended';
                    option.appendChild(badge);
                }
            } else {
                option.classList.remove('preferred');
                
                // Remove recommended badge if present
                const badge = option.querySelector('.language-badge');
                if (badge && badge.textContent === 'Recommended') {
                    badge.remove();
                }
            }
        });
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.languagePickerManager = new LanguagePickerManager();
}); 