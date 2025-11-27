const API_KEY = ''; // Not used for now as we use pre-generated JSON
const DATA_URL = 'assets/data/content.json';

let allVideos = [];
let allPlaylists = [];
let fuse; // Search instance

// DOM Elements
const videoGrid = document.getElementById('videoGrid');
const seriesSwimlane = document.getElementById('seriesSwimlane'); // Keeping ID for CSS compat
const searchInput = document.getElementById('searchInput');
const channelFilters = document.getElementById('channelFilters');
const seriesSection = document.getElementById('seriesSection');
const latestSection = document.getElementById('latestSection');

// 1. Fetch & Normalize Data
async function initPortfolio() {
    try {
        // Show loading state
        videoGrid.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Loading content...</p>
            </div>
        `;

        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error('Failed to load content data');

        const data = await response.json();

        allVideos = [];
        allPlaylists = [];

        Object.keys(data).forEach(lang => {
            Object.keys(data[lang]).forEach(channelKey => {
                const channel = data[lang][channelKey];
                const channelName = channel.title;

                // Process Videos
                channel.videos.forEach(video => {
                    if (video.state === 'published') {
                        allVideos.push({
                            id: video.video_id,
                            title: video.title,
                            thumbnail: video.thumbnail,
                            date: video.published_at,
                            channelName: channelName,
                            channelId: channelKey,
                            language: lang,
                            serie: video.serie, // Keeping for legacy search/display if needed
                            playlistId: video.playlist_id,
                            searchStr: `${video.title} ${channelName} ${lang} ${video.serie || ''}`
                        });
                    }
                });

                // Process Playlists
                if (channel.playlists) {
                    Object.keys(channel.playlists).forEach(playlistId => {
                        const playlistData = channel.playlists[playlistId];
                        const playlistVideos = playlistData ? playlistData.videos : undefined;
                        // Only include playlists with published videos
                        const publishedVideos = playlistVideos ? playlistVideos.filter(v => v.state === 'published') : [];

                        if (publishedVideos.length > 0) {
                            // Find a thumbnail (use the first video's)
                            const thumb = publishedVideos[0].thumbnail || `https://img.youtube.com/vi/${publishedVideos[0].video_id}/hqdefault.jpg`;

                            allPlaylists.push({
                                id: playlistData.id,
                                title: playlistData.title,
                                channelName: channelName,
                                channelId: channelKey,
                                videoCount: publishedVideos.length,
                                thumbnail: thumb,
                                videos: publishedVideos,
                                language: lang,
                                playlistId: playlistData.id // Redundant but consistent
                            });
                        }
                    });
                }
            });
        });

        // Sort by date descending
        allVideos.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Setup Search
        fuse = new Fuse(allVideos, {
            keys: ['title', 'channelName', 'language', 'serie'],
            threshold: 0.3
        });

        // Initial Render
        renderPlaylists(allPlaylists);
        renderGrid(allVideos);

        // Setup Event Listeners
        setupSearch();
        setupFilters();

    } catch (error) {
        console.error("Init Error:", error);
        videoGrid.innerHTML = `
            <div class="loading-state">
                <p>⚠️ Unable to load content.</p>
                <p class="text-muted text-sm">${error.message}</p>
            </div>
        `;
    }
}

// 2. Render Playlist Swimlane
function renderPlaylists(playlistList) {
    seriesSwimlane.innerHTML = '';

    if (playlistList.length === 0) {
        seriesSection.style.display = 'none';
        return;
    }
    seriesSection.style.display = 'block';

    playlistList.forEach(playlist => {
        const card = document.createElement('div');
        card.className = 'series-card'; // Reuse existing CSS class
        // Clicking the card filters the grid
        card.onclick = (e) => {
            // Prevent filter if clicking the external link
            if (e.target.closest('.series-link')) return;
            filterByPlaylist(playlist.id, playlist.title);
        };

        const linkHtml = playlist.id
            ? `<a href="https://www.youtube.com/playlist?list=${playlist.id}" target="_blank" class="series-link" title="Open in YouTube">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
               </a>`
            : '';

        card.innerHTML = `
            <div class="series-thumbnail-stack">
                <img src="${playlist.thumbnail}" alt="${playlist.title}" loading="lazy">
                <div class="series-count-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                    ${playlist.videoCount}
                </div>
                ${linkHtml}
            </div>
            <div class="series-content">
                <span class="channel-tag">${playlist.channelName}</span>
                <h3 class="series-title">${playlist.title}</h3>
                <div class="series-meta">${playlist.videoCount} Videos</div>
            </div>
        `;
        seriesSwimlane.appendChild(card);
    });
}

// 3. Render Bento Grid
function renderGrid(videos, isFiltered = false) {
    videoGrid.innerHTML = '';

    if (videos.length === 0) {
        videoGrid.innerHTML = `
            <div class="loading-state">
                <p>No videos found.</p>
            </div>
        `;
        return;
    }

    videos.forEach((video, index) => {
        // Feature first 2 videos ONLY if we are showing the main "Latest Uploads" list (not filtered)
        const isFeatured = (!isFiltered && index < 2) ? 'featured' : '';

        const card = document.createElement('article');
        card.className = `video-card ${isFeatured}`;

        const dateObj = new Date(video.date);
        const dateStr = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

        card.innerHTML = `
            <lite-youtube videoid="${video.id}" playlabel="Play: ${video.title}" params="controls=1&modestbranding=1&rel=0"></lite-youtube>
            <div class="card-content">
                <div class="card-meta">
                    <span class="channel-tag">${video.channelName}</span>
                    <span class="video-date">${dateStr}</span>
                </div>
                <h3 class="card-title">${video.title}</h3>
                ${video.serie ? `<div class="series-meta">Series: ${video.serie}</div>` : ''}
            </div>
        `;
        videoGrid.appendChild(card);
    });
}

// 4. Filter Logic
function filterByPlaylist(playlistId, playlistTitle) {
    // Update UI to show we are filtered
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));

    // Scroll to grid
    latestSection.scrollIntoView({ behavior: 'smooth' });

    // Filter videos
    const filtered = allVideos.filter(v => v.playlistId === playlistId);

    // Update Section Title
    latestSection.querySelector('h2').textContent = `Playlist: ${playlistTitle}`;

    renderGrid(filtered, true); // true = disable featured layout for filtered view
}

function setupSearch() {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;

        // Reset UI
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        document.querySelector('[data-channel="all"]').classList.add('active');
        latestSection.querySelector('h2').textContent = 'Search Results';

        if (!query) {
            latestSection.querySelector('h2').textContent = 'Latest Uploads';
            renderGrid(allVideos);
            return;
        }

        const results = fuse.search(query).map(result => result.item);
        renderGrid(results, true);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
        }
    });
}

function setupFilters() {
    const channels = new Set();
    allVideos.forEach(v => channels.add(v.channelName));

    const allBtn = channelFilters.querySelector('[data-channel="all"]');
    channelFilters.innerHTML = '';
    channelFilters.appendChild(allBtn);

    channels.forEach(channelName => {
        const btn = document.createElement('button');
        btn.className = 'chip';
        btn.textContent = channelName;
        btn.dataset.channel = channelName;
        channelFilters.appendChild(btn);
    });

    channelFilters.addEventListener('click', (e) => {
        if (!e.target.classList.contains('chip')) return;

        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        searchInput.value = '';

        const selectedChannel = e.target.dataset.channel;

        if (selectedChannel === 'all') {
            latestSection.querySelector('h2').textContent = 'Latest Uploads';
            renderPlaylists(allPlaylists); // Show all playlists
            renderGrid(allVideos);
        } else {
            latestSection.querySelector('h2').textContent = `${selectedChannel} Videos`;

            // Filter Playlists
            const filteredPlaylists = allPlaylists.filter(s => s.channelName === selectedChannel);
            renderPlaylists(filteredPlaylists);

            // Filter Videos
            const filteredVideos = allVideos.filter(v => v.channelName === selectedChannel);
            renderGrid(filteredVideos, true);
        }
    });
}

document.addEventListener('DOMContentLoaded', initPortfolio);
