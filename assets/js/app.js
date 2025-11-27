const API_KEY = ''; // Not used for now as we use pre-generated JSON
const DATA_URL = 'assets/data/content.json';

let allVideos = [];
let fuse; // Search instance

// DOM Elements
const grid = document.getElementById('videoGrid');
const searchInput = document.getElementById('searchInput');
const channelFilters = document.getElementById('channelFilters');

// 1. Fetch & Normalize Data
async function initPortfolio() {
    try {
        // Show loading state
        grid.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Loading videos...</p>
            </div>
        `;

        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error('Failed to load content data');

        const data = await response.json();

        // Flatten the nested structure: Language -> Channel -> Videos
        // We want a single list of videos with metadata
        allVideos = [];

        Object.keys(data).forEach(lang => {
            Object.keys(data[lang]).forEach(channelKey => {
                const channel = data[lang][channelKey];
                const channelName = channel.title;

                channel.videos.forEach(video => {
                    // Only include published videos
                    if (video.state === 'published') {
                        allVideos.push({
                            id: video.video_id,
                            title: video.title,
                            thumbnail: video.thumbnail,
                            date: video.published_at,
                            channelName: channelName,
                            channelId: channelKey,
                            language: lang,
                            // Create a searchable text blob
                            searchStr: `${video.title} ${channelName} ${lang}`
                        });
                    }
                });
            });
        });

        // Sort by date descending
        allVideos.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Setup Search
        fuse = new Fuse(allVideos, {
            keys: ['title', 'channelName', 'language'],
            threshold: 0.3 // Fuzzy tolerance
        });

        // Initial Render
        renderGrid(allVideos);

        // Setup Event Listeners
        setupSearch();
        setupFilters();

    } catch (error) {
        console.error("Init Error:", error);
        grid.innerHTML = `
            <div class="loading-state">
                <p>⚠️ Unable to load videos. Please try again later.</p>
                <p class="text-muted text-sm">${error.message}</p>
            </div>
        `;
    }
}

// 2. Render the Bento Grid
function renderGrid(videos) {
    grid.innerHTML = '';

    if (videos.length === 0) {
        grid.innerHTML = `
            <div class="loading-state">
                <p>No videos found matching your criteria.</p>
            </div>
        `;
        return;
    }

    videos.forEach((video, index) => {
        // Logic: First 2 videos are "Featured" (Large Bento Cells)
        // Only feature if it's the initial full list (index < 2) AND we are not deep in search results
        // For simplicity, let's just feature the top 2 of whatever list is passed, 
        // but maybe only if there are enough videos to justify it.
        const isFeatured = index < 2 ? 'featured' : '';

        const card = document.createElement('article');
        card.className = `video-card ${isFeatured}`;

        // Format date
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
            </div>
        `;
        grid.appendChild(card);
    });
}

// 3. Search Logic
function setupSearch() {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;

        // Reset active filter chip when searching
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        document.querySelector('[data-channel="all"]').classList.add('active');

        if (!query) {
            renderGrid(allVideos);
            return;
        }

        const results = fuse.search(query).map(result => result.item);
        renderGrid(results);
    });

    // Keyboard shortcut '/' to focus search
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
        }
    });
}

// 4. Filter Logic
function setupFilters() {
    // Generate filter chips dynamically based on available channels
    // But for now, let's stick to the hardcoded ones or extract them from data
    // Let's extract unique channels from data for a dynamic filter list

    const channels = new Set();
    allVideos.forEach(v => channels.add(v.channelName));

    // Clear existing chips except 'All'
    const allBtn = channelFilters.querySelector('[data-channel="all"]');
    channelFilters.innerHTML = '';
    channelFilters.appendChild(allBtn);

    channels.forEach(channelName => {
        const btn = document.createElement('button');
        btn.className = 'chip';
        btn.textContent = channelName;
        btn.dataset.channel = channelName; // Using name as ID for simplicity here
        channelFilters.appendChild(btn);
    });

    channelFilters.addEventListener('click', (e) => {
        if (!e.target.classList.contains('chip')) return;

        // Update UI
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');

        // Clear search
        searchInput.value = '';

        const selectedChannel = e.target.dataset.channel;

        if (selectedChannel === 'all') {
            renderGrid(allVideos);
        } else {
            const filtered = allVideos.filter(v => v.channelName === selectedChannel);
            renderGrid(filtered);
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', initPortfolio);
