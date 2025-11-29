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
