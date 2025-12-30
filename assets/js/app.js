import { state, domElements } from './modules/state.js';
import { detectLanguage } from './modules/utils.js';
import { translations } from './modules/translations.js';
import { fetchContent } from './modules/api.js';
import { updateUIText } from './modules/render.js';
import { refreshContent, setupSearch, setupFilters } from './modules/filter.js';
import { setupLanguageSelector, setupViewToggle, setupVideoTypeFilters } from './modules/events.js';
import { initBranding } from './modules/branding.js';
import { showVideoSkeleton, showPlaylistSkeleton } from './modules/skeleton.js';
import { setupBottomNav, setupSwipeGestures } from './modules/mobile.js';

async function initPortfolio() {
    try {
        // Detect and set language
        state.currentLanguage = detectLanguage();
        updateUIText();
        initBranding(); // Initialize Morphing X Animation

        // Show skeleton loading state
        showVideoSkeleton(domElements.videoGrid, 8);

        // Fetch Content and Socials
        await fetchContent();

        // Setup Search
        state.fuse = new Fuse(state.allVideos, {
            keys: ['title', 'channelName', 'language', 'serie'],
            threshold: 0.3
        });

        // Setup Event Listeners
        setupSearch();
        setupFilters();
        setupLanguageSelector();
        setupViewToggle();
        setupVideoTypeFilters();

        // Mobile Enhancements
        setupBottomNav();
        setupSwipeGestures();

        // Back to Top Button
        const backToTopBtn = document.getElementById('backToTop');
        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Initial Render
        refreshContent();

    } catch (error) {
        console.error("Init Error:", error);
        domElements.videoGrid.innerHTML = `
            <div class="loading-state">
                <p>⚠️ Unable to load content.</p>
                <p class="text-muted text-sm">${error.message}</p>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', initPortfolio);
