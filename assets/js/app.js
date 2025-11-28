const API_KEY = ''; // Not used for now as we use pre-generated JSON
const DATA_URL = 'assets/data/content.json';
const SOCIALS_URL = 'assets/data/socials.json';

let allVideos = [];
let allPlaylists = [];
let socialsData = {};
let fuse; // Search instance
let currentLanguage = 'en';
let currentView = 'videos';
let currentVideoType = 'all'; // 'all', '4k', 'shorts'

// DOM Elements
const videoGrid = document.getElementById('videoGrid');
const seriesSwimlane = document.getElementById('seriesSwimlane');
const searchInput = document.getElementById('searchInput');
const channelFilters = document.getElementById('channelFilters');
const seriesSection = document.getElementById('seriesSection');
const latestSection = document.getElementById('latestSection');
const socialsSection = document.getElementById('socialsSection');
const socialsGrid = document.getElementById('socialsGrid');
const languageSelect = document.getElementById('languageSelect');
const filterBar = document.getElementById('filterBar');
const videoTypeFilters = document.getElementById('videoTypeFilters');

// 1. Fetch & Normalize Data
const translations = {
    en: {
        featured: "Featured Playlists",
        latest: "Latest Uploads",
        socials: "Community & Socials",
        videosBtn: "Videos",
        socialsBtn: "Socials",
        searchPlaceholder: "Search across channels...",
        all: "All",
        searchResults: "Search Results",
        playlist: "Playlist",
        loading: "Loading content...",
        noVideos: "No videos found.",
        youtubeTitle: "YouTube Channels",
        instagramTitle: "Instagram",
        tiktokTitle: "TikTok",
        subscribe: "Subscribe",
        follow: "Follow",
        patreonTitle: "Support Us",
        videos4k: "4K Videos",
        shorts: "Shorts",
        allVideos: "All Videos"
    },
    es: {
        featured: "Listas Destacadas",
        latest: "Últimos Videos",
        socials: "Comunidad y Redes",
        videosBtn: "Videos",
        socialsBtn: "Redes",
        searchPlaceholder: "Buscar en los canales...",
        all: "Todos",
        searchResults: "Resultados de Búsqueda",
        playlist: "Lista",
        loading: "Cargando contenido...",
        noVideos: "No se encontraron videos.",
        youtubeTitle: "Canales de YouTube",
        instagramTitle: "Instagram",
        tiktokTitle: "TikTok",
        subscribe: "Suscribirse",
        follow: "Seguir",
        patreonTitle: "Apóyanos",
        videos4k: "Videos 4K",
        shorts: "Shorts",
        allVideos: "Todos los Videos"
    },
    de: {
        featured: "Vorgestellte Playlists",
        latest: "Neueste Uploads",
        socials: "Community & Soziales",
        videosBtn: "Videos",
        socialsBtn: "Soziales",
        searchPlaceholder: "Kanäle durchsuchen...",
        all: "Alle",
        searchResults: "Suchergebnisse",
        playlist: "Playlist",
        loading: "Inhalt wird geladen...",
        noVideos: "Keine Videos gefunden.",
        youtubeTitle: "YouTube Kanäle",
        instagramTitle: "Instagram",
        tiktokTitle: "TikTok",
        subscribe: "Abonnieren",
        follow: "Folgen",
        patreonTitle: "Unterstütze uns",
        videos4k: "4K-Videos",
        shorts: "Shorts",
        allVideos: "Alle Videos"
    }
};

function detectLanguage() {
    const storedLang = localStorage.getItem('preferredLanguage');
    if (storedLang) return storedLang;

    const browserLang = navigator.language.slice(0, 2);
    if (['es', 'de'].includes(browserLang)) return browserLang;

    return 'en';
}

function updateUIText() {
    const t = translations[currentLanguage] || translations['en'];

    // Static Elements
    const featuredTitle = document.getElementById('featuredTitle');
    if (featuredTitle) featuredTitle.textContent = t.featured;

    const latestTitle = document.getElementById('latestTitle');
    if (latestTitle) latestTitle.textContent = t.latest;

    const socialsTitle = document.getElementById('socialsTitle');
    if (socialsTitle) socialsTitle.textContent = t.socials;

    const videosBtnText = document.getElementById('videosBtnText');
    if (videosBtnText) videosBtnText.textContent = t.videosBtn;

    const socialsBtnText = document.getElementById('socialsBtnText');
    if (socialsBtnText) socialsBtnText.textContent = t.socialsBtn;

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.placeholder = t.searchPlaceholder;

    // Update "All" filter chip if it exists
    const allChip = document.querySelector('.chip[data-channel="all"]');
    if (allChip) allChip.textContent = t.all;

    // Update Language Picker Label
    const langLabel = document.querySelector('#langBtn span');
    const langNames = { en: 'English', es: 'Español', de: 'Deutsch', all: 'All Languages' };
    if (langLabel) langLabel.textContent = langNames[currentLanguage] || 'English';
}

async function initPortfolio() {
    try {
        // Detect and set language
        currentLanguage = detectLanguage();
        updateUIText();

        // Show loading state
        const t = translations[currentLanguage] || translations['en'];
        videoGrid.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>${t.loading}</p>
            </div>
        `;

        // Fetch Content and Socials
        const [contentResponse, socialsResponse] = await Promise.all([
            fetch(DATA_URL),
            fetch(SOCIALS_URL)
        ]);

        if (!contentResponse.ok) throw new Error('Failed to load content data');

        const data = await contentResponse.json();
        socialsData = socialsResponse.ok ? await socialsResponse.json() : {};

        allVideos = [];
        allPlaylists = [];

        Object.keys(data).forEach(lang => {
            Object.keys(data[lang]).forEach(channelKey => {
                const channel = data[lang][channelKey];
                const channelName = channel.title;
                const channelColor = channel.color || '#71717a';

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
                            channelColor: channelColor,
                            language: lang,
                            serie: video.serie,
                            playlistId: video.playlist_id,
                            videoType: video.video_type,
                            searchStr: `${video.title} ${channelName} ${lang} ${video.serie || ''}`
                        });
                    }
                });

                // Process Playlists
                if (channel.playlists) {
                    Object.keys(channel.playlists).forEach(playlistId => {
                        const playlistData = channel.playlists[playlistId];
                        const playlistVideos = playlistData ? playlistData.videos : undefined;
                        const publishedVideos = playlistVideos ? playlistVideos.filter(v => v.state === 'published') : [];

                        if (publishedVideos.length > 0) {
                            const thumb = publishedVideos[0].thumbnail || `https://img.youtube.com/vi/${publishedVideos[0].video_id}/hqdefault.jpg`;

                            allPlaylists.push({
                                id: playlistData.id,
                                title: playlistData.title,
                                channelName: channelName,
                                channelId: channelKey,
                                channelColor: channelColor,
                                videoCount: publishedVideos.length,
                                thumbnail: thumb,
                                videos: publishedVideos,
                                language: lang,
                                playlistId: playlistData.id
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
        videoGrid.innerHTML = `
            <div class="loading-state">
                <p>⚠️ Unable to load content.</p>
                <p class="text-muted text-sm">${error.message}</p>
            </div>
        `;
    }
}

function refreshContent() {
    if (currentView === 'videos') {
        // Filter by Language
        let langVideos = currentLanguage === 'all' ? allVideos : allVideos.filter(v => v.language === currentLanguage);

        // Filter by Video Type
        if (currentVideoType === '4k') {
            langVideos = langVideos.filter(v => v.videoType && v.videoType.includes('4k'));
        } else if (currentVideoType === 'shorts') {
            langVideos = langVideos.filter(v => v.videoType && v.videoType.includes('short'));
        }

        const langPlaylists = currentLanguage === 'all' ? allPlaylists : allPlaylists.filter(p => p.language === currentLanguage);

        // Update Filters
        updateChannelFilters(langVideos);
        updateVideoTypeFilters();

        // Render
        renderPlaylists(langPlaylists);
        renderGrid(langVideos);

        seriesSection.style.display = langPlaylists.length > 0 ? 'block' : 'none';
        latestSection.style.display = 'block';
        filterBar.style.display = 'block';
        socialsSection.style.display = 'none';
    } else {
        // Socials View
        seriesSection.style.display = 'none';
        latestSection.style.display = 'none';
        filterBar.style.display = 'none';
        socialsSection.style.display = 'block';
        renderSocials();
    }
}

function updateChannelFilters(videos) {
    const channels = new Set();
    videos.forEach(v => channels.add(v.channelName));

    const allBtn = document.createElement('button');
    allBtn.className = 'chip active';
    const t = translations[currentLanguage] || translations['en'];
    allBtn.textContent = t.all;
    allBtn.dataset.channel = 'all';

    channelFilters.innerHTML = '';
    channelFilters.appendChild(allBtn);

    // Map channel names to IDs for accent classes
    const channelMap = {};
    videos.forEach(v => channelMap[v.channelName] = v.channelId);

    Array.from(channels).sort().forEach(channelName => {
        const btn = document.createElement('button');
        btn.className = `chip accent-${channelMap[channelName]}`;
        btn.textContent = channelName;
        btn.dataset.channel = channelName;
        channelFilters.appendChild(btn);
    });
}

function updateVideoTypeFilters() {
    if (!videoTypeFilters) return;

    const t = translations[currentLanguage] || translations['en'];

    videoTypeFilters.innerHTML = '';

    const types = [
        { value: 'all', label: t.allVideos },
        { value: '4k', label: t.videos4k },
        { value: 'shorts', label: t.shorts }
    ];

    types.forEach(type => {
        const btn = document.createElement('button');
        btn.className = `chip ${currentVideoType === type.value ? 'active' : ''}`;
        btn.textContent = type.label;
        btn.dataset.videoType = type.value;
        videoTypeFilters.appendChild(btn);
    });
}

// 2. Render Playlist Swimlane
function renderPlaylists(playlistList) {
    seriesSwimlane.innerHTML = '';

    playlistList.forEach(playlist => {
        const card = document.createElement('div');
        card.className = `series-card accent-${playlist.channelId}`;

        card.onclick = (e) => {
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
                <p>${(translations[currentLanguage] || translations['en']).noVideos}</p>
            </div>
        `;
        return;
    }

    videos.forEach((video, index) => {
        const isFeatured = (!isFiltered && index < 2) ? 'featured' : '';
        const card = document.createElement('article');
        card.className = `video-card ${isFeatured} accent-${video.channelId}`;

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
                ${video.playlistId && video.serie && video.serie !== 'na' ? `<div class="series-meta">Playlist: ${video.serie}</div>` : ''}
            </div>
        `;
        videoGrid.appendChild(card);
    });
}

function renderSocials() {
    socialsGrid.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'socials-container';

    const t = translations[currentLanguage] || translations['en'];

    // Icons
    const icons = {
        patreon: '<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1z"></path><circle cx="12" cy="15" r="1.5" fill="currentColor"/><path d="M7 14h2m3 0h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
        youtube: '<path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>',
        instagram: '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>',
        tiktok: '<path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>'
    };

    const createHeader = (sectionTitle, type) => {
        const header = document.createElement('h3');
        header.className = 'social-group-header';
        header.innerHTML = `
            <span class="icon-wrapper icon-${type}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
                    ${icons[type]}
                </svg>
            </span>
            ${sectionTitle}
        `;
        return header;
    };

    const createCard = (item, type) => {
        const card = document.createElement('a');
        card.href = item.url;
        card.target = '_blank';
        card.className = `social-card card-${type}`;

        // Create Banner (like video thumbnail)
        const banner = document.createElement('div');
        banner.className = 'social-banner';
        banner.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                ${icons[type]}
            </svg>
        `;

        // Create Card Content (like video card content)
        const content = document.createElement('div');
        content.className = 'card-content';

        // Card Meta (platform tag + language if applicable)
        const meta = document.createElement('div');
        meta.className = 'card-meta';

        const platformTag = document.createElement('span');
        platformTag.className = `social-platform-tag tag-${type}`;
        platformTag.textContent = type.toUpperCase();
        meta.appendChild(platformTag);

        if (item.language) {
            const langBadge = document.createElement('span');
            langBadge.className = 'lang-badge';
            langBadge.textContent = item.language.toUpperCase();
            meta.appendChild(langBadge);
        }

        content.appendChild(meta);

        // Handle (like video title)
        const handle = document.createElement('h3');
        handle.className = 'social-handle';
        handle.textContent = item.handle;
        content.appendChild(handle);

        // Description (if available)
        if (item.description) {
            const desc = document.createElement('p');
            desc.className = 'social-desc';
            const descText = typeof item.description === 'object' ? item.description[currentLanguage] || item.description.en : item.description;
            desc.textContent = descText;
            content.appendChild(desc);
        }

        // CTA for Patreon
        if (type === 'patreon' && item.cta) {
            const cta = document.createElement('div');
            cta.className = 'social-cta';
            const ctaText = typeof item.cta === 'object' ? item.cta[currentLanguage] || item.cta.en : item.cta;
            cta.textContent = `→ ${ctaText}`;
            content.appendChild(cta);
        }

        card.appendChild(banner);
        card.appendChild(content);
        return card;
    };

    // Render all sections and cards directly in container grid
    // Patreon Section
    if (socialsData.patreon && socialsData.patreon.items.length > 0) {
        container.appendChild(createHeader(t.patreonTitle || "Support Us", 'patreon'));
        socialsData.patreon.items.forEach(item => {
            container.appendChild(createCard(item, 'patreon'));
        });
    }

    // YouTube Section
    if (socialsData.youtube && socialsData.youtube.items.length > 0) {
        container.appendChild(createHeader(t.youtubeTitle, 'youtube'));
        socialsData.youtube.items.forEach(item => {
            container.appendChild(createCard(item, 'youtube'));
        });
    }

    // Instagram Section
    if (socialsData.instagram && socialsData.instagram.items.length > 0) {
        container.appendChild(createHeader(t.instagramTitle, 'instagram'));
        socialsData.instagram.items.forEach(item => {
            container.appendChild(createCard(item, 'instagram'));
        });
    }

    // TikTok Section
    if (socialsData.tiktok && socialsData.tiktok.items.length > 0) {
        container.appendChild(createHeader(t.tiktokTitle, 'tiktok'));
        socialsData.tiktok.items.forEach(item => {
            container.appendChild(createCard(item, 'tiktok'));
        });
    }

    socialsGrid.appendChild(container);
}

// 4. Filter Logic
function filterByPlaylist(playlistId, playlistTitle) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    latestSection.scrollIntoView({ behavior: 'smooth' });

    // Filter from current language set
    const langVideos = currentLanguage === 'all' ? allVideos : allVideos.filter(v => v.language === currentLanguage);
    const filtered = langVideos.filter(v => v.playlistId === playlistId);

    const t = translations[currentLanguage] || translations['en'];
    latestSection.querySelector('h2').textContent = `${t.playlist}: ${playlistTitle}`;
    renderGrid(filtered, true);
}

function setupSearch() {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        document.querySelector('[data-channel="all"]').classList.add('active');
        const t = translations[currentLanguage] || translations['en'];
        latestSection.querySelector('h2').textContent = t.searchResults;

        if (!query) {
            latestSection.querySelector('h2').textContent = t.latest;
            refreshContent(); // Reset to current language view
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
    channelFilters.addEventListener('click', (e) => {
        if (!e.target.classList.contains('chip')) return;

        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        searchInput.value = '';

        const selectedChannel = e.target.dataset.channel;
        const langVideos = currentLanguage === 'all' ? allVideos : allVideos.filter(v => v.language === currentLanguage);
        const langPlaylists = currentLanguage === 'all' ? allPlaylists : allPlaylists.filter(p => p.language === currentLanguage);

        const t = translations[currentLanguage] || translations['en'];

        if (selectedChannel === 'all') {
            latestSection.querySelector('h2').textContent = t.latest;
            renderPlaylists(langPlaylists);
            renderGrid(langVideos);
        } else {
            latestSection.querySelector('h2').textContent = `${selectedChannel} Videos`;

            const filteredPlaylists = langPlaylists.filter(s => s.channelName === selectedChannel);
            renderPlaylists(filteredPlaylists);

            const filteredVideos = langVideos.filter(v => v.channelName === selectedChannel);
            renderGrid(filteredVideos, true);
        }
    });
}

function setupLanguageSelector() {
    const btn = document.getElementById('langBtn');
    const dropdown = document.getElementById('langDropdown');
    const options = document.querySelectorAll('.lang-option');
    const label = btn.querySelector('span');

    // Toggle Dropdown
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });

    // Close on outside click
    document.addEventListener('click', () => {
        dropdown.classList.remove('show');
    });

    // Handle Selection
    options.forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation();
            const value = opt.dataset.value;
            const text = opt.textContent.trim();

            // Update State
            currentLanguage = value;

            // Update UI
            updateUIText(); // Update all static text

            refreshContent();
        });
    });
}

function setupViewToggle() {
    const btns = document.querySelectorAll('.toggle-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            refreshContent();
        });
    });
}

function setupVideoTypeFilters() {
    if (!videoTypeFilters) return;

    videoTypeFilters.addEventListener('click', (e) => {
        if (!e.target.classList.contains('chip')) return;

        const selectedType = e.target.dataset.videoType;
        if (!selectedType) return;

        currentVideoType = selectedType;
        refreshContent();
    });
}

document.addEventListener('DOMContentLoaded', initPortfolio);
