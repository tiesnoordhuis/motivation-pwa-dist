import { SectionCard } from '../section-card.component.js';
export class HealthSectionCard extends SectionCard {
    connectedCallback() {
        this.setAttribute('title', 'Health');
        this.setAttribute('color', 'yellow');
        this.setAttribute('route', '#/health');
        super.connectedCallback();
    }
}
customElements.define('health-section-card', HealthSectionCard);
