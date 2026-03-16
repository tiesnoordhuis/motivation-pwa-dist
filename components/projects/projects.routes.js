import { buildSectionPage } from '../../utils/section-page.utils.js';
export function projectsRoutes() {
    return {
        '#/projects': {
            view: '#projects-view',
            init: () => {
                const container = document.getElementById('projects-view');
                const page = buildSectionPage(container, 'Projects', 'projects', '#/projects');
                const p = document.createElement('p');
                p.textContent = 'Coming soon — scrumboard, git activity, server control.';
                page.content.appendChild(p);
            },
        },
    };
}
