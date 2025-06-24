// Channels page JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    initChannelsPage();
});

function initChannelsPage() {
    setupLanguageSelector();
    loadChannelStats();
    setupChannelNavigation();
    loadRecentVideos();
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
    selector.addEventListener('change', function() {
        const newLang = this.value;
        const currentPath = window.location.pathname;
        
        // Replace language in path
        let newPath;
        if (currentPath.includes('/en/') || currentPath.includes('/es/') || currentPath.includes('/de/')) {
            newPath = currentPath.replace(/\/(en|es|de)\//, `/${newLang}/`);
        } else {
            newPath = `/${newLang}/`;
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

function loadChannelStats() {
    const channelCards = document.querySelectorAll('.channel-card');
    
    channelCards.forEach(card => {
        const channel = card.dataset.channel;
        const videoCountElement = card.querySelector('.video-count');
        const lastUpdatedElement = card.querySelector('.last-updated');
        
        // Simulate loading channel statistics
        // In a real implementation, this would fetch from your backend/API
        setTimeout(() => {
            const stats = getChannelStats(channel);
            videoCountElement.textContent = `${stats.videoCount} videos`;
            lastUpdatedElement.textContent = `Updated ${stats.lastUpdated}`;
        }, Math.random() * 1000 + 500);
    });
}

function getChannelStats(channel) {
    // Mock data - replace with actual API calls
    const mockStats = {
        math: {
            videoCount: 45,
            lastUpdated: '2 days ago',
            subscriberCount: '12.5K'
        },
        chemistry: {
            videoCount: 32,
            lastUpdated: '1 week ago',
            subscriberCount: '8.3K'
        },
        audiobook: {
            videoCount: 28,
            lastUpdated: '3 days ago',
            subscriberCount: '15.2K'
        }
    };
    
    return mockStats[channel] || {
        videoCount: 0,
        lastUpdated: 'Unknown',
        subscriberCount: '0'
    };
}

function setupChannelNavigation() {
    const channelCards = document.querySelectorAll('.channel-card');
    
    channelCards.forEach(card => {
        // Add click tracking
        const viewVideosBtn = card.querySelector('.btn-primary');
        const youtubeBtn = card.querySelector('.btn-secondary');
        
        if (viewVideosBtn) {
            viewVideosBtn.addEventListener('click', function(e) {
                const channel = card.dataset.channel;
                if (window.AImagination && window.AImagination.trackEvent) {
                    window.AImagination.trackEvent('Channel Navigation', 'View Videos', channel);
                }
            });
        }
        
        if (youtubeBtn) {
            youtubeBtn.addEventListener('click', function(e) {
                const channel = card.dataset.channel;
                if (window.AImagination && window.AImagination.trackEvent) {
                    window.AImagination.trackEvent('Channel Navigation', 'YouTube Channel', channel);
                }
                
                // Update href with actual YouTube channel URL
                const youtubeUrls = getYouTubeChannelUrls();
                const currentLang = getCurrentLanguageFromPath();
                const channelKey = `${channel}_${currentLang}`;
                
                if (youtubeUrls[channelKey]) {
                    this.href = youtubeUrls[channelKey];
                }
            });
        }
    });
}

function getYouTubeChannelUrls() {
    // Replace with actual YouTube channel URLs
    return {
        'math_en': 'https://www.youtube.com/@aimagination-math-en',
        'math_es': 'https://www.youtube.com/@aimagination-math-es',
        'math_de': 'https://www.youtube.com/@aimagination-math-de',
        'chemistry_en': 'https://www.youtube.com/@aimagination-chemistry-en',
        'chemistry_es': 'https://www.youtube.com/@aimagination-chemistry-es',
        'chemistry_de': 'https://www.youtube.com/@aimagination-chemistry-de',
        'audiobook_en': 'https://www.youtube.com/@aimagination-audiobook-en',
        'audiobook_es': 'https://www.youtube.com/@aimagination-audiobook-es',
        'audiobook_de': 'https://www.youtube.com/@aimagination-audiobook-de'
    };
}

function loadRecentVideos() {
    const recentVideosContainer = document.getElementById('recentVideos');
    if (!recentVideosContainer) return;
    
    const currentLang = getCurrentLanguageFromPath();
    
    // Simulate loading recent videos
    setTimeout(() => {
        const mockVideos = getMockRecentVideos(currentLang);
        renderRecentVideos(mockVideos, recentVideosContainer);
    }, 1500);
}

function getMockRecentVideos(language) {
    // Mock video data - replace with actual API calls
    const videos = {
        en: [
            {
                title: 'Introduction to Calculus Derivatives',
                channel: 'math',
                thumbnail: 'https://img.youtube.com/vi/placeholder1/maxresdefault.jpg',
                duration: '12:34',
                publishedAt: '2 days ago',
                viewCount: '1.2K views'
            },
            {
                title: 'Chemical Bonding Explained',
                channel: 'chemistry',
                thumbnail: 'https://img.youtube.com/vi/placeholder2/maxresdefault.jpg',
                duration: '15:42',
                publishedAt: '1 week ago',
                viewCount: '3.5K views'
            },
            {
                title: 'The Great Gatsby - Chapter 1',
                channel: 'audiobook',
                thumbnail: 'https://img.youtube.com/vi/placeholder3/maxresdefault.jpg',
                duration: '28:15',
                publishedAt: '3 days ago',
                viewCount: '892 views'
            }
        ],
        es: [
            {
                title: 'Introducción a las Derivadas del Cálculo',
                channel: 'math',
                thumbnail: 'https://img.youtube.com/vi/placeholder1/maxresdefault.jpg',
                duration: '12:34',
                publishedAt: 'hace 2 días',
                viewCount: '1.2K visualizaciones'
            },
            {
                title: 'Enlaces Químicos Explicados',
                channel: 'chemistry',
                thumbnail: 'https://img.youtube.com/vi/placeholder2/maxresdefault.jpg',
                duration: '15:42',
                publishedAt: 'hace 1 semana',
                viewCount: '3.5K visualizaciones'
            },
            {
                title: 'El Gran Gatsby - Capítulo 1',
                channel: 'audiobook',
                thumbnail: 'https://img.youtube.com/vi/placeholder3/maxresdefault.jpg',
                duration: '28:15',
                publishedAt: 'hace 3 días',
                viewCount: '892 visualizaciones'
            }
        ],
        de: [
            {
                title: 'Einführung in Calculus-Ableitungen',
                channel: 'math',
                thumbnail: 'https://img.youtube.com/vi/placeholder1/maxresdefault.jpg',
                duration: '12:34',
                publishedAt: 'vor 2 Tagen',
                viewCount: '1.2K Aufrufe'
            },
            {
                title: 'Chemische Bindungen erklärt',
                channel: 'chemistry',
                thumbnail: 'https://img.youtube.com/vi/placeholder2/maxresdefault.jpg',
                duration: '15:42',
                publishedAt: 'vor 1 Woche',
                viewCount: '3.5K Aufrufe'
            },
            {
                title: 'Der große Gatsby - Kapitel 1',
                channel: 'audiobook',
                thumbnail: 'https://img.youtube.com/vi/placeholder3/maxresdefault.jpg',
                duration: '28:15',
                publishedAt: 'vor 3 Tagen',
                viewCount: '892 Aufrufe'
            }
        ]
    };
    
    return videos[language] || videos.en;
}

function renderRecentVideos(videos, container) {
    container.innerHTML = '';
    
    videos.forEach(video => {
        const videoElement = createVideoElement(video);
        container.appendChild(videoElement);
    });
}

function createVideoElement(video) {
    const videoDiv = document.createElement('div');
    videoDiv.className = 'video-card';
    
    const channelEmojis = {
        math: '📐',
        chemistry: '🧪',
        audiobook: '📚'
    };
    
    videoDiv.innerHTML = `
        <div class="video-thumbnail">
            <img src="${video.thumbnail}" alt="${video.title}" loading="lazy" 
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik0xNDQgNzJMMTc2IDkwTDE0NCAxMDhWNzJaIiBmaWxsPSIjQ0NDIi8+Cjwvc3ZnPgo='">
            <div class="video-duration">${video.duration}</div>
            <div class="channel-badge">${channelEmojis[video.channel] || '📺'}</div>
        </div>
        <div class="video-info">
            <h4 class="video-title">${video.title}</h4>
            <div class="video-meta">
                <span class="video-views">${video.viewCount}</span>
                <span class="video-date">${video.publishedAt}</span>
            </div>
        </div>
    `;
    
    // Add click handler
    videoDiv.addEventListener('click', function() {
        if (window.AImagination && window.AImagination.trackEvent) {
            window.AImagination.trackEvent('Video', 'Click', video.title);
        }
        // In a real implementation, this would navigate to the video page
        console.log('Navigate to video:', video.title);
    });
    
    return videoDiv;
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