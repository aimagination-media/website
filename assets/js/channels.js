// Channels page JavaScript functionality

document.addEventListener('DOMContentLoaded', function () {
    initChannelsPage();
});

function initChannelsPage() {
    setupLanguageSelector();

    // Check if we are on a channel detail page
    const urlParams = new URLSearchParams(window.location.search);
    const channelId = urlParams.get('id');

    if (channelId) {
        loadChannelDetail(channelId);
    } else {
        // We are on the main index page (or language index)
        loadChannelStats();
        setupChannelNavigation();
        loadRecentVideos();
    }
}

function setupLanguageSelector() {
    const selector = document.getElementById('languageSelector');
    if (!selector) return;

    // Set current language based on URL
    const currentLang = getCurrentLanguageFromPath();
    if (currentLang) {
        selector.value = currentLang;
    }

    // Handle language changes
    selector.addEventListener('change', function () {
        const newLang = this.value;
        const currentPath = window.location.pathname;

        // Replace language in path
        let newPath;
        if (currentPath.includes('/en/') || currentPath.includes('/es/') || currentPath.includes('/de/')) {
            newPath = currentPath.replace(/\/(en|es|de)\//, `/${newLang}/`);
        } else {
            newPath = `/${newLang}/`;
        }

        // Preserve query params
        if (window.location.search) {
            newPath += window.location.search;
        }

        // Navigate to new language
        window.location.href = newPath;
    });
}

function getCurrentLanguageFromPath() {
    const path = window.location.pathname;
    const match = path.match(/\/(en|es|de)\//);
    return match ? match[1] : 'en';
}

async function fetchContentData() {
    try {
        const response = await fetch('../assets/data/content.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch content data:', error);
        return null;
    }
}

async function loadChannelDetail(channelId) {
    const currentLang = getCurrentLanguageFromPath();
    const data = await fetchContentData();

    if (!data || !data[currentLang] || !data[currentLang][channelId]) {
        console.error('Channel data not found for:', channelId, currentLang);
        document.getElementById('channelTitle').textContent = 'Channel Not Found';
        document.getElementById('channelDescription').textContent = 'The requested channel could not be found.';
        return;
    }

    const channelData = data[currentLang][channelId];

    // Update Header
    document.getElementById('channelTitle').textContent = channelData.title;
    document.getElementById('channelDescription').textContent = channelData.description;

    // Update Breadcrumb
    const breadcrumb = document.getElementById('breadcrumbChannel');
    if (breadcrumb) {
        breadcrumb.textContent = channelData.title;
    }

    // Render Playlists
    const playlistsGrid = document.getElementById('playlistsGrid');
    if (playlistsGrid && channelData.playlists) {
        renderPlaylists(channelData.playlists, playlistsGrid);
    } else if (playlistsGrid) {
        playlistsGrid.innerHTML = '<p>No playlists available.</p>';
    }

    // Render All Videos
    const videosGrid = document.getElementById('channelVideos');
    if (videosGrid && channelData.videos) {
        renderVideos(channelData.videos, videosGrid);
    }

    // Render Explore Section
    const exploreGrid = document.getElementById('exploreGrid');
    if (exploreGrid) {
        renderExploreSection(data[currentLang], channelId, exploreGrid);
    }
}

function renderExploreSection(allChannels, currentChannelId, container) {
    container.innerHTML = '';

    for (const [id, channel] of Object.entries(allChannels)) {
        if (id === currentChannelId) continue; // Skip current channel

        const card = document.createElement('a');
        card.href = `channel.html?id=${id}`;
        card.className = 'explore-card';

        // Get a representative image (first video thumbnail or default)
        let thumbnail = '';
        if (channel.videos && channel.videos.length > 0) {
            thumbnail = channel.videos[0].thumbnail;
        }

        card.innerHTML = `
            <div class="explore-icon">
                <!-- Simple icon placeholder based on channel name -->
                ${getChannelIcon(id)}
            </div>
            <div class="explore-info">
                <h4>${channel.title}</h4>
                <span>${channel.videos ? channel.videos.length : 0} videos</span>
            </div>
        `;

        container.appendChild(card);
    }
}

function getChannelIcon(id) {
    // Return SVG based on id
    if (id === 'math') return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>';
    if (id === 'chemistry') return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31"/><path d="M14 2v7.31"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/></svg>';
    if (id === 'audiobook') return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>';
    return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2" /><polyline points="17 2 12 7 7 2" /></svg>';
}

function renderPlaylists(playlists, container) {
    container.innerHTML = '';

    for (const [playlistName, videos] of Object.entries(playlists)) {
        const playlistCard = document.createElement('div');
        playlistCard.className = 'playlist-card';

        // Get first video thumbnail as playlist cover
        const coverImage = videos.length > 0 ? videos[0].thumbnail : '';

        playlistCard.innerHTML = `
            <div class="playlist-cover">
                <img src="${coverImage}" alt="${playlistName}" loading="lazy">
                <div class="playlist-overlay">
                    <span class="video-count">${videos.length} videos</span>
                </div>
            </div>
            <div class="playlist-info">
                <h3>${playlistName}</h3>
                <a href="#" class="view-playlist-btn">View Playlist</a>
            </div>
        `;

        container.appendChild(playlistCard);
    }
}

function renderVideos(videos, container) {
    container.innerHTML = '';

    videos.forEach(video => {
        const videoElement = createVideoElement(video);
        container.appendChild(videoElement);
    });
}

function createVideoElement(video) {
    const videoDiv = document.createElement('div');
    videoDiv.className = 'video-card';

    // Check if scheduled
    const isScheduled = video.state === 'scheduled';
    const scheduledClass = isScheduled ? 'scheduled' : '';
    const scheduledBadge = isScheduled ? `<div class="scheduled-badge">Coming Soon: ${video.release_date || 'TBA'}</div>` : '';
    const opacityStyle = isScheduled ? 'style="opacity: 0.7;"' : '';

    videoDiv.innerHTML = `
        <div class="video-thumbnail" ${opacityStyle}>
            <img src="${video.thumbnail}" alt="${video.title}" loading="lazy" 
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik0xNDQgNzJMMTc2IDkwTDE0NCAxMDhWNzJaIiBmaWxsPSIjQ0NDIi8+Cjwvc3ZnPgo='">
            ${!isScheduled ? `<div class="video-duration">${video.duration}</div>` : ''}
            ${scheduledBadge}
        </div>
        <div class="video-info">
            <h4 class="video-title">${video.title}</h4>
            <div class="video-meta">
                <span class="video-date">${video.published_at}</span>
            </div>
        </div>
    `;

    if (!isScheduled) {
        videoDiv.addEventListener('click', function () {
            // Open video modal or navigate to YouTube
            // For now, just log
            console.log('Play video:', video.video_id);
            // In future: window.open(`https://youtube.com/watch?v=${video.video_id}`, '_blank');
        });
    }

    return videoDiv;
}

// ... (Existing loadChannelStats, setupChannelNavigation, loadRecentVideos functions can remain or be updated to use fetchContentData too)
// For brevity, I'm keeping the essential parts for the channel detail page. 
// I should probably refactor the index page logic to also use fetchContentData if I want it to be dynamic.

async function loadRecentVideos() {
    const recentVideosContainer = document.getElementById('recentVideos');
    if (!recentVideosContainer) return;

    const currentLang = getCurrentLanguageFromPath();
    const data = await fetchContentData();

    if (!data || !data[currentLang]) return;

    // Flatten all videos from all channels for this language
    let allVideos = [];
    for (const channelKey in data[currentLang]) {
        const channel = data[currentLang][channelKey];
        if (channel.videos) {
            allVideos = allVideos.concat(channel.videos.map(v => ({ ...v, channel: channelKey })));
        }
    }

    // Sort by date (newest first) - assuming published_at is YYYY-MM-DD
    allVideos.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

    // Take top 3
    const recentVideos = allVideos.slice(0, 3);

    renderVideos(recentVideos, recentVideosContainer);
}

function loadChannelStats() {
    const channelCards = document.querySelectorAll('.channel-card');

    channelCards.forEach(async card => {
        const channel = card.dataset.channel;
        const videoCountElement = card.querySelector('.video-count');
        const lastUpdatedElement = card.querySelector('.last-updated');

        const currentLang = getCurrentLanguageFromPath();
        const data = await fetchContentData();

        if (data && data[currentLang] && data[currentLang][channel]) {
            const stats = data[currentLang][channel];
            const count = stats.videos ? stats.videos.length : 0;
            videoCountElement.textContent = `${count}+ Videos`; // Or exact count
        }
    });
}

function setupChannelNavigation() {
    // Keep existing logic but maybe update hrefs dynamically if needed?
    // The HTML already has href="channel.html?id=..." so we might not need much here.
}

// CSS for video cards (added dynamically)
const videoCardStyles = `
.video-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 15px;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.video-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.video-thumbnail {
    position: relative;
    width: 100%;
    height: 180px;
    overflow: hidden;
}

.video-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.video-duration {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
}

.scheduled-badge {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    color: #ffd700;
    padding: 8px 12px;
    border-radius: 8px;
    font-weight: bold;
    text-align: center;
    width: 80%;
}

.channel-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    background: rgba(255, 255, 255, 0.9);
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 14px;
}

.video-info {
    padding: 16px;
}

.video-title {
    font-size: 16px;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 8px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.video-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    color: #718096;
}

.playlist-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    margin-bottom: 20px;
}

.playlist-cover {
    position: relative;
    height: 160px;
}

.playlist-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.playlist-overlay {
    position: absolute;
    bottom: 0;
    right: 0;
    background: rgba(0,0,0,0.7);
    color: white;
    padding: 4px 8px;
}

.playlist-info {
    padding: 12px;
}

@media (max-width: 768px) {
    .video-thumbnail {
        height: 160px;
    }
    
    .video-info {
        padding: 14px;
    }
    
    .video-title {
        font-size: 15px;
    }
    
    .video-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }
}
`;

// Inject video card styles
const styleSheet = document.createElement('style');
styleSheet.textContent = videoCardStyles;
document.head.appendChild(styleSheet); 