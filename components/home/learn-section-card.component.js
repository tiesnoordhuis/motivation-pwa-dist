import { SectionCard } from './section-card.component.js';
export class LearnSectionCard extends SectionCard {
    connectedCallback() {
        this.setAttribute('title', 'Learn');
        this.setAttribute('color', 'red');
        this.setAttribute('route', '#/vietnamese');
        super.connectedCallback();
    }
}
customElements.define('learn-section-card', LearnSectionCard);
