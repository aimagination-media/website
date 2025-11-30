import { state, domElements } from './state.js';
import { translations, langNames } from './translations.js';
import { getPlaylistTitle, getChannelDisplayName, getChannelUrl } from './utils.js';
import { filterByPlaylist } from './filter.js';

export function updateUIText() {
    const t = translations[state.currentLanguage] || translations['en'];

    if (domElements.featuredTitle) domElements.featuredTitle.textContent = t.featured;
    if (domElements.latestTitle) domElements.latestTitle.textContent = t.latest;
    if (domElements.socialsTitle) domElements.socialsTitle.textContent = t.socials;
    if (domElements.videosBtnText) domElements.videosBtnText.textContent = t.videosBtn;
    if (domElements.socialsBtnText) domElements.socialsBtnText.textContent = t.socialsBtn;
    if (domElements.searchInput) domElements.searchInput.placeholder = t.searchPlaceholder;

    const allChip = document.querySelector('.chip[data-channel="all"]');
    if (allChip) allChip.textContent = t.all;

    if (domElements.langLabel) domElements.langLabel.textContent = langNames[state.currentLanguage] || 'English';
}

export function renderPlaylists(playlistList) {
    domElements.seriesSwimlane.innerHTML = '';

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

        const channelDisplayName = getChannelDisplayName(playlist.channelId, state.currentLanguage, state.socialsData);

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
                <span class="channel-tag">${channelDisplayName}</span>
                <h3 class="series-title">${playlist.title}</h3>
                <div class="series-meta">${playlist.videoCount} Videos</div>
            </div>
        `;
        domElements.seriesSwimlane.appendChild(card);
    });
}

export function renderGrid(videos, isFiltered = false) {
    domElements.videoGrid.innerHTML = '';

    if (videos.length === 0) {
        domElements.videoGrid.innerHTML = `
            <div class="loading-state">
                <p>${(translations[state.currentLanguage] || translations['en']).noVideos}</p>
            </div>
        `;
        return;
    }

    videos.forEach((video, index) => {
        const isFeatured = (!isFiltered && index < 2) ? 'featured' : '';
        const isScheduled = video.isScheduled ? 'scheduled' : '';
        const card = document.createElement('article');
        card.className = `video-card ${isFeatured} ${isScheduled} accent-${video.channelId}`;

        let dateStr = 'Coming Soon';
        if (video.date && video.date !== 'TBA') {
            const dateObj = new Date(video.date);
            if (!isNaN(dateObj.getTime())) {
                dateStr = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
            } else {
                dateStr = video.date; // Fallback to raw string if parsing fails but not TBA
            }
        }

        const mediaContent = video.isScheduled
            ? `<div class="scheduled-thumbnail">
                 <img src="${video.thumbnail}" alt="${video.title}" loading="lazy" onerror="this.src='assets/images/placeholder.jpg'">
                 <div class="scheduled-overlay">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                 </div>
               </div>`
            : `<lite-youtube videoid="${video.id}" playlabel="Play: ${video.title}" params="controls=1&modestbranding=1&rel=0"></lite-youtube>`;

        const channelDisplayName = getChannelDisplayName(video.channelId, video.language, state.socialsData);
        const channelUrl = getChannelUrl(video.channelId, video.language, state.socialsData);

        const channelLinkHtml = channelUrl
            ? `<a href="${channelUrl}" target="_blank" class="channel-link-icon" title="Visit Channel">
                 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
               </a>`
            : '';

        card.innerHTML = `
            ${mediaContent}
            <div class="card-content">
                <div class="card-meta">
                    <span class="channel-tag">
                        ${channelDisplayName}
                        ${channelLinkHtml}
                    </span>
                    <span class="video-date">${dateStr}</span>
                    ${video.isScheduled ? '<span class="scheduled-badge">Scheduled</span>' : ''}
                </div>
                <h3 class="card-title">${video.title}</h3>
                ${video.playlistId ? `<div class="series-meta">Playlist: ${getPlaylistTitle(video.playlistId, state.allPlaylists) || 'Unknown Playlist'}</div>` : ''}
            </div>
        `;
        domElements.videoGrid.appendChild(card);
    });
}

export function renderSocials() {
    domElements.socialsGrid.innerHTML = '';
    const t = translations[state.currentLanguage] || translations['en'];

    // Icons
    const icons = {
        patreon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>',
        youtube: '<path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>',
        instagram: '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>',
        tiktok: '<path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>'
    };

    const createHeader = (sectionTitle, type) => {
        const header = document.createElement('h3');
        header.className = `social-group-header accent-${type}`;
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
        card.className = `social-card card-${type} accent-${type}`;

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
        const handleText = typeof item.handle === 'object' ? item.handle[state.currentLanguage] || item.handle.en : item.handle;
        handle.textContent = handleText;
        content.appendChild(handle);

        // Description (if available)
        if (item.description) {
            const desc = document.createElement('p');
            desc.className = 'social-desc';
            const descText = typeof item.description === 'object' ? item.description[state.currentLanguage] || item.description.en : item.description;
            desc.textContent = descText;
            content.appendChild(desc);
        }

        // CTA for Patreon
        if (type === 'patreon' && item.cta) {
            const cta = document.createElement('div');
            cta.className = 'social-cta';
            const ctaText = typeof item.cta === 'object' ? item.cta[state.currentLanguage] || item.cta.en : item.cta;
            cta.textContent = `→ ${ctaText}`;
            content.appendChild(cta);
        }

        card.appendChild(banner);
        card.appendChild(content);
        return card;
    };

    // Helper to create section wrapper with independent grid
    const createSectionWrapper = (sectionTitle, type, items) => {
        const section = document.createElement('div');
        section.className = 'social-section';

        // Add header
        section.appendChild(createHeader(sectionTitle, type));

        // Create grid container for cards
        const grid = document.createElement('div');
        grid.className = 'social-section-grid';

        // Add all cards to this section's grid
        items.forEach(item => {
            grid.appendChild(createCard(item, type));
        });

        section.appendChild(grid);
        return section;
    };

    // Render each section with its own independent grid
    // Patreon Section
    if (state.socialsData.patreon && state.socialsData.patreon.items.length > 0) {
        domElements.socialsGrid.appendChild(createSectionWrapper(t.patreonTitle || "Support Us", 'patreon', state.socialsData.patreon.items));
    }

    // YouTube Section
    if (state.socialsData.youtube && state.socialsData.youtube.items.length > 0) {
        domElements.socialsGrid.appendChild(createSectionWrapper(t.youtubeTitle, 'youtube', state.socialsData.youtube.items));
    }

    // TikTok Section
    if (state.socialsData.tiktok && state.socialsData.tiktok.items.length > 0) {
        domElements.socialsGrid.appendChild(createSectionWrapper(t.tiktokTitle, 'tiktok', state.socialsData.tiktok.items));
    }

    // Instagram Section
    if (state.socialsData.instagram && state.socialsData.instagram.items.length > 0) {
        domElements.socialsGrid.appendChild(createSectionWrapper(t.instagramTitle, 'instagram', state.socialsData.instagram.items));
    }
}

export function updateChannelFilters(videos) {
    const channels = new Set();
    videos.forEach(v => channels.add(v.channelName));

    const allBtn = document.createElement('button');
    allBtn.className = 'chip active';
    const t = translations[state.currentLanguage] || translations['en'];
    allBtn.textContent = t.all;
    allBtn.dataset.channel = 'all';

    domElements.channelFilters.innerHTML = '';
    domElements.channelFilters.appendChild(allBtn);

    // Map channel names to IDs for accent classes
    const channelMap = {};
    videos.forEach(v => channelMap[v.channelName] = v.channelId);

    Array.from(channels).sort().forEach(channelName => {
        const btn = document.createElement('button');
        btn.className = `chip accent-${channelMap[channelName]}`;
        btn.textContent = channelName;
        btn.dataset.channel = channelName;
        domElements.channelFilters.appendChild(btn);
    });
}

export function updateVideoTypeFilters() {
    if (!domElements.videoTypeFilters) return;

    const t = translations[state.currentLanguage] || translations['en'];

    // Get base videos for counting (filtered by current language for published, all for upcoming)
    const langVideos = state.currentLanguage === 'all' ? state.allVideos : state.allVideos.filter(v => v.language === state.currentLanguage);

    // Calculate counts for each filter type
    const allCount = langVideos.filter(v => !v.isScheduled).length;
    const longCount = langVideos.filter(v => v.videoType && v.videoType.includes('4k') && !v.isScheduled).length;
    const shortsCount = langVideos.filter(v => v.videoType && v.videoType.includes('short') && !v.isScheduled).length;
    const upcomingCount = state.allVideos.filter(v => v.isScheduled).length; // Always show count across all languages

    domElements.videoTypeFilters.innerHTML = '';

    const types = [
        { value: 'all', label: `${t.allVideos} (${allCount})` },
        { value: 'long', label: `${t.videosLongFormat} (${longCount})` },
        { value: 'shorts', label: `${t.shorts} (${shortsCount})` },
        { value: 'upcoming', label: `Upcoming (${upcomingCount})` }
    ];

    types.forEach(type => {
        const btn = document.createElement('button');
        btn.className = `chip ${state.currentVideoType === type.value ? 'active' : ''}`;
        btn.textContent = type.label;
        btn.dataset.videoType = type.value;
        domElements.videoTypeFilters.appendChild(btn);
    });
}
