import { state, domElements } from './state.js';
import { translations } from './translations.js';
import { renderGrid, renderPlaylists, updateChannelFilters, updateVideoTypeFilters, renderSocials } from './render.js';
import { updateTimeline } from './timeline.js';
import { getChannelDisplayName } from './utils.js';
import { showVideoSkeleton } from './skeleton.js';
import {
    saveRecentSearch,
    showSearchDropdown,
    hideSearchDropdown,
    showResultCount,
    updateClearButton
} from './searchEnhance.js';

function videosInLanguage() {
    if (state.currentLanguage === 'all') return state.allVideos;
    return state.allVideos.filter(v => v.language === state.currentLanguage);
}

function applyChannel(items) {
    if (!state.currentChannel || state.currentChannel === 'all') return items;
    return items.filter(item => item.channelId === state.currentChannel);
}

function applyVideoType(videos) {
    if (state.currentVideoType === 'long') {
        return videos.filter(v => v.videoType && v.videoType.includes('4k') && !v.isScheduled);
    }
    if (state.currentVideoType === 'shorts') {
        return videos.filter(v => v.videoType && v.videoType.includes('short') && !v.isScheduled);
    }
    if (state.currentVideoType === 'upcoming') {
        return videos.filter(v => v.isScheduled);
    }
    return videos.filter(v => !v.isScheduled);
}

export function refreshContent() {
    const langVideos = videosInLanguage();
    const langPlaylists = state.currentLanguage === 'all'
        ? state.allPlaylists
        : state.allPlaylists.filter(p => p.language === state.currentLanguage);

    const channelIds = new Set(langVideos.map(v => v.channelId));
    if (state.currentChannel !== 'all' && !channelIds.has(state.currentChannel)) {
        state.currentChannel = 'all';
    }

    if (state.currentView === 'videos') {
        // Upcoming stays cross-language; every other type follows the language picker.
        const typePool = state.currentVideoType === 'upcoming' ? state.allVideos : langVideos;
        const filteredVideos = applyVideoType(applyChannel(typePool));

        updateChannelFilters(langVideos);
        updateVideoTypeFilters();

        const t = translations[state.currentLanguage] || translations['en'];
        if (state.currentVideoType === 'upcoming') {
            domElements.latestTitle.textContent = t.upcoming;
        } else if (state.currentChannel !== 'all') {
            const name = getChannelDisplayName(state.currentChannel, state.currentLanguage, state.socialsData);
            domElements.latestTitle.textContent = name;
        } else {
            domElements.latestTitle.textContent = t.latest;
        }

        renderGrid(filteredVideos);

        domElements.seriesSection.style.display = 'none';
        domElements.latestSection.style.display = 'block';
        domElements.filterBar.style.display = 'block';
        if (domElements.videoTypeFilters) domElements.videoTypeFilters.parentElement.style.display = 'block';
        domElements.socialsSection.style.display = 'none';

    } else if (state.currentView === 'playlists') {
        updateChannelFilters(langVideos);
        renderPlaylists(applyChannel(langPlaylists));
        updateTimeline([]);

        domElements.seriesSection.style.display = 'block';
        domElements.latestSection.style.display = 'none';
        domElements.filterBar.style.display = 'block';
        if (domElements.videoTypeFilters) domElements.videoTypeFilters.parentElement.style.display = 'none';
        domElements.socialsSection.style.display = 'none';

    } else {
        updateTimeline([]);
        domElements.seriesSection.style.display = 'none';
        domElements.latestSection.style.display = 'none';
        domElements.filterBar.style.display = 'none';
        if (domElements.videoTypeFilters) domElements.videoTypeFilters.parentElement.style.display = 'none';
        domElements.socialsSection.style.display = 'block';
        renderSocials();
    }
}

export function filterByPlaylist(playlistId, playlistTitle) {
    document.querySelectorAll('#channelFilters .chip').forEach(c => c.classList.remove('active'));

    // Switch to showing the videos section
    domElements.seriesSection.style.display = 'none';
    domElements.latestSection.style.display = 'block';
    if (domElements.videoTypeFilters) domElements.videoTypeFilters.parentElement.style.display = 'none';

    domElements.latestSection.scrollIntoView({ behavior: 'smooth' });

    // Filter from current language set
    const langVideos = state.currentLanguage === 'all' ? state.allVideos : state.allVideos.filter(v => v.language === state.currentLanguage);
    const filtered = langVideos.filter(v => v.playlistId === playlistId);

    const t = translations[state.currentLanguage] || translations['en'];
    domElements.latestSection.querySelector('h2').textContent = `${t.playlist}: ${playlistTitle}`;
    renderGrid(filtered, true);
}

export function setupSearch() {
    let searchTimeout;

    domElements.searchInput.addEventListener('input', (e) => {
        const query = e.target.value;

        // Update clear button visibility
        updateClearButton(query.length > 0);

        // Clear previous timeout
        clearTimeout(searchTimeout);

        state.currentChannel = 'all';
        document.querySelectorAll('#channelFilters .chip').forEach(c => c.classList.remove('active'));
        const allChip = document.querySelector('#channelFilters [data-channel="all"]');
        if (allChip) allChip.classList.add('active');
        const t = translations[state.currentLanguage] || translations['en'];

        if (!query) {
            domElements.latestSection.querySelector('h2').textContent = t.latest;
            hideSearchDropdown();
            refreshContent(); // Reset to current language view
            return;
        }

        // Show dropdown when focused and has value
        showSearchDropdown(query);

        // Debounce search
        searchTimeout = setTimeout(() => {
            const results = state.fuse.search(query).map(result => result.item);

            // Save to recent searches
            if (query.trim().length >= 2) {
                saveRecentSearch(query.trim());
            }

            // Show result count
            showResultCount(results.length);

            domElements.latestSection.querySelector('h2').textContent = t.searchResults;
            renderGrid(results, true);
        }, 300); // 300ms debounce
    });

    // Show dropdown on focus (if empty, show recent searches)
    domElements.searchInput.addEventListener('focus', () => {
        if (!domElements.searchInput.value) {
            showSearchDropdown('');
        }
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!domElements.searchInput.contains(e.target) && !domElements.searchDropdown.contains(e.target)) {
            hideSearchDropdown();
        }
    });

    // Clear button handler
    domElements.searchClearBtn.addEventListener('click', () => {
        domElements.searchInput.value = '';
        domElements.searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        domElements.searchInput.focus();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== domElements.searchInput) {
            e.preventDefault();
            domElements.searchInput.focus();
        }
    });
}

export function setupFilters() {
    domElements.channelFilters.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip || !chip.dataset.channel) return;

        state.currentChannel = chip.dataset.channel;
        domElements.searchInput.value = '';
        refreshContent();
    });
}
