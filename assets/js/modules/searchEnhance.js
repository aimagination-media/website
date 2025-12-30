/**
 * Enhanced search functionality with recent searches and result counts
 */

import { state, domElements } from './state.js';

const RECENT_SEARCHES_KEY = 'aimagination_recent_searches';
const MAX_RECENT_SEARCHES = 5;

export function getRecentSearches() {
    try {
        return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY)) || [];
    } catch (e) {
        return [];
    }
}

export function saveRecentSearch(query) {
    if (!query || query.trim().length < 2) return;

    let recent = getRecentSearches();

    // Remove duplicates (case-insensitive)
    recent = recent.filter(s => s.toLowerCase() !== query.toLowerCase());

    // Add to beginning
    recent.unshift(query);

    // Limit to MAX
    recent = recent.slice(0, MAX_RECENT_SEARCHES);

    try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
    } catch (e) {
        console.warn('Could not save recent search:', e);
    }
}

export function clearRecentSearches() {
    try {
        localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (e) {
        console.warn('Could not clear recent searches:', e);
    }
}

export function showSearchDropdown(query = '') {
    const recent = getRecentSearches();

    if (recent.length === 0 && !query) {
        hideSearchDropdown();
        return;
    }

    let html = '';

    // Only show recent searches when input is empty
    if (!query && recent.length > 0) {
        html += `
            <div class="search-dropdown-section">
                <div class="search-dropdown-header">Recent Searches</div>
                ${recent.map(search => `
                    <div class="search-dropdown-item" data-search="${search}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <span>${search}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    if (html) {
        domElements.searchDropdown.innerHTML = html;
        domElements.searchDropdown.classList.add('show');

        // Add click handlers to suggestions
        domElements.searchDropdown.querySelectorAll('.search-dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const searchText = e.currentTarget.dataset.search;
                domElements.searchInput.value = searchText;
                domElements.searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                hideSearchDropdown();
            });
        });
    }
}

export function hideSearchDropdown() {
    domElements.searchDropdown.classList.remove('show');
}

export function showResultCount(count) {
    domElements.searchResultCount.textContent = `${count} result${count !== 1 ? 's' : ''} found`;
    domElements.searchResultCount.classList.add('show');

    // Auto-hide after 3 seconds
    setTimeout(() => {
        domElements.searchResultCount.classList.remove('show');
    }, 3000);
}

export function hideResultCount() {
    domElements.searchResultCount.classList.remove('show');
}

export function updateClearButton(hasValue) {
    if (hasValue) {
        domElements.searchClearBtn.classList.add('visible');
    } else {
        domElements.searchClearBtn.classList.remove('visible');
    }
}
