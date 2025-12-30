import { state, domElements } from './state.js';
import { translations } from './translations.js';
import { renderGrid, renderPlaylists, updateChannelFilters, updateVideoTypeFilters, renderSocials } from './render.js';
import { showVideoSkeleton } from './skeleton.js';
import {
    saveRecentSearch,
    showSearchDropdown,
    hideSearchDropdown,
    showResultCount,
    updateClearButton
} from './searchEnhance.js';

export function refreshContent() {
    // Common Logic for Video/Playlist filtering by language
    const langVideos = (state.currentVideoType === 'upcoming')
        ? state.allVideos
        : (state.currentLanguage === 'all' ? state.allVideos : state.allVideos.filter(v => v.language === state.currentLanguage));

    const langPlaylists = state.currentLanguage === 'all' ? state.allPlaylists : state.allPlaylists.filter(p => p.language === state.currentLanguage);

    if (state.currentView === 'videos') {
        // Filter by Video Type
        let filteredVideos = langVideos;

        if (state.currentVideoType === 'long') {
            filteredVideos = langVideos.filter(v => v.videoType && v.videoType.includes('4k') && !v.isScheduled);
        } else if (state.currentVideoType === 'shorts') {
            filteredVideos = langVideos.filter(v => v.videoType && v.videoType.includes('short') && !v.isScheduled);
        } else if (state.currentVideoType === 'upcoming') {
            filteredVideos = langVideos.filter(v => v.isScheduled);
        } else {
            // 'all' case - exclude scheduled
            filteredVideos = langVideos.filter(v => !v.isScheduled);
        }

        // Update Filters
        updateChannelFilters(filteredVideos);
        updateVideoTypeFilters();

        // Update section title based on video type filter
        const t = translations[state.currentLanguage] || translations['en'];
        if (state.currentVideoType === 'upcoming') {
            domElements.latestTitle.textContent = t.upcoming;
        } else {
            domElements.latestTitle.textContent = t.latest;
        }

        // Render Videos
        renderGrid(filteredVideos);

        // Visibility
        domElements.seriesSection.style.display = 'none';
        domElements.latestSection.style.display = 'block';
        domElements.filterBar.style.display = 'block';
        if (domElements.videoTypeFilters) domElements.videoTypeFilters.parentElement.style.display = 'block';
        domElements.socialsSection.style.display = 'none';

    } else if (state.currentView === 'playlists') {
        // Update Filters (use all lang videos for channel list to be consistent, or just playlists?)
        // Let's use playlists channels for consistency if possible, but existing updateChannelFilters uses videos.
        // For now, keep using langVideos for channel filters to ensure all channels are selectable
        updateChannelFilters(langVideos);

        // Render Playlists
        renderPlaylists(langPlaylists);

        // Visibility
        domElements.seriesSection.style.display = 'block';
        domElements.latestSection.style.display = 'none';
        domElements.filterBar.style.display = 'block';
        if (domElements.videoTypeFilters) domElements.videoTypeFilters.parentElement.style.display = 'none'; // Hide video type filters
        domElements.socialsSection.style.display = 'none';

    } else {
        // Socials View
        domElements.seriesSection.style.display = 'none';
        domElements.latestSection.style.display = 'none';
        domElements.filterBar.style.display = 'none';
        if (domElements.videoTypeFilters) domElements.videoTypeFilters.parentElement.style.display = 'none';
        domElements.socialsSection.style.display = 'block';
        renderSocials();
    }
}

export function filterByPlaylist(playlistId, playlistTitle) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));

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

        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        document.querySelector('[data-channel="all"]').classList.add('active');
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
        if (!e.target.classList.contains('chip')) return;

        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        domElements.searchInput.value = '';

        const selectedChannel = e.target.dataset.channel;
        const langVideos = state.currentLanguage === 'all' ? state.allVideos : state.allVideos.filter(v => v.language === state.currentLanguage);
        const langPlaylists = state.currentLanguage === 'all' ? state.allPlaylists : state.allPlaylists.filter(p => p.language === state.currentLanguage);

        const t = translations[state.currentLanguage] || translations['en'];

        if (selectedChannel === 'all') {
            domElements.latestSection.querySelector('h2').textContent = t.latest;
            renderPlaylists(langPlaylists);
            renderGrid(langVideos);
        } else {
            // Import getChannelDisplayName dynamically to get proper channel name for header
            import('./utils.js').then(({ getChannelDisplayName }) => {
                const displayName = getChannelDisplayName(selectedChannel, state.currentLanguage, state.socialsData);
                domElements.latestSection.querySelector('h2').textContent = `${displayName} Videos`;
            });

            const filteredPlaylists = langPlaylists.filter(s => s.channelId === selectedChannel);
            renderPlaylists(filteredPlaylists);

            const filteredVideos = langVideos.filter(v => v.channelId === selectedChannel);
            renderGrid(filteredVideos, true);
        }
    });
}
