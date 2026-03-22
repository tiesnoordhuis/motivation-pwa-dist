import { buildSectionPage } from '../../utils/section-page.utils.js';
import './project-dashboard/project-story-list/project-story-list.component.js';
export class ProjectsStoriesScreen extends HTMLElement {
    initialized = false;
    connectedCallback() {
        if (this.initialized)
            return;
        this.initialized = true;
        const page = buildSectionPage(this, 'Stories', 'projects', '#/projects');
        const intro = document.createElement('p');
        intro.textContent = 'Tap a story to reveal its summary and metadata while keeping the list compact on mobile.';
        page.content.appendChild(intro);
        const stories = document.createElement('project-story-list');
        stories.setAttribute('project-id', 'motivation');
        page.content.appendChild(stories);
    }
}
if (!customElements.get('projects-stories-screen')) {
    customElements.define('projects-stories-screen', ProjectsStoriesScreen);
}
