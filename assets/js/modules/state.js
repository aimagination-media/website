export const state = {
    allVideos: [],
    allPlaylists: [],
    socialsData: {},
    fuse: null,
    currentLanguage: 'en',
    currentView: 'videos',
    currentVideoType: 'all', // 'all', 'long', 'shorts'
    DATA_URL: 'assets/data/content.json',
    SOCIALS_URL: 'assets/data/socials.json'
};

export const domElements = {
    videoGrid: document.getElementById('videoGrid'),
    seriesGrid: document.getElementById('seriesGrid'),
    searchInput: document.getElementById('searchInput'),
    channelFilters: document.getElementById('channelFilters'),
    seriesSection: document.getElementById('seriesSection'),
    latestSection: document.getElementById('latestSection'),
    socialsSection: document.getElementById('socialsSection'),
    socialsGrid: document.getElementById('socialsGrid'),
    languageSelect: document.getElementById('languageSelect'),
    filterBar: document.getElementById('filterBar'),
    videoTypeFilters: document.getElementById('videoTypeFilters'),
    featuredTitle: document.getElementById('featuredTitle'),
    latestTitle: document.getElementById('latestTitle'),
    socialsTitle: document.getElementById('socialsTitle'),
    videosBtnText: document.getElementById('videosBtnText'),
    socialsBtnText: document.getElementById('socialsBtnText'),
    langLabel: document.querySelector('#langBtn span'),
    langBtn: document.getElementById('langBtn'),
    langDropdown: document.getElementById('langDropdown'),
    langOptions: document.querySelectorAll('.lang-option'),
    toggleBtns: document.querySelectorAll('.toggle-btn')
};
