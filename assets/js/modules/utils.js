export function detectLanguage() {
    const storedLang = localStorage.getItem('preferredLanguage');
    if (storedLang) return storedLang;

    const browserLang = navigator.language.slice(0, 2);
    if (['es', 'de'].includes(browserLang)) return browserLang;

    return 'en';
}

export function getPlaylistTitle(playlistId, allPlaylists) {
    if (!playlistId) return null;
    const playlist = allPlaylists.find(p => p.id === playlistId);
    return playlist ? playlist.title : null;
}

/**
 * Map channel dev ID to display name from socials.json
 * Channel mapping:
 * - 'book' -> Maps to YouTube channels in socials.json with channel_dev_id: "Stories"
 * - 'gallery' -> Maps to YouTube channel with channel_dev_id: "ai_gallery"
 * - Other channels fall back to title from content.json
 */
export function getChannelDisplayName(channelId, currentLang, socialsData) {
    console.log('getChannelDisplayName called:', { channelId, currentLang, hasSocialsData: !!socialsData, hasYoutube: !!(socialsData && socialsData.youtube) });
    if (!socialsData || !socialsData.youtube) return channelId.toUpperCase();

    // Map dev channel IDs to channel_dev_id in socials
    const channelMapping = {
        'book': 'Stories',
        'audiobook': 'Stories',
        'gallery': 'ai_gallery'
    };

    // Map language codes to full language names used in socials.json
    const langMapping = {
        'en': 'English',
        'es': 'Spanish',
        'de': 'German'
    };

    const mappedDevId = channelMapping[channelId];
    if (!mappedDevId) return channelId.toUpperCase();

    const targetLanguage = langMapping[currentLang] || 'English';

    // Find matching YouTube channel
    const channel = socialsData.youtube.items.find(item =>
        item.channel_dev_id === mappedDevId &&
        (item.language === targetLanguage || !item.multi_lang_channel || item.multi_lang_channel === "false")
    );

    if (channel) {
        const handle = channel.handle;
        return typeof handle === 'object' ? (handle[currentLang] || handle.en) : handle;
    }

    return channelId.toUpperCase();
}

/**
 * Get channel URL from socials.json
 */
export function getChannelUrl(channelId, currentLang, socialsData) {
    if (!socialsData || !socialsData.youtube) return null;

    const channelMapping = {
        'book': 'Stories',
        'audiobook': 'Stories',
        'gallery': 'ai_gallery'
    };

    const langMapping = {
        'en': 'English',
        'es': 'Spanish',
        'de': 'German'
    };

    const mappedDevId = channelMapping[channelId];
    if (!mappedDevId) return null;

    const targetLanguage = langMapping[currentLang] || 'English';

    const channel = socialsData.youtube.items.find(item =>
        item.channel_dev_id === mappedDevId &&
        (item.language === targetLanguage || !item.multi_lang_channel || item.multi_lang_channel === "false")
    );

    return channel ? channel.url : null;
}
