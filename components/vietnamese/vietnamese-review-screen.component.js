import { buildSectionPage } from '../../utils/section-page.utils.js';
import './review-session/review-session.component.js';
export class VietnameseReviewScreen extends HTMLElement {
    initialized = false;
    reviewSession = null;
    connectedCallback() {
        if (this.initialized)
            return;
        this.initialized = true;
        const page = buildSectionPage(this, 'Learn', 'vietnamese', '#/vietnamese');
        this.reviewSession = document.createElement('review-session');
        page.content.appendChild(this.reviewSession);
    }
    disconnectedCallback() {
        this.reviewSession?.remove();
        this.reviewSession = null;
    }
}
customElements.define('vietnamese-review-screen', VietnameseReviewScreen);
