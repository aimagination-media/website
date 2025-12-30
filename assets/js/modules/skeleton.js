/**
 * Skeleton loading screen generators
 */

export function createVideoSkeleton(count = 8) {
    const skeletons = [];

    for (let i = 0; i < count; i++) {
        const skeleton = `
            <div class="skeleton-card">
                <div class="skeleton-thumbnail"></div>
                <div class="skeleton-content">
                    <div class="skeleton-meta">
                        <div class="skeleton-tag"></div>
                        <div class="skeleton-date"></div>
                    </div>
                    <div class="skeleton-title"></div>
                    <div class="skeleton-title-short"></div>
                </div>
            </div>
        `;
        skeletons.push(skeleton);
    }

    return `<div class="skeleton-wrapper"><div class="skeleton-grid">${skeletons.join('')}</div></div>`;
}

export function createPlaylistSkeleton(count = 6) {
    const skeletons = [];

    for (let i = 0; i < count; i++) {
        const skeleton = `
            <div class="skeleton-playlist">
                <div class="skeleton-playlist-thumbnail"></div>
                <div class="skeleton-playlist-content">
                    <div class="skeleton-tag"></div>
                    <div class="skeleton-title"></div>
                    <div class="skeleton-playlist-count"></div>
                </div>
            </div>
        `;
        skeletons.push(skeleton);
    }

    return `<div class="skeleton-wrapper"><div class="bento-grid">${skeletons.join('')}</div></div>`;
}

export function showVideoSkeleton(container, count = 8) {
    container.innerHTML = createVideoSkeleton(count);
}

export function showPlaylistSkeleton(container, count = 6) {
    container.innerHTML = createPlaylistSkeleton(count);
}
