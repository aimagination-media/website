import { domElements } from './state.js';

let timelineContainer = null;
let activeYear = null;
let activeMonth = null;
let isScrolling = false;
let scrollTimeout = null;

export function updateTimeline(videos) {
    // 1. Create container if it doesn't exist
    if (!timelineContainer) {
        timelineContainer = document.createElement('div');
        timelineContainer.id = 'timeline-nav';
        document.body.appendChild(timelineContainer);
    }

    // If no videos, hide and return
    if (!videos || videos.length === 0) {
        timelineContainer.classList.remove('is-visible');
        return;
    }
    timelineContainer.classList.add('is-visible');

    // 2. Group videos by date (Year -> Month)
    const groups = groupVideosByDate(videos);

    // 3. Render timeline
    renderTimeline(groups);

    // 4. Setup scroll listener (idempotent)
    window.removeEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll, { passive: true });
}

function groupVideosByDate(videos) {
    const groups = {};

    videos.forEach(video => {
        if (!video.date || video.date === 'TBA') return;

        const date = new Date(video.date);
        if (isNaN(date.getTime())) return;

        const year = date.getFullYear();
        const month = date.toLocaleString('default', { month: 'short' });
        const monthIndex = date.getMonth(); // For sorting

        if (!groups[year]) {
            groups[year] = { months: {}, count: 0 };
        }

        if (!groups[year].months[month]) {
            groups[year].months[month] = {
                count: 0,
                index: monthIndex,
                firstVideoId: video.id // Store ID of first video in this month to scroll to
            };
        }

        groups[year].count++;
        groups[year].months[month].count++;
    });

    return groups;
}

function renderTimeline(groups) {
    timelineContainer.innerHTML = '';

    // Sort years descending
    const years = Object.keys(groups).sort((a, b) => b - a);

    years.forEach(year => {
        const yearGroup = groups[year];
        const yearEl = document.createElement('div');
        yearEl.className = 'timeline-year-group';

        // Year Label
        const yearLabel = document.createElement('div');
        yearLabel.className = 'timeline-year';
        yearLabel.textContent = year;
        yearLabel.dataset.year = year;
        yearEl.appendChild(yearLabel);

        // Months Container
        const monthsContainer = document.createElement('div');
        monthsContainer.className = 'timeline-months';

        // Sort months descending
        const months = Object.keys(yearGroup.months).sort((a, b) => yearGroup.months[b].index - yearGroup.months[a].index);

        months.forEach(month => {
            const monthData = yearGroup.months[month];
            const monthEl = document.createElement('div');
            monthEl.className = 'timeline-month';
            monthEl.dataset.year = year;
            monthEl.dataset.month = month;

            // Tooltip/Label
            const label = document.createElement('span');
            label.className = 'month-label';
            label.textContent = month;
            monthEl.appendChild(label);

            // Dot
            const dot = document.createElement('div');
            dot.className = 'month-dot';
            monthEl.appendChild(dot);

            // Click to scroll
            monthEl.addEventListener('click', (e) => {
                e.stopPropagation();
                scrollToMonth(year, month);
            });

            monthsContainer.appendChild(monthEl);
        });

        yearEl.appendChild(monthsContainer);
        timelineContainer.appendChild(yearEl);
    });
}

function scrollToMonth(year, month) {
    // Find the first video card with this date
    // We need to rely on the DOM elements having data attributes or similar
    // Since we didn't add data attributes yet, let's assume we will add data-date-year and data-date-month to cards

    const selector = `.video-card[data-year="${year}"][data-month="${month}"]`;
    const target = document.querySelector(selector);

    if (target) {
        isScrolling = true;
        const headerOffset = 100; // Adjust for sticky header
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });

        // Update active state manually
        updateActiveState(year, month);

        // Reset scrolling flag after animation
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 1000);
    }
}

function handleScroll() {
    if (isScrolling) return;

    // Debounce slightly? Or just run. requestAnimationFrame is better.
    requestAnimationFrame(() => {
        // Find which video is currently most visible or at the top
        const headerHeight = 100;
        const cards = document.querySelectorAll('.video-card');

        let currentCard = null;

        for (const card of cards) {
            const rect = card.getBoundingClientRect();
            if (rect.top >= headerHeight && rect.top < window.innerHeight / 2) {
                currentCard = card;
                break;
            }
        }

        // Fallback: if no card found in that range, maybe we are at the very top or bottom
        if (!currentCard && cards.length > 0) {
            // check if we are near top
            if (window.scrollY < 200) {
                currentCard = cards[0];
            }
        }

        if (currentCard) {
            const year = currentCard.dataset.year;
            const month = currentCard.dataset.month;
            if (year && month) {
                updateActiveState(year, month);
            }
        }
    });
}

function updateActiveState(year, month) {
    if (activeYear === year && activeMonth === month) return;

    activeYear = year;
    activeMonth = month;

    // Remove active classes
    document.querySelectorAll('.timeline-month.active').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.timeline-year.active').forEach(el => el.classList.remove('active'));

    // Add active classes
    const activeMonthEl = document.querySelector(`.timeline-month[data-year="${year}"][data-month="${month}"]`);
    if (activeMonthEl) activeMonthEl.classList.add('active');

    const activeYearEl = document.querySelector(`.timeline-year[data-year="${year}"]`);
    if (activeYearEl) activeYearEl.classList.add('active');
}
