/**
 * Navigation Module
 * 
 * Handles sidebar functionality, navigation interactions, and mobile menu behavior.
 * Part of the modular JavaScript architecture for better maintainability.
 */

export class NavigationManager {
    constructor() {
        this.sidebar = null;
        this.sidebarToggle = null;
        this.navItems = [];
        this.isInitialized = false;

        this.init();
    }

    init() {
        if (this.isInitialized) return;

        this.sidebar = document.getElementById('topSidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.navItems = document.querySelectorAll('.nav-item');

        if (this.sidebar && this.sidebarToggle) {
            this.setupSidebarToggle();
            this.setupNavigationItems();
            this.setupClickOutside();
            this.setupScrollBehavior();

            this.isInitialized = true;
            console.log('Navigation module initialized');
        }
    }

    setupSidebarToggle() {
        this.sidebarToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleSidebar();
        });
    }

    setupNavigationItems() {
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const href = item.getAttribute('href');
                // Only prevent default for internal anchor links
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    this.handleNavItemClick(item);
                }
                // For real pages, let the browser handle navigation
                // The active state will be set on the new page load
            });
        });

        // Set active state based on current URL
        this.setActiveState();
    }

    setActiveState() {
        // 1. Check for Channel ID in URL
        const urlParams = new URLSearchParams(window.location.search);
        const channelId = urlParams.get('id');

        if (channelId) {
            const activeLink = document.querySelector(`.nav-item[data-channel="${channelId}"]`);
            if (activeLink) {
                this.navItems.forEach(item => item.classList.remove('active'));
                activeLink.classList.add('active');
            }
        }
    }

    setupClickOutside() {
        document.addEventListener('click', (e) => {
            if (!this.sidebar.contains(e.target) &&
                this.sidebar.classList.contains('sidebar-expanded')) {
                this.closeSidebar();
            }
        });
    }

    setupScrollBehavior() {
        let lastScrollY = window.scrollY;

        const handleScroll = this.throttle(() => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > 50) {
                this.sidebar.style.background = 'rgba(255, 255, 255, 0.15)';
                this.sidebar.style.borderBottomColor = 'rgba(255, 255, 255, 0.3)';
            } else {
                this.sidebar.style.background = 'rgba(255, 255, 255, 0.1)';
                this.sidebar.style.borderBottomColor = 'rgba(255, 255, 255, 0.2)';
            }

            lastScrollY = currentScrollY;
        }, 100);

        window.addEventListener('scroll', handleScroll);
    }

    toggleSidebar() {
        const isExpanded = this.sidebar.classList.contains('sidebar-expanded');

        if (isExpanded) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }

    openSidebar() {
        this.sidebar.classList.add('sidebar-expanded');
        this.sidebarToggle.setAttribute('aria-expanded', 'true');
        this.animateHamburgerIcon(true);

        // Track event
        if (window.analyticsManager) {
            window.analyticsManager.trackEvent('Navigation', 'Mobile Menu Toggle', 'Open');
        }
    }

    closeSidebar() {
        this.sidebar.classList.remove('sidebar-expanded');
        this.sidebarToggle.setAttribute('aria-expanded', 'false');
        this.animateHamburgerIcon(false);

        // Track event
        if (window.analyticsManager) {
            window.analyticsManager.trackEvent('Navigation', 'Mobile Menu Toggle', 'Close');
        }
    }

    animateHamburgerIcon(isOpen) {
        const spans = this.sidebarToggle.querySelectorAll('.toggle-icon span');

        if (isOpen) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans.forEach(span => {
                span.style.transform = '';
                span.style.opacity = '1';
            });
        }
    }

    handleNavItemClick(clickedItem) {
        // Remove active class from all items
        this.navItems.forEach(item => item.classList.remove('active'));

        // Add active class to clicked item
        clickedItem.classList.add('active');

        // Close mobile menu if open
        this.closeSidebar();

        // Get section and handle navigation
        const section = clickedItem.getAttribute('data-section');

        // Track event
        if (window.analyticsManager) {
            window.analyticsManager.trackEvent('Navigation', 'Section Click', section);
        }

        // Smooth scroll to section if it exists
        const targetSection = document.getElementById(section);
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Utility function for throttling
    throttle(func, limit) {
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
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
}); 