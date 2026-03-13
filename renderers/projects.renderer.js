import { buildSectionPage } from './section-page.utils.js';
let instance = null;
export function projectsRoutes() {
    return {
        '#/projects': {
            view: '#projects-view',
            init: () => { instance = new ProjectsRenderer(); },
        },
    };
}
export class ProjectsRenderer {
    page;
    constructor() {
        const container = document.getElementById('projects-view');
        this.page = buildSectionPage(container, 'Projects', 'projects', '#/projects');
        const placeholder = document.createElement('p');
        placeholder.textContent = 'Coming soon — scrumboard, git activity, server control.';
        this.page.content.appendChild(placeholder);
    }
    async init() { }
}
