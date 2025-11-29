import { state, domElements } from './state.js';
import { translations } from './translations.js';
import { renderGrid, renderPlaylists, updateChannelFilters, updateVideoTypeFilters, renderSocials } from './render.js';

export function refreshContent() {
    if (state.currentView === 'videos') {
        // Filter by Language
        let langVideos = state.currentLanguage === 'all' ? state.allVideos : state.allVideos.filter(v => v.language === state.currentLanguage);

        // Filter by Video Type
        if (state.currentVideoType === '4k') {
            langVideos = langVideos.filter(v => v.videoType && v.videoType.includes('4k'));
        } else if (state.currentVideoType === 'shorts') {
            langVideos = langVideos.filter(v => v.videoType && v.videoType.includes('short'));
        }

        const langPlaylists = state.currentLanguage === 'all' ? state.allPlaylists : state.allPlaylists.filter(p => p.language === state.currentLanguage);

        // Update Filters
        updateChannelFilters(langVideos);
        updateVideoTypeFilters();

        // Render
        renderPlaylists(langPlaylists);
        renderGrid(langVideos);

        domElements.seriesSection.style.display = langPlaylists.length > 0 ? 'block' : 'none';
        domElements.latestSection.style.display = 'block';
        domElements.filterBar.style.display = 'block';
        domElements.socialsSection.style.display = 'none';
    } else {
        // Socials View
        domElements.seriesSection.style.display = 'none';
        domElements.latestSection.style.display = 'none';
        domElements.filterBar.style.display = 'none';
        domElements.socialsSection.style.display = 'block';
        renderSocials();
    }
}

export function filterByPlaylist(playlistId, playlistTitle) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    domElements.latestSection.scrollIntoView({ behavior: 'smooth' });

    // Filter from current language set
    const langVideos = state.currentLanguage === 'all' ? state.allVideos : state.allVideos.filter(v => v.language === state.currentLanguage);
    const filtered = langVideos.filter(v => v.playlistId === playlistId);

    const t = translations[state.currentLanguage] || translations['en'];
    domElements.latestSection.querySelector('h2').textContent = `${t.playlist}: ${playlistTitle}`;
    renderGrid(filtered, true);
}

export function setupSearch() {
    domElements.searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        document.querySelector('[data-channel="all"]').classList.add('active');
        const t = translations[state.currentLanguage] || translations['en'];
        domElements.latestSection.querySelector('h2').textContent = t.searchResults;

        if (!query) {
            domElements.latestSection.querySelector('h2').textContent = t.latest;
            refreshContent(); // Reset to current language view
            return;
        }

        const results = state.fuse.search(query).map(result => result.item);
        renderGrid(results, true);
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
            domElements.latestSection.querySelector('h2').textContent = `${selectedChannel} Videos`;

            const filteredPlaylists = langPlaylists.filter(s => s.channelName === selectedChannel);
            renderPlaylists(filteredPlaylists);

            const filteredVideos = langVideos.filter(v => v.channelName === selectedChannel);
            renderGrid(filteredVideos, true);
        }
    });
}
