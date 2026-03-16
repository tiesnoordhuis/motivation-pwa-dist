import { SectionCard } from '../section-card.component.js';
export class ProjectsSectionCard extends SectionCard {
    connectedCallback() {
        this.setAttribute('title', 'Projects');
        this.setAttribute('color', 'blue');
        this.setAttribute('route', '#/projects');
        super.connectedCallback();
    }
}
customElements.define('projects-section-card', ProjectsSectionCard);
