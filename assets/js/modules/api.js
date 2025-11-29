import { state } from './state.js';

export async function fetchContent() {
    const [contentResponse, socialsResponse] = await Promise.all([
        fetch(state.DATA_URL),
        fetch(state.SOCIALS_URL)
    ]);

    if (!contentResponse.ok) throw new Error('Failed to load content data');

    const data = await contentResponse.json();
    state.socialsData = socialsResponse.ok ? await socialsResponse.json() : {};

    state.allVideos = [];
    state.allPlaylists = [];

    Object.keys(data).forEach(lang => {
        Object.keys(data[lang]).forEach(channelKey => {
            const channel = data[lang][channelKey];
            const channelName = channel.title;
            const channelColor = channel.color || '#71717a';

            // Process Videos
            channel.videos.forEach(video => {
                if (video.state === 'published') {
                    state.allVideos.push({
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

                        state.allPlaylists.push({
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
    state.allVideos.sort((a, b) => new Date(b.date) - new Date(a.date));
}
