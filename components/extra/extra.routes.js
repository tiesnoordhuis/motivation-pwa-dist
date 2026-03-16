import { buildSectionPage } from '../../utils/section-page.utils.js';
export function extraRoutes() {
    return {
        '#/extra': {
            view: '#extra-view',
            init: () => {
                const container = document.getElementById('extra-view');
                const page = buildSectionPage(container, 'Extra', 'extra', '#/extra');
                const nav = document.createElement('nav');
                nav.className = 'extra-nav';
                const links = [
                    { href: '#/goals', label: 'Goals' },
                    { href: '#/agenda', label: 'Calendar' },
                ];
                for (const { href, label } of links) {
                    const a = document.createElement('a');
                    a.href = href;
                    a.className = 'extra-nav-link';
                    a.textContent = label;
                    nav.appendChild(a);
                }
                page.content.appendChild(nav);
            },
        },
    };
}
