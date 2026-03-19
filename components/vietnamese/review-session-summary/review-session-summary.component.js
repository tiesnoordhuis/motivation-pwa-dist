import styles from './review-session-summary.css' with { type: 'css' };
const template = document.createElement('template');
template.innerHTML = `
    <div class="summary-view">
        <h2 id="summary-title">Session Complete</h2>
        <p id="empty-msg" hidden>There are no cards due for review right now.</p>
        
        <div class="stat-box" id="stat-box">
            <div class="stat">
                <span class="stat-value" id="val-reviewed">0</span>
                <span class="stat-label">Cards Reviewed</span>
            </div>
            <div class="stat">
                <span class="stat-value" id="val-average">0.0</span>
                <span class="stat-label">Average Rating</span>
            </div>
        </div>
        
        <a href="#/vietnamese" class="btn-return">Return to Dashboard</a>
    </div>
`;
export class ReviewSessionSummary extends HTMLElement {
    totalReviewed = 0;
    averageRating = 0;
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.adoptedStyleSheets = [styles];
        this.render();
    }
    static get observedAttributes() {
        return ['data-reviewed', 'data-average'];
    }
    attributeChangedCallback(name, _oldVal, newVal) {
        if (name === 'data-reviewed') {
            this.totalReviewed = parseInt(newVal ?? '0', 10);
            this.updateContent();
        }
        else if (name === 'data-average') {
            this.averageRating = parseFloat(newVal ?? '0');
            this.updateContent();
        }
    }
    render() {
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.updateContent();
    }
    updateContent() {
        if (!this.shadowRoot)
            return;
        const emptyMsg = this.shadowRoot.getElementById('empty-msg');
        const statBox = this.shadowRoot.getElementById('stat-box');
        const title = this.shadowRoot.getElementById('summary-title');
        if (this.totalReviewed === 0) {
            title.textContent = 'All Caught Up!';
            emptyMsg.hidden = false;
            statBox.hidden = true;
        }
        else {
            title.textContent = 'Session Complete';
            emptyMsg.hidden = true;
            statBox.hidden = false;
            this.shadowRoot.getElementById('val-reviewed').textContent = this.totalReviewed.toString();
            this.shadowRoot.getElementById('val-average').textContent = this.averageRating.toFixed(1);
        }
    }
}
customElements.define('review-session-summary', ReviewSessionSummary);
