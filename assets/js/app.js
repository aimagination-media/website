import { state, domElements } from './modules/state.js';
import { detectLanguage } from './modules/utils.js';
import { translations } from './modules/translations.js';
import { fetchContent } from './modules/api.js';
import { updateUIText } from './modules/render.js';
import { refreshContent, setupSearch, setupFilters } from './modules/filter.js';
import { setupLanguageSelector, setupViewToggle, setupVideoTypeFilters } from './modules/events.js';
import { initBranding } from './modules/branding.js';

async function initPortfolio() {
    try {
        // Detect and set language
        state.currentLanguage = detectLanguage();
        updateUIText();
        initBranding(); // Initialize Morphing X Animation

        // Show loading state
        const t = translations[state.currentLanguage] || translations['en'];
        domElements.videoGrid.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>${t.loading}</p>
            </div>
        `;

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
