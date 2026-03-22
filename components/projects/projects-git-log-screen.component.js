import { buildSectionPage } from '../../utils/section-page.utils.js';
import './project-dashboard/project-git-log/project-git-log.component.js';
export class ProjectsGitLogScreen extends HTMLElement {
    initialized = false;
    connectedCallback() {
        if (this.initialized)
            return;
        this.initialized = true;
        const page = buildSectionPage(this, 'Git Activity', 'projects', '#/projects');
        const intro = document.createElement('p');
        intro.textContent = 'Recent commits stay collapsed by default. Expand a row to see author and full hash details.';
        page.content.appendChild(intro);
        const gitLog = document.createElement('project-git-log');
        gitLog.setAttribute('project-id', 'motivation');
        page.content.appendChild(gitLog);
    }
}
if (!customElements.get('projects-git-log-screen')) {
    customElements.define('projects-git-log-screen', ProjectsGitLogScreen);
}
