import { domElements } from './state.js';

let timelineContainer = null;
let activeYear = null;
let activeMonth = null;
let revealForMonth = () => {};

export function setMonthReveal(fn) {
    revealForMonth = fn;
}

export function updateTimeline(videos) {
    // 1. Create container if it doesn't exist
    if (!timelineContainer) {
        timelineContainer = document.createElement('div');
        timelineContainer.id = 'timeline-nav';
        document.body.appendChild(timelineContainer);
    }

    const show = Boolean(videos && videos.length);
    timelineContainer.classList.toggle('is-visible', show);
    document.body.classList.toggle('has-timeline', show);
    if (!show) return;

    // 2. Group videos by date (Year -> Month)
    const groups = groupVideosByDate(videos);

    renderTimeline(groups);
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
    revealForMonth(year, month);
    const selector = `.grid-header[data-year="${year}"][data-month="${month}"]`;
    const target = document.querySelector(selector);
    if (!target) return;

    const headerOffset = 100;
    const offsetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    updateActiveState(year, month);
}

export function updateActiveState(year, month) {
    const alreadyMarked = document.querySelector(`.timeline-month.active[data-year="${year}"][data-month="${month}"]`);
    if (activeYear === year && activeMonth === month && alreadyMarked) return;

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
