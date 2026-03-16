import { buildSectionPage } from '../../utils/section-page.utils.js';
export function vietnameseRoutes() {
    return {
        '#/vietnamese': {
            view: '#vietnamese-view',
            init: () => {
                const container = document.getElementById('vietnamese-view');
                const page = buildSectionPage(container, 'Learn', 'vietnamese', '#/vietnamese');
                const p = document.createElement('p');
                p.textContent = 'Coming soon — spaced repetition, progress tracking.';
                page.content.appendChild(p);
            },
        },
    };
}
