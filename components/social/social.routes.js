import { buildSectionPage } from '../../utils/section-page.utils.js';
export function socialRoutes() {
    return {
        '#/social': {
            view: '#social-view',
            init: () => {
                const container = document.getElementById('social-view');
                const page = buildSectionPage(container, 'Social', 'social', '#/social');
                const p = document.createElement('p');
                p.textContent = 'Coming soon — people tracking, interaction cadence, suggestions.';
                page.content.appendChild(p);
            },
        },
    };
}
