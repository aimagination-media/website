/**
 * Mobile enhancements: swipe gestures and touch interactions
 */

import { state, domElements } from './state.js';
import { refreshContent } from './filter.js';

const SWIPE_THRESHOLD = 50; // Minimum distance for swipe
const SWIPE_TIME_THRESHOLD = 300; // Maximum time for swipe (ms)

let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;
let isSwiping = false;

const views = ['videos', 'playlists', 'socials'];

export function setupSwipeGestures() {
    // Only enable on mobile
    if (window.innerWidth > 768) return;

    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const main = document.querySelector('main');

    main.addEventListener('touchstart', (e) => {
        // Don't interfere with scrolling or if touching interactive elements
        if (e.target.closest('a, button, input, select, textarea, .video-card, .series-card')) {
            return;
        }

        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = Date.now();
        isSwiping = false;
    }, { passive: true });

    main.addEventListener('touchmove', (e) => {
        if (startX === 0) return;

        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = currentX - startX;
        const diffY = currentY - startY;

        // Detect if user is swiping horizontally
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
            isSwiping = true;
            document.body.classList.add('swiping');
        }
    }, { passive: true });

    main.addEventListener('touchend', (e) => {
        if (!isSwiping) {
            startX = 0;
            startY = 0;
            document.body.classList.remove('swiping');
            return;
        }

        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = endX - startX;
        const diffY = endY - startY;
        const diffTime = Date.now() - startTime;

        // Ensure it's a horizontal swipe and fast enough
        if (Math.abs(diffX) > Math.abs(diffY) &&
            Math.abs(diffX) > SWIPE_THRESHOLD &&
            diffTime < SWIPE_TIME_THRESHOLD) {

            const currentIndex = views.indexOf(state.currentView);
            let newIndex;

            if (diffX > 0) {
                // Swipe right - go to previous view
                newIndex = currentIndex > 0 ? currentIndex - 1 : views.length - 1;
            } else {
                // Swipe left - go to next view
                newIndex = currentIndex < views.length - 1 ? currentIndex + 1 : 0;
            }

            switchView(views[newIndex]);
        }

        // Reset
        startX = 0;
        startY = 0;
        isSwiping = false;
        document.body.classList.remove('swiping');
    }, { passive: true });
}

export function setupBottomNav() {
    const bottomNav = document.getElementById('bottomNav');
    if (!bottomNav) return;

    const navItems = bottomNav.querySelectorAll('.bottom-nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.dataset.view;
            switchView(view);
        });
    });
}

export function switchView(view) {
    // Update state
    state.currentView = view;

    // Add transition effect
    const main = document.querySelector('main');
    main.classList.add('transitioning');

    setTimeout(() => {
        // Update active states in bottom nav
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });

        // Update active states in top toggle
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Refresh content
        refreshContent();

        // Remove transition
        main.classList.remove('transitioning');
    }, 150);
}

// Re-initialize on resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (window.innerWidth <= 768) {
            setupSwipeGestures();
        }
    }, 250);
});
