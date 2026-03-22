import { buildSectionPage } from '../../utils/section-page.utils.js';
import './project-dashboard/project-dashboard.component.js';
export class ProjectsDashboardScreen extends HTMLElement {
    initialized = false;
    connectedCallback() {
        if (!this.initialized) {
            this.initialized = true;
            const page = buildSectionPage(this, 'Projects', 'projects', '#/projects');
            const dashboard = document.createElement('project-dashboard');
            dashboard.setAttribute('project-id', 'motivation');
            page.content.appendChild(dashboard);
        }
    }
}
if (!customElements.get('projects-dashboard-screen')) {
    customElements.define('projects-dashboard-screen', ProjectsDashboardScreen);
}
