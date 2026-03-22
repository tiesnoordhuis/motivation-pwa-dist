import './projects-dashboard-screen.component.js';
import './projects-scrumboard-screen.component.js';
import './projects-stories-screen.component.js';
import './projects-git-log-screen.component.js';
export function projectsRoutes() {
    return {
        '#/projects': {
            render: () => document.createElement('projects-dashboard-screen'),
        },
        '#/projects/scrumboard': {
            parent: '#/projects',
            render: () => document.createElement('projects-scrumboard-screen'),
        },
        '#/projects/stories': {
            parent: '#/projects',
            render: () => document.createElement('projects-stories-screen'),
        },
        '#/projects/git-log': {
            parent: '#/projects',
            render: () => document.createElement('projects-git-log-screen'),
        },
    };
}
