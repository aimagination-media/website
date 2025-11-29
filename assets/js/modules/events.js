import { state, domElements } from './state.js';
import { updateUIText } from './render.js';
import { refreshContent } from './filter.js';

export function setupLanguageSelector() {
    // Toggle Dropdown
    domElements.langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        domElements.langDropdown.classList.toggle('show');
    });

    // Close on outside click
    document.addEventListener('click', () => {
        domElements.langDropdown.classList.remove('show');
    });

    // Handle Selection
    domElements.langOptions.forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation();
            const value = opt.dataset.value;
            const text = opt.textContent.trim();

            // Update State
            state.currentLanguage = value;

            // Update Active State
            domElements.langOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');

            // Update UI
            updateUIText(); // Update all static text

            refreshContent();
        });
    });
}

export function setupViewToggle() {
    domElements.toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            domElements.toggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentView = btn.dataset.view;
            refreshContent();
        });
    });
}

export function setupVideoTypeFilters() {
    if (!domElements.videoTypeFilters) return;

    domElements.videoTypeFilters.addEventListener('click', (e) => {
        if (!e.target.classList.contains('chip')) return;

        const selectedType = e.target.dataset.videoType;
        if (!selectedType) return;

        state.currentVideoType = selectedType;
        refreshContent();
    });
}
