import { buildSectionPage } from '../../utils/section-page.utils.js';
import './project-dashboard/project-scrumboard/project-scrumboard.component.js';
export class ProjectsScrumboardScreen extends HTMLElement {
    initialized = false;
    connectedCallback() {
        if (this.initialized)
            return;
        this.initialized = true;
        const page = buildSectionPage(this, 'Scrumboard', 'projects', '#/projects');
        const intro = document.createElement('p');
        intro.textContent = 'Expand lanes and story cards to inspect the current sprint and backlog without leaving the project section.';
        page.content.appendChild(intro);
        const scrumboard = document.createElement('project-scrumboard');
        scrumboard.setAttribute('project-id', 'motivation');
        page.content.appendChild(scrumboard);
    }
}
if (!customElements.get('projects-scrumboard-screen')) {
    customElements.define('projects-scrumboard-screen', ProjectsScrumboardScreen);
}
