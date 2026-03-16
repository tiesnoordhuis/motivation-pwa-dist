import { SectionCard } from '../section-card.component.js';
export class SocialSectionCard extends SectionCard {
    connectedCallback() {
        this.setAttribute('title', 'Social');
        this.setAttribute('color', 'green');
        this.setAttribute('route', '#/social');
        super.connectedCallback();
    }
}
customElements.define('social-section-card', SocialSectionCard);
